import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { isDebugModeEnabled, setDebugModeEnabled, DEBUG_MODE_KEY } from './storage';

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

describe('Debug Mode Setting (Local-only, Off by default)', () => {
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

	it('defaults to false (off) when key is unset', () => {
		expect(localStorage.getItem(DEBUG_MODE_KEY)).toBeNull();
		expect(isDebugModeEnabled()).toBe(false);
	});

	it('enables and disables debug mode in localStorage', () => {
		setDebugModeEnabled(true);
		expect(localStorage.getItem(DEBUG_MODE_KEY)).toBe('true');
		expect(isDebugModeEnabled()).toBe(true);

		setDebugModeEnabled(false);
		expect(localStorage.getItem(DEBUG_MODE_KEY)).toBe('false');
		expect(isDebugModeEnabled()).toBe(false);
	});
});
