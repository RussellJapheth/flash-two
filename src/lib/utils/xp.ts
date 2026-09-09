import type {
	StudyRating,
	UserXPData,
	XPLeaderboardEntry,
	XPStats,
	WordProgress
} from '$lib/types';
import { getSavedUsername } from './storage';

const XP_STORAGE_KEY = 'flashcards_user_xp';
export const XP_LEADERBOARD_API =
	'https://json-drive.thespot.workers.dev/api/flashcards/xp-leaderboard';

export function isCloudSyncEnabled(): boolean {
	const user = getSavedUsername();
	return Boolean(user && user.trim().length > 0 && user.trim().toLowerCase() !== 'guest');
}

/**
 * Returns base XP awarded for rating a flashcard in a given study mode
 */
export function calculateReviewXP(mode: 'srs' | 'weak' | 'all', rating: StudyRating): number {
	if (mode === 'weak') {
		switch (rating) {
			case 'easy':
				return 15;
			case 'good':
			case 'custom':
				return 12;
			case 'hard':
				return 6;
			case 'again':
			default:
				return 3;
		}
	} else if (mode === 'srs') {
		switch (rating) {
			case 'easy':
				return 12;
			case 'good':
			case 'custom':
				return 10;
			case 'hard':
				return 5;
			case 'again':
			default:
				return 2;
		}
	} else {
		// 'all' cards mode
		switch (rating) {
			case 'easy':
				return 6;
			case 'good':
			case 'custom':
				return 5;
			case 'hard':
				return 3;
			case 'again':
			default:
				return 1;
		}
	}
}

/**
 * Calculates end-of-session completion & accuracy bonus XP
 */
export function calculateSessionBonus(
	mode: 'srs' | 'weak' | 'all',
	totalCards: number,
	correctCount: number
): { completionBonus: number; accuracyBonus: number; totalBonus: number } {
	if (totalCards <= 0) {
		return { completionBonus: 0, accuracyBonus: 0, totalBonus: 0 };
	}

	const accuracy = Math.round((correctCount / totalCards) * 100);
	let completionBonus = 0;
	let accuracyBonus = 0;

	if (mode === 'srs') {
		completionBonus = 25;
		if (totalCards >= 3 && accuracy >= 80) accuracyBonus = 15;
	} else if (mode === 'weak') {
		completionBonus = 20;
		if (totalCards >= 3 && accuracy >= 75) accuracyBonus = 20;
	} else {
		completionBonus = 15;
		if (totalCards >= 5 && accuracy >= 80) accuracyBonus = 10;
	}

	return {
		completionBonus,
		accuracyBonus,
		totalBonus: completionBonus + accuracyBonus
	};
}

/**
 * Returns level progression details for a given total XP amount
 */
export function computeLevelStats(
	totalXP: number,
	dailyXPMap: Record<string, number> = {}
): XPStats {
	const validXP = Math.max(0, Math.floor(totalXP || 0));
	const level = Math.max(1, Math.floor(Math.sqrt(validXP / 50)) + 1);

	const currentLevelXP = Math.pow(level - 1, 2) * 50;
	const nextLevelXP = Math.pow(level, 2) * 50;
	const xpSpan = Math.max(1, nextLevelXP - currentLevelXP);
	const progressInLevelPercent = Math.min(
		100,
		Math.max(0, Math.round(((validXP - currentLevelXP) / xpSpan) * 100))
	);

	let levelTitle = 'Novice Explorer';
	if (level >= 30) levelTitle = 'Grand Polyglot';
	else if (level >= 20) levelTitle = 'Vocabulary Legend';
	else if (level >= 15) levelTitle = 'Language Master';
	else if (level >= 10) levelTitle = 'Memory Sage';
	else if (level >= 7) levelTitle = 'Dedicated Scholar';
	else if (level >= 4) levelTitle = 'Diligent Apprentice';
	else if (level >= 2) levelTitle = 'Active Learner';

	// Compute weekly & monthly sums from dailyXPMap
	const weeklyXP = calculateWindowXP(dailyXPMap, 7);
	const monthlyXP = calculateWindowXP(dailyXPMap, 30);
	const theme = getLevelTheme(level);

	return {
		totalXP: validXP,
		weeklyXP,
		monthlyXP,
		level,
		levelTitle,
		currentLevelXP,
		nextLevelXP,
		progressInLevelPercent,
		theme
	};
}

