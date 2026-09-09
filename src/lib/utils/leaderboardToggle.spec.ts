import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
	isLeaderboardDisabled,
	setLeaderboardDisabled,
	LEADERBOARD_DISABLED_KEY,
	setSavedUsername
} from './storage';
import { fetchXPLeaderboard } from './xp';
import { fetchRemoteLeaderboard, saveGameScore, getLocalGameScores } from './gameStorage';

class LocalStorageMock {
	private store: Record<string, string> = {};
	getItem(key: string): string | null {
		return this.store[key] ?? null;
	}
	setItem(key: string, value: string): void {
		this.store[key] = String(value);
	}
	removeItem(key: string): void {
		delete this.store[key];
	}
	clear(): void {
		this.store = {};
	}
}

describe('Leaderboard Toggle & Privacy Settings', () => {
	beforeAll(() => {
		if (typeof globalThis.localStorage === 'undefined') {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
	});

	beforeEach(() => {
		localStorage.clear();
	});

	it('defaults to true (leaderboards disabled) for new users / fresh storage', () => {
		expect(localStorage.getItem(LEADERBOARD_DISABLED_KEY)).toBeNull();
		expect(isLeaderboardDisabled()).toBe(true);
	});

	it('persists toggle state changes correctly', () => {
		setLeaderboardDisabled(false);
		expect(localStorage.getItem(LEADERBOARD_DISABLED_KEY)).toBe('false');
		expect(isLeaderboardDisabled()).toBe(false);

		setLeaderboardDisabled(true);
		expect(localStorage.getItem(LEADERBOARD_DISABLED_KEY)).toBe('true');
		expect(isLeaderboardDisabled()).toBe(true);
	});

	it('blocks fetchXPLeaderboard when leaderboards are disabled', async () => {
		setSavedUsername('test-user');
		setLeaderboardDisabled(true);

		const result = await fetchXPLeaderboard('weekly');
		expect(result.error).toBe('disabled');
		expect(result.entries).toEqual([]);
		expect(result.userRank).toBeNull();
	});

	it('blocks fetchRemoteLeaderboard when leaderboards are disabled', async () => {
		setSavedUsername('test-user');
		setLeaderboardDisabled(true);

		const result = await fetchRemoteLeaderboard('number-rush', 'visual');
		expect(result).toEqual([]);
	});

	it('still saves game scores locally when leaderboards are disabled', () => {
		setSavedUsername('privacy-user');
		setLeaderboardDisabled(true);

		saveGameScore({
			gameId: 'match-blitz',
			gameName: 'Match Blitz',
			score: 1500,
			correct: 10,
			wrong: 0,
			accuracy: 100,
			maxCombo: 10,
			mode: 'visual'
		});

		const localScores = getLocalGameScores('match-blitz');
		expect(localScores.length).toBeGreaterThan(0);
		expect(localScores[0].score).toBe(1500);
		expect(localScores[0].username).toBe('privacy-user');
	});
});
