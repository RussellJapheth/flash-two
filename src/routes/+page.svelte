<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import DeckCard from '$lib/components/DeckCard.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import StreakCalendarModal from '$lib/components/StreakCalendarModal.svelte';
	import DeckSpreadsheetModal from '$lib/components/DeckSpreadsheetModal.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { openModal, closeModal } from '$lib/utils/backNav';
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
		getRecentlyOpenedPackIds,
		isLeaderboardDisabled,
		isDeckArchived
	} from '$lib/utils/storage';
	import { computeLevelStats, getLocalUserXPData, isCloudSyncEnabled } from '$lib/utils/xp';
	import { scheduleDebouncedSync, subscribeDataChanged } from '$lib/utils/cloud';
	import { isCardDue, isCardMastered, isCardLearning } from '$lib/utils/srs';
	import type { DeckSummary, StreakStats, WordProgress, CustomDeck, XPStats } from '$lib/types';
	import {
		Flame,
		Dumbbell,
		PlayCircle,
		ArrowRight,
		Sparkles,
		BookOpen,
		Trophy,
		MessagesSquare,
		Volume2,
		Gamepad2,
		Brain
	} from 'lucide-svelte';

	interface RecommendedActivity {
		id: string;
		title: string;
		subtitle: string;
		badgeText: string;
		href: string;
		actionLabel: string;
		icon: typeof PlayCircle;
		deckProgress?: {
			mastered: number;
			total: number;
		};
	}

	let username = $state('Russell');
	let activeLanguage = $state<'chinese' | 'french'>('chinese');
	let isCloudUser = $state(false);
	let leaderboardsDisabled = $state(true);
	let xpStats = $state<XPStats | null>(null);
	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 0,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: [],
		freezeDates: []
	});

	let deckSummaries = $state<DeckSummary[]>([]);
	let rawCustomDecks = $state<CustomDeck[]>([]);
	let recentPackIds = $state<string[]>([]);
	let totalWeakCount = $state(0);

	let recommendedActivity = $state<RecommendedActivity | null>(null);
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
		leaderboardsDisabled = isLeaderboardDisabled();

		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const xpData = getLocalUserXPData();
		xpStats = computeLevelStats(xpData.totalXP, xpData.dailyXP);

		const builtinPacks = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		rawCustomDecks = customDecks;
		const matchingCustom = customDecks.filter((d) => !d.language || d.language === activeLanguage);

		let weakAccumulator = 0;

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

			summaries.push({
				id: pack.id,
				title: pack.title,
				language: activeLanguage,
				totalCards: pack.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: false,
				isArchived: isDeckArchived(pack.id)
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
				isCustom: true,
				isArchived: isDeckArchived(deck.id)
			});
		}

		deckSummaries = summaries;
		totalWeakCount = weakAccumulator;

		// Build Recommended Activity Pool to alternate across diverse features:
		// 1. Last deck worked on (or primary vocabulary deck)
		// 2. Sentence practice on deck
		// 3. Audio-first listening practice
		// 4. Arcade game (Tone Pair Lab / Match Blitz)
		// 5. Interleaved spaced review (if cards due)
		// 6. Difficult words drill (if weak cards)
		// 7. Interactive story (if Chinese)
		const activeDecks = summaries.filter((d) => !d.isArchived);
		let targetDeck: DeckSummary | null = null;
		for (const id of recentPackIds) {
			const match = activeDecks.find((d) => d.id === id);
			if (match) {
				targetDeck = match;
				break;
			}
		}
		if (!targetDeck) {
			const dueDecks = activeDecks.filter((d) => d.dueCards > 0 && d.masteredCards < d.totalCards);
			const unmasteredDecks = activeDecks.filter((d) => d.masteredCards < d.totalCards);
			targetDeck = dueDecks[0] || unmasteredDecks[0] || activeDecks[0] || null;
		}

		const activities: RecommendedActivity[] = [];

		if (targetDeck) {
			// 1. Last Deck Worked On / Priority Deck
			activities.push({
				id: `deck-${targetDeck.id}`,
				title: targetDeck.title,
				subtitle: 'Review vocabulary flashcards with active recall and spaced repetition.',
				badgeText: `${targetDeck.dueCards} cards ready`,
				href: `/deck/${targetDeck.id}/preview`,
				actionLabel: 'Start Session',
				icon: PlayCircle,
				deckProgress: {
					mastered: targetDeck.masteredCards,
					total: targetDeck.totalCards
				}
			});

			// 2. Sentence Practice
			activities.push({
				id: `sentences-${targetDeck.id}`,
				title: `Sentence Drill: ${targetDeck.title}`,
				subtitle: 'Practice cloze fill-ins, speech recognition chunks, and unscramble drills.',
				badgeText: 'Context & Cloze',
				href: `/practice/sentences/${targetDeck.id}`,
				actionLabel: 'Practice Sentences',
				icon: MessagesSquare
			});

			// 3. Listening Practice (Audio-First)
			activities.push({
				id: `listening-${targetDeck.id}`,
				title: `Audio-First Recall: ${targetDeck.title}`,
				subtitle: 'Listen to native pronunciation before revealing characters and meanings.',
				badgeText: 'Audio-First',
				href: `/study/${targetDeck.id}?mode=srs&audioFirst=true`,
				actionLabel: 'Start Listening Drill',
				icon: Volume2
			});
		}

		// 4. Arcade Games
		if (activeLanguage === 'chinese') {
			activities.push({
				id: 'arcade-tone-pairs',
				title: 'Tone Pair Lab',
				subtitle: 'Master all 16 two-syllable pitch combinations with interactive contours.',
				badgeText: '16 Pitch Pairs',
				href: '/games/tone-pairs',
				actionLabel: 'Play Tone Pairs',
				icon: Gamepad2
			});
		}

		activities.push({
			id: 'arcade-match-blitz',
			title: 'Match Blitz',
			subtitle: 'Speed tile-matching race with combo streaks and multiplier bonuses.',
			badgeText: 'Speed Combo',
			href: '/games/match-blitz',
			actionLabel: 'Play Match Blitz',
			icon: Gamepad2
		});

		// 5. Spaced Review
		const totalDueCards = summaries.reduce((acc, d) => acc + (d.isArchived ? 0 : d.dueCards), 0);
		if (totalDueCards > 0) {
			activities.push({
				id: 'spaced-review-global',
				title: 'Interleaved Spaced Review',
				subtitle:
					'Review due cards shuffled across all your decks to optimize long-term retention.',
				badgeText: `${totalDueCards} cards due`,
				href: '/review',
				actionLabel: 'Review Due Cards',
				icon: Brain
			});
		}

		// 6. Difficult Words Practice (if any weak cards)
		if (weakAccumulator > 0) {
			activities.push({
				id: 'difficult-words',
				title: 'Difficult Words Practice',
				subtitle: `${weakAccumulator} ${weakAccumulator === 1 ? 'word needs' : 'words need'} targeted reinforcement.`,
				badgeText: `${weakAccumulator} weak cards`,
				href: '/practice',
				actionLabel: 'Practice Weak Words',
				icon: Dumbbell
			});
		}

		// 7. Interactive Story (for Chinese)
		if (activeLanguage === 'chinese') {
			activities.push({
				id: 'story-panda',
				title: "The Little Panda's Red Apple",
				subtitle: 'Follow illustrated story dialogue, speech scoring, and comprehension questions.',
				badgeText: 'Voiced Story',
				href: '/story/little-panda-apple',
				actionLabel: 'Read Story',
				icon: BookOpen
			});
		}

		if (activities.length > 0) {
			let storedOffset = 0;
			if (typeof localStorage !== 'undefined') {
				storedOffset = parseInt(
					localStorage.getItem('flashcards_recommended_activity_offset') ||
						localStorage.getItem('flashcards_recommended_offset') ||
						'0',
					10
				);
				if (isNaN(storedOffset)) storedOffset = 0;
				localStorage.setItem(
					'flashcards_recommended_activity_offset',
					String((storedOffset + 1) % activities.length)
				);
			}
			recommendedActivity = activities[storedOffset % activities.length] || activities[0];
		} else {
			recommendedActivity = null;
		}
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
			openModal({ spreadsheetOpen: true });
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
		const unsubscribe = subscribeDataChanged(() => {
			loadDashboardData();
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<title>FlashCards — Dashboard</title>
</svelte:head>

<TopHeader
	title="FlashCards"
	streak={streakStats.currentStreak}
	onOpenStreak={() => openModal({ calendarOpen: true })}
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
			<div
				class="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent"
			></div>
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
					onclick={() => openModal({ calendarOpen: true })}
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
	{#if recommendedActivity}
		{@const Icon = recommendedActivity.icon}
		<section
			class="shadow-card hover:shadow-card-hover relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 transition-all hover:border-indigo-200"
		>
			<div class="mb-2.5 flex items-center justify-between">
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-800"
				>
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-600"></span>
					<span>RECOMMENDED DRILL</span>
				</div>
				<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
					{recommendedActivity.badgeText}
				</span>
			</div>

			<h3 class="font-headline text-lg font-extrabold tracking-tight text-slate-900">
				{recommendedActivity.title}
			</h3>

			<p class="mt-1 font-sans text-xs text-slate-500">
				{recommendedActivity.subtitle}
			</p>

			{#if recommendedActivity.deckProgress}
				{@const deckProgressPercent =
					recommendedActivity.deckProgress.total > 0
						? Math.round(
								(recommendedActivity.deckProgress.mastered /
									recommendedActivity.deckProgress.total) *
									100
							)
						: 0}
				<div class="mt-2.5 mb-4 space-y-1.5">
					<div class="flex justify-between text-xs font-medium text-slate-500">
						<span>Mastery</span>
						<span class="font-semibold text-slate-700"
							>{recommendedActivity.deckProgress.mastered} / {recommendedActivity.deckProgress
								.total} ({deckProgressPercent}%)</span
						>
					</div>
					<ProgressBar
						value={recommendedActivity.deckProgress.mastered}
						max={recommendedActivity.deckProgress.total}
						variant="emerald"
						height="h-2"
					/>
				</div>
			{:else}
				<div class="h-4"></div>
			{/if}

			<a
				href={resolve(recommendedActivity.href as '/')}
				class="group flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98]"
			>
				<Icon size={19} strokeWidth={2.25} class="transition-transform group-hover:scale-110" />
				<span>{recommendedActivity.actionLabel}</span>
			</a>
		</section>
	{/if}

	<!-- MANDARIN TEXTBOOK COURSE BANNER -->
	{#if activeLanguage === 'chinese'}
		<section class="space-y-2">
			<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
				Structured Course
			</h3>
			<a
				href={resolve('/textbook')}
				class="shadow-card hover:shadow-card-hover group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-indigo-200/80 bg-linear-to-r from-indigo-50/80 via-white to-violet-50/50 p-4.5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 active:scale-[0.98]"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200/70 bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105"
					>
						<BookOpen size={22} strokeWidth={2.25} />
					</div>
					<div>
						<div class="flex items-center gap-1.5">
							<span
								class="rounded-full border border-indigo-200/60 bg-indigo-50 px-2 py-0.5 font-headline text-[10px] font-bold text-indigo-700"
							>
								36 UNITS · ZERO TO FLUENCY
							</span>
						</div>
						<h4 class="font-headline text-base font-extrabold text-slate-900">Mandarin Textbook</h4>
						<p class="font-body text-xs text-slate-500">
							Pronunciation, authentic dialogues, grammar, and XP checks
						</p>
					</div>
				</div>

				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
				>
					<ArrowRight
						size={16}
						strokeWidth={2.5}
						class="transition-transform group-hover:translate-x-0.5"
					/>
				</div>
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
	{#if !leaderboardsDisabled}
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
	{/if}

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
	isOpen={page.state.calendarOpen === true}
	streak={streakStats.currentStreak}
	freezeCount={streakStats.freezeCount}
	activeDates={streakStats.activeDates}
	freezeDates={streakStats.freezeDates}
	onClose={closeModal}
/>

<!-- SPREADSHEET DECK EDITOR MODAL -->
<DeckSpreadsheetModal
	isOpen={page.state.spreadsheetOpen === true}
	deckToEdit={editingDeck}
	initialLanguage={activeLanguage}
	onClose={closeModal}
	onSave={handleSaveCustomDeck}
/>