/**
 * Returns distinct color theme for each level tier
 */
export function getLevelTheme(level: number) {
	if (level >= 30) {
		// Grand Polyglot: Rose / Ruby
		return {
			badgeBg: 'bg-rose-100',
			badgeText: 'text-rose-900',
			badgeBorder: 'border-rose-200',
			accentColor: 'rose'
		};
	} else if (level >= 20) {
		// Vocabulary Legend: Amber / Gold
		return {
			badgeBg: 'bg-amber-100',
			badgeText: 'text-amber-900',
			badgeBorder: 'border-amber-200',
			accentColor: 'amber'
		};
	} else if (level >= 15) {
		// Language Master: Purple / Amethyst
		return {
			badgeBg: 'bg-purple-100',
			badgeText: 'text-purple-900',
			badgeBorder: 'border-purple-200',
			accentColor: 'purple'
		};
	} else if (level >= 10) {
		// Memory Sage: Indigo / Sapphire
		return {
			badgeBg: 'bg-indigo-100',
			badgeText: 'text-indigo-900',
			badgeBorder: 'border-indigo-200',
			accentColor: 'indigo'
		};
	} else if (level >= 7) {
		// Dedicated Scholar: Sky / Cyan
		return {
			badgeBg: 'bg-sky-100',
			badgeText: 'text-sky-900',
			badgeBorder: 'border-sky-200',
			accentColor: 'sky'
		};
	} else if (level >= 4) {
		// Diligent Apprentice: Emerald / Jade
		return {
			badgeBg: 'bg-emerald-100',
			badgeText: 'text-emerald-900',
			badgeBorder: 'border-emerald-200',
			accentColor: 'emerald'
		};
	} else {
		// Novice Explorer / Active Learner: Slate
		return {
			badgeBg: 'bg-slate-100',
			badgeText: 'text-slate-800',
			badgeBorder: 'border-slate-200',
			accentColor: 'slate'
		};
	}
}

/**
 * Sums XP from dailyXP records in the past N days (including today)
 */
export function calculateWindowXP(dailyXPMap: Record<string, number>, days: number): number {
	if (!dailyXPMap || typeof dailyXPMap !== 'object') return 0;
	const today = new Date();
	let sum = 0;

	for (let i = 0; i < days; i++) {
		const targetDate = new Date(today.getTime() - i * 86400000);
		const iso = targetDate.toISOString().split('T')[0];
		if (dailyXPMap[iso]) {
			sum += dailyXPMap[iso];
		}
	}

	return sum;
}

/**
 * Gets local user XP data from localStorage
 */
export function getLocalUserXPData(): UserXPData {
	const defaultData: UserXPData = {
		totalXP: 0,
		dailyXP: {},
		lastUpdated: Date.now(),
		migratedFromProgress: false
	};

	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return defaultData;
	}

	try {
		const raw = localStorage.getItem(XP_STORAGE_KEY);
		if (!raw) return defaultData;
		const parsed = JSON.parse(raw);
		return {
			totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : 0,
			dailyXP: parsed.dailyXP && typeof parsed.dailyXP === 'object' ? parsed.dailyXP : {},
			lastUpdated: parsed.lastUpdated || Date.now(),
			migratedFromProgress: Boolean(parsed.migratedFromProgress)
		};
	} catch (e) {
		console.error('Failed to parse local XP data:', e);
		return defaultData;
	}
}

/**
 * Saves user XP data locally
 */
