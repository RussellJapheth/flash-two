import type {
	AppBackup,
	WordProgress,
	SyncStatus,
	CustomDeck,
	SavedWord,
	UserXPData
} from '$lib/types';
import {
	getAllProgress,
	getAllCustomDecks,
	getAllSavedWords,
	saveBulkProgress,
	saveCustomDeck,
	saveBulkSavedWords,
	getSavedUsername,
	getSavedLanguage,
	isLeaderboardDisabled,
	setLeaderboardDisabled
} from './storage';
import { getLocalUserXPData, saveLocalUserXPData, syncXPLeaderboard } from './xp';
import { syncPendingGameScores } from './gameStorage';

const API_BASE = 'https://json-drive.thespot.workers.dev/api/flashcards';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastPullTime = 0;
let currentSyncStatus: SyncStatus = 'idle';
const listeners = new Set<(status: SyncStatus) => void>();

export function subscribeSyncStatus(fn: (status: SyncStatus) => void): () => void {
	listeners.add(fn);
	fn(currentSyncStatus);
	return () => listeners.delete(fn);
}

function updateStatus(status: SyncStatus) {
	currentSyncStatus = status;
	listeners.forEach((fn) => fn(status));
}

export function getSyncStatus(): SyncStatus {
	return currentSyncStatus;
}

export interface RemoteUserSummary {
	exists: boolean;
	totalXP?: number;
	reviewCount?: number;
	deckCount?: number;
}

export async function checkRemoteUser(username: string): Promise<RemoteUserSummary> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined')
		return { exists: false };
	if (typeof navigator !== 'undefined' && navigator.onLine === false) return { exists: false };

	try {
		const cleanUser = username.trim().toLowerCase();
		const response = await fetch(`${API_BASE}/users/${encodeURIComponent(cleanUser)}`, {
			headers: { Accept: 'application/json' }
		});

		if (response.status === 404 || !response.ok) {
			return { exists: false };
		}

		const remoteData: AppBackup = await response.json();
		const reviewCount =
			remoteData.progress && typeof remoteData.progress === 'object'
				? Object.keys(remoteData.progress).length
				: 0;
		const totalXP = remoteData.xpData?.totalXP || 0;
		const deckCount = Array.isArray(remoteData.customDecks) ? remoteData.customDecks.length : 0;

		const hasExistingData = totalXP > 0 || reviewCount > 0 || deckCount > 0;

		return {
			exists: hasExistingData,
			totalXP,
			reviewCount,
			deckCount
		};
	} catch (err) {
		console.error('Check remote user error:', err);
		return { exists: false };
	}
}

