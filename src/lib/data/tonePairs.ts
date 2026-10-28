/**
 * Tone Pair Lab - 16 Mandarin Tone Combinations
 *
 * Distilled from SayMei Beginner Field Guide: Mandarin Tone-Pair Listening & Speaking Lab.
 * Defines all 16 lexical tone combinations with pitch contours (5-point Chao scale)
 * and verified high-yield vocabulary.
 */

export type LexicalTone = 1 | 2 | 3 | 4;

export interface TonePairWord {
	hanzi: string;
	pinyin: string;
	english: string;
}

export const TONE_SYMBOLS: Record<LexicalTone, string> = {
	1: '¯',
	2: 'ˊ',
	3: 'ˇ',
	4: 'ˋ'
};

export interface TonePairConfig {
	id: string; // e.g. '1-1', '2-4'
	tone1: LexicalTone;
	tone2: LexicalTone;
	symbol1: string;
	symbol2: string;
	name: string;
	pitchContour1: [number, number]; // [start, end] on 1-5 scale
	pitchContour2: [number, number];
	description: string;
	rehearsalTip: string;
	words: TonePairWord[];
}

interface RawTonePairConfig {
	id: string;
	tone1: LexicalTone;
	tone2: LexicalTone;
	name?: string;
	pitchContour1: [number, number];
	pitchContour2: [number, number];
	description: string;
	rehearsalTip: string;
	words: TonePairWord[];
}

