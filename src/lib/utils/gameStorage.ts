import { getSavedUsername } from './storage';

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
	mode: 'visual' | 'audio';
	playedAt: number;
}

const GAME_SCORES_KEY = 'flashcards_game_scores';
const LEADERBOARD_API = 'https://json-drive.thespot.workers.dev/api/flashcards/leaderboard';

export function isCloudSyncEnabled(): boolean {
	const user = getSavedUsername();
	return Boolean(user && user.trim().length > 0);
}

export function deduplicateUserLeaderboard(
	records: GameScoreRecord[],
	gameId?: string
): GameScoreRecord[] {
	const userBestMap = new Map<string, GameScoreRecord>();

	for (const r of records) {
		if (!r || !r.username) continue;
		if (gameId && r.gameId !== gameId) continue;

		const userKey = r.username.trim().toLowerCase();
		const existing = userBestMap.get(userKey);

		if (!existing) {
			userBestMap.set(userKey, r);
		} else {
			// Compare scores: keep higher score (tiebreak: higher accuracy, then newer date)
			if (
				r.score > existing.score ||
				(r.score === existing.score && r.accuracy > existing.accuracy) ||
				(r.score === existing.score &&
					r.accuracy === existing.accuracy &&
					r.playedAt > existing.playedAt)
			) {
				userBestMap.set(userKey, r);
			}
		}
	}

	return Array.from(userBestMap.values()).sort(
		(a, b) => b.score - a.score || b.accuracy - a.accuracy || b.playedAt - a.playedAt
	);
}

export function getLocalGameScores(gameId?: string): GameScoreRecord[] {
	if (typeof window === 'undefined') return [];
	try {
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

	if (typeof window === 'undefined') return newRecord;

	try {
		const current = getLocalGameScores();
		const updated = [newRecord, ...current].slice(0, 100);
		localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(updated));
	} catch (e) {
		console.error('Failed to save local game score:', e);
	}

	return newRecord;
}

export function getGameHighScore(gameId: string): number {
	const scores = getLocalGameScores(gameId);
	if (scores.length === 0) return 0;
	return Math.max(...scores.map((s) => s.score));
}

// Fetch global leaderboard from /leaderboard endpoint (Only for cloud-synced users, 1 entry per user)
export async function fetchRemoteLeaderboard(
	gameId?: string,
	limit = 20
): Promise<GameScoreRecord[]> {
	if (typeof window === 'undefined') return [];
	if (!isCloudSyncEnabled()) return [];

	try {
		const response = await fetch(LEADERBOARD_API, {
			headers: { Accept: 'application/json' }
		});

		if (response.ok) {
			const remoteList = await response.json();
			if (Array.isArray(remoteList)) {
				const uniqueByUser = deduplicateUserLeaderboard(remoteList, gameId);
				return uniqueByUser.slice(0, limit);
			}
		}
	} catch (err) {
		console.error('Failed to fetch remote leaderboard:', err);
	}

	return [];
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

	try {
		// Fetch existing remote leaderboard
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

		// Ensure 1 entry per user across the leaderboard, retaining highest score
		const combined = [saved, ...remoteRecords];
		const deduplicated = deduplicateUserLeaderboard(combined);

		await fetch(LEADERBOARD_API, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deduplicated.slice(0, 100))
		});
	} catch (err) {
		console.error('Failed to sync score to /leaderboard:', err);
	}

	return saved;
}
