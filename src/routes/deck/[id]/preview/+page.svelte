<script lang="ts">
	import { page } from '$app/state';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		computeStreakStats,
		recordRecentlyOpenedPack
	} from '$lib/utils/storage';

	import { isCardDue, isCardMastered, isCardLearning } from '$lib/utils/srs';
	import type { WordRecord, StreakStats } from '$lib/types';
	import { Brain, BookOpen, Dumbbell, Play } from 'lucide-svelte';

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let deckId = $derived(page.params.id || '');
	let deckTitle = $state('Loading Deck...');
	let deckLanguage = $state<'chinese' | 'french'>('chinese');
	let words = $state<WordRecord[]>([]);
	let masteredCount = $state(0);
	let learningCount = $state(0);
	let dueCount = $state(0);
	let weakCount = $state(0);

	// Study Settings
	let studyMode = $state<'srs' | 'all' | 'weak'>('srs');
	let cardLimit = $state<number>(20);
	let showPinyin = $state(true);

	async function loadDeckData() {
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		let foundWords: WordRecord[] = [];
		let title = 'Vocabulary Pack';
		let lang: 'chinese' | 'french' = 'chinese';

		if (deckId.startsWith('custom-')) {
			const customDecks = await getAllCustomDecks();
			const match = customDecks.find((d) => d.id === deckId);
			if (match) {
				foundWords = match.words;
				title = match.name;
				lang = match.language || 'chinese';
			}
		} else {
			// Check Chinese packs then French packs
			const chPacks = await getBuiltinPacks('chinese');
			const chMatch = chPacks.find(
				(p) =>
					p.id === deckId || p.id === `chinese-${deckId}` || p.id.replace('chinese-', '') === deckId
			);
			if (chMatch) {
				foundWords = chMatch.words;
				title = chMatch.title;
				lang = 'chinese';
			} else {
				const frPacks = await getBuiltinPacks('french');
				const frMatch = frPacks.find(
					(p) =>
						p.id === deckId || p.id === `french-${deckId}` || p.id.replace('french-', '') === deckId
				);
				if (frMatch) {
					foundWords = frMatch.words;
					title = frMatch.title;
					lang = 'french';
				}
			}
		}

		words = foundWords;
		deckTitle = title;
		deckLanguage = lang;
		if (deckId) {
			recordRecentlyOpenedPack(deckId);
		}

		let mastered = 0;
		let learning = 0;
		let due = 0;
		let weak = 0;

		for (const w of foundWords) {
			const p =
				progress[`${deckId}:${w.No}`] ||
				progress[`${deckId.replace('chinese-', '').replace('french-', '')}:${w.No}`];
			if (p) {
				if (isCardMastered(p)) mastered++;
				else if (isCardLearning(p)) learning++;
				if (isCardDue(p)) due++;
				if (p.wrong > 0) weak++;
			} else {
				due++;
			}
		}

		masteredCount = mastered;
		learningCount = learning;
		dueCount = due;
		weakCount = weak;
	}

	onMount(() => {
		loadDeckData();
	});
</script>

<svelte:head>
	<title>{deckTitle} — FlashCards</title>
</svelte:head>

