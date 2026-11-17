import { generatePinyin, generateWordPinyin, type MyWordInput } from '@flash/shared';
import corpusData from './corpus.json';

export interface CorpusWord {
	word: string;
	pinyin: string;
	meaning: string;
	example: string;
}

const corpus: CorpusWord[] = corpusData as CorpusWord[];
const corpusMap = new Map<string, CorpusWord>();
for (const item of corpus) {
	if (item.word) {
		corpusMap.set(item.word.trim(), item);
	}
}

let dictCachePromise: Promise<Map<string, string>> | null = null;

async function getDictDefinitions(): Promise<Map<string, string>> {
	if (typeof window === 'undefined') return new Map();
	if (!dictCachePromise) {
		dictCachePromise = (async () => {
			const map = new Map<string, string>();
			try {
				const res = await fetch('/dict.json');
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data)) {
						for (const entry of data) {
							const zh = entry['Chinese Word'] || entry.simplified || entry.word || '';
							const def = entry['English Meaning'] || entry.meaning || entry.definition || '';
							if (zh && def && !map.has(zh)) {
								// Clean first segment of definition
								const firstGloss =
									def
										.split(/[;/]/)[0]
										?.replace(/\bCL:[^;/)]+/gi, '')
										.trim() || def;
								map.set(zh, firstGloss);
							}
						}
					}
				}
			} catch {
				// Silently fall back to corpus and synthesis if offline
			}
			return map;
		})();
	}
	return dictCachePromise;
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
		if (partial && partial.meaning) {
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
