<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import DeckCard from '$lib/components/DeckCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StreakCalendarModal from '$lib/components/StreakCalendarModal.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		computeStreakStats,
		getSavedUsername,
		getSavedLanguage,
		setSavedLanguage
	} from '$lib/utils/storage';
	import { isCardDue, isCardMastered, isCardLearning } from '$lib/utils/srs';
	import type { DeckSummary, StreakStats, WordProgress } from '$lib/types';
	import {
		Flame,
		Brain,
		Dumbbell,
		PlayCircle,
		ArrowRight,
		Sparkles,
		BookOpen
	} from 'lucide-svelte';

	let username = $state('Russell');
	let activeLanguage = $state<'chinese' | 'french'>('chinese');
	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let deckSummaries = $state<DeckSummary[]>([]);
	let totalDueCount = $state(0);
	let totalWeakCount = $state(0);
	let totalMasteredCount = $state(0);
	let totalCardCount = $state(0);
	let recommendedDeck = $state<DeckSummary | null>(null);

	let isStreakModalOpen = $state(false);

	let masteryPercentage = $derived(
		totalCardCount > 0 ? Math.round((totalMasteredCount / totalCardCount) * 100) : 0
	);

	async function loadDashboardData() {
		username = getSavedUsername() || 'Russell';
		activeLanguage = getSavedLanguage();

		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const builtinPacks = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		const matchingCustom = customDecks.filter((d) => !d.language || d.language === activeLanguage);

		let dueAccumulator = 0;
		let weakAccumulator = 0;
		let masteredAccumulator = 0;
		let totalCardsAccumulator = 0;

		const summaries: DeckSummary[] = [];

		// Process Builtin Packs
		for (const pack of builtinPacks) {
			let mastered = 0;
			let learning = 0;
			let due = 0;
			let correctSum = 0;
			let totalAttempts = 0;

			for (const word of pack.words) {
				const key = `${pack.id}:${word.No}`;
				const legacyKey = `${pack.id.replace(`${activeLanguage}-`, '')}:${word.No}`;
				const p: WordProgress | undefined = progress[key] || progress[legacyKey];
				if (p) {
					if (isCardMastered(p)) mastered++;
					else if (isCardLearning(p)) learning++;

					if (isCardDue(p)) due++;
					if (p.wrong > 0) weakAccumulator++;

					correctSum += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++; // Unseen card counts as due to learn
				}
			}

			const accuracy = totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

			dueAccumulator += due;
			masteredAccumulator += mastered;
			totalCardsAccumulator += pack.words.length;

			summaries.push({
				id: pack.id,
				title: pack.title,
				language: activeLanguage,
				totalCards: pack.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: false
			});
		}

		// Process Custom Decks
		for (const deck of matchingCustom) {
			let mastered = 0;
			let learning = 0;
			let due = 0;
			let correctSum = 0;
			let totalAttempts = 0;

			for (const word of deck.words) {
				const key = `${deck.id}:${word.No}`;
				const p = progress[key];
				if (p) {
					if (isCardMastered(p)) mastered++;
					else if (isCardLearning(p)) learning++;
					if (isCardDue(p)) due++;
					correctSum += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++;
				}
			}

			const accuracy = totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

			summaries.push({
				id: deck.id,
				title: deck.name,
				language: deck.language || activeLanguage,
				totalCards: deck.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: true
			});
		}

		deckSummaries = summaries;
		totalDueCount = dueAccumulator;
		totalWeakCount = weakAccumulator;
		totalMasteredCount = masteredAccumulator;
		totalCardCount = totalCardsAccumulator;

		// Recommended deck: first deck with due cards or first deck
		recommendedDeck =
			summaries.find((d) => d.dueCards > 0 && d.masteredCards < d.totalCards) ||
			summaries[0] ||
			null;
	}

	function switchLanguage(lang: 'chinese' | 'french') {
		activeLanguage = lang;
		setSavedLanguage(lang);
		loadDashboardData();
	}

	onMount(() => {
		loadDashboardData();
	});
</script>

<svelte:head>
	<title>FlashCards — Dashboard</title>
</svelte:head>

<TopHeader
	title="FlashCards"
	streak={streakStats.currentStreak}
	onOpenStreak={() => (isStreakModalOpen = true)}