<TopHeader title="Deck Overview" showBack={true} streak={streakStats.currentStreak} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Deck Summary Hero -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<div class="flex items-center justify-between">
			<span
				class="rounded-full px-3 py-1 font-headline text-xs font-bold tracking-wider uppercase {deckLanguage ===
				'french'
					? 'border border-amber-200/80 bg-amber-50 text-amber-800'
					: 'border border-indigo-100 bg-indigo-50 text-indigo-700'}"
			>
				{deckLanguage}
			</span>

			<span class="font-headline text-xs font-bold text-slate-500">
				{words.length} Total Cards
			</span>
		</div>

		<h2 class="mt-2 font-headline text-2xl font-extrabold tracking-tight text-slate-900">
			{deckTitle}
		</h2>

		<!-- Progress Bar -->
		<div class="mt-4">
			<div class="mb-1.5 flex justify-between text-xs font-bold text-slate-900">
				<span class="font-headline">Mastery</span>
				<span class="font-headline text-emerald-600">{masteredCount} / {words.length} cards</span>
			</div>
			<ProgressBar value={masteredCount} max={words.length} variant="emerald" height="h-2" />
		</div>

		<!-- Card status breakdown badges -->
		<div class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
			<div class="rounded-2xl border border-indigo-100/60 bg-indigo-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-indigo-700">{dueCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Due Review</p>
			</div>
			<div class="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-amber-700">{learningCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Learning</p>
			</div>
			<div class="rounded-2xl border border-emerald-100/60 bg-emerald-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-emerald-700">{masteredCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Mastered</p>
			</div>
		</div>
	</section>

	<!-- Study Mode Options -->
	<section
		class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<h3 class="font-headline text-base font-bold text-slate-900">Session Preferences</h3>

		<!-- Study Mode Selection -->
		<div>
			<span class="block font-headline text-xs font-bold text-slate-900">Study Mode</span>
			<div class="mt-2 grid grid-cols-3 gap-2">
				<button
					type="button"
					onclick={() => (studyMode = 'srs')}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
					'srs'
						? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs'
						: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
				>
					<Brain size={19} strokeWidth={2} class="mb-1" />
					<span class="font-headline text-xs font-bold">Spaced SRS</span>
					<span class="font-sans text-[10px] opacity-75">{dueCount} cards</span>
				</button>

				<button
					type="button"
					onclick={() => (studyMode = 'all')}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
					'all'
						? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs'
						: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
				>
					<BookOpen size={19} strokeWidth={2} class="mb-1" />
					<span class="font-headline text-xs font-bold">All Cards</span>
					<span class="font-sans text-[10px] opacity-75">{words.length} cards</span>
				</button>

				<button
					type="button"
					onclick={() => (studyMode = 'weak')}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
					'weak'
						? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/20 shadow-xs'
						: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
				>
					<Dumbbell size={19} strokeWidth={2} class="mb-1" />
					<span class="font-headline text-xs font-bold">Difficult</span>
					<span class="font-sans text-[10px] opacity-75">{weakCount} cards</span>
				</button>
			</div>
		</div>

		<!-- Card Count Limits -->
		<div>
			<span class="block font-headline text-xs font-bold text-slate-900">Cards per Session</span>
			<div class="mt-2 flex gap-2">
				{#each [10, 20, 30, 0] as limit}
					<button
						type="button"
						onclick={() => (cardLimit = limit)}
						class="flex-1 cursor-pointer rounded-2xl py-2 font-headline text-xs font-bold transition-all {cardLimit ===
						limit
							? 'bg-indigo-600 text-white shadow-xs'
							: 'border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
					>
						{limit === 0 ? 'All' : `${limit}`}
					</button>
				{/each}
			</div>
		</div>

		<!-- Show Pinyin / Phonetic Toggle -->
		{#if deckLanguage === 'chinese'}
			<div class="flex items-center justify-between pt-1">
				<div>
					<p class="font-headline text-xs font-bold text-slate-900">Show Pinyin Guide</p>
					<p class="font-sans text-[11px] text-slate-500">
						Display romanized pronunciation on front
					</p>
				</div>
				<button
					type="button"
					onclick={() => (showPinyin = !showPinyin)}
					class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out {showPinyin
						? 'bg-indigo-600'
						: 'bg-slate-200'}"
					aria-label="Toggle Pinyin"
				>
					<span
						class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out {showPinyin
							? 'translate-x-5'
							: 'translate-x-0'}"
					></span>
				</button>
			</div>
		{/if}
	</section>

	<!-- Launch Button -->
	<a
		href="/study/{deckId}?mode={studyMode}&limit={cardLimit}&pinyin={showPinyin ? '1' : '0'}"
		class="flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
	>
		<Play size={18} strokeWidth={2.5} class="fill-current" />
		<span>Start Studying Now</span>
	</a>
</main>
