<script lang="ts">
	import type { DeckSummary } from '$lib/types';
	import ProgressBar from './ProgressBar.svelte';
	import { Play } from 'lucide-svelte';

	let { deck, onSelect = () => {} } = $props<{
		deck: DeckSummary;
		onSelect?: (deck: DeckSummary) => void;
	}>();

	let progressPercent = $derived(
		deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0
	);
</script>

<div
	class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<span
				class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-headline text-[11px] font-bold uppercase tracking-wider {deck.language ===
				'french'
					? 'bg-secondary-fixed text-on-secondary-fixed'
					: 'bg-primary-fixed text-primary'}"
			>
				{deck.language}
				{#if deck.isCustom}
					• Custom
				{/if}
			</span>

			{#if deck.dueCards > 0}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 font-headline text-[11px] font-bold text-on-error-container"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-error"></span>
					{deck.dueCards} due
				</span>
			{/if}
		</div>

		<h3 class="font-headline text-base font-bold text-on-surface">
			{deck.title}
		</h3>

		<div class="mt-1 flex items-center gap-3 text-xs text-on-surface-variant">
			<span>{deck.totalCards} cards</span>
			<span>•</span>
			<span>{deck.masteredCards} mastered</span>
			{#if deck.accuracy > 0}
				<span>•</span>
				<span class="font-semibold text-tertiary-container">{deck.accuracy}% acc</span>
			{/if}
		</div>
	</div>

	<div class="mt-4 flex items-center gap-3">
		<div class="flex-1">
			<ProgressBar value={deck.masteredCards} max={deck.totalCards} variant="emerald" height="h-2" />
		</div>
		<a
			href="/deck/{deck.id}/preview"
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary transition-transform hover:bg-primary active:scale-95"
			aria-label="Start studying {deck.title}"
		>
			<Play size={18} strokeWidth={2} />
		</a>
	</div>
</div>
