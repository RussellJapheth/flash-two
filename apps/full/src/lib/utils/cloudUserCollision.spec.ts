import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRemoteUser } from './cloud';

describe('checkRemoteUser', () => {
	const originalFetch = globalThis.fetch;
	const originalNavigator = globalThis.navigator;

	beforeEach(() => {
		// Mock window and navigator.onLine for node test environment
		(globalThis as unknown as { window: Window }).window = globalThis as unknown as Window;
		Object.defineProperty(globalThis, 'navigator', {
			value: { onLine: true },
			configurable: true,
			writable: true
		});
	});

	afterEach(() => {
		delete (globalThis as unknown as { window?: Window }).window;
		globalThis.fetch = originalFetch;
		Object.defineProperty(globalThis, 'navigator', {
			value: originalNavigator,
			configurable: true,
			writable: true
		});
	});

	it('returns exists: false when user returns 404', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			status: 404,
			ok: false
		});

		const result = await checkRemoteUser('new-learner-99');
		expect(result.exists).toBe(false);
	});

	it('returns exists: true with stats when remote account has XP and review records', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			json: async () => ({
				progress: {
					'chinese:week1:1': { reps: 3 },
					'chinese:week1:2': { reps: 2 }
				},
				xpData: { totalXP: 350 },
				customDecks: [{ id: 'deck-1', name: 'My Deck', words: [] }]
			})
		});

		const result = await checkRemoteUser('existing-user');
		expect(result.exists).toBe(true);
		expect(result.totalXP).toBe(350);
		expect(result.reviewCount).toBe(2);
		expect(result.deckCount).toBe(1);
	});

	it('returns exists: false when remote payload has zero data', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			status: 200,
			ok: true,
			json: async () => ({
				progress: {},
				xpData: { totalXP: 0 },
				customDecks: []
			})
		});

		const result = await checkRemoteUser('empty-user');
		expect(result.exists).toBe(false);
	});

	it('returns exists: false gracefully on network failure', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

		const result = await checkRemoteUser('offline-user');
		expect(result.exists).toBe(false);
	});
});
