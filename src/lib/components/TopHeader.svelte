<script lang="ts">
	import type { SyncStatus } from '$lib/types';
	import { subscribeSyncStatus, pushData } from '$lib/utils/cloud';
	import { onMount } from 'svelte';

	let {
		streak = 0,
		onOpenStreak = () => {},
		title = 'FlashCards',
		showBack = false,
		onBack = () => history.back()
	} = $props<{
		streak?: number;
		onOpenStreak?: () => void;
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
	}>();

	let syncStatus = $state<SyncStatus>('idle');

	onMount(() => {
		const unsubscribe = subscribeSyncStatus((s) => {
			syncStatus = s;
		});
		return unsubscribe;
	});

	function handleSyncClick() {
		pushData();
	}
</script>

<header
	class="sticky top-0 z-30 flex items-center justify-between border-b border-surface-container bg-surface/90 px-4 py-3 backdrop-blur-md"
>
	<div class="flex items-center gap-2">
		{#if showBack}
			<button
				type="button"
				onclick={onBack}
				aria-label="Go Back"
				class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface transition-transform hover:bg-surface-container-high active:scale-95"
			>
				<span class="material-symbols-outlined text-[20px]">arrow_back</span>
			</button>
		{/if}
		<h1 class="font-headline text-lg font-bold tracking-tight text-on-surface">
			{title}
		</h1>
	</div>

	<div class="flex items-center gap-2">
		<!-- Sync Indicator -->
		<button
			type="button"
			onclick={handleSyncClick}
			title="Cloud Sync Status: {syncStatus}"
			class="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-colors {syncStatus ===
			'syncing'
				? 'bg-primary-fixed text-primary'
				: syncStatus === 'error'
					? 'bg-error-container text-on-error-container'
					: syncStatus === 'pending'
						? 'bg-secondary-fixed text-on-secondary-fixed'
						: 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
		>
			<span
				class="material-symbols-outlined text-[16px] {syncStatus === 'syncing' ? 'animate-spin' : ''}"
			>
				{#if syncStatus === 'syncing'}
					sync
				{:else if syncStatus === 'error'}
					sync_problem
				{:else if syncStatus === 'ok'}
					cloud_done
				{:else if syncStatus === 'pending'}
					cloud_upload
				{:else}
					cloud
				{/if}
			</span>
			<span class="hidden sm:inline capitalize">{syncStatus}</span>
		</button>

		<!-- Streak Badge Pill -->
		<button
			type="button"
			onclick={onOpenStreak}
			class="flex h-8 items-center gap-1.5 rounded-full border border-secondary-container/40 bg-secondary-fixed px-3 py-1 text-xs font-bold text-on-secondary-fixed shadow-sm transition-transform active:scale-95"
		>
			<span
				class="material-symbols-outlined text-[16px] text-secondary"
				style="font-variation-settings: 'FILL' 1;">local_fire_department</span
			>
			<span class="font-headline">{streak}</span>
			<span class="hidden xs:inline">Days</span>
		</button>
	</div>
</header>
