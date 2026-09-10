import { describe, it, expect } from 'vitest';
import {
	isChinesePack1to9Key,
	isChinesePack1to9Saved,
	filterOutPack1to9Progress,
	filterOutPack1to9Saved
} from './storage';
import type { WordProgress, SavedWord, WordRecord } from '$lib/types';

import pack1 from '../data/chinese/1.json';
import pack2 from '../data/chinese/2.json';
import pack3 from '../data/chinese/3.json';
import pack4 from '../data/chinese/4.json';
import pack5 from '../data/chinese/5.json';
import pack6 from '../data/chinese/6.json';
import pack7 from '../data/chinese/7.json';
import pack8 from '../data/chinese/8.json';
import pack9 from '../data/chinese/9.json';
import pack10 from '../data/chinese/10.json';
import pack11 from '../data/chinese/11.json';
import pack12 from '../data/chinese/12.json';
import pack13 from '../data/chinese/13.json';
import pack14 from '../data/chinese/14.json';
import pack15 from '../data/chinese/15.json';
import pack16 from '../data/chinese/16.json';
import pack17 from '../data/chinese/17.json';
import pack18 from '../data/chinese/18.json';
import pack19 from '../data/chinese/19.json';
import pack20 from '../data/chinese/20.json';

describe('Chinese Packs Content Validation', () => {
	const newPacks = [
		{ pack: pack1, name: '1.json', expectedMinWords: 25 },
		{ pack: pack2, name: '2.json', expectedMinWords: 25 },
		{ pack: pack3, name: '3.json', expectedMinWords: 25 },
		{ pack: pack4, name: '4.json', expectedMinWords: 25 },
		{ pack: pack5, name: '5.json', expectedMinWords: 25 },
		{ pack: pack6, name: '6.json', expectedMinWords: 25 },
		{ pack: pack7, name: '7.json', expectedMinWords: 25 },
		{ pack: pack8, name: '8.json', expectedMinWords: 25 },
		{ pack: pack9, name: '9.json', expectedMinWords: 25 },
		{ pack: pack11, name: '11.json', expectedMinWords: 25 },
		{ pack: pack12, name: '12.json', expectedMinWords: 25 },
		{ pack: pack13, name: '13.json', expectedMinWords: 25 },
		{ pack: pack14, name: '14.json', expectedMinWords: 25 },
		{ pack: pack15, name: '15.json', expectedMinWords: 25 },
		{ pack: pack16, name: '16.json', expectedMinWords: 25 },
		{ pack: pack17, name: '17.json', expectedMinWords: 25 },
		{ pack: pack18, name: '18.json', expectedMinWords: 25 },
		{ pack: pack19, name: '19.json', expectedMinWords: 25 },
		{ pack: pack20, name: '20.json', expectedMinWords: 25 }
	];

	for (const { pack, name, expectedMinWords } of newPacks) {
		it(`validates ${name} has title and structured word records`, () => {
			expect(pack.title).toBeTypeOf('string');
			expect(pack.title.trim().length).toBeGreaterThan(0);
			expect(pack.words.length).toBeGreaterThanOrEqual(expectedMinWords);

			pack.words.forEach((word: WordRecord, idx: number) => {
				expect(word.No).toBe(idx + 1);
				expect(word['Chinese Word']).toBeTypeOf('string');
				expect(word['Chinese Word']?.trim().length).toBeGreaterThan(0);
				expect(word.Pinyin).toBeTypeOf('string');
				expect(word.Pinyin?.trim().length).toBeGreaterThan(0);
				expect(word['Part of Speech']).toBeTypeOf('string');
				expect(word['Part of Speech']?.trim().length).toBeGreaterThan(0);
				expect(word['English Meaning']).toBeTypeOf('string');
				expect(word['English Meaning']?.trim().length).toBeGreaterThan(0);
				expect(word['Example (Chinese + Pinyin)']).toBeTypeOf('string');
				expect(word['Example (Chinese + Pinyin)']?.trim().length).toBeGreaterThan(0);
			});
		});
	}

	it('strictly preserves Pack 10 (Books of the Bible) with 66 books intact', () => {
		expect(pack10.title).toBe('Books of the Bible');
		expect(pack10.words).toHaveLength(66);
		expect(pack10.words[0]['Chinese Word']).toBe('创世记');
		expect(pack10.words[65]['Chinese Word']).toBe('启示录');
	});
});

