export interface PronunciationLabItem {
	pinyin: string;
	hanzi?: string;
	tone: string;
	audioText: string;
	tip: string;
}

export interface TextbookDialogueTurn {
	speaker: string;
	avatarEmoji: string;
	avatarUrl?: string;
	role?: string;
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

export interface PatternSlot {
	label: string;
	example: string;
	pinyin?: string;
}

export interface PatternContrast {
	label: string;
	explanation: string;
	exampleHanzi: string;
	examplePinyin: string;
	exampleEnglish: string;
}

export interface TextbookPatternBox {
	title: string;
	formula: string;
	slots: PatternSlot[];
	notes: string;
	contrasts?: PatternContrast[];
}

export interface PragmaticTip {
	title: string;
	tip: string;
	naturalExample: {
		hanzi: string;
		pinyin: string;
		english: string;
	};
}

export interface ComprehensionCheck {
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
}

export interface WordReorderCheck {
	sentenceHanzi: string;
	sentencePinyin: string;
	sentenceEnglish: string;
	shuffledWords: string[];
	wordPinyinMap?: Record<string, string>;
}

export interface RoleplayOption {
	hanzi: string;
	pinyin: string;
	english: string;
	isCorrect: boolean;
	feedback: string;
}

export interface RoleplayCheck {
	situation: string;
	prompt: string;
	options: RoleplayOption[];
}

export interface TextbookMiniCheck {
	comprehension: ComprehensionCheck;
	wordReorder: WordReorderCheck;
	roleplayCheck?: RoleplayCheck;
}

export interface TextbookUnitData {
	id: string; // e.g. "unit-01"
	unitNumber: number; // 1 to 36
	partNumber: 1 | 2 | 3 | 4 | 5 | 6;
	partTitle: string;
	stage: string;
	title: string;
	chineseTitle: string;
	subtitle: string;
	milestoneGoal: string; // ACTFL Can-Do statement
	estimatedMinutes: number;
	sceneIllustration?: {
		imageUrl: string;
		alt: string;
		caption?: string;
	};
	characterHost: {
		name: string;
		avatarEmoji: string;
		avatarUrl?: string;
		role?: string;
		intro: string;
	};
	pronunciationLab?: {
		title: string;
		explanation: string;
		items: PronunciationLabItem[];
	};
	dialogue: TextbookDialogueTurn[];
	spotlightWords: TextbookSpotlightWord[];
	patternBox: TextbookPatternBox;
	pragmaticTip: PragmaticTip;
	miniCheck: TextbookMiniCheck;
	xpReward: number; // typically 15 XP
}

export interface TextbookPartMeta {
	partNumber: 1 | 2 | 3 | 4 | 5 | 6;
	title: string;
	chineseTitle: string;
	unitsRange: string;
	stage: string;
	goal: string;
	color: string;
	illustrationUrl: string;
}
