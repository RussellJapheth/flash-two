import { describe, it, expect } from 'vitest';
import { getDeckIcon } from './deckIcons';

describe('Deck Icons', () => {
	it('maps all 35 built-in Chinese decks to their unique topic icons', () => {
		for (let i = 1; i <= 35; i++) {
			const icon = getDeckIcon(`chinese-${i}`);
			expect(icon.imageSrc).toBe(`/images/decks/chinese-${i}.svg`);
			expect(icon.alt).not.toBe('Custom Deck Icon');
		}
	});

	it('maps both French decks to their unique topic icons', () => {
		for (let i = 1; i <= 2; i++) {
			const icon = getDeckIcon(`french-${i}`);
			expect(icon.imageSrc).toBe(`/images/decks/french-${i}.svg`);
			expect(icon.alt).not.toBe('Custom Deck Icon');
		}
	});

	it('maps custom decks and unknown deck IDs to default custom icon', () => {
		const custom1 = getDeckIcon('my-custom-deck-123');
		expect(custom1.imageSrc).toBe('/images/decks/custom-default.svg');
		expect(custom1.alt).toBe('Custom Deck Icon');

		const custom2 = getDeckIcon('custom-travel-vocab');
		expect(custom2.imageSrc).toBe('/images/decks/custom-default.svg');
	});
});
