<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		fetchRemoteLeaderboard,
		isCloudSyncEnabled,
		syncPendingGameScores,
		deduplicateUserLeaderboard,
		type GameScoreRecord
	} from '$lib/utils/gameStorage';
	import { isLeaderboardDisabled } from '$lib/utils/storage';
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
		Zap,
		Headphones
	} from 'lucide-svelte';

	interface LeaderboardBoard {
		id: string;
		gameId: string;
		gameTitle: string;
		mode: 'visual' | 'audio';
		title: string;
		tag: string;
		accentGradient: string;
		borderClass: string;
		glowClass: string;
		badgeBg: string;
		badgeText: string;
		scoreColor: string;
		scoreBadgeBg: string;
		rank1Gradient: string;
		rank1Border: string;
	}

	const LEADERBOARD_BOARDS: LeaderboardBoard[] = [
		{
			id: 'number-rush-visual',
			gameId: 'number-rush',
			gameTitle: 'Number Rush',
			mode: 'visual',
			title: 'Visual Mode',
			tag: 'Visual',
			accentGradient:
				'bg-linear-to-r from-sky-400/80 via-blue-500/75 to-indigo-600/80 text-white shadow-lg shadow-indigo-500/10',
			borderClass: 'border-white/60',
			glowClass: 'bg-white/20',
			badgeBg: 'bg-white/25 border border-white/60 text-white',
			badgeText: 'text-sky-100',
			scoreColor: 'text-indigo-600',
			scoreBadgeBg: 'bg-sky-50 text-indigo-700',
			rank1Gradient: 'from-amber-200 to-amber-300 text-amber-950',
			rank1Border: 'border-amber-300'
		},
		{
			id: 'number-rush-audio',
			gameId: 'number-rush',
			gameTitle: 'Number Rush',
			mode: 'audio',
			title: 'Audio Mode',
			tag: 'Audio',
			accentGradient:
				'bg-linear-to-r from-amber-400/80 via-orange-500/75 to-rose-500/80 text-white shadow-lg shadow-amber-500/10',
			borderClass: 'border-white/60',
			glowClass: 'bg-white/20',
			badgeBg: 'bg-white/25 border border-white/60 text-white',
			badgeText: 'text-amber-100',
			scoreColor: 'text-amber-600',
			scoreBadgeBg: 'bg-amber-50 text-amber-800',
			rank1Gradient: 'from-amber-200 to-amber-300 text-amber-950',
			rank1Border: 'border-amber-300'
		},
		{
			id: 'match-blitz',
			gameId: 'match-blitz',
			gameTitle: 'Match Blitz',
			mode: 'visual',
			title: 'Match Blitz',
			tag: 'Match',
			accentGradient:
				'bg-linear-to-r from-emerald-400/80 via-teal-500/75 to-indigo-600/80 text-white shadow-lg shadow-emerald-500/10',
			borderClass: 'border-white/60',
			glowClass: 'bg-white/20',
			badgeBg: 'bg-white/25 border border-white/60 text-white',
			badgeText: 'text-emerald-100',
			scoreColor: 'text-emerald-600',
			scoreBadgeBg: 'bg-emerald-50 text-emerald-800',
			rank1Gradient: 'from-emerald-200 to-emerald-300 text-emerald-950',
			rank1Border: 'border-emerald-300'
		}
	];

	let rawLeaderboard = $state<GameScoreRecord[]>([]);
	let isLoadingLeaderboard = $state(false);
	let hasCloudSync = $state(false);
	let leaderboardsDisabled = $state(true);
	let activeBoardIndex = $state(0);
	let isPaused = $state(false);

	let boardsWithScores = $derived(
		LEADERBOARD_BOARDS.map((board) => ({
			...board,
			records: deduplicateUserLeaderboard(rawLeaderboard, board.gameId, board.mode)
		}))
	);

	async function loadLeaderboard() {
		leaderboardsDisabled = isLeaderboardDisabled();
		hasCloudSync = isCloudSyncEnabled();

		if (leaderboardsDisabled || !hasCloudSync) {
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

		const handleOnline = () => {
			loadLeaderboard();
		};
		window.addEventListener('online', handleOnline);

		return () => {
			window.removeEventListener('online', handleOnline);
		};
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

	// Interactive Drag & Carousel Swipe gestures
	let containerWidth = $state(0);
	let isDragging = $state(false);
	let dragOffset = $state(0);
	let isPointerDown = false;
	let pointerStartX = 0;
	let pointerStartY = 0;
	let pointerStartTime = 0;
	let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		pointerStartX = e.clientX;
		pointerStartY = e.clientY;
		pointerStartTime = performance.now();
		isPointerDown = true;
		isDragging = false;
		dragOffset = 0;
		isPaused = true;
		if (pauseTimeout) {
			clearTimeout(pauseTimeout);
			pauseTimeout = null;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPointerDown) return;
		const dx = e.clientX - pointerStartX;
		const dy = e.clientY - pointerStartY;

		if (!isDragging) {
			// Lock into horizontal drag if horizontal distance exceeds vertical distance
			if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
				isDragging = true;
				if (e.currentTarget instanceof HTMLElement) {
					e.currentTarget.setPointerCapture(e.pointerId);
				}
			} else if (Math.abs(dy) > 6) {
				// User is scrolling vertically
				isPointerDown = false;
				return;
			}
		}

		if (isDragging) {
			// Elastic rubber banding at carousel boundaries
			if (
				(activeBoardIndex === 0 && dx > 0) ||
				(activeBoardIndex === LEADERBOARD_BOARDS.length - 1 && dx < 0)
			) {
				dragOffset = dx * 0.35;
			} else {
				dragOffset = dx;
			}
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isPointerDown) return;

		if (isDragging) {
			const dt = Math.max(1, performance.now() - pointerStartTime);
			const velocity = (e.clientX - pointerStartX) / dt;
			const width = containerWidth || 320;
			const threshold = width * 0.22;

			if (
				(dragOffset < -threshold || velocity < -0.35) &&
				activeBoardIndex < LEADERBOARD_BOARDS.length - 1
			) {
				activeBoardIndex += 1;
			} else if ((dragOffset > threshold || velocity > 0.35) && activeBoardIndex > 0) {
				activeBoardIndex -= 1;
			}

			if (
				e.currentTarget instanceof HTMLElement &&
				e.currentTarget.hasPointerCapture(e.pointerId)
			) {
				e.currentTarget.releasePointerCapture(e.pointerId);
			}
		}

		isPointerDown = false;
		isDragging = false;
		dragOffset = 0;

		pauseTimeout = setTimeout(() => {
			isPaused = false;
		}, 3500);
	}

	function handlePointerCancel(e: PointerEvent) {
		if (
			isPointerDown &&
			e.currentTarget instanceof HTMLElement &&
			e.currentTarget.hasPointerCapture(e.pointerId)
		) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
		isPointerDown = false;
		isDragging = false;
		dragOffset = 0;
		isPaused = false;
	}

	function formatDate(timestamp: number): string {
		const d = new Date(timestamp);
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>{leaderboardsDisabled ? 'Games — FlashCards' : 'Games & Leaderboard — FlashCards'}</title>
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
				</div>
			</div>

			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 transition-all group-hover:scale-105 group-hover:brightness-110"
			>
				<Play size={18} strokeWidth={2.75} />
			</div>
		</a>

		<!-- Match Blitz Card with 3D Visual Accent -->
		<a
			href={resolve('/games/match-blitz')}
			id="game-match-blitz-card"
			class="group shadow-card hover:shadow-card-hover relative flex items-center justify-between overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-r from-white via-emerald-50/40 to-teal-50/30 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 active:scale-[0.98]"
		>
			<div class="flex items-center gap-3.5">
				<!-- 3D Game Icon -->
				<div class="relative shrink-0">
					<img
						src="/images/match-blitz-icon.jpg"
						alt="Match Blitz"
						class="h-16 w-16 rounded-2xl border border-white/80 object-cover shadow-md shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105"
					/>
				</div>

				<div class="space-y-1">
					<h4 class="font-headline text-base font-black tracking-tight text-slate-900">
						Match Blitz
					</h4>
					<p class="font-sans text-xs text-slate-500">
						Fast-paced 3D tile matching • Multiplier streaks & wave rush
					</p>
				</div>
			</div>

			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-all group-hover:scale-105 group-hover:brightness-110"
			>
				<Play size={18} strokeWidth={2.75} />
			</div>
		</a>
	</section>

	<!-- Auto-Sliding Swipeable Leaderboard Carousel Section with Arcade Aesthetic -->
	{#if !leaderboardsDisabled}
		<section
			class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 select-none"
			aria-label="Leaderboards Carousel"
		>
			<!-- Section Header with Trophy Badge & Sync Status -->
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/25"
					>
						<Trophy size={18} strokeWidth={2.25} />
					</div>
					<div>
						<h3 class="font-headline text-sm font-black tracking-tight text-slate-900">
							Leaderboard
						</h3>
						<div class="flex items-center gap-1.5 font-sans text-[10px] font-medium text-slate-400">
							<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
							></span>
							<span>Global Rankings</span>
						</div>
					</div>
				</div>

				<button
					type="button"
					onclick={loadLeaderboard}
					disabled={isLoadingLeaderboard}
					aria-label="Refresh Leaderboard"
					class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 disabled:opacity-50"
				>
					<RefreshCw
						size={14}
						strokeWidth={2.25}
						class={isLoadingLeaderboard ? 'animate-spin text-indigo-600' : ''}
					/>
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
					bind:clientWidth={containerWidth}
					class="relative cursor-grab touch-pan-y overflow-hidden rounded-2xl select-none {isDragging
						? 'cursor-grabbing'
						: ''}"
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerCancel}
					onmouseenter={() => (isPaused = true)}
					onmouseleave={() => {
						if (!isDragging && !isPointerDown) isPaused = false;
					}}
				>
					<!-- Sliding Cards Reel with 1rem gap between cards -->
					<div
						class="flex w-full gap-4 {isDragging
							? 'transition-none'
							: 'transition-transform duration-350 ease-out'}"
						style="transform: translateX(calc(-{activeBoardIndex} * (100% + 1rem) + {dragOffset}px));"
					>
						{#each boardsWithScores as board (board.id)}
							<div class="w-full min-w-full shrink-0 space-y-2.5">
								<!-- Distinct Arcade Glass Themed Title Header -->
								<div
									class="relative overflow-hidden rounded-2xl border p-3.5 shadow-md backdrop-blur-md {board.accentGradient} {board.borderClass}"
								>
									<!-- Floating Glass Gloss Orbs -->
									<div
										class="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/25 blur-xl"
									></div>
									<div
										class="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/15 blur-lg"
									></div>

									<div class="relative flex items-center justify-between gap-2">
										<div class="flex items-center gap-3">
											<div
												class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/25 text-white shadow-xs backdrop-blur-md"
											>
												{#if board.mode === 'visual'}
													<Zap size={20} strokeWidth={2.5} class="text-white drop-shadow-xs" />
												{:else}
													<Headphones
														size={20}
														strokeWidth={2.5}
														class="text-white drop-shadow-xs"
													/>
												{/if}
											</div>

											<div>
												<h4
													class="font-headline text-base font-black tracking-tight text-white drop-shadow-xs"
												>
													{board.gameTitle} &middot; {board.mode === 'visual'
														? 'Visual Mode'
														: 'Audio Mode'}
												</h4>
											</div>
										</div>
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
											No {board.gameTitle} - {board.mode === 'visual'
												? 'Visual Mode'
												: 'Audio Mode'} Scores Yet
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
										class="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
									>
										{#each board.records as record, index (`${board.id}::${record.username}::${record.mode}::${record.id || index}::${index}`)}
											<div
												class="flex items-center justify-between p-3 transition-colors hover:bg-slate-50/80 {index ===
												0
													? board.mode === 'visual'
														? 'bg-sky-50/30'
														: 'bg-amber-50/30'
													: index === 1
														? 'bg-slate-50/50'
														: index === 2
															? 'bg-slate-50/25'
															: ''}"
											>
												<div class="flex items-center gap-3">
													<!-- Rank Badge / Podium Crown -->
													<div
														class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-headline text-xs font-black shadow-xs {index ===
														0
															? `border ${board.rank1Border} bg-linear-to-b ${board.rank1Gradient} shadow-amber-500/20`
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
																class="py-0.2 rounded-full px-1.5 font-headline text-[10px] font-semibold {board.scoreBadgeBg} capitalize"
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
													<span class="font-headline text-sm font-black {board.scoreColor}"
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
									? dotIdx === 0
										? 'w-5 bg-indigo-600'
										: 'w-5 bg-amber-600'
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
	{/if}
</main>
