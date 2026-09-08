<script lang="ts">
	import './layout.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { onMount } from 'svelte';
	import { page, updated } from '$app/state';
	import { initializeOfflinePacks, getSavedUsername, clearOfflineCache } from '$lib/utils/storage';
	import { pullAndMerge } from '$lib/utils/cloud';

	let { children } = $props();

	// Hide bottom navigation during active study sessions for immersion
	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') ||
			page.url.pathname === '/review' ||
			page.url.pathname === '/practice' ||
			page.url.pathname.startsWith('/games/')
	);

	onMount(() => {
		let interval: ReturnType<typeof setInterval>;

		(async () => {
			// 1. Preload and cache all vocabulary into IndexedDB for 100% offline availability
			await initializeOfflinePacks();

			// 2. Pull & merge from JSON Drive cloud in background
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
		{@render children()}
	</div>

	<!-- Bottom Navigation Bar (Shown on main views) -->
	{#if !isStudySession}
		<BottomNav />
	{/if}
</div>
