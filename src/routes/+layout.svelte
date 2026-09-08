<script lang="ts">
	import './layout.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import StreakCalendarModal from '$lib/components/StreakCalendarModal.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		initializeOfflinePacks,
		getAllProgress,
		computeStreakStats,
		getSavedUsername
	} from '$lib/utils/storage';
	import { pullAndMerge } from '$lib/utils/cloud';
	import type { StreakStats } from '$lib/types';

	let { children } = $props();

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let isStreakModalOpen = $state(false);

	// Hide bottom navigation during active study sessions for immersion
	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') ||
			page.url.pathname === '/review' ||
			page.url.pathname === '/practice'
	);

	async function refreshStats() {
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);
	}

	onMount(async () => {
		// 1. Preload and cache all vocabulary into IndexedDB for 100% offline availability
		await initializeOfflinePacks();

		// 2. Load local progress and calculate streak stats
		await refreshStats();

		// 3. Pull & merge from JSON Drive cloud in background
		const user = getSavedUsername();
		if (user) {
			const synced = await pullAndMerge(user);
			if (synced) {
				await refreshStats();
			}
		}
	});

	function openStreakModal() {
		isStreakModalOpen = true;
	}

	function closeStreakModal() {
		isStreakModalOpen = false;
	}
</script>

<div class="min-h-screen bg-surface font-sans text-on-surface flex flex-col items-center">
	<!-- Centered App Arena (Mobile first, Max 540px width per DESIGN.md on desktop) -->
	<div
		class="relative flex min-h-screen w-full max-w-md flex-col bg-surface-container-lowest shadow-sm pb-[calc(env(safe-area-inset-bottom,0px)+5rem)]"
	>
		{@render children()}
	</div>

	<!-- Bottom Navigation Bar (Shown on main views) -->
	{#if !isStudySession}
		<BottomNav />
	{/if}

	<!-- Global Streak Calendar Modal -->
	<StreakCalendarModal
		isOpen={isStreakModalOpen}
		streak={streakStats.currentStreak}
		activeDates={streakStats.activeDates}
		onClose={closeStreakModal}
	/>
</div>
