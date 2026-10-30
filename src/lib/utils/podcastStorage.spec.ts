import { describe, it, expect, beforeEach } from 'vitest';
import {
	getAllPodcastProgress,
	getPodcastProgress,
	updatePodcastPlaybackPosition,
	savePodcastCompletion
} from './podcastStorage';
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

describe('Podcast Storage & Progress Utilities', () => {
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
		const all = getAllPodcastProgress();
		expect(all).toEqual({});
		expect(getPodcastProgress('morning-coffee')).toBeNull();
	});

	it('updates playback position smoothly', () => {
		const updated = updatePodcastPlaybackPosition('morning-coffee', 42.5, 10);
		expect(updated.episodeId).toBe('morning-coffee');
		expect(updated.lastPositionSec).toBe(42.5);
		expect(updated.listenedDurationSec).toBe(10);
		expect(updated.completed).toBe(false);

		const fetched = getPodcastProgress('morning-coffee');
		expect(fetched?.lastPositionSec).toBe(42.5);
	});

	it('saves completion and awards XP', () => {
		const initialXP = getLocalUserXPData().totalXP;
		const { progress, xpAwarded } = savePodcastCompletion('morning-coffee', 20);

		expect(progress.completed).toBe(true);
		expect(progress.lastPositionSec).toBe(0);
		expect(xpAwarded).toBe(20);

		const newXP = getLocalUserXPData().totalXP;
		expect(newXP - initialXP).toBe(20);

		// Replay completion awards 50%
		const replayResult = savePodcastCompletion('morning-coffee', 20);
		expect(replayResult.xpAwarded).toBe(10);
		expect(getLocalUserXPData().totalXP - initialXP).toBe(30);
	});
});
