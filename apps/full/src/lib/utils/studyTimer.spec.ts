import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	startStudyTimer,
	pauseStudyTimer,
	resumeStudyTimer,
	stopStudyTimer,
	resetStudyTimer,
	reloadStudyTimerFromStorage,
	triggerAutoStartStudyTimer,
	triggerAutoStopStudyTimer,
	getActiveSession,
	getStudyTimeData,
	recordStudySession,
	formatTimerDisplay,
	formatStudyDuration,
	subscribeStudyTimer,
	FLASHCARDS_ACTIVE_TIMER_KEY
} from './studyTimer';
import { isAutoStartTimerEnabled, setAutoStartTimerEnabled } from './storage';

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

describe('studyTimer utility suite', () => {
	let storageMock: LocalStorageMock;

	beforeEach(() => {
		vi.useFakeTimers();
		storageMock = new LocalStorageMock();
		Object.defineProperty(globalThis, 'localStorage', {
			value: storageMock,
			writable: true,
			configurable: true
		});
		resetStudyTimer();
		storageMock.clear();
	});

	afterEach(() => {
		resetStudyTimer();
		vi.useRealTimers();
	});

	describe('formatTimerDisplay & formatStudyDuration', () => {
		it('formats seconds into MM:SS for durations under an hour', () => {
			expect(formatTimerDisplay(0)).toBe('00:00');
			expect(formatTimerDisplay(5)).toBe('00:05');
			expect(formatTimerDisplay(65)).toBe('01:05');
			expect(formatTimerDisplay(599)).toBe('09:59');
			expect(formatTimerDisplay(3599)).toBe('59:59');
		});

		it('formats seconds into H:MM:SS for durations of an hour or more', () => {
			expect(formatTimerDisplay(3600)).toBe('1:00:00');
			expect(formatTimerDisplay(3665)).toBe('1:01:05');
			expect(formatTimerDisplay(7322)).toBe('2:02:02');
		});

		it('formats human readable study durations', () => {
			expect(formatStudyDuration(0)).toBe('0 mins');
			expect(formatStudyDuration(45)).toBe('45s');
			expect(formatStudyDuration(60)).toBe('1 mins');
			expect(formatStudyDuration(180)).toBe('3 mins');
			expect(formatStudyDuration(3600)).toBe('1h');
			expect(formatStudyDuration(3720)).toBe('1h 2m');
			expect(formatStudyDuration(7200)).toBe('2h');
		});
	});

	describe('Session lifecycle: start, pause, resume, stop', () => {
		it('starts in idle status with 0 elapsed seconds', () => {
			const session = getActiveSession();
			expect(session.status).toBe('idle');
			expect(session.elapsedSeconds).toBe(0);
		});

		it('starts timer and updates status to running', () => {
			const started = startStudyTimer();
			expect(started.status).toBe('running');
			expect(started.sessionStartedAt).toBeGreaterThan(0);
			expect(started.lastActiveTimestamp).toBeGreaterThan(0);
		});

		it('accumulates active time when running and page is visible', () => {
			// Mock document.visibilityState
			Object.defineProperty(globalThis, 'document', {
				value: {
					visibilityState: 'visible',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				},
				writable: true,
				configurable: true
			});

			startStudyTimer();

			// Advance time by 3 seconds
			vi.advanceTimersByTime(3100);

			const current = getActiveSession();
			expect(current.status).toBe('running');
			expect(current.elapsedSeconds).toBeGreaterThanOrEqual(2);
		});

		it('pauses and resumes without losing elapsed seconds', () => {
			Object.defineProperty(globalThis, 'document', {
				value: {
					visibilityState: 'visible',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				},
				writable: true,
				configurable: true
			});

			startStudyTimer();
			vi.advanceTimersByTime(2100);

			const paused = pauseStudyTimer();
			expect(paused.status).toBe('paused');
			const pausedElapsed = paused.elapsedSeconds;
			expect(pausedElapsed).toBeGreaterThanOrEqual(1);

			// Advancing time while paused should NOT increase elapsedSeconds
			vi.advanceTimersByTime(5000);
			expect(getActiveSession().elapsedSeconds).toBe(pausedElapsed);

			// Resume
			const resumed = resumeStudyTimer();
			expect(resumed.status).toBe('running');
			vi.advanceTimersByTime(2100);
			expect(getActiveSession().elapsedSeconds).toBeGreaterThan(pausedElapsed);
		});

		it('stops timer, commits elapsed seconds to studyTimeData, and resets to idle', () => {
			Object.defineProperty(globalThis, 'document', {
				value: {
					visibilityState: 'visible',
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				},
				writable: true,
				configurable: true
			});

			startStudyTimer();
			vi.advanceTimersByTime(4100);

			const elapsed = getActiveSession().elapsedSeconds;
			expect(elapsed).toBeGreaterThan(0);

			const recorded = stopStudyTimer();
			expect(recorded).toBe(elapsed);

			// Timer returns to idle
			const sessionAfter = getActiveSession();
			expect(sessionAfter.status).toBe('idle');
			expect(sessionAfter.elapsedSeconds).toBe(0);

			// Study time data reflects recorded session
			const data = getStudyTimeData();
			expect(data.totalSeconds).toBe(elapsed);
			expect(data.sessionsCount).toBe(1);
			const today = new Date().toISOString().split('T')[0];
			expect(data.dailySeconds[today]).toBe(elapsed);
		});
	});

	describe('Subscribers & Reactivity', () => {
		it('notifies subscribers on state transitions', () => {
			const states: string[] = [];
			const unsubscribe = subscribeStudyTimer((s) => {
				states.push(s.status);
			});

			startStudyTimer();
			pauseStudyTimer();
			resumeStudyTimer();
			stopStudyTimer();

			unsubscribe();

			expect(states).toContain('idle');
			expect(states).toContain('running');
			expect(states).toContain('paused');
		});
	});

	describe('Persistence and surviving refresh', () => {
		it('saves and loads active timer state from localStorage', () => {
			startStudyTimer();
			vi.advanceTimersByTime(3100);

			const raw = storageMock.getItem(FLASHCARDS_ACTIVE_TIMER_KEY);
			expect(raw).toBeTruthy();
			const parsed = JSON.parse(raw!);
			expect(parsed.status).toBe('running');
			expect(parsed.elapsedSeconds).toBeGreaterThan(0);
		});

		it('records multiple study sessions cumulatively', () => {
			recordStudySession(60);
			recordStudySession(120);

			const stats = getStudyTimeData();
			expect(stats.totalSeconds).toBe(180);
			expect(stats.sessionsCount).toBe(2);
		});

		it('pauses accumulating when document becomes hidden and resumes when returning visible', () => {
			let visibilityHandler: (() => void) | null = null;
			let currentVisibility: DocumentVisibilityState = 'visible';

			Object.defineProperty(globalThis, 'document', {
				value: {
					get visibilityState() {
						return currentVisibility;
					},
					addEventListener: vi.fn((event: string, handler: () => void) => {
						if (event === 'visibilitychange') {
							visibilityHandler = handler;
						}
					}),
					removeEventListener: vi.fn()
				},
				writable: true,
				configurable: true
			});

			startStudyTimer();
			vi.advanceTimersByTime(2100);
			const activeSecs = getActiveSession().elapsedSeconds;
			expect(activeSecs).toBeGreaterThanOrEqual(1);

			// User leaves tab: visibility becomes 'hidden'
			currentVisibility = 'hidden';
			if (visibilityHandler) {
				(visibilityHandler as () => void)();
			}

			// Time passes in background for 10 seconds
			vi.advanceTimersByTime(10000);

			// Elapsed seconds should NOT have grown by 10s while tab was hidden
			const hiddenSecs = getActiveSession().elapsedSeconds;
			expect(hiddenSecs).toBe(activeSecs);

			// User returns to tab: visibility becomes 'visible'
			currentVisibility = 'visible';
			if (visibilityHandler) {
				(visibilityHandler as () => void)();
			}

			// Active time advances again
			vi.advanceTimersByTime(3100);
			expect(getActiveSession().elapsedSeconds).toBeGreaterThan(hiddenSecs);
		});

		it('survives refresh: re-hydrates running state from localStorage', () => {
			// Simulate existing running session saved before refresh
			storageMock.setItem(
				FLASHCARDS_ACTIVE_TIMER_KEY,
				JSON.stringify({
					status: 'running',
					elapsedSeconds: 42,
					sessionStartedAt: Date.now() - 42000,
					lastActiveTimestamp: Date.now()
				})
			);

			// Reload active timer state from storage (simulating page reload)
			const reloaded = reloadStudyTimerFromStorage();
			expect(reloaded.status).toBe('running');
			expect(reloaded.elapsedSeconds).toBe(42);
		});
	});

	describe('triggerAutoStartStudyTimer & triggerAutoStopStudyTimer', () => {
		it('auto-starts timer when idle and preference is enabled by default', () => {
			expect(isAutoStartTimerEnabled()).toBe(true);
			expect(getActiveSession().status).toBe('idle');

			const session = triggerAutoStartStudyTimer();
			expect(session.status).toBe('running');
			expect(getActiveSession().status).toBe('running');
		});

		it('does not auto-start if auto-start preference is disabled', () => {
			setAutoStartTimerEnabled(false);
			expect(isAutoStartTimerEnabled()).toBe(false);

			const session = triggerAutoStartStudyTimer();
			expect(session.status).toBe('idle');
			expect(getActiveSession().status).toBe('idle');
		});

		it('resumes timer when paused', () => {
			setAutoStartTimerEnabled(true);
			startStudyTimer();
			pauseStudyTimer();
			expect(getActiveSession().status).toBe('paused');

			const session = triggerAutoStartStudyTimer();
			expect(session.status).toBe('running');
		});

		it('auto-stops and records elapsed session time when running', () => {
			setAutoStartTimerEnabled(true);
			triggerAutoStartStudyTimer();
			vi.advanceTimersByTime(5100);

			const stoppedSeconds = triggerAutoStopStudyTimer();
			expect(stoppedSeconds).toBeGreaterThanOrEqual(5);
			expect(getActiveSession().status).toBe('idle');
			expect(getStudyTimeData().totalSeconds).toBe(stoppedSeconds);
		});

		it('does nothing on auto-stop if timer is already idle', () => {
			setAutoStartTimerEnabled(true);
			const stoppedSeconds = triggerAutoStopStudyTimer();
			expect(stoppedSeconds).toBe(0);
			expect(getActiveSession().status).toBe('idle');
		});

		it('does not auto-stop if auto-start/stop preference is disabled', () => {
			startStudyTimer();
			setAutoStartTimerEnabled(false);

			const stoppedSeconds = triggerAutoStopStudyTimer();
			expect(stoppedSeconds).toBe(0);
			expect(getActiveSession().status).toBe('running');
		});
	});
});
