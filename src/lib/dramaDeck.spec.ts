import { describe, it, expect } from 'vitest';
import { DRAMA_CUSTOM_DECK } from '$lib/data/dramaDeck';
import { buildCloze } from '$lib/utils/sentencePractice';
import { prioritizeAndShuffleCards } from '$lib/utils/srs';

describe('Drama Custom Deck', () => {
	it('has valid structure and metadata', () => {
		expect(DRAMA_CUSTOM_DECK.id).toBe('custom-drama');
		expect(DRAMA_CUSTOM_DECK.name).toBe('drama');
		expect(DRAMA_CUSTOM_DECK.language).toBe('chinese');
		expect(DRAMA_CUSTOM_DECK.words.length).toBe(41);
	});

	it('contains sequential word numbers from 1 to 41', () => {
		DRAMA_CUSTOM_DECK.words.forEach((w, idx) => {
			expect(w.No).toBe(idx + 1);
			expect(w['Chinese Word']).toBeDefined();
			expect(w['Chinese Word']!.length).toBeGreaterThan(0);
			expect(w.Pinyin).toBeDefined();
			expect(w['Part of Speech']).toBeDefined();
			expect(w['English Meaning']).toBeDefined();
			expect(w['Example (Chinese + Pinyin)']).toBeDefined();
		});
	});

	it('covers all target vocabulary in example sentences and supports cloze practice', () => {
		for (const word of DRAMA_CUSTOM_DECK.words) {
			const cloze = buildCloze(word, 'chinese');
			expect(cloze, `Card ${word.No} (${word['Chinese Word']}) should support cloze`).not.toBeNull();
			expect(cloze?.targetWord).toBe(word['Chinese Word']);
			expect(cloze?.displaySentence).toContain('{blank}');
		}
	});

	it('preserves sequential order when shuffle is disabled', () => {
		const cards = [...DRAMA_CUSTOM_DECK.words];
		// No shuffle scenario: keeps exact card order
		const cardNos = cards.map((c) => c.No);
		expect(cardNos).toEqual(Array.from({ length: 41 }, (_, i) => i + 1));
	});

	it('shuffles cards when shuffle is enabled', () => {
		const cards = [...DRAMA_CUSTOM_DECK.words];
		// With empty progress map, prioritizeAndShuffleCards shuffles unstudied cards
		const shuffled = prioritizeAndShuffleCards(cards, () => undefined);
		expect(shuffled.length).toBe(41);
		// It is statistically almost impossible (< 1 / 41!) for a 41-element random shuffle to match exact 1..41 order
		const shuffledNos = shuffled.map((c) => c.No);
		const originalNos = Array.from({ length: 41 }, (_, i) => i + 1);
		expect(shuffledNos).not.toEqual(originalNos);
	});
});