<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
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
	import type { StreakStats, XPStats } from '$lib/types';
	import {
		ShieldCheck,
		History,
		Flame,
		ChevronRight,
		Bookmark,
		Download,
		FileSpreadsheet,
		Check,
		Sparkles,
		Trophy
	} from 'lucide-svelte';

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
	let isExporting = $state(false);
	let exportMessage = $state('');

	let leaderboardsDisabled = $state(true);

	async function loadProgressStats() {
		leaderboardsDisabled = isLeaderboardDisabled();
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

			activity.push({ day: dayLabel, count, isToday: isCurrent });
		}

		weeklyActivity = activity;
	}

	async function handleExportLearnedWords() {
		if (isExporting) return;
		isExporting = true;
		exportMessage = '';

		try {
			const progress = await getAllProgress();
			const chPacks = await getBuiltinPacks('chinese');
			const frPacks = await getBuiltinPacks('french');
			const customDecks = await getAllCustomDecks();

			const allActivePacks = [
				...chPacks.map((p) => ({
					id: p.id,
					title: p.title,
					words: p.words,
					lang: 'chinese' as const
				})),
				...frPacks.map((p) => ({
					id: p.id,
					title: p.title,
					words: p.words,
					lang: 'french' as const
				})),
				...customDecks.map((d) => ({
					id: d.id,
					title: d.name,
					words: d.words,
					lang: (d.language || 'chinese') as 'chinese' | 'french'
				}))
			];

			const headers = [
				'Language',
				'Deck / Pack',
				'Word #',
				'Target Word',
				'Pinyin / Phonetic',
				'Part of Speech',
				'English Meaning',
				'Mastery Stage',
				'Correct Reviews',
				'Incorrect Reviews',
				'Accuracy (%)',
				'Interval (Days)',
				'Repetitions',
				'Last Reviewed',
				'Example'
			];

			const rows: string[][] = [headers];
			let exportCount = 0;

			for (const pack of allActivePacks) {
				for (const word of pack.words) {
					const p = getWordProgress(progress, pack.id, word.No, pack.lang);
					if (
						p &&
						(isCardMastered(p) ||
							isCardLearning(p) ||
							(p.correct || 0) + (p.wrong || 0) > 0 ||
							(p.reps || 0) > 0)
					) {
						exportCount++;
						const stage = isCardMastered(p) ? 'Mastered' : 'Learning';
						const attempts = (p.correct || 0) + (p.wrong || 0);
						const acc = attempts > 0 ? `${Math.round(((p.correct || 0) / attempts) * 100)}%` : '0%';
						const targetWord = word['Chinese Word'] || word['French Word'] || '';
						const pinyin = word.Pinyin || '';
						const pos = word['Part of Speech'] || '';
						const meaning = word['English Meaning'] || '';
						const lastReviewed = p.lastReviewed
							? new Date(p.lastReviewed).toISOString().replace('T', ' ').substring(0, 19)
							: '';
						const example = word['Example (Chinese + Pinyin)'] || word['Example (French)'] || '';

						rows.push([
							pack.lang === 'chinese' ? 'Chinese' : 'French',
							pack.title,
							String(word.No),
							targetWord,
							pinyin,
							pos,
							meaning,
							stage,
							String(p.correct || 0),
							String(p.wrong || 0),
							acc,
							String(p.interval || 0),
							String(p.reps || 0),
							lastReviewed,
							example
						]);
					}
				}
			}

			if (exportCount === 0) {
				exportMessage = 'No learned words yet to export.';
				setTimeout(() => (exportMessage = ''), 3000);
				isExporting = false;
				return;
			}

			const csvContent = rows
				.map((row) =>
					row
						.map((cell) => {
							const str = cell ?? '';
							if (
								str.includes(',') ||
								str.includes('"') ||
								str.includes('\n') ||
								str.includes('\r')
							) {
								return `"${str.replace(/"/g, '""')}"`;
							}
							return str;
						})
						.join(',')
				)
				.join('\r\n');

			// UTF-8 BOM prefix (\uFEFF) ensures Excel, Numbers, and Google Sheets correctly display non-ASCII characters across Windows, Mac, iOS, and Android
			const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
			const filename = `flashcards-learned-words-${new Date().toISOString().split('T')[0]}.csv`;

			// Cross-platform download execution compatible with desktop browsers and mobile web
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();

			setTimeout(() => {
				if (document.body.contains(a)) {
					document.body.removeChild(a);
				}
				URL.revokeObjectURL(url);
			}, 1500);

			exportMessage = `Exported ${exportCount} learned words!`;
			setTimeout(() => (exportMessage = ''), 3500);
		} catch (e) {
			console.error('Failed to export learned words CSV:', e);
			exportMessage = 'Export failed. Please try again.';
			setTimeout(() => (exportMessage = ''), 3500);
		} finally {
			isExporting = false;
		}
	}

	let unstartedWordsCount = $derived(
		Math.max(0, totalWordsCount - masteredWordsCount - learningWordsCount)
	);

	let masteredPercent = $derived(
		totalWordsCount > 0 ? Math.round((masteredWordsCount / totalWordsCount) * 100) : 0
	);

	let learningPercent = $derived(
		totalWordsCount > 0 ? Math.round((learningWordsCount / totalWordsCount) * 100) : 0
	);

	let unstartedPercent = $derived(
		totalWordsCount > 0 ? Math.max(0, 100 - masteredPercent - learningPercent) : 0
	);

	const CIRCLE_RADIUS = 38;
	const CIRCUMFERENCE = +(2 * Math.PI * CIRCLE_RADIUS).toFixed(2);

	let masteredDash = $derived(
		totalWordsCount > 0 ? +((masteredWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);

	let learningDash = $derived(
		totalWordsCount > 0 ? +((learningWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);

	let unstartedDash = $derived(
		totalWordsCount > 0 ? +((unstartedWordsCount / totalWordsCount) * CIRCUMFERENCE).toFixed(2) : 0
	);

	let totalLearnedWords = $derived(masteredWordsCount + learningWordsCount);

	let maxActivityCount = $derived(Math.max(1, ...weeklyActivity.map((a) => a.count)));

	onMount(() => {
		loadProgressStats();
	});
</script>

<svelte:head>
	<title>Progress & Insights — FlashCards</title>
</svelte:head>

<TopHeader title="Progress" streak={streakStats.currentStreak} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- XP & LEVEL PROGRESSION HERO -->
	<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
		<!-- Header: Level Badge & Title + Leaderboard Action -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span
					class="rounded-full border px-2.5 py-0.5 font-headline text-[11px] font-bold {xpStats
						.theme.badgeBg} {xpStats.theme.badgeText} {xpStats.theme.badgeBorder}"
				>
					LEVEL {xpStats.level}
				</span>
				<p class="font-headline text-xs font-bold text-slate-500">{xpStats.levelTitle}</p>
			</div>

			{#if !leaderboardsDisabled}
				<a
					href={resolve('/leaderboard')}
					class="flex items-center gap-1 rounded-2xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 font-headline text-xs font-bold text-amber-900 shadow-xs transition-colors hover:bg-amber-100"
				>
					<Trophy size={14} strokeWidth={2.25} class="text-amber-600" />
					<span>Leaderboard</span>
					<ChevronRight size={13} strokeWidth={2.5} class="text-amber-700" />
				</a>
			{/if}
		</div>

		<!-- Main XP Counter -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-600"
			>
				<Sparkles size={22} strokeWidth={2} />
			</div>
			<div>
				<p class="font-headline text-2xl font-black text-slate-900">
					{xpStats.totalXP.toLocaleString()}
					<span class="text-sm font-bold text-slate-500">XP</span>
				</p>
			</div>
		</div>

		<!-- Level progress bar -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs font-medium text-slate-500">
				<span>Progress to Level {xpStats.level + 1}</span>
				<span class="font-semibold text-slate-700">{xpStats.progressInLevelPercent}%</span>
			</div>
			<ProgressBar
				value={xpStats.totalXP - xpStats.currentLevelXP}
				max={xpStats.nextLevelXP - xpStats.currentLevelXP}
				variant="amber"
				height="h-2.5"
			/>
			<div class="flex justify-between text-[11px] text-slate-400">
				<span>{xpStats.currentLevelXP} XP</span>
				<span>{xpStats.nextLevelXP - xpStats.totalXP} XP needed</span>
				<span>{xpStats.nextLevelXP} XP</span>
			</div>
		</div>

		<!-- XP Timeframe Breakdown Cards -->
		<div class="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3">
			<div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
				<p class="font-headline text-lg font-black text-indigo-600">
					{xpStats.weeklyXP.toLocaleString()}
				</p>
				<p class="text-[11px] font-bold text-slate-500">7-Day Weekly XP</p>
			</div>
			<div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
				<p class="font-headline text-lg font-black text-amber-600">
					{xpStats.monthlyXP.toLocaleString()}
				</p>
				<p class="text-[11px] font-bold text-slate-500">30-Day Monthly XP</p>
			</div>
		</div>
	</section>

	<!-- Quick Links -->
	<div class="grid grid-cols-2 gap-3">
		<a
			href={resolve('/streak')}
			class="shadow-card flex items-center justify-between rounded-2xl border border-amber-200/60 bg-amber-50/50 p-3.5 transition-colors hover:bg-amber-50"
		>
			<div class="flex items-center gap-2">
				<Flame size={18} strokeWidth={2} class="text-amber-600" />
				<span class="font-headline text-xs font-bold text-slate-900">Streak Tier</span>
			</div>
			<ChevronRight size={16} strokeWidth={2} class="text-slate-400" />
		</a>

		<a
			href={resolve('/saved')}
			class="shadow-card flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-indigo-200 hover:bg-slate-50"
		>
			<div class="flex items-center gap-2">
				<Bookmark size={18} strokeWidth={2} class="text-indigo-600" />
				<span class="font-headline text-xs font-bold text-slate-900">Saved Words</span>
			</div>
			<ChevronRight size={16} strokeWidth={2} class="text-slate-400" />
		</a>
	</div>

	<!-- Key Metrics Grid -->
	<section class="grid grid-cols-2 gap-3">
		<!-- Accuracy Card -->
		<div
			class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600"
			>
				<ShieldCheck size={18} strokeWidth={2} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-slate-500">Recall Accuracy</p>
				<p class="font-headline text-xl font-extrabold text-slate-900">{overallAccuracy}%</p>
				<p class="font-sans text-[10px] text-slate-400">Across all study drills</p>
			</div>
		</div>

		<!-- Reviews Done Card -->
		<div
			class="shadow-card flex h-32 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-600"
			>
				<History size={18} strokeWidth={2} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-slate-500">Total Reviews</p>
				<p class="font-headline text-xl font-extrabold text-slate-900">
					{streakStats.totalReviews}
				</p>
				<p class="font-sans text-[10px] text-slate-400">Cards evaluated</p>
			</div>
		</div>
	</section>

	<!-- 7-Day Activity Chart -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<h3 class="font-headline text-sm font-bold text-slate-900">7-Day Study Activity</h3>
			<span class="font-headline text-xs font-semibold text-slate-500">Cards per day</span>
		</div>

		<div class="flex h-36 items-end justify-between gap-2 pt-4">
			{#each weeklyActivity as item (item.day)}
				{@const barHeight = Math.max(8, Math.round((item.count / maxActivityCount) * 100))}
				<div class="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
					<span class="font-headline text-[10px] font-bold text-slate-600">{item.count}</span>
					<div
						class="flex h-24 w-full max-w-[28px] items-end overflow-hidden rounded-t-xl bg-slate-100"
					>
						<div
							class="w-full rounded-t-xl transition-all duration-300 {item.isToday
								? 'bg-indigo-600'
								: 'bg-indigo-200'}"
							style="height: {barHeight}%"
						></div>
					</div>
					<span
						class="font-headline text-[11px] font-bold {item.isToday
							? 'text-indigo-600'
							: 'text-slate-500'}"
					>
						{item.day}
					</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Word Stage Breakdown / Retention Pie Chart -->
	<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-headline text-sm font-bold text-slate-900">Retention Breakdown</h3>
				<p class="font-sans text-xs text-slate-500">Mastery & retention by word stage</p>
			</div>
			<span
				class="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-headline text-[11px] font-bold text-slate-600"
			>
				{totalWordsCount.toLocaleString()} total words
			</span>
		</div>

		<div class="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
			<!-- Donut / Pie Chart Visual -->
			<div class="relative flex h-36 w-36 shrink-0 items-center justify-center">
				<svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
					<!-- Base Track Circle -->
					<circle
						cx="50"
						cy="50"
						r={CIRCLE_RADIUS}
						fill="transparent"
						stroke="#F1F5F9"
						stroke-width="12"
					/>

					<!-- Unstarted Segment (Slate) -->
					{#if unstartedWordsCount > 0 && totalWordsCount > 0}
						<circle
							cx="50"
							cy="50"
							r={CIRCLE_RADIUS}
							fill="transparent"
							stroke="#CBD5E1"
							stroke-width="12"
							stroke-dasharray="{unstartedDash} {CIRCUMFERENCE - unstartedDash}"
							stroke-dashoffset="-{masteredDash + learningDash}"
							class="transition-all duration-500 ease-out"
						/>
					{/if}

					<!-- Learning Segment (Amber) -->
					{#if learningWordsCount > 0 && totalWordsCount > 0}
						<circle
							cx="50"
							cy="50"
							r={CIRCLE_RADIUS}
							fill="transparent"
							stroke="#F59E0B"
							stroke-width="12"
							stroke-dasharray="{learningDash} {CIRCUMFERENCE - learningDash}"
							stroke-dashoffset="-{masteredDash}"
							class="transition-all duration-500 ease-out"
						/>
					{/if}

					<!-- Mastered Segment (Emerald) -->
					{#if masteredWordsCount > 0 && totalWordsCount > 0}
						<circle
							cx="50"
							cy="50"
							r={CIRCLE_RADIUS}
							fill="transparent"
							stroke="#10B981"
							stroke-width="12"
							stroke-dasharray="{masteredDash} {CIRCUMFERENCE - masteredDash}"
							stroke-dashoffset="0"
							class="transition-all duration-500 ease-out"
						/>
					{/if}
				</svg>

				<!-- Center Metric -->
				<div class="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span class="font-headline text-2xl leading-none font-black text-slate-900">
						{masteredPercent}%
					</span>
					<span
						class="mt-1 font-headline text-[10px] font-bold tracking-wider text-slate-400 uppercase"
					>
						Mastered
					</span>
				</div>
			</div>

			<!-- Legend & Breakdown Metrics -->
			<div class="w-full flex-1 space-y-2">
				<!-- Mastered Row -->
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
				>
					<div class="flex items-center gap-2.5">
						<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"></span>
						<div>
							<p class="font-headline text-xs leading-tight font-bold text-slate-900">Mastered</p>
							<p class="font-sans text-[10px] text-slate-400">Interval &ge; 7 days</p>
						</div>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="font-headline text-xs font-black text-slate-900">
							{masteredWordsCount.toLocaleString()}
						</span>
						<span
							class="rounded-md border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-emerald-700"
						>
							{masteredPercent}%
						</span>
					</div>
				</div>

				<!-- Learning Row -->
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
				>
					<div class="flex items-center gap-2.5">
						<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"></span>
						<div>
							<p class="font-headline text-xs leading-tight font-bold text-slate-900">Learning</p>
							<p class="font-sans text-[10px] text-slate-400">Active SRS reviews</p>
						</div>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="font-headline text-xs font-black text-slate-900">
							{learningWordsCount.toLocaleString()}
						</span>
						<span
							class="rounded-md border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-amber-700"
						>
							{learningPercent}%
						</span>
					</div>
				</div>

				<!-- Unstarted Row -->
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors"
				>
					<div class="flex items-center gap-2.5">
						<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300"></span>
						<div>
							<p class="font-headline text-xs leading-tight font-bold text-slate-900">Unstarted</p>
							<p class="font-sans text-[10px] text-slate-400">Ready in library</p>
						</div>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="font-headline text-xs font-black text-slate-900">
							{unstartedWordsCount.toLocaleString()}
						</span>
						<span
							class="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-headline text-[10px] font-bold text-slate-600"
						>
							{unstartedPercent}%
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Due For Review Alert / Quick Action -->
		{#if dueWordsCount > 0}
			<div
				class="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5"
			>
				<div class="flex items-center gap-2">
					<span class="relative flex h-2 w-2">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"
						></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
					</span>
					<span class="font-headline text-xs font-bold text-indigo-950">
						{dueWordsCount}
						{dueWordsCount === 1 ? 'word' : 'words'} scheduled for review
					</span>
				</div>
				<a
					href={resolve('/review')}
					class="font-headline text-xs font-bold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
				>
					Review &rarr;
				</a>
			</div>
		{/if}
	</section>

	<!-- Export Learned Words Section -->
	<section class="shadow-card space-y-3.5 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-start justify-between gap-3">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600"
				>
					<FileSpreadsheet size={20} strokeWidth={2} />
				</div>
				<div>
					<h3 class="font-headline text-sm font-bold text-slate-900">Export Learned Words</h3>
					<p class="font-sans text-xs text-slate-500">
						{totalLearnedWords}
						{totalLearnedWords === 1 ? 'word' : 'words'} with study progress
					</p>
				</div>
			</div>

			{#if exportMessage}
				<span
					class="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-headline text-[11px] font-bold text-emerald-700"
				>
					<Check size={13} strokeWidth={2.5} />
					{exportMessage}
				</span>
			{/if}
		</div>

		<button
			type="button"
			id="export-learned-words-btn"
			onclick={handleExportLearnedWords}
			disabled={isExporting || totalLearnedWords === 0}
			class="shadow-primary-glow/20 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
		>
			<Download size={17} strokeWidth={2.25} />
			{isExporting ? 'Generating CSV…' : 'Download Learned Words (CSV)'}
		</button>
	</section>
</main>
