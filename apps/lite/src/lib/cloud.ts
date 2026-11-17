/**
 * Cloud sync layer for FlashCards Lite.
 */
import type { AppBackup, CustomDeck, SyncStatus, WordProgress, WordRecord } from '@flash/shared';
import { MY_WORDS_DECK_ID, MY_WORDS_DECK_NAME } from '@flash/shared';
import {
	getMyWordsDeck,
	saveMyWordsDeck,
	getAllProgress,
	saveBulkProgress,
	getSavedUsername,
	setSavedUsername,
	isValidUsername,
	registerDataMutationListener
} from './storage';
import { API_BASE_URL } from './apiBase';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastPullTime = 0;
let currentSyncStatus: SyncStatus = 'idle';
const statusListeners = new Set<(status: SyncStatus) => void>();

export function getSyncStatus(): SyncStatus {
	return currentSyncStatus;
}

export function subscribeSyncStatus(fn: (status: SyncStatus) => void): () => void {
	statusListeners.add(fn);
	fn(currentSyncStatus);
	return () => statusListeners.delete(fn);
}

function updateStatus(status: SyncStatus) {
	currentSyncStatus = status;
	statusListeners.forEach((fn) => {
		try {
			fn(status);
		} catch (err) {
			console.error('Error in sync status listener:', err);
		}
	});
}

export interface RemoteUserSummary {
	exists: boolean;
	wordCount?: number;
	lastModified?: number;
}

export async function checkRemoteUser(username: string): Promise<RemoteUserSummary> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return { exists: false };
	}
	const clean = username.trim().toLowerCase();
	if (!isValidUsername(clean)) return { exists: false };
	if (typeof navigator !== 'undefined' && navigator.onLine === false) {
		return { exists: false };
	}

	try {
		const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(clean)}`, {
			headers: { Accept: 'application/json' }
		});
		if (res.status === 404 || !res.ok) {
			return { exists: false };
		}
		const data: AppBackup = await res.json();
		const deck = data.customDecks?.find((d) => d.id === MY_WORDS_DECK_ID) || data.customDecks?.[0];
		return {
			exists: true,
			wordCount: deck?.words?.length ?? 0,
			lastModified: data.exportedAt || data.timestamp
		};
	} catch (err) {
		console.warn('Error checking remote user:', err);
		return { exists: false };
	}
}

function mergeWordLists(localWords: WordRecord[], remoteWords: WordRecord[]): WordRecord[] {
	const wordMap = new Map<string, WordRecord>();

	// Add local words first
	for (const w of localWords) {
		const key = (w['Chinese Word'] || String(w.No)).trim();
		wordMap.set(key, w);
	}

	// Merge remote words
	for (const rw of remoteWords) {
		const key = (rw['Chinese Word'] || String(rw.No)).trim();
		const existing = wordMap.get(key);
		if (!existing) {
			wordMap.set(key, rw);
		} else {
			// Merge properties, preferring custom notes or categories if present
			wordMap.set(key, {
				...rw,
				...existing,
				customNote: existing.customNote || rw.customNote,
				category: existing.category || rw.category,
				'Acceptable Answers': existing['Acceptable Answers'] || rw['Acceptable Answers']
			});
		}
	}

	const merged = Array.from(wordMap.values());
	// Ensure sequential Nos
	return merged.map((word, idx) => ({
		...word,
		No: idx + 1
	}));
}

export async function pullAndMerge(username?: string): Promise<boolean> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	const user = (username || getSavedUsername()).trim().toLowerCase();
	if (!user || !isValidUsername(user)) return false;

	if (typeof navigator !== 'undefined' && navigator.onLine === false) {
		updateStatus('idle');
		return false;
	}

	updateStatus('syncing');
	lastPullTime = Date.now();

	try {
		const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(user)}`, {
			headers: { Accept: 'application/json' }
		});

		if (res.status === 404) {
			// User does not exist on cloud yet: push local data
			await pushData(user);
			updateStatus('ok');
			return true;
		}

		if (!res.ok) {
			updateStatus('error');
			return false;
		}

		const remoteData: AppBackup = await res.json();
		let localHadNewData = false;

		// 1. Merge words deck
		const localDeck = await getMyWordsDeck();
		const remoteDeck =
			remoteData.customDecks?.find((d) => d.id === MY_WORDS_DECK_ID) || remoteData.customDecks?.[0];
		const remoteWords = remoteDeck?.words ?? [];
		const localWords = localDeck.words ?? [];

		if (remoteWords.length > 0) {
			const mergedWords = mergeWordLists(localWords, remoteWords);
			if (mergedWords.length > remoteWords.length) {
				localHadNewData = true;
			}
			const mergedDeck: CustomDeck = {
				...localDeck,
				id: MY_WORDS_DECK_ID,
				name: MY_WORDS_DECK_NAME,
				words: mergedWords,
				language: 'chinese',
				createdAt: localDeck.createdAt || Date.now()
			};
			await saveMyWordsDeck(mergedDeck);
		} else if (localWords.length > 0) {
			localHadNewData = true;
		}

		// 2. Merge progress
		const localProgress = await getAllProgress();
		const remoteProgress = remoteData.progress || {};
		const mergedProgress: Record<string, WordProgress> = { ...localProgress };

		for (const [key, remProg] of Object.entries(remoteProgress)) {
			if (!remProg || typeof remProg !== 'object') continue;
			const locProg = localProgress[key];

			if (!locProg) {
				mergedProgress[key] = remProg;
			} else {
				const locLast = locProg.lastReviewed || 0;
				const remLast = remProg.lastReviewed || 0;

				if (locLast > remLast) {
					mergedProgress[key] = locProg;
					localHadNewData = true;
				} else if (remLast > locLast) {
					mergedProgress[key] = remProg;
				} else {
					const locReps = locProg.reps || 0;
					const remReps = remProg.reps || 0;
					if (locReps > remReps) {
						mergedProgress[key] = locProg;
						localHadNewData = true;
					} else {
						mergedProgress[key] = remProg;
					}
				}
			}
		}

		// Check if local has progress keys remote lacks
		for (const key of Object.keys(localProgress)) {
			if (!remoteProgress[key]) {
				localHadNewData = true;
			}
		}

		await saveBulkProgress(mergedProgress, true);

		// If local had newer cards or progress, push merged back to cloud
		if (localHadNewData) {
			await pushData(user);
		}

		updateStatus('ok');
		return true;
	} catch (err) {
		console.error('Error during pullAndMerge:', err);
		updateStatus('error');
		return false;
	}
}

