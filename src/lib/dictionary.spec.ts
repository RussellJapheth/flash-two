import { describe, it, expect } from 'vitest';
import { normalizePinyin, normalizeChinese, formatPinyin } from '$lib/utils/dictionary';

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
});
