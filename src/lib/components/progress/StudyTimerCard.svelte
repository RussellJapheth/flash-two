<script lang="ts">
	import { Clock, Timer, Pause, Play, Square } from 'lucide-svelte';
	import {
		startStudyTimer,
		pauseStudyTimer,
		resumeStudyTimer,
		stopStudyTimer,
		formatStudyDuration,
		formatTimerDisplay
	} from '$lib/utils/studyTimer';
	import type { ActiveStudyTimerState, StudyTimeData } from '$lib/types';

	interface Props {
		activeTimer: ActiveStudyTimerState;
		todayStudySeconds: number;
		effectiveTotalStudySeconds: number;
		studyTimeStats: StudyTimeData;
	}

	let { activeTimer, todayStudySeconds, effectiveTotalStudySeconds, studyTimeStats }: Props =
		$props();
</script>

<section
	class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 transition-all hover:border-emerald-200"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600"
			>
				<Clock size={22} strokeWidth={2.25} />
			</div>
			<div>
				<h3 class="font-headline text-sm font-bold text-slate-900">Study Session Timer</h3>
				<p class="font-sans text-xs text-slate-500">Track exact time spent studying</p>
			</div>
		</div>

		{#if activeTimer.status !== 'idle'}
			<span
				class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-headline text-[11px] font-bold {activeTimer.status ===
				'running'
					? 'animate-pulse border border-emerald-200 bg-emerald-50 text-emerald-700'
					: 'border border-amber-200 bg-amber-50 text-amber-700'}"
			>
				<span
					class="h-1.5 w-1.5 rounded-full {activeTimer.status === 'running'
						? 'bg-emerald-500'
						: 'bg-amber-500'}"
				></span>
				{formatTimerDisplay(activeTimer.elapsedSeconds)}
			</span>
		{/if}
	</div>

	<!-- Main Timer Control CTA & Stats -->
	<div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="font-headline text-[11px] font-bold tracking-wider text-slate-400 uppercase">
					Today's Total
				</p>
				<p class="font-headline text-2xl font-black text-slate-900">
					{formatStudyDuration(todayStudySeconds)}
				</p>
			</div>

			{#if activeTimer.status === 'idle'}
				<button
					type="button"
					onclick={() => startStudyTimer()}
					class="flex cursor-pointer items-center gap-2 rounded-2xl border border-indigo-200/80 bg-indigo-600 px-4 py-2.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
				>
					<Timer size={16} strokeWidth={2.25} />
					<span>Start Timer</span>
				</button>
			{:else}
				<div class="flex items-center gap-2">
					{#if activeTimer.status === 'running'}
						<button
							type="button"
							onclick={() => pauseStudyTimer()}
							title="Pause timer"
							aria-label="Pause study timer"
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-slate-200 text-slate-800 transition-colors hover:bg-slate-300 active:scale-90"
						>
							<Pause size={16} strokeWidth={2.5} />
						</button>
					{:else}
						<button
							type="button"
							onclick={() => resumeStudyTimer()}
							title="Resume timer"
							aria-label="Resume study timer"
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 text-white transition-colors hover:bg-emerald-700 active:scale-90"
						>
							<Play size={16} strokeWidth={2.5} class="ml-0.5" />
						</button>
					{/if}
					<button
						type="button"
						onclick={() => stopStudyTimer()}
						title="Stop and save session"
						aria-label="Stop study timer"
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-rose-100 text-rose-700 transition-colors hover:bg-rose-200 active:scale-90"
					>
						<Square size={15} strokeWidth={2.5} />
					</button>
				</div>
			{/if}
		</div>

		<div
			class="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs text-slate-500"
		>
			<span>
				Lifetime: <strong class="font-semibold text-slate-700"
					>{formatStudyDuration(effectiveTotalStudySeconds)}</strong
				>
			</span>
			<span>
				Completed: <strong class="font-semibold text-slate-700"
					>{studyTimeStats.sessionsCount}</strong
				>
				{studyTimeStats.sessionsCount === 1 ? 'session' : 'sessions'}
			</span>
		</div>
	</div>
</section>
