<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import StreakCalendarModal from '$lib/components/StreakCalendarModal.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { onMount } from 'svelte';
	import { getAllProgress, computeStreakStats, getSavedUsername } from '$lib/utils/storage';
	import type { StreakStats } from '$lib/types';
	import { Zap, Flame, Award, Snowflake, Hourglass, Trophy, Calendar } from 'lucide-svelte';

	let username = $state('');
	let isCalendarOpen = $state(false);

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let nextMilestone = $derived(
		streakStats.currentStreak < 7
			? 7
			: streakStats.currentStreak < 14
				? 14
				: streakStats.currentStreak < 30
					? 30
					: streakStats.currentStreak < 50
						? 50
						: 100
	);

	let daysToMilestone = $derived(Math.max(0, nextMilestone - streakStats.currentStreak));
	let milestonePercent = $derived(
		Math.min(100, Math.round((streakStats.currentStreak / nextMilestone) * 100))
	);

	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	let weekActiveStates = $derived(() => {
		const today = new Date();
		const currentDayIdx = (today.getDay() + 6) % 7; // Monday = 0
		const states = [];

		for (let i = 0; i < 7; i++) {
			const diff = i - currentDayIdx;
			const targetDate = new Date(today.getTime() + diff * 86400000);
			const iso = targetDate.toISOString().split('T')[0];
			const isPastOrToday = diff <= 0;
			const isActive = streakStats.activeDates.includes(iso);
			const isToday = diff === 0;

			states.push({
				day: weekDays[i],
				isActive,
				isToday,
				isFuture: diff > 0
			});
		}

		return states;
	});

	async function loadStreakData() {
		username = getSavedUsername();
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);
	}

	onMount(() => {
		loadStreakData();
	});
</script>

<svelte:head>
	<title>Active Streak — FlashCards</title>
</svelte:head>

