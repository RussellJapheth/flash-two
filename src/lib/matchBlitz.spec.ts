import { describe, it, expect } from 'vitest';
import { deduplicateUserLeaderboard, type GameScoreRecord } from './utils/gameStorage';

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

	function calculateMatchXP(correct: number, accuracy: number, maxCombo: number): number {
		return Math.round(correct * 5 + (accuracy >= 80 ? 25 : 10) + maxCombo * 3);
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

	it('calculates earned XP rewarding accuracy and high streaks', () => {
		const xp1 = calculateMatchXP(10, 90, 5); // 10*5 + 25 + 5*3 = 50 + 25 + 15 = 90
		expect(xp1).toBe(90);

		const xp2 = calculateMatchXP(6, 60, 2); // 6*5 + 10 + 2*3 = 30 + 10 + 6 = 46
		expect(xp2).toBe(46);
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
