<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		fetchRemoteLeaderboard,
		getGameHighScore,
		isCloudSyncEnabled,
		type GameScoreRecord
	} from '$lib/utils/gameStorage';
	import {
		Gamepad2,
		Trophy,
		Sparkles,
		Swords,
		Play,
		RefreshCw,
		CloudCog,
		ArrowRight
	} from 'lucide-svelte';

	let leaderboard = $state<GameScoreRecord[]>([]);
	let numberAttackBest = $state(0);
	let isLoadingLeaderboard = $state(false);
	let hasCloudSync = $state(false);

	async function loadLeaderboard() {
		hasCloudSync = isCloudSyncEnabled();
		numberAttackBest = getGameHighScore('number-attack');

		if (!hasCloudSync) {
			leaderboard = [];
			return;
		}

		isLoadingLeaderboard = true;
		try {
			const remote = await fetchRemoteLeaderboard();
			leaderboard = remote || [];
		} finally {
			isLoadingLeaderboard = false;
		}
	}

	onMount(() => {
		loadLeaderboard();
	});

	function formatDate(timestamp: number): string {
		const d = new Date(timestamp);
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>Games & Leaderboard — FlashCards</title>
</svelte:head>

<TopHeader title="Games" />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Hero Header Banner -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<div class="flex items-center gap-3.5">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs"
			>
				<Gamepad2 size={24} strokeWidth={2.25} />
			</div>
			<div>
				<h2 class="font-headline text-lg font-extrabold text-slate-900">Arcade & Challenges</h2>
				<p class="font-sans text-xs text-slate-500">
					Test your vocabulary speed and compete on the global board
				</p>
			</div>
		</div>
	</section>

	<!-- Available Games Section -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Swords size={18} strokeWidth={2} class="text-indigo-600" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Game Modes</h3>
			</div>
			<span
				class="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-indigo-700"
			>
				1 Available
			</span>
		</div>

		<!-- Number Attack Card -->
		<a
			href={resolve('/games/number-attack')}
			id="game-number-attack-card"
			class="group shadow-card hover:shadow-card-hover flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 active:scale-[0.98]"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 font-headline text-base font-extrabold text-indigo-600 shadow-xs transition-colors group-hover:bg-indigo-600 group-hover:text-white"
				>
					ZH
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h4 class="font-headline text-sm font-bold text-slate-900">Number Attack</h4>
						<span
							class="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-headline text-[10px] font-bold text-indigo-700"
						>
							Chinese
						</span>
					</div>
					<p class="mt-0.5 font-sans text-xs text-slate-500">
						Match Mandarin numbers in 60 seconds • Visual & Audio modes
					</p>
					{#if numberAttackBest > 0}
						<div
							class="mt-1.5 flex items-center gap-1 font-headline text-[11px] font-bold text-amber-600"
						>
							<Trophy size={12} strokeWidth={2.25} />
							<span>Best: {numberAttackBest} pts</span>
						</div>
					{/if}
				</div>
			</div>

			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
			>
				<Play size={16} strokeWidth={2.25} />
			</div>
		</a>
	</section>

	<!-- Leaderboard Section -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Trophy size={18} strokeWidth={2} class="text-amber-600" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Global Leaderboard</h3>
			</div>
			<div class="flex items-center gap-1.5">
				{#if isLoadingLeaderboard}
					<RefreshCw size={12} strokeWidth={2} class="animate-spin text-slate-400" />
				{/if}
				<span
					class="rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-amber-800"
				>
					Season 1
				</span>
			</div>
		</div>

		{#if !hasCloudSync}
			<!-- Cloud Sync Required State -->
			<div
				class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs"
				>
					<CloudCog size={24} strokeWidth={2} />
				</div>
				<h4 class="font-headline text-sm font-bold text-slate-900">Cloud Sync Required</h4>
				<p class="mt-1 max-w-xs font-sans text-xs text-slate-500">
					Set up a username profile in Settings to sync your study progress and join the global
					leaderboard.
				</p>
				<a
					href={resolve('/settings')}
					id="setup-cloud-sync-cta"
					class="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
				>
					<span>Set Up Cloud Profile</span>
					<ArrowRight size={14} strokeWidth={2.25} />
				</a>
			</div>
		{:else if leaderboard.length === 0}
			<!-- Blank Leaderboard State -->
			<div
				class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"
			>
				<div
					class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 shadow-xs"
				>
					<Trophy size={22} strokeWidth={1.75} />
				</div>
				<h4 class="font-headline text-sm font-bold text-slate-800">Leaderboard Blank</h4>
				<p class="mt-1 max-w-xs font-sans text-xs text-slate-500">
					Play a game round of Number Attack to register your high scores to the global board!
				</p>
				<div
					class="mt-3 flex items-center gap-1.5 font-headline text-[11px] font-semibold text-amber-700"
				>
					<Sparkles size={13} strokeWidth={2} />
					<span>Awaiting First Match</span>
				</div>
			</div>
		{:else}
			<!-- Ranked Score Rows (1 unique entry per user) -->
			<div
				class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
			>
				{#each leaderboard as record, index (record.id)}
					<div
						class="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/80"
					>
						<div class="flex items-center gap-3">
							<!-- Rank Badge -->
							<div
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-headline text-xs font-black {index ===
								0
									? 'bg-amber-100 text-amber-800'
									: index === 1
										? 'bg-slate-200 text-slate-700'
										: index === 2
											? 'border border-amber-200 bg-amber-50 text-amber-700'
											: 'text-slate-400'}"
							>
								{index + 1}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-headline text-xs font-bold text-slate-900">
										{record.username}
									</span>
									<span
										class="rounded-full bg-indigo-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-indigo-700"
									>
										{record.gameName}
									</span>
									<span
										class="rounded-full bg-slate-100 px-1.5 py-0.5 font-headline text-[10px] font-semibold text-slate-500 capitalize"
									>
										{record.mode}
									</span>
								</div>
								<p class="font-sans text-[10px] text-slate-400">
									{record.accuracy}% Acc • {record.maxCombo}x Combo • {formatDate(record.playedAt)}
								</p>
							</div>
						</div>

						<div class="text-right">
							<span class="font-headline text-sm font-black text-indigo-600">{record.score}</span>
							<span class="block font-headline text-[10px] font-bold text-slate-400">pts</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</main>