const RAW_TONE_PAIRS: RawTonePairConfig[] = [
	// Tone 1 First
	{
		id: '1-1',
		tone1: 1,
		tone2: 1,
		name: 'Tone 1 + Tone 1',
		pitchContour1: [5, 5],
		pitchContour2: [5, 5],
		description: 'High Level + High Level',
		rehearsalTip:
			'Keep both syllables steady and level at the top of your pitch range without dropping.',
		words: [
			{ hanzi: '今天', pinyin: 'jīntiān', english: 'today' },
			{ hanzi: '飞机', pinyin: 'fēijī', english: 'airplane' },
			{ hanzi: '喝茶', pinyin: 'hēchá', english: 'drink tea' },
			{ hanzi: '新鲜', pinyin: 'xīnxiān', english: 'fresh' }
		]
	},
	{
		id: '1-2',
		tone1: 1,
		tone2: 2,
		name: 'Tone 1 + Tone 2',
		pitchContour1: [5, 5],
		pitchContour2: [3, 5],
		description: 'High Level + Rising',
		rehearsalTip:
			'Hold syllable 1 high, then let your voice reset mid-pitch and rise cleanly for syllable 2.',
		words: [
			{ hanzi: '欢迎', pinyin: 'huānyíng', english: 'welcome' },
			{ hanzi: '帮忙', pinyin: 'bāngmáng', english: 'help' },
			{ hanzi: '非常', pinyin: 'fēicháng', english: 'extremely / very' },
			{ hanzi: '中国', pinyin: 'zhōngguó', english: 'China' }
		]
	},
	{
		id: '1-3',
		tone1: 1,
		tone2: 3,
		name: 'Tone 1 + Tone 3',
		pitchContour1: [5, 5],
		pitchContour2: [2, 1],
		description: 'High Level + Low Dip',
		rehearsalTip:
			'After high syllable 1, drop low for syllable 2. In connected speech keep it as a low bottom.',
		words: [
			{ hanzi: '开始', pinyin: 'kāishǐ', english: 'begin / start' },
			{ hanzi: '黑板', pinyin: 'hēibǎn', english: 'blackboard' },
			{ hanzi: '身体', pinyin: 'shēntǐ', english: 'body / health' },
			{ hanzi: '声音', pinyin: 'shēngyīn', english: 'voice / sound' }
		]
	},
	{
		id: '1-4',
		tone1: 1,
		tone2: 4,
		name: 'Tone 1 + Tone 4',
		pitchContour1: [5, 5],
		pitchContour2: [5, 1],
		description: 'High Level + Falling',
		rehearsalTip:
			'Both start from the same high pitch! Syllable 1 stays level, syllable 2 dives sharply downward.',
		words: [
			{ hanzi: '面包', pinyin: 'miànbāo', english: 'bread' },
			{ hanzi: '安静', pinyin: 'ānjìng', english: 'quiet' },
			{ hanzi: '方便', pinyin: 'fāngbiàn', english: 'convenient' },
			{ hanzi: '干净', pinyin: 'gānjìng', english: 'clean' }
		]
	},

	// Tone 2 First
	{
		id: '2-1',
		tone1: 2,
		tone2: 1,
		name: 'Tone 2 + Tone 1',
		pitchContour1: [3, 5],
		pitchContour2: [5, 5],
		description: 'Rising + High Level',
		rehearsalTip: 'Rise upward with syllable 1 and seamlessly latch onto syllable 2 at the peak.',
		words: [
			{ hanzi: '银行', pinyin: 'yínháng', english: 'bank' },
			{ hanzi: '明天', pinyin: 'míngtiān', english: 'tomorrow' },
			{ hanzi: '南方', pinyin: 'nánfāng', english: 'south' },
			{ hanzi: '国家', pinyin: 'guójiā', english: 'country' }
		]
	},
	{
		id: '2-2',
		tone1: 2,
		tone2: 2,
		name: 'Tone 2 + Tone 2',
		pitchContour1: [3, 5],
		pitchContour2: [3, 5],
		description: 'Rising + Rising',
		rehearsalTip:
			'Two rising waves! Reset your pitch back to mid (level 3) between syllables before rising again.',
		words: [
			{ hanzi: '学习', pinyin: 'xuéxí', english: 'study' },
			{ hanzi: '平时', pinyin: 'píngshí', english: 'ordinarily' },
			{ hanzi: '回答', pinyin: 'huídá', english: 'reply / answer' },
			{ hanzi: '常常', pinyin: 'chángcháng', english: 'often' }
		]
	},
	{
		id: '2-3',
		tone1: 2,
		tone2: 3,
		name: 'Tone 2 + Tone 3',
		pitchContour1: [3, 5],
		pitchContour2: [2, 1],
		description: 'Rising + Low Dip',
		rehearsalTip:
			'Rise to the top on syllable 1, then plunge low down into your chest voice for syllable 2.',
		words: [
			{ hanzi: '苹果', pinyin: 'píngguǒ', english: 'apple' },
			{ hanzi: '啤酒', pinyin: 'píjiǔ', english: 'beer' },
			{ hanzi: '离开', pinyin: 'líkāi', english: 'depart / leave' },
			{ hanzi: '盘子', pinyin: 'pánzi', english: 'plate' }
		]
	},
	{
		id: '2-4',
		tone1: 2,
		tone2: 4,
		name: 'Tone 2 + Tone 4',
		pitchContour1: [3, 5],
		pitchContour2: [5, 1],
		description: 'Rising + Sharp Fall',
		rehearsalTip:
			'Syllable 1 rises to peak 5; syllable 2 attacks from peak 5 and drops sharply to level 1.',
		words: [
			{ hanzi: '时间', pinyin: 'shíjiān', english: 'time' },
			{ hanzi: '服务', pinyin: 'fúwù', english: 'service' },
			{ hanzi: '文化', pinyin: 'wénhuà', english: 'culture' },
			{ hanzi: '决定', pinyin: 'juédìng', english: 'decision' }
		]
	},

	// Tone 3 First
	{
		id: '3-1',
		tone1: 3,
		tone2: 1,
		name: 'Tone 3 + Tone 1',
		pitchContour1: [2, 1],
		pitchContour2: [5, 5],
		description: 'Half-Third (Low) + High Level',
		rehearsalTip:
			'Half-third sandhi! Keep syllable 1 low (2-1); do NOT rise. Jump straight up to high 5 for syllable 2.',
		words: [
			{ hanzi: '首都', pinyin: 'shǒudū', english: 'capital city' },
			{ hanzi: '许多', pinyin: 'xǔduō', english: 'many' },
			{ hanzi: '雨衣', pinyin: 'yǔyī', english: 'raincoat' },
			{ hanzi: '火车', pinyin: 'huǒchē', english: 'train' }
		]
	},
	{
		id: '3-2',
		tone1: 3,
		tone2: 2,
		name: 'Tone 3 + Tone 2',
		pitchContour1: [2, 1],
		pitchContour2: [3, 5],
		description: 'Half-Third (Low) + Rising',
		rehearsalTip: 'Stay low on syllable 1 (2-1), then cleanly rise from mid to high on syllable 2.',
		words: [
			{ hanzi: '简单', pinyin: 'jiǎndān', english: 'simple' },
			{ hanzi: '旅行', pinyin: 'lǚxíng', english: 'travel' },
			{ hanzi: '产生', pinyin: 'chǎnshēng', english: 'produce' },
			{ hanzi: '准确', pinyin: 'zhǔnquè', english: 'accurate' }
		]
	},
	{
		id: '3-3',
		tone1: 3,
		tone2: 3,
		name: 'Tone 3 + Tone 3 (Sandhi -> 2-3)',
		pitchContour1: [3, 5],
		pitchContour2: [2, 1],
		description: '3rd Tone Sandhi: Spoken as 2-3',
		rehearsalTip:
			'Mandarin rule! When two third tones meet, the first syllable automatically rises like Tone 2.',
		words: [
			{ hanzi: '你好', pinyin: 'nǐ hǎo', english: 'hello (sounds: ní hǎo)' },
			{ hanzi: '可以', pinyin: 'kěyǐ', english: 'can / may (sounds: ké yǐ)' },
			{ hanzi: '水果', pinyin: 'shuǐguǒ', english: 'fruit (sounds: shuí guǒ)' },
			{ hanzi: '打扫', pinyin: 'dǎsǎo', english: 'clean up (sounds: dá sǎo)' }
		]
	},
	{
		id: '3-4',
		tone1: 3,
		tone2: 4,
		name: 'Tone 3 + Tone 4',
		pitchContour1: [2, 1],
		pitchContour2: [5, 1],
		description: 'Half-Third (Low) + Sharp Fall',
		rehearsalTip:
			'Drop low for syllable 1 (2-1), then reset high to 5 and punch down firmly for syllable 2.',
		words: [
			{ hanzi: '语法', pinyin: 'yǔfǎ', english: 'grammar' },
			{ hanzi: '努力', pinyin: 'nǔlì', english: 'hardworking / strive' },
			{ hanzi: '写信', pinyin: 'xiěxìn', english: 'write letters' },
			{ hanzi: '主要', pinyin: 'zhǔyào', english: 'primary / main' }
		]
	},

	// Tone 4 First
	{
		id: '4-1',
		tone1: 4,
		tone2: 1,
		name: 'Tone 4 + Tone 1',
		pitchContour1: [5, 1],
		pitchContour2: [5, 5],
		description: 'Sharp Fall + High Level',
		rehearsalTip:
			'Drop sharply from 5 to 1 on syllable 1, then climb back up to high 5 for a level syllable 2.',
		words: [
			{ hanzi: '问题', pinyin: 'wèntí', english: 'question / problem' },
			{ hanzi: '开会', pinyin: 'kāihuì', english: 'hold meeting' },
			{ hanzi: '参加', pinyin: 'cānjiā', english: 'participate' },
			{ hanzi: '大家', pinyin: 'dàjiā', english: 'everyone' }
		]
	},
	{
		id: '4-2',
		tone1: 4,
		tone2: 2,
		name: 'Tone 4 + Tone 2',
		pitchContour1: [5, 1],
		pitchContour2: [3, 5],
		description: 'Sharp Fall + Rising',
		rehearsalTip:
			'V-shaped overall movement: sharp downward plunge (5-1) followed by a smooth upward rise (3-5).',
		words: [
			{ hanzi: '跑步', pinyin: 'pǎobù', english: 'run / jog' },
			{ hanzi: '复习', pinyin: 'fùxí', english: 'review / revise' },
			{ hanzi: '特别', pinyin: 'tèbié', english: 'special / especially' },
			{ hanzi: '地图', pinyin: 'dìtú', english: 'map' }
		]
	},
	{
		id: '4-3',
		tone1: 4,
		tone2: 3,
		name: 'Tone 4 + Tone 3',
		pitchContour1: [5, 1],
		pitchContour2: [2, 1],
		description: 'Sharp Fall + Low Dip',
		rehearsalTip:
			'Fall with firm energy on syllable 1; keep syllable 2 settled comfortably in your low vocal range.',
		words: [
			{ hanzi: '汉字', pinyin: 'hànzì', english: 'Chinese characters' },
			{ hanzi: '办法', pinyin: 'bànfǎ', english: 'method / solution' },
			{ hanzi: '电脑', pinyin: 'diànnǎo', english: 'computer' },
			{ hanzi: '电影', pinyin: 'diànyǐng', english: 'movie' }
		]
	},
	{
		id: '4-4',
		tone1: 4,
		tone2: 4,
		name: 'Tone 4 + Tone 4',
		pitchContour1: [5, 1],
		pitchContour2: [5, 1],
		description: 'Double Sharp Fall',
		rehearsalTip:
			'Two decisive karate-chop drops! Be sure to reset your pitch back to 5 for the second chop.',
		words: [
			{ hanzi: '再见', pinyin: 'zàijiàn', english: 'goodbye' },
			{ hanzi: '电视', pinyin: 'diànshì', english: 'television' },
			{ hanzi: '运动', pinyin: 'yùndòng', english: 'sports / exercise' },
			{ hanzi: '问候', pinyin: 'wènhòu', english: 'send greetings' }
		]
	}
];

