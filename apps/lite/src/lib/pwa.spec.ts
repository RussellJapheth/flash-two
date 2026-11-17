import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pwa } from './pwa.svelte';

class StorageMock {
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

describe('PwaState', () => {
	beforeEach(() => {
		const session = new StorageMock();
		const local = new StorageMock();
		Object.defineProperty(globalThis, 'sessionStorage', {
			value: session,
			writable: true
		});
		Object.defineProperty(globalThis, 'localStorage', {
			value: local,
			writable: true
		});
		Object.defineProperty(globalThis, 'window', {
			value: {
				sessionStorage: session,
				localStorage: local,
				matchMedia: vi.fn().mockImplementation((query: string) => ({
					matches: false,
					media: query
				})),
				navigator: { userAgent: 'Chrome', standalone: false },
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			},
			writable: true
		});
	});

	it('initializes with default properties', () => {
		expect(typeof pwa.isInstalled).toBe('boolean');
		expect(typeof pwa.isDismissed).toBe('boolean');
	});

	it('dismisses prompt and persists to sessionStorage', () => {
		pwa.dismiss();
		expect(pwa.isDismissed).toBe(true);
		expect(sessionStorage.getItem('pwa_install_dismissed')).toBe('true');
	});

	it('detects standalone mode when matchMedia matches', () => {
		(window.matchMedia as unknown as ReturnType<typeof vi.fn>).mockImplementation(
			(query: string) => ({
				matches: query === '(display-mode: standalone)',
				media: query
			})
		);

		pwa.init();
		expect(pwa.isInstalled).toBe(true);
		expect(pwa.isInstallable).toBe(false);
	});
});
