import { describe, it, expect } from 'vitest';
import {
	normalizePinyin,
	normalizeChinese,
	formatPinyin,
	searchDictionary
} from '$lib/utils/dictionary';

describe('Dictionary Utils', () => {
	it('normalizes Pinyin with tone accents correctly', () => {
		expect(normalizePinyin('nǐ hǎo')).toBe('nihao');
		expect(normalizePinyin('Zài jiàn')).toBe('zaijian');
		expect(normalizePinyin('Xièxie')).toBe('xiexie');
		expect(normalizePinyin('nǚ')).toBe('nv');
	});

	it('normalizes Pinyin with tone numbers correctly', () => {
		expect(normalizePinyin('ni3 hao3')).toBe('nihao');
		expect(normalizePinyin('zai4 jian4')).toBe('zaijian');
	});

	it('normalizes Chinese characters correctly', () => {
		expect(normalizeChinese(' 你好 ')).toBe('你好');
		expect(normalizeChinese('再见')).toBe('再见');
	});

	it('formats numbered Pinyin strings into proper accented Pinyin', () => {
		expect(formatPinyin('yu2 yue4')).toBe('yú yuè');
		expect(formatPinyin('ni3 hao3')).toBe('nǐ hǎo');
		expect(formatPinyin('nv3')).toBe('nǚ');
		expect(formatPinyin('Bei3 jing1')).toBe('Běi jīng');
		expect(formatPinyin('yú yuè')).toBe('yú yuè');
	});

	it('applies Pinyin overrides for words with dictionary inaccuracies', () => {
		expect(formatPinyin('yú yú', '魣鱼')).toBe('xù yú');
		expect(formatPinyin('yú', '魣')).toBe('xù');
	});

	it('handles single-letter search without freezing or matching random word substrings', async () => {
		const results = await searchDictionary('k');
		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBeGreaterThan(0);
		for (const item of results) {
			const eng = (item['English Meaning'] || '').toLowerCase();
			const py = (item.Pinyin || '').toLowerCase();
			const zh = item['Chinese Word'] || '';
			const matchesWordBoundary = /\bk/i.test(eng);
			const matchesPinyin = py.startsWith('k') || py.includes(' k');
			const matchesChinese = zh.toLowerCase().includes('k');
			expect(matchesWordBoundary || matchesPinyin || matchesChinese).toBe(true);
		}
	});

	it('returns empty array for empty or whitespace query', async () => {
		expect(await searchDictionary('')).toEqual([]);
		expect(await searchDictionary('   ')).toEqual([]);
	});

	it('matches Chinese characters and multi-letter queries', async () => {
		const zhResults = await searchDictionary('你好');
		expect(zhResults.some((r) => r['Chinese Word'] === '你好')).toBe(true);

		const pyResults = await searchDictionary('nihao');
		expect(pyResults.some((r) => r['Chinese Word'] === '你好')).toBe(true);
	});
});
