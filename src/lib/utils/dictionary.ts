import type { WordRecord, CustomDeck } from '$lib/types';
import { getAllCustomDecks, saveCustomDeck, getBuiltinPacks } from '$lib/utils/storage';

export const PERSONAL_DICTIONARY_DECK_ID = 'personal-dictionary';

const TONES: Record<string, string[]> = {
	a: ['a', 'ā', 'á', 'ǎ', 'à', 'a'],
	e: ['e', 'ē', 'é', 'ě', 'è', 'e'],
	i: ['i', 'ī', 'í', 'ǐ', 'ì', 'i'],
	o: ['o', 'ō', 'ó', 'ǒ', 'ò', 'o'],
	u: ['u', 'ū', 'ú', 'ǔ', 'ù', 'u'],
	v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
	ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
};

export function convertSyllableToAccent(syllable: string): string {
	if (!syllable) return '';
	let s = syllable.replace(/u:/g, 'v').replace(/ü/g, 'v').replace(/ü/g, 'v');
	const m = s.match(/([1-5])$/) || s.match(/([1-5])/);
	if (!m) return s.replace(/v/g, 'ü');

	const tone = parseInt(m[1], 10);
	s = s.slice(0, m.index) + s.slice(m.index! + m[0].length);

	if (tone === 5 || tone === 0) return s.replace(/v/g, 'ü');

	const sLower = s.toLowerCase();
	let targetIdx = -1;

	if (sLower.includes('a')) targetIdx = sLower.indexOf('a');
	else if (sLower.includes('e')) targetIdx = sLower.indexOf('e');
	else if (sLower.includes('ou')) targetIdx = sLower.indexOf('o');
	else {
		for (let i = s.length - 1; i >= 0; i--) {
			if ('iouvü'.includes(sLower[i])) {
				targetIdx = i;
				break;
			}
		}
	}

	if (targetIdx !== -1) {
		const char = s[targetIdx];
		const charLower = char.toLowerCase();
		if (TONES[charLower]) {
			let accented = TONES[charLower][tone];
			if (char === char.toUpperCase()) accented = accented.toUpperCase();
			s = s.slice(0, targetIdx) + accented + s.slice(targetIdx + 1);
		}
	}

	return s.replace(/v/g, 'ü');
}

const PINYIN_OVERRIDES: Record<string, string> = {
	魣: 'xù',
	魣鱼: 'xù yú',
	魣魚: 'xù yú'
};

/**
 * Formats Pinyin with tone numbers (e.g. "yu2 yue4") into proper accented Pinyin ("yú yuè").
 * Accepts optional chineseWord to apply known Pinyin corrections.
 */
export function formatPinyin(pinyinStr: string, chineseWord?: string): string {
	if (chineseWord && PINYIN_OVERRIDES[chineseWord]) {
		return PINYIN_OVERRIDES[chineseWord];
	}
	if (!pinyinStr) return '';
	if (!/[1-5]/.test(pinyinStr) && !pinyinStr.includes('u:')) return pinyinStr;

	const words = pinyinStr.split(' ');
	const res: string[] = [];

	for (const word of words) {
		const syllables = word.match(/[a-zA-Z:\u00fc\u00dc]+[1-5]?/g);
		if (syllables) {
			res.push(syllables.map((s) => convertSyllableToAccent(s)).join(' '));
		} else {
			res.push(convertSyllableToAccent(word));
		}
	}

	return res.join(' ');
}

/**
 * Normalizes Pinyin for search matching:
 * Converts tone marks (āáǎà -> a, etc.) and tone numbers (ni3hao3 -> nihao) to plain lowercase string.
 */
export function normalizePinyin(str: string): string {
	if (!str) return '';
	let normalized = str
		.replace(/[üǖǘǚǜ]/gi, 'v')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // remove diacritics / tone accents
		.toLowerCase();

	// Remove tone numbers (1-5)
	normalized = normalized.replace(/[1-5]/g, '');

	// Strip non-alphanumeric
	return normalized.replace(/[^a-z0-9]/g, '');
}

/**
 * Normalizes Chinese text for exact / partial matching
 */
export function normalizeChinese(str: string): string {
	if (!str) return '';
	return str.trim().toLowerCase();
}

