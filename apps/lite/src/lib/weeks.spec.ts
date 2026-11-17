import { describe, it, expect, beforeEach } from 'vitest';
import {
	getCalendarMonday,
	getCurrentWeekNumber,
	getUnlockedWeeks,
	getMaxWeekFromWords,
	unlockNextWeek,
	setManualMaxWeek,
	clearWeeksMemoryStore
} from './weeks';
import type { WordRecord } from '@flash/shared';

describe('weeks utility', () => {
	beforeEach(() => {
		clearWeeksMemoryStore();
	});

	it('computes calendar Monday for various days of the week in UTC', () => {
		// 2026-11-18 is Wednesday -> Monday was 2026-11-16
		const wed = new Date('2026-11-18T10:00:00Z');
		const mondayFromWed = getCalendarMonday(wed);
		expect(mondayFromWed.getUTCDay()).toBe(1);
		expect(mondayFromWed.toISOString().slice(0, 10)).toBe('2026-11-16');

		// 2026-11-22 is Sunday -> Monday was 2026-11-16
		const sun = new Date('2026-11-22T23:59:59Z');
		const mondayFromSun = getCalendarMonday(sun);
		expect(mondayFromSun.getUTCDay()).toBe(1);
		expect(mondayFromSun.toISOString().slice(0, 10)).toBe('2026-11-16');

		// 2026-11-23 is next Monday -> Monday is 2026-11-23
		const mon = new Date('2026-11-23T00:01:00Z');
		const mondayFromMon = getCalendarMonday(mon);
		expect(mondayFromMon.getUTCDay()).toBe(1);
		expect(mondayFromMon.toISOString().slice(0, 10)).toBe('2026-11-23');
	});

	it('advances week on calendar Monday', () => {
		// User starts on Wednesday 2026-11-18
		const startDate = new Date('2026-11-18T10:00:00Z');

		// Same week Thursday: Week 1
		expect(getCurrentWeekNumber(new Date('2026-11-19T10:00:00Z'), startDate)).toBe(1);
		// Same week Sunday: Week 1
		expect(getCurrentWeekNumber(new Date('2026-11-22T23:59:00Z'), startDate)).toBe(1);
		// Next Monday: Week 2 automatically!
		expect(getCurrentWeekNumber(new Date('2026-11-23T00:01:00Z'), startDate)).toBe(2);
		// Two Mondays later: Week 3 automatically!
		expect(getCurrentWeekNumber(new Date('2026-11-30T00:01:00Z'), startDate)).toBe(3);
	});

	it('returns all unlocked weeks sequentially', () => {
		const startDate = new Date('2026-11-18T10:00:00Z');
		const now = new Date('2026-11-30T12:00:00Z'); // Week 3
		const weeks = getUnlockedWeeks([], now, startDate);
		expect(weeks).toEqual(['Week 1', 'Week 2', 'Week 3']);
	});

	it('includes weeks from existing words even if ahead of calendar', () => {
		const mockWords: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '你好',
				Pinyin: 'nǐ hǎo',
				'Part of Speech': '',
				'English Meaning': 'hello',
				category: 'Week 4'
			}
		];
		expect(getMaxWeekFromWords(mockWords)).toBe(4);
		const unlocked = getUnlockedWeeks(
			mockWords,
			new Date('2026-11-18T10:00:00Z'),
			new Date('2026-11-18T10:00:00Z')
		);
		expect(unlocked).toEqual(['Week 1', 'Week 2', 'Week 3', 'Week 4']);
	});

	it('allows unlocking next week manually', () => {
		setManualMaxWeek(2);
		const next = unlockNextWeek(
			[],
			new Date('2026-11-18T10:00:00Z'),
			new Date('2026-11-18T10:00:00Z')
		);
		expect(next).toBe('Week 3');
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
				category: 'Week 1'
			}
		];
		const unlocked = getUnlockedWeeks(
			mockWords,
			new Date('2026-11-18T10:00:00Z'),
			new Date('2026-11-18T10:00:00Z')
		);
		expect(unlocked).toContain('Unassigned');
	});
});
