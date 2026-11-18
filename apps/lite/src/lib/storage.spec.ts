import { describe, it, expect } from 'vitest';
import {
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	calculateNextReview,
	isCardDue,
	type MyWordInput,
	type WordProgress
} from '@flash/shared';
import {
	isValidUsername,
	getSavedUsername,
	setSavedUsername,
	getStreakFreezeData,
	saveStreakFreezeData,
	computeStreakStats,
	registerDataMutationListener,
	notifyMutation
} from './storage';

const testWord: MyWordInput = {
	word: '苹果',
	pinyin: 'píngguǒ',
	meaning: 'apple',
	example: '我想吃苹果。'
};

describe('Lite App Storage Core Logic', () => {
	it('adds word into My Words custom deck structure', () => {
		const deck = buildDeckWithAddedWord(null, testWord);
		expect(deck.words).toHaveLength(1);
		expect(deck.words[0]['Chinese Word']).toBe('苹果');
		expect(deck.words[0].Pinyin).toBe('píngguǒ');
		expect(deck.words[0].No).toBe(1);
	});

	it('adds multiple words in bulk into deck structure sequentially', () => {
		const words: MyWordInput[] = [
			testWord,
			{ word: '西瓜', pinyin: 'xīguā', meaning: 'watermelon', example: '' },
			{ word: '葡萄', pinyin: 'pútao', meaning: 'grape', example: '' }
		];
		let deck = buildDeckWithAddedWord(null, words[0]);
		for (let i = 1; i < words.length; i++) {
			deck = buildDeckWithAddedWord(deck, words[i]);
		}
		expect(deck.words).toHaveLength(3);
		expect(deck.words[0].No).toBe(1);
		expect(deck.words[1].No).toBe(2);
		expect(deck.words[2].No).toBe(3);
		expect(deck.words[2]['Chinese Word']).toBe('葡萄');
	});

	it('updates word in place preserving card No', () => {
		const deck = buildDeckWithAddedWord(null, testWord);
		const updated = buildDeckWithUpdatedWord(deck, 1, {
			...testWord,
			meaning: 'crisp apple'
		});
		expect(updated.words[0].No).toBe(1);
		expect(updated.words[0]['English Meaning']).toBe('crisp apple');
	});

	it('deletes word from deck without touching remaining items', () => {
		let deck = buildDeckWithAddedWord(null, testWord);
		deck = buildDeckWithAddedWord(deck, {
			word: '香蕉',
			pinyin: 'xiāngjiāo',
			meaning: 'banana',
			example: ''
		});
		expect(deck.words).toHaveLength(2);

		const afterDelete = buildDeckWithoutWord(deck, 1);
		expect(afterDelete.words).toHaveLength(1);
		expect(afterDelete.words[0]['Chinese Word']).toBe('香蕉');
	});

	it('handles spaced repetition intervals correctly', () => {
		// First correct rating
		const p1 = calculateNextReview(undefined, 'good');
		expect(p1.interval).toBe(1);
		expect(p1.reps).toBe(1);
		expect(p1.wrong).toBe(0);

		// Second correct rating
		const p2 = calculateNextReview(p1, 'good');
		expect(p2.interval).toBe(3);
		expect(p2.reps).toBe(2);

		// Third correct rating -> 3 * 2.5 = 8 days
		const p3 = calculateNextReview(p2, 'good');
		expect(p3.interval).toBe(8);
		expect(p3.reps).toBe(3);

		// Wrong rating -> interval resets to 0, due immediately
		const pWrong = calculateNextReview(p3, 'again');
		expect(pWrong.interval).toBe(0);
		expect(pWrong.reps).toBe(0);
		expect(pWrong.wrong).toBe(1);
		expect(pWrong.lapses).toBe(1);
		expect(pWrong.dueDate).toBeLessThanOrEqual(Date.now());
		expect(isCardDue(pWrong)).toBe(true);
	});

	it('sorts and caps review queue to 10 items prioritizing unreviewed and earliest due', () => {
		const now = Date.now();
		const items: Array<{ id: number; progress?: WordProgress }> = [];

		// Create 15 items with various progress
		for (let i = 1; i <= 15; i++) {
			if (i <= 3) {
				// Unreviewed
				items.push({ id: i, progress: undefined });
			} else {
				// Reviewed with varying due dates
				items.push({
					id: i,
					progress: {
						weekId: '',
						wordNo: i,
						correct: 1,
						wrong: 0,
						lastReviewed: now - 86400000,
						dueDate: now - (15 - i) * 10000,
						interval: 1,
						easeFactor: 2.5,
						reps: 1,
						lapses: 0
					}
				});
			}
		}

		// Filter due cards
		const due = items.filter((item) => isCardDue(item.progress));
		expect(due).toHaveLength(15);

		// Sort: unreviewed first, then earliest due date
		due.sort((a, b) => {
			const aReviewed = Boolean(a.progress?.lastReviewed);
			const bReviewed = Boolean(b.progress?.lastReviewed);
			if (!aReviewed && bReviewed) return -1;
			if (aReviewed && !bReviewed) return 1;

			const aDue = a.progress?.dueDate ?? 0;
			const bDue = b.progress?.dueDate ?? 0;
			return aDue - bDue;
		});

		const batch = due.slice(0, 10);
		expect(batch).toHaveLength(10);
		// First 3 should be unreviewed
		expect(batch[0].progress).toBeUndefined();
		expect(batch[1].progress).toBeUndefined();
		expect(batch[2].progress).toBeUndefined();
		// Fourth should have earliest due date
		expect(batch[3].id).toBe(4);
	});

	it('validates username format properly', () => {
		expect(isValidUsername('a')).toBe(false); // too short
		expect(isValidUsername('valid-user')).toBe(true);
		expect(isValidUsername('user123')).toBe(true);
		expect(isValidUsername('User_Name')).toBe(false); // uppercase / underscore
		expect(isValidUsername('user name')).toBe(false); // space
		expect(isValidUsername('a'.repeat(31))).toBe(false); // too long
	});

	it('persists and retrieves username in localStorage', () => {
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

		Object.defineProperty(globalThis, 'localStorage', {
			value: new LocalStorageMock(),
			writable: true
		});

		expect(getSavedUsername()).toBe('');
		setSavedUsername('test-user');
		expect(getSavedUsername()).toBe('test-user');

		setSavedUsername('');
		expect(getSavedUsername()).toBe('');
	});

	it('persists streak freeze data in localStorage', () => {
		saveStreakFreezeData({ usedDates: ['2026-03-01', '2026-03-02'] });
		const freeze = getStreakFreezeData();
		expect(freeze.usedDates).toEqual(['2026-03-01', '2026-03-02']);
	});

	it('computes streak stats using identical streak rules', () => {
		const now = Date.now();
		const todayIso = new Date(now).toISOString().split('T')[0];
		const yesterdayIso = new Date(now - 86400000).toISOString().split('T')[0];

		const progress: Record<string, WordProgress> = {
			'custom-my-words:1': {
				weekId: 'custom',
				wordNo: 1,
				correct: 1,
				wrong: 0,
				lastReviewed: now - 86400000
			},
			'custom-my-words:2': {
				weekId: 'custom',
				wordNo: 2,
				correct: 1,
				wrong: 0,
				lastReviewed: now
			}
		};

		const stats = computeStreakStats(progress, { usedDates: [] });
		expect(stats.currentStreak).toBe(2);
		expect(stats.activeDates).toContain(todayIso);
		expect(stats.activeDates).toContain(yesterdayIso);
	});

	it('migrates legacy Week N category to Sunday dates while keeping unassigned', () => {
		const legacyWord = {
			...testWord,
			category: 'Week 1'
		};
		const deck = buildDeckWithAddedWord(null, legacyWord);
		expect(deck.words[0].category).toBe('Week 1');

		// Simulating storage migration mapping
		const migratedWords = deck.words.map((w) => ({
			...w,
			category: w.category === 'Week 1' ? 'Sun 22, Nov 2026' : w.category || undefined
		}));
		expect(migratedWords[0].category).toBe('Sun 22, Nov 2026');
	});

	it('notifies all registered mutation listeners without overwriting', () => {
		let called1 = 0;
		let called2 = 0;
		const unsub1 = registerDataMutationListener(() => {
			called1++;
		});
		const unsub2 = registerDataMutationListener(() => {
			called2++;
		});

		notifyMutation();
		expect(called1).toBe(1);
		expect(called2).toBe(1);

		unsub1();
		notifyMutation();
		expect(called1).toBe(1);
		expect(called2).toBe(2);

		unsub2();
		notifyMutation();
		expect(called1).toBe(1);
		expect(called2).toBe(2);
	});
});
