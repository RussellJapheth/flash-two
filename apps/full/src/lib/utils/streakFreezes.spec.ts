import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { computeStreakStats, getStreakFreezeData, saveStreakFreezeData } from './storage';
import type { WordProgress, StreakFreezeData } from '$lib/types';

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

describe('Streak Freezes Calculation & Storage', () => {
	beforeAll(() => {
		if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
	});

	beforeEach(() => {
		localStorage.clear();
	});

	function createMockProgress(daysAgoList: number[]): Record<string, WordProgress> {
		const progress: Record<string, WordProgress> = {};
		const now = Date.now();
		daysAgoList.forEach((daysAgo, index) => {
			const date = new Date(now - daysAgo * 86400000);
			progress[`w1:${index + 1}`] = {
				weekId: 'w1',
				wordNo: index + 1,
				correct: 1,
				wrong: 0,
				lastReviewed: date.getTime()
			};
		});
		return progress;
	}

	it('starts with 0 freezes for empty or 0-day progress', () => {
		const stats = computeStreakStats({}, { usedDates: [] });
		expect(stats.currentStreak).toBe(0);
		expect(stats.freezeCount).toBe(0);
		expect(stats.freezeDates).toEqual([]);
	});

	it('returns 0 freezes for streaks under 5 consecutive days', () => {
		// 4 consecutive days: today, yesterday, 2 days ago, 3 days ago
		const progress = createMockProgress([0, 1, 2, 3]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(4);
		expect(stats.freezeCount).toBe(0);
	});

	it('earns 1 freeze on reaching 5 consecutive days', () => {
		// 5 consecutive days: 0..4 days ago
		const progress = createMockProgress([0, 1, 2, 3, 4]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(5);
		expect(stats.freezeCount).toBe(1);
	});

	it('keeps 1 freeze for 9 consecutive days', () => {
		// 9 consecutive days: 0..8 days ago
		const progress = createMockProgress([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(9);
		expect(stats.freezeCount).toBe(1);
	});

	it('earns 2 freezes on reaching 10 consecutive days', () => {
		// 10 consecutive days: 0..9 days ago
		const progress = createMockProgress([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(10);
		expect(stats.freezeCount).toBe(2);
	});

	it('keeps 2 freezes for 14 consecutive days', () => {
		// 14 consecutive days: 0..13 days ago
		const progress = createMockProgress(Array.from({ length: 14 }, (_, i) => i));
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(14);
		expect(stats.freezeCount).toBe(2);
	});

	it('earns 3 freezes on reaching 15 consecutive days', () => {
		// 15 consecutive days: 0..14 days ago
		const progress = createMockProgress(Array.from({ length: 15 }, (_, i) => i));
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(15);
		expect(stats.freezeCount).toBe(3);
	});

	it('caps available freezes at maximum of 3 for 30+ consecutive days', () => {
		// 30 consecutive days: 0..29 days ago
		const progress = createMockProgress(Array.from({ length: 30 }, (_, i) => i));
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(30);
		expect(stats.freezeCount).toBe(3);
	});

	it('bridges an inactive day when streak freeze was used and deducts from active freeze balance', () => {
		const now = Date.now();
		const yesterdayIso = new Date(now - 1 * 86400000).toISOString().split('T')[0];

		// Active on today (0) and 2..6 days ago (6 active days in total)
		// Yesterday (1) was frozen
		const progress = createMockProgress([0, 2, 3, 4, 5, 6]);
		const freezeData: StreakFreezeData = {
			usedDates: [yesterdayIso]
		};

		const stats = computeStreakStats(progress, freezeData);
		// 6 active days + 1 frozen day = 7 consecutive streak days
		expect(stats.currentStreak).toBe(7);
		expect(stats.freezeDates).toContain(yesterdayIso);
		// 6 active days earned Math.floor(6/5) = 1 freeze, minus 1 used freeze = 0 available freezes
		expect(stats.freezeCount).toBe(0);
	});

	it('persists and retrieves streak freeze data in localStorage', () => {
		expect(getStreakFreezeData()).toEqual({ usedDates: [] });

		saveStreakFreezeData({ usedDates: ['2026-03-01', '2026-03-05', '2026-03-01'] });
		const loaded = getStreakFreezeData();
		expect(loaded.usedDates).toEqual(['2026-03-01', '2026-03-05']);
	});

	it('preserves streak active dates from dailyXP even when cards were re-reviewed on later days', () => {
		const now = Date.now();
		const todayIso = new Date(now).toISOString().split('T')[0];
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];
		const twoDaysAgoIso = new Date(now - 2 * 86400000).toISOString().split('T')[0];

		// Progress only has today because older reviews were overwritten by subsequent review
		const progress = createMockProgress([0]);
		const dailyXP = {
			[twoDaysAgoIso]: 15,
			[yesterdayIso]: 20,
			[todayIso]: 10
		};

		const stats = computeStreakStats(progress, { usedDates: [] }, dailyXP);
		expect(stats.currentStreak).toBe(3);
		expect(stats.activeDates).toContain(twoDaysAgoIso);
		expect(stats.activeDates).toContain(yesterdayIso);
		expect(stats.activeDates).toContain(todayIso);
	});

	it('reads dailyXP from localStorage when customDailyXP is not provided', () => {
		const now = Date.now();
		const todayIso = new Date(now).toISOString().split('T')[0];
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		localStorage.setItem(
			'flashcards_user_xp',
			JSON.stringify({
				totalXP: 100,
				dailyXP: {
					[yesterdayIso]: 25,
					[todayIso]: 15
				}
			})
		);

		const progress: Record<string, WordProgress> = {};
		const stats = computeStreakStats(progress);
		expect(stats.currentStreak).toBe(2);
		expect(stats.activeDates).toEqual([yesterdayIso, todayIso].sort());
	});

	it('automatically consumes an earned streak freeze when yesterday is missed and today is not yet reviewed', () => {
		const now = Date.now();
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		// 5 consecutive active days: 2..6 days ago
		const progress = createMockProgress([2, 3, 4, 5, 6]);
		const stats = computeStreakStats(progress, { usedDates: [] });

		// 5 active days earned 1 freeze, which auto-shields yesterday
		expect(stats.currentStreak).toBe(6);
		expect(stats.freezeDates).toContain(yesterdayIso);
		expect(stats.freezeCount).toBe(0);
	});

	it('automatically consumes freeze when user with earned freezes missed yesterday but reviews today', () => {
		const now = Date.now();
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		// Active today (0) and 2..6 days ago (5 active days prior)
		const progress = createMockProgress([0, 2, 3, 4, 5, 6]);
		const stats = computeStreakStats(progress, { usedDates: [] });

		// 6 active days earned 1 freeze, which auto-bridges yesterday
		expect(stats.currentStreak).toBe(7);
		expect(stats.freezeDates).toContain(yesterdayIso);
		expect(stats.freezeCount).toBe(0);
	});

	it('preserves long streaks (e.g. 34 days) when yesterday was missed and leaves remaining freezes', () => {
		const now = Date.now();
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		// 34 consecutive active days ending 2 days ago
		const progress = createMockProgress(Array.from({ length: 34 }, (_, i) => i + 2));
		const stats = computeStreakStats(progress, { usedDates: [] });

		// 34 active days earned 3 freezes (max). 1 consumed for yesterday -> 2 remaining
		expect(stats.currentStreak).toBe(35);
		expect(stats.freezeDates).toContain(yesterdayIso);
		expect(stats.freezeCount).toBe(2);
	});

	it('resets streak to 0 if consecutive missed days exceed available freezes', () => {
		// 5 active days (3..7 days ago) -> earns 1 freeze
		// Missed 2 days ago and yesterday (2 missed days > 1 freeze)
		const progress = createMockProgress([3, 4, 5, 6, 7]);
		const stats = computeStreakStats(progress, { usedDates: [] });

		expect(stats.currentStreak).toBe(0);
	});

	it('refills a consumed freeze after completing 5 active practice days', () => {
		const now = Date.now();
		const freezeIso = new Date(now - 6 * 86400000).toISOString().split('T')[0];

		// 15 days active (7..21 days ago) -> reaches full 3 freezes
		// 6 days ago: missed and frozen -> drops to 2 freezes
		// 5 days active (1..5 days ago) -> refills back to 3 freezes!
		const activeDays = [
			...Array.from({ length: 5 }, (_, i) => i + 1), // 1..5
			...Array.from({ length: 15 }, (_, i) => i + 7) // 7..21
		];
		const progress = createMockProgress(activeDays);
		const freezeData: StreakFreezeData = {
			usedDates: [freezeIso]
		};

		const stats = computeStreakStats(progress, freezeData);
		expect(stats.currentStreak).toBe(21); // 20 active days + 1 frozen day
		expect(stats.freezeDates).toContain(freezeIso);
		expect(stats.freezeCount).toBe(3); // Refilled back to full 3 freezes
	});

	it('refills multiple freezes repeatedly across long streaks', () => {
		const now = Date.now();
		// Earn 1 freeze (days 20..24 ago)
		// Freeze day 19
		// Refill 1 freeze (days 14..18 ago)
		// Freeze day 13
		// Refill 1 freeze (days 8..12 ago)
		// Freeze day 7
		// Refill 1 freeze (days 2..6 ago)
		// Missed yesterday (day 1 ago) -> should auto-freeze using the refilled freeze!
		const freeze1 = new Date(now - 19 * 86400000).toISOString().split('T')[0];
		const freeze2 = new Date(now - 13 * 86400000).toISOString().split('T')[0];
		const freeze3 = new Date(now - 7 * 86400000).toISOString().split('T')[0];
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		const activeDays = [
			...Array.from({ length: 5 }, (_, i) => i + 2), // 2..6
			...Array.from({ length: 5 }, (_, i) => i + 8), // 8..12
			...Array.from({ length: 5 }, (_, i) => i + 14), // 14..18
			...Array.from({ length: 5 }, (_, i) => i + 20) // 20..24
		];
		const progress = createMockProgress(activeDays);
		const freezeData: StreakFreezeData = {
			usedDates: [freeze1, freeze2, freeze3]
		};

		const stats = computeStreakStats(progress, freezeData);
		// 4th freeze (yesterday) is successfully shielded by refilled freeze!
		expect(stats.freezeDates).toContain(yesterdayIso);
		expect(stats.currentStreak).toBe(24); // 20 active + 4 frozen
		expect(stats.freezeCount).toBe(0); // 4th freeze used, 0 remaining
	});
});
