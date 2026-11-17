import { pinyin } from 'pinyin-pro';

/**
 * Generates accurate tone-marked Pinyin for Chinese text using pinyin-pro.
 */
export function generatePinyin(chineseText: string): string {
	if (!chineseText || !chineseText.trim()) return '';
	try {
		return pinyin(chineseText.trim(), { toneType: 'symbol' });
	} catch {
		return '';
	}
}
