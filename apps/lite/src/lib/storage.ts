import type {
	CustomDeck,
	WordProgress,
	WordRecord,
	StreakStats,
	StreakFreezeData,
	UserXPData
} from '@flash/shared';
import {
	MY_WORDS_DECK_ID,
	MY_WORDS_DECK_NAME,
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	computeStreakStats,
	getStreakFreezeData,
	saveStreakFreezeData,
	getStreakTierName,
	getOffsetIsoDate,
	type MyWordInput,
	type MyWordSaveOptions
} from '@flash/shared';
import { healWordRecord, healWordRecordWithDict, isCrossRefGloss } from './generator';
import { migrateWeekCategory } from './weeks';

export {
	computeStreakStats,
	getStreakFreezeData,
	saveStreakFreezeData,
	getStreakTierName,
	getOffsetIsoDate
};
export type { StreakStats, StreakFreezeData };

const DB_NAME = 'flashcards_lite_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;
const dataMutationListeners = new Set<() => void>();

export function registerDataMutationListener(fn: () => void): () => void {
	dataMutationListeners.add(fn);
	return () => {
		dataMutationListeners.delete(fn);
	};
}

export function notifyMutation(): void {
	for (const fn of dataMutationListeners) {
		try {
			fn();
		} catch (err) {
			console.error('Error in storage mutation listener:', err);
		}
	}
}

function getDB(): Promise<IDBDatabase> {
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
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
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
		return { id: MY_WORDS_DECK_ID, name: MY_WORDS_DECK_NAME, words: [], language: 'chinese' };
	}
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('decks', 'readonly');
		const req = tx.objectStore('decks').get(MY_WORDS_DECK_ID);
		req.onsuccess = () => {
			if (req.result) {
				const deck: CustomDeck = req.result;
				let healed = false;
				if (Array.isArray(deck.words)) {
					for (const word of deck.words) {
						if (healWordRecord(word)) {
							healed = true;
						}
						const migratedCat = migrateWeekCategory(word.category);
						if (migratedCat !== word.category) {
							word.category = migratedCat;
							healed = true;
						}
					}
					if (healed) {
						saveMyWordsDeck(deck).catch(() => {});
					}
					const hasUnhealed = deck.words.some((w) => isCrossRefGloss(w['English Meaning'] || ''));
					if (hasUnhealed) {
						Promise.all(deck.words.map((w) => healWordRecordWithDict(w)))
							.then((results) => {
								if (results.some(Boolean)) {
									saveMyWordsDeck(deck).catch(() => {});
								}
							})
							.catch(() => {});
					}
				}
				resolve(deck);
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
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('decks', 'readwrite');
		tx.objectStore('decks').put(deck);
		tx.oncomplete = () => {
			notifyMutation();
			resolve();
		};
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
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return {};
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
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return undefined;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readonly');
		const req = tx.objectStore('progress').get(key);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function saveWordProgress(key: string, progress: WordProgress): Promise<void> {
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readwrite');
		tx.objectStore('progress').put(progress, key);
		tx.oncomplete = () => {
			notifyMutation();
			resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}

export async function saveBulkProgress(
	records: Record<string, WordProgress>,
	skipNotify = false
): Promise<void> {
	if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress', 'readwrite');
		const store = tx.objectStore('progress');
		for (const [key, val] of Object.entries(records)) {
			store.put(val, key);
		}
		tx.oncomplete = () => {
			if (!skipNotify) notifyMutation();
			resolve();
		};
		tx.onerror = () => reject(tx.error);
	});
}

const USER_STORAGE_KEY = 'flashcards_lite_user';

export function isValidUsername(name: string): boolean {
	const trimmed = name.trim().toLowerCase();
	return trimmed.length >= 2 && trimmed.length <= 30 && /^[a-z0-9-]+$/.test(trimmed);
}

export function getSavedUsername(): string {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return '';
	return localStorage.getItem(USER_STORAGE_KEY) || '';
}

export function setSavedUsername(name: string): void {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
	const clean = name.trim().toLowerCase();
	if (!clean) {
		localStorage.removeItem(USER_STORAGE_KEY);
	} else if (isValidUsername(clean)) {
		localStorage.setItem(USER_STORAGE_KEY, clean);
	}
}

export const FLASHCARDS_USER_XP_KEY = 'flashcards_user_xp';

export function getUserXPData(): UserXPData | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(FLASHCARDS_USER_XP_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// ignore
	}
	return null;
}

export function saveUserXPData(data: UserXPData): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(FLASHCARDS_USER_XP_KEY, JSON.stringify(data));
	} catch {
		// ignore
	}
}

export async function getStreakStats(): Promise<StreakStats> {
	const progress = await getAllProgress();
	const xpData = getUserXPData();
	return computeStreakStats(progress, getStreakFreezeData(), xpData?.dailyXP);
}

export async function exportLiteBackup(): Promise<string> {
	const deck = await getMyWordsDeck();
	const progress = await getAllProgress();
	const streakFreezeData = getStreakFreezeData();
	const xpData = getUserXPData();
	return JSON.stringify(
		{
			version: 1,
			app: 'flashcards-lite',
			exportedAt: Date.now(),
			customDecks: [deck],
			progress,
			streakFreezeData,
			xpData: xpData || undefined
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
		for (const w of words) {
			w.category = migrateWeekCategory(w.category);
		}
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

	if (parsed.streakFreezeData && Array.isArray(parsed.streakFreezeData.usedDates)) {
		saveStreakFreezeData({
			usedDates: parsed.streakFreezeData.usedDates.filter(
				(d: unknown): d is string => typeof d === 'string'
			)
		});
	}

	if (parsed.xpData && typeof parsed.xpData === 'object') {
		saveUserXPData(parsed.xpData);
	}

	notifyMutation();
	return { success: true, wordsCount: words.length };
}
