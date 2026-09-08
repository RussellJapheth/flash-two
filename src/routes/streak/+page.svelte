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
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center"
	>
		<!-- Ambient Glow Circles -->
		<div
			class="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-100/50 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-indigo-100/40 blur-3xl"
		></div>

		<!-- Mascot Image -->
		<div class="relative mx-auto my-2 flex h-40 w-40 items-center justify-center">
			<div
				class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-amber-500/20 via-amber-200/30 to-indigo-100/20 blur-xl"
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
				class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1 font-headline text-xs font-bold text-amber-900 shadow-xs"
			>
				<Zap size={13} strokeWidth={2.25} />
				<span class="uppercase">{streakStats.tierName}</span>
			</div>

			<h2
				class="mt-2 flex items-center justify-center gap-1.5 font-headline text-3xl font-extrabold tracking-tight text-slate-900"
			>
				<span>{streakStats.currentStreak} Day Streak!</span>
				<Flame size={26} strokeWidth={2.25} class="fill-amber-500/20 text-amber-500" />
			</h2>

			<p class="font-body mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
				{#if username}
					You're on fire, <span class="font-bold text-slate-900 capitalize">{username}</span>! Study
					daily to keep the momentum roaring.
				{:else}
					You're on fire! Study daily to keep the momentum roaring.
				{/if}
			</p>
		</div>

		<!-- Next Milestone Progress Bar -->
		<div
			class="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left"
		>
			<div class="mb-2 flex items-center justify-between text-xs font-bold text-slate-900">
				<span class="flex items-center gap-1 font-headline">
					<Award size={15} strokeWidth={2} class="text-amber-600" />
					Next Goal: {nextMilestone} Days
				</span>
				<span class="font-headline font-extrabold text-amber-700">{daysToMilestone} days to go</span>
			</div>

			<ProgressBar
				value={streakStats.currentStreak}
				max={nextMilestone}
				variant="secondary"
				height="h-2.5"
			/>

			<div
				class="mt-1.5 flex items-center justify-between px-0.5 font-headline text-[10px] font-bold text-slate-500"
			>
				<span>Day {streakStats.currentStreak}</span>
				<span class="text-slate-800">{milestonePercent}% Complete</span>
				<span>Day {nextMilestone}</span>
			</div>
		</div>
	</section>

	<!-- Streak Freeze Protection Card -->
	<section
		class="shadow-card flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600"
			>
				<Snowflake size={22} strokeWidth={2} />
			</div>
			<div>
				<h3 class="font-headline text-xs font-bold text-slate-900">Streak Freeze Shield</h3>
				<p class="font-sans text-[11px] font-medium text-slate-500">
					{streakStats.freezeCount} Freezes remaining this month
				</p>
			</div>
		</div>

		<span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-headline text-[11px] font-bold text-emerald-700">
			Protected
		</span>
	</section>

	<!-- This Week Habit Tracker -->
	<section
		class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-4"
	>
		<div class="flex items-center justify-between">
			<h3 class="font-headline text-sm font-bold text-slate-900">This Week's Activity</h3>
			<button
				type="button"
				onclick={() => (isCalendarOpen = true)}
				class="cursor-pointer font-headline text-xs font-bold text-indigo-600 hover:underline"
			>
				View Calendar &rarr;
			</button>
		</div>

		<div class="grid grid-cols-7 gap-1.5 pt-1 text-center">
			{#each weekActiveStates() as item}
				<div class="flex flex-col items-center gap-1">
					<span class="font-headline text-[10px] font-bold text-slate-500 uppercase">
						{item.day}
					</span>
					<div
						class="flex h-10 w-9 items-center justify-center rounded-2xl text-xs font-bold transition-transform {item.isActive
							? 'shadow-streak-glow scale-105 bg-amber-500 text-white'
							: item.isToday
								? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600 ring-offset-1'
								: item.isFuture
									? 'bg-slate-50 text-slate-300'
									: 'bg-slate-100 text-slate-600'}"
					>
						{#if item.isActive}
							<Flame size={16} strokeWidth={2.25} />
						{:else if item.isToday}
							<Hourglass size={14} strokeWidth={2} />
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
			class="shadow-card flex h-28 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50 text-amber-600"
			>
				<Trophy size={18} strokeWidth={2} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-slate-500">Longest Streak</p>
				<p class="font-headline text-lg font-extrabold text-slate-900">
					{streakStats.longestStreak} Days
				</p>
			</div>
		</div>

		<div
			class="shadow-card flex h-28 flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-4"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600"
			>
				<Calendar size={18} strokeWidth={2} />
			</div>
			<div>
				<p class="font-headline text-[11px] font-bold text-slate-500">Total Active Days</p>
				<p class="font-headline text-lg font-extrabold text-slate-900">
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
