import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
	LITE_MODE_KEY,
	getStoredLiteMode,
	isLiteModeEnabled,
	setLiteMode,
	resolveInitialLiteMode,
	isFullFeaturePath,
	liteModeStore,
	getEffectiveLanguage,
	filterLiteDecks,
	shouldIncludeInReview
} from './liteMode';
import { get } from 'svelte/store';

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

describe('liteMode', () => {
	beforeAll(() => {
		if (typeof globalThis.localStorage === 'undefined') {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
	});

	beforeEach(() => {
		localStorage.clear();
	});

	it('returns null when no preference is stored', () => {
		expect(getStoredLiteMode()).toBeNull();
		expect(isLiteModeEnabled()).toBe(true);
	});

	it('stores and retrieves lite mode preference', () => {
		setLiteMode(false);
		expect(getStoredLiteMode()).toBe(false);
		expect(isLiteModeEnabled()).toBe(false);
		expect(get(liteModeStore)).toBe(false);

		setLiteMode(true);
		expect(getStoredLiteMode()).toBe(true);
		expect(isLiteModeEnabled()).toBe(true);
		expect(get(liteModeStore)).toBe(true);
	});

	it('defaults new user to lite mode (true)', () => {
		const enabled = resolveInitialLiteMode(new URL('https://flash.app/'));
		expect(enabled).toBe(true);
		expect(localStorage.getItem(LITE_MODE_KEY)).toBe('true');
		expect(get(liteModeStore)).toBe(true);
	});

	it('disables lite mode for new user when ?lite=off is present in URL', () => {
		const enabled = resolveInitialLiteMode(new URL('https://flash.app/?lite=off'));
		expect(enabled).toBe(false);
		expect(localStorage.getItem(LITE_MODE_KEY)).toBe('false');
		expect(get(liteModeStore)).toBe(false);
	});

	it('handles alternative false representations: ?lite=false and ?lite=0', () => {
		resolveInitialLiteMode(new URL('https://flash.app/?lite=false'));
		expect(getStoredLiteMode()).toBe(false);

		localStorage.clear();
		resolveInitialLiteMode(new URL('https://flash.app/?lite=0'));
		expect(getStoredLiteMode()).toBe(false);
	});

	it('handles true representations: ?lite=on, ?lite=true, ?lite=1 on any URL', () => {
		setLiteMode(false);
		expect(getStoredLiteMode()).toBe(false);

		const enabledOn = resolveInitialLiteMode(new URL('https://flash.app/textbook?lite=on'));
		expect(enabledOn).toBe(true);
		expect(getStoredLiteMode()).toBe(true);

		setLiteMode(false);
		resolveInitialLiteMode(new URL('https://flash.app/games?lite=true'));
		expect(getStoredLiteMode()).toBe(true);

		setLiteMode(false);
		resolveInitialLiteMode(new URL('https://flash.app/decks?lite=1'));
		expect(getStoredLiteMode()).toBe(true);
	});

	it('overrides existing user preference when explicit ?lite=off arrives', () => {
		localStorage.setItem(LITE_MODE_KEY, 'true');
		const enabled = resolveInitialLiteMode(new URL('https://flash.app/settings?lite=off'));
		expect(enabled).toBe(false);
		expect(getStoredLiteMode()).toBe(false);
	});

	it('preserves existing user preference when no ?lite param is present in URL', () => {
		localStorage.setItem(LITE_MODE_KEY, 'false');
		const enabled = resolveInitialLiteMode(new URL('https://flash.app/decks'));
		expect(enabled).toBe(false);
		expect(getStoredLiteMode()).toBe(false);
	});

	it('identifies full-only feature routes correctly', () => {
		expect(isFullFeaturePath('/textbook')).toBe(true);
		expect(isFullFeaturePath('/textbook/lesson-1')).toBe(true);
		expect(isFullFeaturePath('/podcasts')).toBe(true);
		expect(isFullFeaturePath('/podcasts/ep-1')).toBe(true);
		expect(isFullFeaturePath('/games')).toBe(true);
		expect(isFullFeaturePath('/games/match-blitz')).toBe(true);
		expect(isFullFeaturePath('/notebook')).toBe(true);
		expect(isFullFeaturePath('/links')).toBe(true);
		expect(isFullFeaturePath('/saved')).toBe(true);
		expect(isFullFeaturePath('/practice')).toBe(true);
		expect(isFullFeaturePath('/practice/sentences/123')).toBe(true);
		expect(isFullFeaturePath('/story/panda')).toBe(true);
		expect(isFullFeaturePath('/guide/survival')).toBe(true);
		expect(isFullFeaturePath('/leaderboard')).toBe(true);

		expect(isFullFeaturePath('/decks')).toBe(false);
		expect(isFullFeaturePath('/deck/hsk1')).toBe(false);
		expect(isFullFeaturePath('/deck/hsk1/preview')).toBe(false);
		expect(isFullFeaturePath('/study/hsk1')).toBe(false);
		expect(isFullFeaturePath('/review')).toBe(false);
		expect(isFullFeaturePath('/settings')).toBe(false);
		expect(isFullFeaturePath('/')).toBe(false);
	});
});

describe('getEffectiveLanguage', () => {
	it('forces Chinese in Lite mode', () => {
		expect(getEffectiveLanguage(true, 'french')).toBe('chinese');
		expect(getEffectiveLanguage(true, 'chinese')).toBe('chinese');
	});

	it('keeps the saved language in full mode', () => {
		expect(getEffectiveLanguage(false, 'french')).toBe('french');
	});
});

describe('filterLiteDecks', () => {
	it('keeps only active Chinese decks and excludes My Words and Personal Dictionary', () => {
		const decks = [
			{ id: 'chinese-week1', language: 'chinese' as const, isArchived: false },
			{ id: 'french-week1', language: 'french' as const, isArchived: false },
			{ id: 'custom-old', language: 'chinese' as const, isArchived: true },
			{ id: 'custom-no-lang' },
			{ id: 'custom-my-words', language: 'chinese' as const },
			{ id: 'personal-dictionary', language: 'chinese' as const }
		];
		expect(filterLiteDecks(decks).map((d) => d.id)).toEqual(['chinese-week1', 'custom-no-lang']);
	});
});

describe('shouldIncludeInReview', () => {
	const now = Date.now();
	const dueReviewed = {
		weekId: 'hsk1',
		wordNo: 1,
		correct: 1,
		wrong: 0,
		lastReviewed: now - 10_000,
		dueDate: now - 1_000
	};
	const notDueReviewed = {
		weekId: 'hsk1',
		wordNo: 2,
		correct: 2,
		wrong: 0,
		lastReviewed: now,
		dueDate: now + 60_000
	};

	it('in Lite mode includes unreviewed and due cards from My Words', () => {
		expect(shouldIncludeInReview(true, 'custom-my-words', undefined)).toBe(true);
		expect(shouldIncludeInReview(true, 'custom-my-words', dueReviewed)).toBe(true);
		expect(shouldIncludeInReview(true, 'custom-my-words', notDueReviewed)).toBe(false);
	});

	it('in Lite mode excludes unreviewed cards from other decks', () => {
		expect(shouldIncludeInReview(true, 'hsk1', undefined)).toBe(false);
		expect(
			shouldIncludeInReview(true, 'hsk1', {
				weekId: 'hsk1',
				wordNo: 1,
				correct: 0,
				wrong: 0,
				lastReviewed: 0
			})
		).toBe(false);
	});

	it('in Lite mode includes already-reviewed due cards from other decks', () => {
		expect(shouldIncludeInReview(true, 'hsk1', dueReviewed)).toBe(true);
		expect(shouldIncludeInReview(true, 'hsk1', notDueReviewed)).toBe(false);
	});

	it('in full mode includes unreviewed cards from any deck', () => {
		expect(shouldIncludeInReview(false, 'hsk1', undefined)).toBe(true);
		expect(shouldIncludeInReview(false, 'hsk1', dueReviewed)).toBe(true);
		expect(shouldIncludeInReview(false, 'hsk1', notDueReviewed)).toBe(false);
	});
});
