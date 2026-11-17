import { describe, it, expect } from 'vitest';
import {
	calculateNextReview,
	isCardMastered,
	isCardLearning,
	isCardDue,
	prioritizeAndShuffleCards
} from './srs.js';
import type { WordProgress } from './types.js';

describe('SRS SM-2 Algorithm (Shared)', () => {
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
		expect(result.easeFactor).toBe(2.3);
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
		expect(result.easeFactor).toBe(2.65);
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
		expect(step1.interval).toBeGreaterThan(1);
		expect(step1.reps).toBe(2);

		const step2 = calculateNextReview(step1, 'easy');
		expect(step2.wrong).toBe(0);

		const step3 = calculateNextReview(step2, 'easy');
		expect(step3.wrong).toBe(0);
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

	it('isCardDue accurately reflects dueDate against now', () => {
		expect(isCardDue(undefined)).toBe(true);
		expect(isCardDue({ dueDate: Date.now() - 1000 } as WordProgress)).toBe(true);
		expect(isCardDue({ dueDate: Date.now() + 100000 } as WordProgress)).toBe(false);
	});

	it('prioritizeAndShuffleCards puts unstudied before studied', () => {
		const cards = [{ No: 1 }, { No: 2 }, { No: 3 }];
		const progressMap: Record<number, WordProgress> = {
			2: { No: 2, correct: 1 } as unknown as WordProgress
		};
		const result = prioritizeAndShuffleCards(cards, (c) => progressMap[c.No]);
		expect(result.length).toBe(3);
		expect(result[result.length - 1].No).toBe(2);
	});
});
