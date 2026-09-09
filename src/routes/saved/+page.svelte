<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import {
		getAllSavedWords,
		getBuiltinPacks,
		getAllCustomDecks,
		toggleSavedWord,
		computeStreakStats,
		getAllProgress,
		saveCustomDeck
	} from '$lib/utils/storage';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { speakWord } from '$lib/utils/audio';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import type { WordRecord, StreakStats } from '$lib/types';
	import { BookmarkIcon, Volume2, Bookmark, Search, Play } from 'lucide-svelte';

	interface SavedItem {
		packId: string;
		word: WordRecord;
		language: 'chinese' | 'french';
		savedAt: number;
	}

	let savedList = $state<SavedItem[]>([]);
	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 0,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: [],
		freezeDates: []
	});

	let searchQuery = $state('');
	let filterLang = $state<'all' | 'chinese' | 'french'>('all');

	async function loadSaved() {
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const savedWords = await getAllSavedWords();
		const chPacks = await getBuiltinPacks('chinese');
		const frPacks = await getBuiltinPacks('french');
		const customDecks = await getAllCustomDecks();

		const results: SavedItem[] = [];

		for (const s of savedWords) {
			// Find word in built-in Chinese
			const chPack = chPacks.find(
				(p) =>
					p.id === s.weekId ||
					p.id === `chinese-${s.weekId}` ||
					p.id.replace('chinese-', '') === s.weekId
			);
			if (chPack) {
				const word = chPack.words.find((w) => w.No === s.wordNo);
				if (word)
					results.push({ packId: chPack.id, word, language: 'chinese', savedAt: s.savedAt });
				continue;
			}

			// Find word in built-in French
			const frPack = frPacks.find(
				(p) =>
					p.id === s.weekId ||
					p.id === `french-${s.weekId}` ||
					p.id.replace('french-', '') === s.weekId
			);
			if (frPack) {
				const word = frPack.words.find((w) => w.No === s.wordNo);
				if (word) results.push({ packId: frPack.id, word, language: 'french', savedAt: s.savedAt });
				continue;
			}

			// Find in Custom Decks
			const custom = customDecks.find((d) => d.id === s.weekId);
			if (custom) {
				const word = custom.words.find((w) => w.No === s.wordNo);
				if (word)
					results.push({
						packId: s.weekId,
						word,
						language: custom.language || 'chinese',
						savedAt: s.savedAt
					});
			}
		}

		savedList = results.sort((a, b) => b.savedAt - a.savedAt);
	}

	async function handleRemove(packId: string, wordNo: number) {
		await toggleSavedWord(packId, wordNo);
		scheduleDebouncedSync();
		await loadSaved();
	}

	async function handleStudySavedDeck() {
		if (filteredSaved.length === 0) return;
		const lang = filterLang === 'french' ? 'french' : 'chinese';
		const targetWords = filteredSaved
			.filter((item) => filterLang === 'all' || item.language === filterLang)
			.map((item, idx) => ({
				...item.word,
				No: idx + 1
			}));

		if (targetWords.length === 0) return;

		const savedDeckId = `custom-saved-${Date.now()}`;
		await saveCustomDeck({
			id: savedDeckId,
			name: `Saved Words Drill (${targetWords.length})`,
			words: targetWords,
			language: lang,
			createdAt: Date.now()
		});
		scheduleDebouncedSync();
		goto(resolve(`/deck/${savedDeckId}/preview`));
	}

	let filteredSaved = $derived(
		savedList.filter((item) => {
			if (filterLang !== 'all' && item.language !== filterLang) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const target =
					item.language === 'chinese'
						? item.word['Chinese Word'] || ''
						: item.word['French Word'] || '';
				const pinyin = item.word.Pinyin || '';
				const meaning = item.word['English Meaning'] || '';
				return (
					target.toLowerCase().includes(q) ||
					pinyin.toLowerCase().includes(q) ||
					meaning.toLowerCase().includes(q)
				);
			}
			return true;
		})
	);

	onMount(() => {
		loadSaved();
	});
</script>

<svelte:head>
	<title>Saved Words — FlashCards</title>
</svelte:head>

