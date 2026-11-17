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

export function isReligiousGloss(text: string): boolean {
	return /\b(?:religion|religious|Christianity|Christian|Catholic|biblical|Bible|theology|theological|Scriptures?|Gospel|church|apostle|evangelical|monastery|Buddhism|Buddhist|Taoism|Taoist|deity|liturgy|Holy Spirit|divine|salvation|priest|pastor|mosque|temple|cleric)\b/i.test(
		text
	);
}

export function isReligiousText(text: string): boolean {
	return (
		/《(?:创世记|出埃及记|利未记|民数记|申命记|约书亚记|士师记|路得记|撒母耳记|列王纪|历代志|以斯拉记|尼希米记|以斯帖记|约伯记|诗篇|箴言|传道书|雅歌|以赛亚书|耶利米书|耶利米哀歌|以西结书|但以理书|何西阿书|约珥书|阿摩司书|俄巴底亚书|约拿书|弥迦书|那鸿书|哈巴库克书|西番雅书|哈该书|撒迦利亚书|玛拉基书|马太福音|马可福音|路加福音|约翰福音|使徒行传|罗马书|哥林多前书|哥林多后书|加拉太书|以弗所书|腓立比书|歌罗西书|帖撒罗尼迦前书|帖撒罗尼迦后书|提摩太前书|提摩太后书|提多书|腓利门书|希伯来书|雅各书|彼得前书|彼得后书|约翰一书|约翰二书|约翰三书|犹大书|启示录)》/.test(
			text
		) ||
		/(?:上帝|耶和华|耶稣|圣灵|基督|福音|圣经|使徒|团契|救赎|受洗|洗礼)/.test(text) ||
		/\b(?:Bible|biblical|Gospel|Genesis|Exodus|Leviticus|Deuteronomy|Galatians|Ephesians|Corinthians|Holy Spirit|apostle|Jesus|Christ|Scripture|theology)\b/i.test(
			text
		)
	);
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
	const religiousMap = new Map<string, string>();
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
			if (isReligiousGloss(seg) || isReligiousGloss(cleaned)) {
				if (!religiousMap.has(zh)) {
					religiousMap.set(zh, cleaned);
				}
				continue;
			}
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

	for (const [zh, relDef] of religiousMap.entries()) {
		if (!cleanMap.has(zh)) {
			cleanMap.set(zh, relDef);
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
 * Synthesizes a natural, grammatically correct example sentence with tone-marked Pinyin.
 * Uses part-of-speech and semantic templates instead of naive 'I like ...' for all words.
 */
export function synthesizeExample(word: string, meaning: string): string {
	const trimmed = word.trim();
	const firstGloss = meaning.split(/[;/]/)[0].trim();
	const cleanMeaning = firstGloss.replace(/^to\s+/i, '').trim() || trimmed;

	let sentenceZh: string;
	let translation: string;

	// 1. Particle / Suggestion expressions (e.g. 来吧, 来把, 走吧)
	if (trimmed === '来把' || trimmed === '来吧') {
		sentenceZh = '快来吧！';
		translation = 'Come on! / Come over quickly!';
	} else if (/^[一二三四五六七八九十百千万0-9]+$/.test(trimmed)) {
		// Numbers
		sentenceZh = `这里有${trimmed}个。`;
		translation = `There are ${cleanMeaning} here.`;
	} else if (
		trimmed.endsWith('吧') ||
		trimmed.endsWith('把') ||
		/\b(?:suggestion|particle|modal)\b/i.test(meaning)
	) {
		const action = trimmed.replace(/[吧把]$/, '');
		sentenceZh = action ? `我们${trimmed}！` : `走${trimmed}！`;
		translation = `Let's ${action ? cleanMeaning : 'go'}!`;
	} else if (trimmed === '吗' || /\bquestion particle\b/i.test(meaning)) {
		sentenceZh = '你好吗？';
		translation = 'How are you?';
	} else if (trimmed === '呢') {
		sentenceZh = '你呢？';
		translation = 'What about you?';
	} else if (/^(?:我|你|他|她|它|我们|你们|他们)$/.test(trimmed)) {
		sentenceZh = `这是${trimmed}的朋友。`;
		translation = `This is ${cleanMeaning}'s friend.`;
	} else if (
		/^to\s+/i.test(firstGloss) ||
		/\b(?:verb|action)\b/i.test(meaning) ||
		/^(?:吃|喝|看|听|说|读|写|去|走|买|卖|学|想|做|要|找|等|跑|飞|坐|住|教)$/.test(trimmed)
	) {
		// Verbs: "我想 [verb] 。" -> "I want to [verb]."
		sentenceZh = `我想${trimmed}。`;
		translation = `I want to ${cleanMeaning}.`;
	} else if (
		/\b(?:adjective|adj|very|good|bad|big|small|fast|slow|hot|cold|expensive|cheap|beautiful|happy|tall|short|new|old)\b/i.test(
			meaning
		) ||
		/^(?:好|大|小|多|少|快|慢|高|矮|胖|瘦|新|旧|贵|便宜|漂亮|冷|热|累|忙|难|容易|远|近|对|错)$/.test(
			trimmed
		)
	) {
		// Adjectives: "这个很 [adj] 。" -> "This is very [adj]."
		sentenceZh = `这个很${trimmed}。`;
		translation = `This is very ${cleanMeaning}.`;
	} else if (
		/^(?:不|没|没有|很|非常|常常|总是|特别|太|真|已经|正在)$/.test(trimmed) ||
		/\b(?:adverb)\b/i.test(meaning)
	) {
		// Adverbs / Negation
		if (trimmed === '不' || trimmed === '没' || trimmed === '没有') {
			sentenceZh = `我${trimmed}知道。`;
			translation = `I do not know.`;
		} else {
			sentenceZh = `我${trimmed}高兴。`;
			translation = `I am ${cleanMeaning} happy.`;
		}
	} else {
		// Nouns / Things: "这是 [noun] 。" -> "This is [noun]."
		sentenceZh = `这是${trimmed}。`;
		translation = `This is ${cleanMeaning}.`;
	}

	let rawPy = generatePinyin(sentenceZh)
		.replace(/\s+([。，！？,.!?])/g, '$1')
		.trim();
	if (rawPy.length > 0) {
		rawPy = rawPy[0].toUpperCase() + rawPy.slice(1);
	}

	return `${sentenceZh} (${rawPy}) — ${translation}`;
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
		// Look for corpus words that contain this word (prefer secular)
		const secularPartial = corpus.find(
			(c) =>
				(c.word.includes(trimmed) || trimmed.includes(c.word)) &&
				!isReligiousText(c.word) &&
				!isReligiousText(c.meaning) &&
				!isCrossRefGloss(c.meaning)
		);
		const partial =
			secularPartial ||
			corpus.find(
				(c) => (c.word.includes(trimmed) || trimmed.includes(c.word)) && !isCrossRefGloss(c.meaning)
			);
		if (partial && partial.meaning && !isCrossRefGloss(partial.meaning)) {
			meaning = partial.meaning;
		} else {
			meaning = trimmed;
		}
	}

	if (trimmed === '来把' || trimmed === '来吧') {
		meaning = 'come on / come over';
	}

	// 4. Example sentence lookup or synthesis (prefer secular everyday examples)
	const secularExample = corpus.find(
		(c) =>
			c.example &&
			c.example.includes(trimmed) &&
			!isReligiousText(c.example) &&
			!isReligiousText(c.meaning)
	);
	const containingCorpus =
		secularExample || corpus.find((c) => c.example && c.example.includes(trimmed));
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
