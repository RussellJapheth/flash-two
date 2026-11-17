import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
	computeStreakStats,
	getStreakFreezeData,
	saveStreakFreezeData,
	getStreakTierName,
	getOffsetIsoDate
} from './streak.js';
import type { WordProgress } from './types.js';

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

describe('packages/shared streak rules', () => {
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
			progress[`card:${index + 1}`] = {
				weekId: 'custom',
				wordNo: index + 1,
				correct: 1,
				wrong: 0,
				lastReviewed: date.getTime()
			};
		});
		return progress;
	}

	it('computes empty progress correctly', () => {
		const stats = computeStreakStats({}, { usedDates: [] });
		expect(stats.currentStreak).toBe(0);
		expect(stats.freezeCount).toBe(0);
		expect(stats.tierName).toBe('Novice Explorer');
	});

	it('computes 5-day streak and earns 1 freeze', () => {
		const progress = createMockProgress([0, 1, 2, 3, 4]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(5);
		expect(stats.freezeCount).toBe(1);
		expect(stats.tierName).toBe('Streak Starter');
	});

	it('bridges yesterday when auto-freeze is available', () => {
		// Active today and 2..6 days ago (5 active days prior)
		const progress = createMockProgress([0, 2, 3, 4, 5, 6]);
		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(7);
		expect(stats.freezeCount).toBe(0);
	});

	it('persists and retrieves streak freeze data', () => {
		saveStreakFreezeData({ usedDates: ['2026-05-01', '2026-05-02'] });
		const loaded = getStreakFreezeData();
		expect(loaded.usedDates).toEqual(['2026-05-01', '2026-05-02']);
	});

	it('determines tiers correctly', () => {
		expect(getStreakTierName(0)).toBe('Novice Explorer');
		expect(getStreakTierName(3)).toBe('Streak Starter');
		expect(getStreakTierName(7)).toBe('Weekly Warrior');
		expect(getStreakTierName(14)).toBe('Flame Master');
		expect(getStreakTierName(30)).toBe('Tier 2 Habit Hero');
	});

	it('calculates offset ISO date accurately', () => {
		expect(getOffsetIsoDate('2026-03-01', -1)).toBe('2026-02-28');
		expect(getOffsetIsoDate('2026-03-01', 1)).toBe('2026-03-02');
	});
});
