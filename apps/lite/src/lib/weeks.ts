import type { WordRecord } from '@flash/shared';

export const LITE_START_TIME_KEY = 'flashcards_lite_start_time';
export const LITE_MANUAL_MAX_WEEK_KEY = 'flashcards_lite_max_unlocked_week';

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
 * Uses UTC date calculations to ensure timezone-consistent calendar weeks.
 */
export function getCalendarMonday(date: Date): Date {
	const d = new Date(date.getTime());
	const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
	const diff = day === 0 ? -6 : 1 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

export function getStudyStartDate(fallbackNow = new Date()): Date {
	const stored = getStorageItem(LITE_START_TIME_KEY);
	if (stored) {
		const parsed = parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			return new Date(parsed);
		}
	}
	const nowMs = fallbackNow.getTime();
	setStorageItem(LITE_START_TIME_KEY, String(nowMs));
	return fallbackNow;
}

export function setStudyStartDate(date: Date): void {
	setStorageItem(LITE_START_TIME_KEY, String(date.getTime()));
}

export function getManualMaxWeek(): number {
	const stored = getStorageItem(LITE_MANUAL_MAX_WEEK_KEY);
	if (stored) {
		const parsed = parseInt(stored, 10);
		if (!Number.isNaN(parsed) && parsed >= 1) return parsed;
	}
	return 1;
}

export function setManualMaxWeek(weekNo: number): void {
	setStorageItem(LITE_MANUAL_MAX_WEEK_KEY, String(Math.max(1, weekNo)));
}

/**
 * Computes the current active calendar week number based on calendar Mondays.
 * Week 1 begins on the Monday of the start date week.
 */
export function getCurrentWeekNumber(now = new Date(), startDate?: Date): number {
	const start = startDate ?? getStudyStartDate(now);
	const startMonday = getCalendarMonday(start);
	const currentMonday = getCalendarMonday(now);

	if (currentMonday.getTime() <= startMonday.getTime()) {
		return 1;
	}

	const diffMs = currentMonday.getTime() - startMonday.getTime();
	const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
	return Math.max(1, diffWeeks + 1);
}

export function getCurrentWeekLabel(now = new Date(), startDate?: Date): string {
	return `Week ${getCurrentWeekNumber(now, startDate)}`;
}

/**
 * Extracts max week number found in words array (e.g. "Week 4" -> 4).
 */
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
 * Returns all unlocked week labels in order: ['Week 1', 'Week 2', ..., 'Week N'],
 * plus any non-week custom categories found in words.
 */
export function getUnlockedWeeks(
	words: WordRecord[] = [],
	now = new Date(),
	startDate?: Date
): string[] {
	const currentWeek = getCurrentWeekNumber(now, startDate);
	const manualMax = getManualMaxWeek();
	const wordsMax = getMaxWeekFromWords(words);
	const maxWeek = Math.max(currentWeek, manualMax, wordsMax, 1);

	const weeks: string[] = [];
	for (let i = 1; i <= maxWeek; i++) {
		weeks.push(`Week ${i}`);
	}

	// Also append other non-week custom categories if any exist
	const nonWeekCats = new Set<string>();
	for (const w of words) {
		const cat = (w.category || '').trim();
		if (!cat) continue;
		if (/^Week\s+\d+$/i.test(cat)) continue;
		if (cat.toLowerCase() === 'all words' || cat.toLowerCase() === 'all weeks') continue;
		nonWeekCats.add(cat);
	}

	return [...weeks, ...Array.from(nonWeekCats).sort()];
}

/**
 * Manually unlocks the next week (e.g. if currently at Week 2, unlocks Week 3).
 */
export function unlockNextWeek(
	words: WordRecord[] = [],
	now = new Date(),
	startDate?: Date
): string {
	const currentList = getUnlockedWeeks(words, now, startDate);
	const weekNumbers = currentList
		.map((w) => {
			const m = w.match(/^Week\s+(\d+)$/i);
			return m ? parseInt(m[1], 10) : 0;
		})
		.filter((n) => n > 0);

	const max = Math.max(...weekNumbers, 1);
	const next = max + 1;
	setManualMaxWeek(next);
	return `Week ${next}`;
}
