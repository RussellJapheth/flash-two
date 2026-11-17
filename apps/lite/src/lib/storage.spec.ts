import { describe, it, expect } from 'vitest';
import {
	buildDeckWithAddedWord,
	buildDeckWithUpdatedWord,
	buildDeckWithoutWord,
	type MyWordInput
} from '@flash/shared';

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
});
