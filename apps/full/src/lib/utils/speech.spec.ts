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

	it('handles filler words using sliding window substring similarity', () => {
		const res = evaluateSpeechAccuracy(
			'呃 请不要放香菜 谢谢',
			'请不要放香菜',
			'chinese',
			'Qǐng bù yào fàng xiāngcài',
			['香菜']
		);
		expect(res.passed).toBe(true);
		expect(res.score).toBeGreaterThanOrEqual(0.65);
	});

	it('evaluates pinyin transcription fallback tolerance', () => {
		const res = evaluateSpeechAccuracy('ni hao', '你好', 'chinese', 'nǐ hǎo');
		expect(res.passed).toBe(true);
		expect(res.score).toBe(1.0);
	});

	it('rejects completely unrelated Chinese speech with no keywords', () => {
		const res = evaluateSpeechAccuracy(
			'你好',
			'我喜欢在周末踢足球',
			'chinese',
			'wǒ xǐhuan zài zhōumò tī zúqiú'
		);
		expect(res.passed).toBe(false);
		expect(res.score).toBeLessThan(0.35);
		expect(res.feedback).toBe('Could not quite catch that. Give it another try!');
	});

	it('rejects completely unrelated French speech', () => {
		const res = evaluateSpeechAccuracy(
			'Bonjour tout le monde',
			'Je voudrais un café s’il vous plaît',
			'french'
		);
		expect(res.passed).toBe(false);
		expect(res.score).toBeLessThan(0.35);
		expect(res.feedback).toBe('Could not quite catch that. Give it another try!');
	});

	it('does not pass unrelated speech when keywords is undefined (repeat mode)', () => {
		const res = evaluateSpeechAccuracy(
			'今天天气真好',
			'请不要放香菜',
			'chinese',
			'Qǐng bù yào fàng xiāngcài',
			undefined
		);
		expect(res.passed).toBe(false);
		expect(res.score).toBeLessThan(0.35);
		expect(res.feedback).not.toContain('Excellent pronunciation');
	});

	it('does not falsely pass unrelated sentence that accidentally contains a single keyword', () => {
		const res = evaluateSpeechAccuracy(
			'今天星期一我去超市买苹果',
			'请不要放香菜',
			'chinese',
			'Qǐng bù yào fàng xiāngcài',
			['我']
		);
		expect(res.passed).toBe(false);
		expect(res.score).toBeLessThan(0.5);
	});
});
