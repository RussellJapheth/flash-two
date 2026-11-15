import { writable } from 'svelte/store';

export const LITE_MODE_KEY = 'flashcards_lite_mode';

export function getStoredLiteMode(): boolean | null {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') return null;
	try {
		const val = localStorage.getItem(LITE_MODE_KEY);
		if (val === null) return null;
		return val === 'true';
	} catch {
		return null;
	}
}

export function isLiteModeEnabled(): boolean {
	const stored = getStoredLiteMode();
	if (stored === null) return true; // Default for new users is Lite mode (true)
	return stored;
}

export const liteModeStore = writable<boolean>(isLiteModeEnabled());

export function setLiteMode(enabled: boolean): void {
	if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(LITE_MODE_KEY, String(enabled));
		} catch {
			// Ignore localStorage write errors
		}
	}
	liteModeStore.set(enabled);
}

export function resolveInitialLiteMode(url?: URL | Location): boolean {
	let param: string | null = null;
	if (url) {
		try {
			const search = 'searchParams' in url ? url.searchParams : new URL(url.href).searchParams;
			param = search.get('lite');
		} catch {
			param = null;
		}
	}

	// 1. Explicit URL parameter takes immediate priority whenever present on any URL
	if (param !== null) {
		const lower = param.trim().toLowerCase();
		if (lower === 'off' || lower === 'false' || lower === '0') {
			setLiteMode(false);
			return false;
		}
		if (lower === 'on' || lower === 'true' || lower === '1') {
			setLiteMode(true);
			return true;
		}
	}

	// 2. If no URL parameter, use stored preference
	const stored = getStoredLiteMode();
	if (stored === null) {
		// Default for new users: Lite Mode ON
		setLiteMode(true);
		return true;
	}

	// Existing user stored preference
	liteModeStore.set(stored);
	return stored;
}

const FULL_FEATURE_PREFIXES = [
	'/textbook',
	'/podcasts',
	'/games',
	'/notebook',
	'/links',
	'/saved',
	'/practice',
	'/story',
	'/guide',
	'/leaderboard'
] as const;

export function isFullFeaturePath(pathname: string): boolean {
	return FULL_FEATURE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}
