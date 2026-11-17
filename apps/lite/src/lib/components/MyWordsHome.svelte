<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { Plus, Pencil, Play, Volume2, ChevronRight } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '@flash/shared';
	import { MY_WORDS_DECK_ID, filterWordsByCategory, ALL_WEEKS_LABEL } from '@flash/shared';
	import { getMyWordsDeck } from '$lib/storage';
	import { speakWord } from '$lib/audio';
	import { getUnlockedWeeks, getCurrentWeekLabel, unlockNextWeek } from '$lib/weeks';
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
	let isSubcategoryPage = $derived(
		activeCategory.length > 0 && activeCategory.toLowerCase() !== ALL_WEEKS_LABEL.toLowerCase()
	);

	let currentWeekLabel = $derived(getCurrentWeekLabel());
	let unlockedWeeks = $derived(getUnlockedWeeks(myWords));
	let subcategoryWords = $derived(filterWordsByCategory(myWords, activeCategory));

	function getWeekWordCount(weekName: string): number {
		return filterWordsByCategory(myWords, weekName).length;
	}

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

	function handleUnlockNextWeek() {
		unlockNextWeek(myWords);
		// Force reactive update
		myWords = [...myWords];
	}

	function handleSpeak(word: string) {
		if (word) {
			speakWord(word, 'chinese');
		}
	}

	onMount(() => {
		load();
	});
</script>