describe('Chinese Packs Migration Logic', () => {
	it('identifies Chinese pack 1-9 progress keys while protecting Pack 10 and other languages', () => {
		// Keys for packs 1-9 (should match)
		expect(isChinesePack1to9Key('chinese-1:1')).toBe(true);
		expect(isChinesePack1to9Key('chinese-2:15')).toBe(true);
		expect(isChinesePack1to9Key('chinese-9:25')).toBe(true);
		expect(isChinesePack1to9Key('week-1:4')).toBe(true);
		expect(isChinesePack1to9Key('pack-5:12')).toBe(true);
		expect(isChinesePack1to9Key('7:3')).toBe(true);

		// Keys for Pack 10 and others (must NOT match)
		expect(isChinesePack1to9Key('chinese-10:1')).toBe(false);
		expect(isChinesePack1to9Key('chinese-10:66')).toBe(false);
		expect(isChinesePack1to9Key('week-10:5')).toBe(false);
		expect(isChinesePack1to9Key('pack-10:8')).toBe(false);
		expect(isChinesePack1to9Key('10:1')).toBe(false);
		expect(isChinesePack1to9Key('french-1:1')).toBe(false);
		expect(isChinesePack1to9Key('custom-deck-1:2')).toBe(false);
	});

	it('identifies Chinese pack 1-9 saved weekIds while protecting Pack 10 and other languages', () => {
		expect(isChinesePack1to9Saved('chinese-1')).toBe(true);
		expect(isChinesePack1to9Saved('chinese-9')).toBe(true);
		expect(isChinesePack1to9Saved('week-3')).toBe(true);
		expect(isChinesePack1to9Saved('pack-6')).toBe(true);
		expect(isChinesePack1to9Saved('4')).toBe(true);

		expect(isChinesePack1to9Saved('chinese-10')).toBe(false);
		expect(isChinesePack1to9Saved('week-10')).toBe(false);
		expect(isChinesePack1to9Saved('10')).toBe(false);
		expect(isChinesePack1to9Saved('french-1')).toBe(false);
		expect(isChinesePack1to9Saved('custom-deck-1')).toBe(false);
	});

	it('filters out only pack 1-9 progress in memory', () => {
		const sampleProgress: Record<string, WordProgress> = {
			'chinese-1:1': {
				weekId: 'chinese-1',
				wordNo: 1,
				correct: 3,
				wrong: 0,
				lastReviewed: 1000
			},
			'chinese-5:2': {
				weekId: 'chinese-5',
				wordNo: 2,
				correct: 1,
				wrong: 1,
				lastReviewed: 1100
			},
			'chinese-10:1': {
				weekId: 'chinese-10',
				wordNo: 1,
				correct: 5,
				wrong: 0,
				lastReviewed: 1200
			},
			'french-1:1': {
				weekId: 'french-1',
				wordNo: 1,
				correct: 4,
				wrong: 0,
				lastReviewed: 1300
			}
		};

		const filtered = filterOutPack1to9Progress(sampleProgress);
		expect(Object.keys(filtered)).toEqual(['chinese-10:1', 'french-1:1']);
		expect(filtered['chinese-10:1'].correct).toBe(5);
		expect(filtered['french-1:1'].correct).toBe(4);
	});

	it('filters out only pack 1-9 saved words in memory', () => {
		const sampleSaved: SavedWord[] = [
			{ weekId: 'chinese-1', wordNo: 1, savedAt: 100 },
			{ weekId: 'chinese-9', wordNo: 10, savedAt: 200 },
			{ weekId: 'chinese-10', wordNo: 1, savedAt: 300 },
			{ weekId: 'french-1', wordNo: 3, savedAt: 400 }
		];

		const filtered = filterOutPack1to9Saved(sampleSaved);
		expect(filtered).toHaveLength(2);
		expect(filtered.map((s) => s.weekId)).toEqual(['chinese-10', 'french-1']);
	});
});