// Deep bidirectional merge remote data into local state
export async function pullAndMerge(username: string): Promise<boolean> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	if (typeof navigator !== 'undefined' && navigator.onLine === false) {
		updateStatus('idle');
		return false;
	}

	updateStatus('syncing');
	lastPullTime = Date.now();

	try {
		const cleanUser = username.trim().toLowerCase();
		const response = await fetch(`${API_BASE}/users/${cleanUser}`, {
			headers: { Accept: 'application/json' }
		});

		if (response.status === 404) {
			// User record does not exist on cloud yet, push local
			await pushData(cleanUser);
			updateStatus('ok');
			return true;
		}

		if (!response.ok) {
			updateStatus('error');
			return false;
		}

		const remoteData: AppBackup = await response.json();
		let localHadNewData = false;

		// 1. Merge Progress (Word-by-Word deterministic Last-Reviewed-Wins)
		const localProgress = await getAllProgress();
		const mergedProgress: Record<string, WordProgress> = { ...localProgress };

		if (remoteData.progress && typeof remoteData.progress === 'object') {
			for (const [key, remoteProg] of Object.entries(remoteData.progress)) {
				if (!remoteProg || typeof remoteProg !== 'object') continue;
				const localProg = localProgress[key];

				if (!localProg) {
					// Word only exists on remote
					mergedProgress[key] = remoteProg;
				} else {
					const localLast = localProg.lastReviewed || 0;
					const remoteLast = remoteProg.lastReviewed || 0;

					if (localLast > remoteLast) {
						// Local review is strictly newer -> keep local SRS state, flag remote needs update
						mergedProgress[key] = localProg;
						localHadNewData = true;
					} else if (remoteLast > localLast) {
						// Remote review is strictly newer -> adopt remote SRS state
						mergedProgress[key] = remoteProg;
					} else {
						// Same timestamp: tie-break by highest reps/progress, non-destructive fallback
						const remoteReps = remoteProg.reps || 0;
						const localReps = localProg.reps || 0;
						if (localReps > remoteReps) {
							mergedProgress[key] = localProg;
							localHadNewData = true;
						} else {
							mergedProgress[key] = remoteProg;
						}
					}
				}
			}

			// Local words not present on remote -> preserve and sync back
			for (const localKey of Object.keys(localProgress)) {
				if (!remoteData.progress[localKey]) {
					localHadNewData = true;
				}
			}

			await saveBulkProgress(mergedProgress);
		}

		// 2. Merge Custom Decks
		const localDecks = await getAllCustomDecks();
		const localDeckMap = new Map<string, CustomDeck>(localDecks.map((d) => [d.id, d]));

		if (Array.isArray(remoteData.customDecks)) {
			for (const remoteDeck of remoteData.customDecks) {
				const localDeck = localDeckMap.get(remoteDeck.id);
				if (!localDeck) {
					await saveCustomDeck(remoteDeck);
				} else {
					// Keep newer version if remote has more words or is newer
					const remoteCreated = remoteDeck.createdAt || 0;
					const localCreated = localDeck.createdAt || 0;
					if (remoteCreated > localCreated || remoteDeck.words.length > localDeck.words.length) {
						await saveCustomDeck(remoteDeck);
					} else if (
						localCreated > remoteCreated ||
						localDeck.words.length > remoteDeck.words.length
					) {
						localHadNewData = true;
					}
				}
			}
		}

		for (const localDeck of localDecks) {
			if (!remoteData.customDecks?.some((d) => d.id === localDeck.id)) {
				localHadNewData = true;
			}
		}

		// 3. Merge Saved / Bookmarked Words
		const localSaved = await getAllSavedWords();
		const localSavedMap = new Map<string, SavedWord>(
			localSaved.map((s) => [`${s.weekId}:${s.wordNo}`, s])
		);
		const wordsToSave: SavedWord[] = [];

		if (Array.isArray(remoteData.savedWords)) {
			for (const remoteWord of remoteData.savedWords) {
				const key = `${remoteWord.weekId}:${remoteWord.wordNo}`;
				const localWord = localSavedMap.get(key);
				if (!localWord) {
					wordsToSave.push(remoteWord);
				}
			}
		}

		if (wordsToSave.length > 0) {
			await saveBulkSavedWords(wordsToSave);
		}

		if (Array.isArray(remoteData.savedWords)) {
			const remoteKeys = new Set(remoteData.savedWords.map((s) => `${s.weekId}:${s.wordNo}`));
			for (const [key] of localSavedMap) {
				if (!remoteKeys.has(key)) {
					localHadNewData = true;
				}
			}
		}

		// 4. Merge XP Data
		const localXP = getLocalUserXPData();
		if (remoteData.xpData && typeof remoteData.xpData === 'object') {
			const remoteXP = remoteData.xpData;
			const mergedDaily: Record<string, number> = { ...(localXP.dailyXP || {}) };

			if (remoteXP.dailyXP && typeof remoteXP.dailyXP === 'object') {
				for (const [dateKey, xpVal] of Object.entries(remoteXP.dailyXP)) {
					if (typeof xpVal === 'number') {
						mergedDaily[dateKey] = Math.max(mergedDaily[dateKey] || 0, xpVal);
					}
				}
			}

			const mergedTotal = Math.max(localXP.totalXP || 0, remoteXP.totalXP || 0);
			const mergedXP: UserXPData = {
				totalXP: mergedTotal,
				dailyXP: mergedDaily,
				lastUpdated: Math.max(localXP.lastUpdated || 0, remoteXP.lastUpdated || 0),
				migratedFromProgress: true
			};

			saveLocalUserXPData(mergedXP);

			if (localXP.totalXP > (remoteXP.totalXP || 0)) {
				localHadNewData = true;
			}
		} else if (localXP.totalXP > 0) {
			localHadNewData = true;
		}

		// 5. Merge Leaderboard Privacy Setting
		if (typeof remoteData.leaderboardDisabled === 'boolean') {
			setLeaderboardDisabled(remoteData.leaderboardDisabled);
		}

		updateStatus('ok');

		// Sync XP and Game leaderboards in the background
		syncXPLeaderboard().catch((e) => console.warn('XP leaderboard sync error:', e));
		syncPendingGameScores().catch((e) => console.warn('Game leaderboard sync error:', e));

		// 6. Two-way convergence: if local had newer/additional data, push merged state to remote
		if (localHadNewData) {
			scheduleDebouncedSync(1000);
		}

		return true;
	} catch (err) {
		console.error('Cloud pull/merge error:', err);
		updateStatus('error');
		return false;
	}
}