/>

<main class="flex-1 space-y-5 px-4 pt-4 pb-8">
	<!-- 1. GREETING & TODAY'S PROGRESS HERO -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/50 p-5"
	>
		<div class="relative z-10 flex items-start justify-between">
			<div class="space-y-0.5">
				<p class="font-body text-xs font-semibold tracking-wider text-slate-500 uppercase">
					Good day,
				</p>
				<h2 class="font-headline text-2xl font-extrabold tracking-tight text-slate-900 capitalize">
					{username}! 👋
				</h2>
				<div class="flex items-center gap-1.5 pt-0.5">
					<span
						class="inline-flex items-center gap-1 rounded-md bg-indigo-100/80 px-2 py-0.5 text-[11px] font-bold text-indigo-800"
					>
						<Sparkles size={11} strokeWidth={2.5} class="text-indigo-600" />
						{streakStats.tierName}
					</span>
					<span class="text-[11px] font-medium text-slate-500">• Daily habit</span>
				</div>
			</div>

			<!-- Streak Motivation Trigger -->
			<button
				type="button"
				onclick={() => (isStreakModalOpen = true)}
				class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-white/90 px-3.5 py-2 text-center shadow-xs transition-transform hover:scale-105 active:scale-95"
			>
				<Flame size={22} strokeWidth={2.25} class="fill-amber-500/20 text-amber-500" />
				<span class="font-headline text-xs font-extrabold text-amber-900">
					{streakStats.currentStreak}d
				</span>
			</button>
		</div>

		<!-- Daily Mastery Progress -->
		<div class="mt-4 border-t border-slate-200/60 pt-3.5">
			<div class="mb-1.5 flex items-center justify-between text-xs">
				<span class="font-headline font-bold text-slate-700">Today's Progress</span>
				<div class="flex items-center gap-1.5">
					<span class="font-headline font-extrabold text-indigo-600">
						{totalMasteredCount} / {totalCardCount} Mastered
					</span>
					<span
						class="py-0.2 rounded-full bg-indigo-100 px-1.5 font-headline text-[10px] font-extrabold text-indigo-700"
					>
						{masteryPercentage}%
					</span>
				</div>
			</div>
			<ProgressBar value={totalMasteredCount} max={totalCardCount} variant="primary" height="h-2" />
			<p class="mt-2 text-[11px] font-medium text-slate-400">
				{#if totalCardCount - totalMasteredCount > 0}
					{totalCardCount - totalMasteredCount} words remaining in curriculum
				{:else}
					All curriculum words mastered! 🎉
				{/if}
			</p>
		</div>
	</section>

	<!-- 2. RECOMMENDED NEXT ACTION (PRIMARY CTA) -->
	{#if recommendedDeck}
		{@const deckProgressPercent =
			recommendedDeck.totalCards > 0
				? Math.round((recommendedDeck.masteredCards / recommendedDeck.totalCards) * 100)
				: 0}
		<section
			class="shadow-card hover:shadow-card-hover relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 transition-all hover:border-indigo-200"
		>
			<div class="mb-2.5 flex items-center justify-between">
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-600"></span>
					<span>RECOMMENDED DRILL</span>
				</div>
				<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
					{recommendedDeck.dueCards} cards ready
				</span>
			</div>

			<h3 class="font-headline text-lg font-extrabold tracking-tight text-slate-900">
				{recommendedDeck.title}
			</h3>

			<div class="mt-2 mb-4 space-y-1.5">
				<div class="flex justify-between text-xs font-medium text-slate-500">
					<span>Mastery</span>
					<span class="font-semibold text-slate-700"
						>{recommendedDeck.masteredCards} / {recommendedDeck.totalCards} ({deckProgressPercent}%)</span
					>
				</div>
				<ProgressBar
					value={recommendedDeck.masteredCards}
					max={recommendedDeck.totalCards}
					variant="emerald"
					height="h-2"
				/>
			</div>

			<a
				href={resolve(`/deck/${recommendedDeck.id}/preview`)}
				class="group flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]"
			>
				<PlayCircle
					size={19}
					strokeWidth={2.25}
					class="transition-transform group-hover:scale-110"
				/>
				<span>Start Session</span>
			</a>
		</section>
	{/if}

	<!-- 3. WHAT NEEDS ATTENTION (SRS DUE & PRACTICE HUB) -->
	<section class="space-y-2">
		<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
			Needs Attention
		</h3>

		<div class="grid grid-cols-2 gap-3">
			<!-- Due SRS Spaced Review Card -->
			<a
				href={resolve('/review')}
				class="group relative flex cursor-pointer flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 text-white shadow-md shadow-indigo-600/15 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98]"
			>
				<div>
					<div class="flex items-center justify-between">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs"
						>
							<Brain size={18} strokeWidth={2.25} />
						</div>
						<span
							class="rounded-full bg-white/20 px-2 py-0.5 font-headline text-[10px] font-bold text-white backdrop-blur-xs"
						>
							SRS Due
						</span>
					</div>
					<div class="mt-3">
						<p class="font-headline text-2xl font-black">{totalDueCount}</p>
						<p class="text-[11px] font-medium text-indigo-100">Cards for review</p>
					</div>
				</div>

				<div
					class="mt-3 flex items-center gap-1 text-[11px] font-bold text-white/90 group-hover:text-white"
				>
					<span>Review</span>
					<ArrowRight
						size={13}
						strokeWidth={2.5}
						class="transition-transform group-hover:translate-x-1"
					/>
				</div>
			</a>

			<!-- Difficult Words Practice Card -->
			<a
				href={resolve('/practice')}
				class="group shadow-card hover:shadow-card-hover relative flex cursor-pointer flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 active:scale-[0.98]"
			>
				<div>
					<div class="flex items-center justify-between">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-600"
						>
							<Dumbbell size={18} strokeWidth={2.25} />
						</div>
						<span
							class="rounded-full border border-amber-200/60 bg-amber-50 px-2 py-0.5 font-headline text-[10px] font-bold text-amber-800"
						>
							Practice
						</span>
					</div>
					<div class="mt-3">
						<p class="font-headline text-2xl font-black text-slate-900">{totalWeakCount}</p>
						<p class="text-[11px] font-medium text-slate-500">Difficult words</p>
					</div>
				</div>

				<div
					class="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:text-amber-800"
				>
					<span>Practice</span>
					<ArrowRight
						size={13}
						strokeWidth={2.5}
						class="transition-transform group-hover:translate-x-1"
					/>
				</div>
			</a>
		</div>
	</section>

	<!-- 4. VOCABULARY PACKS LIBRARY -->
	<section class="space-y-3 pt-1">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-1.5">
				<BookOpen size={18} strokeWidth={2.25} class="text-indigo-600" />
				<h3 class="font-headline text-base font-bold text-slate-900">Vocabulary Packs</h3>
			</div>

			<!-- Language Toggle Pill -->
			<div class="flex items-center rounded-xl border border-slate-200/60 bg-slate-100 p-1">
				<button
					type="button"
					onclick={() => switchLanguage('chinese')}
					class="cursor-pointer rounded-lg px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'chinese'
						? 'bg-white text-indigo-600 shadow-xs'
						: 'text-slate-500 hover:text-slate-900'}"
				>
					Chinese
				</button>
				<button
					type="button"
					onclick={() => switchLanguage('french')}
					class="cursor-pointer rounded-lg px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'french'
						? 'bg-white text-indigo-600 shadow-xs'
						: 'text-slate-500 hover:text-slate-900'}"
				>
					French
				</button>
			</div>
		</div>

		<!-- Pack Cards List -->
		<div class="space-y-2.5">
			{#if deckSummaries.length === 0}
				<div
					class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400"
				>
					<p class="font-headline text-xs font-bold">
						No vocabulary packs found for {activeLanguage}.
					</p>
				</div>
			{:else}
				{#each deckSummaries as deck (deck.id)}
					<DeckCard {deck} />
				{/each}
			{/if}
		</div>
	</section>
</main>

<!-- Streak Calendar Modal -->
<StreakCalendarModal
	isOpen={isStreakModalOpen}
	streak={streakStats.currentStreak}
	activeDates={streakStats.activeDates}
	onClose={() => (isStreakModalOpen = false)}
/>
