import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRemoteUser, pullAndMerge, pushData, renameUser, subscribeSyncStatus } from './cloud';
import { setSavedUsername } from './storage';
import { MY_WORDS_DECK_ID, type AppBackup, type SyncStatus } from '@flash/shared';

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

describe('Lite App Cloud Sync Layer', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		Object.defineProperty(globalThis, 'localStorage', {
			value: new LocalStorageMock(),
			writable: true
		});
		setSavedUsername('alice');
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it('subscribes to sync status changes', () => {
		const statuses: SyncStatus[] = [];
		const unsub = subscribeSyncStatus((status) => {
			statuses.push(status);
		});
		expect(statuses.length).toBeGreaterThan(0);
		unsub();
	});

	it('checks remote user existence and extracts summary', async () => {
		globalThis.fetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes('/users/bob')) {
				const backup: AppBackup = {
					version: 1,
					username: 'bob',
					progress: {},
					customDecks: [
						{
							id: MY_WORDS_DECK_ID,
							name: 'My Words',
							words: [
								{ No: 1, 'Chinese Word': '你好', 'Part of Speech': 'n', 'English Meaning': 'hello' }
							]
						}
					]
				};
				return Promise.resolve(new Response(JSON.stringify(backup), { status: 200 }));
			}
			return Promise.resolve(new Response('Not found', { status: 404 }));
		});

		const resBob = await checkRemoteUser('bob');
		expect(resBob.exists).toBe(true);
		expect(resBob.wordCount).toBe(1);

		const resUnknown = await checkRemoteUser('unknown-user');
		expect(resUnknown.exists).toBe(false);
	});

	it('pushes local deck and progress to cloud', async () => {
		let putPayload: AppBackup | null = null;
		let usersListUpdated = false;

		globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
			if (init?.method === 'PUT' && url.includes('/users/alice')) {
				putPayload = JSON.parse(init.body as string);
				return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
			}
			if (url.endsWith('/users') && init?.method === 'PUT') {
				usersListUpdated = true;
				return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
			}
			if (url.endsWith('/users')) {
				return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
			}
			return Promise.resolve(new Response('Not found', { status: 404 }));
		});

		const success = await pushData('alice');
		expect(success).toBe(true);
		expect(putPayload).toBeDefined();
		const savedPayload = putPayload as AppBackup | null;
		expect(savedPayload?.username).toBe('alice');
		expect(usersListUpdated).toBe(true);
	});

	it('pullAndMerge pushes local data if remote user is 404', async () => {
		let pushCalled = false;

		globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
			if (init?.method === 'PUT') {
				pushCalled = true;
				return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
			}
			if (url.endsWith('/users')) {
				return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
			}
			return Promise.resolve(new Response('Not found', { status: 404 }));
		});

		const ok = await pullAndMerge('new-user');
		expect(ok).toBe(true);
		expect(pushCalled).toBe(true);
	});

	it('renames user and moves data with conflict detection', async () => {
		let deletedOld = false;
		let newPushed = false;

		globalThis.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
			if (url.includes('/users/existing-target') && !init?.method) {
				return Promise.resolve(
					new Response(JSON.stringify({ version: 1, customDecks: [] }), { status: 200 })
				);
			}
			if (init?.method === 'DELETE' && url.includes('/users/alice')) {
				deletedOld = true;
				return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
			}
			if (init?.method === 'PUT' && url.includes('/users/charlie')) {
				newPushed = true;
				return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
			}
			if (url.endsWith('/users')) {
				return Promise.resolve(new Response(JSON.stringify(['alice']), { status: 200 }));
			}
			return Promise.resolve(new Response('Not found', { status: 404 }));
		});

		// 1. Collision without confirmation returns collision: true
		const colRes = await renameUser('alice', 'existing-target', false);
		expect(colRes.success).toBe(false);
		expect(colRes.collision).toBe(true);

		// 2. Renaming to clean new name moves data
		const successRes = await renameUser('alice', 'charlie', false);
		expect(successRes.success).toBe(true);
		expect(newPushed).toBe(true);
		expect(deletedOld).toBe(true);
	});
});
