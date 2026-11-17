<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ArrowLeft, Layers, Settings, Cloud, CloudOff, CloudCheck, Loader2 } from 'lucide-svelte';
	import { resolve } from '$app/paths';
	import { subscribeSyncStatus, pullAndMerge } from '$lib/cloud';
	import type { SyncStatus } from '@flash/shared';

	let {
		title = 'FlashCards Lite',
		showBack = false,
		onBack = () => history.back()
	} = $props<{
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
	}>();

	let syncStatus = $state<SyncStatus>('idle');
	let unsubscribe: (() => void) | null = null;

	onMount(() => {
		unsubscribe = subscribeSyncStatus((s) => {
			syncStatus = s;
		});
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	function handleSyncClick() {
		pullAndMerge();
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

	<div class="flex items-center gap-1">
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
