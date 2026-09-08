import type { AppBackup, WordProgress, SyncStatus, CustomDeck, SavedWord } from '$lib/types';
import {
	getAllProgress,
	getAllCustomDecks,
	getAllSavedWords,
	saveBulkProgress,
	saveCustomDeck,
	saveBulkSavedWords,
	getSavedUsername,
	getSavedLanguage
} from './storage';

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

// Deep bidirectional merge remote data into local state
export async function pullAndMerge(username: string): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	if (!navigator.onLine) {
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

		updateStatus('ok');

		// 4. Two-way convergence: if local had newer/additional data, push merged state to remote
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
	if (typeof window === 'undefined') return false;
	const user = username || getSavedUsername();
	if (!user) return false;

	if (!navigator.onLine) {
		updateStatus('pending');
		return false;
	}

	updateStatus('syncing');

	try {
		const progress = await getAllProgress();
		const customDecks = await getAllCustomDecks();
		const savedWords = await getAllSavedWords();
		const language = getSavedLanguage();

		const payload: AppBackup = {
			version: 1,
			exportedAt: Date.now(),
			progress,
			customDecks,
			savedWords,
			language,
			username: user
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
