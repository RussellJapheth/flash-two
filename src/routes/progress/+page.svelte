<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		getAllProgress,
		getWordProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		computeStreakStats,
		isLeaderboardDisabled
	} from '$lib/utils/storage';
	import { computeLevelStats, getLevelTheme, getLocalUserXPData } from '$lib/utils/xp';
	import { isCardMastered, isCardLearning, isCardDue } from '$lib/utils/srs';
	import { getStudyTimeData, subscribeStudyTimer, formatTimerDisplay } from '$lib/utils/studyTimer';
	import type { StreakStats, XPStats, StudyTimeData, ActiveStudyTimerState } from '$lib/types';
	import { ChevronRight, MessagesSquare, BarChart3, Wrench } from 'lucide-svelte';

	import XPHero from '$lib/components/progress/XPHero.svelte';
	import ProgressMetricGrid from '$lib/components/progress/ProgressMetricGrid.svelte';
	import WeeklyActivityChart from '$lib/components/progress/WeeklyActivityChart.svelte';
	import RetentionBreakdown from '$lib/components/progress/RetentionBreakdown.svelte';
	import StudyTimerCard from '$lib/components/progress/StudyTimerCard.svelte';
	import QuickActionsGrid from '$lib/components/progress/QuickActionsGrid.svelte';
	import ExportLearnedWordsSection from '$lib/components/progress/ExportLearnedWordsSection.svelte';

	let activeTab = $derived<'overview' | 'tools'>(
		page.url.searchParams.get('tab') === 'tools' ? 'tools' : 'overview'
	);

	function switchTab(tab: 'overview' | 'tools') {
		const query = tab === 'tools' ? '?tab=tools' : '';
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query string navigation on resolved route
		goto(`${resolve('/progress')}${query}`, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	}

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 0,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: [],
		freezeDates: []
	});

	let xpStats = $state<XPStats>({
		totalXP: 0,
		weeklyXP: 0,
		monthlyXP: 0,
		level: 1,
		levelTitle: 'Novice Explorer',
		currentLevelXP: 0,
		nextLevelXP: 50,
		progressInLevelPercent: 0,
		theme: getLevelTheme(1)
	});

	let totalWordsCount = $state(0);
	let masteredWordsCount = $state(0);
	let learningWordsCount = $state(0);
	let dueWordsCount = $state(0);
	let overallAccuracy = $state(0);
	let weeklyActivity = $state<{ day: string; count: number; isToday: boolean }[]>([]);

	let leaderboardsDisabled = $state(true);

	let studyTimeStats = $state<StudyTimeData>({
		totalSeconds: 0,
		dailySeconds: {},
		sessionsCount: 0
	});

	let activeTimer = $state<ActiveStudyTimerState>({
		status: 'idle',
		elapsedSeconds: 0,
		sessionStartedAt: 0,
		lastActiveTimestamp: 0
	});

	let todayISO = new Date().toISOString().split('T')[0];

	let effectiveTotalStudySeconds = $derived(
		studyTimeStats.totalSeconds + (activeTimer.status !== 'idle' ? activeTimer.elapsedSeconds : 0)
	);

	let todayStudySeconds = $derived(
		(studyTimeStats.dailySeconds[todayISO] || 0) +
			(activeTimer.status !== 'idle' ? activeTimer.elapsedSeconds : 0)
	);

	let masteredPercent = $derived(
		totalWordsCount > 0 ? Math.round((masteredWordsCount / totalWordsCount) * 100) : 0
	);

	let totalLearnedWords = $derived(masteredWordsCount + learningWordsCount);

	async function loadProgressStats() {
		leaderboardsDisabled = isLeaderboardDisabled();
		studyTimeStats = getStudyTimeData();
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const xpData = getLocalUserXPData();
		xpStats = computeLevelStats(xpData.totalXP, xpData.dailyXP);

		const chPacks = await getBuiltinPacks('chinese');
		const frPacks = await getBuiltinPacks('french');
		const customDecks = await getAllCustomDecks();

		let totalWords = 0;
		let mastered = 0;
		let learning = 0;
		let due = 0;
		let totalCorrect = 0;
		let totalAttempts = 0;

		const allActivePacks = [
			...chPacks.map((p) => ({ id: p.id, words: p.words, lang: 'chinese' as const })),
			...frPacks.map((p) => ({ id: p.id, words: p.words, lang: 'french' as const })),
			...customDecks.map((d) => ({
				id: d.id,
				words: d.words,
				lang: (d.language || 'chinese') as 'chinese' | 'french'
			}))
		];

		for (const pack of allActivePacks) {
			totalWords += pack.words.length;
			for (const word of pack.words) {
				const p = getWordProgress(progress, pack.id, word.No, pack.lang);
				if (p) {
					if (isCardMastered(p)) mastered++;
					else if (isCardLearning(p)) learning++;
					if (isCardDue(p)) due++;
					totalCorrect += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++;
				}
			}
		}

		totalWordsCount = totalWords;
		masteredWordsCount = mastered;
		learningWordsCount = learning;
		dueWordsCount = due;
		overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

		// Calculate 7-day weekly activity
		const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const today = new Date();
		const activity = [];

		for (let i = 6; i >= 0; i--) {
			const targetDate = new Date(today.getTime() - i * 86400000);
			const iso = targetDate.toISOString().split('T')[0];
			const dayLabel = dayLabels[targetDate.getDay()];
			const isCurrent = i === 0;

			let count = 0;
			for (const p of Object.values(progress)) {
				if (p.lastReviewed) {
					const pIso = new Date(p.lastReviewed).toISOString().split('T')[0];
					if (pIso === iso) {
						count += (p.correct || 0) + (p.wrong || 0);
					}
				}
			}

			if (count === 0 && xpData.dailyXP && xpData.dailyXP[iso]) {
				count = Math.max(1, Math.round(xpData.dailyXP[iso] / 2));
			}

			activity.push({ day: dayLabel, count, isToday: isCurrent });
		}

		weeklyActivity = activity;
	}

	onMount(() => {
		loadProgressStats();
		const unsubscribe = subscribeStudyTimer((s) => {
			activeTimer = s;
			studyTimeStats = getStudyTimeData();
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Progress & Insights — FlashCards</title>
</svelte:head>

<TopHeader title="Progress" streak={streakStats.currentStreak} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- SEGMENTED CONTROL TAB SWITCHER -->
	<div
		class="grid grid-cols-2 rounded-2xl border border-slate-200/60 bg-slate-100 p-1"
		role="tablist"
		aria-label="Progress views"
	>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'overview'}
			onclick={() => switchTab('overview')}
			class="flex items-center justify-center gap-2 rounded-xl py-2.5 font-headline text-xs font-bold transition-all {activeTab ===
			'overview'
				? 'bg-white text-indigo-600 shadow-xs'
				: 'text-slate-500 hover:text-slate-900'}"
		>
			<BarChart3 size={16} strokeWidth={2.25} />
			<span>Overview & Stats</span>
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={activeTab === 'tools'}
			onclick={() => switchTab('tools')}
			class="flex items-center justify-center gap-2 rounded-xl py-2.5 font-headline text-xs font-bold transition-all {activeTab ===
			'tools'
				? 'bg-white text-indigo-600 shadow-xs'
				: 'text-slate-500 hover:text-slate-900'}"
		>
			<Wrench size={16} strokeWidth={2.25} />
			<span>Tools & Actions</span>
		</button>
	</div>

	<!-- ACTIVE SESSION NOTIFICATION BANNER (When timer running while on Overview) -->
	{#if activeTab === 'overview' && activeTimer.status !== 'idle'}
		<div
			class="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-2.5 shadow-xs"
		>
			<div class="flex items-center gap-2">
				<span class="relative flex h-2.5 w-2.5">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
				</span>
				<span class="font-headline text-xs font-bold text-emerald-950">
					Study Session Active: {formatTimerDisplay(activeTimer.elapsedSeconds)}
				</span>
			</div>
			<button
				type="button"
				onclick={() => switchTab('tools')}
				class="font-headline text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
			>
				Manage Timer &rarr;
			</button>
		</div>
	{/if}

	{#if activeTab === 'overview'}
		<XPHero {xpStats} {leaderboardsDisabled} />

		<ProgressMetricGrid
			{overallAccuracy}
			{streakStats}
			{effectiveTotalStudySeconds}
			{studyTimeStats}
			{masteredWordsCount}
			{masteredPercent}
		/>

		<WeeklyActivityChart {weeklyActivity} />

		<RetentionBreakdown
			{totalWordsCount}
			{masteredWordsCount}
			{learningWordsCount}
			{dueWordsCount}
		/>
	{:else}
		<StudyTimerCard
			{activeTimer}
			{todayStudySeconds}
			{effectiveTotalStudySeconds}
			{studyTimeStats}
		/>

		<QuickActionsGrid {streakStats} />

		{#if masteredWordsCount > 0}
			<section
				class="shadow-card flex items-center justify-between gap-3 rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 transition-all hover:bg-emerald-50"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-600 text-white shadow-xs"
					>
						<MessagesSquare size={20} strokeWidth={2.25} />
					</div>
					<div>
						<h4 class="font-headline text-sm font-bold text-slate-900">Sentence Practice</h4>
						<p class="font-sans text-xs text-slate-500">
							Drill {masteredWordsCount.toLocaleString()} mastered words in context
						</p>
					</div>
				</div>
				<a
					href={resolve('/practice/sentences/mastered')}
					class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-[0.98]"
				>
					<span>Practice</span>
					<ChevronRight size={14} strokeWidth={2.25} />
				</a>
			</section>
		{/if}

		<ExportLearnedWordsSection {totalLearnedWords} />
	{/if}
</main>
