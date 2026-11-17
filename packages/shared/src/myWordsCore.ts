import type { CustomDeck, WordRecord } from './types.js';
import { generatePinyin } from './pinyin.js';

export const MY_WORDS_DECK_ID = 'custom-my-words';
export const MY_WORDS_DECK_NAME = 'My Words';
export const ALL_WORDS_CATEGORY = 'All words';
export const ALL_WEEKS_LABEL = 'All Weeks';
export const SEEDED_SUBCATEGORY = 'Week 1';

const HANZI_REGEX = /[\u4e00-\u9fff]/;

export interface MyWordsCategoryRow {
	name: string;
	count: number;
	isAll: boolean;
}

export function sortWeekCategories(categories: string[]): string[] {
	return [...categories].sort((a, b) => {
		const matchA = a.match(/^Week\s+(\d+)$/i);
		const matchB = b.match(/^Week\s+(\d+)$/i);
		if (matchA && matchB) {
			return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
		}
		if (matchA) return -1;
		if (matchB) return 1;
		return a.localeCompare(b);
	});
}

export function getMyWordsSubcategories(words: WordRecord[]): string[] {
	const seen = new Set<string>([SEEDED_SUBCATEGORY.toLowerCase()]);
	const rawList: string[] = [SEEDED_SUBCATEGORY];
	for (const w of words) {
		const cat = (w.category || '').trim();
		const lower = cat.toLowerCase();
		if (!cat || lower === ALL_WORDS_CATEGORY.toLowerCase() || lower === ALL_WEEKS_LABEL.toLowerCase()) continue;
		if (!seen.has(lower)) {
			seen.add(lower);
			rawList.push(cat);
		}
	}
	return sortWeekCategories(rawList);
}

export function getMyWordsCategoryRows(words: WordRecord[]): MyWordsCategoryRow[] {
	const subcategories = getMyWordsSubcategories(words);
	const counts = new Map<string, number>();
	for (const w of words) {
		const cat = (w.category || '').trim().toLowerCase();
		if (cat && cat !== ALL_WORDS_CATEGORY.toLowerCase() && cat !== ALL_WEEKS_LABEL.toLowerCase()) {
			counts.set(cat, (counts.get(cat) || 0) + 1);
		}
	}
	return [
		{ name: ALL_WEEKS_LABEL, count: words.length, isAll: true },
		...subcategories.map((name) => ({
			name,
			count: counts.get(name.toLowerCase()) || 0,
			isAll: false
		}))
	];
}

export function filterWordsByCategory(words: WordRecord[], category?: string | null): WordRecord[] {
	const trimmed = (category || '').trim().toLowerCase();
	if (!trimmed || trimmed === ALL_WORDS_CATEGORY.toLowerCase() || trimmed === ALL_WEEKS_LABEL.toLowerCase()) {
		return [...words];
	}
	return words.filter((w) => (w.category || '').trim().toLowerCase() === trimmed);
}

export interface MeaningCandidate {
	meaning: string;
	pinyin?: string;
}

export interface WordSuggestions {
	pinyin: string;
	meanings: MeaningCandidate[];
	examples: string[];
}

export function generateWordPinyin(chineseWord: string): string {
	const trimmed = chineseWord.trim();
	if (!trimmed || !HANZI_REGEX.test(trimmed)) return '';
	return generatePinyin(trimmed);
}

function cleanGlossSegment(raw: string): string {
	return raw
		.replace(/\bCL:[^;/)]+/gi, '')
		.replace(/\b(?:Taiwan|also)\s+pr\.\s*\[[^\]]*\]/gi, '')
		.replace(/\([^)]*\)/g, ' ')
		.replace(/\s+/g, ' ')
		.replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, '')
		.trim();
}

function isCrossRefGloss(cleaned: string): boolean {
	return /^(?:see\s|variant of\s|old variant of\s|erhua variant of\s|same as\s)/i.test(cleaned);
}

export function cleanMeaningCandidates(
	entries: WordRecord[],
	maxCandidates = 4
): MeaningCandidate[] {
	const shortList: MeaningCandidate[] = [];
	const longList: MeaningCandidate[] = [];
	const seen = new Set<string>();

	for (const entry of entries) {
		const rawMeaning = entry['English Meaning'] || '';
		if (!rawMeaning.trim()) continue;
		const py = entry.Pinyin?.trim() || undefined;
		const segments = rawMeaning.split(/[;/]/);

		for (const seg of segments) {
			const cleaned = cleanGlossSegment(seg);
			if (!cleaned || isCrossRefGloss(cleaned)) continue;
			const key = cleaned.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);

			const item: MeaningCandidate = py ? { meaning: cleaned, pinyin: py } : { meaning: cleaned };
			if (cleaned.length <= 45) {
				shortList.push(item);
			} else {
				longList.push(item);
			}
		}
	}

	return [...shortList, ...longList].slice(0, maxCandidates);
}

