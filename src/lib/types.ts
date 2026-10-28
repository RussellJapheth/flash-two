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
	dailyXP: Record<string, number>; // 'YYYY-MM-DD': xpEarned
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
	usedDates: string[]; // ISO 'YYYY-MM-DD' when streak freeze was consumed
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
	dailySeconds: Record<string, number>; // 'YYYY-MM-DD': seconds
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
	activeDates: string[]; // ISO 'YYYY-MM-DD'
	freezeDates: string[]; // ISO 'YYYY-MM-DD'
}

export type StoryDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StoryCharacter {
	id: string;
	name: string;
	avatarUrl: string;
	role: string;
}

export interface StoryChoice {
	id: string;
	text: string;
	pinyin?: string;
	translation?: string;
	nextNodeId: string;
	isOptimal?: boolean;
	feedback?: string;
	xpReward?: number;
}

export interface StoryNode {
	id: string;
	speakerId: string; // 'player' | characterId | 'narrator'
	text: string;
	pinyin?: string;
	translation?: string;
	audioText?: string;
	type: 'dialogue' | 'choice' | 'speech' | 'cloze';
	choices?: StoryChoice[];
	expectedSpeech?: {
		target: string;
		pinyin?: string;
		keywords?: string[];
		fallbackChoices: StoryChoice[];
	};
	cloze?: {
		sentence: string; // e.g. "我想吃一碗 {blank}。"
		options: string[];
		optionPinyins?: Record<string, string>;
		optionTranslations?: Record<string, string>;
		correctOption: string;
		pinyin?: string;
		translation?: string;
		nextNodeId: string;
	};
	nextNodeId?: string;
}

export interface Story {
	id: string;
	title: string;
	subtitle: string;
	language: 'chinese' | 'french';
	difficulty: StoryDifficulty;
	durationMinutes: number;
	requiresVoice?: boolean;
	baseXP: number;
	bgImageUrl: string;
	coverImageUrl: string;
	characters: Record<string, StoryCharacter>;
	startNodeId: string;
	nodes: Record<string, StoryNode>;
	summaryVocabulary?: StoryVocabularyItem[];
}

export interface StoryVocabularyItem {
	word: string;
	pinyin?: string;
	meaning: string;
	contextSentence?: string;
	frequency?: number;
}

export interface StoryCompletionRecord {
	storyId: string;
	completedAt: number;
	score: number; // 0-100
	stars: number; // 1-3
	timesPlayed: number;
	xpEarned: number;
}

export interface TextbookDialogueTurn {
	speaker: string;
	avatarEmoji: string;
	hanzi: string;
	pinyin: string;
	english: string;
	audioText?: string;
}

export interface TextbookSpotlightWord {
	hanzi: string;
	pinyin: string;
	english: string;
	mnemonic: string;
	toneNumber?: 1 | 2 | 3 | 4 | 5;
}

export interface TextbookPatternSlot {
	label: string;
	example: string;
	pinyin?: string;
}

export interface TextbookPatternBox {
	title: string;
	formula: string;
	slots: TextbookPatternSlot[];
	notes: string;
}

export type MiniCheckType = 'picture-match' | 'word-reorder';

export interface PictureMatchItem {
	hanzi: string;
	pinyin: string;
	english: string;
	imageEmoji: string;
}

export interface WordReorderItem {
	sentenceHanzi: string;
	sentencePinyin: string;
	sentenceEnglish: string;
	shuffledWords: string[];
	wordPinyinMap?: Record<string, string>;
}

export interface TextbookMiniCheck {
	type: MiniCheckType;
	prompt: string;
	pictureMatch?: {
		pairs: PictureMatchItem[];
	};
	wordReorder?: WordReorderItem;
}

export interface TextbookLesson {
	id: string;
	guideId: string;
	title: string;
	subtitle: string;
	unitBadge: string;
	characterHost: {
		name: string;
		avatarEmoji: string;
		intro: string;
	};
	scene: {
		setting: string;
		dialogue: TextbookDialogueTurn[];
	};
	spotlightWords: TextbookSpotlightWord[];
	patternBox: TextbookPatternBox;
	miniCheck: TextbookMiniCheck[];
	xpReward: number; // 10-15 XP
}
