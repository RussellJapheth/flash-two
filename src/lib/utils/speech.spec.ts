import { describe, it, expect } from 'vitest';
import {
	normalizeText,
	calculateSimilarity,
	evaluateSpeechAccuracy,
	stripPinyinTones
} from './speech';

describe('Speech Evaluation Utilities', () => {
	it('normalizes text and strips punctuation correctly', () => {
		expect(normalizeText('请不要放香菜！', 'chinese')).toBe('请不要放香菜');
		expect(normalizeText('Une baguette, s’il vous plaît.', 'french')).toBe(
			'une baguette sil vous plait'
		);
	});

	it('computes string similarity correctly', () => {
		expect(calculateSimilarity('hello', 'hello')).toBe(1);
		expect(calculateSimilarity('nihao', 'nihao')).toBe(1);
		expect(calculateSimilarity('abcd', 'abce')).toBe(0.75);
	});

	it('evaluates accurate Chinese speech correctly', () => {
		const res = evaluateSpeechAccuracy(
			'请不要放香菜',
			'请不要放香菜',
			'chinese',
			'Qǐng bù yào fàng xiāngcài',
			['香菜', '不要']
		);
		expect(res.passed).toBe(true);
		expect(res.score).toBe(1.0);
		expect(res.matchedKeywords).toContain('香菜');
	});

	it('evaluates Chinese speech with mild differences with keyword match', () => {
		const res = evaluateSpeechAccuracy(
			'请别放香菜',
			'请不要放香菜',
			'chinese',
			'Qǐng bù yào fàng xiāngcài',
			['香菜']
		);
		expect(res.passed).toBe(true);
		expect(res.matchedKeywords).toContain('香菜');
	});

	it('evaluates accurate French speech correctly', () => {
		const res = evaluateSpeechAccuracy(
			'Une baguette tradition sil vous plait',
			'Une baguette tradition s’il vous plaît',
			'french',
			undefined,
			['baguette', 'tradition']
		);
		expect(res.passed).toBe(true);
		expect(res.score).toBeGreaterThanOrEqual(0.9);
	});

	it('strips pinyin tone marks', () => {
		expect(stripPinyinTones('nǐ hǎo')).toBe('nihao');
		expect(stripPinyinTones('xiāngcài')).toBe('xiangcai');
	});
});