/**
 * Searches local packs, custom decks, and dictionary dataset for a query string.
 * Supports Chinese Characters, Pinyin, and English meanings.
 */
export async function searchDictionary(query: string): Promise<WordRecord[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const normQuery = trimmed.toLowerCase();
	const normPinyinQuery = normalizePinyin(trimmed);
	const normZhQuery = normalizeChinese(trimmed);

	const results: WordRecord[] = [];
	const seenWords = new Set<string>();

	// 1. Gather all words from preloaded packs
	const packs = await getBuiltinPacks('chinese');
	const allPacksWords: WordRecord[] = [];
	for (const pack of packs) {
		if (Array.isArray(pack.words)) {
			allPacksWords.push(...pack.words);
		}
	}

	// 2. Gather words from custom decks
	const customDecks = await getAllCustomDecks();
	for (const deck of customDecks) {
		if (Array.isArray(deck.words)) {
			allPacksWords.push(...deck.words);
		}
	}

	// 3. Search local corpus
	for (const word of allPacksWords) {
		const zh = word['Chinese Word'] || '';
		const py = word.Pinyin || '';
		const eng = word['English Meaning'] || '';

		if (!zh && !eng) continue;

		let score = 0;

		// Exact Chinese match
		if (zh === normQuery || zh === normZhQuery) {
			score += 100;
		} else if (zh.includes(normZhQuery)) {
			score += 50;
		}

		// Pinyin match
		if (py) {
			const normPy = normalizePinyin(py);
			if (normPy === normPinyinQuery) {
				score += 80;
			} else if (normPy.includes(normPinyinQuery) && normPinyinQuery.length >= 2) {
				score += 30;
			}
		}

		// English match
		if (eng) {
			const normEng = eng.toLowerCase();
			if (normEng === normQuery) {
				score += 90;
			} else if (normEng.includes(normQuery)) {
				score += 40;
			}
		}

		if (score > 0) {
			const key = `${zh}_${py}_${eng}`;
			if (!seenWords.has(key)) {
				seenWords.add(key);
				results.push({ ...word, Pinyin: formatPinyin(word.Pinyin || '', zh) });
			}
		}
	}

	// Sort by relevance score
	results.sort((a, b) => {
		const aExact =
			a['Chinese Word'] === trimmed || a['English Meaning']?.toLowerCase() === normQuery ? 1 : 0;
		const bExact =
			b['Chinese Word'] === trimmed || b['English Meaning']?.toLowerCase() === normQuery ? 1 : 0;
		return bExact - aExact;
	});

	// 4. Search local embedded dictionary asset / dict.json if present
	if (results.length < 5) {
		try {
			const localDictResults = await searchLocalEmbeddedDictionary(trimmed);
			for (const ext of localDictResults) {
				const key = `${ext['Chinese Word']}_${ext.Pinyin}_${ext['English Meaning']}`;
				if (!seenWords.has(key)) {
					seenWords.add(key);
					results.push(ext);
				}
			}
		} catch {
			// Local search fallback fails silently if dataset not present
		}
	}

	return results;
}

interface RawDictEntry {
	'Chinese Word'?: string;
	simplified?: string;
	word?: string;
	Pinyin?: string;
	pinyin?: string;
	'English Meaning'?: string;
	meaning?: string;
	definition?: string;
	'Part of Speech'?: string;
	pos?: string;
	partOfSpeech?: string;
	'Example (Chinese + Pinyin)'?: string;
	example?: string;
}

let cachedDictPromise: Promise<RawDictEntry[]> | null = null;

async function getEmbeddedDict(): Promise<RawDictEntry[]> {
	if (typeof window === 'undefined') return [];
	if (!cachedDictPromise) {
		cachedDictPromise = fetch('/dict.json')
			.then((res) => (res.ok ? res.json() : []))
			.catch(() => []);
	}
	return cachedDictPromise;
}

/**
 * Searches embedded local dictionary dataset (/dict.json)
 */
