import { describe, it, expect } from 'vitest';
import {
	calculateReviewXP,
	calculateGameXP,
	calculateSessionBonus,
	computeLevelStats,
	calculateWindowXP,
	deduplicateXPLeaderboard
} from './xp';
import type { XPLeaderboardEntry } from '$lib/types';

describe('XP calculations and progression', () => {
	it('calculates game XP with reduced rates compared to study sessions', () => {
		// Zero correct -> 0 XP
		expect(calculateGameXP(0, 0, 0)).toBe(0);

		// Minimal performance
		expect(calculateGameXP(2, 50, 0)).toBe(1);

		// Average game round: 12 correct, 75% accuracy, 3 combo
		// Base: 6, Acc bonus: 2, Combo bonus: 1 -> 9 XP
		expect(calculateGameXP(12, 75, 3)).toBe(9);

		// High performance game round: 20 correct, 95% accuracy, 9 combo
		// Base: 10, Acc bonus: 4, Combo bonus: 3 -> 17 XP
		expect(calculateGameXP(20, 95, 9)).toBe(17);
	});
	it('calculates correct review XP across study modes and ratings', () => {
		// SRS mode
		expect(calculateReviewXP('srs', 'easy')).toBe(3);
		expect(calculateReviewXP('srs', 'good')).toBe(2);
		expect(calculateReviewXP('srs', 'hard')).toBe(1);
		expect(calculateReviewXP('srs', 'again')).toBe(0);

		// Difficult words mode
		expect(calculateReviewXP('weak', 'easy')).toBe(4);
		expect(calculateReviewXP('weak', 'good')).toBe(3);
		expect(calculateReviewXP('weak', 'hard')).toBe(1);
		expect(calculateReviewXP('weak', 'again')).toBe(0);

		// All cards mode
		expect(calculateReviewXP('all', 'easy')).toBe(2);
		expect(calculateReviewXP('all', 'good')).toBe(1);
		expect(calculateReviewXP('all', 'hard')).toBe(1);
		expect(calculateReviewXP('all', 'again')).toBe(0);
	});

	it('calculates session completion and accuracy bonuses', () => {
		// SRS mode with high accuracy
		const srsBonus = calculateSessionBonus('srs', 10, 9);
		expect(srsBonus.completionBonus).toBe(5);
		expect(srsBonus.accuracyBonus).toBe(3);
		expect(srsBonus.totalBonus).toBe(8);

		// Difficult words with lower accuracy
		const weakBonus = calculateSessionBonus('weak', 10, 5);
		expect(weakBonus.completionBonus).toBe(4);
		expect(weakBonus.accuracyBonus).toBe(0);
		expect(weakBonus.totalBonus).toBe(4);

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

	it('deduplicates leaderboard entries and lets authentic local entry overwrite remote score', () => {
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

		// Local entry after reset to 0 XP
		const localResetEntry: XPLeaderboardEntry = {
			username: 'alice',
			allTimeXP: 0,
			weeklyXP: 0,
			monthlyXP: 0,
			level: 1,
			lastActive: 3000
		};

		const deduped = deduplicateXPLeaderboard(entries, localResetEntry);
		expect(deduped.length).toBe(1);
		expect(deduped[0].username).toBe('alice');
		expect(deduped[0].allTimeXP).toBe(0);
	});
});
