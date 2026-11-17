export interface WordRecord {
	No: number;
	'Chinese Word'?: string;
	'French Word'?: string;
	Pinyin?: string;
	'Part of Speech': string;
	'English Meaning': string;
	'Example (Chinese + Pinyin)'?: string;
	'Example (French)'?: string;
	/** Other words that also complete this card's example sentence validly. */
	'Acceptable Answers'?: string[];
	customNote?: string;
	category?: string;
}

export interface DictionaryEntry {
	simplified: string;
	traditional?: string;
	pinyin: string;
	pinyinNormalized: string;
	definitions: string[];
	partOfSpeech?: string;
	exampleChinese?: string;
	examplePinyin?: string;
	exampleEnglish?: string;
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
	lastRating?: StudyRating;
}

export interface CustomDeck {
	id: string;
	name: string;
	words: WordRecord[];
	language?: 'chinese' | 'french';
	createdAt?: number;
	isPersonalDictionary?: boolean;
	isArchived?: boolean;
}

export interface SavedWord {
	weekId: string;
	wordNo: number;
	savedAt: number;
}

export interface UserXPData {
	totalXP: number;
	dailyXP: Record<string, number>;
	lastUpdated: number;
	migratedFromProgress?: boolean;
	xpVersion?: number;
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
	streakFreezeData?: StreakFreezeData;
	studyTimeData?: StudyTimeData;
	notebookNotes?: NotebookNote[];
	savedLinks?: SavedLink[];
	deletedNotebookNotes?: Record<string, number>;
	deletedSavedLinks?: Record<string, number>;
}

export type SavedLinkCategory = 'video' | 'article' | 'audio' | 'tool' | 'reference' | 'other';

export interface SavedLinkYouTube {
	videoId: string;
	thumbnailUrl: string;
	isShort?: boolean;
}

export interface SavedLink {
	id: string;
	url: string;
	title: string;
	domain: string;
	category: SavedLinkCategory;
	favicon?: string;
	description?: string;
	notes?: string;
	tags: string[];
	isPinned: boolean;
	isArchived: boolean;
	createdAt: number;
	updatedAt: number;
	youtube?: SavedLinkYouTube;
}

export interface NotebookNote {
	id: string;
	title: string;
	content: string;
	language: 'chinese' | 'french';
	pinyin?: string;
	tags: string[];
	isPinned: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface StreakFreezeData {
	usedDates: string[];
}

export type StudyTimerStatus = 'idle' | 'running' | 'paused';

export interface ActiveStudyTimerState {
	status: StudyTimerStatus;
	elapsedSeconds: number;
	sessionStartedAt: number;
	lastActiveTimestamp: number;
}

export interface StudyTimeData {
	totalSeconds: number;
	dailySeconds: Record<string, number>;
	sessionsCount: number;
	lastSessionDate?: string;
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
	isArchived?: boolean;
	matchedSnippet?: string;
	indexedWords?: Array<{
		word: string;
		pinyin?: string;
		meaning: string;
		acceptableAnswers?: string[];
	}>;
}

export interface StreakStats {
	currentStreak: number;
	longestStreak: number;
	freezeCount: number;
	tierName: string;
	totalReviews: number;
	activeDates: string[];
	freezeDates: string[];
}
