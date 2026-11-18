import type { WordRecord } from '@flash/shared';

export const LITE_START_TIME_KEY = 'flashcards_lite_start_time';
export const LITE_MANUAL_MAX_WEEK_KEY = 'flashcards_lite_max_unlocked_week';

export const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
] as const;

const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			return window.localStorage.getItem(key);
		}
	} catch {
		// fall through to memoryStore
	}
	return memoryStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
	memoryStore.set(key, value);
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.setItem(key, value);
		}
	} catch {
		// ignore
	}
}

export function clearWeeksMemoryStore(): void {
	memoryStore.clear();
	try {
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.removeItem(LITE_START_TIME_KEY);
			window.localStorage.removeItem(LITE_MANUAL_MAX_WEEK_KEY);
		}
	} catch {
		// ignore
	}
}

/**
 * Returns the calendar Monday at 00:00:00.000 UTC of the week containing `date`.
 * (Kept for backward compatibility).
 */
export function getCalendarMonday(date: Date): Date {
	const d = new Date(date.getTime());
	const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
	const diff = day === 0 ? -6 : 1 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

/**
 * Returns the calendar Sunday at 00:00:00.000 UTC of the Monday–Sunday week containing `date`.
 * Uses UTC date calculations to ensure timezone-consistent calendar weeks.
 */
export function getCalendarSunday(date: Date): Date {
	const d = new Date(date.getTime());
	const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
	const diff = day === 0 ? 0 : 7 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

export function addWeeks(date: Date, count: number): Date {
	const d = new Date(date.getTime());
	d.setUTCDate(d.getUTCDate() + count * 7);
	return d;
}

/**
 * Formats a Date as "Sun 22, Nov 2026" based on the Sunday of that week in UTC.
 */
export function formatWeekSundayLabel(date: Date): string {
	const sunday = getCalendarSunday(date);
	const day = sunday.getUTCDate();
	const month = MONTH_NAMES[sunday.getUTCMonth()];
	const year = sunday.getUTCFullYear();
	return `Sun ${day}, ${month} ${year}`;
}

/**
 * Parses a "Sun 22, Nov 2026" label back into a UTC Date object at 00:00:00.000.
 * Returns null if string does not match the Sunday date pattern.
 */
export function parseWeekSundayLabel(label: string): Date | null {
	const match = label.trim().match(/^Sun\s+(\d{1,2}),\s+([A-Za-z]{3})\s+(\d{4})$/i);
	if (!match) return null;
	const day = parseInt(match[1], 10);
	const monthStr = match[2].toLowerCase();
	const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr);
	const year = parseInt(match[3], 10);
	if (monthIdx === -1 || Number.isNaN(day) || Number.isNaN(year)) return null;
	return new Date(Date.UTC(year, monthIdx, day, 0, 0, 0, 0));
}

/**
 * Checks whether a category string is a Sunday date format (e.g. "Sun 22, Nov 2026").
 */
export function isWeekSundayLabel(label: string): boolean {
	return parseWeekSundayLabel(label) !== null;
}

export function getStudyStartDate(fallbackNow = new Date()): Date {
	const stored = getStorageItem(LITE_START_TIME_KEY);
	if (stored) {
		const parsed = parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			return new Date(parsed);
		}
	}
	const sunday = getCalendarSunday(fallbackNow);
	const nowMs = sunday.getTime();
	setStorageItem(LITE_START_TIME_KEY, String(nowMs));
	return sunday;
}

export function setStudyStartDate(date: Date): void {
	const sunday = getCalendarSunday(date);
	setStorageItem(LITE_START_TIME_KEY, String(sunday.getTime()));
}

export function getManualMaxSunday(startSunday: Date): Date {
	const stored = getStorageItem(LITE_MANUAL_MAX_WEEK_KEY);
	if (stored) {
		const parsed = parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			// If stored as timestamp
			if (parsed > 100000000000) {
				return getCalendarSunday(new Date(parsed));
			}
			// Legacy numeric week offset
			return addWeeks(startSunday, Math.max(0, parsed - 1));
		}
	}
	return startSunday;
}

export function setManualMaxSunday(date: Date): void {
	const sunday = getCalendarSunday(date);
	setStorageItem(LITE_MANUAL_MAX_WEEK_KEY, String(sunday.getTime()));
}

// Backward compatibility helper
export function getManualMaxWeek(): number {
	const stored = getStorageItem(LITE_MANUAL_MAX_WEEK_KEY);
	if (stored) {
		const parsed = parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed >= 1 && parsed < 100000) return parsed;
	}
	return 1;
}

// Backward compatibility helper
export function setManualMaxWeek(weekNo: number): void {
	const start = getStudyStartDate();
	const target = addWeeks(getCalendarSunday(start), Math.max(0, weekNo - 1));
	setManualMaxSunday(target);
}

/**
 * Legacy week number calculation relative to study start date.
 */
export function getCurrentWeekNumber(now = new Date(), startDate?: Date): number {
	const start = startDate ?? getStudyStartDate(now);
	const startSunday = getCalendarSunday(start);
	const currentSunday = getCalendarSunday(now);

	if (currentSunday.getTime() <= startSunday.getTime()) {
		return 1;
	}

	const diffMs = currentSunday.getTime() - startSunday.getTime();
	const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
	return Math.max(1, diffWeeks + 1);
}

/**
 * Returns formatted label for current active calendar week: e.g. "Sun 22, Nov 2026".
 */
