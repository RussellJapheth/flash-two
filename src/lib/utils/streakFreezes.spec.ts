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
});
