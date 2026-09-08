import type { WordRecord, WordProgress, CustomDeck, SavedWord, StreakStats } from '$lib/types';

const DB_NAME = 'flashcards_db';
const DB_VERSION = 3;

// Raw imports of JSON vocabulary packs for bundling and instant offline initialization
const chinesePacks = import.meta.glob<WordRecord[]>('../data/chinese/*.json', {
	eager: true,
	import: 'default'
});
const frenchPacks = import.meta.glob<WordRecord[]>('../data/french/*.json', {
	eager: true,
	import: 'default'
});

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
	if (typeof window === 'undefined') {
		return Promise.reject(new Error('IndexedDB is only available in browser'));
	}

	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains('progress_store')) {
					db.createObjectStore('progress_store', { keyPath: 'key' });
				}
				if (!db.objectStoreNames.contains('custom_decks')) {
					db.createObjectStore('custom_decks', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('saved_words')) {
					db.createObjectStore('saved_words', { keyPath: 'key' });
				}
				if (!db.objectStoreNames.contains('packs_cache')) {
					db.createObjectStore('packs_cache', { keyPath: 'id' });
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	return dbPromise;
}

// Ensure all bundled packs are cached into IndexedDB for 100% offline availability
export async function initializeOfflinePacks(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		const db = await getDB();
		const tx = db.transaction('packs_cache', 'readwrite');
		const store = tx.objectStore('packs_cache');

		// Chinese packs
		for (const [path, words] of Object.entries(chinesePacks)) {
			const filename = path.split('/').pop()?.replace('.json', '') || '';
			const id = `chinese-${filename}`;
			store.put({ id, language: 'chinese', packName: filename, words });
		}

		// French packs
		for (const [path, words] of Object.entries(frenchPacks)) {
			const filename = path.split('/').pop()?.replace('.json', '') || '';
			const id = `french-${filename}`;
			store.put({ id, language: 'french', packName: filename, words });
		}
	} catch (e) {
		console.warn('Failed to cache packs in IndexedDB:', e);
	}
}

export async function getBuiltinPacks(
	language: 'chinese' | 'french'
): Promise<{ id: string; title: string; words: WordRecord[] }[]> {
	const rawMap = language === 'chinese' ? chinesePacks : frenchPacks;
	const results: { id: string; title: string; words: WordRecord[] }[] = [];

	const sortedEntries = Object.entries(rawMap).sort(([pathA], [pathB]) => {
		const getWeekNum = (p: string) => {
			const m = p.match(/week-(\d+)/);
			return m ? parseInt(m[1], 10) : 0;
		};
		return getWeekNum(pathA) - getWeekNum(pathB);
	});

	for (const [path, words] of sortedEntries) {
		const filename = path.split('/').pop()?.replace('.json', '') || '';
		const weekNum = filename.replace('week-', '');
		const title = `Week ${weekNum} Vocabulary`;
		results.push({
			id: `${language}-${filename}`,
			title,
			words: Array.isArray(words) ? words : []
		});
	}

	return results;
}

export async function getPackWords(
	language: 'chinese' | 'french',
	packId: string
): Promise<WordRecord[]> {
	const packs = await getBuiltinPacks(language);
	const match = packs.find(
		(p) =>
			p.id === packId ||
			p.id === `${language}-${packId}` ||
			p.id.replace(`${language}-`, '') === packId
	);
	return match ? match.words : [];
}

// Progress CRUD
export async function getAllProgress(): Promise<Record<string, WordProgress>> {
	if (typeof window === 'undefined') return {};
	try {
		const db = await getDB();
		return new Promise((resolve) => {
			const tx = db.transaction('progress_store', 'readonly');
			const store = tx.objectStore('progress_store');
			const request = store.getAll();

			request.onsuccess = () => {
				const result: Record<string, WordProgress> = {};
				for (const item of request.result || []) {
					const { key, ...progress } = item;
					result[key] = progress;
				}
				resolve(result);
			};
			request.onerror = () => resolve({});
		});
	} catch {
		return {};
	}
}