<TopHeader title="Saved Words" streak={streakStats.currentStreak} showBack={true} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Top Overview & Study CTA -->
	{#if savedList.length > 0}
		<div
			class="shadow-card flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
		>
			<div>
				<h2 class="font-headline text-base font-extrabold text-slate-900">Bookmarked Terms</h2>
				<p class="font-sans text-xs text-slate-500">
					{savedList.length} saved {savedList.length === 1 ? 'word' : 'words'} across your decks
				</p>
			</div>

			<button
				type="button"
				onclick={handleStudySavedDeck}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
			>
				<Play size={13} strokeWidth={2.5} class="fill-current" />
				<span>Drill Saved</span>
			</button>
		</div>

		<!-- Search & Language Filter Controls -->
		<div class="space-y-2">
			<div class="relative">
				<Search
					size={16}
					strokeWidth={2.25}
					class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search saved vocabulary..."
					class="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pr-4 pl-10 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
				/>
			</div>

			<div class="flex items-center gap-1.5">
				<button
					type="button"
					onclick={() => (filterLang = 'all')}
					class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {filterLang ===
					'all'
						? 'bg-indigo-600 text-white'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					All ({savedList.length})
				</button>
				<button
					type="button"
					onclick={() => (filterLang = 'chinese')}
					class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {filterLang ===
					'chinese'
						? 'bg-indigo-600 text-white'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					Chinese ({savedList.filter((s) => s.language === 'chinese').length})
				</button>
				<button
					type="button"
					onclick={() => (filterLang = 'french')}
					class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {filterLang ===
					'french'
						? 'bg-amber-600 text-white'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					French ({savedList.filter((s) => s.language === 'french').length})
				</button>
			</div>
		</div>
	{/if}

	{#if savedList.length === 0}
		<div
			class="shadow-card flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500"
		>
			<BookmarkIcon size={40} strokeWidth={1.5} class="mb-2 text-slate-400" />
			<h3 class="font-headline text-base font-bold text-slate-900">No Saved Words Yet</h3>
			<p class="mt-1 max-w-xs font-sans text-xs text-slate-400">
				Tap the bookmark icon on any flashcard during your study sessions to save difficult terms
				here.
			</p>
		</div>
	{:else if filteredSaved.length === 0}
		<div
			class="shadow-card rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500"
		>
			<p class="font-headline text-sm font-bold text-slate-800">No saved words match your filter</p>
			<p class="mt-1 font-sans text-xs text-slate-400">Try clearing your search query.</p>
		</div>
	{:else}
		<div class="space-y-2.5">
			{#each filteredSaved as item (item.packId + ':' + item.word.No)}
				{@const target =
					item.language === 'chinese' ? item.word['Chinese Word'] : item.word['French Word']}
				<div
					class="shadow-card hover:shadow-card-hover flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-indigo-200"
				>
					<div class="flex min-w-0 flex-1 items-start gap-3 pr-2">
						<button
							type="button"
							onclick={() => speakWord(target || '', item.language)}
							title="Listen"
							aria-label="Listen to {target}"
							class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white active:scale-95"
						>
							<Volume2 size={17} strokeWidth={2} />
						</button>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<h3
									class="truncate font-headline text-sm font-bold text-slate-900 {item.language ===
									'chinese'
										? 'font-hanzi'
										: ''}"
								>
									{target}
								</h3>
								{#if item.word.Pinyin}
									<span class="font-headline text-xs font-bold text-indigo-600"
										>{item.word.Pinyin}</span
									>
								{/if}
								{#if item.word['Part of Speech']}
									<span
										class="py-0.2 rounded bg-slate-100 px-1.5 font-headline text-[10px] font-bold text-slate-500 uppercase"
									>
										{item.word['Part of Speech']}
									</span>
								{/if}
							</div>

							<p class="mt-0.5 truncate font-sans text-xs text-slate-600">
								{item.word['English Meaning']}
							</p>

							{#if item.language === 'chinese' && item.word['Example (Chinese + Pinyin)']}
								<p class="mt-1 line-clamp-1 text-[11px] text-slate-400">
									{item.word['Example (Chinese + Pinyin)']}
								</p>
							{:else if item.language === 'french' && item.word['Example (French)']}
								<p class="mt-1 line-clamp-1 text-[11px] text-slate-400">
									{item.word['Example (French)']}
								</p>
							{/if}
						</div>
					</div>

					<button
						type="button"
						onclick={() => handleRemove(item.packId, item.word.No)}
						title="Remove bookmark"
						aria-label="Remove {target} from saved"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-amber-500 transition-transform hover:scale-110 hover:bg-slate-50 active:scale-95"
					>
						<Bookmark size={18} strokeWidth={2} class="fill-current" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</main>
