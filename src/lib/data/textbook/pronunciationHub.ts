export interface ToneGuideItem {
	toneNumber: number;
	name: string;
	pitchContour: string;
	mark: string;
	description: string;
	mnemonic: string;
	exampleHanzi: string;
	examplePinyin: string;
	audioText: string;
}

export interface SandhiRuleItem {
	ruleName: string;
	chineseName: string;
	explanation: string;
	formula: string;
	examples: {
		original: string;
		spokenAs: string;
		hanzi: string;
		english: string;
	}[];
}

export const TONE_GUIDE_ITEMS: ToneGuideItem[] = [
	{
		toneNumber: 1,
		name: 'First Tone · High Level',
		pitchContour: '55',
		mark: 'ˉ (e.g. mā)',
		description: 'High, level, steady singing tone across the upper register of your vocal range.',
		mnemonic: 'Like a continuous musical soprano note: "Aaaaa"',
		exampleHanzi: '妈 · 喝 · 天 · 飞',
		examplePinyin: 'mā, hē, tiān, fēi',
		audioText: '妈 喝 天 飞'
	},
	{
		toneNumber: 2,
		name: 'Second Tone · Rising',
		pitchContour: '35',
		mark: 'ˊ (e.g. má)',
		description:
			'Starts in the mid-register and glides smoothly upward with questioning inflection.',
		mnemonic: 'Like asking in surprised English: "What?! Really?!"',
		exampleHanzi: '麻 · 茶 · 来 · 人',
		examplePinyin: 'má, chá, lái, rén',
		audioText: '麻 茶 来 人'
	},
	{
		toneNumber: 3,
		name: 'Third Tone · Dipping',
		pitchContour: '214',
		mark: 'ˇ (e.g. mǎ)',
		description: 'Dips down deeply into vocal fry/chest voice before rising up at the end.',
		mnemonic: 'Like an emphatic, low "Well..." before nodding.',
		exampleHanzi: '马 · 好 · 你 · 水',
		examplePinyin: 'mǎ, hǎo, nǐ, shuǐ',
		audioText: '马 好 你 水'
	},
	{
		toneNumber: 4,
		name: 'Fourth Tone · Falling',
		pitchContour: '51',
		mark: 'ˋ (e.g. mà)',
		description:
			'Starts at the highest point and drops sharply, decisively, and briskly to the bottom.',
		mnemonic: 'Like a firm command: "Stop! No!"',
		exampleHanzi: '骂 · 看 · 去 · 是',
		examplePinyin: 'mà, kàn, qù, shì',
		audioText: '骂 看 去 是'
	},
	{
		toneNumber: 5,
		name: 'Neutral Tone · Light & Short',
		pitchContour: 'Variable',
		mark: 'no mark (e.g. ma)',
		description:
			'Soft, whisper-light, and unstressed; pitch is dictated by the syllable before it.',
		mnemonic: 'A gentle echo tapped like a feather.',
		exampleHanzi: '吗 · 呢 · 吧 · 爸爸',
		examplePinyin: 'ma, ne, ba, bàba',
		audioText: '吗 呢 吧 爸爸'
	}
];

export const SANDHI_RULES: SandhiRuleItem[] = [
	{
		ruleName: 'Third-Tone Sandhi (3rd + 3rd ➔ 2nd + 3rd)',
		chineseName: '三声变调',
		formula: '3rd Tone + 3rd Tone ➔ 2nd Tone + 3rd Tone',
		explanation:
			'When two third tones occur consecutively, the first third tone automatically shifts to a second (rising) tone in speech to preserve natural flow.',
		examples: [
			{
				original: 'nǐ (3) + hǎo (3)',
				spokenAs: 'ní (2) + hǎo (3)',
				hanzi: '你好',
				english: 'Hello'
			},
			{
				original: 'kě (3) + yǐ (3)',
				spokenAs: 'ké (2) + yǐ (3)',
				hanzi: '可以',
				english: 'Can / May'
			},
			{
				original: 'shǒu (3) + biǎo (3)',
				spokenAs: 'shóu (2) + biǎo (3)',
				hanzi: '手表',
				english: 'Wristwatch'
			}
		]
	},
	{
		ruleName: 'Tone Changes for "不" (bù)',
		chineseName: '“不”字变调',
		formula: '不 (4th) + 4th Tone ➔ 不 (2nd Tone: bú)',
		explanation:
			'不 is naturally a fourth falling tone (bù). However, when placed before another fourth-tone syllable, it shifts to a second rising tone (bú). Before 1st, 2nd, and 3rd tones, it stays 4th tone.',
		examples: [
			{
				original: 'bù (4) + shì (4)',
				spokenAs: 'bú (2) + shì (4)',
				hanzi: '不是',
				english: 'Is not'
			},
			{
				original: 'bù (4) + duì (4)',
				spokenAs: 'bú (2) + duì (4)',
				hanzi: '不对',
				english: 'Incorrect'
			},
			{
				original: 'bù (4) + hǎo (3)',
				spokenAs: 'bù (4) + hǎo (3)',
				hanzi: '不好',
				english: 'Not good (Stays 4th tone before 3rd)'
			}
		]
	},
	{
		ruleName: 'Tone Changes for "一" (yī)',
		chineseName: '“一”字变调',
		formula: '一 + 4th Tone ➔ 2nd Tone (yí) | 一 + 1st/2nd/3rd Tone ➔ 4th Tone (yì)',
		explanation:
			'When counting alone, 一 is 1st tone (yī). Before a 4th-tone syllable, it shifts to 2nd tone (yí). Before a 1st, 2nd, or 3rd tone syllable, it shifts to 4th tone (yì).',
		examples: [
			{
				original: 'yī (1) + gè (4)',
				spokenAs: 'yí (2) + gè (4)',
				hanzi: '一个',
				english: 'One (item)'
			},
			{
				original: 'yī (1) + bēi (1)',
				spokenAs: 'yì (4) + bēi (1)',
				hanzi: '一杯',
				english: 'One cup'
			},
			{
				original: 'yī (1) + qǐ (3)',
				spokenAs: 'yì (4) + qǐ (3)',
				hanzi: '一起',
				english: 'Together'
			}
		]
	}
];
