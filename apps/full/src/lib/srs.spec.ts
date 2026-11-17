import { describe, it, expect } from 'vitest';
import {
	calculateNextReview,
	isCardMastered,
	isCardLearning,
	isCardStudied,
	prioritizeAndShuffleCards
} from './utils/srs';
import type { WordProgress } from './types';

describe('SRS SM-2 Algorithm', () => {
	it('calculates initial "good" rating correctly', () => {
		const result = calculateNextReview(undefined, 'good');
		expect(result.correct).toBe(1);
		expect(result.wrong).toBe(0);
		expect(result.reps).toBe(1);
		expect(result.interval).toBe(1);
		expect(result.easeFactor).toBe(2.5);
	});

	it('resets interval and repetitions on "again" rating', () => {
		const existing: WordProgress = {
			weekId: 'week-1',
			wordNo: 1,
			correct: 3,
			wrong: 0,
			lastReviewed: Date.now() - 100000,
			dueDate: Date.now() - 50000,
			interval: 6,
			easeFactor: 2.5,
			reps: 3,
			lapses: 0
		};

		const result = calculateNextReview(existing, 'again');
		expect(result.wrong).toBe(1);
		expect(result.lapses).toBe(1);
		expect(result.reps).toBe(0);
		expect(result.interval).toBe(0);
		expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
	});

	it('advances interval and ease factor on "easy" rating', () => {
		const existing: WordProgress = {
			weekId: 'week-1',
			wordNo: 2,
			correct: 2,
			wrong: 0,
			lastReviewed: Date.now() - 100000,
			dueDate: Date.now() - 50000,
			interval: 3,
			easeFactor: 2.5,
			reps: 2,
			lapses: 0
		};

		const result = calculateNextReview(existing, 'easy');
		expect(result.correct).toBe(3);
		expect(result.reps).toBe(3);
		expect(result.easeFactor).toBe(2.65); // 2.5 + 0.15
		expect(result.interval).toBeGreaterThan(3);
	});

	it('decrements wrong count on "easy" rating down to 0', () => {
		const existing: WordProgress = {
			weekId: 'week-1',
			wordNo: 3,
			correct: 1,
			wrong: 2,
			lastReviewed: Date.now() - 100000,
			dueDate: Date.now() - 50000,
			interval: 1,
			easeFactor: 2.5,
			reps: 1,
			lapses: 1
		};

		const step1 = calculateNextReview(existing, 'easy');
		expect(step1.wrong).toBe(1);
		// SRS parameters still calculate correctly
		expect(step1.interval).toBeGreaterThan(1);
		expect(step1.reps).toBe(2);

		const step2 = calculateNextReview(step1, 'easy');
		expect(step2.wrong).toBe(0);

		const step3 = calculateNextReview(step2, 'easy');
		expect(step3.wrong).toBe(0); // Cannot go below 0
	});

	it('decrements wrong count on "good" rating when reps >= 1', () => {
		const existing: WordProgress = {
			weekId: 'week-1',
			wordNo: 4,
			correct: 2,
			wrong: 1,
			lastReviewed: Date.now() - 100000,
			dueDate: Date.now() - 50000,
			interval: 1,
			easeFactor: 2.5,
			reps: 1,
			lapses: 1
		};

		const result = calculateNextReview(existing, 'good');
		expect(result.wrong).toBe(0);
		expect(result.reps).toBe(2);
		expect(result.interval).toBe(3);
	});

	it('supports custom interval days', () => {
		const result = calculateNextReview(undefined, 'custom', 14);
		expect(result.interval).toBe(14);
		expect(result.reps).toBe(1);
	});

	it('correctly classifies mastered and learning cards', () => {
		const newCard: WordProgress = {
			weekId: 'week-1',
			wordNo: 1,
			correct: 1,
			wrong: 0,
			lastReviewed: Date.now(),
			interval: 1,
			reps: 1
		};
		expect(isCardMastered(newCard)).toBe(false);
		expect(isCardLearning(newCard)).toBe(true);

		const masteredCard: WordProgress = {
			weekId: 'week-1',
			wordNo: 2,
			correct: 5,
			wrong: 0,
			lastReviewed: Date.now(),
			interval: 14,
			reps: 4
		};
		expect(isCardMastered(masteredCard)).toBe(true);
		expect(isCardLearning(masteredCard)).toBe(false);
	});

	it('resolves word progress for both legacy and language-prefixed keys', async () => {
		const { getWordProgress } = await import('./utils/storage');
		const mockProgress: Record<string, WordProgress> = {
			'week-1:5': {
				weekId: 'week-1',
				wordNo: 5,
				correct: 1,
				wrong: 3,
				lastReviewed: 100,
				dueDate: 100,
				interval: 1,
				easeFactor: 2.5
			},
			'chinese-pack-2:10': {
				weekId: 'chinese-pack-2',
				wordNo: 10,
				correct: 2,
				wrong: 1,
				lastReviewed: 200,
				dueDate: 200,
				interval: 2,
				easeFactor: 2.5
			}
		};

		// Resolves legacy key when looking up by prefixed pack id
		const p1 = getWordProgress(mockProgress, 'chinese-week-1', 5, 'chinese');
		expect(p1).toBeDefined();
		expect(p1?.wrong).toBe(3);

		// Resolves direct key
		const p2 = getWordProgress(mockProgress, 'chinese-pack-2', 10, 'chinese');
		expect(p2).toBeDefined();
		expect(p2?.wrong).toBe(1);

		// Resolves legacy lookup for custom or stripped id
		const p3 = getWordProgress(mockProgress, 'pack-2', 10, 'chinese');
		expect(p3).toBeDefined();
		expect(p3?.wrong).toBe(1);

		// Resolves pack-1 lookup when key is week-1
		const p4 = getWordProgress(mockProgress, 'chinese-pack-1', 5, 'chinese');
		expect(p4).toBeDefined();
		expect(p4?.wrong).toBe(3);
	}, 30_000);

	it('correctly identifies studied vs unstudied cards', () => {
		expect(isCardStudied(undefined)).toBe(false);

		const zeroProgress: WordProgress = {
			weekId: 'pack-1',
			wordNo: 1,
			correct: 0,
			wrong: 0,
			lastReviewed: 0,
			reps: 0
		};
		expect(isCardStudied(zeroProgress)).toBe(false);

		const studiedProgress1: WordProgress = {
			weekId: 'pack-1',
			wordNo: 1,
			correct: 1,
			wrong: 0,
			lastReviewed: 100,
			reps: 1
		};
		expect(isCardStudied(studiedProgress1)).toBe(true);

		const studiedProgress2: WordProgress = {
			weekId: 'pack-1',
			wordNo: 2,
			correct: 0,
			wrong: 1,
			lastReviewed: 100,
			reps: 0
		};
		expect(isCardStudied(studiedProgress2)).toBe(true);
	});

	it('prioritises unstudied cards before studied cards in shuffle', () => {
		const cards = [
			{ No: 1, name: 'Card 1' },
			{ No: 2, name: 'Card 2' },
			{ No: 3, name: 'Card 3' },
			{ No: 4, name: 'Card 4' },
			{ No: 5, name: 'Card 5' }
		];

		// Cards 1 and 3 are studied, 2, 4, 5 are unstudied
		const progressMap: Record<number, WordProgress> = {
			1: { weekId: 'test', wordNo: 1, correct: 2, wrong: 0, lastReviewed: 100, reps: 1 },
			3: { weekId: 'test', wordNo: 3, correct: 0, wrong: 1, lastReviewed: 100, reps: 0 }
		};

		const shuffled = prioritizeAndShuffleCards(cards, (card) => progressMap[card.No]);

		expect(shuffled.length).toBe(5);
		// First 3 items MUST be the unstudied cards (2, 4, 5)
		const firstThreeNos = shuffled.slice(0, 3).map((c) => c.No);
		expect(firstThreeNos.sort()).toEqual([2, 4, 5]);

		// Last 2 items MUST be the studied cards (1, 3)
		const lastTwoNos = shuffled.slice(3).map((c) => c.No);
		expect(lastTwoNos.sort()).toEqual([1, 3]);
	});

	it('classifies cards not marked as easy as learning', () => {
		const easyCard = calculateNextReview(undefined, 'easy');
		expect(easyCard.lastRating).toBe('easy');
		expect(isCardLearning(easyCard)).toBe(false);
		expect(isCardMastered(easyCard)).toBe(true);

		const goodCard = calculateNextReview(undefined, 'good');
		expect(goodCard.lastRating).toBe('good');
		expect(isCardLearning(goodCard)).toBe(true);
		expect(isCardMastered(goodCard)).toBe(false);

		const hardCard = calculateNextReview(undefined, 'hard');
		expect(hardCard.lastRating).toBe('hard');
		expect(isCardLearning(hardCard)).toBe(true);

		const againCard = calculateNextReview(undefined, 'again');
		expect(againCard.lastRating).toBe('again');
		expect(isCardLearning(againCard)).toBe(true);
	});
});
