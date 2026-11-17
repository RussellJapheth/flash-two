import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
	TEXTBOOK_PARTS,
	ALL_TEXTBOOK_UNITS,
	getAllTextbookCourseUnits,
	getTextbookUnitById,
	getTextbookUnitsByPart,
	getAdjacentTextbookUnits,
	searchAllTextbookUnits
} from '$lib/data/textbook';
import {
	getCompletedTextbookUnits,
	isTextbookUnitCompleted,
	markTextbookUnitCompleted,
	getTextbookStats
} from '$lib/utils/textbookStorage';
import { getLocalUserXPData } from '$lib/utils/xp';

class LocalStorageMock {
	private store: Record<string, string> = {};
	getItem(key: string): string | null {
		return this.store[key] ?? null;
	}
	setItem(key: string, value: string): void {
		this.store[key] = String(value);
	}
	removeItem(key: string): void {
		delete this.store[key];
	}
	clear(): void {
		this.store = {};
	}
}

describe('Mandarin Textbook 36-Unit Curriculum', () => {
	beforeAll(() => {
		if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
	});

	beforeEach(() => {
		localStorage.clear();
	});

	it('contains all 6 parts structured logically from Zero to Fluency', () => {
		expect(TEXTBOOK_PARTS.length).toBe(6);
		expect(TEXTBOOK_PARTS.map((p) => p.partNumber)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('contains exactly 36 complete units in sequential order', () => {
		const units = getAllTextbookCourseUnits();
		expect(units.length).toBe(36);
		expect(ALL_TEXTBOOK_UNITS.length).toBe(36);

		for (let i = 0; i < 36; i++) {
			const expectedNum = i + 1;
			const expectedId = `unit-${String(expectedNum).padStart(2, '0')}`;
			const unit = units[i];

			expect(unit.unitNumber).toBe(expectedNum);
			expect(unit.id).toBe(expectedId);
			expect(unit.chineseTitle.length).toBeGreaterThan(0);
			expect(unit.title.length).toBeGreaterThan(0);
			expect(unit.subtitle.length).toBeGreaterThan(0);
			expect(unit.milestoneGoal.length).toBeGreaterThan(10);
			expect(unit.estimatedMinutes).toBeGreaterThanOrEqual(10);
			expect(unit.characterHost.name.length).toBeGreaterThan(0);
			expect(unit.characterHost.avatarEmoji.length).toBeGreaterThan(0);
			expect(unit.characterHost.intro.length).toBeGreaterThan(10);

			// Dialogue verification
			expect(unit.dialogue.length).toBeGreaterThanOrEqual(3);
			for (const turn of unit.dialogue) {
				expect(turn.speaker.length).toBeGreaterThan(0);
				expect(turn.hanzi.length).toBeGreaterThan(0);
				expect(turn.pinyin.length).toBeGreaterThan(0);
				expect(turn.english.length).toBeGreaterThan(0);
			}

			// Spotlight vocabulary verification
			expect(unit.spotlightWords.length).toBeGreaterThanOrEqual(3);
			for (const word of unit.spotlightWords) {
				expect(word.hanzi.length).toBeGreaterThan(0);
				expect(word.pinyin.length).toBeGreaterThan(0);
				expect(word.english.length).toBeGreaterThan(0);
				expect(word.mnemonic.length).toBeGreaterThan(0);
			}

			// Grammar Pattern box
			expect(unit.patternBox.formula.length).toBeGreaterThan(0);
			expect(unit.patternBox.slots.length).toBeGreaterThanOrEqual(2);
			expect(unit.patternBox.notes.length).toBeGreaterThan(0);

			// Pragmatics
			expect(unit.pragmaticTip.title.length).toBeGreaterThan(0);
			expect(unit.pragmaticTip.tip.length).toBeGreaterThan(0);
			expect(unit.pragmaticTip.naturalExample.hanzi.length).toBeGreaterThan(0);

			// Mini-checks verification
			expect(unit.miniCheck.comprehension.question.length).toBeGreaterThan(0);
			expect(unit.miniCheck.comprehension.options.length).toBe(4);
			expect(unit.miniCheck.comprehension.correctIndex).toBeGreaterThanOrEqual(0);
			expect(unit.miniCheck.comprehension.correctIndex).toBeLessThan(4);

			expect(unit.miniCheck.wordReorder.sentenceHanzi.length).toBeGreaterThan(0);
			expect(unit.miniCheck.wordReorder.shuffledWords.length).toBeGreaterThanOrEqual(2);
		}
	});

	it('retrieves units by ID, number, and part accurately', () => {
		const u1 = getTextbookUnitById('unit-01');
		expect(u1).toBeDefined();
		expect(u1?.chineseTitle).toBe('发现汉语');
		expect(u1?.unitNumber).toBe(1);

		const u36 = getTextbookUnitById('36');
		expect(u36).toBeDefined();
		expect(u36?.chineseTitle).toBe('自主精进');
		expect(u36?.unitNumber).toBe(36);

		const part1Units = getTextbookUnitsByPart(1);
		expect(part1Units.length).toBe(4);

		const part6Units = getTextbookUnitsByPart(6);
		expect(part6Units.length).toBe(8);
	});

	it('handles adjacent navigation at boundaries and mid-course', () => {
		const first = getAdjacentTextbookUnits('unit-01');
		expect(first.prev).toBeUndefined();
		expect(first.next?.unitNumber).toBe(2);

		const middle = getAdjacentTextbookUnits('unit-18');
		expect(middle.prev?.unitNumber).toBe(17);
		expect(middle.next?.unitNumber).toBe(19);

		const last = getAdjacentTextbookUnits('unit-36');
		expect(last.prev?.unitNumber).toBe(35);
		expect(last.next).toBeUndefined();
	});

	it('searches across units by Chinese, English, Pinyin, or grammar', () => {
		const hanziSearch = searchAllTextbookUnits('双刃剑');
		expect(hanziSearch.length).toBeGreaterThanOrEqual(1);
		expect(hanziSearch.some((u) => u.unitNumber === 30)).toBe(true);

		const pinyinSearch = searchAllTextbookUnits('duōshao qián');
		expect(pinyinSearch.length).toBeGreaterThanOrEqual(1);

		const englishSearch = searchAllTextbookUnits('reunion');
		expect(englishSearch.length).toBeGreaterThanOrEqual(1);
	});

	it('tracks unit completions and awards XP idempotently', () => {
		expect(getCompletedTextbookUnits()).toEqual([]);
		expect(isTextbookUnitCompleted('unit-01')).toBe(false);

		const xpBefore = getLocalUserXPData().totalXP;
		const res1 = markTextbookUnitCompleted('unit-01');

		expect(res1.justCompleted).toBe(true);
		expect(res1.xpAwarded).toBe(15);
		expect(isTextbookUnitCompleted('unit-01')).toBe(true);
		expect(getCompletedTextbookUnits()).toContain('unit-01');

		const xpAfter = getLocalUserXPData().totalXP;
		expect(xpAfter - xpBefore).toBe(15);

		// Second completion should be idempotent
		const res2 = markTextbookUnitCompleted('unit-01');
		expect(res2.justCompleted).toBe(false);
		expect(res2.xpAwarded).toBe(0);
		expect(getLocalUserXPData().totalXP).toBe(xpAfter);

		// Stats
		const stats = getTextbookStats();
		expect(stats.totalUnits).toBe(36);
		expect(stats.completedCount).toBe(1);
		expect(stats.percentage).toBe(3); // 1/36 = ~3%
		expect(stats.totalEarnedXP).toBe(15);
	});
});
