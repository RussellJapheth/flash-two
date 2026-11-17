import type { WordProgress, StreakFreezeData, StreakStats } from './types.js';

export const FLASHCARDS_STREAK_FREEZES = 'flashcards_streak_freezes';

/**
 * Detects legacy benchmark/test artifact keys (e.g. week-9:1) that are not part
 * of the modern language pack curriculum.
 */
export function isTestOrLegacyArtifactKey(key: string, p?: WordProgress): boolean {
	if (/^week-9:\d+$/i.test(key)) return true;
	if (p && (p.weekId === 'week-9' || (typeof key === 'string' && key.startsWith('week-9:')))) {
		return true;
	}
	return false;
}

export function getOffsetIsoDate(isoDate: string, daysOffset: number): string {
	const [y, m, d] = isoDate.split('-').map(Number);
	const date = new Date(Date.UTC(y, m - 1, d + daysOffset));
	return date.toISOString().split('T')[0];
}

export function getStreakTierName(currentStreak: number): string {
	if (currentStreak >= 30) return 'Tier 2 Habit Hero';
	if (currentStreak >= 14) return 'Flame Master';
	if (currentStreak >= 7) return 'Weekly Warrior';
	if (currentStreak >= 3) return 'Streak Starter';
	return 'Novice Explorer';
}

export function getStreakFreezeData(): StreakFreezeData {
	if (typeof localStorage === 'undefined') {
		return { usedDates: [] };
	}
	try {
		const raw = localStorage.getItem(FLASHCARDS_STREAK_FREEZES);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed?.usedDates)) {
				const validDates: string[] = parsed.usedDates.filter(
					(d: unknown): d is string => typeof d === 'string'
				);
				const uniqueDates: string[] = Array.from(new Set<string>(validDates)).sort();
				return { usedDates: uniqueDates };
			}
		}
	} catch {
		// ignore parsing or storage errors
	}
	return { usedDates: [] };
}

export function saveStreakFreezeData(data: StreakFreezeData): void {
	if (typeof localStorage === 'undefined') return;
	try {
		const validDates: string[] = (data.usedDates || []).filter(
			(d: unknown): d is string => typeof d === 'string'
		);
		const cleanData: StreakFreezeData = {
			usedDates: Array.from(new Set<string>(validDates)).sort()
		};
		localStorage.setItem(FLASHCARDS_STREAK_FREEZES, JSON.stringify(cleanData));
	} catch (e) {
		console.warn('Failed to save streak freeze data:', e);
	}
}

