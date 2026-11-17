import { describe, it, expect } from 'vitest';
import { TONE_PAIRS, generateToneQuestion, validateToneAnswer } from '$lib/data/tonePairs';
import { calculateGameXP } from '$lib/utils/xp';

describe('Tone Pairs Lab Data & Game Logic', () => {
	it('defines exactly 16 two-syllable tone combinations', () => {
		expect(TONE_PAIRS.length).toBe(16);

		const expectedCombos: string[] = [];
		for (let t1 = 1; t1 <= 4; t1++) {
			for (let t2 = 1; t2 <= 4; t2++) {
				expectedCombos.push(`${t1}-${t2}`);
			}
		}

		const actualIds = TONE_PAIRS.map((p) => p.id);
		expect(actualIds.sort()).toEqual(expectedCombos.sort());

		for (const p of TONE_PAIRS) {
			expect(p.symbol1).toBeDefined();
			expect(p.symbol2).toBeDefined();
			expect(p.name).toContain(p.symbol1);
			expect(p.name).toContain(p.symbol2);
		}
	});

	it('ensures each tone pair has valid pitch contours and non-empty vocabulary', () => {
		for (const pair of TONE_PAIRS) {
			expect(pair.pitchContour1[0]).toBeGreaterThanOrEqual(1);
			expect(pair.pitchContour1[0]).toBeLessThanOrEqual(5);
			expect(pair.pitchContour1[1]).toBeGreaterThanOrEqual(1);
			expect(pair.pitchContour1[1]).toBeLessThanOrEqual(5);

			expect(pair.pitchContour2[0]).toBeGreaterThanOrEqual(1);
			expect(pair.pitchContour2[0]).toBeLessThanOrEqual(5);
			expect(pair.pitchContour2[1]).toBeGreaterThanOrEqual(1);
			expect(pair.pitchContour2[1]).toBeLessThanOrEqual(5);

			expect(pair.words.length).toBeGreaterThanOrEqual(3);
			for (const w of pair.words) {
				expect(w.hanzi).toBeTruthy();
				expect(w.pinyin).toBeTruthy();
				expect(w.english).toBeTruthy();
			}
		}
	});

	it('generates a valid question with 4 unique options including the correct answer', () => {
		for (let i = 0; i < 20; i++) {
			const q = generateToneQuestion();
			expect(q.word).toBeDefined();
			expect(q.correctPair).toBeDefined();
			expect(q.options.length).toBe(4);

			const optionIds = q.options.map((o) => o.id);
			const uniqueIds = new Set(optionIds);
			expect(uniqueIds.size).toBe(4);

			expect(optionIds).toContain(q.correctPair.id);
		}
	});

	it('validates correct and incorrect user answers', () => {
		expect(validateToneAnswer('1-1', '1-1')).toBe(true);
		expect(validateToneAnswer('2-4', '2-4')).toBe(true);
		expect(validateToneAnswer('1-1', '1-2')).toBe(false);
		expect(validateToneAnswer('3-2', '4-1')).toBe(false);
	});

	it('computes game XP in strict alignment with AGENTS.md rules', () => {
		// Min 1 XP if correct > 0, 0 if <= 0
		expect(calculateGameXP(0, 0, 0)).toBe(0);
		expect(calculateGameXP(1, 40, 1)).toBe(1);

		// Base: Math.floor(correct * 0.5)
		// Accuracy: +4 (>=80%) or +2 (>=60%)
		// Combo: Math.min(3, Math.floor(maxCombo / 3))
		// 10 correct, 85% accuracy, maxCombo 7 => base 5 + acc 4 + combo 2 = 11 XP
		expect(calculateGameXP(10, 85, 7)).toBe(11);

		// 10 correct, 65% accuracy, maxCombo 9 => base 5 + acc 2 + combo 3 = 10 XP
		expect(calculateGameXP(10, 65, 9)).toBe(10);
	});
});
