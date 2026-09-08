<script lang="ts">
	import './layout.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { initializeOfflinePacks, getSavedUsername } from '$lib/utils/storage';
	import { pullAndMerge } from '$lib/utils/cloud';

	let { children } = $props();

	// Hide bottom navigation during active study sessions for immersion
	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') ||
			page.url.pathname === '/review' ||
			page.url.pathname === '/practice'
	);

	onMount(async () => {
		// 1. Preload and cache all vocabulary into IndexedDB for 100% offline availability
		await initializeOfflinePacks();

		// 2. Pull & merge from JSON Drive cloud in background
		const user = getSavedUsername();
		if (user) {
			await pullAndMerge(user);
		}
	});
</script>

<div class="flex min-h-screen flex-col items-center bg-slate-100 font-sans text-slate-900">
	<!-- Centered App Arena (Mobile first, Max 448px width on desktop) -->
	<div
		class="relative flex min-h-screen w-full max-w-md flex-col border-x border-slate-200/60 bg-white pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] shadow-sm"
	>
		{@render children()}
	</div>

	<!-- Bottom Navigation Bar (Shown on main views) -->
	{#if !isStudySession}
		<BottomNav />
	{/if}
</div>
