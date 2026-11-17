import { generatePinyin, generateWordPinyin, type MyWordInput } from '@flash/shared';
import corpusData from './corpus.json';

export interface CorpusWord {
	word: string;
	pinyin: string;
	meaning: string;
	example: string;
}

export const corpus: CorpusWord[] = corpusData as CorpusWord[];
export const corpusMap = new Map<string, CorpusWord>();
for (const item of corpus) {
	if (item.word) {
		corpusMap.set(item.word.trim(), item);
	}
}

export function cleanGlossSegment(raw: string): string {
	return raw
		.replace(/\bCL:[^;/)]+/gi, '')
		.replace(/\b(?:Taiwan|also)\s+pr\.\s*\[[^\]]*\]/gi, '')
		.replace(/\([^)]*\)/g, ' ')
		.replace(/\s+/g, ' ')
		.replace(/^[,;:\-\s]+|[,;:\-\s]+$/g, '')
		.trim();
}

export function isCrossRefGloss(cleaned: string): boolean {
	return /^(?:see\s|variant of\s|old variant of\s|erhua variant of\s|same as\s|also written\s)/i.test(
		cleaned
	);
}

export function isLowPriorityGloss(cleaned: string): boolean {
	return /^(?:abbr\. for|short for|surname\b)/i.test(cleaned);
}

export interface RawDictEntry {
	'Chinese Word'?: string;
	simplified?: string;
	word?: string;
	'English Meaning'?: string;
	meaning?: string;
	definition?: string;
}

const TARGET_CROSS_REF_REGEX =
	/(?:variant of|old variant of|erhua variant of|see|same as|also written)\s+(?:([^|[\]\s;/]+)\|)?([^|[\]\s;/]+)/i;

export function parseDictEntries(data: RawDictEntry[]): Map<string, string> {
	const cleanMap = new Map<string, string>();
	const lowPriMap = new Map<string, string>();
	const fallbackMap = new Map<string, string>();

	for (const entry of data) {
		const zh = entry['Chinese Word'] || entry.simplified || entry.word || '';
		const def = entry['English Meaning'] || entry.meaning || entry.definition || '';
		if (!zh || !def) continue;

		if (!fallbackMap.has(zh)) {
			fallbackMap.set(zh, def);
		}

		if (cleanMap.has(zh)) continue;

		const segments = def.split(/[;/]/);
		for (const seg of segments) {
			const cleaned = cleanGlossSegment(seg);
			if (!cleaned || isCrossRefGloss(cleaned)) continue;
			if (isLowPriorityGloss(cleaned)) {
				if (!lowPriMap.has(zh)) {
					lowPriMap.set(zh, cleaned);
				}
				continue;
			}
			cleanMap.set(zh, cleaned);
			break;
		}
	}

	for (const [zh, lowDef] of lowPriMap.entries()) {
		if (!cleanMap.has(zh)) {
			cleanMap.set(zh, lowDef);
		}
	}

	for (const [zh, fallbackDef] of fallbackMap.entries()) {
		if (cleanMap.has(zh)) continue;

		const match = TARGET_CROSS_REF_REGEX.exec(fallbackDef);
		let resolved: string | undefined;
		if (match) {
			const target = (match[2] || match[1] || '').trim();
			if (target && target !== zh && cleanMap.has(target)) {
				resolved = cleanMap.get(target);
			} else if (target && target !== zh && fallbackMap.has(target)) {
				const targetDef = fallbackMap.get(target)!;
				resolved = cleanGlossSegment(targetDef.split(/[;/]/)[0]) || targetDef;
			}
		}

		cleanMap.set(zh, resolved || cleanGlossSegment(fallbackDef.split(/[;/]/)[0]) || fallbackDef);
	}

	return cleanMap;
}

let dictCachePromise: Promise<Map<string, string>> | null = null;

export async function getDictDefinitions(): Promise<Map<string, string>> {
	if (typeof window === 'undefined') return new Map();
	if (!dictCachePromise) {
		dictCachePromise = (async () => {
			try {
				const res = await fetch('/dict.json');
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data)) {
						return parseDictEntries(data);
					}
				}
			} catch {
				// Silently fall back to corpus and synthesis if offline
			}
			return new Map<string, string>();
		})();
	}
	return dictCachePromise;
}

