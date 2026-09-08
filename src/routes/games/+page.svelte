<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		fetchRemoteLeaderboard,
		getGameHighScore,
		isCloudSyncEnabled,
		syncPendingGameScores,
		deduplicateUserLeaderboard,
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
		ChevronLeft,
		ChevronRight,
		Eye,
		Volume2
	} from 'lucide-svelte';

	interface LeaderboardBoard {
		id: string;
		gameId: string;
		gameTitle: string;
		mode: 'visual' | 'audio';
		title: string;
		subtitle: string;
		tag: string;
	}

	const LEADERBOARD_BOARDS: LeaderboardBoard[] = [
		{
			id: 'number-rush-visual',
			gameId: 'number-rush',
			gameTitle: 'Number Rush',
			mode: 'visual',
			title: 'Visual Rush',
			subtitle: 'Character speed recognition',
			tag: 'Visual'
		},
		{
			id: 'number-rush-audio',
			gameId: 'number-rush',
			gameTitle: 'Number Rush',
			mode: 'audio',
			title: 'Audio Rush',
			subtitle: 'Listening reflex sprint',
			tag: 'Audio'
		}
	];

	let rawLeaderboard = $state<GameScoreRecord[]>([]);
	let numberRushBestVisual = $state(0);
	let numberRushBestAudio = $state(0);
	let isLoadingLeaderboard = $state(false);
	let hasCloudSync = $state(false);
	let activeBoardIndex = $state(0);
	let isPaused = $state(false);

	let boardsWithScores = $derived(
		LEADERBOARD_BOARDS.map((board) => ({
			...board,
			records: deduplicateUserLeaderboard(rawLeaderboard, board.gameId, board.mode)
		}))
	);

	async function loadLeaderboard() {
		hasCloudSync = isCloudSyncEnabled();
		numberRushBestVisual = getGameHighScore('number-rush', 'visual');
		numberRushBestAudio = getGameHighScore('number-rush', 'audio');

		if (!hasCloudSync) {
			rawLeaderboard = [];
			return;
		}

		isLoadingLeaderboard = true;
		try {
			await syncPendingGameScores();
			const remote = await fetchRemoteLeaderboard();
			rawLeaderboard = remote || [];
		} finally {
			isLoadingLeaderboard = false;
		}
	}

	onMount(() => {
		loadLeaderboard();
	});

	// Auto-slide carousel cards every 5.5 seconds unless paused
	$effect(() => {
		if (isPaused || LEADERBOARD_BOARDS.length <= 1) return;
		const interval = setInterval(() => {
			activeBoardIndex = (activeBoardIndex + 1) % LEADERBOARD_BOARDS.length;
		}, 5500);
		return () => clearInterval(interval);
	});

	function selectBoard(index: number) {
		activeBoardIndex = index;
	}

	function nextBoard() {
		activeBoardIndex = (activeBoardIndex + 1) % LEADERBOARD_BOARDS.length;
	}

	function prevBoard() {
		activeBoardIndex =
			(activeBoardIndex - 1 + LEADERBOARD_BOARDS.length) % LEADERBOARD_BOARDS.length;
	}

	// Touch swipe gestures
	let touchStartX = 0;
	let touchStartY = 0;
	let isSwiping = false;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		isSwiping = true;
		isPaused = true;
	}

	function handleTouchEnd(e: TouchEvent) {
		if (!isSwiping) return;
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;

		if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
			if (deltaX < 0) {
				nextBoard();
			} else {
				prevBoard();
			}
		}
		isSwiping = false;
		setTimeout(() => {
			isPaused = false;
		}, 2500);
	}

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
				<h2 class="font-headline text-xl font-black tracking-tight text-white drop-shadow-xs">
					Arcade & Challenges
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
		</div>

		<!-- Number Rush Card with 3D Game Icon & Glassmorphic Highlights -->
		<a
			href={resolve('/games/number-rush')}
			id="game-number-rush-card"
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
				</div>

				<div class="space-y-1">
					<h4 class="font-headline text-base font-black tracking-tight text-slate-900">
						Number Rush
					</h4>
					<p class="font-sans text-xs text-slate-500">
						Mandarin speed number drill • Visual & Audio Speed Modes
					</p>

					<div class="flex flex-wrap items-center gap-2 pt-0.5">
						{#if numberRushBestVisual > 0}
							<div
								class="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 font-headline text-[10px] font-bold text-indigo-900"
							>
								<Eye size={11} strokeWidth={2.25} class="text-indigo-600" />
								<span>Visual: {numberRushBestVisual} pts</span>
							</div>
						{/if}
						{#if numberRushBestAudio > 0}
							<div
								class="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-headline text-[10px] font-bold text-amber-900"
							>
								<Volume2 size={11} strokeWidth={2.25} class="text-amber-600" />
								<span>Audio: {numberRushBestAudio} pts</span>
							</div>
						{/if}
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

	<!-- Auto-Sliding Swipeable Leaderboard Carousel Section -->
	<section
		class="shadow-card space-y-3.5 rounded-3xl border border-slate-200/80 bg-white p-5 select-none"
		aria-label="Leaderboards Carousel"
	>
		<!-- Section Header with Sync Status -->
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<Trophy size={18} strokeWidth={2.25} class="text-amber-500" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Leaderboards</h3>
			</div>

			<button
				type="button"
				onclick={loadLeaderboard}
				disabled={isLoadingLeaderboard}
				aria-label="Refresh Leaderboard"
				class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:opacity-50"
			>
				<RefreshCw size={13} strokeWidth={2} class={isLoadingLeaderboard ? 'animate-spin' : ''} />
			</button>
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
		{:else if isLoadingLeaderboard && rawLeaderboard.length === 0}
			<!-- Skeleton Loading State -->
			<div
				class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
				aria-label="Loading leaderboard"
			>
				{#each [1, 2, 3, 4] as item (item)}
					<div class="flex animate-pulse items-center justify-between p-3.5">
						<div class="flex items-center gap-3">
							<div class="h-8 w-8 shrink-0 rounded-xl bg-slate-200"></div>
							<div class="space-y-1.5">
								<div class="flex items-center gap-2">
									<div class="h-3.5 w-20 rounded-md bg-slate-200"></div>
									<div class="h-3.5 w-16 rounded-full bg-slate-100"></div>
								</div>
								<div class="h-2.5 w-28 rounded-md bg-slate-100"></div>
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<div class="h-4 w-10 rounded-md bg-slate-200"></div>
							<div class="h-2.5 w-6 rounded-md bg-slate-100"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Swipeable & Auto-Sliding Carousel Track Container -->
			<div
				role="region"
				aria-label="Swipeable leaderboard cards"
				class="relative overflow-hidden rounded-2xl"
				ontouchstart={handleTouchStart}
				ontouchend={handleTouchEnd}
				onmouseenter={() => (isPaused = true)}
				onmouseleave={() => (isPaused = false)}
			>
				<!-- Sliding Cards Reel -->
				<div
					class="flex w-full transition-transform duration-500 ease-out"
					style="transform: translateX(-{activeBoardIndex * 100}%);"
				>
					{#each boardsWithScores as board (board.id)}
						<div class="w-full shrink-0">
							<!-- Card Header: Game Name - Mode -->
							<div
								class="mb-2.5 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3.5 py-2.5"
							>
								<div class="flex items-center gap-2.5">
									{#if board.mode === 'visual'}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"
										>
											<Eye size={16} strokeWidth={2.25} />
										</div>
									{:else}
										<div
											class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800"
										>
											<Volume2 size={16} strokeWidth={2.25} />
										</div>
									{/if}
									<h4 class="font-headline text-sm font-bold text-slate-900">
										{board.gameTitle} - {board.mode === 'visual' ? 'Visual Mode' : 'Audio Mode'}
									</h4>
								</div>
							</div>

							{#if board.records.length === 0}
								<!-- Blank Leaderboard State for this specific mode -->
								<div
									class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"
								>
									<div
										class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 shadow-xs"
									>
										<Trophy size={20} strokeWidth={1.75} />
									</div>
									<h4 class="font-headline text-xs font-bold text-slate-800">
										No {board.gameTitle} - {board.mode === 'visual' ? 'Visual Mode' : 'Audio Mode'} Scores
										Yet
									</h4>
									<p class="mt-1 max-w-xs font-sans text-xs text-slate-500">
										Play a round in {board.tag} Mode to claim rank #1!
									</p>
									<div
										class="mt-2.5 flex items-center gap-1.5 font-headline text-[11px] font-semibold text-amber-700"
									>
										<Sparkles size={12} strokeWidth={2} />
										<span>Awaiting First Entry</span>
									</div>
								</div>
							{:else}
								<!-- Ranked Deduplicated List (1 Highest Score per User) -->
								<div
									class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
								>
									{#each board.records as record, index (`${board.id}::${record.username}::${record.mode}::${record.id || index}::${index}`)}
										<div
											class="flex items-center justify-between p-3 transition-colors hover:bg-slate-50/80 {index ===
											0
												? 'bg-amber-50/25'
												: index === 1
													? 'bg-slate-50/50'
													: index === 2
														? 'bg-amber-50/15'
														: ''}"
										>
											<div class="flex items-center gap-3">
												<!-- Rank Badge / Podium Crown -->
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
															class="py-0.2 rounded-full bg-slate-100 px-1.5 font-headline text-[10px] font-semibold text-slate-500 capitalize"
														>
															{record.mode}
														</span>
													</div>
													<p class="mt-0.5 font-sans text-[10px] text-slate-400">
														{record.accuracy}% Acc • {record.maxCombo}x Combo • {formatDate(
															record.playedAt
														)}
													</p>
												</div>
											</div>

											<div class="text-right">
												<span class="font-headline text-sm font-black text-indigo-600"
													>{record.score}</span
												>
												<span class="block font-headline text-[10px] font-bold text-slate-400"
													>pts</span
												>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Carousel Pagination Dots & Navigation Controls -->
			<div class="flex items-center justify-between pt-1">
				<button
					type="button"
					onclick={prevBoard}
					aria-label="Previous Leaderboard"
					class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
				>
					<ChevronLeft size={15} strokeWidth={2.25} />
				</button>

				<!-- Dots Indicator -->
				<div class="flex items-center gap-1.5">
					{#each LEADERBOARD_BOARDS as board, dotIdx (board.id)}
						<button
							type="button"
							onclick={() => selectBoard(dotIdx)}
							aria-label="Slide {dotIdx + 1}"
							class="h-1.5 rounded-full transition-all duration-300 {activeBoardIndex === dotIdx
								? 'w-5 bg-indigo-600'
								: 'w-2 bg-slate-200 hover:bg-slate-300'}"
						></button>
					{/each}
				</div>

				<button
					type="button"
					onclick={nextBoard}
					aria-label="Next Leaderboard"
					class="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
				>
					<ChevronRight size={15} strokeWidth={2.25} />
				</button>
			</div>
		{/if}
	</section>
</main>
