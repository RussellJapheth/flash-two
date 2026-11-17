<script lang="ts">
	import { onMount } from 'svelte';
	import {
		startStudyTimer,
		pauseStudyTimer,
		resumeStudyTimer,
		stopStudyTimer,
		subscribeStudyTimer,
		formatTimerDisplay,
		formatStudyDuration
	} from '$lib/utils/studyTimer';
	import type { ActiveStudyTimerState } from '$lib/types';
	import { Timer, Pause, Play, Square, Check } from 'lucide-svelte';

	let { compact = false } = $props<{ compact?: boolean }>();

	let session = $state<ActiveStudyTimerState>({
		status: 'idle',
		elapsedSeconds: 0,
		sessionStartedAt: 0,
		lastActiveTimestamp: 0
	});

	let toastMessage = $state<string | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		const unsubscribe = subscribeStudyTimer((s) => {
			session = s;
		});

		return () => {
			unsubscribe();
			if (toastTimeout) clearTimeout(toastTimeout);
		};
	});

	function handleStart() {
		startStudyTimer();
	}

	function handlePause() {
		pauseStudyTimer();
	}

	function handleResume() {
		resumeStudyTimer();
	}

	function handleStop() {
		const recorded = stopStudyTimer();
		if (recorded > 0) {
			toastMessage = `+${formatStudyDuration(recorded)}`;
			if (toastTimeout) clearTimeout(toastTimeout);
			toastTimeout = setTimeout(() => {
				toastMessage = null;
			}, 2800);
		}
	}
</script>

{#if toastMessage}
	<div
		class="animate-in fade-in zoom-in-95 flex items-center gap-1 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-xs"
	>
		<Check size={12} strokeWidth={2.5} />
		<span class="font-headline text-[11px] font-bold">{toastMessage} saved</span>
	</div>
{:else if session.status === 'idle'}
	<button
		type="button"
		onclick={handleStart}
		title="Start study session timer"
		aria-label="Start study session timer"
		class="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-600 active:scale-95"
	>
		<Timer size={14} strokeWidth={2.25} />
		{#if !compact}
			<span class="font-headline text-xs font-bold tracking-tight">Timer</span>
		{/if}
	</button>
{:else if session.status === 'running'}
	<div
		class="flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/70 py-1 pr-1.5 pl-2.5 shadow-xs backdrop-blur-xs"
	>
		<!-- Running pulse dot -->
		<span class="relative flex h-2 w-2 shrink-0">
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
			></span>
			<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
		</span>

		<!-- Time display -->
		<span class="font-headline text-xs font-bold text-slate-800 tabular-nums">
			{formatTimerDisplay(session.elapsedSeconds)}
		</span>

		<!-- Pause Button -->
		<button
			type="button"
			onclick={handlePause}
			title="Pause study timer"
			aria-label="Pause study timer"
			class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-white hover:text-slate-900 active:scale-90"
		>
			<Pause size={12} strokeWidth={2.5} />
		</button>

		<!-- Stop Button -->
		<button
			type="button"
			onclick={handleStop}
			title="Stop and save study session"
			aria-label="Stop and save study session"
			class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 active:scale-90"
		>
			<Square size={11} strokeWidth={2.5} />
		</button>
	</div>
{:else if session.status === 'paused'}
	<div
		class="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 py-1 pr-1.5 pl-2.5 shadow-xs backdrop-blur-xs"
	>
		<!-- Paused steady amber dot -->
		<span class="h-2 w-2 shrink-0 rounded-full bg-amber-500"></span>

		<!-- Time display -->
		<span class="font-headline text-xs font-bold text-amber-900 tabular-nums">
			{formatTimerDisplay(session.elapsedSeconds)}
		</span>

		<!-- Resume Button -->
		<button
			type="button"
			onclick={handleResume}
			title="Resume study timer"
			aria-label="Resume study timer"
			class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-white hover:text-emerald-800 active:scale-90"
		>
			<Play size={12} strokeWidth={2.5} class="ml-0.5" />
		</button>

		<!-- Stop Button -->
		<button
			type="button"
			onclick={handleStop}
			title="Stop and save study session"
			aria-label="Stop and save study session"
			class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 active:scale-90"
		>
			<Square size={11} strokeWidth={2.5} />
		</button>
	</div>
{/if}