export function saveLocalUserXPData(data: UserXPData): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(data));
	} catch (e) {
		console.error('Failed to save local XP data:', e);
	}
}

/**
 * Awards XP to user, saves locally, and triggers sync if cloud user
 */
export function addXP(amount: number): UserXPData {
	if (amount <= 0) return getLocalUserXPData();
	const current = getLocalUserXPData();
	const today = new Date().toISOString().split('T')[0];

	const newTotal = (current.totalXP || 0) + amount;
	const currentDaily = current.dailyXP[today] || 0;
	const updatedDaily = {
		...current.dailyXP,
		[today]: currentDaily + amount
	};

	const updated: UserXPData = {
		totalXP: newTotal,
		dailyXP: updatedDaily,
		lastUpdated: Date.now(),
		migratedFromProgress: current.migratedFromProgress ?? true
	};

	saveLocalUserXPData(updated);

	// Synchronize with remote leaderboard if user is authenticated
	if (typeof window !== 'undefined' && navigator.onLine && isCloudSyncEnabled()) {
		syncXPLeaderboard().catch((e) => console.error('Failed background XP leaderboard sync:', e));
	}

	return updated;
}

/**
 * Migrates existing WordProgress history into baseline XP if user has not yet been migrated
 */
export function migrateHistoricalProgressXP(progress: Record<string, WordProgress>): UserXPData {
	const current = getLocalUserXPData();
	if (current.migratedFromProgress && current.totalXP > 0) {
		return current;
	}

	let totalCalculated = 0;
	const dailyXP: Record<string, number> = { ...current.dailyXP };

	for (const p of Object.values(progress)) {
		if (!p) continue;
		const correctXP = (p.correct || 0) * 10;
		const wrongXP = (p.wrong || 0) * 2;
		const itemXP = correctXP + wrongXP;

		if (itemXP > 0) {
			totalCalculated += itemXP;

			if (p.lastReviewed) {
				const iso = new Date(p.lastReviewed).toISOString().split('T')[0];
				dailyXP[iso] = (dailyXP[iso] || 0) + itemXP;
			}
		}
	}

	// Preserve any existing XP if larger than calculated
	const finalTotal = Math.max(current.totalXP, totalCalculated);
	const updated: UserXPData = {
		totalXP: finalTotal,
		dailyXP,
		lastUpdated: Date.now(),
		migratedFromProgress: true
	};

	saveLocalUserXPData(updated);
	return updated;
}

/**
 * Deduplicates and updates leaderboard entries (1 entry per user, keeping highest scores)
 */
export function deduplicateXPLeaderboard(
	entries: XPLeaderboardEntry[],
	localUserEntry?: XPLeaderboardEntry
): XPLeaderboardEntry[] {
	const map = new Map<string, XPLeaderboardEntry>();

	for (const entry of entries) {
		if (!entry || !entry.username) continue;
		const clean = entry.username.trim();
		if (!clean || clean.toLowerCase() === 'guest') continue;

		const key = clean.toLowerCase();
		const existing = map.get(key);
		if (!existing) {
			map.set(key, { ...entry, username: clean });
		} else {
			// Prefer higher allTimeXP, then newer lastActive
			if (
				entry.allTimeXP > existing.allTimeXP ||
				(entry.allTimeXP === existing.allTimeXP && entry.lastActive > existing.lastActive)
			) {
				map.set(key, { ...entry, username: clean });
			}
		}
	}

	if (localUserEntry && localUserEntry.username) {
		const clean = localUserEntry.username.trim();
		if (clean && clean.toLowerCase() !== 'guest') {
			const key = clean.toLowerCase();
			const existing = map.get(key);
			if (!existing) {
				map.set(key, { ...localUserEntry, username: clean });
			} else {
				map.set(key, {
					username: clean,
					allTimeXP: Math.max(existing.allTimeXP, localUserEntry.allTimeXP),
					weeklyXP: Math.max(existing.weeklyXP, localUserEntry.weeklyXP),
					monthlyXP: Math.max(existing.monthlyXP, localUserEntry.monthlyXP),
					level: Math.max(existing.level, localUserEntry.level),
					lastActive: Math.max(existing.lastActive, localUserEntry.lastActive)
				});
			}
		}
	}

	return Array.from(map.values());
}

