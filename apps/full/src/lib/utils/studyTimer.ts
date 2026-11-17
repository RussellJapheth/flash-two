import type { ActiveStudyTimerState, StudyTimeData, StudyTimerStatus } from '$lib/types';
import { isAutoStartTimerEnabled } from '$lib/utils/storage';

export const FLASHCARDS_STUDY_TIME_KEY = 'flashcards_study_time_data';
export const FLASHCARDS_ACTIVE_TIMER_KEY = 'flashcards_active_study_timer';

const DEFAULT_TIMER_STATE: ActiveStudyTimerState = {
	status: 'idle',
	elapsedSeconds: 0,
	sessionStartedAt: 0,
	lastActiveTimestamp: 0
};

const DEFAULT_STUDY_TIME_DATA: StudyTimeData = {
	totalSeconds: 0,
	dailySeconds: {},
	sessionsCount: 0
};

let currentState: ActiveStudyTimerState = { ...DEFAULT_TIMER_STATE };
let listeners: Array<(state: ActiveStudyTimerState) => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

function getTodayISO(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Retrieves all-time and daily study time data from localStorage.
 */
export function getStudyTimeData(): StudyTimeData {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return { ...DEFAULT_STUDY_TIME_DATA };
	}
	try {
		const raw = localStorage.getItem(FLASHCARDS_STUDY_TIME_KEY);
		if (!raw) return { ...DEFAULT_STUDY_TIME_DATA };
		const parsed = JSON.parse(raw);
		return {
			totalSeconds: typeof parsed.totalSeconds === 'number' ? Math.max(0, parsed.totalSeconds) : 0,
			dailySeconds:
				typeof parsed.dailySeconds === 'object' && parsed.dailySeconds !== null
					? parsed.dailySeconds
					: {},
			sessionsCount:
				typeof parsed.sessionsCount === 'number' ? Math.max(0, parsed.sessionsCount) : 0,
			lastSessionDate:
				typeof parsed.lastSessionDate === 'string' ? parsed.lastSessionDate : undefined
		};
	} catch {
		return { ...DEFAULT_STUDY_TIME_DATA };
	}
}

/**
 * Persists updated study time data to localStorage.
 */
export function saveStudyTimeData(data: StudyTimeData): void {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(FLASHCARDS_STUDY_TIME_KEY, JSON.stringify(data));
	} catch (e) {
		console.error('Failed to save study time data:', e);
	}
}

/**
 * Records a completed session into cumulative study statistics.
 */
export function recordStudySession(seconds: number): StudyTimeData {
	if (seconds <= 0) return getStudyTimeData();
	const current = getStudyTimeData();
	const today = getTodayISO();
	const todaySeconds = (current.dailySeconds[today] || 0) + seconds;

	const updated: StudyTimeData = {
		totalSeconds: current.totalSeconds + seconds,
		dailySeconds: {
			...current.dailySeconds,
			[today]: todaySeconds
		},
		sessionsCount: current.sessionsCount + 1,
		lastSessionDate: today
	};

	saveStudyTimeData(updated);
	return updated;
}

/**
 * Loads the active timer state from localStorage.
 */
export function loadActiveTimerState(): ActiveStudyTimerState {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return { ...DEFAULT_TIMER_STATE };
	}
	try {
		const raw = localStorage.getItem(FLASHCARDS_ACTIVE_TIMER_KEY);
		if (!raw) return { ...DEFAULT_TIMER_STATE };
		const parsed = JSON.parse(raw);
		const status: StudyTimerStatus =
			parsed.status === 'running' || parsed.status === 'paused' ? parsed.status : 'idle';
		return {
			status,
			elapsedSeconds:
				typeof parsed.elapsedSeconds === 'number' ? Math.max(0, parsed.elapsedSeconds) : 0,
			sessionStartedAt: typeof parsed.sessionStartedAt === 'number' ? parsed.sessionStartedAt : 0,
			lastActiveTimestamp:
				typeof parsed.lastActiveTimestamp === 'number' ? parsed.lastActiveTimestamp : 0
		};
	} catch {
		return { ...DEFAULT_TIMER_STATE };
	}
}

/**
 * Saves current in-memory active timer state to localStorage.
 */
export function saveActiveTimerState(state: ActiveStudyTimerState): void {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(FLASHCARDS_ACTIVE_TIMER_KEY, JSON.stringify(state));
	} catch (e) {
		console.error('Failed to save active study timer:', e);
	}
}

function notifySubscribers(): void {
	const frozen = { ...currentState };
	for (const cb of listeners) {
		try {
			cb(frozen);
		} catch (e) {
			console.error('Error in study timer subscriber:', e);
		}
	}
}

