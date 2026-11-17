<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { Plus, Pencil, Play } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '@flash/shared';
	import { MY_WORDS_DECK_ID, filterWordsByCategory, getMyWordsCategoryRows } from '@flash/shared';
	import { getMyWordsDeck } from '$lib/storage';
	import WordFormModal from './WordFormModal.svelte';

	interface Props {
		category?: string;
	}

	let { category = '' }: Props = $props();

	let myWords = $state<WordRecord[]>([]);
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
			const deck = await getMyWordsDeck();
			myWords = deck.words ?? [];
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

	function handleDeckChanged(deck: CustomDeck) {
		myWords = deck.words;
	}

	onMount(() => {
		load();
	});
</script>

<div class="space-y-4">
	<!-- Add Word Button -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="font-headline text-lg font-bold text-slate-900">
				{isSubcategoryPage ? activeCategory : 'My Words'}
			</h2>
			<p class="font-sans text-xs text-slate-500">
				{isSubcategoryPage
					? `${subcategoryWords.length} ${subcategoryWords.length === 1 ? 'word' : 'words'}`
					: `${myWords.length} total saved ${myWords.length === 1 ? 'word' : 'words'}`}
			</p>
		</div>

		<button
			type="button"
			onclick={openAdd}
			class="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
		>
			<Plus size={18} strokeWidth={2.5} />
			<span>Add Word</span>
		</button>
	</div>

	{#if status === 'loading'}
		<div class="space-y-2 py-4">
			{#each [1, 2, 3] as _ (_)}
				<div class="h-16 animate-pulse rounded-2xl bg-slate-100"></div>
			{/each}
		</div>
	{:else if status === 'error'}
		<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
			<p class="font-sans text-sm text-rose-700">{loadError}</p>
			<button
				type="button"
				onclick={load}
				class="mt-2 font-headline text-xs font-bold text-rose-800 underline"
			>
				Try again
			</button>
		</div>
	{:else if isSubcategoryPage}
		<!-- SUBCATEGORY VIEW -->
		{#if subcategoryWords.length === 0}
			<div class="rounded-3xl border border-slate-200/90 bg-white p-8 text-center">
				<p class="font-sans text-sm text-slate-500">No words in this category yet.</p>
				<button
					type="button"
					onclick={openAdd}
					class="mt-3 inline-flex items-center gap-1 font-headline text-sm font-bold text-indigo-600 hover:underline"
				>
					<Plus size={16} />
					<span>Add your first word</span>
				</button>
			</div>
		{:else}
			<div class="space-y-2">
				{#each subcategoryWords as word (word.No)}
					<div
						class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
					>
						<div class="space-y-0.5">
							<div class="flex items-baseline gap-2">
								<span class="font-headline text-lg font-bold text-slate-900">
									{word['Chinese Word']}
								</span>
								<span class="font-sans text-xs text-indigo-600">{word.Pinyin}</span>
							</div>
							<p class="font-sans text-sm text-slate-600">{word['English Meaning']}</p>
							{#if word['Example (Chinese + Pinyin)']}
								<p class="font-sans text-xs text-slate-400 italic">
									{word['Example (Chinese + Pinyin)']}
								</p>
							{/if}
						</div>
						<button
							type="button"
							onclick={() => openEdit(word)}
							aria-label={`Edit ${word['Chinese Word']}`}
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
						>
							<Pencil size={16} />
						</button>
					</div>
				{/each}
			</div>

			<!-- Practice Button -->
			<div class="pt-2">
				<a
					href={resolve(
						`/study/${MY_WORDS_DECK_ID}?category=${encodeURIComponent(activeCategory)}` as '/study/[id]',
						{ id: MY_WORDS_DECK_ID }
					)}
					class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-98"
				>
					<Play size={18} fill="currentColor" />
					<span>Practice This Category</span>
				</a>
			</div>
		{/if}
	{:else}
		<!-- TOP-LEVEL CATEGORIES LIST -->
		<div class="space-y-2">
			{#each categoryRows as row (row.name)}
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-colors hover:border-indigo-200"
				>
					<a
						href={row.isAll
							? resolve('/study/[id]', { id: MY_WORDS_DECK_ID })
							: resolve(`/?category=${encodeURIComponent(row.name)}` as '/')}
						class="flex-1"
					>
						<div class="flex items-center justify-between pr-4">
							<div>
								<span class="font-headline text-base font-bold text-slate-900">{row.name}</span>
								<p class="font-sans text-xs text-slate-500">
									{row.count}
									{row.count === 1 ? 'word' : 'words'}
								</p>
							</div>
							<span class="font-headline text-xs font-semibold text-indigo-600">
								{row.isAll ? 'Practice All' : 'View'}
							</span>
						</div>
					</a>

					{#if row.isAll && row.count > 0}
						<a
							href={resolve('/study/[id]', { id: MY_WORDS_DECK_ID })}
							aria-label="Practice All Words"
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
						>
							<Play size={16} fill="currentColor" />
						</a>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<WordFormModal
	bind:open={modalOpen}
	word={editingWord}
	existingWords={myWords}
	defaultCategory={activeCategory}
	onChanged={handleDeckChanged}
/>
