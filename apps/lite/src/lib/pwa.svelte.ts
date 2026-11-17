export interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;
	prompt(): Promise<void>;
}

class PwaState {
	#deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	#isInstalled = $state(false);
	#isDismissed = $state(false);
	#isIOS = $state(false);

	get isInstallable(): boolean {
		if (this.#isInstalled || this.#isDismissed) return false;
		return this.#deferredPrompt !== null || this.#isIOS;
	}

	get isInstalled(): boolean {
		return this.#isInstalled;
	}

	get isDismissed(): boolean {
		return this.#isDismissed;
	}

	get isIOS(): boolean {
		return this.#isIOS;
	}

	init() {
		if (typeof window === 'undefined') return;

		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			window.matchMedia('(display-mode: minimal-ui)').matches ||
			window.matchMedia('(display-mode: fullscreen)').matches ||
			// @ts-expect-error iOS Safari navigator.standalone check
			window.navigator.standalone === true ||
			localStorage.getItem('pwa_installed') === 'true';

		if (isStandalone) {
			this.#isInstalled = true;
			return;
		}

		if (
			sessionStorage.getItem('pwa_install_dismissed') === 'true' ||
			sessionStorage.getItem('pwa_session_installed') === 'true'
		) {
			this.#isDismissed = true;
		}

		// Detect iOS Safari compatibility
		const ua = window.navigator.userAgent;
		const isIOSDevice =
			/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
		const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
		if (isIOSDevice && isSafari && !isStandalone) {
			this.#isIOS = true;
		}

		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			this.#deferredPrompt = event as BeforeInstallPromptEvent;
		});

		window.addEventListener('appinstalled', () => {
			this.#deferredPrompt = null;
			this.#isInstalled = true;
			try {
				localStorage.setItem('pwa_installed', 'true');
				sessionStorage.setItem('pwa_session_installed', 'true');
			} catch {
				// Ignore storage errors
			}
		});
	}

	async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
		if (!this.#deferredPrompt) return 'unavailable';

		const promptEvent = this.#deferredPrompt;
		await promptEvent.prompt();
		const choice = await promptEvent.userChoice;

		if (choice.outcome === 'accepted') {
			this.#deferredPrompt = null;
			this.#isInstalled = true;
			try {
				localStorage.setItem('pwa_installed', 'true');
				sessionStorage.setItem('pwa_session_installed', 'true');
			} catch {
				// Ignore storage errors
			}
		} else {
			this.dismiss();
		}

		return choice.outcome;
	}

	dismiss() {
		this.#isDismissed = true;
		if (typeof window !== 'undefined') {
			try {
				sessionStorage.setItem('pwa_install_dismissed', 'true');
			} catch {
				// Ignore storage errors
			}
		}
	}
}

export const pwa = new PwaState();
