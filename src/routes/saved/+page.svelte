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
				(p) => p.id === s.weekId || p.id === `chinese-${s.weekId}` || p.id.replace('chinese-', '') === s.weekId
			);
			if (chPack) {
				const word = chPack.words.find((w) => w.No === s.wordNo);
				if (word) results.push({ packId: chPack.id, word, language: 'chinese', savedAt: s.savedAt });
				continue;
			}

			// Find word in built-in French
			const frPack = frPacks.find(
				(p) => p.id === s.weekId || p.id === `french-${s.weekId}` || p.id.replace('french-', '') === s.weekId
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

<main class="flex-1 px-4 pt-3 pb-8 space-y-4">
	<div class="flex items-center justify-between">
		<p class="font-headline text-xs font-bold text-on-surface-variant">
			{savedList.length} Bookmarked Cards
		</p>
	</div>

	{#if savedList.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-container p-10 text-center text-on-surface-variant"
		>
			<span class="material-symbols-outlined text-[44px] text-outline mb-2">bookmark_border</span>
			<h3 class="font-headline text-base font-bold text-on-surface">No Saved Words Yet</h3>
			<p class="font-body text-xs mt-1 max-w-xs">
				Tap the bookmark icon on any flashcard during your study sessions to save difficult terms here.
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each savedList as item (item.packId + ':' + item.word.No)}
				{@const target = item.language === 'chinese' ? item.word['Chinese Word'] : item.word['French Word']}
				<div
					class="flex items-center justify-between rounded-2xl border border-surface-container bg-surface-container-lowest p-4 shadow-card hover:border-primary/20 transition-all"
				>
					<div class="flex items-start gap-3 flex-1 min-w-0 pr-2">
						<button
							type="button"
							onclick={() => speakWord(target || '', item.language)}
							title="Listen"
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary hover:bg-primary hover:text-white transition-colors"
						>
							<span class="material-symbols-outlined text-[20px]">volume_up</span>
						</button>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<h3 class="font-headline text-base font-bold text-on-surface truncate {item.language === 'chinese' ? 'font-hanzi' : ''}">
									{target}
								</h3>
								{#if item.word.Pinyin}
									<span class="text-xs font-semibold text-primary">{item.word.Pinyin}</span>
								{/if}
							</div>

							<p class="font-body text-xs text-on-surface-variant mt-0.5 truncate">
								{item.word['English Meaning']}
							</p>
						</div>
					</div>

					<button
						type="button"
						onclick={() => handleRemove(item.packId, item.word.No)}
						title="Remove bookmark"
						class="flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-surface-container transition-colors"
					>
						<span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">
							bookmark
						</span>
					</button>
				</div>
			{/each}
		</div>
	{/if}
</main>
