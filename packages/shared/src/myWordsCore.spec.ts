import { describe, it, expect } from 'vitest';
import {
	ALL_WORDS_CATEGORY,
	DUPLICATE_WORD_ERROR,
	validateMyWord,
	isDuplicateMyWord,
	getMyWordsSubcategories,
	getMyWordsCategoryRows,
	filterWordsByCategory,
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	type MyWordInput
} from './myWordsCore.js';

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

	it('treats example as optional', () => {
		expect(validateMyWord(nihao, [])).toEqual({});
	});

	it('rejects duplicate Chinese word, ignoring surrounding spaces', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		const errors = validateMyWord({ ...nihao, word: ' 你好 ' }, deck.words);
		expect(errors.word).toBe(DUPLICATE_WORD_ERROR);
	});

	it('allows edited word to keep its own text', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(validateMyWord(nihao, deck.words, deck.words[0].No)).toEqual({});
	});

	it('allows duplicate Chinese word when allowDuplicate is true', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(isDuplicateMyWord('你好', deck.words)).toBe(true);
		expect(validateMyWord(nihao, deck.words, undefined, { allowDuplicate: true })).toEqual({});
	});
});

describe('subcategories and All words', () => {
	it('places uncategorized and categorized words in All words, and lists subcategories', () => {
		let deck = buildDeckWithAddedWord(null, nihao);
		deck = buildDeckWithAddedWord(deck, { ...xiexie, category: 'Greetings' });

		const subcategories = getMyWordsSubcategories(deck.words);
		expect(subcategories).toContain('Week 1');
		expect(subcategories).toContain('Greetings');

		const rows = getMyWordsCategoryRows(deck.words);
		expect(rows[0]).toEqual({ name: ALL_WORDS_CATEGORY, count: 2, isAll: true });

		const filtered = filterWordsByCategory(deck.words, 'Greetings');
		expect(filtered).toHaveLength(1);
		expect(filtered[0]['Chinese Word']).toBe('谢谢');
	});
});

describe('deck immutability', () => {
	it('buildDeckWithAddedWord appends card with monotonically increasing No', () => {
		const deck1 = buildDeckWithAddedWord(null, nihao);
		expect(deck1.words[0].No).toBe(1);
		const deck2 = buildDeckWithAddedWord(deck1, xiexie);
		expect(deck2.words[1].No).toBe(2);
		expect(deck1.words).toHaveLength(1); // Immutability
	});

	it('buildDeckWithUpdatedWord preserves No and updates fields', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		const updated = buildDeckWithUpdatedWord(deck, 1, { ...nihao, meaning: 'hi' });
		expect(updated.words[0].No).toBe(1);
		expect(updated.words[0]['English Meaning']).toBe('hi');
	});

	it('buildDeckWithoutWord removes card without mutating input', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		const emptyDeck = buildDeckWithoutWord(deck, 1);
		expect(emptyDeck.words).toHaveLength(0);
		expect(deck.words).toHaveLength(1);
	});
});