// Push local data payload to JSON Drive
export async function pushData(username?: string): Promise<boolean> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	const user = username || getSavedUsername();
	if (!user) return false;

	if (typeof navigator !== 'undefined' && navigator.onLine === false) {
		updateStatus('pending');
		return false;
	}

	updateStatus('syncing');

	try {
		const progress = await getAllProgress();
		const customDecks = await getAllCustomDecks();
		const savedWords = await getAllSavedWords();
		const language = getSavedLanguage();
		const xpData = getLocalUserXPData();
		const leaderboardDisabled = isLeaderboardDisabled();

		const payload: AppBackup = {
			version: 1,
			exportedAt: Date.now(),
			progress,
			customDecks,
			savedWords,
			language,
			username: user,
			xpData,
			leaderboardDisabled
		};

		const res = await fetch(`${API_BASE}/users/${encodeURIComponent(user)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			updateStatus('error');
			return false;
		}

		// Also update global XP leaderboard
		syncXPLeaderboard().catch((e) => console.warn('XP leaderboard sync error during push:', e));

		// Also ensure username is in the users list
		try {
			const usersRes = await fetch(`${API_BASE}/users`);
			let currentUsers: string[] = [];
			if (usersRes.ok) {
				currentUsers = await usersRes.json();
			}
			if (!Array.isArray(currentUsers)) currentUsers = [];
			if (!currentUsers.includes(user)) {
				currentUsers.push(user);
				await fetch(`${API_BASE}/users`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentUsers)
				});
			}
		} catch {
			// Non-blocking users list update
		}

		updateStatus('ok');
		return true;
	} catch (err) {
		console.error('Push data error:', err);
		updateStatus('error');
		return false;
	}
}

// Trigger debounced cloud synchronization (e.g. after card answers or deck edits)
export function scheduleDebouncedSync(delayMs = 4000) {
	updateStatus('pending');
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		pushData();
	}, delayMs);
}

// Auto sync when app gains focus or reconnects (throttled to once per 10s)
function triggerAutoPull() {
	if (typeof window === 'undefined') return;
	const user = getSavedUsername();
	if (!user) return;
	if (Date.now() - lastPullTime > 10000) {
		pullAndMerge(user);
	}
}

// Handle online reconnection and visibility change
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		if (currentSyncStatus === 'pending' || currentSyncStatus === 'error') {
			pushData();
		} else {
			triggerAutoPull();
		}
	});

	window.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') {
			triggerAutoPull();
		}
	});

	window.addEventListener('focus', () => {
		triggerAutoPull();
	});
}
