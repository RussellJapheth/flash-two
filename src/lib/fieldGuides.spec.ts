import { describe, it, expect } from 'vitest';
import {
	FIELD_GUIDES,
	getFieldGuideById,
	getFieldGuidesByCategory,
	searchFieldGuides
} from '$lib/data/fieldGuides';
import {
	parseFieldGuideMarkdown,
	tokenizeTextWithHanzi,
	parseInlineMarkdown
} from '$lib/utils/fieldGuideParser';

describe('Field Guides Catalog', () => {
	it('contains all 13 curated field guides', () => {
		expect(FIELD_GUIDES.length).toBe(13);
		for (let i = 1; i <= 13; i++) {
			const guide = FIELD_GUIDES.find((g) => g.number === i);
			expect(guide).toBeDefined();
			expect(guide?.title).toBeTruthy();
			expect(guide?.subtitle).toBeTruthy();
			expect(guide?.category).toBeTruthy();
			expect(guide?.packId).toBeTruthy();
			expect(guide?.markdownContent.length).toBeGreaterThan(100);
			expect(guide?.keyVocab.length).toBeGreaterThan(0);
		}
	});

	it('retrieves guide by exact and normalized id', () => {
		const g1 = getFieldGuideById('01-meet-people');
		expect(g1).toBeDefined();
		expect(g1?.number).toBe(1);

		const g2 = getFieldGuideById('02-order-food');
		expect(g2).toBeDefined();
		expect(g2?.number).toBe(2);

		const g5 = getFieldGuideById('05-conversation-rescue');
		expect(g5).toBeDefined();
		expect(g5?.number).toBe(5);

		const nonExistent = getFieldGuideById('99-invalid');
		expect(nonExistent).toBeUndefined();
	});

	it('filters guides by category', () => {
		const conversation = getFieldGuidesByCategory('conversation');
		expect(conversation.length).toBeGreaterThanOrEqual(3);
		expect(conversation.every((g) => g.category === 'conversation')).toBe(true);

		const survival = getFieldGuidesByCategory('survival');
		expect(survival.length).toBeGreaterThanOrEqual(4);

		const all = getFieldGuidesByCategory('all');
		expect(all.length).toBe(13);
	});

	it('searches field guides by title, category, and vocabulary', () => {
		const searchFood = searchFieldGuides('food');
		expect(searchFood.some((g) => g.id === '02-order-food-and-drinks')).toBe(true);

		const searchHanzi = searchFieldGuides('来自');
		expect(searchHanzi.some((g) => g.id === '01-meet-people')).toBe(true);

		const searchPinyin = searchFieldGuides('pīnyīn');
		expect(searchPinyin.some((g) => g.id === '13-typing-and-spelling-guide')).toBe(true);
	});
});

describe('Field Guide Markdown Parser', () => {
	it('parses headings, deck links, tables, and lists', () => {
		const md = `
# Field Guide 01: Test Guide

_Source: Test Source_  
_Corresponding SRS Deck: Pack 24 (Field Guide: Test Connections)_

## 1. Loop

| Step | Hanzi | Pinyin |
| :--- | :---- | :----- |
| 1    | 你好  | Nǐ hǎo |

- **Label**: \`我是英国人\` (_Wǒ shì yīngguó rén_ — I am British)
`;

		const blocks = parseFieldGuideMarkdown(md);
		expect(blocks.length).toBeGreaterThan(0);

		const deckLink = blocks.find((b) => b.type === 'deckLink');
		expect(deckLink).toBeDefined();
		if (deckLink?.type === 'deckLink') {
			expect(deckLink.packNum).toBe(24);
		}

		const table = blocks.find((b) => b.type === 'table');
		expect(table).toBeDefined();
		if (table?.type === 'table') {
			expect(table.headers).toEqual(['Step', 'Hanzi', 'Pinyin']);
			expect(table.rows.length).toBe(1);
			expect(table.rows[0][1]).toBe('你好');
		}

		const listItem = blocks.find((b) => b.type === 'listItem');
		expect(listItem).toBeDefined();
		if (listItem?.type === 'listItem') {
			expect(listItem.label).toBe('Label');
			expect(listItem.hanzi).toBe('我是英国人');
		}
	});

	it('tokenizes text with Hanzi correctly', () => {
		const tokens = tokenizeTextWithHanzi('Hello 你好 World 很高兴认识你!');
		expect(tokens).toEqual([
			{ text: 'Hello ', isHanzi: false },
			{ text: '你好', isHanzi: true },
			{ text: ' World ', isHanzi: false },
			{ text: '很高兴认识你', isHanzi: true },
			{ text: '!', isHanzi: false }
		]);
	});

	it('parses inline markdown and removes raw underscores and asterisks', () => {
		const parsed = parseInlineMarkdown('昨天 (_yesterday_) · **衣服** · `这个我不太想说`');
		expect(parsed.length).toBeGreaterThan(0);

		// Italic segment should strip underscores
		const italicSeg = parsed.find((s) => s.italic);
		expect(italicSeg).toBeDefined();
		expect(italicSeg?.text).toBe('yesterday');

		// Bold segment should strip asterisks
		const boldSeg = parsed.find((s) => s.bold);
		expect(boldSeg).toBeDefined();
		expect(boldSeg?.text).toBe('衣服');
		expect(boldSeg?.tokens.some((t) => t.isHanzi)).toBe(true);

		// Code segment
		const codeSeg = parsed.find((s) => s.code);
		expect(codeSeg).toBeDefined();
		expect(codeSeg?.text).toBe('这个我不太想说');

		// Replaces latex arrow with unicode arrow
		const withArrow = parseInlineMarkdown('谢谢 (_xièxie_) $\\rightarrow$ 不客气');
		expect(withArrow.some((s) => s.text.includes('→'))).toBe(true);
	});
});