function stopTicking(): void {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

function isPageActiveAndVisible(): boolean {
	if (typeof document === 'undefined') return true;
	return document.visibilityState !== 'hidden';
}

function startTicking(): void {
	stopTicking();

	intervalId = setInterval(() => {
		if (currentState.status !== 'running') {
			stopTicking();
			return;
		}

		if (!isPageActiveAndVisible()) {
			// Tab is not visible; freeze accumulation until user returns
			return;
		}

		const now = Date.now();
		if (currentState.lastActiveTimestamp > 0) {
			const deltaMs = now - currentState.lastActiveTimestamp;
			if (deltaMs >= 1000) {
				// Cap step increment to 2s to prevent runaway accumulation if tab was background-throttled
				const addSecs = Math.min(Math.floor(deltaMs / 1000), 2);
				currentState.elapsedSeconds += addSecs;
				currentState.lastActiveTimestamp = now;
				saveActiveTimerState(currentState);
				notifySubscribers();
			}
		} else {
			currentState.lastActiveTimestamp = now;
			saveActiveTimerState(currentState);
		}
	}, 1000);
}

/**
 * Initializes listeners for page visibility and refresh lifecycle.
 * Automatically called when timer functions are accessed.
 */
export function initStudyTimer(): void {
	if (isInitialized) {
		return;
	}
	isInitialized = true;

	// Hydrate from localStorage
	currentState = loadActiveTimerState();

	// If page was refreshed during an active session, resume if currently visible
	if (currentState.status === 'running') {
		if (isPageActiveAndVisible()) {
			currentState.lastActiveTimestamp = Date.now();
			saveActiveTimerState(currentState);
			startTicking();
		} else {
			currentState.lastActiveTimestamp = 0;
			saveActiveTimerState(currentState);
		}
	}

	// Handle visibility changes: pause accumulation when hidden, resume when returning
	if (typeof document !== 'undefined') {
		document.addEventListener('visibilitychange', () => {
			if (currentState.status !== 'running') return;

			if (document.visibilityState === 'hidden') {
				// Flush any pending seconds up to now
				const now = Date.now();
				if (currentState.lastActiveTimestamp > 0) {
					const deltaMs = now - currentState.lastActiveTimestamp;
					if (deltaMs >= 1000) {
						currentState.elapsedSeconds += Math.min(Math.floor(deltaMs / 1000), 2);
					}
				}
				currentState.lastActiveTimestamp = 0;
				saveActiveTimerState(currentState);
				notifySubscribers();
			} else if (document.visibilityState === 'visible') {
				// Resumed viewing
				currentState.lastActiveTimestamp = Date.now();
				saveActiveTimerState(currentState);
				startTicking();
				notifySubscribers();
			}
		});
	}

	// Save latest state immediately before reload or navigate away
	if (typeof window !== 'undefined') {
		window.addEventListener('beforeunload', () => {
			if (currentState.status === 'running' && currentState.lastActiveTimestamp > 0) {
				const now = Date.now();
				const deltaMs = now - currentState.lastActiveTimestamp;
				if (deltaMs >= 1000) {
					currentState.elapsedSeconds += Math.min(Math.floor(deltaMs / 1000), 2);
				}
				currentState.lastActiveTimestamp = 0;
				saveActiveTimerState(currentState);
			}
		});
	}
}

/**
 * Returns a snapshot of the current active study timer.
 */
export function getActiveSession(): ActiveStudyTimerState {
	if (!isInitialized) {
		initStudyTimer();
	}
	return { ...currentState };
}

/**
 * Starts a new study timer session, or resumes if currently paused.
 */
export function startStudyTimer(): ActiveStudyTimerState {
	if (!isInitialized) {
		initStudyTimer();
	}

	const now = Date.now();
	if (currentState.status === 'idle') {
		currentState = {
			status: 'running',
			elapsedSeconds: 0,
			sessionStartedAt: now,
			lastActiveTimestamp: now
		};
	} else if (currentState.status === 'paused') {
		currentState.status = 'running';
		currentState.lastActiveTimestamp = now;
	}

	saveActiveTimerState(currentState);
	startTicking();
	notifySubscribers();
	return { ...currentState };
}

/**
 * Pauses the study session timer.
 */
export function pauseStudyTimer(): ActiveStudyTimerState {
	if (!isInitialized) {
		initStudyTimer();
	}

	if (currentState.status === 'running') {
		const now = Date.now();
		if (currentState.lastActiveTimestamp > 0) {
			const deltaMs = now - currentState.lastActiveTimestamp;
			if (deltaMs >= 1000) {
				currentState.elapsedSeconds += Math.min(Math.floor(deltaMs / 1000), 2);
			}
		}
		currentState.status = 'paused';
		currentState.lastActiveTimestamp = 0;
		stopTicking();
		saveActiveTimerState(currentState);
		notifySubscribers();
	}

	return { ...currentState };
}

/**
 * Resumes a paused study session timer.
 */
export function resumeStudyTimer(): ActiveStudyTimerState {
	return startStudyTimer();
}

/**
 * Stops the study session timer, records the elapsed time to all-time stats, and resets to idle.
 * Returns the recorded elapsed seconds.
 */
export function stopStudyTimer(): number {
	if (!isInitialized) {
		initStudyTimer();
	}

	if (currentState.status === 'idle') {
		return 0;
	}

	if (currentState.status === 'running' && currentState.lastActiveTimestamp > 0) {
		const now = Date.now();
		const deltaMs = now - currentState.lastActiveTimestamp;
		if (deltaMs >= 1000) {
			currentState.elapsedSeconds += Math.min(Math.floor(deltaMs / 1000), 2);
		}
	}

	stopTicking();
	const recordedSeconds = currentState.elapsedSeconds;
	if (recordedSeconds > 0) {
		recordStudySession(recordedSeconds);
	}

	currentState = { ...DEFAULT_TIMER_STATE };
	saveActiveTimerState(currentState);
	notifySubscribers();

	return recordedSeconds;
}

/**
 * Resets the active study timer without recording elapsed time.
 */
export function resetStudyTimer(): void {
	stopTicking();
	currentState = { ...DEFAULT_TIMER_STATE };
	saveActiveTimerState(currentState);
	notifySubscribers();
}

/**
 * Re-reads active timer state from storage and re-evaluates ticking.
 * Used during page reload/hydration or multi-tab sync.
 */
export function reloadStudyTimerFromStorage(): ActiveStudyTimerState {
	stopTicking();
	isInitialized = false;
	initStudyTimer();
	notifySubscribers();
	return { ...currentState };
}

/**
 * Subscribes to active study timer changes.
 * Immediately invokes the callback with current state.
 */
export function subscribeStudyTimer(callback: (state: ActiveStudyTimerState) => void): () => void {
	if (!isInitialized && typeof window !== 'undefined') {
		initStudyTimer();
	}

	listeners.push(callback);
	callback({ ...currentState });

	return () => {
		listeners = listeners.filter((cb) => cb !== callback);
	};
}

/**
 * Formats seconds for the active timer indicator (e.g. "04:12" or "1:05:32").
 */
export function formatTimerDisplay(totalSeconds: number): string {
	const secs = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(secs / 3600);
	const minutes = Math.floor((secs % 3600) / 60);
	const remainingSeconds = secs % 60;

	const paddedMin = String(minutes).padStart(2, '0');
	const paddedSec = String(remainingSeconds).padStart(2, '0');

	if (hours > 0) {
		return `${hours}:${paddedMin}:${paddedSec}`;
	}
	return `${paddedMin}:${paddedSec}`;
}

/**
 * Formats seconds for human readable progress metrics (e.g. "1h 45m" or "25 mins").
 */
export function formatStudyDuration(totalSeconds: number): string {
	const secs = Math.max(0, Math.floor(totalSeconds));
	if (secs === 0) return '0 mins';
	if (secs < 60) return `${secs}s`;

	const hours = Math.floor(secs / 3600);
	const minutes = Math.floor((secs % 3600) / 60);

	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	}
	return `${minutes} mins`;
}

/**
 * Automatically starts or resumes the study timer if the auto-start setting is enabled
 * and the timer is currently idle or paused.
 */
export function triggerAutoStartStudyTimer(): ActiveStudyTimerState {
	if (!isAutoStartTimerEnabled()) {
		return getActiveSession();
	}
	const session = getActiveSession();
	if (session.status === 'idle' || session.status === 'paused') {
		return startStudyTimer();
	}
	return session;
}

/**
 * Automatically stops the study timer and saves accumulated session time if the
 * auto-start/stop setting is enabled and the timer is currently running or paused.
 * Returns the recorded elapsed seconds.
 */
export function triggerAutoStopStudyTimer(): number {
	if (!isAutoStartTimerEnabled()) {
		return 0;
	}
	const session = getActiveSession();
	if (session.status === 'running' || session.status === 'paused') {
		return stopStudyTimer();
	}
	return 0;
}

// Auto-initialize when loaded on client
if (typeof window !== 'undefined') {
	initStudyTimer();
}
