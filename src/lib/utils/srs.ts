import type { WordProgress, StudyRating } from '$lib/types';

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.2;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;

export function calculateNextReview(
	current: WordProgress | undefined,
	rating: StudyRating,
	customDays?: number
): WordProgress {
	const now = Date.now();
	const base: WordProgress = current
		? { ...current }
		: {
				weekId: '',
				wordNo: 0,
				correct: 0,
				wrong: 0,
				lastReviewed: now,
				dueDate: now,
				interval: 0,
				easeFactor: DEFAULT_EASE_FACTOR,
				reps: 0,
				lapses: 0
			};

	let easeFactor = base.easeFactor ?? DEFAULT_EASE_FACTOR;
	let reps = base.reps ?? 0;
	let lapses = base.lapses ?? 0;
	let interval = base.interval ?? 0;
	let dueDate = now;

	if (rating === 'again') {
		base.wrong += 1;
		lapses += 1;
		reps = 0;
		interval = 0;
		easeFactor = Math.max(MIN_EASE_FACTOR, +(easeFactor - 0.2).toFixed(2));
		dueDate = now + TEN_MINUTES_MS;
	} else if (rating === 'hard') {
		base.correct += 1;
		reps += 1;
		interval = Math.max(1, Math.round((interval || 1) * 1.2));
		easeFactor = Math.max(MIN_EASE_FACTOR, +(easeFactor - 0.15).toFixed(2));
		dueDate = now + interval * ONE_DAY_MS;
	} else if (rating === 'good') {
		base.correct += 1;
		if (base.wrong > 0 && reps >= 1) {
			base.wrong = Math.max(0, base.wrong - 1);
		}
		if (reps === 0) {
			interval = 1;
		} else if (reps === 1) {
			interval = 3;
		} else {
			interval = Math.max(1, Math.round((interval || 1) * easeFactor));
		}
		reps += 1;
		dueDate = now + interval * ONE_DAY_MS;
	} else if (rating === 'easy') {
		base.correct += 1;
		if (base.wrong > 0) {
			base.wrong = Math.max(0, base.wrong - 1);
		}
		if (reps === 0) {
			interval = 3;
		} else {
			interval = Math.max(1, Math.round((interval || 1) * easeFactor * 1.3));
		}
		reps += 1;
		easeFactor = Math.min(MAX_EASE_FACTOR, +(easeFactor + 0.15).toFixed(2));
		dueDate = now + interval * ONE_DAY_MS;
	} else if (rating === 'custom' && customDays !== undefined && customDays > 0) {
		base.correct += 1;
		reps += 1;
		interval = customDays;
		dueDate = now + customDays * ONE_DAY_MS;
	}

	return {
		...base,
		lastReviewed: now,
		dueDate,
		interval,
		easeFactor,
		reps,
		lapses
	};
}

export function isCardDue(progress?: WordProgress): boolean {
	if (!progress || !progress.dueDate) return true;
	return progress.dueDate <= Date.now();
}

export function isCardMastered(progress?: WordProgress): boolean {
	if (!progress) return false;
	return (progress.reps ?? 0) >= 3 && (progress.interval ?? 0) >= 7;
}

export function isCardLearning(progress?: WordProgress): boolean {
	if (!progress) return false;
	return (progress.correct > 0 || progress.wrong > 0) && !isCardMastered(progress);
}

export function isCardStudied(progress?: WordProgress): boolean {
	if (!progress) return false;
	return (
		(progress.correct ?? 0) > 0 ||
		(progress.wrong ?? 0) > 0 ||
		(progress.reps ?? 0) > 0 ||
		Boolean(progress.lastReviewed)
	);
}

export function prioritizeAndShuffleCards<T extends { No: number }>(
	cards: T[],
	getCardProgressFn: (card: T) => WordProgress | undefined
): T[] {
	const unstudied: T[] = [];
	const studied: T[] = [];

	for (const card of cards) {
		const p = getCardProgressFn(card);
		if (isCardStudied(p)) {
			studied.push(card);
		} else {
			unstudied.push(card);
		}
	}

	for (let i = unstudied.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[unstudied[i], unstudied[j]] = [unstudied[j], unstudied[i]];
	}

	for (let i = studied.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[studied[i], studied[j]] = [studied[j], studied[i]];
	}

	return [...unstudied, ...studied];
}