export const TONE_PAIRS: TonePairConfig[] = RAW_TONE_PAIRS.map((pair) => ({
	...pair,
	symbol1: TONE_SYMBOLS[pair.tone1],
	symbol2: TONE_SYMBOLS[pair.tone2],
	name: `Tone ${pair.tone1} (${TONE_SYMBOLS[pair.tone1]}) + Tone ${pair.tone2} (${TONE_SYMBOLS[pair.tone2]})`
}));

export interface ToneQuestion {
	word: TonePairWord;
	correctPair: TonePairConfig;
	options: TonePairConfig[];
}

/**
 * Returns a random tone pair question with 4 unique multiple-choice options.
 */
export function generateToneQuestion(): ToneQuestion {
	const pairIndex = Math.floor(Math.random() * TONE_PAIRS.length);
	const correctPair = TONE_PAIRS[pairIndex];
	const wordIndex = Math.floor(Math.random() * correctPair.words.length);
	const word = correctPair.words[wordIndex];

	// Pick 3 unique distractors
	const distractors: TonePairConfig[] = [];
	const available = TONE_PAIRS.filter((p) => p.id !== correctPair.id);

	while (distractors.length < 3 && available.length > 0) {
		const idx = Math.floor(Math.random() * available.length);
		distractors.push(available.splice(idx, 1)[0]);
	}

	// Shuffle options
	const options = [correctPair, ...distractors].sort(() => Math.random() - 0.5);

	return {
		word,
		correctPair,
		options
	};
}

/**
 * Validates a user's answer and returns correctness.
 */
export function validateToneAnswer(selectedPairId: string, correctPairId: string): boolean {
	return selectedPairId === correctPairId;
}
