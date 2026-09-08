<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import DeckCard from '$lib/components/DeckCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
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
	import type { DeckSummary, StreakStats, WordProgress, CustomDeck } from '$lib/types';
	import { Flame, Brain, Dumbbell, PlayCircle } from 'lucide-svelte';

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

	async function loadDashboardData() {
		username = getSavedUsername() || 'Russell';
		activeLanguage = getSavedLanguage();

		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const builtinPacks = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		const matchingCustom = customDecks.filter(
			(d) => !d.language || d.language === activeLanguage
		);

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

			const accuracy =
				totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

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

			const accuracy =
				totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

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

<main class="flex-1 px-4 pt-3 pb-8 space-y-4">
	<!-- Hero Greeting & Today's Goal -->
	<section
		class="relative overflow-hidden rounded-3xl border border-surface-container bg-gradient-to-br from-primary-fixed/30 via-surface-container-lowest to-surface-container-low p-5 shadow-card"
	>
		<div class="relative z-10 flex items-start justify-between">
			<div>
				<p class="font-body text-xs font-semibold text-on-surface-variant">Good day,</p>
				<h2 class="font-headline text-2xl font-black tracking-tight text-on-surface capitalize">
					{username}! 👋
				</h2>
				<p class="mt-1 font-body text-xs text-on-surface-variant max-w-[220px] leading-relaxed">
					{streakStats.tierName} • Keep up your daily habit.
				</p>
			</div>

			<a
				href="/streak"
				class="flex flex-col items-center justify-center rounded-2xl bg-secondary-fixed/70 border border-secondary-container/30 px-3.5 py-2 text-center transition-transform hover:scale-105 active:scale-95 shadow-sm"
			>
				<Flame size={24} strokeWidth={1.75} class="text-secondary" />
				<span class="font-headline text-sm font-extrabold text-on-secondary-fixed">
					{streakStats.currentStreak}d
				</span>
			</a>
		</div>

		<!-- Daily Mastery Progress -->
		<div class="mt-4 pt-3 border-t border-surface-container-high/60">
			<div class="flex items-center justify-between text-xs font-bold text-on-surface mb-1.5">
				<span>Today's Progress</span>
				<span class="text-primary font-headline"
					>{totalMasteredCount} / {totalCardCount} Mastered</span
				>
			</div>
			<ProgressBar value={totalMasteredCount} max={totalCardCount} variant="primary" height="h-2.5" />
		</div>
	</section>

	<!-- Quick SRS Spaced Review & Practice Launchers -->
	<div class="grid grid-cols-2 gap-3">
		<!-- Due SRS Review Card -->
		<a
			href="/review"
			class="flex flex-col justify-between rounded-2xl border border-primary/20 bg-primary-fixed/20 p-4 transition-all hover:bg-primary-fixed/30 hover:shadow-sm active:scale-98"
		>
			<div class="flex items-center justify-between">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white shadow-sm"
				>
					<Brain size={18} strokeWidth={1.75} />
				</div>
				<span class="rounded-full bg-primary-fixed px-2 py-0.5 font-headline text-[11px] font-bold text-primary">
					SRS Due
				</span>
			</div>
			<div class="mt-3">
				<p class="font-headline text-xl font-extrabold text-on-surface">{totalDueCount}</p>
				<p class="font-body text-[11px] font-medium text-on-surface-variant">Cards due for review</p>
			</div>
		</a>

		<!-- Practice Weak Words Card -->
		<a
			href="/practice"
			class="flex flex-col justify-between rounded-2xl border border-secondary-container/30 bg-secondary-fixed/20 p-4 transition-all hover:bg-secondary-fixed/30 hover:shadow-sm active:scale-98"
		>
			<div class="flex items-center justify-between">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-white shadow-sm"
				>
					<Dumbbell size={18} strokeWidth={1.75} />
				</div>
				<span
					class="rounded-full bg-secondary-fixed px-2 py-0.5 font-headline text-[11px] font-bold text-on-secondary-fixed"
				>
					Practice
				</span>
			</div>
			<div class="mt-3">
				<p class="font-headline text-xl font-extrabold text-on-surface">{totalWeakCount}</p>
				<p class="font-body text-[11px] font-medium text-on-surface-variant">Difficult words</p>
			</div>
		</a>
	</div>

	<!-- Recommended Continue Studying Card -->
	{#if recommendedDeck}
		<section
			class="rounded-3xl border border-surface-container bg-surface-container-lowest p-4 shadow-card"
		>
			<div class="flex items-center justify-between mb-2">
				<span class="font-headline text-xs font-bold uppercase tracking-wider text-primary">
					Recommended Drill
				</span>
				<span class="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
					{recommendedDeck.dueCards} cards ready
				</span>
			</div>

			<h3 class="font-headline text-lg font-bold text-on-surface">
				{recommendedDeck.title}
			</h3>

			<div class="mt-2 mb-4">
				<ProgressBar
					value={recommendedDeck.masteredCards}
					max={recommendedDeck.totalCards}
					variant="emerald"
					height="h-2"
				/>
			</div>

			<a
				href="/deck/{recommendedDeck.id}/preview"
				class="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-container font-headline text-sm font-bold text-white shadow-md transition-all hover:bg-primary active:scale-95"
			>
				<PlayCircle size={18} strokeWidth={2} />
				<span>Start Session</span>
			</a>
		</section>
	{/if}

	<!-- Vocabulary Packs Header & Language Switcher -->
	<section class="pt-2">
		<div class="flex items-center justify-between mb-3">
			<h3 class="font-headline text-lg font-bold text-on-surface">Vocabulary Packs</h3>

			<!-- Language Toggle Pill -->
			<div class="flex items-center rounded-full bg-surface-container p-0.5 border border-surface-container-high">
				<button
					type="button"
					onclick={() => switchLanguage('chinese')}
					class="rounded-full px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'chinese'
						? 'bg-primary-container text-white shadow-sm'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					Chinese
				</button>
				<button
					type="button"
					onclick={() => switchLanguage('french')}
					class="rounded-full px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'french'
						? 'bg-primary-container text-white shadow-sm'
						: 'text-on-surface-variant hover:text-on-surface'}"
				>
					French
				</button>
			</div>
		</div>

		<!-- Pack Cards Grid -->
		<div class="space-y-3">
			{#each deckSummaries as deck (deck.id)}
				<DeckCard {deck} />
			{/each}
		</div>
	</section>
</main>
