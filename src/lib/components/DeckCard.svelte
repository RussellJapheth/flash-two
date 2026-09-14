<script lang="ts">
	import type { DeckSummary } from '$lib/types';
	import { resolve } from '$app/paths';
	import { recordRecentlyOpenedPack } from '$lib/utils/storage';
	import { getDeckIcon } from '$lib/utils/deckIcons';
	import { Play, Pencil, Trash2 } from 'lucide-svelte';

	let {
		deck,
		onSelect = () => {},
		onEdit,
		onDelete
	} = $props<{
		deck: DeckSummary;
		onSelect?: (deck: DeckSummary) => void;
		onEdit?: (deck: DeckSummary) => void;
		onDelete?: (deck: DeckSummary) => void;
	}>();

	let progressPercent = $derived(
		deck.totalCards > 0 ? Math.round((deck.masteredCards / deck.totalCards) * 100) : 0
	);

	let deckIcon = $derived(getDeckIcon(deck.id, deck.language));

	function handleClick() {
		recordRecentlyOpenedPack(deck.id);
		onSelect(deck);
	}
</script>

<a
	href={resolve(`/deck/${deck.id}/preview`)}
	onclick={handleClick}
	class="group shadow-card hover:shadow-card-hover relative flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 active:scale-[0.99]"
>
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-3">
			<!-- Topic-Appropriate Image Icon -->
			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50 shadow-xs transition-transform duration-200 group-hover:scale-105"
			>
				<img
					src={deckIcon.imageSrc}
					alt={deckIcon.alt}
					class="h-full w-full object-cover"
					loading="lazy"
				/>
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
		<div class="flex shrink-0 items-center gap-1.5">
			{#if deck.dueCards > 0}
				<span
					class="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-rose-600"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500"></span>
					{deck.dueCards} due
				</span>
			{/if}

			{#if deck.isCustom && onEdit}
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onEdit(deck);
					}}
					title="Edit custom deck"
					aria-label="Edit {deck.title}"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
				>
					<Pencil size={15} strokeWidth={2} />
				</button>
			{/if}

			{#if deck.isCustom && onDelete}
				<button
					type="button"
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onDelete(deck);
					}}
					title="Delete custom deck"
					aria-label="Delete {deck.title}"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
				>
					<Trash2 size={15} strokeWidth={2} />
				</button>
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
