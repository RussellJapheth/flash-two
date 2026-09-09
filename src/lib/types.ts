export interface WordRecord {
	No: number;
	'Chinese Word'?: string;
	'French Word'?: string;
	Pinyin?: string;
	'Part of Speech': string;
	'English Meaning': string;
	'Example (Chinese + Pinyin)'?: string;
	'Example (French)'?: string;
}

export interface WordProgress {
	weekId: string;
	wordNo: number;
	correct: number;
	wrong: number;
	lastReviewed: number;
	dueDate?: number;
	interval?: number;
	easeFactor?: number;
	reps?: number;
	lapses?: number;
}

export interface CustomDeck {
	id: string;
	name: string;
	words: WordRecord[];
	language?: 'chinese' | 'french';
	createdAt?: number;
}

export interface SavedWord {
	weekId: string;
	wordNo: number;
	savedAt: number;
}

export interface UserXPData {
	totalXP: number;
	dailyXP: Record<string, number>; // 'YYYY-MM-DD': xpEarned
	lastUpdated: number;
	migratedFromProgress?: boolean;
}

export interface XPLeaderboardEntry {
	username: string;
	allTimeXP: number;
	weeklyXP: number;
	monthlyXP: number;
	level: number;
	lastActive: number;
}

export interface LevelTheme {
	badgeBg: string;
	badgeText: string;
	badgeBorder: string;
	accentColor: string;
}

export interface XPStats {
	totalXP: number;
	weeklyXP: number;
	monthlyXP: number;
	level: number;
	levelTitle: string;
	currentLevelXP: number;
	nextLevelXP: number;
	progressInLevelPercent: number;
	theme: LevelTheme;
}

export interface AppBackup {
	version: number;
	exportedAt?: number;
	timestamp?: number;
	progress: Record<string, WordProgress>;
	customDecks?: CustomDeck[];
	savedWords?: SavedWord[];
	language?: 'chinese' | 'french';
	username?: string;
	xpData?: UserXPData;
	leaderboardDisabled?: boolean;
}

export type StudyRating = 'again' | 'hard' | 'good' | 'easy' | 'custom';

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'ok' | 'error';

export interface DeckSummary {
	id: string;
	title: string;
	language: 'chinese' | 'french';
	totalCards: number;
	masteredCards: number;
	learningCards: number;
	dueCards: number;
	accuracy: number;
	isCustom: boolean;
}

export interface StreakStats {
	currentStreak: number;
	longestStreak: number;
	freezeCount: number;
	tierName: string;
	totalReviews: number;
	activeDates: string[]; // ISO 'YYYY-MM-DD'
}
