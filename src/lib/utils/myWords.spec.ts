import { describe, it, expect } from 'vitest';
import type { CustomDeck } from '$lib/types';
import {
	MY_WORDS_DECK_ID,
	DUPLICATE_WORD_ERROR,
	validateMyWord,
	toMyWordInput,
	generateWordPinyin,
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	type MyWordInput
} from './myWords';

const nihao: MyWordInput = { word: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', example: '' };
const xiexie: MyWordInput = {
	word: '谢谢',
	pinyin: 'xièxie',
	meaning: 'thank you',
	example: '谢谢你。Xièxie nǐ.'
};

describe('validateMyWord', () => {
	it('requires word, pinyin and meaning', () => {
		const errors = validateMyWord({ word: ' ', pinyin: '', meaning: '\t', example: '' }, []);
		expect(Object.keys(errors).sort()).toEqual(['meaning', 'pinyin', 'word']);
	});

	it('treats the example as optional', () => {
		expect(validateMyWord(nihao, [])).toEqual({});
	});

	it('rejects a duplicate Chinese word, ignoring surrounding spaces', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		const errors = validateMyWord({ ...nihao, word: ' 你好 ' }, deck.words);
		expect(errors.word).toBe(DUPLICATE_WORD_ERROR);
	});

	it('allows the edited word to keep its own text', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(validateMyWord(nihao, deck.words, deck.words[0].No)).toEqual({});
	});
});

describe('buildDeckWithAddedWord', () => {
	it('creates the My Words deck on first add, with trimmed fields', () => {
		const deck = buildDeckWithAddedWord(null, { ...xiexie, word: ' 谢谢 ' });
		expect(deck.id).toBe(MY_WORDS_DECK_ID);
		expect(deck.name).toBe('My Words');
		expect(deck.language).toBe('chinese');
		expect(deck.words).toHaveLength(1);
		expect(deck.words[0]).toMatchObject({
			No: 1,
			'Chinese Word': '谢谢',
			Pinyin: 'xièxie',
			'English Meaning': 'thank you',
			'Example (Chinese + Pinyin)': '谢谢你。Xièxie nǐ.'
		});
	});

	it('stores an empty example as undefined', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(deck.words[0]['Example (Chinese + Pinyin)']).toBeUndefined();
	});

	it('never reuses a word number after a delete', () => {
		let deck = buildDeckWithAddedWord(null, nihao);
		deck = buildDeckWithAddedWord(deck, xiexie);
		deck = buildDeckWithoutWord(deck, 1);
		deck = buildDeckWithAddedWord(deck, { ...nihao, word: '再见', meaning: 'goodbye' });
		expect(deck.words.map((w) => w.No)).toEqual([2, 3]);
	});

	it('throws on invalid input', () => {
		expect(() => buildDeckWithAddedWord(null, { ...nihao, pinyin: '' })).toThrow();
	});

	it('throws on a duplicate word', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(() => buildDeckWithAddedWord(deck, nihao)).toThrow(DUPLICATE_WORD_ERROR);
	});
});

describe('buildDeckWithUpdatedWord', () => {
	it('updates fields in place and keeps the word number', () => {
		let deck: CustomDeck = buildDeckWithAddedWord(null, nihao);
		deck = buildDeckWithAddedWord(deck, xiexie);
		const updated = buildDeckWithUpdatedWord(deck, 2, { ...xiexie, meaning: 'thanks' });
		expect(updated.words[1]).toMatchObject({ No: 2, 'English Meaning': 'thanks' });
		expect(updated.words[0]).toEqual(deck.words[0]);
	});

	it('throws when the word does not exist', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(() => buildDeckWithUpdatedWord(deck, 99, nihao)).toThrow();
	});

	it('throws when renaming to an existing word', () => {
		let deck = buildDeckWithAddedWord(null, nihao);
		deck = buildDeckWithAddedWord(deck, xiexie);
		expect(() => buildDeckWithUpdatedWord(deck, 2, { ...xiexie, word: '你好' })).toThrow(
			DUPLICATE_WORD_ERROR
		);
	});
});

describe('buildDeckWithoutWord', () => {
	it('throws when the word does not exist', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(() => buildDeckWithoutWord(deck, 5)).toThrow();
	});
});

describe('toMyWordInput', () => {
	it('round-trips a stored word into form input', () => {
		const deck = buildDeckWithAddedWord(null, xiexie);
		expect(toMyWordInput(deck.words[0])).toEqual(xiexie);
	});
});

describe('generateWordPinyin', () => {
	it('generates tone-marked pinyin for Chinese words', () => {
		expect(generateWordPinyin('你好')).toBe('nǐ hǎo');
		expect(generateWordPinyin(' 谢谢 ')).toBe('xiè xiè');
	});

	it('returns empty string for blank or non-Chinese text', () => {
		expect(generateWordPinyin('')).toBe('');
		expect(generateWordPinyin('   ')).toBe('');
		expect(generateWordPinyin('hello')).toBe('');
	});
});
