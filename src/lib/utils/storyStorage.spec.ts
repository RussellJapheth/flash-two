import { describe, it, expect, beforeEach } from 'vitest';
import { getAllStoryProgress, getStoryProgress, saveStoryCompletion } from './storyStorage';
import { getLocalUserXPData } from './xp';

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

describe('Story Progress & Storage Utilities', () => {
	beforeEach(() => {
		if (
			typeof globalThis.localStorage === 'undefined' ||
			!(globalThis.localStorage instanceof LocalStorageMock)
		) {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
		localStorage.clear();
	});

	it('returns empty progress when none exists', () => {
		const all = getAllStoryProgress();
		expect(all).toEqual({});
		expect(getStoryProgress('midnight-noodles')).toBeNull();
	});

	it('saves story completion, calculates stars and rewards XP', () => {
		const initialXP = getLocalUserXPData().totalXP;
		const record = saveStoryCompletion('midnight-noodles', 95, 3, 45);

		expect(record.storyId).toBe('midnight-noodles');
		expect(record.score).toBe(95);
		expect(record.stars).toBe(3);
		expect(record.timesPlayed).toBe(1);

		const updated = getStoryProgress('midnight-noodles');
		expect(updated).not.toBeNull();
		expect(updated?.stars).toBe(3);

		const newXP = getLocalUserXPData().totalXP;
		expect(newXP).toBeGreaterThan(initialXP);
		expect(newXP - initialXP).toBe(45);
	});

	it('does not increment XP if story is abandoned or incomplete', () => {
		const initialXP = getLocalUserXPData().totalXP;
		// Mid-story progress / interactions without saveStoryCompletion
		const progress = getStoryProgress('shanghai-milktea');
		expect(progress).toBeNull();
		expect(getLocalUserXPData().totalXP).toBe(initialXP);
	});
});

