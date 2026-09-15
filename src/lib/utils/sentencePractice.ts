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
	translation?: string;
}

export interface ClozeOption {
	text: string;
	pinyin: string;
	isCorrect: boolean;
}

export function getTargetWord(record: WordRecord, language: 'chinese' | 'french'): string {
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
			pinyin = '';
		}
	} else if (pinyin) {
		pinyin = '';
	}

	const displaySentence = replaceAllCaseInsensitive(parsed.sentence, targetWord, BLANK_TOKEN);
	if (!displaySentence.includes(BLANK_TOKEN)) return null;

	return {
		language,
		targetWord,
		targetPinyin,
		displaySentence,
		fullSentence: parsed.sentence,
		pinyin,
		translation: parsed.translation
	};
}

/**
 * Builds a shuffled set of cloze options: the correct target word plus up to `count`
 * distractors drawn from other words in the same deck.
 */
export function buildClozeOptions(
	cloze: SentenceExample,
	distractorWords: WordRecord[],
	count = 3
): ClozeOption[] {
	const pool = distractorWords
		.map((w) => ({ word: getTargetWord(w, cloze.language), pinyin: (w.Pinyin || '').trim() }))
		.filter((d) => d.word && d.word !== cloze.targetWord);

	const distractors = shuffleArray(pool)
		.slice(0, count)
		.map((d) => ({ text: d.word, pinyin: d.pinyin, isCorrect: false }));

	return shuffleArray([
		{ text: cloze.targetWord, pinyin: cloze.targetPinyin, isCorrect: true },
		...distractors
	]);
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
