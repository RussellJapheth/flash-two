<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		totalWordsCount: number;
		masteredWordsCount: number;
		learningWordsCount: number;
		dueWordsCount: number;
	}

	let { totalWordsCount, masteredWordsCount, learningWordsCount, dueWordsCount }: Props = $props();

	let unstartedWordsCount = $derived(
		Math.max(0, totalWordsCount - masteredWordsCount - learningWordsCount)
	);

	let masteredPercent = $derived(
		totalWordsCount > 0 ? Math.round((masteredWordsCount / totalWordsCount) * 100) : 0
	);

	let learningPercent = $derived(
		totalWordsCount > 0 ? Math.round((learningWordsCount / totalWordsCount) * 100) : 0
	);

	let unstartedPercent = $derived(
		totalWordsCount > 0 ? Math.max(0, 100 - masteredPercent - learningPercent) : 0
	);

	const CIRCLE_RADIUS = 38;
	const CIRCUMFERENCE = +(2 * Math.PI * CIRCLE_RADIUS).toFixed(2);

	let masteredDash = $derived(
		totalWordsCount > 0 ? +((masteredWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);

	let learningDash = $derived(
		totalWordsCount > 0 ? +((learningWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);

	let unstartedDash = $derived(
		totalWordsCount > 0 ? +((unstartedWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);
</script>

<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
	<div class="flex items-center justify-between">
		<div>
			<h3 class="font-headline text-sm font-bold text-slate-900">Retention Breakdown</h3>
			<p class="font-sans text-xs text-slate-500">Mastery & retention by word stage</p>
		</div>
		<span
			class="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-headline text-[11px] font-bold text-slate-600"
		>
			{totalWordsCount.toLocaleString()} total words
		</span>
	</div>

	<div class="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
		<!-- Donut Chart -->
		<div class="relative flex h-36 w-36 shrink-0 items-center justify-center">
			<svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
				<circle
					cx="50"
					cy="50"
					r={CIRCLE_RADIUS}
					fill="transparent"
					stroke="#F1F5F9"
					stroke-width="12"
				/>

				{#if unstartedWordsCount > 0 && totalWordsCount > 0}
					<circle
						cx="50"
						cy="50"
						r={CIRCLE_RADIUS}
						fill="transparent"
						stroke="#CBD5E1"
						stroke-width="12"
						stroke-dasharray="{unstartedDash} {CIRCUMFERENCE - unstartedDash}"
						stroke-dashoffset="-{masteredDash + learningDash}"
						class="transition-all duration-500 ease-out"
					/>
				{/if}

				{#if learningWordsCount > 0 && totalWordsCount > 0}
					<circle
						cx="50"
						cy="50"
						r={CIRCLE_RADIUS}
						fill="transparent"
						stroke="#F59E0B"
						stroke-width="12"
						stroke-dasharray="{learningDash} {CIRCUMFERENCE - learningDash}"
						stroke-dashoffset="-{masteredDash}"
						class="transition-all duration-500 ease-out"
					/>
				{/if}

				{#if masteredWordsCount > 0 && totalWordsCount > 0}
					<circle
						cx="50"
						cy="50"
						r={CIRCLE_RADIUS}
						fill="transparent"
						stroke="#10B981"
						stroke-width="12"
						stroke-dasharray="{masteredDash} {CIRCUMFERENCE - masteredDash}"
						stroke-dashoffset="0"
						class="transition-all duration-500 ease-out"
					/>
				{/if}
			</svg>

			<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
				<span class="font-headline text-2xl leading-none font-black text-slate-900">
					{masteredPercent}%
				</span>
				<span
					class="mt-1 font-headline text-[10px] font-bold tracking-wider text-slate-400 uppercase"
				>
					Mastered
				</span>
			</div>
		</div>

		<!-- Breakdown Legend -->
		<div class="w-full flex-1 space-y-2">
			<!-- Mastered -->
			<div
				class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
			>
				<div class="flex items-center gap-2.5">
					<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"></span>
					<div>
						<p class="font-headline text-xs leading-tight font-bold text-slate-900">Mastered</p>
						<p class="font-sans text-[10px] text-slate-400">Interval &ge; 7 days</p>
					</div>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="font-headline text-xs font-black text-slate-900">
						{masteredWordsCount.toLocaleString()}
					</span>
					<span
						class="rounded-md border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-emerald-700"
					>
						{masteredPercent}%
					</span>
				</div>
			</div>

			<!-- Learning -->
			<div
				class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
			>
				<div class="flex items-center gap-2.5">
					<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"></span>
					<div>
						<p class="font-headline text-xs leading-tight font-bold text-slate-900">Learning</p>
						<p class="font-sans text-[10px] text-slate-400">Active SRS reviews</p>
					</div>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="font-headline text-xs font-black text-slate-900">
						{learningWordsCount.toLocaleString()}
					</span>
					<span
						class="rounded-md border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-amber-700"
					>
						{learningPercent}%
					</span>
				</div>
			</div>

			<!-- Unstarted -->
			<div
				class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
			>
				<div class="flex items-center gap-2.5">
					<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300"></span>
					<div>
						<p class="font-headline text-xs leading-tight font-bold text-slate-900">Unstarted</p>
						<p class="font-sans text-[10px] text-slate-400">Ready in library</p>
					</div>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="font-headline text-xs font-black text-slate-900">
						{unstartedWordsCount.toLocaleString()}
					</span>
					<span
						class="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-headline text-[10px] font-bold text-slate-600"
					>
						{unstartedPercent}%
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Due Alert -->
	{#if dueWordsCount > 0}
		<div
			class="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5"
		>
			<div class="flex items-center gap-2">
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
				</span>
				<span class="font-headline text-xs font-bold text-indigo-950">
					{dueWordsCount}
					{dueWordsCount === 1 ? 'word' : 'words'} scheduled for review
				</span>
			</div>
			<a
				href={resolve('/review')}
				class="font-headline text-xs font-bold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
			>
				Review &rarr;
			</a>
		</div>
	{/if}
</section>
