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
		Trophy,
		Sparkles,
		Swords,
		Play,
		RefreshCw,
		CloudCog,
		ArrowRight,
		Crown,
		Flame,
		Zap
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
	<!-- Hero Header Banner with Bright Daytime Arcade Aesthetic -->
	<section
		class="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-linear-to-br from-sky-400 via-indigo-500 to-indigo-700 p-5 text-white shadow-xl shadow-indigo-900/10"
	>
		<!-- Background Floating Orbs and Gloss -->
		<div
			class="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"
		></div>
		<div
			class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-amber-400/25 blur-xl"
		></div>

		<div class="relative flex items-center justify-between gap-3.5">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<span
						class="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 font-headline text-[10px] font-black text-amber-200 backdrop-blur-md"
					>
						<Zap size={11} strokeWidth={2.75} class="text-amber-300" />
						SEASON 1
					</span>
					<span class="font-headline text-[11px] font-bold text-sky-100">Speed Challenge</span>
				</div>
				<h2 class="font-headline text-xl font-black tracking-tight text-white drop-shadow-xs">
					Arcade & Speed Trials
				</h2>
				<p class="font-sans text-xs font-medium text-sky-100">
					Race down the tracks, chain speed combos, and set high scores!
				</p>
			</div>

			<!-- Companion Mascot Squircle -->
			<div
				class="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/60 bg-white/30 shadow-md backdrop-blur-md"
			>
				<img src="/mascots/owl.png" alt="Mascot" class="h-13 w-13 object-contain drop-shadow-sm" />
			</div>
		</div>
	</section>

	<!-- Available Games Section -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Swords size={18} strokeWidth={2.25} class="text-indigo-600" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Game Modes</h3>
			</div>
			<span
				class="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-sky-800"
			>
				1 Active Drill
			</span>
		</div>

		<!-- Number Rush Card with 3D Game Icon & Glassmorphic Highlights -->
		<a
			href={resolve('/games/number-attack')}
			id="game-number-attack-card"
			class="group shadow-card hover:shadow-card-hover relative flex items-center justify-between overflow-hidden rounded-3xl border border-sky-100 bg-linear-to-r from-white via-sky-50/40 to-indigo-50/30 p-4 transition-all hover:-translate-y-0.5 hover:border-sky-300 active:scale-[0.98]"
		>
			<div class="flex items-center gap-3.5">
				<!-- 3D Game Icon -->
				<div class="relative shrink-0">
					<img
						src="/images/number-rush-icon.jpg"
						alt="Number Rush"
						class="h-16 w-16 rounded-2xl border border-white/80 object-cover shadow-md shadow-sky-500/20 transition-transform duration-300 group-hover:scale-105"
					/>
					<div
						class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xs ring-2 ring-white"
					>
						<Flame size={11} strokeWidth={3} />
					</div>
				</div>

				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<h4 class="font-headline text-base font-black tracking-tight text-slate-900">
							Number Rush
						</h4>
						<span
							class="rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 font-headline text-[10px] font-bold text-amber-800"
						>
							数字狂飙
						</span>
					</div>
					<p class="font-sans text-xs text-slate-500">
						Mandarin speed number drill • Visual & Audio Speed Modes
					</p>

					<div class="flex flex-wrap items-center gap-2 pt-0.5">
						{#if numberAttackBest > 0}
							<div
								class="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-headline text-[10px] font-bold text-amber-900"
							>
								<Trophy size={11} strokeWidth={2.25} class="text-amber-600" />
								<span>Best: {numberAttackBest} pts</span>
							</div>
						{/if}
						<span
							class="flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-headline text-[10px] font-bold text-sky-800"
						>
							<Sparkles size={10} strokeWidth={2.5} />
							Speed Track
						</span>
					</div>
				</div>
			</div>

			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all group-hover:scale-105 group-hover:brightness-110"
			>
				<Play size={18} strokeWidth={2.75} />
			</div>
		</a>
	</section>

	<!-- Leaderboard Section with Podium styling -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Trophy size={18} strokeWidth={2.25} class="text-amber-500" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Global Leaderboard</h3>
			</div>
			<div class="flex items-center gap-1.5">
				{#if isLoadingLeaderboard}
					<RefreshCw size={12} strokeWidth={2} class="animate-spin text-slate-400" />
				{/if}
				<button
					type="button"
					onclick={loadLeaderboard}
					class="cursor-pointer rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-100"
				>
					Season 1
				</button>
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
					Set up a username profile in Settings to sync your high scores and compete globally.
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
					Play a game round of Number Rush to register your high scores to the global board!
				</p>
				<div
					class="mt-3 flex items-center gap-1.5 font-headline text-[11px] font-semibold text-amber-700"
				>
					<Sparkles size={13} strokeWidth={2} />
					<span>Awaiting First Match</span>
				</div>
			</div>
		{:else}
			<!-- Ranked Score Rows with Tier Accents -->
			<div
				class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
			>
				{#each leaderboard as record, index (record.id)}
					<div
						class="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/80 {index ===
						0
							? 'bg-amber-50/25'
							: index === 1
								? 'bg-slate-50/50'
								: index === 2
									? 'bg-amber-50/15'
									: ''}"
					>
						<div class="flex items-center gap-3">
							<!-- Rank Badge / Crown for podium -->
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-headline text-xs font-black shadow-xs {index ===
								0
									? 'border border-amber-300 bg-linear-to-b from-amber-200 to-amber-300 text-amber-950 shadow-amber-500/20'
									: index === 1
										? 'border border-slate-300 bg-linear-to-b from-slate-200 to-slate-300 text-slate-800'
										: index === 2
											? 'border border-amber-200 bg-linear-to-b from-amber-100 to-amber-200 text-amber-900'
											: 'bg-slate-100 text-slate-500'}"
							>
								{#if index === 0}
									<Crown size={15} strokeWidth={2.5} class="text-amber-950" />
								{:else}
									{index + 1}
								{/if}
							</div>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-headline text-xs font-black text-slate-900">
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
								<p class="mt-0.5 font-sans text-[10px] text-slate-400">
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
