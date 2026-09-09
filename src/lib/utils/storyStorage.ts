import type { StoryCompletionRecord } from '$lib/types';
import { addXP } from './xp';

const STORY_STORAGE_KEY = 'flashcards_story_records';

/**
 * Gets all saved story completion records from localStorage
 */
export function getAllStoryProgress(): Record<string, StoryCompletionRecord> {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return {};
	}
	try {
		const raw = localStorage.getItem(STORY_STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return typeof parsed === 'object' && parsed !== null ? parsed : {};
	} catch (e) {
		console.error('Failed to read story progress:', e);
		return {};
	}
}

/**
 * Gets progress record for a single story
 */
export function getStoryProgress(storyId: string): StoryCompletionRecord | null {
	const all = getAllStoryProgress();
	return all[storyId] || null;
}

/**
 * Saves a completed story attempt, calculates/awards XP, and persists record
 */
export function saveStoryCompletion(
	storyId: string,
	score: number,
	stars: number,
	xpReward: number
): StoryCompletionRecord {
	const all = getAllStoryProgress();
	const existing = all[storyId];

	const timesPlayed = (existing?.timesPlayed || 0) + 1;
	const bestScore = existing ? Math.max(existing.score, score) : score;
	const bestStars = existing ? Math.max(existing.stars, stars) : stars;

	// Award XP (First time full XP, replay gives 50% XP for practice)
	const actualXP = timesPlayed === 1 ? xpReward : Math.max(5, Math.floor(xpReward * 0.5));
	addXP(actualXP);

	const record: StoryCompletionRecord = {
		storyId,
		completedAt: Date.now(),
		score: bestScore,
		stars: bestStars,
		timesPlayed,
		xpEarned: actualXP
	};

	all[storyId] = record;

	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(all));
		} catch (e) {
			console.error('Failed to save story progress:', e);
		}
	}

	return record;
}
