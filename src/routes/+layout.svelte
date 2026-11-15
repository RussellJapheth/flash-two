<script lang="ts">
	import './layout.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import DictionaryModal from '$lib/components/DictionaryModal.svelte';
	import FullModeBanner from '$lib/components/FullModeBanner.svelte';
	import { onMount } from 'svelte';
	import { page, updated } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { initializeOfflinePacks, getSavedUsername, clearOfflineCache } from '$lib/utils/storage';
	import { pullAndMerge } from '$lib/utils/cloud';
	import { migrateLocalXP } from '$lib/utils/xp';
	import { liteModeStore, resolveInitialLiteMode, isFullFeaturePath } from '$lib/utils/liteMode';

	let { children } = $props();

	// In Lite mode, '/' automatically redirects to '/decks'
	$effect(() => {
		if ($liteModeStore && page.url.pathname === '/') {
			goto(resolve('/decks'), { replaceState: true });
		}
	});

	// Hide bottom navigation during active study sessions for immersion
	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') ||
			page.url.pathname === '/review' ||
			page.url.pathname === '/practice' ||
			page.url.pathname.startsWith('/games/') ||
			page.url.pathname.startsWith('/story/') ||
			(page.url.pathname.startsWith('/textbook/') && page.url.pathname !== '/textbook') ||
			(page.url.pathname.startsWith('/podcasts/') && page.url.pathname !== '/podcasts')
	);

	onMount(() => {
		// Initialize lite mode from URL parameters or saved preference
		resolveInitialLiteMode(page.url);

		let interval: ReturnType<typeof setInterval>;

		(async () => {
			// 1. Run local XP version migration (resets v1 inflated points to v2)
			migrateLocalXP();

			// 2. Preload and cache all vocabulary into IndexedDB for 100% offline availability
			await initializeOfflinePacks();

			// 3. Pull & merge from JSON Drive cloud in background
			const user = getSavedUsername();
			if (user) {
				await pullAndMerge(user);
			}

			// 3. Poll for new deployments; on detection clear all caches and hard-reload
			updated.check();
			interval = setInterval(async () => {
				const hasUpdate = await updated.check();
				if (hasUpdate) {
					clearInterval(interval);
					await clearOfflineCache();
					location.reload();
				}
			}, 60_000);
		})();

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div
	class="flex min-h-screen flex-col items-center bg-white font-sans text-slate-900 sm:bg-slate-100"
>
	<!-- Centered App Arena (Edge-to-edge on mobile, max 448px centered arena on sm and desktop) -->
	<div
		class="relative flex min-h-screen w-full flex-col bg-white pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] sm:max-w-md sm:border-x sm:border-slate-200/60 sm:shadow-sm"
	>
		{#if $liteModeStore && isFullFeaturePath(page.url.pathname)}
			<FullModeBanner />
		{/if}
		{@render children()}
	</div>

	<!-- Floating Dictionary Icon & Lookup Modal (Visible on all pages) -->
	<DictionaryModal />

	<!-- Bottom Navigation Bar (Shown on main views) -->
	{#if !isStudySession}
		<BottomNav />
	{/if}
</div>
