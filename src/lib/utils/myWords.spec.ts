import { describe, it, expect } from 'vitest';
import type { CustomDeck, WordRecord } from '$lib/types';
import {
	ALL_WORDS_CATEGORY,
	MY_WORDS_DECK_ID,
	DUPLICATE_WORD_ERROR,
	validateMyWord,
	isDuplicateMyWord,
	toMyWordInput,
	generateWordPinyin,
	cleanMeaningCandidates,
	findPackExamples,
	getMyWordsSubcategories,
	getMyWordsCategoryRows,
	filterWordsByCategory,
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

	it('allows a duplicate Chinese word when allowDuplicate is true', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(isDuplicateMyWord('你好', deck.words)).toBe(true);
		expect(validateMyWord(nihao, deck.words, undefined, { allowDuplicate: true })).toEqual({});
	});
});

describe('subcategories and All words', () => {
	it('places uncategorized and categorized words in All words, and lists subcategories', () => {
		let deck = buildDeckWithAddedWord(null, nihao);
		deck = buildDeckWithAddedWord(deck, { ...xiexie, category: 'Week 1' });
		deck = buildDeckWithAddedWord(deck, {
			word: '再见',
			pinyin: 'zàijiàn',
			meaning: 'goodbye',
			example: '',
			category: 'Week 2'
		});

		expect(getMyWordsSubcategories(deck.words)).toEqual(['Week 1', 'Week 2']);
		expect(getMyWordsCategoryRows(deck.words)).toEqual([
			{ name: ALL_WORDS_CATEGORY, count: 3, isAll: true },
			{ name: 'Week 1', count: 1, isAll: false },
			{ name: 'Week 2', count: 1, isAll: false }
		]);

		expect(filterWordsByCategory(deck.words, ALL_WORDS_CATEGORY).map((w) => w.No)).toEqual([
			1, 2, 3
		]);
		expect(filterWordsByCategory(deck.words, '').map((w) => w.No)).toEqual([1, 2, 3]);
		expect(filterWordsByCategory(deck.words, 'Week 1').map((w) => w['Chinese Word'])).toEqual([
			'谢谢'
		]);
		expect(filterWordsByCategory(deck.words, 'Week 2').map((w) => w['Chinese Word'])).toEqual([
			'再见'
		]);
	});

	it('seeds "Week 1" and "All words" even when deck has no words', () => {
		expect(getMyWordsSubcategories([])).toEqual(['Week 1']);
		expect(getMyWordsCategoryRows([])).toEqual([
			{ name: ALL_WORDS_CATEGORY, count: 0, isAll: true },
			{ name: 'Week 1', count: 0, isAll: false }
		]);
	});

	it('treats "All words" category input as uncategorized while keeping seeded Week 1', () => {
		const deck = buildDeckWithAddedWord(null, { ...nihao, category: ALL_WORDS_CATEGORY });
		expect(deck.words[0].category).toBeUndefined();
		expect(getMyWordsSubcategories(deck.words)).toEqual(['Week 1']);
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

	it('throws on a duplicate word by default, and appends when allowDuplicate is true', () => {
		const deck = buildDeckWithAddedWord(null, nihao);
		expect(() => buildDeckWithAddedWord(deck, nihao)).toThrow(DUPLICATE_WORD_ERROR);
		const withDup = buildDeckWithAddedWord(
			deck,
			{ ...nihao, category: 'Week 2' },
			{ allowDuplicate: true }
		);
		expect(withDup.words).toHaveLength(2);
		expect(withDup.words[1]).toMatchObject({
			No: 2,
			'Chinese Word': '你好',
			category: 'Week 2'
		});
	});

	it('advances createdAt timestamp on add, update, and delete for cloud sync', () => {
		const deck1 = buildDeckWithAddedWord(null, nihao);
		const deck2 = buildDeckWithAddedWord(deck1, xiexie);
		expect((deck2.createdAt || 0) > (deck1.createdAt || 0)).toBe(true);
		const deck3 = buildDeckWithUpdatedWord(deck2, 1, { ...nihao, category: 'Week 1' });
		expect((deck3.createdAt || 0) > (deck2.createdAt || 0)).toBe(true);
		const deck4 = buildDeckWithoutWord(deck3, 1);
		expect((deck4.createdAt || 0) > (deck3.createdAt || 0)).toBe(true);
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

describe('cleanMeaningCandidates', () => {
	it('splits on semicolons and slashes, strips dictionary jargon, and deduplicates', () => {
		const entries: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '打',
				Pinyin: 'dǎ',
				'Part of Speech': 'Verb',
				'English Meaning':
					'to hit / to strike; to fight; (in many expressions) a semantically light transitive verb used with various objects to form expressions with a wide range of meanings'
			},
			{
				No: 2,
				'Chinese Word': '打',
				Pinyin: 'dá',
				'Part of Speech': 'Measure',
				'English Meaning': '(loanword) dozen; Taiwan pr. [da3]; to hit'
			}
		];

		expect(cleanMeaningCandidates(entries)).toEqual([
			{ meaning: 'to hit', pinyin: 'dǎ' },
			{ meaning: 'to strike', pinyin: 'dǎ' },
			{ meaning: 'to fight', pinyin: 'dǎ' },
			{ meaning: 'dozen', pinyin: 'dá' }
		]);
	});

	it('skips cross-reference glosses and caps at 4 candidates', () => {
		const entries: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '去',
				Pinyin: 'qù',
				'Part of Speech': 'Verb',
				'English Meaning':
					'variant of 去; to go; to leave; to remove; to send; to reduce; CL:個|个[ge4]'
			}
		];
		expect(cleanMeaningCandidates(entries).map((c) => c.meaning)).toEqual([
			'to go',
			'to leave',
			'to remove',
			'to send'
		]);
	});
});

describe('findPackExamples', () => {
	const packWords: WordRecord[] = [
		{
			No: 1,
			'Chinese Word': '你好',
			Pinyin: 'nǐ hǎo',
			'Part of Speech': 'Interjection',
			'English Meaning': 'hello',
			'Example (Chinese + Pinyin)': '你好！很高兴认识你。(Nǐ hǎo! Hěn gāoxìng rènshí nǐ.)'
		},
		{
			No: 2,
			'Chinese Word': '认识',
			Pinyin: 'rènshí',
			'Part of Speech': 'Verb',
			'English Meaning': 'to know',
			'Example (Chinese + Pinyin)': '我认识他，他说你好。(Wǒ rènshí tā, tā shuō nǐ hǎo.)'
		}
	];

	it('prioritizes exact pack word match first, then pack examples containing the word', () => {
		expect(findPackExamples('你好', packWords)).toEqual([
			'你好！很高兴认识你。(Nǐ hǎo! Hěn gāoxìng rènshí nǐ.)',
			'我认识他，他说你好。(Wǒ rènshí tā, tā shuō nǐ hǎo.)'
		]);
	});

	it('returns empty array when no pack contains the word', () => {
		expect(findPackExamples('宇宙飞船', packWords)).toEqual([]);
		expect(findPackExamples('', packWords)).toEqual([]);
	});
});
