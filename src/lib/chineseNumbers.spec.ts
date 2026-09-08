import { describe, it, expect } from 'vitest';
import {
	numberToChinese,
	generateDistractors,
	generateNumberRushQuestion
} from './utils/chineseNumbers';
import { deduplicateUserLeaderboard, type GameScoreRecord } from './utils/gameStorage';

describe('Chinese Number Converter (Number Rush)', () => {
	it('converts single digits 0-9 accurately', () => {
		expect(numberToChinese(0)).toEqual({ value: 0, hanzi: '零', pinyin: 'líng' });
		expect(numberToChinese(1)).toEqual({ value: 1, hanzi: '一', pinyin: 'yī' });
		expect(numberToChinese(4)).toEqual({ value: 4, hanzi: '四', pinyin: 'sì' });
		expect(numberToChinese(8)).toEqual({ value: 8, hanzi: '八', pinyin: 'bā' });
	});

	it('converts teens 10-19 accurately', () => {
		expect(numberToChinese(10)).toEqual({ value: 10, hanzi: '十', pinyin: 'shí' });
		expect(numberToChinese(11)).toEqual({ value: 11, hanzi: '十一', pinyin: 'shí yī' });
		expect(numberToChinese(14)).toEqual({ value: 14, hanzi: '十四', pinyin: 'shí sì' });
		expect(numberToChinese(19)).toEqual({ value: 19, hanzi: '十九', pinyin: 'shí jiǔ' });
	});

	it('converts 20-99 accurately', () => {
		expect(numberToChinese(20)).toEqual({ value: 20, hanzi: '二十', pinyin: 'èr shí' });
		expect(numberToChinese(35)).toEqual({ value: 35, hanzi: '三十五', pinyin: 'sān shí wǔ' });
		expect(numberToChinese(40)).toEqual({ value: 40, hanzi: '四十', pinyin: 'sì shí' });
		expect(numberToChinese(99)).toEqual({ value: 99, hanzi: '九十九', pinyin: 'jiǔ shí jiǔ' });
	});

	it('converts 100-999 accurately', () => {
		expect(numberToChinese(100)).toEqual({ value: 100, hanzi: '一百', pinyin: 'yī bǎi' });
		expect(numberToChinese(105)).toEqual({
			value: 105,
			hanzi: '一百零五',
			pinyin: 'yī bǎi líng wǔ'
		});
		expect(numberToChinese(120)).toEqual({
			value: 120,
			hanzi: '一百二十',
			pinyin: 'yī bǎi èr shí'
		});
		expect(numberToChinese(350)).toEqual({
			value: 350,
			hanzi: '三百五十',
			pinyin: 'sān bǎi wǔ shí'
		});
		expect(numberToChinese(999)).toEqual({
			value: 999,
			hanzi: '九百九十九',
			pinyin: 'jiǔ bǎi jiǔ shí jiǔ'
		});
	});

	it('generates 3 distinct valid distractors for any number', () => {
		for (const target of [0, 5, 14, 35, 80, 99]) {
			const distractors = generateDistractors(target, 99);
			expect(distractors).toHaveLength(3);
			expect(distractors).not.toContain(target);
			const unique = new Set(distractors);
			expect(unique.size).toBe(3);
			distractors.forEach((d) => {
				expect(d).toBeGreaterThanOrEqual(0);
				expect(d).toBeLessThanOrEqual(99);
			});
		}
	});

	it('generates a full 4-option question containing the correct answer', () => {
		const q = generateNumberRushQuestion(99);
		expect(q.options).toHaveLength(4);
		expect(q.options).toContain(q.correctValue);
		expect(new Set(q.options).size).toBe(4);
		expect(q.hanzi).toBeTruthy();
		expect(q.pinyin).toBeTruthy();
	});

	it('never repeats the same number during a round when using usedNumbers tracking', () => {
		const used = new Set<number>();
		const totalQuestions = 50;
		for (let i = 0; i < totalQuestions; i++) {
			const q = generateNumberRushQuestion(99, used);
			expect(used.has(q.correctValue)).toBe(true);
		}
		// All 50 questions must have unique numbers
		expect(used.size).toBe(50);
	});

	it('deduplicates leaderboard so each user has one entry per mode (visual vs audio)', () => {
		const rawRecords: GameScoreRecord[] = [
			{
				id: '1',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 500,
				correct: 5,
				wrong: 0,
				accuracy: 100,
				maxCombo: 5,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: '2',
				username: 'bob',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 800,
				correct: 8,
				wrong: 0,
				accuracy: 100,
				maxCombo: 8,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: '3',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1200,
				correct: 12,
				wrong: 1,
				accuracy: 92,
				maxCombo: 10,
				mode: 'visual',
				playedAt: 2000
			},
			{
				id: '4',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 950,
				correct: 10,
				wrong: 0,
				accuracy: 100,
				maxCombo: 10,
				mode: 'audio',
				playedAt: 2500
			},
			{
				id: '5',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 600,
				correct: 6,
				wrong: 2,
				accuracy: 75,
				maxCombo: 4,
				mode: 'audio',
				playedAt: 1500
			}
		];

		const deduplicated = deduplicateUserLeaderboard(rawRecords);
		// Alice has 1 visual (1200) and 1 audio (950), Bob has 1 visual (800) -> total 3 entries
		expect(deduplicated).toHaveLength(3);
		expect(deduplicated[0].username).toBe('alice');
		expect(deduplicated[0].mode).toBe('visual');
		expect(deduplicated[0].score).toBe(1200);

		expect(deduplicated[1].username).toBe('alice');
		expect(deduplicated[1].mode).toBe('audio');
		expect(deduplicated[1].score).toBe(950);

		expect(deduplicated[2].username).toBe('bob');
		expect(deduplicated[2].mode).toBe('visual');
		expect(deduplicated[2].score).toBe(800);
	});
});
