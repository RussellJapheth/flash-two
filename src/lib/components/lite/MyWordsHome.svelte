<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { Plus, Pencil, Play, ChevronDown } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '$lib/types';
	import { getAllCustomDecks, getBuiltinPacks, isDeckArchived } from '$lib/utils/storage';
	import {
		ALL_WORDS_CATEGORY,
		MY_WORDS_DECK_ID,
		filterWordsByCategory,
		getMyWordsCategoryRows
	} from '$lib/utils/myWords';
	import { filterLiteDecks } from '$lib/utils/liteMode';
	import { subscribeDataChanged } from '$lib/utils/cloud';
	import WordFormModal from './WordFormModal.svelte';

	interface Props {
		category?: string;
	}

	let { category = '' }: Props = $props();

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

	let activeCategory = $derived(category.trim());
	let isSubcategoryPage = $derived(activeCategory.length > 0);
	let categoryRows = $derived(getMyWordsCategoryRows(myWords));
	let subcategoryWords = $derived(filterWordsByCategory(myWords, activeCategory));

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
	{:else if isSubcategoryPage}
		<!-- Subcategory Sub-Page View -->
		<section aria-labelledby="subcategory-heading" class="space-y-4">
			<h2 id="subcategory-heading" class="sr-only">{activeCategory}</h2>

			<div class="mt-3 flex flex-row gap-3">
				<button
					type="button"
					onclick={openAdd}
					class="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-lg font-bold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 active:scale-[0.98]"
				>
					<Plus size={22} strokeWidth={2.5} aria-hidden="true" />
					Add Word
				</button>
				{#if subcategoryWords.length > 0}
					<a
						href={activeCategory.toLowerCase() === ALL_WORDS_CATEGORY.toLowerCase()
							? resolve('/study/[id]', { id: MY_WORDS_DECK_ID })
							: resolve(
									`/study/${MY_WORDS_DECK_ID}?category=${encodeURIComponent(activeCategory)}`
								)}
						class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-headline text-base font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
					>
						<Play size={18} strokeWidth={2.5} aria-hidden="true" />
						Practice
					</a>
				{/if}
			</div>

			<h2 class="mt-6 border-b-2 border-indigo-200 pb-2 text-lg font-normal">
				{activeCategory}
			</h2>

			{#if subcategoryWords.length > 0}
				<ul
					class="shadow-card divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
				>
					{#each subcategoryWords as w (w.No)}
						<li class="flex items-center gap-2 px-4 py-2">
							<div class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
								<span class="font-hanzi text-lg font-bold text-slate-900" lang="zh">
									{w['Chinese Word']}
								</span>
								<span class="font-sans text-sm text-slate-600">{w.Pinyin}</span>
								<span class="font-sans text-sm text-slate-600" aria-hidden="true">·</span>
								<span class="truncate font-sans text-sm text-slate-900">
									{w['English Meaning']}
								</span>
							</div>
							<button
								type="button"
								onclick={() => openEdit(w)}
								aria-label="Edit {w['Chinese Word']}"
								class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
							>
								<Pencil size={16} strokeWidth={2} aria-hidden="true" />
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="shadow-card rounded-3xl border border-slate-200/90 bg-white p-5 text-center">
					<p class="font-sans text-base text-slate-600">
						No words in <strong class="text-slate-900">{activeCategory}</strong> yet. Tap
						<strong class="text-slate-900">Add Word</strong> to add one.
					</p>
				</div>
			{/if}
		</section>
	{:else}
		<!-- My Words Subcategories Listing -->
		<section aria-labelledby="my-words-heading" class="space-y-4">
			<!-- Page header already shows "My Words"; keep the heading for screen readers only -->
			<h2 id="my-words-heading" class="sr-only">My Words</h2>

			<div class="mt-3 flex flex-row gap-3">
				<button
					type="button"
					onclick={openAdd}
					class="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-lg font-bold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 active:scale-[0.98]"
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
				{/if}
			</div>
			<h2 class="mt-6 border-b-2 border-indigo-200 pb-2 text-lg font-normal">My Words</h2>
			<ul
				class="shadow-card divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/90 bg-white"
			>
				{#each categoryRows as row (row.name)}
					<li>
						<a
							href="{resolve('/decks')}?category={encodeURIComponent(row.name)}"
							aria-label="Open {row.name}"
							class="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
						>
							<div class="min-w-0 flex-1">
								<span class="block truncate font-sans text-base text-slate-900">
									{row.name}
								</span>
								<span class="block font-sans text-xs text-slate-500">
									{row.count === 1 ? '1 word' : `${row.count} words`}
								</span>
							</div>
							<span
								class="inline-flex h-11 shrink-0 items-center rounded-full bg-indigo-50 px-4 font-headline text-sm font-bold text-indigo-600 transition-colors group-hover:bg-indigo-100"
							>
								Open
							</span>
						</a>
					</li>
				{/each}
			</ul>
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
	defaultCategory={activeCategory}
	onChanged={handleChanged}
/>
