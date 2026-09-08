<script lang="ts">
	import type { SyncStatus } from '$lib/types';
	import { subscribeSyncStatus, pushData } from '$lib/utils/cloud';
	import { onMount } from 'svelte';
	import {
		ArrowLeft,
		RefreshCw,
		CloudOff,
		Cloud,
		CloudCheck,
		CloudUpload,
		Sparkles
	} from 'lucide-svelte';

	let {
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
	let SyncIcon = $derived(
		syncStatus === 'syncing'
			? RefreshCw
			: syncStatus === 'error'
				? CloudOff
				: syncStatus === 'ok'
					? CloudCheck
					: syncStatus === 'pending'
						? CloudUpload
						: Cloud
	);

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
				<Sparkles size={16} strokeWidth={2.25} />
			</div>
		{/if}
		<div>
			<h1 class="font-headline text-base font-bold tracking-tight text-slate-900">
				{title}
			</h1>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<!-- Sync Indicator Button -->
		<button
			type="button"
			onclick={handleSyncClick}
			title="Cloud Sync: {syncStatus}"
			aria-label="Sync status: {syncStatus}"
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 {syncStatus ===
			'syncing'
				? 'bg-indigo-50 text-indigo-600'
				: syncStatus === 'error'
					? 'bg-rose-50 text-rose-600'
					: syncStatus === 'pending'
						? 'bg-amber-50 text-amber-600'
						: ''}"
		>
			<SyncIcon size={16} strokeWidth={2} class={syncStatus === 'syncing' ? 'animate-spin' : ''} />
		</button>
	</div>
</header>
