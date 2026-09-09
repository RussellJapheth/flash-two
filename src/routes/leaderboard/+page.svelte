<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import { getSavedUsername, isLeaderboardDisabled } from '$lib/utils/storage';
	import {
		isCloudSyncEnabled,
		fetchXPLeaderboard,
		syncXPLeaderboard,
		getLocalUserXPData,
		computeLevelStats,
		getLevelTheme
	} from '$lib/utils/xp';
	import type { XPLeaderboardEntry, XPStats } from '$lib/types';
	import {
		Trophy,
		Crown,
		Medal,
		RotateCw,
		CloudOff,
		UserCheck,
		Lock,
		ChevronRight,
		Flame,
		Calendar,
		Infinity as InfinityIcon
	} from 'lucide-svelte';

	let activeTimeframe = $state<'weekly' | 'monthly' | 'all'>('weekly');
	let isLoading = $state(true);
	let isRefreshing = $state(false);
	let isCloudUser = $state(false);
	let leaderboardsDisabled = $state(true);
	let currentUsername = $state('');

	let userStats = $state<XPStats | null>(null);
	let userRank = $state<number | null>(null);
	let leaderboardEntries = $state<(XPLeaderboardEntry & { rank: number })[]>([]);
	let errorMessage = $state<string | null>(null);

	async function loadLeaderboardData(showSpinner = false) {
		if (showSpinner) isRefreshing = true;
		errorMessage = null;

		leaderboardsDisabled = isLeaderboardDisabled();
		currentUsername = getSavedUsername().trim();
		isCloudUser = isCloudSyncEnabled();

		if (leaderboardsDisabled || !isCloudUser) {
			isLoading = false;
			isRefreshing = false;
			return;
		}

		const xpData = getLocalUserXPData();
		userStats = computeLevelStats(xpData.totalXP, xpData.dailyXP);

		// Synchronize local latest XP with remote first
		if (navigator.onLine) {
			await syncXPLeaderboard().catch((e) => console.warn('Sync XP before load:', e));
		}

		try {
			const result = await fetchXPLeaderboard(activeTimeframe);
			if (result.error === 'unauthenticated') {
				isCloudUser = false;
			} else {
				leaderboardEntries = result.entries;
				userRank = result.userRank;
			}
		} catch (err) {
			console.error('Failed to load leaderboard:', err);
			errorMessage = 'Unable to reach leaderboard service. Please check your connection.';
		} finally {
			isLoading = false;
			isRefreshing = false;
		}
	}

	function handleTimeframeChange(timeframe: 'weekly' | 'monthly' | 'all') {
		if (activeTimeframe === timeframe) return;
		activeTimeframe = timeframe;
		loadLeaderboardData();
	}

	onMount(() => {
		loadLeaderboardData();
	});
</script>

<svelte:head>
	<title>XP Leaderboard — FlashCards</title>
</svelte:head>

