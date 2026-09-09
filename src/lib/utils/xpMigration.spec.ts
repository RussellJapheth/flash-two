import { describe, it, expect, beforeEach, vi } from 'vitest';
import { migrateLocalXP, getLocalUserXPData, saveLocalUserXPData, CURRENT_XP_VERSION } from './xp';
import type { UserXPData } from '$lib/types';

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

describe('XP Versioned Migration', () => {
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
		vi.restoreAllMocks();
	});

	it('resets inflated v1 XP to 0 and bumps schema to v2 for existing local users', () => {
		// Mock existing v1 user with inflated XP
		const legacyV1: UserXPData = {
			totalXP: 2500,
			dailyXP: { '2026-09-08': 1500, '2026-09-09': 1000 },
			lastUpdated: Date.now() - 10000,
			migratedFromProgress: true
			// xpVersion missing (implicitly 1)
		};
		localStorage.setItem('flashcards_user_xp', JSON.stringify(legacyV1));

		const result = migrateLocalXP();

		expect(result.totalXP).toBe(0);
		expect(result.dailyXP).toEqual({});
		expect(result.xpVersion).toBe(CURRENT_XP_VERSION);

		// Verify persisted state in localStorage
		const saved = getLocalUserXPData();
		expect(saved.totalXP).toBe(0);
		expect(saved.xpVersion).toBe(CURRENT_XP_VERSION);
	});

	it('initializes clean v2 state for brand new users without triggering a reset', () => {
		// Empty localStorage (brand new user)
		const result = migrateLocalXP();

		expect(result.totalXP).toBe(0);
		expect(result.dailyXP).toEqual({});
		expect(result.xpVersion).toBe(CURRENT_XP_VERSION);

		const saved = getLocalUserXPData();
		expect(saved.totalXP).toBe(0);
		expect(saved.xpVersion).toBe(CURRENT_XP_VERSION);
	});

	it('preserves newly earned XP for users already on v3', () => {
		// User on v3 who earned legitimate XP
		const userV3: UserXPData = {
			totalXP: 85,
			dailyXP: { '2026-09-09': 85 },
			lastUpdated: Date.now(),
			migratedFromProgress: true,
			xpVersion: 3
		};
		saveLocalUserXPData(userV3);

		const result = migrateLocalXP();

		expect(result.totalXP).toBe(85);
		expect(result.dailyXP).toEqual({ '2026-09-09': 85 });
		expect(result.xpVersion).toBe(3);
	});

	it('handles multi-device cloud merge: local v3 takes precedence over remote legacy', async () => {
		// Local was migrated to v3 and earned 30 XP
		saveLocalUserXPData({
			totalXP: 30,
			dailyXP: { '2026-09-09': 30 },
			lastUpdated: Date.now(),
			xpVersion: 3
		});

		const originalFetch = globalThis.fetch;
		globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
			const urlStr = url.toString();
			if (init?.method === 'PUT') {
				return { ok: true, status: 200, json: async () => ({}) } as unknown as Response;
			}
			if (urlStr.includes('/users/alex')) {
				return {
					ok: true,
					status: 200,
					json: async () => ({
						version: 1,
						progress: {},
						username: 'alex',
						xpData: {
							totalXP: 4500, // Old unmigrated inflated XP
							dailyXP: { '2026-09-08': 4500 },
							xpVersion: 1
						}
					})
				} as unknown as Response;
			}
			return { ok: true, status: 200, json: async () => [] } as unknown as Response;
		}) as unknown as typeof fetch;

		try {
			const { pullAndMerge } = await import('./cloud');
			await pullAndMerge('alex');

			const updatedLocal = getLocalUserXPData();
			expect(updatedLocal.totalXP).toBe(30);
			expect(updatedLocal.xpVersion).toBe(3);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it('handles multi-device cloud merge: remote v3 takes precedence over local legacy', async () => {
		// Local has old v1 inflated XP
		saveLocalUserXPData({
			totalXP: 4000,
			dailyXP: { '2026-09-08': 4000 },
			lastUpdated: Date.now() - 100000,
			xpVersion: 1
		});

		const originalFetch = globalThis.fetch;
		globalThis.fetch = (async (url: RequestInfo | URL) => {
			const urlStr = url.toString();
			if (urlStr.includes('/users/alex')) {
				return {
					ok: true,
					status: 200,
					json: async () => ({
						version: 1,
						progress: {},
						username: 'alex',
						xpData: {
							totalXP: 45, // Migrated v3 XP from other device
							dailyXP: { '2026-09-09': 45 },
							xpVersion: 3
						}
					})
				} as unknown as Response;
			}
			return { ok: true, status: 200, json: async () => [] } as unknown as Response;
		}) as unknown as typeof fetch;

		try {
			const { pullAndMerge } = await import('./cloud');
			await pullAndMerge('alex');

			const updatedLocal = getLocalUserXPData();
			expect(updatedLocal.totalXP).toBe(45);
			expect(updatedLocal.xpVersion).toBe(3);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