export function findPackExamples(
	hanzi: string,
	packWords: WordRecord[],
	maxExamples = 5
): string[] {
	const target = hanzi.trim();
	if (!target || !HANZI_REGEX.test(target)) return [];

	const exact: string[] = [];
	const containing: string[] = [];
	const seen = new Set<string>();

	for (const w of packWords) {
		const ex = w['Example (Chinese + Pinyin)']?.trim();
		if (!ex || seen.has(ex)) continue;
		const wordZh = (w['Chinese Word'] || '').trim();
		if (wordZh === target) {
			seen.add(ex);
			exact.push(ex);
		} else if (ex.includes(target)) {
			seen.add(ex);
			containing.push(ex);
		}
	}

	return [...exact, ...containing].slice(0, maxExamples);
}

export interface MyWordInput {
	word: string;
	pinyin: string;
	meaning: string;
	example: string;
	category?: string;
}

export interface MyWordSaveOptions {
	allowDuplicate?: boolean;
}

export type MyWordField = 'word' | 'pinyin' | 'meaning' | 'example' | 'category';
export type MyWordErrors = Partial<Record<MyWordField, string>>;

export const DUPLICATE_WORD_ERROR = 'This word is already in My Words';

function normalizeCategory(category?: string): string | undefined {
	const trimmed = (category || '').trim();
	if (!trimmed || trimmed.toLowerCase() === ALL_WORDS_CATEGORY.toLowerCase()) {
		return undefined;
	}
	return trimmed;
}

function trimInput(input: MyWordInput): MyWordInput {
	return {
		word: input.word.trim(),
		pinyin: input.pinyin.trim(),
		meaning: input.meaning.trim(),
		example: input.example.trim(),
		category: normalizeCategory(input.category)
	};
}

export function isDuplicateMyWord(
	word: string,
	existing: WordRecord[],
	editingNo?: number
): boolean {
	const target = word.trim();
	if (!target) return false;
	return existing.some((w) => w.No !== editingNo && (w['Chinese Word'] || '').trim() === target);
}

export function validateMyWord(
	input: MyWordInput,
	existing: WordRecord[],
	editingNo?: number,
	options?: MyWordSaveOptions
): MyWordErrors {
	const t = trimInput(input);
	const errors: MyWordErrors = {};
	if (!t.word) errors.word = 'Please enter the Chinese word';
	if (!t.pinyin) errors.pinyin = 'Please enter the pinyin';
	if (!t.meaning) errors.meaning = 'Please enter the English meaning';
	if (!options?.allowDuplicate && isDuplicateMyWord(t.word, existing, editingNo)) {
		errors.word = DUPLICATE_WORD_ERROR;
	}
	return errors;
}

export function toMyWordInput(word: WordRecord): MyWordInput {
	const cat = normalizeCategory(word.category);
	return {
		word: word['Chinese Word'] || '',
		pinyin: word.Pinyin || '',
		meaning: word['English Meaning'] || '',
		example: word['Example (Chinese + Pinyin)'] || '',
		...(cat ? { category: cat } : {})
	};
}

function toWordRecord(no: number, input: MyWordInput): WordRecord {
	const t = trimInput(input);
	return {
		No: no,
		'Chinese Word': t.word,
		Pinyin: t.pinyin,
		'Part of Speech': '',
		'English Meaning': t.meaning,
		'Example (Chinese + Pinyin)': t.example || undefined,
		category: t.category
	};
}

function assertValid(
	input: MyWordInput,
	existing: WordRecord[],
	editingNo?: number,
	options?: MyWordSaveOptions
): void {
	const errors = validateMyWord(input, existing, editingNo, options);
	const first = Object.values(errors)[0];
	if (first) throw new Error(first);
}

export function buildDeckWithAddedWord(
	deck: CustomDeck | null,
	input: MyWordInput,
	options?: MyWordSaveOptions
): CustomDeck {
	const now = Date.now();
	const base: CustomDeck = deck ?? {
		id: MY_WORDS_DECK_ID,
		name: MY_WORDS_DECK_NAME,
		words: [],
		language: 'chinese',
		createdAt: now
	};
	assertValid(input, base.words, undefined, options);
	const nextNo = base.words.reduce((max, w) => Math.max(max, w.No), 0) + 1;
	return {
		...base,
		createdAt: Math.max(now, (base.createdAt || 0) + 1),
		words: [...base.words, toWordRecord(nextNo, input)]
	};
}

export function buildDeckWithUpdatedWord(
	deck: CustomDeck,
	no: number,
	input: MyWordInput,
	options?: MyWordSaveOptions
): CustomDeck {
	const index = deck.words.findIndex((w) => w.No === no);
	if (index === -1) throw new Error('This word no longer exists in My Words');
	assertValid(input, deck.words, no, options);
	const words = [...deck.words];
	words[index] = { ...words[index], ...toWordRecord(no, input) };
	const now = Date.now();
	return {
		...deck,
		createdAt: Math.max(now, (deck.createdAt || 0) + 1),
		words
	};
}

export function buildDeckWithoutWord(deck: CustomDeck, no: number): CustomDeck {
	if (!deck.words.some((w) => w.No === no)) {
		throw new Error('This word no longer exists in My Words');
	}
	const now = Date.now();
	return {
		...deck,
		createdAt: Math.max(now, (deck.createdAt || 0) + 1),
		words: deck.words.filter((w) => w.No !== no)
	};
}
