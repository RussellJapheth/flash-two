import { describe, it, expect, beforeEach } from 'vitest';
import { getArchivedDeckIds, setDeckArchived, isDeckArchived } from './storage';

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

describe('Deck Archiving Storage', () => {
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

	it('returns empty list when no decks are archived', () => {
		expect(getArchivedDeckIds()).toEqual([]);
		expect(isDeckArchived('chinese-1')).toBe(false);
	});

	it('archives a deck and retrieves it', () => {
		setDeckArchived('chinese-3', true);
		expect(isDeckArchived('chinese-3')).toBe(true);
		expect(getArchivedDeckIds()).toContain('chinese-3');
	});

	it('unarchives a deck correctly', () => {
		setDeckArchived('chinese-5', true);
		expect(isDeckArchived('chinese-5')).toBe(true);

		setDeckArchived('chinese-5', false);
		expect(isDeckArchived('chinese-5')).toBe(false);
		expect(getArchivedDeckIds()).not.toContain('chinese-5');
	});

	it('handles multiple archived decks without duplicates', () => {
		setDeckArchived('chinese-1', true);
		setDeckArchived('chinese-2', true);
		setDeckArchived('chinese-1', true);

		const archived = getArchivedDeckIds();
		expect(archived).toHaveLength(2);
		expect(archived).toContain('chinese-1');
		expect(archived).toContain('chinese-2');
	});
});
