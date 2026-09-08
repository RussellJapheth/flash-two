<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import {
		getAllSavedWords,
		getBuiltinPacks,
		getAllCustomDecks,
		toggleSavedWord,
		computeStreakStats,
		getAllProgress
	} from '$lib/utils/storage';
	import { speakWord } from '$lib/utils/audio';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import type { WordRecord, StreakStats } from '$lib/types';
	import { BookmarkIcon, Volume2, Bookmark } from 'lucide-svelte';

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
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

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

	onMount(() => {
		loadSaved();
	});
</script>

<svelte:head>
	<title>Saved Words — FlashCards</title>
</svelte:head>

<TopHeader title="Saved Words" streak={streakStats.currentStreak} showBack={true} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<div class="flex items-center justify-between">
		<p class="font-headline text-xs font-bold text-slate-500">
			{savedList.length} Bookmarked Cards
		</p>
	</div>

	{#if savedList.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500"
		>
			<BookmarkIcon size={40} strokeWidth={1.5} class="mb-2 text-slate-400" />
			<h3 class="font-headline text-base font-bold text-slate-900">No Saved Words Yet</h3>
			<p class="mt-1 max-w-xs font-sans text-xs text-slate-400">
				Tap the bookmark icon on any flashcard during your study sessions to save difficult terms
				here.
			</p>
		</div>
	{:else}
		<div class="space-y-2.5">
			{#each savedList as item (item.packId + ':' + item.word.No)}
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
							class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
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
									<span class="font-headline text-xs font-bold text-indigo-600">{item.word.Pinyin}</span>
								{/if}
							</div>

							<p class="mt-0.5 truncate font-sans text-xs text-slate-500">
								{item.word['English Meaning']}
							</p>
						</div>
					</div>

					<button
						type="button"
						onclick={() => handleRemove(item.packId, item.word.No)}
						title="Remove bookmark"
						aria-label="Remove {target} from saved"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-amber-500 transition-colors hover:bg-slate-100"
					>
						<Bookmark size={18} strokeWidth={2} class="fill-current" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</main>
