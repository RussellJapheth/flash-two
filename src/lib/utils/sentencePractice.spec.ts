import { describe, it, expect } from 'vitest';
import {
	buildCloze,
	buildClozeOptions,
	parseExampleSentence,
	renderClozeSentence,
	shuffleArray,
	BLANK_TOKEN
} from './sentencePractice';
import type { WordRecord } from '$lib/types';

import pack1 from '../data/chinese/1.json';

const helloWord: WordRecord = {
	No: 1,
	'Chinese Word': '你好',
	Pinyin: 'nǐ hǎo',
	'Part of Speech': 'Interjection',
	'English Meaning': 'hello / hi',
	'Example (Chinese + Pinyin)':
		'你好！很高兴认识你。(Nǐ hǎo! Hěn gāoxìng rènshí nǐ.) — Hello! Nice to meet you.'
};

describe('parseExampleSentence', () => {
	it('splits a Chinese example into sentence, pinyin and translation', () => {
		const parsed = parseExampleSentence(helloWord, 'chinese');
		expect(parsed).not.toBeNull();
		expect(parsed?.sentence).toBe('你好！很高兴认识你。');
		expect(parsed?.pinyin).toBe('Nǐ hǎo! Hěn gāoxìng rènshí nǐ.');
		expect(parsed?.translation).toBe('Hello! Nice to meet you.');
	});

	it('treats a French example as sentence-only', () => {
		const word: WordRecord = {
			No: 1,
			'French Word': 'bonjour',
			'Part of Speech': 'Interjection',
			'English Meaning': 'hello',
			'Example (French)': 'Bonjour, comment ça va ?'
		};
		const parsed = parseExampleSentence(word, 'french');
		expect(parsed).toEqual({ sentence: 'Bonjour, comment ça va ?' });
		expect(parsed?.pinyin).toBeUndefined();
		expect(parsed?.translation).toBeUndefined();
	});

	it('returns null when the example field is missing', () => {
		const word: WordRecord = {
			No: 1,
			'Chinese Word': '你好',
			Pinyin: 'nǐ hǎo',
			'Part of Speech': 'Interjection',
			'English Meaning': 'hello'
		};
		expect(parseExampleSentence(word, 'chinese')).toBeNull();
	});
});

describe('buildCloze', () => {
	it('blanks the target word and its pinyin', () => {
		const cloze = buildCloze(helloWord, 'chinese');
		expect(cloze).not.toBeNull();
		expect(cloze?.displaySentence).toBe(`${BLANK_TOKEN}！很高兴认识你。`);
		expect(cloze?.pinyin).toBe(`${BLANK_TOKEN}! Hěn gāoxìng rènshí nǐ.`);
		expect(cloze?.fullSentence).toBe('你好！很高兴认识你。');
		expect(cloze?.targetWord).toBe('你好');
		expect(cloze?.targetPinyin).toBe('nǐ hǎo');
		expect(cloze?.translation).toBe('Hello! Nice to meet you.');
	});

	it('blanks the target word when it sits mid-sentence in one of the real packs', () => {
		const word = pack1.words.find((w) => w.No === 4);
		expect(word).toBeDefined();
		const cloze = buildCloze(word!, 'chinese');
		expect(cloze).not.toBeNull();
		expect(cloze?.displaySentence).toBe(`明天见，${BLANK_TOKEN}！`);
		expect(cloze?.pinyin).toBe(`Míngtiān jiàn, ${BLANK_TOKEN}!`);
	});

	it('matches the target word case-insensitively for Latin script', () => {
		const word: WordRecord = {
			No: 1,
			'French Word': 'bonjour',
			'Part of Speech': 'Interjection',
			'English Meaning': 'hello',
			'Example (French)': 'Bonjour, comment ça va ?'
		};
		const cloze = buildCloze(word, 'french');
		expect(cloze?.displaySentence).toBe(`${BLANK_TOKEN}, comment ça va ?`);
	});

	it('blanks a target pinyin that is written with punctuation attached', () => {
		const word: WordRecord = {
			No: 4,
			'Chinese Word': '再见',
			Pinyin: 'zàijiàn',
			'Part of Speech': 'Interjection',
			'English Meaning': 'goodbye',
			'Example (Chinese + Pinyin)':
				'明天见，再见！(Míngtiān jiàn, zàijiàn!) — See you tomorrow, goodbye!'
		};
		const cloze = buildCloze(word, 'chinese');
		expect(cloze?.pinyin).toBe(`Míngtiān jiàn, ${BLANK_TOKEN}!`);
	});

	it('hides the pinyin line when the target pinyin cannot be blanked safely', () => {
		const word: WordRecord = {
			No: 1,
			'Chinese Word': '运动',
			Pinyin: 'yùndòng',
			'Part of Speech': 'Noun',
			'English Meaning': 'sport',
			'Example (Chinese + Pinyin)': '我喜欢运动。(Wǒ xǐhuan pǎobù.) — I like jogging.'
		};
		const cloze = buildCloze(word, 'chinese');
		expect(cloze).not.toBeNull();
		expect(cloze?.pinyin).toBe('');
	});

	it('returns null for a card whose target word is not in the example sentence', () => {
		const word: WordRecord = {
			No: 12,
			'Chinese Word': '鸡肉',
			Pinyin: 'jīròu',
			'Part of Speech': 'Noun',
			'English Meaning': 'chicken (meat)',
			'Example (Chinese + Pinyin)':
				'宫保鸡丁是著名中国菜。(Gōngbǎo jīdīng shì zhùmíng Zhōngguó cài.) — Kung Pao chicken is a famous Chinese dish.'
		};
		expect(buildCloze(word, 'chinese')).toBeNull();
	});
});

