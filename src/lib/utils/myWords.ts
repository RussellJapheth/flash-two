import type { CustomDeck, WordRecord } from '$lib/types';
import { getAllCustomDecks, saveCustomDeck } from '$lib/utils/storage';

export const MY_WORDS_DECK_ID = 'custom-my-words';
export const MY_WORDS_DECK_NAME = 'My Words';

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