export function healWordRecord(word: {
	'Chinese Word'?: string;
	'English Meaning'?: string;
}): boolean {
	const currentMeaning = word['English Meaning'] || '';
	if (!isCrossRefGloss(currentMeaning)) return false;

	const zh = word['Chinese Word']?.trim();
	if (!zh) return false;

	const corpusMatch = corpusMap.get(zh);
	if (corpusMatch && corpusMatch.meaning && !isCrossRefGloss(corpusMatch.meaning)) {
		word['English Meaning'] = corpusMatch.meaning;
		return true;
	}

	return false;
}

export async function healWordRecordWithDict(word: {
	'Chinese Word'?: string;
	'English Meaning'?: string;
}): Promise<boolean> {
	if (healWordRecord(word)) return true;

	const currentMeaning = word['English Meaning'] || '';
	if (!isCrossRefGloss(currentMeaning)) return false;

	const zh = word['Chinese Word']?.trim();
	if (!zh) return false;

	const dict = await getDictDefinitions();
	if (dict.has(zh)) {
		const clean = dict.get(zh)!;
		if (clean && !isCrossRefGloss(clean)) {
			word['English Meaning'] = clean;
			return true;
		}
	}

	return false;
}

/**
 * Parses user input for bulk entry:
 * Splits by newlines ONLY, trims surrounding whitespace, and filters out blank lines.
 */
export function parseBulkInput(text: string): string[] {
	if (!text) return [];
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

/**
 * Returns number of words in bulk input.
 */
export function countBulkWords(text: string): number {
	return parseBulkInput(text).length;
}

/**
 * Synthesizes a natural, clear example sentence with tone-marked Pinyin.
 */
export function synthesizeExample(word: string, meaning: string): string {
	const trimmed = word.trim();
	const sentenceZh = `我喜欢${trimmed}。`;
	let rawPy = generatePinyin(sentenceZh)
		.replace(/\s+([。，！？,.!?])/g, '')
		.trim();
	if (rawPy.length > 0) {
		rawPy = rawPy[0].toUpperCase() + rawPy.slice(1);
	}
	const cleanMeaning = meaning.replace(/^to\s+/i, '');
	return `${sentenceZh} (${rawPy}) — I like ${cleanMeaning}.`;
}

/**
 * Generates all flashcard fields for a single Chinese word.
 */
export async function generateCardForWord(
	rawWord: string,
	category?: string
): Promise<MyWordInput> {
	const trimmed = rawWord.trim();
	const cat = (category || '').trim();

	// 1. Check curated pack corpus
	const corpusMatch = corpusMap.get(trimmed);
	if (corpusMatch) {
		return {
			word: trimmed,
			pinyin: corpusMatch.pinyin || generateWordPinyin(trimmed),
			meaning: corpusMatch.meaning || 'Vocabulary word',
			example: corpusMatch.example || synthesizeExample(trimmed, corpusMatch.meaning || trimmed),
			category: cat || undefined
		};
	}

	// 2. Generate Pinyin
	const pinyin = generateWordPinyin(trimmed) || generatePinyin(trimmed);

	// 3. Meaning lookup
	let meaning = '';
	try {
		const dictMap = await getDictDefinitions();
		if (dictMap.has(trimmed)) {
			meaning = dictMap.get(trimmed) || '';
		}
	} catch {
		// fallback
	}

	if (!meaning) {
		// Look for corpus words that contain this word
		const partial = corpus.find((c) => c.word.includes(trimmed) || trimmed.includes(c.word));
		if (partial && partial.meaning && !isCrossRefGloss(partial.meaning)) {
			meaning = partial.meaning;
		} else {
			meaning = trimmed;
		}
	}

	// 4. Example sentence lookup or synthesis
	const containingCorpus = corpus.find((c) => c.example && c.example.includes(trimmed));
	const example = containingCorpus?.example || synthesizeExample(trimmed, meaning);

	return {
		word: trimmed,
		pinyin,
		meaning,
		example,
		category: cat || undefined
	};
}

/**
 * Generates flashcards for a bulk list of words with progress reporting.
 */
export async function generateCardsInBulk(
	rawInput: string,
	category?: string,
	onProgress?: (current: number, total: number) => void
): Promise<MyWordInput[]> {
	const words = parseBulkInput(rawInput);
	const results: MyWordInput[] = [];

	for (let i = 0; i < words.length; i++) {
		const word = words[i];
		const card = await generateCardForWord(word, category);
		results.push(card);
		if (onProgress) {
			onProgress(i + 1, words.length);
		}
	}

	return results;
}
