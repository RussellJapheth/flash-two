import type { CustomDeck, WordRecord } from '$lib/types';
import { getAllCustomDecks, saveCustomDeck } from '$lib/utils/storage';
import { generatePinyin } from '$lib/utils/notebookStorage';
import { lookupExactChineseWord } from '$lib/utils/dictionary';

export const MY_WORDS_DECK_ID = 'custom-my-words';
export const MY_WORDS_DECK_NAME = 'My Words';

const HANZI_REGEX = /[\u4e00-\u9fff]/;

export interface MeaningCandidate {
	meaning: string;
	pinyin?: string;
}

export interface WordSuggestions {
	pinyin: string;
	meanings: MeaningCandidate[];
	examples: string[];
}

/**
 * Generates tone-marked pinyin for a Chinese word when it contains Hanzi.
 * Returns an empty string for empty or non-Hanzi input.
 */
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

/**
 * Extracts up to `maxCandidates` clean, deduplicated English meaning options from
 * matched pack and dictionary entries (splitting on `;` and `/`).
 */
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

/**
 * Finds curated example sentences from built-in packs for a Chinese word.
 * Priority 1: Exact word match in packs.
 * Priority 2: Other pack cards whose example sentence contains the word.
 */
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

/**
 * Looks up Pinyin, selectable English meanings, and pack example sentences for a Chinese word.
 */
export async function lookupWordSuggestions(hanzi: string): Promise<WordSuggestions> {
	const trimmed = hanzi.trim();
	if (!trimmed || !HANZI_REGEX.test(trimmed)) {
		return { pinyin: '', meanings: [], examples: [] };
	}

	const { packMatches, dictMatches, corpusWords } = await lookupExactChineseWord(trimmed);
	const allMatches = [...packMatches, ...dictMatches];
	const meanings = cleanMeaningCandidates(allMatches);
	const examples = findPackExamples(trimmed, corpusWords);
	const pinyin =
		packMatches[0]?.Pinyin ||
		meanings[0]?.pinyin ||
		dictMatches[0]?.Pinyin ||
		generateWordPinyin(trimmed);

	return { pinyin, meanings, examples };
}

export interface MyWordInput {
	word: string;
	pinyin: string;
	meaning: string;
	example: string;
}

export type MyWordField = keyof MyWordInput;
export type MyWordErrors = Partial<Record<MyWordField, string>>;

export const DUPLICATE_WORD_ERROR = 'This word is already in My Words';

function trimInput(input: MyWordInput): MyWordInput {
	return {
		word: input.word.trim(),
		pinyin: input.pinyin.trim(),
		meaning: input.meaning.trim(),
		example: input.example.trim()
	};
}

/**
 * Validates a My Words form submission. Returns an empty object when valid.
 * `editingNo` exempts the word being edited from the duplicate check.
 */
export function validateMyWord(
	input: MyWordInput,
	existing: WordRecord[],
	editingNo?: number
): MyWordErrors {
	const t = trimInput(input);
	const errors: MyWordErrors = {};
	if (!t.word) errors.word = 'Please enter the Chinese word';
	if (!t.pinyin) errors.pinyin = 'Please enter the pinyin';
	if (!t.meaning) errors.meaning = 'Please enter the English meaning';
	if (
		t.word &&
		existing.some((w) => w.No !== editingNo && (w['Chinese Word'] || '').trim() === t.word)
	) {
		errors.word = DUPLICATE_WORD_ERROR;
	}
	return errors;
}

export function toMyWordInput(word: WordRecord): MyWordInput {
	return {
		word: word['Chinese Word'] || '',
		pinyin: word.Pinyin || '',
		meaning: word['English Meaning'] || '',
		example: word['Example (Chinese + Pinyin)'] || ''
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
		'Example (Chinese + Pinyin)': t.example || undefined
	};
}

function assertValid(input: MyWordInput, existing: WordRecord[], editingNo?: number): void {
	const errors = validateMyWord(input, existing, editingNo);
	const first = Object.values(errors)[0];
	if (first) throw new Error(first);
}

/** Pure: returns a new deck with the word appended. Word numbers are never reused. */
export function buildDeckWithAddedWord(deck: CustomDeck | null, input: MyWordInput): CustomDeck {
	const base: CustomDeck = deck ?? {
		id: MY_WORDS_DECK_ID,
		name: MY_WORDS_DECK_NAME,
		words: [],
		language: 'chinese',
		createdAt: Date.now()
	};
	assertValid(input, base.words);
	const nextNo = base.words.reduce((max, w) => Math.max(max, w.No), 0) + 1;
	return { ...base, words: [...base.words, toWordRecord(nextNo, input)] };
}

/** Pure: returns a new deck with the word replaced in place. Keeps `No` so SRS progress stays. */
export function buildDeckWithUpdatedWord(
	deck: CustomDeck,
	no: number,
	input: MyWordInput
): CustomDeck {
	const index = deck.words.findIndex((w) => w.No === no);
	if (index === -1) throw new Error('This word no longer exists in My Words');
	assertValid(input, deck.words, no);
	const words = [...deck.words];
	words[index] = { ...words[index], ...toWordRecord(no, input) };
	return { ...deck, words };
}

/** Pure: returns a new deck without the word. Does not re-index. */
export function buildDeckWithoutWord(deck: CustomDeck, no: number): CustomDeck {
	if (!deck.words.some((w) => w.No === no)) {
		throw new Error('This word no longer exists in My Words');
	}
	return { ...deck, words: deck.words.filter((w) => w.No !== no) };
}

export async function getMyWordsDeck(): Promise<CustomDeck | null> {
	const decks = await getAllCustomDecks();
	return decks.find((d) => d.id === MY_WORDS_DECK_ID) ?? null;
}

async function requireMyWordsDeck(): Promise<CustomDeck> {
	const deck = await getMyWordsDeck();
	if (!deck) throw new Error('My Words could not be found');
	return deck;
}

export async function addMyWord(input: MyWordInput): Promise<CustomDeck> {
	const updated = buildDeckWithAddedWord(await getMyWordsDeck(), input);
	await saveCustomDeck(updated);
	return updated;
}

export async function updateMyWord(no: number, input: MyWordInput): Promise<CustomDeck> {
	const updated = buildDeckWithUpdatedWord(await requireMyWordsDeck(), no, input);
	await saveCustomDeck(updated);
	return updated;
}

export async function deleteMyWord(no: number): Promise<CustomDeck> {
	const updated = buildDeckWithoutWord(await requireMyWordsDeck(), no);
	await saveCustomDeck(updated);
	return updated;
}
