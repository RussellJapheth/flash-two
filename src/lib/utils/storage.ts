import type {
	WordRecord,
	WordProgress,
	CustomDeck,
	SavedWord,
	StreakStats,
	StreakFreezeData
} from '$lib/types';

const DB_NAME = 'flashcards_db';
const DB_VERSION = 3;
const FLASHCARDS_STREAK_FREEZES = 'flashcards_streak_freezes';

export function getStreakFreezeData(): StreakFreezeData {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return { usedDates: [] };
	}
	try {
		const raw = localStorage.getItem(FLASHCARDS_STREAK_FREEZES);
		if (!raw) return { usedDates: [] };
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed?.usedDates)) {
			const validDates: string[] = parsed.usedDates.filter(
				(d: unknown): d is string => typeof d === 'string'
			);
			return {
				usedDates: Array.from(new Set(validDates)).sort()
			};
		}
		return { usedDates: [] };
	} catch {
		return { usedDates: [] };
	}
}

export function saveStreakFreezeData(data: StreakFreezeData): void {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
	try {
		const validDates: string[] = (data.usedDates || []).filter(
			(d: unknown): d is string => typeof d === 'string'
		);
		const cleaned: StreakFreezeData = {
			usedDates: Array.from(new Set(validDates)).sort()
		};
		localStorage.setItem(FLASHCARDS_STREAK_FREEZES, JSON.stringify(cleaned));
	} catch (e) {
		console.error('Failed to save streak freeze data:', e);
	}
}

export interface RawPackData {
	title?: string;
	words?: WordRecord[];
}

// Raw imports of JSON vocabulary packs for bundling and instant offline initialization
const chinesePacks = import.meta.glob<WordRecord[] | RawPackData>('../data/chinese/*.json', {
	eager: true,
	import: 'default'
});
const frenchPacks = import.meta.glob<WordRecord[] | RawPackData>('../data/french/*.json', {
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

export const CHINESE_VOCAB_SCHEMA_VERSION = 'v2_hsk_curriculum';
export const CHINESE_MIGRATION_KEY = 'flashcards_chinese_vocab_version';

export function isChinesePack1to9Key(key: string): boolean {
	return /^(?:chinese-)?(?:week-|pack-)?([1-9]):\d+$/i.test(key);
}

export function isChinesePack1to9Saved(weekId: string): boolean {
	return /^(?:chinese-)?(?:week-|pack-)?([1-9])$/i.test(weekId);
}

export function filterOutPack1to9Progress(
	progress: Record<string, WordProgress>
): Record<string, WordProgress> {
	const result: Record<string, WordProgress> = {};
	for (const [k, v] of Object.entries(progress)) {
		if (!isChinesePack1to9Key(k)) {
			result[k] = v;
		}
	}
	return result;
}

export function filterOutPack1to9Saved(savedList: SavedWord[]): SavedWord[] {
	return savedList.filter((item) => !isChinesePack1to9Saved(item.weekId));
}

export async function executeChinesePacksMigration(
	db: IDBDatabase
): Promise<{ purgedProgress: number; purgedSaved: number }> {
	let purgedProgress = 0;
	let purgedSaved = 0;

	// 1. Purge progress for packs 1-9
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction('progress_store', 'readwrite');
		const store = tx.objectStore('progress_store');
		const req = store.getAll();
		req.onsuccess = () => {
			const items = req.result || [];
			for (const item of items) {
				if (item.key && isChinesePack1to9Key(item.key)) {
					store.delete(item.key);
					purgedProgress++;
				}
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});

	// 2. Purge saved words for packs 1-9
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction('saved_words', 'readwrite');
		const store = tx.objectStore('saved_words');
		const req = store.getAll();
		req.onsuccess = () => {
			const items = req.result || [];
			for (const item of items) {
				if (item.weekId && isChinesePack1to9Saved(item.weekId)) {
					store.delete(item.key);
					purgedSaved++;
				}
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});

	return { purgedProgress, purgedSaved };
}

// Ensure all bundled packs are cached into IndexedDB for 100% offline availability
export async function initializeOfflinePacks(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		const db = await getDB();

		// Check if migration is needed for Chinese packs 1-9
		const currentVersion = localStorage.getItem(CHINESE_MIGRATION_KEY);
		if (currentVersion !== CHINESE_VOCAB_SCHEMA_VERSION) {
			await executeChinesePacksMigration(db);
			localStorage.setItem(CHINESE_MIGRATION_KEY, CHINESE_VOCAB_SCHEMA_VERSION);
		}

		const tx = db.transaction('packs_cache', 'readwrite');
		const store = tx.objectStore('packs_cache');

		// Chinese packs
		for (const [path, raw] of Object.entries(chinesePacks)) {
			const filename = path.split('/').pop()?.replace('.json', '') || '';
			const id = `chinese-${filename}`;
			const words = Array.isArray(raw) ? raw : raw?.words || [];
			const title = !Array.isArray(raw) && raw?.title ? raw.title : undefined;
			store.put({ id, language: 'chinese', packName: filename, title, words });
		}

		// French packs
		for (const [path, raw] of Object.entries(frenchPacks)) {
			const filename = path.split('/').pop()?.replace('.json', '') || '';
			const id = `french-${filename}`;
			const words = Array.isArray(raw) ? raw : raw?.words || [];
			const title = !Array.isArray(raw) && raw?.title ? raw.title : undefined;
			store.put({ id, language: 'french', packName: filename, title, words });
		}
	} catch (e) {
		console.warn('Failed to cache packs in IndexedDB:', e);
	}
}

export async function clearOfflineCache(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		const db = await getDB();
		const tx = db.transaction('packs_cache', 'readwrite');
		const store = tx.objectStore('packs_cache');
		store.clear();
		await new Promise<void>((resolve, reject) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});

		if ('caches' in window) {
			const cacheKeys = await caches.keys();
			await Promise.all(cacheKeys.map((key) => caches.delete(key)));
		}

		localStorage.removeItem('flashcards_recent_packs');
	} catch (e) {
		console.warn('Failed to clear offline cache:', e);
	}
}

