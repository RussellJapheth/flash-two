/**
 * Sentence practice (cloze) model.
 *
 * Builds fill-in-the-blank prompts from a WordRecord and validates answers
 * against the accepted variant set for the deck's language.
 */
import type { WordRecord } from '$lib/types';

export const BLANK_TOKEN = '{blank}';

export interface SentenceExample {
	language: 'chinese' | 'french';
	targetWord: string;
	targetPinyin: string;
	/** Sentence with the target word removed and replaced by the {blank} token. */
	displaySentence: string;
	/** Original sentence with the target word intact. */
	fullSentence: string;
	/** Pinyin line with the target pinyin blanked; empty when it cannot be blanked safely. */
	pinyin: string;
	/** Original unblanked pinyin line with target pinyin intact. */
	fullPinyin?: string;
	translation?: string;
	/** Other words from the same deck that also complete the blank validly. */
	acceptedAnswers: string[];
}

export interface ClozeOption {
	text: string;
	pinyin: string;
	isCorrect: boolean;
}

function getTargetWord(record: WordRecord, language: 'chinese' | 'french'): string {
	return language === 'chinese' ? record['Chinese Word'] || '' : record['French Word'] || '';
}

function escapeRegExp(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits a card's example field into sentence / pinyin / translation parts.
 * Chinese examples carry all three in the form "句子。(pinyin) — translation".
 * French examples carry only the sentence.
 */
export function parseExampleSentence(
	record: WordRecord,
	language: 'chinese' | 'french'
): { sentence: string; pinyin?: string; translation?: string } | null {
	const example =
		language === 'chinese' ? record['Example (Chinese + Pinyin)'] : record['Example (French)'];
	if (!example || !example.trim()) return null;

	if (language === 'french') {
		return { sentence: example.trim() };
	}

	const text = example.trim();
	const openIdx = text.indexOf('(');
	const closeIdx = text.lastIndexOf(')');

	if (openIdx === -1 || closeIdx <= openIdx) {
		return { sentence: text };
	}

	const sentence = text.slice(0, openIdx).trim();
	const pinyin = text.slice(openIdx + 1, closeIdx).trim();

	const rest = text.slice(closeIdx + 1);
	const dashIdx = rest.search(/[—–:]/);
	let translation: string | undefined;
	if (dashIdx !== -1) {
		const candidate = rest
			.slice(dashIdx + 1)
			.replace(/^[\s—–:/-]+/, '')
			.trim();
		if (candidate) translation = candidate;
	}

	return { sentence, pinyin, translation };
}

function stripPinyinPunctuation(token: string): string {
	return token.replace(/[^\p{L}\p{N}'’-]/gu, '');
}

/**
 * Replaces every case-insensitive occurrence of `needle` in `source`.
 */
function replaceAllCaseInsensitive(source: string, needle: string, replacement: string): string {
	if (!needle || !source) return source;
	return source.replace(new RegExp(escapeRegExp(needle), 'gi'), replacement);
}

/**
 * Strips pinyin tone marks so tone-sandhi variants (bù/bú) compare as equal.
 */
function toneNormalize(text: string): string {
	return text
		.toLowerCase()
		.replace(/[āáǎà]/g, 'a')
		.replace(/[ēéěè]/g, 'e')
		.replace(/[īíǐì]/g, 'i')
		.replace(/[ōóǒò]/g, 'o')
		.replace(/[ūúǔù]/g, 'u')
		.replace(/[üǖǘǚǜ]/g, 'u');
}

/**
 * Blanks the target pinyin inside `pinyinText` using a tone-insensitive substring
 * lookup. Handles targets fused into compounds (ròubāozi → 包子), tone sandhi
 * (bú vs bù) and apostrophe-separated syllables (shēn'ài → 爱). Returns null when
 * the target pinyin cannot be located at all.
 */
function blankTargetPinyinCore(pinyinText: string, targetPinyin: string): string | null {
	const norm = toneNormalize(pinyinText);
	const target = toneNormalize(targetPinyin).trim();
	if (!target) return null;
	const index = norm.indexOf(target);
	if (index === -1) return null;
	return pinyinText.slice(0, index) + BLANK_TOKEN + pinyinText.slice(index + target.length);
}

/**
 * Builds a cloze question from a card. Returns null when the card cannot be
 * practiced (missing example, target word absent from the sentence).
 */
export function buildCloze(
	record: WordRecord,
	language: 'chinese' | 'french'
): SentenceExample | null {
	const targetWord = getTargetWord(record, language);
	const parsed = parseExampleSentence(record, language);
	if (!targetWord || !parsed) return null;

	const targetPinyin = (record.Pinyin || '').trim();
	let pinyin = parsed.pinyin || '';

	if (targetPinyin && parsed.pinyin) {
		const tokens = parsed.pinyin.split(/\s+/);
		const targetTokens = targetPinyin.split(/\s+/);
		const start = tokens.findIndex(
			(_, i) =>
				i + targetTokens.length <= tokens.length &&
				targetTokens.every((targetToken, k) => {
					const a = stripPinyinPunctuation(tokens[i + k]).toLowerCase();
					const b = stripPinyinPunctuation(targetToken).toLowerCase();
					return a === b;
				})
		);
		if (start !== -1) {
			const leadingPunct = tokens[start].match(/^[^\p{L}\p{N}'’-]+/u)?.[0] || '';
			const trailingPunct =
				tokens[start + targetTokens.length - 1].match(/[^\p{L}\p{N}'’-]+$/u)?.[0] || '';
			tokens.splice(start, targetTokens.length, leadingPunct + BLANK_TOKEN + trailingPunct);
			pinyin = tokens.join(' ');
		} else {
			// Hiding pinyin is safer than leaking the answer through an unblanked line.
			pinyin = blankTargetPinyinCore(parsed.pinyin, targetPinyin) ?? '';
		}
	} else if (pinyin) {
		pinyin = '';
	}

	const displaySentence = replaceAllCaseInsensitive(parsed.sentence, targetWord, BLANK_TOKEN);
	if (!displaySentence.includes(BLANK_TOKEN)) return null;

	const acceptedAnswers = (record['Acceptable Answers'] || [])
		.map((answer) => answer.trim())
		.filter((answer) => answer && answer !== targetWord);

	return {
		language,
		targetWord,
		targetPinyin,
		displaySentence,
		fullSentence: parsed.sentence,
		pinyin,
		fullPinyin: parsed.pinyin || renderClozeSentence(pinyin, targetPinyin),
		translation: parsed.translation,
		acceptedAnswers
	};
}

/**
 * Builds a shuffled set of cloze options: the correct target word, every accepted
 * alternative present in the deck, plus distractors drawn from other deck words.
 */
export function buildClozeOptions(
	cloze: SentenceExample,
	distractorWords: WordRecord[],
	count = 3
): ClozeOption[] {
	const accepted = new Set(cloze.acceptedAnswers);
	const pool = distractorWords
		.map((w) => ({ word: getTargetWord(w, cloze.language), pinyin: (w.Pinyin || '').trim() }))
		.filter((d) => d.word && d.word !== cloze.targetWord);

	const acceptedOptions = pool
		.filter((d) => accepted.has(d.word))
		.map((d) => ({ text: d.word, pinyin: d.pinyin, isCorrect: true }));

	const remaining = pool.filter((d) => !accepted.has(d.word));
	const distractors = shuffleArray(remaining)
		.slice(0, count)
		.map((d) => ({ text: d.word, pinyin: d.pinyin, isCorrect: false }));

	const options = shuffleArray([
		{ text: cloze.targetWord, pinyin: cloze.targetPinyin, isCorrect: true },
		...acceptedOptions.map((o) => ({ ...o })),
		...distractors
	]);

	const seen = new Set<string>();
	return options.filter((o) => {
		if (seen.has(o.text)) return false;
		seen.add(o.text);
		return true;
	});
}

export function shuffleArray<T>(input: T[]): T[] {
	const copy = [...input];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/**
 * Renders a cloze sentence's {blank} tokens for display.
 */
export function renderClozeSentence(sentence: string, placeholder = '[ ______ ]'): string {
	return sentence.includes(BLANK_TOKEN) ? sentence.split(BLANK_TOKEN).join(placeholder) : sentence;
}

export interface SentenceChunk {
	text: string;
	pinyin?: string;
	isFullSentence: boolean;
}

/**
 * Splits a full sentence into progressive speaking chunks for repeat-after-me practice.
 * Breaks clauses naturally on punctuation (，, 、 ; ! ? 。 .).
 * The final chunk is always marked with isFullSentence: true as the mastery challenge.
 */
export function chunkSentence(
	fullSentence: string,
	pinyin?: string,
	lang: 'chinese' | 'french' = 'chinese'
): SentenceChunk[] {
	const cleaned = fullSentence.trim();
	if (!cleaned) return [];

	// Extract clause segments by punctuation delimiters while preserving the text
	const delimiterRegex = lang === 'chinese' ? /([，、；;！!？?。.]+)/g : /(\s*[,;:!?.—–]+\s*)/g;
	const parts = cleaned.split(delimiterRegex);

	const segments: string[] = [];
	for (let i = 0; i < parts.length; i += 2) {
		const clause = parts[i]?.trim();
		const delimiter = parts[i + 1] || '';
		if (clause) {
			const formatted = (clause + delimiter).trim();
			if (formatted) segments.push(formatted);
		} else if (delimiter && segments.length > 0) {
			segments[segments.length - 1] = (segments[segments.length - 1] + delimiter).trim();
		}
	}

	// If no punctuation split resulted in multiple segments, check if clause is long
	const clauses = segments.length > 0 ? segments : [cleaned];

	const chunks: SentenceChunk[] = [];
	for (const cl of clauses) {
		chunks.push({
			text: cl,
			isFullSentence: false
		});
	}

	// If we have 2 or more distinct sub-clauses, append the full sentence as the final challenge
	if (chunks.length > 1) {
		chunks.push({
			text: cleaned,
			pinyin: pinyin?.trim(),
			isFullSentence: true
		});
	} else if (chunks.length === 1) {
		// Only one chunk exists, mark it as full sentence
		chunks[0].isFullSentence = true;
		chunks[0].pinyin = pinyin?.trim();
	}

	return chunks;
}

export interface UnscrambleToken {
	id: string;
	text: string;
	pinyin?: string;
}

export interface UnscrambleChallenge {
	fullSentence: string;
	fullPinyin?: string;
	translation?: string;
	tokens: UnscrambleToken[];
	canonicalOrder: string[];
}

/**
 * Builds sentence construction / syntax recall unscramble challenge.
 * Tokenizes sentence into scrambled word chips with paired Pinyin for syntax recall.
 */
export function buildUnscrambleChallenge(
	fullSentence: string,
	fullPinyin?: string,
	translation?: string,
	lang: 'chinese' | 'french' = 'chinese'
): UnscrambleChallenge | null {
	const cleaned = fullSentence.trim();
	if (!cleaned) return null;

	let rawTokens: string[] = [];

	if (lang === 'french') {
		rawTokens = cleaned.split(/\s+/).filter(Boolean);
	} else {
		// Chinese tokenization: split into clauses or 1-3 character tokens
		const delimiterRegex = /([，、；;！!？?。.]+)/g;
		const parts = cleaned.split(delimiterRegex).filter(Boolean);

		for (const part of parts) {
			if (/^[，、；;！!？?。.]+$/.test(part)) {
				if (rawTokens.length > 0) {
					rawTokens[rawTokens.length - 1] += part;
				} else {
					rawTokens.push(part);
				}
			} else {
				let current = part;
				while (current.length > 0) {
					if (current.length >= 4) {
						rawTokens.push(current.slice(0, 2));
						current = current.slice(2);
					} else if (current.length === 3) {
						rawTokens.push(current.slice(0, 2));
						current = current.slice(2);
					} else {
						rawTokens.push(current);
						current = '';
					}
				}
			}
		}
	}

	if (rawTokens.length === 0) return null;

	// Align pinyin words to tokens if available
	let pinyinWords: string[] = [];
	if (fullPinyin && lang === 'chinese') {
		pinyinWords = fullPinyin.trim().split(/\s+/).filter(Boolean);
	}

	const canonicalOrder = [...rawTokens];
	const tokens: UnscrambleToken[] = rawTokens.map((t, idx) => {
		let tokenPinyin: string | undefined = undefined;
		if (pinyinWords.length === rawTokens.length) {
			tokenPinyin = pinyinWords[idx];
		} else if (pinyinWords.length > 0) {
			const pyIdx = Math.min(idx, pinyinWords.length - 1);
			tokenPinyin = pinyinWords[pyIdx];
		}
		return {
			id: `tok-${idx}-${t}`,
			text: t,
			pinyin: tokenPinyin
		};
	});

	let shuffled = shuffleArray(tokens);
	if (shuffled.length > 1 && shuffled.map((t) => t.text).join('') === canonicalOrder.join('')) {
		shuffled = [...shuffled].reverse();
	}

	return {
		fullSentence: cleaned,
		fullPinyin,
		translation,
		tokens: shuffled,
		canonicalOrder
	};
}
