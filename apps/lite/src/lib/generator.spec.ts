import { describe, it, expect } from 'vitest';
import {
	parseBulkInput,
	countBulkWords,
	synthesizeExample,
	generateCardForWord,
	generateCardsInBulk
} from './generator';

describe('generator', () => {
	it('parses bulk input on new lines only, trimming whitespace and ignoring blanks', () => {
		const raw = `
      你好   
      
      谢谢
      苹果, 香蕉
      猫
    `;
		const parsed = parseBulkInput(raw);
		expect(parsed).toEqual(['你好', '谢谢', '苹果, 香蕉', '猫']);
		expect(countBulkWords(raw)).toBe(4);
	});

	it('returns 0 for empty or whitespace-only input', () => {
		expect(parseBulkInput('')).toEqual([]);
		expect(parseBulkInput('   \n  \n\t')).toEqual([]);
		expect(countBulkWords('  \n  ')).toBe(0);
	});

	it('synthesizes an example sentence with Pinyin and English', () => {
		const example = synthesizeExample('茶', 'tea');
		expect(example).toContain('我喜欢茶。');
		expect(example).toContain('Wǒ');
		expect(example).toContain('chá');
		expect(example).toContain('— I like tea.');
	});

	it('generates card from corpus for known word', async () => {
		const card = await generateCardForWord('你好', 'Week 1');
		expect(card.word).toBe('你好');
		expect(card.pinyin).toBe('nǐ hǎo');
		expect(card.meaning).toContain('hello');
		expect(card.example).toContain('你好');
		expect(card.category).toBe('Week 1');
	});

	it('generates card with synthesized pinyin and example for new word', async () => {
		const card = await generateCardForWord('飞龙', 'Week 2');
		expect(card.word).toBe('飞龙');
		expect(card.pinyin).toBe('fēi lóng');
		expect(card.example).toContain('飞龙');
		expect(card.category).toBe('Week 2');
	});

	it('generates multiple cards in bulk with progress callback', async () => {
		const progressEvents: [number, number][] = [];
		const raw = '猫\n狗\n鸟';
		const cards = await generateCardsInBulk(raw, 'Week 3', (curr, total) => {
			progressEvents.push([curr, total]);
		});

		expect(cards).toHaveLength(3);
		expect(cards[0].word).toBe('猫');
		expect(cards[1].word).toBe('狗');
		expect(cards[2].word).toBe('鸟');
		expect(cards[0].category).toBe('Week 3');
		expect(progressEvents).toEqual([
			[1, 3],
			[2, 3],
			[3, 3]
		]);
	});
});
