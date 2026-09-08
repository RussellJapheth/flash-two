import type { AppBackup, WordProgress, CustomDeck, SavedWord, SyncStatus } from '$lib/types';
import {
	getAllProgress,
	getAllCustomDecks,
	getAllSavedWords,
	saveBulkProgress,
	saveCustomDeck,
	getSavedUsername,
	getSavedLanguage
} from './storage';

const API_BASE = 'https://json-drive.thespot.workers.dev/api/flashcards';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
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

// Deep merge remote data into local state
export async function pullAndMerge(username: string): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	if (!navigator.onLine) {
		updateStatus('idle');
		return false;
	}

	updateStatus('syncing');

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

		// Merge Progress
		const localProgress = await getAllProgress();
		const mergedProgress: Record<string, WordProgress> = { ...localProgress };

		if (remoteData.progress) {
			for (const [key, remoteProg] of Object.entries(remoteData.progress)) {
				const localProg = localProgress[key];
				if (!localProg) {
					mergedProgress[key] = remoteProg;
				} else {
					mergedProgress[key] = {
						weekId: remoteProg.weekId || localProg.weekId,
						wordNo: remoteProg.wordNo || localProg.wordNo,
						correct: Math.max(localProg.correct || 0, remoteProg.correct || 0),
						wrong: Math.max(localProg.wrong || 0, remoteProg.wrong || 0),
						lastReviewed: Math.max(localProg.lastReviewed || 0, remoteProg.lastReviewed || 0),
						dueDate: Math.max(localProg.dueDate || 0, remoteProg.dueDate || 0),
						interval: Math.max(localProg.interval || 0, remoteProg.interval || 0),
						reps: Math.max(localProg.reps || 0, remoteProg.reps || 0),
						lapses: Math.max(localProg.lapses || 0, remoteProg.lapses || 0),
						easeFactor:
							(remoteProg.lastReviewed || 0) >= (localProg.lastReviewed || 0)
								? remoteProg.easeFactor || 2.5
								: localProg.easeFactor || 2.5
					};
				}
			}
			await saveBulkProgress(mergedProgress);
		}

		// Merge Custom Decks
		if (Array.isArray(remoteData.customDecks)) {
			const localDecks = await getAllCustomDecks();
			const localIds = new Set(localDecks.map((d) => d.id));
			for (const remoteDeck of remoteData.customDecks) {
				if (!localIds.has(remoteDeck.id)) {
					await saveCustomDeck(remoteDeck);
				}
			}
		}

		updateStatus('ok');
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
		} catch (e) {
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

// Handle online reconnection
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => {
		if (currentSyncStatus === 'pending' || currentSyncStatus === 'error') {
			pushData();
		}
	});
}
