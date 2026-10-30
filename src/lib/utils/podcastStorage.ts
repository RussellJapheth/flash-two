/**
 * Podcast playback and completion persistence in localStorage.
 * Connects with central XP system (addXP).
 */
import type { PodcastProgress } from '$lib/types';
import { addXP } from './xp';

const PODCAST_STORAGE_KEY = 'flashcards_podcast_records';

export function getAllPodcastProgress(): Record<string, PodcastProgress> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return {};
	}
	try {
		const raw = localStorage.getItem(PODCAST_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return typeof parsed === 'object' && parsed !== null ? parsed : {};
	} catch (e) {
		console.error('Failed to read podcast progress:', e);
		return {};
	}
}

export function getPodcastProgress(episodeId: string): PodcastProgress | null {
	const all = getAllPodcastProgress();
	return all[episodeId] || null;
}

export function updatePodcastPlaybackPosition(
	episodeId: string,
	positionSec: number,
	listenedDurationSec?: number
): PodcastProgress {
	const all = getAllPodcastProgress();
	const existing = all[episodeId];

	const updated: PodcastProgress = {
		episodeId,
		completed: existing?.completed || false,
		lastPositionSec: Math.max(0, positionSec),
		listenedDurationSec:
			(existing?.listenedDurationSec || 0) +
			(listenedDurationSec && listenedDurationSec > 0 ? listenedDurationSec : 0),
		completedAt: existing?.completedAt
	};

	all[episodeId] = updated;

	if (typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(PODCAST_STORAGE_KEY, JSON.stringify(all));
		} catch (e) {
			console.error('Failed to save podcast playback position:', e);
		}
	}

	return updated;
}

export function savePodcastCompletion(
	episodeId: string,
	xpReward: number
): { progress: PodcastProgress; xpAwarded: number } {
	const all = getAllPodcastProgress();
	const existing = all[episodeId];

	const isFirstCompletion = !existing?.completed;
	// First completion awards full XP, replays award 50% (min 5 XP)
	const xpAwarded = isFirstCompletion ? xpReward : Math.max(5, Math.floor(xpReward * 0.5));
	addXP(xpAwarded);

	const progress: PodcastProgress = {
		episodeId,
		completed: true,
		lastPositionSec: 0,
		listenedDurationSec: existing?.listenedDurationSec || 0,
		completedAt: Date.now()
	};

	all[episodeId] = progress;

	if (typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(PODCAST_STORAGE_KEY, JSON.stringify(all));
		} catch (e) {
			console.error('Failed to save podcast completion:', e);
		}
	}

	return { progress, xpAwarded };
}
