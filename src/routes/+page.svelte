<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import DeckCard from '$lib/components/DeckCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StreakCalendarModal from '$lib/components/StreakCalendarModal.svelte';
	import DeckSpreadsheetModal from '$lib/components/DeckSpreadsheetModal.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
		getWordProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		saveCustomDeck,
		deleteCustomDeck,
		computeStreakStats,
		getSavedUsername,
		getSavedLanguage,
		setSavedLanguage,
		getRecentlyOpenedPackIds
	} from '$lib/utils/storage';
	import {
		migrateHistoricalProgressXP,
		computeLevelStats,
		isCloudSyncEnabled
	} from '$lib/utils/xp';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { isCardDue, isCardMastered, isCardLearning } from '$lib/utils/srs';
	import type { DeckSummary, StreakStats, WordProgress, CustomDeck, XPStats } from '$lib/types';
	import {
		Flame,
		Dumbbell,
		PlayCircle,
		ArrowRight,
		Sparkles,
		BookOpen,
		Trophy
	} from 'lucide-svelte';

	let username = $state('Russell');
	let activeLanguage = $state<'chinese' | 'french'>('chinese');
	let isCloudUser = $state(false);
	let xpStats = $state<XPStats | null>(null);
	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let deckSummaries = $state<DeckSummary[]>([]);
	let rawCustomDecks = $state<CustomDeck[]>([]);
	let recentPackIds = $state<string[]>([]);
	let totalWeakCount = $state(0);

	let recommendedDeck = $state<DeckSummary | null>(null);
	let isStreakModalOpen = $state(false);
	let isSpreadsheetModalOpen = $state(false);
	let editingDeck = $state<CustomDeck | null>(null);

	let displayedRecentDecks = $derived(() => {
		if (deckSummaries.length === 0) return [];
		const ordered = [...deckSummaries].sort((a, b) => {
			const idxA = recentPackIds.indexOf(a.id);
			const idxB = recentPackIds.indexOf(b.id);
			if (idxA !== -1 && idxB !== -1) return idxA - idxB;
			if (idxA !== -1) return -1;
			if (idxB !== -1) return 1;
			return 0;
		});
		return ordered.slice(0, 3);
	});

	async function loadDashboardData() {
		username = getSavedUsername();
		activeLanguage = getSavedLanguage();
		recentPackIds = getRecentlyOpenedPackIds();
		isCloudUser = isCloudSyncEnabled();

		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const migratedXP = migrateHistoricalProgressXP(progress);
		xpStats = computeLevelStats(migratedXP.totalXP, migratedXP.dailyXP);

		const builtinPacks = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		rawCustomDecks = customDecks;
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
				const p: WordProgress | undefined = getWordProgress(
					progress,
					pack.id,
					word.No,
					activeLanguage
				);
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
				const p = getWordProgress(progress, deck.id, word.No, deck.language || activeLanguage);
				if (p) {
					if (isCardMastered(p)) mastered++;
					else if (isCardLearning(p)) learning++;
					if (isCardDue(p)) due++;
					if (p.wrong > 0) weakAccumulator++;
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
		totalWeakCount = weakAccumulator;

		// Recommended deck: first deck with due cards or first deck
		recommendedDeck =
			summaries.find((d) => d.dueCards > 0 && d.masteredCards < d.totalCards) ||
			summaries[0] ||
			null;
	}

	function switchLanguage(lang: 'chinese' | 'french') {
		if (activeLanguage === lang) return;
		setSavedLanguage(lang);
		loadDashboardData();
	}

	function handleEditCustomDeck(deckSummary: DeckSummary) {
		const target = rawCustomDecks.find((d) => d.id === deckSummary.id);
		if (target) {
			editingDeck = target;
			isSpreadsheetModalOpen = true;
		}
	}

	async function handleSaveCustomDeck(deck: CustomDeck) {
		await saveCustomDeck(deck);
		scheduleDebouncedSync();
		await loadDashboardData();
	}

	async function handleDeleteCustomDeck(id: string) {
		if (confirm('Are you sure you want to delete this custom deck?')) {
			await deleteCustomDeck(id);
			scheduleDebouncedSync();
			await loadDashboardData();
		}
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
	<!-- 1. GREETING HERO -->
	<section
		class="shadow-card relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7"
	>
		<!-- Mild Scenic Landscape Background Layer -->
		<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
			<img
				src="/images/greeting-bg.jpg"
				alt=""
				class="h-full w-full object-cover object-center opacity-95"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent"></div>
		</div>

		<div class="relative z-10 flex h-full flex-1 items-stretch justify-between">
			<div class="flex flex-col justify-around py-0.5">
				<p class="font-body text-xs font-semibold tracking-wider text-slate-600 uppercase">
					{username ? 'Good day,' : 'Welcome back,'}
				</p>
				<h2 class="font-headline text-2xl font-extrabold tracking-tight text-slate-900 capitalize">
					{username ? `${username}! 👋` : 'Learner! 👋'}
				</h2>
				<div class="flex items-center gap-1.5">
					<span
						class="inline-flex items-center gap-1 rounded-md bg-indigo-100/90 px-2 py-0.5 text-[11px] font-bold text-indigo-800 backdrop-blur-xs"
					>
						<Sparkles size={11} strokeWidth={2.5} class="text-indigo-600" />
						{streakStats.tierName}
					</span>
					<span class="text-[11px] font-medium text-slate-600">• Daily habit</span>
				</div>
			</div>

			<!-- Streak Motivation Trigger -->
			<div class="flex items-center">
				<button
					type="button"
					onclick={() => (isStreakModalOpen = true)}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-white/95 px-3.5 py-2.5 text-center shadow-xs backdrop-blur-xs transition-transform hover:scale-105 active:scale-95"
				>
					<Flame size={22} strokeWidth={2.25} class="fill-amber-500/20 text-amber-500" />
					<span class="font-headline text-xs font-extrabold text-amber-900">
						{streakStats.currentStreak}d
					</span>
				</button>
			</div>
		</div>
	</section>

	<!-- 2. RECOMMENDED NEXT ACTION (PRIMARY CTA) -->
	{#if recommendedDeck}
		{@const deckProgressPercent =
			recommendedDeck.totalCards > 0
				? Math.round((recommendedDeck.masteredCards / recommendedDeck.totalCards) * 100)
				: 0}
		<section
			class="shadow-card hover:shadow-card-hover relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 transition-all hover:border-emerald-200"
		>
			<div class="mb-2.5 flex items-center justify-between">
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600"></span>
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

	<!-- 3. WHAT NEEDS ATTENTION (PRACTICE HUB) -->
	<section class="space-y-2">
		<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
			Needs Attention
		</h3>

		<!-- Difficult Words Practice Card -->
		<a
			href={resolve('/practice')}
			class="shadow-card hover:shadow-card-hover group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4.5 transition-all hover:-translate-y-0.5 hover:border-rose-300 active:scale-[0.98]"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200/70 bg-rose-50 text-rose-600 transition-transform group-hover:scale-105"
				>
					<Dumbbell size={22} strokeWidth={2.25} />
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span
							class="rounded-full border border-rose-200/60 bg-rose-50 px-2 py-0.5 font-headline text-[10px] font-bold text-rose-700"
						>
							PRACTICE
						</span>
					</div>
					<h4 class="font-headline text-base font-extrabold text-slate-900">Difficult Words</h4>
					<p class="font-body text-xs text-slate-500">
						{totalWeakCount}
						{totalWeakCount === 1 ? 'word needs' : 'words need'} reinforcement
					</p>
				</div>
			</div>

			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 transition-colors group-hover:bg-rose-500 group-hover:text-white"
			>
				<ArrowRight
					size={16}
					strokeWidth={2.5}
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</div>
		</a>
	</section>

	<!-- XP LEADERBOARD PROMOTION CARD -->
	<section class="space-y-2">
		<a
			href={resolve('/leaderboard')}
			class="shadow-card hover:shadow-card-hover group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-4.5 transition-all hover:-translate-y-0.5 hover:border-amber-300 active:scale-[0.98]"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/80 bg-amber-50 text-amber-600 shadow-xs transition-transform group-hover:scale-105"
				>
					<Trophy size={22} strokeWidth={2.25} />
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<span
							class="rounded-full bg-amber-100/90 px-2 py-0.5 font-headline text-[10px] font-bold text-amber-900"
						>
							GLOBAL RANKINGS
						</span>
						{#if isCloudUser && xpStats}
							<span
								class="rounded-full border px-2 py-0.5 font-headline text-[10px] font-bold {xpStats
									.theme.badgeBg} {xpStats.theme.badgeText} {xpStats.theme.badgeBorder}"
							>
								Lvl {xpStats.level}
							</span>
						{/if}
					</div>
					<h3 class="font-headline text-base font-extrabold text-slate-900">XP Leaderboard</h3>
					<p class="font-body text-xs text-slate-500">
						{#if isCloudUser && xpStats}
							You earned <span class="font-bold text-amber-700"
								>{xpStats.weeklyXP.toLocaleString()} XP</span
							> this week
						{:else}
							Sign in with Cloud to view global standings & compete
						{/if}
					</p>
				</div>
			</div>

			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-800 transition-colors group-hover:bg-amber-500 group-hover:text-white"
			>
				<ArrowRight
					size={16}
					strokeWidth={2.5}
					class="transition-transform group-hover:translate-x-0.5"
				/>
			</div>
		</a>
	</section>

	<!-- 4. RECENTLY OPENED PACKS -->
	<section class="space-y-3 pt-1">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-1.5">
				<BookOpen size={18} strokeWidth={2.25} class="text-emerald-600" />
				<h3 class="font-headline text-base font-bold text-slate-900">Recent Packs</h3>
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

		<!-- Pack Cards List (Top 3 Recent) -->
		<div class="space-y-2.5">
			{#if displayedRecentDecks().length === 0}
				<div
					class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400"
				>
					<p class="font-headline text-xs font-bold">
						No vocabulary packs found for {activeLanguage}.
					</p>
				</div>
			{:else}
				{#each displayedRecentDecks() as deck (deck.id)}
					<DeckCard
						{deck}
						onSelect={() => (recentPackIds = getRecentlyOpenedPackIds())}
						onEdit={deck.isCustom ? handleEditCustomDeck : undefined}
						onDelete={deck.isCustom ? (d) => handleDeleteCustomDeck(d.id) : undefined}
					/>
				{/each}
			{/if}
		</div>

		<!-- View All Decks Link -->
		{#if deckSummaries.length > 3}
			<div class="pt-1">
				<a
					href={resolve('/decks')}
					class="group flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200/90 bg-white font-headline text-xs font-bold text-slate-700 shadow-xs transition-all hover:border-indigo-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.99]"
				>
					<span>View all {deckSummaries.length} packs in Decks</span>
					<ArrowRight
						size={14}
						strokeWidth={2.25}
						class="transition-transform group-hover:translate-x-0.5"
					/>
				</a>
			</div>
		{/if}
	</section>
</main>

<!-- Streak Calendar Modal -->
<StreakCalendarModal
	isOpen={isStreakModalOpen}
	streak={streakStats.currentStreak}
	activeDates={streakStats.activeDates}
	onClose={() => (isStreakModalOpen = false)}
/>

<!-- SPREADSHEET DECK EDITOR MODAL -->
<DeckSpreadsheetModal
	isOpen={isSpreadsheetModalOpen}
	deckToEdit={editingDeck}
	initialLanguage={activeLanguage}
	onClose={() => (isSpreadsheetModalOpen = false)}
	onSave={handleSaveCustomDeck}
/>