export async function getBuiltinPacks(
	language: 'chinese' | 'french'
): Promise<{ id: string; title: string; words: WordRecord[] }[]> {
	const rawMap = language === 'chinese' ? chinesePacks : frenchPacks;
	const results: { id: string; title: string; words: WordRecord[] }[] = [];

	const sortedEntries = Object.entries(rawMap).sort(([pathA], [pathB]) => {
		const getPackNum = (p: string) => {
			const m = p.match(/(?:week-|pack-)?(\d+)/i);
			return m ? parseInt(m[1], 10) : 0;
		};
		return getPackNum(pathA) - getPackNum(pathB);
	});

	for (const [path, raw] of sortedEntries) {
		const filename = path.split('/').pop()?.replace('.json', '') || '';
		const packNum = filename.replace(/^(?:week-|pack-)/i, '');
		const words = Array.isArray(raw) ? raw : raw?.words || [];
		const title = !Array.isArray(raw) && raw?.title ? raw.title : `Pack ${packNum}`;
		results.push({
			id: `${language}-${filename}`,
			title,
			words
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

/**
 * Resolves progress for a specific word, supporting legacy keys (e.g. `week-1:5`, `pack-1:5`, `1:5`)
 * and language-prefixed keys (e.g. `chinese-week-1:5`, `chinese-pack-1:5`, `chinese-1:5`).
 */
export function getWordProgress(
	progress: Record<string, WordProgress> | undefined,
	packId: string,
	wordNo: number,
	language?: string
): WordProgress | undefined {
	if (!progress) return undefined;

	// 1. Direct match
	const directKey = `${packId}:${wordNo}`;
	if (progress[directKey]) return progress[directKey];

	// 2. Stripped prefix match
	const strippedPackId = packId.replace(/^(?:chinese|french)-/, '');
	const strippedKey = `${strippedPackId}:${wordNo}`;
	if (progress[strippedKey]) return progress[strippedKey];

	// 3. Language prefixed match
	if (language) {
		const prefixedKey = `${language}-${strippedPackId}:${wordNo}`;
		if (progress[prefixedKey]) return progress[prefixedKey];
	}

	// 4. Numbered pack/week variations (e.g. week-1 vs pack-1 vs 1)
	const numMatch = packId.match(/(?:week-|pack-)?(\d+)/i);
	if (numMatch) {
		const num = numMatch[1];
		const candidateKeys: string[] = [
			`week-${num}:${wordNo}`,
			`pack-${num}:${wordNo}`,
			`${num}:${wordNo}`
		];
		if (language) {
			candidateKeys.unshift(
				`${language}-week-${num}:${wordNo}`,
				`${language}-pack-${num}:${wordNo}`,
				`${language}-${num}:${wordNo}`
			);
		}
		for (const k of candidateKeys) {
			if (progress[k]) return progress[k];
		}
	}

	return undefined;
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
		const tx = db.transaction(['custom_decks', 'progress_store', 'saved_words'], 'readwrite');
		const deckStore = tx.objectStore('custom_decks');
		const progStore = tx.objectStore('progress_store');
		const savedStore = tx.objectStore('saved_words');

		deckStore.put(deck);

		// Clean up any progress entries for word numbers exceeding current deck word count
		const progReq = progStore.getAll();
		progReq.onsuccess = () => {
			const all = progReq.result || [];
			for (const item of all) {
				if (item.weekId === deck.id && item.wordNo > deck.words.length) {
					progStore.delete(item.key || `${item.weekId}:${item.wordNo}`);
				}
			}
		};

		// Clean up any saved word entries for word numbers exceeding current deck word count
		const savedReq = savedStore.getAll();
		savedReq.onsuccess = () => {
			const all = savedReq.result || [];
			for (const item of all) {
				if (item.weekId === deck.id && item.wordNo > deck.words.length) {
					savedStore.delete(item.key || `${item.weekId}:${item.wordNo}`);
				}
			}
		};

		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function deleteCustomDeck(id: string): Promise<void> {
	if (typeof window === 'undefined') return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(['custom_decks', 'progress_store', 'saved_words'], 'readwrite');
		const deckStore = tx.objectStore('custom_decks');
		const progStore = tx.objectStore('progress_store');
		const savedStore = tx.objectStore('saved_words');

		deckStore.delete(id);

		// Delete all progress associated with this deck
		const progReq = progStore.getAll();
		progReq.onsuccess = () => {
			const all = progReq.result || [];
			for (const item of all) {
				if (item.weekId === id || (item.key && item.key.startsWith(`${id}:`))) {
					progStore.delete(item.key || `${item.weekId}:${item.wordNo}`);
				}
			}
		};

		// Delete all saved words associated with this deck
		const savedReq = savedStore.getAll();
		savedReq.onsuccess = () => {
			const all = savedReq.result || [];
			for (const item of all) {
				if (item.weekId === id || (item.key && item.key.startsWith(`${id}:`))) {
					savedStore.delete(item.key || `${item.weekId}:${item.wordNo}`);
				}
			}
		};

		// Clean up recently opened packs in localStorage
		try {
			const recent = getRecentlyOpenedPackIds().filter((packId) => packId !== id);
			localStorage.setItem('flashcards_recent_packs', JSON.stringify(recent));
		} catch {
			// ignore localStorage error
		}

		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
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
	if (typeof window === 'undefined') return false;
	const key = `${weekId}:${wordNo}`;
	const altKey =
		weekId.startsWith('chinese-') || weekId.startsWith('french-')
			? `${weekId.replace(/^(chinese|french)-/, '')}:${wordNo}`
			: undefined;

	try {
		const db = await getDB();
		return new Promise((resolve) => {
			const tx = db.transaction('saved_words', 'readonly');
			const store = tx.objectStore('saved_words');
			const req = store.get(key);
			req.onsuccess = () => {
				if (req.result) {
					resolve(true);
				} else if (altKey) {
					const altReq = store.get(altKey);
					altReq.onsuccess = () => resolve(!!altReq.result);
					altReq.onerror = () => resolve(false);
				} else {
					resolve(false);
				}
			};
			req.onerror = () => resolve(false);
		});
	} catch {
		return false;
	}
}

export async function toggleSavedWord(weekId: string, wordNo: number): Promise<boolean> {
	if (typeof window === 'undefined') return false;
	const key = `${weekId}:${wordNo}`;
	const altKey =
		weekId.startsWith('chinese-') || weekId.startsWith('french-')
			? `${weekId.replace(/^(chinese|french)-/, '')}:${wordNo}`
			: undefined;

	const db = await getDB();
	const currentlySaved = await isWordSaved(weekId, wordNo);

	return new Promise((resolve, reject) => {
		const tx = db.transaction('saved_words', 'readwrite');
		const store = tx.objectStore('saved_words');
		if (currentlySaved) {
			store.delete(key);
			if (altKey) store.delete(altKey);
			tx.oncomplete = () => resolve(false);
			tx.onerror = () => reject(tx.error);
		} else {
			const req = store.put({ key, weekId, wordNo, savedAt: Date.now() });
			req.onsuccess = () => resolve(true);
			req.onerror = () => reject(req.error);
		}
	});
}

export async function saveBulkSavedWords(words: SavedWord[]): Promise<void> {
	if (typeof window === 'undefined' || !words.length) return;
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction('saved_words', 'readwrite');
		const store = tx.objectStore('saved_words');
		for (const w of words) {
			const key = `${w.weekId}:${w.wordNo}`;
			store.put({ key, ...w });
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

// LocalStorage User & Language
export function isValidUsername(name: string): boolean {
	return /^[a-z0-9-]+$/.test(name);
}

export function getSavedUsername(): string {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return '';
	return localStorage.getItem('flashcards_user') || '';
}

export function setSavedUsername(name: string): void {
	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		const clean = name.trim().toLowerCase();
		if (!clean) {
			localStorage.setItem('flashcards_user', '');
		} else if (isValidUsername(clean)) {
			localStorage.setItem('flashcards_user', clean);
		}
	}
}

export function getSavedLanguage(): 'chinese' | 'french' {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return 'chinese';
	const lang = localStorage.getItem('flashcards_language');
	return lang === 'french' ? 'french' : 'chinese';
}

export function setSavedLanguage(lang: 'chinese' | 'french'): void {
	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		localStorage.setItem('flashcards_language', lang);
	}
}

export const LEADERBOARD_DISABLED_KEY = 'flashcards_disable_leaderboards';

export function isLeaderboardDisabled(): boolean {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return true;
	const val = localStorage.getItem(LEADERBOARD_DISABLED_KEY);
	if (val === null) return true; // Default for new users is ON (leaderboards disabled)
	return val === 'true';
}

export function setLeaderboardDisabled(disabled: boolean): void {
	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		localStorage.setItem(LEADERBOARD_DISABLED_KEY, String(disabled));
	}
}

export const DEBUG_MODE_KEY = 'flashcards_debug_mode';

export function isDebugModeEnabled(): boolean {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
	const val = localStorage.getItem(DEBUG_MODE_KEY);
	return val === 'true'; // Default is OFF (false)
}

export function setDebugModeEnabled(enabled: boolean): void {
	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		localStorage.setItem(DEBUG_MODE_KEY, String(enabled));
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

export function computeStreakStats(
	progress: Record<string, WordProgress>,
	customFreezeData?: StreakFreezeData
): StreakStats {
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

	const freezeData = customFreezeData || getStreakFreezeData();
	const freezeSet = new Set<string>(freezeData.usedDates || []);

	// Combined valid days (practiced days + frozen days)
	const combinedDatesSet = new Set<string>([...datesSet, ...freezeSet]);
	const sortedCombined = Array.from(combinedDatesSet).sort().reverse();

	let currentStreak = 0;
	let longestStreak = 0;

	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

	// Check if today or yesterday was active or frozen
	if (sortedCombined.includes(today) || sortedCombined.includes(yesterday)) {
		let checkDate = sortedCombined.includes(today) ? new Date() : new Date(Date.now() - 86400000);
		while (true) {
			const iso = checkDate.toISOString().split('T')[0];
			if (combinedDatesSet.has(iso)) {
				currentStreak++;
				checkDate = new Date(checkDate.getTime() - 86400000);
			} else {
				break;
			}
		}
	}

	// Longest streak calculation
	let running = 0;
	const ascendingDates = Array.from(combinedDatesSet).sort();
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

	// Calculate earned streak freezes:
	// Starts at 0, earns 1 more every 5 consecutive days (max 3 streak freezes).
	// Count active practice days vs used freeze days in the current streak window:
	let activeDaysInStreak = 0;
	let usedFreezesInStreak = 0;
	if (currentStreak > 0) {
		let checkDate = sortedCombined.includes(today) ? new Date() : new Date(Date.now() - 86400000);
		for (let s = 0; s < currentStreak; s++) {
			const iso = checkDate.toISOString().split('T')[0];
			if (datesSet.has(iso)) {
				activeDaysInStreak++;
			} else if (freezeSet.has(iso)) {
				usedFreezesInStreak++;
			}
			checkDate = new Date(checkDate.getTime() - 86400000);
		}
	}

	const earnedFreezes = Math.floor(activeDaysInStreak / 5);
	const freezeCount = Math.min(3, Math.max(0, earnedFreezes - usedFreezesInStreak));

	// Determine Tier
	let tierName = 'Novice Explorer';
	if (currentStreak >= 30) tierName = 'Tier 2 Habit Hero';
	else if (currentStreak >= 14) tierName = 'Flame Master';
	else if (currentStreak >= 7) tierName = 'Weekly Warrior';
	else if (currentStreak >= 3) tierName = 'Streak Starter';

	return {
		currentStreak,
		longestStreak,
		freezeCount,
		tierName,
		totalReviews,
		activeDates: Array.from(datesSet),
		freezeDates: Array.from(freezeSet)
	};
}