export function getCurrentWeekLabel(now = new Date()): string {
	return formatWeekSundayLabel(now);
}

/**
 * Extracts the maximum Sunday date from words array.
 */
export function getMaxSundayFromWords(
	words: WordRecord[],
	fallbackBase = getCalendarSunday(new Date())
): Date {
	let max = fallbackBase;
	for (const w of words) {
		const cat = (w.category || '').trim();
		const parsed = parseWeekSundayLabel(cat);
		if (parsed && parsed.getTime() > max.getTime()) {
			max = parsed;
		} else {
			const match = cat.match(/^Week\s+(\d+)$/i);
			if (match) {
				const num = parseInt(match[1], 10);
				const candidate = addWeeks(fallbackBase, Math.max(0, num - 1));
				if (candidate.getTime() > max.getTime()) {
					max = candidate;
				}
			}
		}
	}
	return max;
}

export function getMaxWeekFromWords(words: WordRecord[]): number {
	let max = 1;
	for (const w of words) {
		const cat = (w.category || '').trim();
		const match = cat.match(/^Week\s+(\d+)$/i);
		if (match) {
			const num = parseInt(match[1], 10);
			if (num > max) max = num;
		}
	}
	return max;
}

/**
 * Migrates a legacy week category string ("Week 1", "Week 2", etc.)
 * to its corresponding Sunday date label ("Sun 22, Nov 2026", etc.).
 * Non-week categories and empty/unassigned categories are preserved as-is.
 */
export function migrateWeekCategory(
	category?: string,
	baseSunday = getCalendarSunday(new Date())
): string | undefined {
	if (!category) return category;
	const trimmed = category.trim();
	if (!trimmed || trimmed.toLowerCase() === 'unassigned') {
		return category;
	}
	const match = trimmed.match(/^Week\s+(\d+)$/i);
	if (match) {
		const num = parseInt(match[1], 10);
		const targetSunday = addWeeks(baseSunday, Math.max(0, num - 1));
		return formatWeekSundayLabel(targetSunday);
	}
	return category;
}

/**
 * Returns all unlocked week labels in order: ['Sun 22, Nov 2026', 'Sun 29, Nov 2026', ...],
 * plus any non-week custom categories found in words.
 */
export function getUnlockedWeeks(
	words: WordRecord[] = [],
	now = new Date(),
	startDate?: Date
): string[] {
	const currentSunday = getCalendarSunday(now);
	const start = startDate ? getCalendarSunday(startDate) : currentSunday;
	const manualMaxSunday = getManualMaxSunday(start);
	const wordsMaxSunday = getMaxSundayFromWords(words, currentSunday);

	const maxTime = Math.max(
		currentSunday.getTime(),
		manualMaxSunday.getTime(),
		wordsMaxSunday.getTime()
	);

	const weeks: string[] = [];
	let cursor = new Date(start.getTime());
	while (cursor.getTime() <= maxTime) {
		weeks.push(formatWeekSundayLabel(cursor));
		cursor = addWeeks(cursor, 1);
	}

	// Append other non-week custom categories if any exist
	const nonWeekCats = new Set<string>();
	let hasUnassigned = false;
	for (const w of words) {
		const cat = (w.category || '').trim();
		if (!cat || cat.toLowerCase() === 'unassigned') {
			hasUnassigned = true;
			continue;
		}
		if (isWeekSundayLabel(cat)) continue;
		if (/^Week\s+\d+$/i.test(cat)) continue;
		if (cat.toLowerCase() === 'all words' || cat.toLowerCase() === 'all weeks') continue;
		nonWeekCats.add(cat);
	}

	const result = [...weeks, ...Array.from(nonWeekCats).sort()];
	if (hasUnassigned) {
		result.push('Unassigned');
	}
	return result;
}

/**
 * Manually unlocks the next week (7 days after the latest unlocked Sunday).
 */
export function unlockNextWeek(
	words: WordRecord[] = [],
	now = new Date(),
	startDate?: Date
): string {
	const currentList = getUnlockedWeeks(words, now, startDate);
	const sundayDates = currentList
		.map((w) => parseWeekSundayLabel(w))
		.filter((d): d is Date => d !== null);

	const currentSunday = getCalendarSunday(now);
	const latest =
		sundayDates.length > 0
			? new Date(Math.max(...sundayDates.map((d) => d.getTime())))
			: currentSunday;

	const nextSunday = addWeeks(latest, 1);
	setManualMaxSunday(nextSunday);
	return formatWeekSundayLabel(nextSunday);
}

/**
 * Sorts week categories:
 * - Sunday date labels chronologically
 * - Legacy Week N labels numerically
 * - Custom category names alphabetically
 * - 'Unassigned' always at the end
 */
export function sortWeekLabels(labels: string[]): string[] {
	return [...labels].sort((a, b) => {
		const dateA = parseWeekSundayLabel(a);
		const dateB = parseWeekSundayLabel(b);
		if (dateA && dateB) {
			return dateA.getTime() - dateB.getTime();
		}
		if (dateA) return -1;
		if (dateB) return 1;

		const matchA = a.match(/^Week\s+(\d+)$/i);
		const matchB = b.match(/^Week\s+(\d+)$/i);
		if (matchA && matchB) {
			return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
		}
		if (matchA) return -1;
		if (matchB) return 1;

		if (a === 'Unassigned') return 1;
		if (b === 'Unassigned') return -1;
		return a.localeCompare(b);
	});
}
