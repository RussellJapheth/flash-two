<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		ArrowLeft,
		Layers,
		Settings,
		Cloud,
		CloudOff,
		CloudCheck,
		Loader2,
		Flame
	} from 'lucide-svelte';
	import { resolve } from '$app/paths';
	import { subscribeSyncStatus, pullAndMerge } from '$lib/cloud';
	import { getStreakStats, registerDataMutationListener, type StreakStats } from '$lib/storage';
	import type { SyncStatus } from '@flash/shared';
	import StreakCalendarModal from './StreakCalendarModal.svelte';

	interface Props {
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
		streak?: number;
		onOpenStreak?: () => void;
	}

	let {
		title = 'FlashCards Lite',
		showBack = false,
		onBack = () => history.back(),
		streak,
		onOpenStreak
	}: Props = $props();

	let syncStatus = $state<SyncStatus>('idle');
	let unsubscribeSync: (() => void) | null = null;
	let unsubscribeMutation: (() => void) | null = null;

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 0,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: [],
		freezeDates: []
	});

	let showCalendar = $state(false);

	let effectiveStreak = $derived(streak !== undefined ? streak : streakStats.currentStreak);

	async function refreshStreak() {
		try {
			streakStats = await getStreakStats();
		} catch {
			// ignore
		}
	}

	onMount(() => {
		refreshStreak();
		unsubscribeSync = subscribeSyncStatus((s) => {
			syncStatus = s;
			if (s === 'ok') {
				refreshStreak();
			}
		});
		unsubscribeMutation = registerDataMutationListener(() => {
			refreshStreak();
		});
	});

	onDestroy(() => {
		unsubscribeSync?.();
		unsubscribeMutation?.();
	});

	function handleSyncClick() {
		pullAndMerge();
	}

	function handleStreakClick() {
		if (onOpenStreak) {
			onOpenStreak();
		} else {
			showCalendar = true;
		}
	}
</script>

<header
	class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md"
>
	<div class="flex items-center gap-2.5">
		{#if showBack}
			<button
				type="button"
				onclick={onBack}
				aria-label="Go Back"
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-transform hover:bg-slate-200 active:scale-95"
			>
				<ArrowLeft size={18} strokeWidth={2.25} />
			</button>
		{:else}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs"
			>
				<Layers size={16} strokeWidth={2.25} />
			</div>
		{/if}
		<div>
			<h1 class="font-headline text-base font-bold tracking-tight text-slate-900">
				{title}
			</h1>
		</div>
	</div>

	<div class="flex items-center gap-1.5">
		<!-- Minimal Streak Indicator Pill -->
		<button
			type="button"
			onclick={handleStreakClick}
			title={`Current streak: ${effectiveStreak} days (${streakStats.tierName}). Tap for streak calendar.`}
			aria-label={`Current streak: ${effectiveStreak} days. Open streak calendar`}
			class="flex h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all active:scale-95 {effectiveStreak >
			0
				? 'border border-amber-200/80 bg-amber-50 text-amber-900 shadow-xs hover:bg-amber-100'
				: 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}"
		>
			<Flame
				size={14}
				strokeWidth={2.25}
				class={effectiveStreak > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}
			/>
			<span>{effectiveStreak}d</span>
		</button>

		<button
			type="button"
			onclick={handleSyncClick}
			title={`Sync status: ${syncStatus}. Click to refresh.`}
			aria-label={`Sync status: ${syncStatus}`}
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
		>
			{#if syncStatus === 'syncing'}
				<Loader2 size={16} class="animate-spin text-indigo-600" />
			{:else if syncStatus === 'ok'}
				<CloudCheck size={16} class="text-emerald-500" />
			{:else if syncStatus === 'error'}
				<CloudOff size={16} class="text-rose-500" />
			{:else if syncStatus === 'pending'}
				<Cloud size={16} class="text-amber-500" />
			{:else}
				<Cloud size={16} class="text-slate-400" />
			{/if}
		</button>

		<a
			href={resolve('/settings')}
			title="Settings"
			aria-label="Settings"
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
		>
			<Settings size={16} strokeWidth={2} />
		</a>
	</div>
</header>

{#if !onOpenStreak}
	<StreakCalendarModal
		isOpen={showCalendar}
		streak={streakStats.currentStreak}
		longestStreak={streakStats.longestStreak}
		freezeCount={streakStats.freezeCount}
		activeDates={streakStats.activeDates}
		freezeDates={streakStats.freezeDates}
		onClose={() => (showCalendar = false)}
	/>
{/if}
