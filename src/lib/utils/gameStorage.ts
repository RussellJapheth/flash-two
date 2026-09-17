import { getSavedUsername, isLeaderboardDisabled } from './storage';
import { API_BASE_URL } from './apiBase';

export interface GameScoreRecord {
	id: string;
	username: string;
	gameId: string;
	gameName: string;
	score: number;
	correct: number;
	wrong: number;
	accuracy: number;
	maxCombo: number;
	mode: 'visual' | 'audio' | 'voice';
	playedAt: number;
}

const GAME_SCORES_KEY = 'flashcards_game_scores';
const LEADERBOARD_API = `${API_BASE_URL}/leaderboard`;

export function isCloudSyncEnabled(): boolean {
	const user = getSavedUsername();
	return Boolean(user && user.trim().length > 0 && user.trim().toLowerCase() !== 'guest');
}

// Migrate any locally stored 'Guest' records to the authenticated cloud username
export function migrateGuestGameScores(targetUser?: string): number {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return 0;
	const user = (targetUser || getSavedUsername()).trim();
	if (!user || user.toLowerCase() === 'guest') return 0;

	try {
		const raw = localStorage.getItem(GAME_SCORES_KEY);
		if (!raw) return 0;
		const list: GameScoreRecord[] = JSON.parse(raw);
		if (!Array.isArray(list)) return 0;

		let migratedCount = 0;
		const updated = list.map((record) => {
			if (record && record.username && record.username.trim().toLowerCase() === 'guest') {
				migratedCount++;
				return { ...record, username: user };
			}
			return record;
		});

		if (migratedCount > 0) {
			localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(updated));
		}
		return migratedCount;
	} catch (e) {
		console.error('Failed to migrate guest game scores:', e);
		return 0;
	}
}

export function deduplicateUserLeaderboard(
	records: GameScoreRecord[],
	gameId?: string,
	mode?: 'visual' | 'audio' | 'voice'
): GameScoreRecord[] {
	const userBestMap = new Map<string, GameScoreRecord>();

	for (const r of records) {
		if (!r || !r.username) continue;
		const trimmedUser = r.username.trim();
		// Discard empty or unassigned guest records from cloud leaderboard
		if (!trimmedUser || trimmedUser.toLowerCase() === 'guest') continue;
		if (gameId && r.gameId !== gameId) continue;
		const rMode = r.mode || 'visual';
		if (mode && rMode !== mode) continue;

		const userKey = `${trimmedUser.toLowerCase()}::${r.gameId || ''}::${rMode}`;
		const existing = userBestMap.get(userKey);

		if (!existing) {
			userBestMap.set(userKey, { ...r, username: trimmedUser });
		} else {
			// Compare scores: keep higher score (tiebreak: higher accuracy, then newer date)
			if (
				r.score > existing.score ||
				(r.score === existing.score && r.accuracy > existing.accuracy) ||
				(r.score === existing.score &&
					r.accuracy === existing.accuracy &&
					r.playedAt > existing.playedAt)
			) {
				userBestMap.set(userKey, { ...r, username: trimmedUser });
			}
		}
	}

	return Array.from(userBestMap.values()).sort(
		(a, b) => b.score - a.score || b.accuracy - a.accuracy || b.playedAt - a.playedAt
	);
}

export function getLocalGameScores(gameId?: string): GameScoreRecord[] {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return [];
	try {
		if (isCloudSyncEnabled()) {
			migrateGuestGameScores();
		}
		const raw = localStorage.getItem(GAME_SCORES_KEY);
		if (!raw) return [];
		const list: GameScoreRecord[] = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		if (gameId) {
			return list.filter((r) => r.gameId === gameId);
		}
		return list;
	} catch (e) {
		console.error('Failed to get game scores:', e);
		return [];
	}
}

export function saveLocalGameScore(
	record: Omit<GameScoreRecord, 'id' | 'playedAt' | 'username'> & { username?: string }
): GameScoreRecord {
	const user = record.username || getSavedUsername() || 'Guest';
	const newRecord: GameScoreRecord = {
		...record,
		username: user,
		id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		playedAt: Date.now()
	};

	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return newRecord;

	try {
		const current = getLocalGameScores();
		const updated = [newRecord, ...current].slice(0, 100);
		localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(updated));
	} catch (e) {
		console.error('Failed to save local game score:', e);
	}

	return newRecord;
}

export function getGameHighScore(gameId: string, mode?: 'visual' | 'audio' | 'voice'): number {
	const scores = getLocalGameScores(gameId);
	const filtered = mode ? scores.filter((s) => (s.mode || 'visual') === mode) : scores;
	if (filtered.length === 0) return 0;
	return Math.max(...filtered.map((s) => s.score));
}

// Merge local scores and remote scores, ensuring only the highest score per user/game/mode is preserved
export function mergeLeaderboardScores(
	localScores: GameScoreRecord[],
	remoteScores: GameScoreRecord[]
): GameScoreRecord[] {
	const localBests = deduplicateUserLeaderboard(localScores);
	return deduplicateUserLeaderboard([...localBests, ...remoteScores]);
}