export async function pushData(username?: string): Promise<boolean> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	const user = (username || getSavedUsername()).trim().toLowerCase();
	if (!user || !isValidUsername(user)) return false;

	if (typeof navigator !== 'undefined' && navigator.onLine === false) {
		updateStatus('pending');
		return false;
	}

	updateStatus('syncing');

	try {
		const deck = await getMyWordsDeck();
		const progress = await getAllProgress();

		const payload: AppBackup = {
			version: 1,
			exportedAt: Date.now(),
			customDecks: [deck],
			progress,
			language: 'chinese',
			username: user
		};

		const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(user)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			updateStatus('error');
			return false;
		}

		// Ensure username in users list
		try {
			const usersRes = await fetch(`${API_BASE_URL}/users`);
			let currentUsers: string[] = [];
			if (usersRes.ok) {
				currentUsers = await usersRes.json();
			}
			if (!Array.isArray(currentUsers)) currentUsers = [];
			if (!currentUsers.includes(user)) {
				currentUsers.push(user);
				await fetch(`${API_BASE_URL}/users`, {
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

export async function renameUser(
	oldUser: string,
	newUser: string,
	confirmedExisting = false
): Promise<{ success: boolean; collision?: boolean; error?: string }> {
	const cleanOld = oldUser.trim().toLowerCase();
	const cleanNew = newUser.trim().toLowerCase();

	if (!isValidUsername(cleanNew)) {
		return { success: false, error: 'Invalid username format.' };
	}

	if (cleanNew === cleanOld) {
		return { success: true };
	}

	// Check if target name already exists
	if (!confirmedExisting) {
		const check = await checkRemoteUser(cleanNew);
		if (check.exists) {
			return { success: false, collision: true };
		}
	}

	updateStatus('syncing');

	try {
		// If confirmed existing, pull & merge target user first
		if (confirmedExisting) {
			await pullAndMerge(cleanNew);
		}

		// Push current state to new name
		const pushOk = await pushData(cleanNew);
		if (!pushOk) {
			updateStatus('error');
			return { success: false, error: 'Failed to save data to new username.' };
		}

		// Update users list: remove oldUser, ensure newUser
		try {
			const usersRes = await fetch(`${API_BASE_URL}/users`);
			if (usersRes.ok) {
				let currentUsers: string[] = await usersRes.json();
				if (Array.isArray(currentUsers)) {
					currentUsers = currentUsers.filter((u) => u !== cleanOld);
					if (!currentUsers.includes(cleanNew)) {
						currentUsers.push(cleanNew);
					}
					await fetch(`${API_BASE_URL}/users`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(currentUsers)
					});
				}
			}
		} catch (err) {
			console.warn('Non-blocking users list update error on rename:', err);
		}

		// Best-effort delete old user document
		if (cleanOld) {
			try {
				await fetch(`${API_BASE_URL}/users/${encodeURIComponent(cleanOld)}`, {
					method: 'DELETE'
				});
			} catch {
				// Best-effort deletion
			}
		}

		// Save new username locally
		setSavedUsername(cleanNew);
		updateStatus('ok');
		return { success: true };
	} catch (err) {
		console.error('Rename user error:', err);
		updateStatus('error');
		return { success: false, error: err instanceof Error ? err.message : 'Rename failed.' };
	}
}

export function scheduleDebouncedSync(delayMs = 3000): void {
	const user = getSavedUsername();
	if (!user) return;

	updateStatus('pending');
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		pushData();
	}, delayMs);
}

// Auto-register data mutation listener to schedule sync
registerDataMutationListener(() => {
	scheduleDebouncedSync();
});

// Auto pull/sync on focus/online
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		const user = getSavedUsername();
		if (!user) return;
		if (currentSyncStatus === 'pending' || currentSyncStatus === 'error') {
			pushData();
		} else {
			pullAndMerge(user);
		}
	});

	window.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') {
			const user = getSavedUsername();
			if (user && Date.now() - lastPullTime > 10000) {
				pullAndMerge(user);
			}
		}
	});
}

