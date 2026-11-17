<script lang="ts">
	import { ShieldCheck, History, Clock, Trophy } from 'lucide-svelte';
	import { formatStudyDuration } from '$lib/utils/studyTimer';
	import type { StreakStats, StudyTimeData } from '$lib/types';

	interface Props {
		overallAccuracy: number;
		streakStats: StreakStats;
		effectiveTotalStudySeconds: number;
		studyTimeStats: StudyTimeData;
		masteredWordsCount: number;
		masteredPercent: number;
	}

	let {
		overallAccuracy,
		streakStats,
		effectiveTotalStudySeconds,
		studyTimeStats,
		masteredWordsCount,
		masteredPercent
	}: Props = $props();
</script>

<section class="grid grid-cols-2 gap-3">
	<!-- Accuracy Card -->
	<div
		class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600"
		>
			<ShieldCheck size={18} strokeWidth={2} />
		</div>
		<div>
			<p class="font-headline text-[11px] font-bold text-slate-500">Recall Accuracy</p>
			<p class="font-headline text-xl font-extrabold text-slate-900">{overallAccuracy}%</p>
			<p class="font-sans text-[10px] text-slate-400">Across all drills</p>
		</div>
	</div>

	<!-- Reviews Done Card -->
	<div
		class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-600"
		>
			<History size={18} strokeWidth={2} />
		</div>
		<div>
			<p class="font-headline text-[11px] font-bold text-slate-500">Total Reviews</p>
			<p class="font-headline text-xl font-extrabold text-slate-900">
				{streakStats.totalReviews}
			</p>
			<p class="font-sans text-[10px] text-slate-400">Cards evaluated</p>
		</div>
	</div>

	<!-- Total Study Time Summary Card -->
	<div
		class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600"
		>
			<Clock size={18} strokeWidth={2} />
		</div>
		<div>
			<p class="font-headline text-[11px] font-bold text-slate-500">Study Time</p>
			<p class="font-headline text-xl font-extrabold text-slate-900">
				{formatStudyDuration(effectiveTotalStudySeconds)}
			</p>
			<p class="font-sans text-[10px] text-slate-400">
				{studyTimeStats.sessionsCount} completed sessions
			</p>
		</div>
	</div>

	<!-- Mastered Words Count Card -->
	<div
		class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600"
		>
			<Trophy size={18} strokeWidth={2} />
		</div>
		<div>
			<p class="font-headline text-[11px] font-bold text-slate-500">Mastered Words</p>
			<p class="font-headline text-xl font-extrabold text-slate-900">
				{masteredWordsCount.toLocaleString()}
			</p>
			<p class="font-sans text-[10px] text-slate-400">{masteredPercent}% of library</p>
		</div>
	</div>
</section>