// Synchronize remote leaderboard records for current user into local storage
export function syncRemoteScoresToLocal(
	remoteScores: GameScoreRecord[],
	targetUser?: string
): boolean {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	const user = (targetUser || getSavedUsername()).trim().toLowerCase();
	if (!user || user === 'guest') return false;

	const userRemoteRecords = remoteScores.filter(
		(r) => r && r.username && r.username.trim().toLowerCase() === user
	);
	if (userRemoteRecords.length === 0) return false;

	const localScores = getLocalGameScores();
	let updated = false;
	const newLocalScores = [...localScores];

	for (const rem of userRemoteRecords) {
		const rGameId = rem.gameId;
		const rMode = rem.mode || 'visual';

		const matchingLocal = localScores.filter(
			(l) => l.gameId === rGameId && (l.mode || 'visual') === rMode
		);
		const maxLocalScore =
			matchingLocal.length > 0 ? Math.max(...matchingLocal.map((l) => l.score)) : -1;

		if (rem.score > maxLocalScore) {
			newLocalScores.unshift(rem);
			updated = true;
		}
	}

	if (updated) {
		try {
			localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(newLocalScores.slice(0, 100)));
		} catch (e) {
			console.error('Failed to sync remote scores to local:', e);
		}
	}

	return updated;
}

// Fetch global leaderboard from /leaderboard endpoint (Only for cloud-synced users, 1 entry per user per game per mode)
export async function fetchRemoteLeaderboard(
	gameId?: string,
	mode?: 'visual' | 'audio' | 'voice',
	limit = 50
): Promise<GameScoreRecord[]> {
	if (typeof window === 'undefined') return [];
	if (isLeaderboardDisabled()) return [];
	if (!isCloudSyncEnabled()) return [];

	try {
		const response = await fetch(LEADERBOARD_API, {
			headers: { Accept: 'application/json' }
		});

		if (response.ok) {
			const remoteList = await response.json();
			if (Array.isArray(remoteList)) {
				syncRemoteScoresToLocal(remoteList);
				const uniqueByUser = deduplicateUserLeaderboard(remoteList, gameId, mode);
				return uniqueByUser.slice(0, limit);
			}
		}
	} catch (err) {
		console.error('Failed to fetch remote leaderboard:', err);
	}

	return [];
}

// Synchronize all stored local scores with remote leaderboard (devices only send highest scores, best score retained)
export async function syncPendingGameScores(): Promise<void> {
	if (typeof window === 'undefined' || !navigator.onLine || !isCloudSyncEnabled()) return;

	const currentUsername = getSavedUsername().trim().toLowerCase();
	const disabled = isLeaderboardDisabled();

	try {
		let remoteRecords: GameScoreRecord[] = [];
		const getRes = await fetch(LEADERBOARD_API, {
			headers: { Accept: 'application/json' }
		});
		if (getRes.ok) {
			const data = await getRes.json();
			if (Array.isArray(data)) {
				remoteRecords = data;
			}
		}

		if (disabled) {
			// If leaderboards are disabled, scrub user's scores from the public remote leaderboard
			const scrubbed = remoteRecords.filter(
				(r) => !r || !r.username || r.username.trim().toLowerCase() !== currentUsername
			);
			if (scrubbed.length !== remoteRecords.length) {
				await fetch(LEADERBOARD_API, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(scrubbed.slice(0, 100))
				});
			}
			return;
		}

		// Pull remote high scores into local storage if remote is higher
		syncRemoteScoresToLocal(remoteRecords);

		const localScores = getLocalGameScores();
		if (localScores.length === 0 && remoteRecords.length === 0) return;

		// Retain highest score across local history + remote (1 entry per user per game per mode)
		const merged = mergeLeaderboardScores(localScores, remoteRecords);
		const payload = merged.slice(0, 100);

		// Only push update when local best scores improve or change the remote leaderboard
		const hasChanges =
			payload.length !== remoteRecords.length ||
			payload.some((rec, idx) => {
				const rem = remoteRecords[idx];
				return (
					!rem || rem.id !== rec.id || rem.score !== rec.score || rem.accuracy !== rec.accuracy
				);
			});

		if (hasChanges) {
			await fetch(LEADERBOARD_API, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		}
	} catch (err) {
		console.error('Failed to sync scores to /leaderboard:', err);
	}
}

// Save score locally, and if cloud sync is enabled, update the user's single best entry on /leaderboard
export async function saveGameScore(
	record: Omit<GameScoreRecord, 'id' | 'playedAt' | 'username'> & { username?: string }
): Promise<GameScoreRecord> {
	const saved = saveLocalGameScore(record);

	const user = record.username || getSavedUsername();
	if (typeof window === 'undefined' || !navigator.onLine || !user) {
		return saved;
	}

	if (!isLeaderboardDisabled()) {
		await syncPendingGameScores();
	}

	return saved;
}