export function computeStreakStats(
	progress: Record<string, WordProgress>,
	customFreezeData?: StreakFreezeData,
	customDailyXP?: Record<string, number>
): StreakStats {
	const datesSet = new Set<string>();
	let totalReviews = 0;

	for (const [key, p] of Object.entries(progress)) {
		if (isTestOrLegacyArtifactKey(key, p)) continue;
		if (p.lastReviewed) {
			const d = new Date(p.lastReviewed);
			const isoDate = d.toISOString().split('T')[0];
			datesSet.add(isoDate);
			const correct =
				(p.correct || 0) >= 10000 ? Math.max(0, (p.correct || 0) - 12288) : p.correct || 0;
			const wrong = (p.wrong || 0) >= 10000 ? Math.max(0, (p.wrong || 0) - 12288) : p.wrong || 0;
			totalReviews += correct + wrong;
		}
	}

	let dailyXP = customDailyXP;
	if (!dailyXP && typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem('flashcards_user_xp');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed?.dailyXP && typeof parsed.dailyXP === 'object') {
					dailyXP = parsed.dailyXP;
				}
			}
		} catch {
			// ignore
		}
	}

	if (dailyXP && typeof dailyXP === 'object') {
		for (const [dateStr, xp] of Object.entries(dailyXP)) {
			if (typeof xp === 'number' && xp > 0) {
				datesSet.add(dateStr);
			}
		}
	}

	const freezeData = customFreezeData || getStreakFreezeData();
	const freezeSet = new Set<string>(freezeData.usedDates || []);
	const newlyFrozenDates: string[] = [];

	const today = new Date().toISOString().split('T')[0];
	const yesterday = getOffsetIsoDate(today, -1);

	// Helper to find available freezes earned in the continuous run ending on 'fromDate'
	// Simulates inventory chronologically: max 3 held, refills +1 freeze per 5 active practice days.
	function getAvailableFreezesEndingOn(fromDate: string): number {
		let start = fromDate;
		while (
			datesSet.has(getOffsetIsoDate(start, -1)) ||
			freezeSet.has(getOffsetIsoDate(start, -1))
		) {
			start = getOffsetIsoDate(start, -1);
		}
		let inventory = 0;
		let activeProgress = 0;
		let curr = start;
		while (curr <= fromDate) {
			if (datesSet.has(curr)) {
				if (inventory < 3) {
					activeProgress++;
					if (activeProgress >= 5) {
						inventory++;
						activeProgress = 0;
					}
				}
			} else if (freezeSet.has(curr)) {
				inventory = Math.max(0, inventory - 1);
				activeProgress = 0;
			}
			curr = getOffsetIsoDate(curr, 1);
		}
		return inventory;
	}

	// Auto-freeze protection for yesterday if today is not active yet:
	const isTodayActiveOrFrozen = datesSet.has(today) || freezeSet.has(today);
	if (!isTodayActiveOrFrozen && !datesSet.has(yesterday) && !freezeSet.has(yesterday)) {
		let scan = getOffsetIsoDate(yesterday, -1);
		let gap = 1;
		while (!datesSet.has(scan) && !freezeSet.has(scan) && gap < 3) {
			gap++;
			scan = getOffsetIsoDate(scan, -1);
		}
		if (datesSet.has(scan) || freezeSet.has(scan)) {
			const available = getAvailableFreezesEndingOn(scan);
			if (gap <= available) {
				let fill = yesterday;
				for (let g = 0; g < gap; g++) {
					freezeSet.add(fill);
					newlyFrozenDates.push(fill);
					fill = getOffsetIsoDate(fill, -1);
				}
			}
		}
	}

	// Count current streak backwards
	let currentStreak = 0;
	if (
		datesSet.has(today) ||
		freezeSet.has(today) ||
		datesSet.has(yesterday) ||
		freezeSet.has(yesterday)
	) {
		let checkDate = datesSet.has(today) || freezeSet.has(today) ? today : yesterday;
		while (true) {
			if (datesSet.has(checkDate) || freezeSet.has(checkDate)) {
				currentStreak++;
				checkDate = getOffsetIsoDate(checkDate, -1);
			} else {
				// Hit a gap! Check if gap can be auto-frozen from prior active run
				let scan = getOffsetIsoDate(checkDate, -1);
				let gap = 1;
				while (!datesSet.has(scan) && !freezeSet.has(scan) && gap < 3) {
					gap++;
					scan = getOffsetIsoDate(scan, -1);
				}
				if ((datesSet.has(scan) || freezeSet.has(scan)) && gap <= 3) {
					const available = getAvailableFreezesEndingOn(scan);
					if (gap <= available) {
						let fill = checkDate;
						for (let g = 0; g < gap; g++) {
							freezeSet.add(fill);
							newlyFrozenDates.push(fill);
							fill = getOffsetIsoDate(fill, -1);
						}
						continue;
					}
				}
				break;
			}
		}
	}

	// Persist newly auto-frozen dates locally if running with standard local storage
	if (!customFreezeData && typeof localStorage !== 'undefined' && newlyFrozenDates.length > 0) {
		try {
			saveStreakFreezeData({ usedDates: Array.from(freezeSet).sort() });
		} catch {
			// ignore local storage errors
		}
	}

	// Combined valid days (practiced days + frozen days)
	const combinedDatesSet = new Set<string>([...datesSet, ...freezeSet]);

	// Longest streak calculation
	let longestStreak = 0;
	let running = 0;
	const ascendingDates = Array.from(combinedDatesSet).sort();
	for (let i = 0; i < ascendingDates.length; i++) {
		if (i === 0) {
			running = 1;
		} else {
			const prev = new Date(ascendingDates[i - 1]).getTime();
			const curr = new Date(ascendingDates[i]).getTime();
			const diffDays = Math.round((curr - prev) / 86400000);
			if (diffDays === 1) {
				running++;
			} else {
				running = 1;
			}
		}
		if (running > longestStreak) {
			longestStreak = running;
		}
	}

	if (currentStreak > longestStreak) longestStreak = currentStreak;

	// Calculate earned streak freezes:
	// Starts at 0, earns/refills 1 more every 5 consecutive active days (max 3 streak freezes).
	let freezeCount = 0;
	if (currentStreak > 0) {
		const streakEndDate = datesSet.has(today) || freezeSet.has(today) ? today : yesterday;
		freezeCount = getAvailableFreezesEndingOn(streakEndDate);
	}

	const tierName = getStreakTierName(currentStreak);

	return {
		currentStreak,
		longestStreak,
		freezeCount,
		tierName,
		totalReviews,
		activeDates: Array.from(datesSet).sort(),
		freezeDates: Array.from(freezeSet).sort()
	};
}
