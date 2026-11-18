import { describe, it, expect, beforeEach } from 'vitest';
import {
	getCalendarSunday,
	formatWeekSundayLabel,
	parseWeekSundayLabel,
	getCurrentWeekLabel,
	getUnlockedWeeks,
	unlockNextWeek,
	migrateWeekCategory,
	sortWeekLabels,
	setManualMaxSunday,
	clearWeeksMemoryStore
} from './weeks';
import type { WordRecord } from '@flash/shared';

describe('weeks utility', () => {
	beforeEach(() => {
		clearWeeksMemoryStore();
	});

	it('computes calendar Sunday for various days of the week in UTC', () => {
		// 2026-11-18 is Wednesday -> Sunday is 2026-11-22
		const wed = new Date('2026-11-18T10:00:00Z');
		const sundayFromWed = getCalendarSunday(wed);
		expect(sundayFromWed.getUTCDay()).toBe(0);
		expect(sundayFromWed.toISOString().slice(0, 10)).toBe('2026-11-22');

		// 2026-11-22 is Sunday -> Sunday is 2026-11-22
		const sun = new Date('2026-11-22T23:59:59Z');
		const sundayFromSun = getCalendarSunday(sun);
		expect(sundayFromSun.getUTCDay()).toBe(0);
		expect(sundayFromSun.toISOString().slice(0, 10)).toBe('2026-11-22');

		// 2026-11-23 is Monday -> Sunday is 2026-11-29
		const mon = new Date('2026-11-23T00:01:00Z');
		const sundayFromMon = getCalendarSunday(mon);
		expect(sundayFromMon.getUTCDay()).toBe(0);
		expect(sundayFromMon.toISOString().slice(0, 10)).toBe('2026-11-29');

		// 2026-11-16 is previous Monday -> Sunday is 2026-11-22
		const prevMon = new Date('2026-11-16T08:00:00Z');
		expect(getCalendarSunday(prevMon).toISOString().slice(0, 10)).toBe('2026-11-22');
	});

	it('formats and parses Sunday week labels accurately', () => {
		const date = new Date('2026-11-22T00:00:00Z');
		const label = formatWeekSundayLabel(date);
		expect(label).toBe('Sun 22, Nov 2026');

		const parsed = parseWeekSundayLabel(label);
		expect(parsed).not.toBeNull();
		expect(parsed?.toISOString()).toBe('2026-11-22T00:00:00.000Z');
	});

	it('returns current week Sunday label', () => {
		// Wednesday Nov 18, 2026
		const wed = new Date('2026-11-18T12:00:00Z');
		expect(getCurrentWeekLabel(wed)).toBe('Sun 22, Nov 2026');

		// Rollover to next Monday Nov 23, 2026
		const nextMon = new Date('2026-11-23T01:00:00Z');
		expect(getCurrentWeekLabel(nextMon)).toBe('Sun 29, Nov 2026');
	});

	it('migrates legacy Week N categories to Sunday dates', () => {
		const baseSunday = new Date('2026-11-22T00:00:00Z');

		expect(migrateWeekCategory('Week 1', baseSunday)).toBe('Sun 22, Nov 2026');
		expect(migrateWeekCategory('Week 2', baseSunday)).toBe('Sun 29, Nov 2026');
		expect(migrateWeekCategory('Week 3', baseSunday)).toBe('Sun 6, Dec 2026');

		// Preserves non-numeric categories
		expect(migrateWeekCategory('Unassigned', baseSunday)).toBe('Unassigned');
		expect(migrateWeekCategory('Custom Topic', baseSunday)).toBe('Custom Topic');
		expect(migrateWeekCategory('', baseSunday)).toBe('');
		expect(migrateWeekCategory(undefined, baseSunday)).toBeUndefined();
	});

	it('returns all unlocked weeks sequentially by Sunday date', () => {
		const startDate = new Date('2026-11-22T00:00:00Z');
		const now = new Date('2026-12-06T12:00:00Z'); // 2 weeks later
		const weeks = getUnlockedWeeks([], now, startDate);
		expect(weeks).toEqual(['Sun 22, Nov 2026', 'Sun 29, Nov 2026', 'Sun 6, Dec 2026']);
	});

	it('includes weeks from existing words even if ahead of calendar', () => {
		const mockWords: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '你好',
				Pinyin: 'nǐ hǎo',
				'Part of Speech': '',
				'English Meaning': 'hello',
				category: 'Sun 13, Dec 2026'
			}
		];
		const unlocked = getUnlockedWeeks(
			mockWords,
			new Date('2026-11-18T10:00:00Z'),
			new Date('2026-11-22T00:00:00Z')
		);
		expect(unlocked).toEqual([
			'Sun 22, Nov 2026',
			'Sun 29, Nov 2026',
			'Sun 6, Dec 2026',
			'Sun 13, Dec 2026'
		]);
	});

	it('allows unlocking next week manually', () => {
		const baseSunday = new Date('2026-11-22T00:00:00Z');
		setManualMaxSunday(new Date('2026-11-29T00:00:00Z'));
		const next = unlockNextWeek([], baseSunday, baseSunday);
		expect(next).toBe('Sun 6, Dec 2026');
	});

	it('appends Unassigned category when words without category exist', () => {
		const mockWords: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '你好',
				Pinyin: 'nǐ hǎo',
				'Part of Speech': '',
				'English Meaning': 'hello'
				// no category
			},
			{
				No: 2,
				'Chinese Word': '再见',
				Pinyin: 'zàijiàn',
				'Part of Speech': '',
				'English Meaning': 'goodbye',
				category: 'Sun 22, Nov 2026'
			}
		];
		const unlocked = getUnlockedWeeks(
			mockWords,
			new Date('2026-11-18T10:00:00Z'),
			new Date('2026-11-22T00:00:00Z')
		);
		expect(unlocked).toContain('Unassigned');
	});

	it('sorts week labels chronologically with custom and Unassigned at end', () => {
		const unsorted = [
			'Unassigned',
			'Sun 6, Dec 2026',
			'Z-Custom',
			'Sun 22, Nov 2026',
			'A-Custom',
			'Sun 29, Nov 2026'
		];
		const sorted = sortWeekLabels(unsorted);
		expect(sorted).toEqual([
			'Sun 22, Nov 2026',
			'Sun 29, Nov 2026',
			'Sun 6, Dec 2026',
			'A-Custom',
			'Z-Custom',
			'Unassigned'
		]);
	});
});