async function searchLocalEmbeddedDictionary(query: string): Promise<WordRecord[]> {
	if (typeof window === 'undefined') return [];
	try {
		const data = await getEmbeddedDict();
		if (!Array.isArray(data) || data.length === 0) return [];

		const normQuery = query.toLowerCase().trim();
		const normPinyinQuery = normalizePinyin(query);
		const normZhQuery = normalizeChinese(query);

		const matches: { score: number; entry: RawDictEntry }[] = [];

		for (const entry of data) {
			const zh = entry['Chinese Word'] || entry.simplified || entry.word || '';
			const py = entry.Pinyin || entry.pinyin || '';
			const eng = entry['English Meaning'] || entry.meaning || entry.definition || '';

			let score = 0;
			if (zh === normQuery || zh === normZhQuery) score += 100;
			else if (zh.includes(normZhQuery)) score += 50;

			if (py) {
				const nPy = normalizePinyin(py);
				if (nPy === normPinyinQuery) score += 80;
				else if (nPy.includes(normPinyinQuery) && normPinyinQuery.length >= 2) score += 30;
			}

			if (eng) {
				const nEng = eng.toLowerCase();
				if (nEng === normQuery) score += 90;
				else if (nEng.includes(normQuery)) score += 40;
			}

			if (score > 0) {
				matches.push({ score, entry });
			}
		}

		matches.sort((a, b) => b.score - a.score);

		return matches.slice(0, 15).map((m, index) => ({
			No: 900000 + index,
			'Chinese Word': m.entry['Chinese Word'] || m.entry.simplified || m.entry.word || query,
			Pinyin: formatPinyin(m.entry.Pinyin || m.entry.pinyin || ''),
			'Part of Speech': m.entry['Part of Speech'] || m.entry.pos || 'Vocabulary',
			'English Meaning': m.entry['English Meaning'] || m.entry.meaning || m.entry.definition || '',
			'Example (Chinese + Pinyin)':
				m.entry['Example (Chinese + Pinyin)'] || m.entry.example || undefined
		}));
	} catch {
		return [];
	}
}

/**
 * Retrieves the user's Personal Dictionary deck from storage, or initializes a new one.
 */
export async function getPersonalDictionaryDeck(): Promise<CustomDeck> {
	const customDecks = await getAllCustomDecks();
	const existing = customDecks.find(
		(d) => d.id === PERSONAL_DICTIONARY_DECK_ID || d.isPersonalDictionary
	);

	if (existing) {
		return {
			...existing,
			isPersonalDictionary: true
		};
	}

	// Create initial empty Personal Dictionary deck
	const newDeck: CustomDeck = {
		id: PERSONAL_DICTIONARY_DECK_ID,
		name: 'Personal Dictionary',
		words: [],
		language: 'chinese',
		createdAt: Date.now(),
		isPersonalDictionary: true
	};

	await saveCustomDeck(newDeck);
	return newDeck;
}

/**
 * Saves or updates a word with custom notes in the user's Personal Dictionary.
 */
export async function savePersonalWord(word: WordRecord, customNote?: string): Promise<CustomDeck> {
	const deck = await getPersonalDictionaryDeck();
	const words = [...deck.words];

	const existingIndex = words.findIndex(
		(w) => w['Chinese Word'] === word['Chinese Word'] || (w.No === word.No && word.No < 900000)
	);

	const wordToSave: WordRecord = {
		...word,
		customNote: customNote !== undefined ? customNote : word.customNote
	};

	if (existingIndex >= 0) {
		words[existingIndex] = {
			...words[existingIndex],
			...wordToSave,
			No: words[existingIndex].No // preserve assigned No
		};
	} else {
		wordToSave.No = words.length + 1;
		words.push(wordToSave);
	}

	const updatedDeck: CustomDeck = {
		...deck,
		words,
		isPersonalDictionary: true
	};

	await saveCustomDeck(updatedDeck);
	return updatedDeck;
}

/**
 * Removes a word from the user's Personal Dictionary.
 */
export async function removePersonalWord(chineseWord: string): Promise<CustomDeck> {
	const deck = await getPersonalDictionaryDeck();
	const words = deck.words.filter((w) => w['Chinese Word'] !== chineseWord);

	// Re-index remaining word numbers
	const reindexed = words.map((w, idx) => ({ ...w, No: idx + 1 }));

	const updatedDeck: CustomDeck = {
		...deck,
		words: reindexed,
		isPersonalDictionary: true
	};

	await saveCustomDeck(updatedDeck);
	return updatedDeck;
}
