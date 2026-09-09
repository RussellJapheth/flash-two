import { describe, it, expect } from 'vitest';
import { deduplicateUserLeaderboard, type GameScoreRecord } from './utils/gameStorage';
import { calculateGameXP } from './utils/xp';

describe('Match Blitz Game Logic & Mechanics', () => {
	function getPairsInWave(waveNumber: number): number {
		if (waveNumber === 1) return 3;
		if (waveNumber === 2) return 4;
		return 6;
	}

	function calculateMatchScore(combo: number): number {
		const comboMultiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
		return 100 * comboMultiplier;
	}

	it('scales board size progressively across waves', () => {
		expect(getPairsInWave(1)).toBe(3); // 6 tiles for warmup
		expect(getPairsInWave(2)).toBe(4); // 8 tiles for flow
		expect(getPairsInWave(3)).toBe(6); // 12 tiles for blitz
		expect(getPairsInWave(10)).toBe(6);
	});

	it('calculates score with combo multipliers correctly', () => {
		expect(calculateMatchScore(1)).toBe(100);
		expect(calculateMatchScore(2)).toBe(100);
		expect(calculateMatchScore(3)).toBe(200); // 2x multiplier
		expect(calculateMatchScore(4)).toBe(200);
		expect(calculateMatchScore(5)).toBe(300); // 3x multiplier
		expect(calculateMatchScore(10)).toBe(300);
	});

	it('calculates scaled mini-game XP keeping learning activities much more rewarding', () => {
		// 10 matches, 90% acc, max combo 5 -> base 5 + acc 4 + combo 1 = 10 XP
		const xp1 = calculateGameXP(10, 90, 5);
		expect(xp1).toBe(10);

		// 6 matches, 60% acc, max combo 2 -> base 3 + acc 2 + combo 0 = 5 XP
		const xp2 = calculateGameXP(6, 60, 2);
		expect(xp2).toBe(5);

		// 0 matches -> 0 XP
		const xp0 = calculateGameXP(0, 0, 0);
		expect(xp0).toBe(0);
	});

	it('deduplicates Match Blitz leaderboard records preserving highest score per user', () => {
		const sampleRecords: GameScoreRecord[] = [
			{
				id: 's1',
				username: 'Alice',
				gameId: 'match-blitz',
				gameName: 'Match Blitz',
				score: 1200,
				correct: 10,
				wrong: 1,
				accuracy: 91,
				maxCombo: 6,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: 's2',
				username: 'Alice',
				gameId: 'match-blitz',
				gameName: 'Match Blitz',
				score: 1800,
				correct: 14,
				wrong: 0,
				accuracy: 100,
				maxCombo: 8,
				mode: 'visual',
				playedAt: 2000
			},
			{
				id: 's3',
				username: 'Bob',
				gameId: 'match-blitz',
				gameName: 'Match Blitz',
				score: 1500,
				correct: 12,
				wrong: 2,
				accuracy: 86,
				maxCombo: 4,
				mode: 'visual',
				playedAt: 1500
			}
		];

		const deduplicated = deduplicateUserLeaderboard(sampleRecords, 'match-blitz', 'visual');
		expect(deduplicated).toHaveLength(2);
		expect(deduplicated[0].username).toBe('Alice');
		expect(deduplicated[0].score).toBe(1800);
		expect(deduplicated[1].username).toBe('Bob');
		expect(deduplicated[1].score).toBe(1500);
	});
});
