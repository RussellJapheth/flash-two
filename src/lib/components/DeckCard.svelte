<script lang="ts">
	import type { DeckSummary } from '$lib/types';
	import { resolve } from '$app/paths';
	import { Play, Sparkles } from 'lucide-svelte';

	let { deck, onSelect = () => {} } = $props<{
		deck: DeckSummary;
		onSelect?: (deck: DeckSummary) => void;
	}>();

	let progressPercent = $derived(
		deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0
	);

	let isFrench = $derived(deck.language === 'french');
</script>

<a
	href={resolve(`/deck/${deck.id}/preview`)}
	onclick={() => onSelect(deck)}
	class="group shadow-card hover:shadow-card-hover relative flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 active:scale-[0.99]"
>
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-3">
			<!-- Language / Pack Icon Avatar -->
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-headline text-xs font-bold transition-transform group-hover:scale-105 {isFrench
					? 'border border-amber-200/60 bg-amber-50 text-amber-700'
					: deck.isCustom
						? 'border border-violet-200/60 bg-violet-50 text-violet-700'
						: 'border border-indigo-200/60 bg-indigo-50 text-indigo-700'}"
			>
				{#if deck.isCustom}
					<Sparkles size={16} strokeWidth={2.25} />
				{:else if isFrench}
					<span>FR</span>
				{:else}
					<span>ZH</span>
				{/if}
			</div>

			<!-- Title and Metadata -->
			<div class="min-w-0">
				<h3
					class="truncate font-headline text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600"
				>
					{deck.title}
				</h3>
				<div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
					<span>{deck.totalCards} words</span>
					<span>•</span>
					<span>{deck.masteredCards} mastered</span>
					{#if deck.accuracy > 0}
						<span>•</span>
						<span class="font-semibold text-emerald-600">{deck.accuracy}% acc</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Action & Due Badges -->
		<div class="flex shrink-0 items-center gap-2">
			{#if deck.dueCards > 0}
				<span
					class="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-rose-600"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500"></span>
					{deck.dueCards} due
				</span>
			{/if}

			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
			>
				<Play size={14} strokeWidth={2.5} class="translate-x-0.5 fill-current" />
			</div>
		</div>
	</div>

	<!-- Integrated Micro Progress Track -->
	<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
		<div
			class="h-full rounded-full bg-emerald-500 transition-all duration-500"
			style="width: {progressPercent}%"
		></div>
	</div>
</a>
