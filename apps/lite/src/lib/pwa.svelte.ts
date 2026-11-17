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

	get isInstallable(): boolean {
		return this.#deferredPrompt !== null && !this.#isInstalled;
	}

	get isInstalled(): boolean {
		return this.#isInstalled;
	}

	get isDismissed(): boolean {
		return this.#isDismissed;
	}

	init() {
		if (typeof window === 'undefined') return;

		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			// @ts-expect-error iOS Safari navigator.standalone check
			window.navigator.standalone === true;

		if (isStandalone) {
			this.#isInstalled = true;
			return;
		}

		if (sessionStorage.getItem('pwa_install_dismissed') === 'true') {
			this.#isDismissed = true;
		}

		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			this.#deferredPrompt = event as BeforeInstallPromptEvent;
		});

		window.addEventListener('appinstalled', () => {
			this.#deferredPrompt = null;
			this.#isInstalled = true;
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
		} else {
			this.dismiss();
		}

		return choice.outcome;
	}

	dismiss() {
		this.#isDismissed = true;
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('pwa_install_dismissed', 'true');
		}
	}
}

export const pwa = new PwaState();