/**
 * Creates the local user's XP leaderboard entry
 */
export function createLocalUserLeaderboardEntry(): XPLeaderboardEntry | null {
	if (!isCloudSyncEnabled()) return null;
	const user = getSavedUsername().trim();
	if (!user) return null;

	const xpData = getLocalUserXPData();
	const stats = computeLevelStats(xpData.totalXP, xpData.dailyXP);

	return {
		username: user,
		allTimeXP: stats.totalXP,
		weeklyXP: stats.weeklyXP,
		monthlyXP: stats.monthlyXP,
		level: stats.level,
		lastActive: xpData.lastUpdated || Date.now()
	};
}

/**
 * Pushes local user's XP entry to the global XP leaderboard endpoint
 */
export async function syncXPLeaderboard(): Promise<void> {
	if (typeof window === 'undefined' || !navigator.onLine || !isCloudSyncEnabled()) return;
	const localEntry = createLocalUserLeaderboardEntry();
	if (!localEntry) return;

	try {
		let remoteList: XPLeaderboardEntry[] = [];
		const getRes = await fetch(XP_LEADERBOARD_API, {
			headers: { Accept: 'application/json' }
		});

		if (getRes.ok) {
			const data = await getRes.json();
			if (Array.isArray(data)) {
				remoteList = data;
			}
		}

		const merged = deduplicateXPLeaderboard(remoteList, localEntry);

		// Only send PUT if entry changed or is new
		const payload = merged.sort((a, b) => b.allTimeXP - a.allTimeXP).slice(0, 100);

		await fetch(XP_LEADERBOARD_API, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch (err) {
		console.error('Failed to sync to XP leaderboard endpoint:', err);
	}
}

/**
 * Fetches the global XP leaderboard filtered by timeframe
 */
export async function fetchXPLeaderboard(
	timeframe: 'weekly' | 'monthly' | 'all' = 'weekly'
): Promise<{
	entries: (XPLeaderboardEntry & { rank: number })[];
	userRank: number | null;
	error?: string;
}> {
	if (!isCloudSyncEnabled()) {
		return { entries: [], userRank: null, error: 'unauthenticated' };
	}

	const localEntry = createLocalUserLeaderboardEntry();
	let allEntries: XPLeaderboardEntry[] = [];

	if (typeof window !== 'undefined' && navigator.onLine) {
		try {
			const res = await fetch(XP_LEADERBOARD_API, {
				headers: { Accept: 'application/json' }
			});
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) {
					allEntries = data;
				}
			}
		} catch (err) {
			console.error('Error fetching XP leaderboard:', err);
		}
	}

	const merged = deduplicateXPLeaderboard(allEntries, localEntry || undefined);

	// Sort based on chosen timeframe
	const sortKey: keyof XPLeaderboardEntry =
		timeframe === 'weekly' ? 'weeklyXP' : timeframe === 'monthly' ? 'monthlyXP' : 'allTimeXP';

	const sorted = merged
		.sort((a, b) => {
			const valA = (a[sortKey] as number) || 0;
			const valB = (b[sortKey] as number) || 0;
			if (valB !== valA) return valB - valA;
			return b.lastActive - a.lastActive;
		})
		.slice(0, 50);

	const rankedEntries = sorted.map((item, index) => ({
		...item,
		rank: index + 1
	}));

	const currentUsername = getSavedUsername().trim().toLowerCase();
	const userIndex = rankedEntries.findIndex((e) => e.username.toLowerCase() === currentUsername);
	const userRank = userIndex !== -1 ? rankedEntries[userIndex].rank : null;

	return {
		entries: rankedEntries,
		userRank
	};
}