<div class="space-y-4">
	<!-- Top Bar / Action Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="font-headline text-xl font-extrabold tracking-tight text-slate-900">
				{isSubcategoryPage ? activeCategory : 'All Weeks'}
			</h2>
			<p class="font-sans text-xs text-slate-500">
				{#if isSubcategoryPage}
					{subcategoryWords.length} {subcategoryWords.length === 1 ? 'word' : 'words'}
				{:else}
					{myWords.length} total {myWords.length === 1 ? 'word' : 'words'} across {unlockedWeeks.length}
					{unlockedWeeks.length === 1 ? 'week' : 'weeks'}
				{/if}
			</p>
		</div>

		<button
			type="button"
			onclick={openAdd}
			class="inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
		>
			<Plus size={20} strokeWidth={2.5} />
			<span>Add Words</span>
		</button>
	</div>

	{#if status === 'loading'}
		<div class="space-y-3 py-4">
			{#each [1, 2, 3] as _ (_)}
				<div class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
			{/each}
		</div>
	{:else if status === 'error'}
		<div class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
			<p class="font-sans text-sm font-semibold text-rose-700">{loadError}</p>
			<button
				type="button"
				onclick={load}
				class="mt-3 font-headline text-xs font-bold text-rose-800 underline"
			>
				Try again
			</button>
		</div>
	{:else if isSubcategoryPage}
		<!-- DEDICATED WEEK VIEW -->
		{#if subcategoryWords.length === 0}
			<div class="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-xs">
				<p class="font-headline text-base font-bold text-slate-800">
					No words in {activeCategory} yet.
				</p>
				<p class="mt-1 font-sans text-xs text-slate-500">
					Add single words or paste a list — pinyin and examples will be generated automatically.
				</p>
				<button
					type="button"
					onclick={openAdd}
					class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
				>
					<Plus size={18} strokeWidth={2.5} />
					<span>Add Words to {activeCategory}</span>
				</button>
			</div>
		{:else}
			<!-- Practice Button for this Week -->
			<div>
				<a
					href={resolve(
						`/study/${MY_WORDS_DECK_ID}?category=${encodeURIComponent(activeCategory)}` as '/study/[id]',
						{ id: MY_WORDS_DECK_ID }
					)}
					class="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-98"
				>
					<Play size={20} fill="currentColor" />
					<span>Practice {activeCategory} ({subcategoryWords.length})</span>
				</a>
			</div>

			<!-- Word Cards List -->
			<div class="space-y-2.5 pt-1">
				{#each subcategoryWords as word (word.No)}
					<div
						class="flex items-start justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
					>
						<div class="space-y-1 pr-3">
							<div class="flex items-baseline gap-2.5">
								<span class="font-headline text-2xl font-extrabold text-slate-900">
									{word['Chinese Word']}
								</span>
								<span class="font-sans text-sm font-bold text-indigo-600">{word.Pinyin}</span>
							</div>
							<p class="font-sans text-sm font-semibold text-slate-700">
								{word['English Meaning']}
							</p>
							{#if word['Example (Chinese + Pinyin)']}
								<p class="font-sans text-xs leading-relaxed text-slate-500 italic">
									{word['Example (Chinese + Pinyin)']}
								</p>
							{/if}
						</div>

						<div class="flex items-center gap-1">
							<button
								type="button"
								onclick={() => handleSpeak(word['Chinese Word'] || '')}
								aria-label={`Pronounce ${word['Chinese Word']}`}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
							>
								<Volume2 size={18} />
							</button>

							<button
								type="button"
								onclick={() => openEdit(word)}
								aria-label={`Edit ${word['Chinese Word']}`}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
							>
								<Pencil size={18} />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<!-- TOP-LEVEL ALL WEEKS OVERVIEW -->
		<div class="space-y-3">
			<!-- ALL WEEKS MASTER CARD -->
			<div
				class="rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 via-white to-indigo-50/30 p-5 shadow-xs"
			>
				<div class="flex items-center justify-between">
					<div>
						<h3 class="font-headline text-lg font-extrabold text-slate-900">All Weeks</h3>
						<p class="font-sans text-xs text-slate-500">
							{myWords.length}
							{myWords.length === 1 ? 'word' : 'words'} saved across all weeks
						</p>
					</div>

					{#if myWords.length > 0}
						<a
							href={resolve('/study/[id]', { id: MY_WORDS_DECK_ID })}
							class="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95"
						>
							<Play size={16} fill="currentColor" />
							<span>Practice All</span>
						</a>
					{/if}
				</div>
			</div>

			<!-- WEEKS LIST -->
			<div class="space-y-2">
				{#each unlockedWeeks as week (week)}
					{@const count = getWeekWordCount(week)}
					{@const isCurrent = week === currentWeekLabel}
					<div
						class="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-xs transition-colors hover:border-indigo-300 {isCurrent
							? 'border-indigo-300 ring-1 ring-indigo-200'
							: 'border-slate-200/90'}"
					>
						<a href={resolve(`/?category=${encodeURIComponent(week)}` as '/')} class="flex-1">
							<div class="flex items-center justify-between pr-3">
								<div>
									<div class="flex items-center gap-2">
										<span class="font-headline text-base font-bold text-slate-900">{week}</span>
										{#if isCurrent}
											<span
												class="rounded-full bg-indigo-100 px-2 py-0.5 font-headline text-[10px] font-bold text-indigo-700"
											>
												This Week
											</span>
										{/if}
									</div>
									<p class="font-sans text-xs text-slate-500">
										{count}
										{count === 1 ? 'word' : 'words'}
									</p>
								</div>
								<div
									class="flex items-center gap-1 font-headline text-xs font-semibold text-indigo-600"
								>
									<span>View</span>
									<ChevronRight size={14} />
								</div>
							</div>
						</a>

						{#if count > 0}
							<a
								href={resolve(
									`/study/${MY_WORDS_DECK_ID}?category=${encodeURIComponent(week)}` as '/study/[id]',
									{ id: MY_WORDS_DECK_ID }
								)}
								aria-label={`Practice ${week}`}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100"
							>
								<Play size={16} fill="currentColor" />
							</a>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Advance Week Early Button -->
			<div class="pt-2 text-center">
				<button
					type="button"
					onclick={handleUnlockNextWeek}
					class="font-headline text-xs font-bold text-slate-400 hover:text-indigo-600"
				>
					+ Unlock next week now
				</button>
			</div>
		</div>
	{/if}
</div>

<WordFormModal
	bind:open={modalOpen}
	word={editingWord}
	existingWords={myWords}
	defaultCategory={activeCategory || currentWeekLabel}
	onChanged={handleDeckChanged}
/>
