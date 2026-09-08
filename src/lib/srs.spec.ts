import { describe, it, expect } from 'vitest';
import { calculateNextReview, isCardDue, isCardMastered, isCardLearning } from './utils/srs';
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
});
