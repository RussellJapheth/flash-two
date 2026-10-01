<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import FoodCart3DScene from '$lib/components/games/FoodCart3DScene.svelte';
	import {
		FOOD_ITEMS,
		CUSTOMER_PROFILES,
		type FoodItem,
		type CustomerProfile
	} from '$lib/data/foodCartItems';
	import { saveGameScore, getGameHighScore } from '$lib/utils/gameStorage';
	import { playSound, speakWord, stopSpeech } from '$lib/utils/audio';
	import { addXP, calculateGameXP } from '$lib/utils/xp';
	import {
		ChevronLeft,
		Volume2,
		VolumeX,
		Flame,
		Trophy,
		Sparkles,
		RotateCcw,
		Timer,
		CheckCircle2,
		XCircle,
		HelpCircle,
		Play,
		Award
	} from 'lucide-svelte';

	type GameMode = 'rush' | 'zen';
	type GamePhase = 'lobby' | 'playing' | 'gameover';

	let gameMode = $state<GameMode>('rush');
	let gamePhase = $state<GamePhase>('lobby');

	// Game State
	let score = $state(0);
	let highScore = $state(0);
	let isNewHighScore = $state(false);
	let combo = $state(0);
	let maxCombo = $state(0);
	let correctCount = $state(0);
	let wrongCount = $state(0);
	let earnedXP = $state(0);

	// Timer (60s in Rush mode)
	let timeLeft = $state(60);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	// Audio & Settings
	let soundEnabled = $state(true);
	let autoSpeakOrder = $state(true);
	let showEnglishClue = $state(true);

	// Customer & Current Order
	let currentCustomer = $state<CustomerProfile>(CUSTOMER_PROFILES[0]);
	let targetFood = $state<FoodItem>(FOOD_ITEMS[0]);
	let servedItemId = $state<string | null>(null);
	let serveResult = $state<'correct' | 'wrong' | null>(null);
	let feedbackText = $state<string | null>(null);
	let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
	let isProcessingServe = false;

	// Active food items in the stall (10 diverse items)
	const activeFoodItems: FoodItem[] = FOOD_ITEMS.slice(0, 11);

	onMount(() => {
		highScore = getGameHighScore('food-cart', 'visual');
	});

	onDestroy(() => {
		stopTimer();
		stopSpeech();
		if (feedbackTimer) clearTimeout(feedbackTimer);
	});

	function startGame(mode: GameMode) {
		gameMode = mode;
		score = 0;
		combo = 0;
		maxCombo = 0;
		correctCount = 0;
		wrongCount = 0;
		earnedXP = 0;
		isNewHighScore = false;
		servedItemId = null;
		serveResult = null;
		feedbackText = null;
		isProcessingServe = false;

		nextCustomer(true);

		gamePhase = 'playing';

		if (mode === 'rush') {
			timeLeft = 60;
			startTimer();
		}
	}

	function startTimer() {
		stopTimer();
		timerInterval = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				endGame();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function nextCustomer(isFirst = false) {
		// Pick random customer different from current
		const availableCustomers = CUSTOMER_PROFILES.filter((c) => c.id !== currentCustomer.id);
		currentCustomer =
			availableCustomers[Math.floor(Math.random() * availableCustomers.length)] ||
			CUSTOMER_PROFILES[0];

		// Pick random target food from active stall items
		const availableFoods = activeFoodItems.filter((f) => f.id !== targetFood.id);
		targetFood =
			availableFoods[Math.floor(Math.random() * availableFoods.length)] || activeFoodItems[0];

		// Pronounce Chinese name via Web Speech TTS if enabled
		if (autoSpeakOrder && soundEnabled) {
			setTimeout(
				() => {
					speakWord(targetFood.hanzi, 'chinese');
				},
				isFirst ? 300 : 150
			);
		}
	}

	function repeatPronunciation() {
		if (!targetFood) return;
		speakWord(targetFood.hanzi, 'chinese');
	}

	function handleFoodSelect(selectedId: string) {
		if (gamePhase !== 'playing' || isProcessingServe) return;

		isProcessingServe = true;
		servedItemId = selectedId;
		const selectedFood = activeFoodItems.find((f) => f.id === selectedId);

		const isCorrect = selectedId === targetFood.id;

		if (isCorrect) {
			serveResult = 'correct';
			combo += 1;
			if (combo > maxCombo) maxCombo = combo;
			correctCount += 1;

			// Score calculation: 100 base + combo bonus
			const points = 100 + Math.min(200, (combo - 1) * 35);
			score += points;

			if (soundEnabled) {
				playSound('correct');
			}

			feedbackText = `+${points} pts! ${currentCustomer.happySound}`;

			if (feedbackTimer) clearTimeout(feedbackTimer);
			feedbackTimer = setTimeout(() => {
				serveResult = null;
				feedbackText = null;
				isProcessingServe = false;
				nextCustomer();
			}, 900);
		} else {
			serveResult = 'wrong';
			combo = 0;
			wrongCount += 1;

			if (soundEnabled) {
				playSound('wrong');
			}

			const tappedName = selectedFood
				? `${selectedFood.pinyin} (${selectedFood.english})`
				: 'wrong item';
			feedbackText = `That was ${tappedName}! Order is ${targetFood.pinyin} (${targetFood.english})`;

			if (feedbackTimer) clearTimeout(feedbackTimer);
			feedbackTimer = setTimeout(() => {
				serveResult = null;
				feedbackText = null;
				isProcessingServe = false;
			}, 1600);
		}
	}

	async function endGame() {
		stopTimer();
		stopSpeech();
		gamePhase = 'gameover';

		const totalAttempts = correctCount + wrongCount;
		const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

		// Calculate XP strictly according to AGENTS.md rule
		earnedXP = calculateGameXP(correctCount, accuracy, maxCombo);
		if (earnedXP > 0) {
			addXP(earnedXP);
		}

		if (score > highScore && score > 0) {
			highScore = score;
			isNewHighScore = true;
		}

		if (soundEnabled) {
			playSound('milestone');
		}

		// Persist score to local and cloud leaderboard
		await saveGameScore({
			gameId: 'food-cart',
			gameName: 'Street Food Cart',
			score,
			correct: correctCount,
			wrong: wrongCount,
			accuracy,
			maxCombo,
			mode: 'visual'
		});
	}
</script>

<svelte:head>
	<title>Street Food Cart 3D • FlashCards</title>
	<meta
		name="description"
		content="Run a 3D street food cart in Mandarin Chinese! Learn food vocabulary, pinyin, and pronunciation by serving hungry customers."
	/>
</svelte:head>

<div class="min-h-screen bg-slate-50 pb-12 font-sans text-slate-900 select-none">
	<!-- Top Navigation Bar -->
	<header
		class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md"
	>
		<div class="flex items-center gap-2">
			<a
				href={resolve('/games')}
				aria-label="Back to Games"
				class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-transform hover:bg-slate-50 active:scale-95"
			>
				<ChevronLeft size={20} strokeWidth={2.5} />
			</a>
			<div>
				<h1 class="font-headline text-base font-extrabold tracking-tight text-slate-900">
					Street Food Cart 3D
				</h1>
				<span class="block text-[11px] font-medium text-slate-500">街头美食餐车</span>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<!-- Sound Toggle -->
			<button
				type="button"
				onclick={() => (soundEnabled = !soundEnabled)}
				aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
				class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 active:scale-95"
			>
				{#if soundEnabled}
					<Volume2 size={18} strokeWidth={2.2} class="text-indigo-600" />
				{:else}
					<VolumeX size={18} strokeWidth={2.2} class="text-slate-400" />
				{/if}
			</button>

			<!-- Clue Toggle (English meaning) -->
			<button
				type="button"
				onclick={() => (showEnglishClue = !showEnglishClue)}
				aria-label="Toggle English Clues"
				class="flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-xs font-bold transition-all active:scale-95 {showEnglishClue
					? 'border-indigo-200 bg-indigo-50 text-indigo-700'
					: 'border-slate-200 bg-white text-slate-500'}"
			>
				<HelpCircle size={14} strokeWidth={2.4} />
				<span class="hidden sm:inline">English Clues</span>
			</button>
		</div>
	</header>

	<main class="mx-auto w-full max-w-4xl px-3 pt-3 sm:px-6">
		{#if gamePhase === 'lobby'}
			<!-- LOBBY SCREEN -->
			<section
				class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center sm:p-8"
			>
				<div
					class="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-amber-200 bg-linear-to-b from-amber-50 to-orange-100 p-2 shadow-lg shadow-amber-500/15"
				>
					<img
						src="/images/food-cart-icon.jpg"
						alt="Street Food Cart 3D"
						class="h-full w-full rounded-2xl object-cover"
					/>
				</div>

				<h2
					class="mt-5 font-headline text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
				>
					Street Food Cart 3D
				</h2>
				<p class="mx-auto mt-2 max-w-md font-sans text-sm text-slate-600">
					Run your own bustling street stall! Listen to Chinese orders, match tasty dishes, and
					serve customers before time runs out.
				</p>

				<!-- High Score Chip -->
				{#if highScore > 0}
					<div
						class="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 font-headline text-xs font-bold text-amber-900"
					>
						<Trophy size={14} class="text-amber-600" />
						<span>High Score: {highScore.toLocaleString()} pts</span>
					</div>
				{/if}

				<!-- Mode Selection Cards -->
				<div class="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
					<!-- Rush Mode Card -->
					<button
						type="button"
						onclick={() => startGame('rush')}
						class="group shadow-card hover:shadow-card-hover relative flex flex-col justify-between rounded-2xl border border-orange-200 bg-linear-to-br from-white via-orange-50/40 to-amber-50/30 p-5 transition-all hover:-translate-y-1 hover:border-orange-400 active:scale-98"
					>
						<div>
							<div class="flex items-center justify-between">
								<span
									class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/25"
								>
									<Timer size={20} strokeWidth={2.5} />
								</span>
								<span
									class="rounded-full bg-orange-100 px-2.5 py-0.5 font-headline text-[11px] font-extrabold text-orange-800"
								>
									60 Seconds
								</span>
							</div>
							<h3 class="mt-4 font-headline text-lg font-black text-slate-900">
								Lunch Rush (Arcade)
							</h3>
							<p class="mt-1 text-xs leading-relaxed text-slate-600">
								Fast-paced arcade drill. Keep your combo alive, rack up multipliers, and earn
								maximum XP.
							</p>
						</div>

						<div
							class="mt-5 flex items-center justify-between border-t border-orange-100/80 pt-3 font-headline text-sm font-bold text-orange-600 transition-transform group-hover:translate-x-1"
						>
							<span>Start Rush</span>
							<Play size={16} fill="currentColor" />
						</div>
					</button>

					<!-- Zen Practice Card -->
					<button
						type="button"
						onclick={() => startGame('zen')}
						class="group shadow-card hover:shadow-card-hover relative flex flex-col justify-between rounded-2xl border border-emerald-200 bg-linear-to-br from-white via-emerald-50/40 to-teal-50/30 p-5 transition-all hover:-translate-y-1 hover:border-emerald-400 active:scale-98"
					>
						<div>
							<div class="flex items-center justify-between">
								<span
									class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25"
								>
									<Sparkles size={20} strokeWidth={2.5} />
								</span>
								<span
									class="rounded-full bg-emerald-100 px-2.5 py-0.5 font-headline text-[11px] font-extrabold text-emerald-800"
								>
									Untimed
								</span>
							</div>
							<h3 class="mt-4 font-headline text-lg font-black text-slate-900">
								Zen Kitchen (Practice)
							</h3>
							<p class="mt-1 text-xs leading-relaxed text-slate-600">
								Relaxed learning pace. Listen to audio pronunciation, inspect 3D food items, and
								learn stress-free.
							</p>
						</div>

						<div
							class="mt-5 flex items-center justify-between border-t border-emerald-100/80 pt-3 font-headline text-sm font-bold text-emerald-600 transition-transform group-hover:translate-x-1"
						>
							<span>Start Zen Kitchen</span>
							<Play size={16} fill="currentColor" />
						</div>
					</button>
				</div>
			</section>
		{:else if gamePhase === 'playing'}
			<!-- PLAYING SCREEN -->
			<div class="space-y-3">
				<!-- HUD Bar: Score, Timer/Zen, Combo -->
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs"
				>
					<!-- Score -->
					<div class="flex items-center gap-2">
						<span class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
							Score
						</span>
						<span class="font-headline text-xl font-black text-slate-900 tabular-nums">
							{score.toLocaleString()}
						</span>
					</div>

					<!-- Timer / Mode Badge -->
					{#if gameMode === 'rush'}
						<div
							class="flex items-center gap-1.5 rounded-full px-3 py-1 font-headline text-sm font-extrabold transition-colors {timeLeft <=
							10
								? 'animate-pulse bg-rose-100 text-rose-700'
								: 'bg-amber-100 text-amber-900'}"
						>
							<Timer size={16} strokeWidth={2.5} />
							<span class="tabular-nums">{timeLeft}s</span>
						</div>
					{:else}
						<div
							class="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-headline text-xs font-bold text-emerald-800"
						>
							<Sparkles size={14} />
							<span>Zen Mode</span>
						</div>
					{/if}

					<!-- Combo Streak -->
					<div class="flex items-center gap-1.5">
						{#if combo >= 2}
							<div
								class="flex items-center gap-1 rounded-full bg-linear-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 font-headline text-xs font-extrabold text-white shadow-sm shadow-orange-500/20"
							>
								<Flame size={14} class="fill-current" />
								<span>x{combo}</span>
							</div>
						{:else}
							<span class="text-xs font-medium text-slate-400">Combo x1</span>
						{/if}
					</div>
				</div>

				<!-- Customer Order Box (Prompt & Audio) -->
				<div
					class="shadow-card relative overflow-hidden rounded-3xl border border-amber-200/80 bg-linear-to-r from-white via-amber-50/50 to-orange-50/40 p-4"
				>
					<div class="flex items-center justify-between gap-3">
						<!-- Customer Avatar & Catchphrase -->
						<div class="flex items-center gap-3">
							<div
								class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-2xl shadow-sm"
							>
								<span>{currentCustomer.avatar}</span>
							</div>
							<div>
								<div class="flex items-center gap-1.5">
									<h4 class="font-headline text-sm font-extrabold text-slate-900">
										{currentCustomer.name}
									</h4>
									<span
										class="rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-800"
									>
										{currentCustomer.role}
									</span>
								</div>
								<p class="text-xs text-slate-500 italic">
									"{currentCustomer.greeting}"
								</p>
							</div>
						</div>

						<!-- Target Pronunciation Replay Button -->
						<button
							type="button"
							onclick={repeatPronunciation}
							aria-label="Listen to Chinese pronunciation"
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm transition-transform hover:scale-105 active:scale-95"
						>
							<Volume2 size={24} strokeWidth={2.5} />
						</button>
					</div>

					<!-- Order Highlight Speech Banner -->
					<div
						class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/60 bg-white/90 p-3 shadow-xs"
					>
						<div class="flex items-center gap-3">
							<span class="text-xs font-bold tracking-wide text-amber-900 uppercase"> Order: </span>
							<!-- Pinyin (Primary clue for beginner) -->
							<span
								class="font-headline text-xl font-black tracking-tight text-indigo-600 sm:text-2xl"
							>
								{targetFood.pinyin}
							</span>
							<!-- Subtle Hanzi for passive learning -->
							<span
								class="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-headline text-xs font-bold text-slate-600"
							>
								{targetFood.hanzi}
							</span>
						</div>

						<!-- English Translation Clue -->
						{#if showEnglishClue}
							<div class="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
								<span>Meaning:</span>
								<span class="font-bold text-slate-900">{targetFood.english}</span>
							</div>
						{/if}
					</div>

					<!-- Live Serve Feedback Alert -->
					{#if feedbackText}
						<div
							class="mt-2 flex items-center justify-center gap-2 rounded-xl py-1.5 text-center font-headline text-xs font-bold transition-all {serveResult ===
							'correct'
								? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
								: 'border border-rose-200 bg-rose-50 text-rose-800'}"
						>
							{#if serveResult === 'correct'}
								<CheckCircle2 size={16} class="text-emerald-600" />
							{:else}
								<XCircle size={16} class="text-rose-600" />
							{/if}
							<span>{feedbackText}</span>
						</div>
					{/if}
				</div>

				<!-- 3D Food Stall Viewport -->
				<div
					class="shadow-card relative h-[48vh] max-h-[480px] min-h-[340px] w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-slate-100 via-amber-50/20 to-orange-50/30"
				>
					<FoodCart3DScene
						items={activeFoodItems}
						activeTargetId={targetFood.id}
						onSelectItem={handleFoodSelect}
						{servedItemId}
						isServeResult={serveResult}
					/>

					<!-- Subtle Interactive Hint Overlay -->
					<div
						class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/60 bg-slate-900/60 px-3 py-1 font-sans text-[11px] font-medium text-white shadow-xs backdrop-blur-xs"
					>
						Tap a 3D dish on the cart to serve!
					</div>
				</div>

				<!-- Mobile Touch Shelf / Quick Counter Menu -->
				<div
					class="shadow-card rounded-3xl border border-slate-200/80 bg-white p-3"
					aria-label="Counter Dishes Shelf"
				>
					<div class="mb-2 flex items-center justify-between px-1">
						<span
							class="font-headline text-[11px] font-bold tracking-wider text-slate-400 uppercase"
						>
							Stall Dishes (Quick Tap)
						</span>
						<span class="text-[11px] text-slate-500">Tap 3D or Tap Button</span>
					</div>

					<!-- Scrollable horizontal grid of dish buttons for direct mobile thumb access -->
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
						{#each activeFoodItems as food (food.id)}
							<button
								type="button"
								onclick={() => handleFoodSelect(food.id)}
								class="flex flex-col items-center justify-center rounded-2xl border p-2 transition-all active:scale-95 {food.id ===
								targetFood.id
									? 'border-indigo-400 bg-indigo-50/90 text-indigo-950 shadow-sm'
									: 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-white'}"
							>
								<span class="text-2xl">{food.emoji}</span>
								<span class="mt-1 font-headline text-xs font-extrabold tracking-tight">
									{food.pinyin}
								</span>
								{#if showEnglishClue}
									<span class="max-w-[70px] truncate text-[10px] text-slate-500">
										{food.english}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else if gamePhase === 'gameover'}
			<!-- GAME OVER / RESULTS SUMMARY SCREEN -->
			<section
				class="shadow-card mx-auto max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center sm:p-8"
			>
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25"
				>
					<Trophy size={32} strokeWidth={2.5} />
				</div>

				<h2 class="mt-4 font-headline text-2xl font-black tracking-tight text-slate-900">
					Shift Complete!
				</h2>
				<p class="mt-1 text-xs text-slate-500">All customers served. Great cooking today!</p>

				{#if isNewHighScore}
					<div
						class="mx-auto mt-3 inline-flex animate-bounce items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-headline text-xs font-black text-amber-900"
					>
						<Sparkles size={14} class="text-amber-600" />
						<span>New Personal Best!</span>
					</div>
				{/if}

				<!-- Score Box -->
				<div class="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
					<span class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
						Total Score
					</span>
					<div class="font-headline text-4xl font-black text-indigo-600">
						{score.toLocaleString()}
					</div>
				</div>

				<!-- Stats Grid -->
				<div class="mt-4 grid grid-cols-3 gap-2.5">
					<div class="rounded-2xl border border-slate-200/80 bg-white p-3">
						<span class="block text-[11px] font-bold text-slate-400 uppercase">Served</span>
						<span class="font-headline text-lg font-black text-slate-900">{correctCount}</span>
					</div>
					<div class="rounded-2xl border border-slate-200/80 bg-white p-3">
						<span class="block text-[11px] font-bold text-slate-400 uppercase">Accuracy</span>
						<span class="font-headline text-lg font-black text-slate-900">
							{correctCount + wrongCount > 0
								? Math.round((correctCount / (correctCount + wrongCount)) * 100)
								: 0}%
						</span>
					</div>
					<div class="rounded-2xl border border-slate-200/80 bg-white p-3">
						<span class="block text-[11px] font-bold text-slate-400 uppercase">Max Streak</span>
						<span class="font-headline text-lg font-black text-slate-900">{maxCombo}x</span>
					</div>
				</div>

				<!-- XP Earned Card -->
				{#if earnedXP > 0}
					<div
						class="mt-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5"
					>
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs"
							>
								<Award size={18} />
							</div>
							<div class="text-left">
								<h5 class="font-headline text-xs font-extrabold text-amber-950">XP Awarded</h5>
								<p class="text-[11px] text-amber-800">Added to your daily ledger</p>
							</div>
						</div>
						<span class="font-headline text-base font-black text-amber-700">+{earnedXP} XP</span>
					</div>
				{/if}

				<!-- Action Buttons -->
				<div class="mt-6 flex flex-col gap-3 sm:flex-row">
					<button
						type="button"
						onclick={() => startGame(gameMode)}
						class="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-extrabold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-98"
					>
						<RotateCcw size={18} strokeWidth={2.5} />
						<span>Play Again</span>
					</button>

					<a
						href={resolve('/games')}
						class="flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white font-headline text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-98"
					>
						Back to Games
					</a>
				</div>
			</section>
		{/if}
	</main>
</div>
