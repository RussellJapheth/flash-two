import { describe, it, expect } from 'vitest';
import {
	calculateReviewXP,
	calculateSessionBonus,
	computeLevelStats,
	calculateWindowXP,
	deduplicateXPLeaderboard,
	migrateHistoricalProgressXP
} from './xp';
import type { WordProgress, XPLeaderboardEntry } from '$lib/types';

describe('XP calculations and progression', () => {
	it('calculates correct review XP across study modes and ratings', () => {
		// SRS mode
		expect(calculateReviewXP('srs', 'easy')).toBe(12);
		expect(calculateReviewXP('srs', 'good')).toBe(10);
		expect(calculateReviewXP('srs', 'hard')).toBe(5);
		expect(calculateReviewXP('srs', 'again')).toBe(2);

		// Difficult words mode
		expect(calculateReviewXP('weak', 'easy')).toBe(15);
		expect(calculateReviewXP('weak', 'good')).toBe(12);
		expect(calculateReviewXP('weak', 'hard')).toBe(6);
		expect(calculateReviewXP('weak', 'again')).toBe(3);

		// All cards mode
		expect(calculateReviewXP('all', 'easy')).toBe(6);
		expect(calculateReviewXP('all', 'good')).toBe(5);
		expect(calculateReviewXP('all', 'hard')).toBe(3);
		expect(calculateReviewXP('all', 'again')).toBe(1);
	});

	it('calculates session completion and accuracy bonuses', () => {
		// SRS mode with high accuracy
		const srsBonus = calculateSessionBonus('srs', 10, 9);
		expect(srsBonus.completionBonus).toBe(25);
		expect(srsBonus.accuracyBonus).toBe(15);
		expect(srsBonus.totalBonus).toBe(40);

		// Difficult words with lower accuracy
		const weakBonus = calculateSessionBonus('weak', 10, 5);
		expect(weakBonus.completionBonus).toBe(20);
		expect(weakBonus.accuracyBonus).toBe(0);
		expect(weakBonus.totalBonus).toBe(20);

		// Empty session
		const emptyBonus = calculateSessionBonus('all', 0, 0);
		expect(emptyBonus.totalBonus).toBe(0);
	});

	it('computes level stats accurately', () => {
		// 0 XP -> Level 1
		const stats0 = computeLevelStats(0);
		expect(stats0.level).toBe(1);
		expect(stats0.currentLevelXP).toBe(0);
		expect(stats0.nextLevelXP).toBe(50);
		expect(stats0.progressInLevelPercent).toBe(0);

		// 50 XP -> Level 2
		const stats50 = computeLevelStats(50);
		expect(stats50.level).toBe(2);
		expect(stats50.currentLevelXP).toBe(50);
		expect(stats50.nextLevelXP).toBe(200);

		// 200 XP -> Level 3
		const stats200 = computeLevelStats(200);
		expect(stats200.level).toBe(3);
	});

	it('calculates rolling window XP from dailyXP maps', () => {
		const today = new Date().toISOString().split('T')[0];
		const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
		const oldDate = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];

		const dailyMap = {
			[today]: 50,
			[yesterday]: 30,
			[oldDate]: 100
		};

		// 7-day window should include today and yesterday (80)
		expect(calculateWindowXP(dailyMap, 7)).toBe(80);
		// 30-day window should include all three (180)
		expect(calculateWindowXP(dailyMap, 30)).toBe(180);
	});

	it('deduplicates leaderboard entries and merges local best score', () => {
		const entries: XPLeaderboardEntry[] = [
			{
				username: 'alice',
				allTimeXP: 200,
				weeklyXP: 50,
				monthlyXP: 100,
				level: 3,
				lastActive: 1000
			},
			{
				username: 'Alice',
				allTimeXP: 300,
				weeklyXP: 70,
				monthlyXP: 150,
				level: 4,
				lastActive: 2000
			}
		];

		const localEntry: XPLeaderboardEntry = {
			username: 'alice',
			allTimeXP: 350,
			weeklyXP: 80,
			monthlyXP: 160,
			level: 4,
			lastActive: 3000
		};

		const deduped = deduplicateXPLeaderboard(entries, localEntry);
		expect(deduped.length).toBe(1);
		expect(deduped[0].username).toBe('alice');
		expect(deduped[0].allTimeXP).toBe(350);
	});
});