<TopHeader title="Habit Streak" streak={streakStats.currentStreak} showBack={true} />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Hero Mascot & Streak Tier Card -->
	<section
		class="relative overflow-hidden rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-[0_4px_24px_-4px_rgba(249,115,22,0.14)]"
	>
		<!-- Ambient Glow Circles -->
		<div
			class="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-secondary-fixed/50 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-primary-fixed/40 blur-3xl"
		></div>

		<!-- Mascot Image -->
		<div class="relative mx-auto my-2 flex h-40 w-40 items-center justify-center">
			<div
				class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-secondary/20 via-secondary-container/20 to-primary-fixed/30 blur-xl"
			></div>
			<img
				src="/mascots/flame.png"
				alt="Playful 3D Flame Mascot celebrating learning streak milestone"
				class="relative z-10 h-36 w-36 object-contain drop-shadow-md transition-transform duration-300 select-none hover:scale-105"
			/>
		</div>

		<!-- Tier Badge & Count -->
		<div class="relative z-10 mt-2 flex flex-col items-center">
			<div
				class="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3.5 py-1 font-headline text-xs font-bold text-on-secondary-fixed shadow-sm"
			>
				<Zap size={13} strokeWidth={2} />
				<span class="uppercase">{streakStats.tierName}</span>
			</div>

			<h2
				class="mt-2 flex items-center justify-center gap-1.5 font-headline text-3xl font-extrabold tracking-tight text-on-surface"
			>
				<span>{streakStats.currentStreak} Day Streak!</span>
				<Flame size={26} strokeWidth={1.75} class="text-secondary" />
			</h2>

			<p class="font-body mt-1 max-w-[260px] text-xs leading-relaxed text-on-surface-variant">
				{#if username}
					You're on fire, <span class="font-bold text-on-surface capitalize">{username}</span>! Study
					daily to keep the momentum roaring.
				{:else}
					You're on fire! Study daily to keep the momentum roaring.
				{/if}
			</p>
		</div>

		<!-- Next Milestone Progress Bar -->
		<div
			class="mt-5 rounded-2xl border border-surface-container bg-surface-container-low p-4 text-left"
		>
			<div class="mb-2 flex items-center justify-between text-xs font-bold text-on-surface">
				<span class="flex items-center gap-1">
					<Award size={15} strokeWidth={2} class="text-secondary" />
					Next Goal: {nextMilestone} Days
				</span>
				<span class="font-headline text-secondary">{daysToMilestone} days to go</span>
			</div>

			<ProgressBar
				value={streakStats.currentStreak}
				max={nextMilestone}
				variant="secondary"
				height="h-2.5"
			/>

			<div
				class="mt-1.5 flex items-center justify-between px-0.5 text-[10px] font-bold text-on-surface-variant"
			>
				<span>Day {streakStats.currentStreak}</span>
				<span class="text-on-surface">{milestonePercent}% Complete</span>
				<span>Day {nextMilestone}</span>
			</div>
		</div>
	</section>

	<!-- Streak Freeze Protection Card -->
	<section
		class="shadow-card flex items-center justify-between rounded-3xl border border-surface-container bg-surface-container-lowest p-4"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
			>
				<Snowflake size={22} strokeWidth={1.75} />
			</div>
			<div>
				<h3 class="font-headline text-xs font-bold text-on-surface">Streak Freeze Shield</h3>
				<p class="text-[11px] font-medium text-on-surface-variant">
					{streakStats.freezeCount} Freezes remaining this month
				</p>
			</div>
		</div>

		<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
			Protected
		</span>
	</section>

	<!-- This Week Habit Tracker -->
	<section
		class="shadow-card space-y-3 rounded-3xl border border-surface-container bg-surface-container-lowest p-4"
	>
		<div class="flex items-center justify-between">
			<h3 class="font-headline text-sm font-bold text-on-surface">This Week's Activity</h3>
			<button
				type="button"
				onclick={() => (isCalendarOpen = true)}
				class="text-xs font-bold text-primary hover:underline"
			>
				View Calendar &rarr;
			</button>
		</div>

		<div class="grid grid-cols-7 gap-1.5 pt-1 text-center">
			{#each weekActiveStates() as item}
				<div class="flex flex-col items-center gap-1">
					<span class="font-headline text-[10px] font-bold text-on-surface-variant uppercase">
						{item.day}
					</span>
					<div
						class="flex h-10 w-9 items-center justify-center rounded-2xl text-xs font-bold transition-transform {item.isActive
							? 'shadow-streak-glow scale-105 bg-secondary text-white'
							: item.isToday
								? 'bg-primary-fixed text-primary ring-2 ring-primary ring-offset-1'
								: item.isFuture
									? 'bg-surface-container-low text-outline opacity-40'
									: 'bg-surface-container text-on-surface-variant'}"
					>
						{#if item.isActive}
							<Flame size={16} strokeWidth={1.75} />
						{:else if item.isToday}
							<Hourglass size={14} strokeWidth={1.75} />
						{:else}
							<span>&bull;</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Key Habit Stats Grid -->
	<div class="grid grid-cols-2 gap-3">
		<div
			class="shadow-card flex h-28 flex-col justify-between rounded-3xl border border-surface-container bg-surface-container-lowest p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-fixed text-secondary"
			>
				<Trophy size={17} strokeWidth={1.75} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-on-surface-variant">Longest Streak</p>
				<p class="font-headline text-lg font-extrabold text-on-surface">
					{streakStats.longestStreak} Days
				</p>
			</div>
		</div>

		<div
			class="shadow-card flex h-28 flex-col justify-between rounded-3xl border border-surface-container bg-surface-container-lowest p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-fixed text-primary"
			>
				<Calendar size={17} strokeWidth={1.75} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-on-surface-variant">Total Active Days</p>
				<p class="font-headline text-lg font-extrabold text-on-surface">
					{streakStats.activeDates.length} Days
				</p>
			</div>
		</div>
	</div>
</main>

<StreakCalendarModal
	isOpen={isCalendarOpen}
	streak={streakStats.currentStreak}
	activeDates={streakStats.activeDates}
	onClose={() => (isCalendarOpen = false)}
/>
