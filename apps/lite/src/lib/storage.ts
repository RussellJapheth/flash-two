import type { CustomDeck, WordProgress, WordRecord } from '@flash/shared';
import {
	MY_WORDS_DECK_ID,
	MY_WORDS_DECK_NAME,
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	type MyWordInput,
	type MyWordSaveOptions
} from '@flash/shared';

const DB_NAME = 'flashcards_lite_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('IndexedDB is only available in browser'));
	}
	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains('decks')) {
					db.createObjectStore('decks', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('progress')) {
					db.createObjectStore('progress');
				}
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}
	return dbPromise;
}

export async function getMyWordsDeck(): Promise<CustomDeck> {
	if (typeof window === 'undefined') {
		return { id: MY_WORDS_DECK_ID, name: MY_WORDS_DECK_NAME, words: [], language: 'chinese' };
	}
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('decks', 'readonly');
		const req = tx.objectStore('decks').get(MY_WORDS_DECK_ID);
		req.onsuccess = () => {
			if (req.result) {
				resolve(req.result);
			} else {
				const defaultDeck: CustomDeck = {
					id: MY_WORDS_DECK_ID,
					name: MY_WORDS_DECK_NAME,
					words: [],
					language: 'chinese',
					createdAt: Date.now()
				};
				resolve(defaultDeck);
			}
		};
		req.onerror = () => reject(req.error);
	});
}

export async function saveMyWordsDeck(deck: CustomDeck): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('decks', 'readwrite');
		tx.objectStore('decks').put(deck);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function addMyWord(
	input: MyWordInput,
	options?: MyWordSaveOptions
): Promise<CustomDeck> {
	const current = await getMyWordsDeck();
	const updated = buildDeckWithAddedWord(current, input, options);
	await saveMyWordsDeck(updated);
	return updated;
}

export async function addMyWordsBulk(
	inputs: MyWordInput[],
	options?: MyWordSaveOptions
): Promise<CustomDeck> {
	let current = await getMyWordsDeck();
	for (const input of inputs) {
		current = buildDeckWithAddedWord(current, input, options);
	}
	await saveMyWordsDeck(current);
	return current;
}

export async function updateMyWord(
	no: number,
	input: MyWordInput,
	options?: MyWordSaveOptions
): Promise<CustomDeck> {
	const current = await getMyWordsDeck();
	const updated = buildDeckWithUpdatedWord(current, no, input, options);
	await saveMyWordsDeck(updated);
	return updated;
}

export async function deleteMyWord(no: number): Promise<CustomDeck> {
	const current = await getMyWordsDeck();
	const updated = buildDeckWithoutWord(current, no);
	await saveMyWordsDeck(updated);
	return updated;
}

export async function getAllProgress(): Promise<Record<string, WordProgress>> {
	if (typeof window === 'undefined') return {};
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readonly');
		const store = tx.objectStore('progress');
		const req = store.openCursor();
		const result: Record<string, WordProgress> = {};
		req.onsuccess = (e) => {
			const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
			if (cursor) {
				result[cursor.key as string] = cursor.value;
				cursor.continue();
			} else {
				resolve(result);
			}
		};
		req.onerror = () => reject(req.error);
	});
}

export async function getWordProgress(key: string): Promise<WordProgress | undefined> {
	if (typeof window === 'undefined') return undefined;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readonly');
		const req = tx.objectStore('progress').get(key);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function saveWordProgress(key: string, progress: WordProgress): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readwrite');
		tx.objectStore('progress').put(progress, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function exportLiteBackup(): Promise<string> {
	const deck = await getMyWordsDeck();
	const progress = await getAllProgress();
	return JSON.stringify(
		{
			version: 1,
			app: 'flashcards-lite',
			exportedAt: Date.now(),
			customDecks: [deck],
			progress
		},
		null,
		2
	);
}

export async function importLiteBackup(
	jsonString: string
): Promise<{ success: boolean; wordsCount: number }> {
	const parsed = JSON.parse(jsonString);
	let words: WordRecord[] = [];

	if (Array.isArray(parsed.customDecks)) {
		const myWords = parsed.customDecks.find((d: CustomDeck) => d.id === MY_WORDS_DECK_ID);
		if (myWords?.words) {
			words = myWords.words;
		} else if (parsed.customDecks[0]?.words) {
			words = parsed.customDecks[0].words;
		}
	} else if (Array.isArray(parsed.words)) {
		words = parsed.words;
	}

	if (words.length > 0) {
		const current = await getMyWordsDeck();
		const merged = {
			...current,
			words,
			createdAt: Date.now()
		};
		await saveMyWordsDeck(merged);
	}

	if (parsed.progress && typeof parsed.progress === 'object') {
		const db = await getDB();
		const tx = db.transaction('progress', 'readwrite');
		const store = tx.objectStore('progress');
		for (const [key, val] of Object.entries(parsed.progress)) {
			store.put(val, key);
		}
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	return { success: true, wordsCount: words.length };
}
