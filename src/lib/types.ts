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

export interface AppBackup {
	version: number;
	exportedAt?: number;
	timestamp?: number;
	progress: Record<string, WordProgress>;
	customDecks?: CustomDeck[];
	savedWords?: SavedWord[];
	language?: 'chinese' | 'french';
	username?: string;
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