describe('buildClozeOptions', () => {
	it('always includes the correct option exactly once', () => {
		const cloze = buildCloze(helloWord, 'chinese');
		expect(cloze).not.toBeNull();
		const options = buildClozeOptions(cloze!, pack1.words as WordRecord[], 3);
		expect(options).toHaveLength(4);
		expect(options.filter((o) => o.isCorrect)).toHaveLength(1);
		expect(options.filter((o) => o.isCorrect)[0].text).toBe('你好');
	});

	it('never repeats texts and excludes other occurrences of the target', () => {
		const cloze = buildCloze(helloWord, 'chinese');
		const options = buildClozeOptions(cloze!, pack1.words as WordRecord[], 3);
		const texts = options.map((o) => o.text);
		expect(new Set(texts).size).toBe(texts.length);
		expect(options.filter((o) => o.text === '你好' && !o.isCorrect)).toHaveLength(0);
	});

	it('degrades to a single option when no distractors exist', () => {
		const cloze = buildCloze(helloWord, 'chinese');
		const options = buildClozeOptions(cloze!, [helloWord], 3);
		expect(options).toHaveLength(1);
		expect(options[0].isCorrect).toBe(true);
	});
});

describe('renderClozeSentence', () => {
	it('replaces blank tokens with the display placeholder', () => {
		expect(renderClozeSentence(`${BLANK_TOKEN}！很高兴认识你。`)).toBe(
			'[ ______ ]！很高兴认识你。'
		);
		expect(renderClozeSentence('没有空白。')).toBe('没有空白。');
	});
});

describe('shuffleArray', () => {
	it('returns a permutation of the input', () => {
		const input = [1, 2, 3, 4, 5];
		const out = shuffleArray(input);
		expect(out).toHaveLength(input.length);
		expect([...out].sort()).toEqual([...input].sort());
		expect(input).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('Data integrity: every built-in card is practiceable', () => {
	type RawPack = { words?: WordRecord[] };
	const packs = import.meta.glob<RawPack>('../data/chinese/*.json', { eager: true });
	const frenchPacks = import.meta.glob<RawPack>('../data/french/*.json', { eager: true });

	it('every Chinese card yields a working cloze', () => {
		let cardsChecked = 0;
		for (const raw of Object.values(packs)) {
			for (const word of raw?.words || []) {
				expect(buildCloze(word, 'chinese'), `chinese card ${word.No}`).not.toBeNull();
				cardsChecked++;
			}
		}
		expect(cardsChecked).toBeGreaterThan(500);
	});

	it('every French card yields a working cloze', () => {
		let cardsChecked = 0;
		for (const raw of Object.values(frenchPacks)) {
			for (const word of raw?.words || []) {
				expect(buildCloze(word, 'french'), `french card ${word.No}`).not.toBeNull();
				cardsChecked++;
			}
		}
		expect(cardsChecked).toBeGreaterThan(8);
	});
});
