<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { Plus, Pencil, Play, ChevronDown } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '$lib/types';
	import { getAllCustomDecks, getBuiltinPacks, isDeckArchived } from '$lib/utils/storage';
	import { MY_WORDS_DECK_ID } from '$lib/utils/myWords';
	import { filterLiteDecks } from '$lib/utils/liteMode';
	import { subscribeDataChanged } from '$lib/utils/cloud';
	import WordFormModal from './WordFormModal.svelte';

	interface LiteDeckRow {
		id: string;
		title: string;
		language?: 'chinese' | 'french';
		isArchived: boolean;
	}

	let myWords = $state<WordRecord[]>([]);
	let moreDecks = $state<LiteDeckRow[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let loadError = $state('');

	let modalOpen = $state(false);
	let editingWord = $state<WordRecord | null>(null);

	let wordCountLabel = $derived(myWords.length === 1 ? '1 word' : `${myWords.length} words`);

	async function load() {
		loadError = '';
		try {
			const [customDecks, chinesePacks] = await Promise.all([
				getAllCustomDecks(),
				getBuiltinPacks('chinese')
			]);
			myWords = customDecks.find((d) => d.id === MY_WORDS_DECK_ID)?.words ?? [];
			const rows: LiteDeckRow[] = [
				...chinesePacks.map((p) => ({
					id: p.id,
					title: p.title,
					language: 'chinese' as const,
					isArchived: isDeckArchived(p.id)
				})),
				...customDecks.map((d) => ({
					id: d.id,
					title: d.name,
					language: d.language,
					isArchived: Boolean(d.isArchived) || isDeckArchived(d.id)
				}))
			];
			moreDecks = filterLiteDecks(rows);
			status = 'ready';
		} catch (e: unknown) {
			loadError = e instanceof Error ? e.message : 'Your words could not be loaded.';
			status = 'error';
		}
	}

	function openAdd() {
		editingWord = null;
		modalOpen = true;
	}

	function openEdit(word: WordRecord) {
		editingWord = word;
		modalOpen = true;
	}

	function handleChanged(deck: CustomDeck) {
		myWords = deck.words;
	}

	onMount(() => {
		load();
		return subscribeDataChanged(load);
	});
</script>

<div class="space-y-6">
	{#if status === 'loading'}
		<p class="py-10 text-center font-sans text-base text-slate-600" aria-live="polite">
			Loading your words…
		</p>
	{:else if status === 'error'}
		<div
			class="space-y-3 rounded-3xl border border-rose-100 bg-rose-50 p-5 text-center"
			role="alert"
		>
			<p class="font-headline text-base font-bold text-rose-600">Something went wrong</p>
			<p class="font-sans text-base text-slate-600">{loadError}</p>
			<button
				type="button"
				onclick={load}
				class="h-12 w-full cursor-pointer rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white hover:bg-indigo-700"
			>
				Try again
			</button>
		</div>
	{:else}
		<!-- My Words -->
		<section aria-labelledby="my-words-heading" class="space-y-4">
			<!-- Page header already shows "My Words"; keep the heading for screen readers only -->
			<h2 id="my-words-heading" class="sr-only">My Words</h2>
			<p class="font-sans text-base text-slate-600">{wordCountLabel} saved</p>

			<button
				type="button"
				onclick={openAdd}
				class="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-lg font-bold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 active:scale-[0.98]"
			>
				<Plus size={22} strokeWidth={2.5} aria-hidden="true" />
				Add Word
			</button>

			{#if myWords.length > 0}
				<a
					href={resolve('/study/[id]', { id: MY_WORDS_DECK_ID })}
					class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-headline text-base font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
				>
					<Play size={18} strokeWidth={2.5} aria-hidden="true" />
					Practice My Words
				</a>

				<ul class="space-y-3">
					{#each myWords as w (w.No)}
						<li
							class="shadow-card flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4"
						>
							<div class="min-w-0 flex-1">
								<p class="font-hanzi text-2xl font-bold text-slate-900" lang="zh">
									{w['Chinese Word']}
								</p>
								<p class="font-sans text-base text-slate-600">{w.Pinyin}</p>
								<p class="font-sans text-base text-slate-900">{w['English Meaning']}</p>
							</div>
							<button
								type="button"
								onclick={() => openEdit(w)}
								aria-label="Edit {w['Chinese Word']}"
								class="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
							>
								<Pencil size={18} strokeWidth={2} aria-hidden="true" />
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="shadow-card rounded-3xl border border-slate-200/90 bg-white p-5 text-center">
					<p class="font-sans text-base text-slate-600">
						No words yet. Tap <strong class="text-slate-900">Add Word</strong> to save your first word.
					</p>
				</div>
			{/if}
		</section>

		<!-- More Decks (collapsed) -->
		{#if moreDecks.length > 0}
			<details class="group shadow-card rounded-3xl border border-slate-200/90 bg-white">
				<summary
					class="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 font-headline text-base font-bold text-slate-900 [&::-webkit-details-marker]:hidden"
				>
					More Decks
					<ChevronDown
						size={20}
						aria-hidden="true"
						class="text-slate-600 transition-transform group-open:rotate-180"
					/>
				</summary>
				<ul class="divide-y divide-slate-100 border-t border-slate-100">
					{#each moreDecks as deck (deck.id)}
						<li class="flex items-center gap-3 px-5 py-3">
							<span class="min-w-0 flex-1 truncate font-sans text-base text-slate-900">
								{deck.title}
							</span>
							<a
								href={resolve('/study/[id]', { id: deck.id })}
								aria-label="Play {deck.title}"
								class="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-4 font-headline text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
							>
								<Play size={16} strokeWidth={2.5} aria-hidden="true" />
								Play
							</a>
						</li>
					{/each}
				</ul>
			</details>
		{/if}
	{/if}
</div>

<WordFormModal
	bind:open={modalOpen}
	word={editingWord}
	existingWords={myWords}
	onChanged={handleChanged}
/>