export async function saveProgress(progress: WordProgress): Promise<void> {
	if (typeof window === 'undefined') return;
	const key = `${progress.weekId}:${progress.wordNo}`;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress_store', 'readwrite');
		const store = tx.objectStore('progress_store');
		const request = store.put({ key, ...progress });
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function saveBulkProgress(records: Record<string, WordProgress>): Promise<void> {
	if (typeof window === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('progress_store', 'readwrite');
		const store = tx.objectStore('progress_store');
		for (const [key, progress] of Object.entries(records)) {
			store.put({ key, ...progress });
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// Custom Decks CRUD
export async function getAllCustomDecks(): Promise<CustomDeck[]> {
	if (typeof window === 'undefined') return [];
	try {
		const db = await getDB();
		return new Promise((resolve) => {
			const tx = db.transaction('custom_decks', 'readonly');
			const store = tx.objectStore('custom_decks');
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => resolve([]);
		});
	} catch {
		return [];
	}
}

export async function saveCustomDeck(deck: CustomDeck): Promise<void> {
	if (typeof window === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('custom_decks', 'readwrite');
		const store = tx.objectStore('custom_decks');
		const request = store.put(deck);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

export async function deleteCustomDeck(id: string): Promise<void> {
	if (typeof window === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('custom_decks', 'readwrite');
		const store = tx.objectStore('custom_decks');
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
	});
}

// Saved Words CRUD
export async function getAllSavedWords(): Promise<SavedWord[]> {
	if (typeof window === 'undefined') return [];
	try {
		const db = await getDB();
		return new Promise((resolve) => {
			const tx = db.transaction('saved_words', 'readonly');
			const store = tx.objectStore('saved_words');
			const request = store.getAll();
			request.onsuccess = () => {
				resolve(request.result || []);
			};
			request.onerror = () => resolve([]);
		});
	} catch {
		return [];
	}
}

export async function isWordSaved(weekId: string, wordNo: number): Promise<boolean> {
	const key = `${weekId}:${wordNo}`;
	if (typeof window === 'undefined') return false;
	try {
		const db = await getDB();
		return new Promise((resolve) => {
			const tx = db.transaction('saved_words', 'readonly');
			const store = tx.objectStore('saved_words');
			const req = store.get(key);
			req.onsuccess = () => resolve(!!req.result);
			req.onerror = () => resolve(false);
		});
	} catch {
		return false;
	}
}

export async function toggleSavedWord(weekId: string, wordNo: number): Promise<boolean> {
	const key = `${weekId}:${wordNo}`;
	if (typeof window === 'undefined') return false;
	const db = await getDB();
	const currentlySaved = await isWordSaved(weekId, wordNo);

	return new Promise((resolve, reject) => {
		const tx = db.transaction('saved_words', 'readwrite');
		const store = tx.objectStore('saved_words');
		if (currentlySaved) {
			const req = store.delete(key);
			req.onsuccess = () => resolve(false);
			req.onerror = () => reject(req.error);
		} else {
			const req = store.put({ key, weekId, wordNo, savedAt: Date.now() });
			req.onsuccess = () => resolve(true);
			req.onerror = () => reject(req.error);
		}
	});
}

// LocalStorage User & Language
export function getSavedUsername(): string {
	if (typeof window === 'undefined') return 'russell';
	return localStorage.getItem('flashcards_user') || 'russell';
}

export function setSavedUsername(name: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('flashcards_user', name.trim().toLowerCase());
	}
}

export function getSavedLanguage(): 'chinese' | 'french' {
	if (typeof window === 'undefined') return 'chinese';
	const lang = localStorage.getItem('flashcards_language');
	return lang === 'french' ? 'french' : 'chinese';
}

export function setSavedLanguage(lang: 'chinese' | 'french'): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem('flashcards_language', lang);
	}
}

export function recordRecentlyOpenedPack(packId: string): void {
	if (typeof window === 'undefined' || !packId) return;
	try {
		const raw = localStorage.getItem('flashcards_recent_packs');
		const list: string[] = raw ? JSON.parse(raw) : [];
		const updated = [packId, ...list.filter((id) => id !== packId)].slice(0, 10);
		localStorage.setItem('flashcards_recent_packs', JSON.stringify(updated));
	} catch (e) {
		console.warn('Failed to save recent pack:', e);
	}
}

export function getRecentlyOpenedPackIds(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem('flashcards_recent_packs');
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

// Streak Computation

export function computeStreakStats(progress: Record<string, WordProgress>): StreakStats {
	const datesSet = new Set<string>();
	let totalReviews = 0;

	for (const p of Object.values(progress)) {
		if (p.lastReviewed) {
			const d = new Date(p.lastReviewed);
			const isoDate = d.toISOString().split('T')[0];
			datesSet.add(isoDate);
			totalReviews += (p.correct || 0) + (p.wrong || 0);
		}
	}

	const sortedDates = Array.from(datesSet).sort().reverse();
	let currentStreak = 0;
	let longestStreak = 0;

	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

	// Check if today or yesterday was active
	if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
		let checkDate = sortedDates.includes(today) ? new Date() : new Date(Date.now() - 86400000);
		while (true) {
			const iso = checkDate.toISOString().split('T')[0];
			if (sortedDates.includes(iso)) {
				currentStreak++;
				checkDate = new Date(checkDate.getTime() - 86400000);
			} else {
				break;
			}
		}
	}

	// Longest streak calculation
	let running = 0;
	const ascendingDates = Array.from(datesSet).sort();
	for (let i = 0; i < ascendingDates.length; i++) {
		if (i === 0) {
			running = 1;
		} else {
			const prev = new Date(ascendingDates[i - 1]).getTime();
			const curr = new Date(ascendingDates[i]).getTime();
			const diffDays = Math.round((curr - prev) / 86400000);
			if (diffDays === 1) {
				running++;
			} else {
				running = 1;
			}
		}
		if (running > longestStreak) {
			longestStreak = running;
		}
	}

	if (currentStreak > longestStreak) longestStreak = currentStreak;

	// Determine Tier
	let tierName = 'Novice Explorer';
	if (currentStreak >= 30) tierName = 'Tier 2 Habit Hero';
	else if (currentStreak >= 14) tierName = 'Flame Master';
	else if (currentStreak >= 7) tierName = 'Weekly Warrior';
	else if (currentStreak >= 3) tierName = 'Streak Starter';

	return {
		currentStreak: Math.max(currentStreak, datesSet.size > 0 ? 1 : 0),
		longestStreak: Math.max(longestStreak, currentStreak),
		freezeCount: 2,
		tierName,
		totalReviews,
		activeDates: Array.from(datesSet)
	};
}
