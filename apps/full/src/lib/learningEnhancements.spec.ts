import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { BUILTIN_STORIES, calculateStoryVocabFrequency } from '$lib/data/stories';
import { getTextbookLesson, getAllTextbookLessons } from '$lib/data/textbookLessons';
import { FIELD_GUIDES } from '$lib/data/fieldGuides';
import { getCompletedLessons, markLessonCompleted } from '$lib/utils/storage';
import { normalizePinyin } from '$lib/utils/dictionary';
import type { DeckSummary } from '$lib/types';

class LocalStorageMock {
	private store: Record<string, string> = {};
	getItem(key: string): string | null {
		return this.store[key] ?? null;
	}
	setItem(key: string, value: string): void {
		this.store[key] = String(value);
	}
	removeItem(key: string): void {
		delete this.store[key];
	}
	clear(): void {
		this.store = {};
	}
}

describe('Epic 1: Deck Content Search Indexing', () => {
	function filterDeck(deck: DeckSummary, searchQuery: string): DeckSummary | null {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return { ...deck, matchedSnippet: undefined };
		if (deck.title.toLowerCase().includes(q)) {
			return { ...deck, matchedSnippet: undefined };
		}
		const normQ = normalizePinyin(q);
		const matched = deck.indexedWords?.find((w) => {
			if (w.word && w.word.toLowerCase().includes(q)) return true;
			if (w.pinyin) {
				if (w.pinyin.toLowerCase().includes(q)) return true;
				if (normQ && normalizePinyin(w.pinyin).includes(normQ)) return true;
			}
			if (w.meaning && w.meaning.toLowerCase().includes(q)) return true;
			if (w.acceptableAnswers && w.acceptableAnswers.some((a) => a.toLowerCase().includes(q)))
				return true;
			return false;
		});

		if (matched) {
			const snippet = matched.pinyin
				? `Matches: ${matched.word} (${matched.pinyin})`
				: `Matches: ${matched.word} — ${matched.meaning}`;
			return { ...deck, matchedSnippet: snippet };
		}
		return null;
	}

	const sampleDeck: DeckSummary = {
		id: 'chinese-1',
		title: 'Pack 1: Greetings & Basics',
		language: 'chinese',
		totalCards: 3,
		masteredCards: 1,
		learningCards: 1,
		dueCards: 1,
		accuracy: 90,
		isCustom: false,
		indexedWords: [
			{ word: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', acceptableAnswers: ['您好'] },
			{ word: '谢谢', pinyin: 'xièxie', meaning: 'thank you', acceptableAnswers: ['多谢'] },
			{ word: '再见', pinyin: 'zàijiàn', meaning: 'goodbye', acceptableAnswers: [] }
		]
	};

	it('matches by title without setting matchedSnippet', () => {
		const res = filterDeck(sampleDeck, 'Greetings');
		expect(res).not.toBeNull();
		expect(res?.matchedSnippet).toBeUndefined();
	});

	it('matches by Chinese character and sets matchedSnippet badge', () => {
		const res = filterDeck(sampleDeck, '你好');
		expect(res).not.toBeNull();
		expect(res?.matchedSnippet).toBe('Matches: 你好 (nǐ hǎo)');
	});

	it('matches by pinyin search query', () => {
		const res = filterDeck(sampleDeck, 'xiexie');
		expect(res).not.toBeNull();
		expect(res?.matchedSnippet).toBe('Matches: 谢谢 (xièxie)');
	});

	it('matches by English meaning', () => {
		const res = filterDeck(sampleDeck, 'goodbye');
		expect(res).not.toBeNull();
		expect(res?.matchedSnippet).toBe('Matches: 再见 (zàijiàn)');
	});

	it('matches by acceptable answers synonym', () => {
		const res = filterDeck(sampleDeck, '您好');
		expect(res).not.toBeNull();
		expect(res?.matchedSnippet).toBe('Matches: 你好 (nǐ hǎo)');
	});

	it('returns null when no title or card content matches', () => {
		const res = filterDeck(sampleDeck, 'airplane');
		expect(res).toBeNull();
	});
});

describe('Epic 2: Story Key Vocab Data Enrichment & Appearance Counter', () => {
	it('all BUILTIN_STORIES define comprehensive summaryVocabulary', () => {
		expect(BUILTIN_STORIES.length).toBeGreaterThanOrEqual(7);
		for (const story of BUILTIN_STORIES) {
			expect(story.summaryVocabulary).toBeDefined();
			expect(story.summaryVocabulary!.length).toBeGreaterThanOrEqual(4);
			for (const vocab of story.summaryVocabulary!) {
				expect(vocab.word).toBeTruthy();
				expect(vocab.meaning).toBeTruthy();
				expect(vocab.contextSentence).toBeTruthy();
				expect(vocab.frequency).toBeGreaterThanOrEqual(1);
			}
		}
	});

	it('calculateStoryVocabFrequency correctly counts appearances across nodes', () => {
		const noodleStory = BUILTIN_STORIES.find((s) => s.id === 'midnight-noodles')!;
		expect(noodleStory).toBeDefined();
		const count = calculateStoryVocabFrequency(noodleStory, '牛肉面');
		expect(count).toBeGreaterThanOrEqual(2);
	});
});

describe('Epic 3: Field Guide Lessons & Progress Tracking', () => {
	beforeAll(() => {
		if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
	});

	beforeEach(() => {
		localStorage.clear();
	});

	it('all 13 field guides have structured textbook lessons', () => {
		expect(FIELD_GUIDES.length).toBe(13);
		expect(getAllTextbookLessons().length).toBe(13);

		for (const guide of FIELD_GUIDES) {
			const lesson = getTextbookLesson(guide.id);
			expect(lesson).toBeDefined();
			expect(lesson?.guideId).toBe(guide.id);
			expect(lesson?.spotlightWords.length).toBeGreaterThanOrEqual(3);
			expect(lesson?.patternBox.slots.length).toBeGreaterThanOrEqual(2);
			expect(lesson?.miniCheck.length).toBe(2);
			expect(lesson?.scene.dialogue.length).toBeGreaterThanOrEqual(2);
			expect(lesson?.xpReward).toBeGreaterThanOrEqual(10);

			// Test mini-check 1 picture match pairs have pinyin
			const pictureMatch = lesson?.miniCheck[0]?.pictureMatch;
			expect(pictureMatch).toBeDefined();
			expect(pictureMatch?.pairs.length).toBeGreaterThanOrEqual(2);
			for (const pair of pictureMatch!.pairs) {
				expect(pair.hanzi.length).toBeGreaterThan(0);
				expect(pair.pinyin.length).toBeGreaterThan(0);
			}

			// Test mini-check 2 word reorder pairs characters with pinyin in wordPinyinMap
			const wordReorder = lesson?.miniCheck[1]?.wordReorder;
			expect(wordReorder).toBeDefined();
			expect(wordReorder?.wordPinyinMap).toBeDefined();
			for (const word of wordReorder!.shuffledWords) {
				expect(wordReorder!.wordPinyinMap![word]).toBeDefined();
				expect(wordReorder!.wordPinyinMap![word].length).toBeGreaterThan(0);
			}
		}
	});

	it('tracks lesson completion and prevents duplicate completions', () => {
		expect(getCompletedLessons()).toEqual([]);

		const firstResult = markLessonCompleted('01-meet-people');
		expect(firstResult).toBe(true);
		expect(getCompletedLessons()).toContain('01-meet-people');

		const secondResult = markLessonCompleted('01-meet-people');
		expect(secondResult).toBe(false);
		expect(getCompletedLessons().length).toBe(1);
	});
});