<TopHeader title="XP Leaderboard" showBack={true} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	{#if leaderboardsDisabled}
		<!-- DISABLED STATE: LEADERBOARD FEATURES TURNED OFF IN SETTINGS -->
		<section
			class="shadow-card space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 text-center"
		>
			<div
				class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-500 shadow-xs"
			>
				<CloudOff size={30} strokeWidth={2.25} />
			</div>

			<div class="space-y-1">
				<h2 class="font-headline text-xl font-black text-slate-900">Leaderboards Disabled</h2>
				<p class="font-body text-xs text-slate-500">
					Leaderboard features and public rankings are currently turned off in Settings. Enable
					leaderboards in Settings to view rankings and compete with others.
				</p>
			</div>

			<button
				type="button"
				onclick={() => goto(resolve('/settings'))}
				class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
			>
				<span>Open Settings</span>
				<ChevronRight size={16} strokeWidth={2.5} />
			</button>
		</section>
	{:else if !isCloudUser}
		<!-- LOCKED STATE: GUEST USER / CLOUD LOGIN REQUIRED -->
		<section
			class="shadow-card space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 text-center"
		>
			<div
				class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-200/80 bg-amber-50 text-amber-600 shadow-xs"
			>
				<Lock size={30} strokeWidth={2.25} />
			</div>

			<div class="space-y-1">
				<h2 class="font-headline text-xl font-black text-slate-900">Cloud Sync Required</h2>
				<p class="font-body text-xs text-slate-500">
					XP leaderboards are only available to users signed into the cloud. Sign in with a username
					to compete weekly, monthly, and all-time.
				</p>
			</div>

			<div
				class="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-left text-xs text-slate-600"
			>
				<div class="flex items-center gap-2 font-headline font-bold text-slate-900">
					<UserCheck size={16} class="text-indigo-600" />
					<span>Instant, Passwordless Cloud Sync</span>
				</div>
				<p class="mt-1 text-[11px] text-slate-500">
					Pick any custom handle in Settings to back up your progress and rank among learners
					worldwide.
				</p>
			</div>

			<button
				type="button"
				onclick={() => goto(resolve('/settings'))}
				class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
			>
				<span>Open Settings to Sign In</span>
				<ChevronRight size={16} strokeWidth={2.5} />
			</button>
		</section>
	{:else}
		<!-- TIMEFRAME SELECTOR (WEEKLY / MONTHLY / ALL-TIME) -->
		<div class="flex rounded-2xl border border-slate-200/80 bg-slate-100 p-1">
			<button
				type="button"
				onclick={() => handleTimeframeChange('weekly')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 font-headline text-xs font-bold transition-all {activeTimeframe ===
				'weekly'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<Flame size={14} strokeWidth={2.25} />
				<span>Weekly (7d)</span>
			</button>

			<button
				type="button"
				onclick={() => handleTimeframeChange('monthly')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 font-headline text-xs font-bold transition-all {activeTimeframe ===
				'monthly'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<Calendar size={14} strokeWidth={2.25} />
				<span>Monthly (30d)</span>
			</button>

			<button
				type="button"
				onclick={() => handleTimeframeChange('all')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 font-headline text-xs font-bold transition-all {activeTimeframe ===
				'all'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<InfinityIcon size={14} strokeWidth={2.25} />
				<span>All Time</span>
			</button>
		</div>

		<!-- USER'S CURRENT RANKING HERO CARD -->
		<section
			class="shadow-card relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/50 p-4 shadow-xs"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
					>
						<Trophy size={24} strokeWidth={2.25} />
					</div>
					<div>
						<div class="flex items-center gap-1.5">
							<span class="font-headline text-xs font-bold text-slate-500">Your Standing</span>
							{#if userStats}
								<span
									class="rounded-full border px-2 py-0.5 font-headline text-[10px] font-bold {userStats
										.theme.badgeBg} {userStats.theme.badgeText} {userStats.theme.badgeBorder}"
								>
									Lvl {userStats.level}
								</span>
							{/if}
						</div>
						<p class="font-headline text-lg font-black text-slate-900">
							@{currentUsername}
						</p>
					</div>
				</div>

				<div class="text-right">
					<div
						class="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-white px-2.5 py-1 font-headline text-xs font-bold text-indigo-700 shadow-2xs"
					>
						{#if userRank}
							<span>#{userRank} Ranked</span>
						{:else}
							<span>Unranked</span>
						{/if}
					</div>
					<p class="mt-1 font-headline text-sm font-black text-slate-900">
						{#if activeTimeframe === 'weekly'}
							{userStats?.weeklyXP.toLocaleString() || 0}
						{:else if activeTimeframe === 'monthly'}
							{userStats?.monthlyXP.toLocaleString() || 0}
						{:else}
							{userStats?.totalXP.toLocaleString() || 0}
						{/if}
						<span class="text-xs font-bold text-slate-500">XP</span>
					</p>
				</div>
			</div>
		</section>

		<!-- LEADERBOARD LIST CONTAINER -->
		<section class="space-y-2.5">
			<div class="flex items-center justify-between px-1">
				<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
					{activeTimeframe === 'weekly'
						? 'Top Learners This Week'
						: activeTimeframe === 'monthly'
							? 'Top Learners This Month'
							: 'All-Time Legends'}
				</h3>

				<button
					type="button"
					onclick={() => loadLeaderboardData(true)}
					disabled={isRefreshing}
					aria-label="Refresh Leaderboard"
					class="flex h-7 cursor-pointer items-center gap-1 rounded-lg px-2 font-headline text-[11px] font-semibold text-slate-500 hover:bg-slate-100 active:scale-95 disabled:opacity-50"
				>
					<RotateCw size={12} strokeWidth={2.25} class={isRefreshing ? 'animate-spin' : ''} />
					<span>Refresh</span>
				</button>
			</div>

			{#if isLoading}
				<div class="space-y-2 py-4">
					{#each [1, 2, 3, 4] as skeleton (skeleton)}
						<div
							class="flex h-16 animate-pulse items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4"
						>
							<div class="flex items-center gap-3">
								<div class="h-8 w-8 rounded-full bg-slate-200"></div>
								<div class="space-y-1.5">
									<div class="h-3.5 w-24 rounded bg-slate-200"></div>
									<div class="h-2.5 w-16 rounded bg-slate-200"></div>
								</div>
							</div>
							<div class="h-4 w-12 rounded bg-slate-200"></div>
						</div>
					{/each}
				</div>
			{:else if errorMessage}
				<div class="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-800">
					<p class="font-headline text-sm font-bold">{errorMessage}</p>
					<button
						type="button"
						onclick={() => loadLeaderboardData(true)}
						class="mt-3 cursor-pointer rounded-xl bg-rose-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs hover:bg-rose-700"
					>
						Try Again
					</button>
				</div>
			{:else if leaderboardEntries.length === 0}
				<div
					class="shadow-card space-y-2 rounded-3xl border border-slate-200/80 bg-white p-8 text-center"
				>
					<Trophy size={32} class="mx-auto text-slate-300" />
					<h4 class="font-headline text-base font-bold text-slate-800">No Scores Recorded</h4>
					<p class="font-body text-xs text-slate-500">
						Be the first to earn XP by studying decks and claim the #1 spot!
					</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each leaderboardEntries as entry (entry.username)}
						{@const isCurrentUser = entry.username.toLowerCase() === currentUsername.toLowerCase()}
						{@const displayXP =
							activeTimeframe === 'weekly'
								? entry.weeklyXP
								: activeTimeframe === 'monthly'
									? entry.monthlyXP
									: entry.allTimeXP}
						{@const theme = getLevelTheme(entry.level)}

						<div
							class="shadow-card flex items-center justify-between rounded-2xl border p-3.5 transition-all {isCurrentUser
								? 'border-indigo-300 bg-indigo-50/40 ring-2 ring-indigo-600/15'
								: entry.rank === 1
									? 'border-amber-200 bg-amber-50/40'
									: entry.rank === 2
										? 'border-slate-200 bg-slate-50/50'
										: entry.rank === 3
											? 'border-orange-200 bg-orange-50/30'
											: 'border-slate-200/80 bg-white'}"
						>
							<!-- Left: Rank Badge + Username + Level -->
							<div class="flex items-center gap-3">
								<div class="flex h-9 w-9 items-center justify-center">
									{#if entry.rank === 1}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-300 bg-amber-400 font-headline text-sm font-black text-amber-950 shadow-xs"
										>
											<Crown size={18} strokeWidth={2.5} />
										</div>
									{:else if entry.rank === 2}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 font-headline text-sm font-black text-slate-800 shadow-xs"
										>
											<Medal size={18} strokeWidth={2.5} />
										</div>
									{:else if entry.rank === 3}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-600/30 bg-amber-600/20 font-headline text-sm font-black text-amber-950 shadow-xs"
										>
											<Medal size={18} strokeWidth={2.5} />
										</div>
									{:else}
										<span class="font-headline text-sm font-extrabold text-slate-400">
											#{entry.rank}
										</span>
									{/if}
								</div>

								<div>
									<div class="flex items-center gap-1.5">
										<p class="font-headline text-sm font-bold text-slate-900">
											@{entry.username}
										</p>
										{#if isCurrentUser}
											<span
												class="py-0.2 rounded-full bg-indigo-600 px-1.5 font-headline text-[9px] font-extrabold text-white"
											>
												YOU
											</span>
										{/if}
									</div>
									<div class="flex items-center gap-1 text-[11px] text-slate-500">
										<span
											class="py-0.2 rounded-full border px-1.5 font-headline text-[10px] font-bold {theme.badgeBg} {theme.badgeText} {theme.badgeBorder}"
										>
											Lvl {entry.level}
										</span>
									</div>
								</div>
							</div>

							<!-- Right: XP Points -->
							<div class="text-right">
								<div class="font-headline text-base font-black text-slate-900">
									{displayXP.toLocaleString()}
								</div>
								<div class="font-headline text-[10px] font-bold text-slate-400 uppercase">
									XP Earned
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</main>
