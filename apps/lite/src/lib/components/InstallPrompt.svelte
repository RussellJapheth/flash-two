<script lang="ts">
	import { pwa } from '$lib/pwa.svelte';
	import { Download, X, Share } from 'lucide-svelte';

	let isInstalling = $state(false);
	let showIosInstructions = $state(false);

	async function handleInstall() {
		if (pwa.isIOS) {
			showIosInstructions = !showIosInstructions;
			return;
		}
		isInstalling = true;
		try {
			await pwa.promptInstall();
		} finally {
			isInstalling = false;
		}
	}

	function handleDismiss() {
		pwa.dismiss();
	}
</script>

{#if pwa.isInstallable && !pwa.isDismissed && !pwa.isInstalled}
	<aside
		aria-label="Install App"
		class="fixed right-0 bottom-[calc(env(safe-area-inset-bottom,0.5rem)+4.25rem)] left-0 z-30 mx-auto w-full px-4 sm:max-w-md"
	>
		<div
			class="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-lg shadow-slate-900/10 backdrop-blur-md"
		>
			<div class="flex items-center justify-between gap-3">
				<div class="flex min-w-0 items-center gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
					>
						<Download size={20} strokeWidth={2.25} />
					</div>
					<div class="min-w-0">
						<p class="truncate font-headline text-xs font-bold text-slate-900">
							Install FlashCards
						</p>
						<p class="truncate font-sans text-xs text-slate-500">
							{pwa.isIOS ? 'Install on your iPhone or iPad' : 'Add to home screen for offline use'}
						</p>
					</div>
				</div>

				<div class="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onclick={handleInstall}
						disabled={isInstalling}
						class="flex h-9 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-3.5 font-headline text-xs font-bold text-white shadow-xs transition-transform hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
					>
						{isInstalling ? 'Installing…' : pwa.isIOS ? 'Install' : 'Install'}
					</button>
					<button
						type="button"
						onclick={handleDismiss}
						aria-label="Dismiss install prompt"
						class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
					>
						<X size={18} strokeWidth={2} />
					</button>
				</div>
			</div>

			{#if showIosInstructions}
				<div
					class="mt-1 flex items-center gap-2 rounded-xl bg-indigo-50 p-2.5 text-xs text-indigo-900"
				>
					<Share size={16} class="shrink-0 text-indigo-600" />
					<p>
						Tap the <strong>Share</strong> button in Safari, then tap
						<strong>Add to Home Screen</strong>.
					</p>
				</div>
			{/if}
		</div>
	</aside>
{/if}
