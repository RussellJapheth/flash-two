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
		HelpCircle,
		Play,
		Award,
		BookOpen,
		X
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
	let showEnglishClue = $state(false);

	// Customer & Current Order (Simulating realistic street food orders: 2-3 items per customer)
	interface CustomerOrder {
		customer: CustomerProfile;
		items: FoodItem[];
		servedIds: string[];
	}

	let currentOrder = $state<CustomerOrder>({
		customer: CUSTOMER_PROFILES[0],
		items: [FOOD_ITEMS[0], FOOD_ITEMS[1]],
		servedIds: []
	});

	let currentCustomer = $derived(currentOrder.customer);
	// Primary active target for clues/audio: first unserved item
	let targetFood = $derived(
		currentOrder.items.find((f) => !currentOrder.servedIds.includes(f.id)) || currentOrder.items[0]
	);
	let roundIndex = $state(0);

	let serveResult = $state<'correct' | 'wrong' | null>(null);
	let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
	let isProcessingServe = false;
	let isMenuModalOpen = $state(false);

	interface FloatingNotice {
		id: number;
		x: number;
		y: number;
		isCorrect: boolean;
		title: string;
		subtitle: string;
	}

	let floatingNotices = $state<FloatingNotice[]>([]);
	let noticeCounter = 0;

	function handleModalFoodSelect(selectedId: string) {
		const winW = typeof window !== 'undefined' ? window.innerWidth : 400;
		const winH = typeof window !== 'undefined' ? window.innerHeight : 600;
		handleFoodSelect(selectedId, { x: winW / 2, y: winH * 0.52 });
		isMenuModalOpen = false;
	}

	// Active food items in the stall (5 large in back row, 5 compact in front row)
	const activeFoodItems: FoodItem[] = [
		// Back row: larger / taller items
		FOOD_ITEMS.find((f) => f.id === 'baozi')!,
		FOOD_ITEMS.find((f) => f.id === 'cha')!,
		FOOD_ITEMS.find((f) => f.id === 'tang')!,
		FOOD_ITEMS.find((f) => f.id === 'rou')!,
		FOOD_ITEMS.find((f) => f.id === 'miantiao')!,
		// Front row: compact / flat items
		FOOD_ITEMS.find((f) => f.id === 'mifan')!,
		FOOD_ITEMS.find((f) => f.id === 'yu')!,
		FOOD_ITEMS.find((f) => f.id === 'jidan')!,
		FOOD_ITEMS.find((f) => f.id === 'pingguo')!,
		FOOD_ITEMS.find((f) => f.id === 'mianbao')!
	];

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
		roundIndex = 0;
		isNewHighScore = false;
		serveResult = null;
		floatingNotices = [];
		isProcessingServe = false;
		isMenuModalOpen = false;

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
		const availableCustomers = CUSTOMER_PROFILES.filter((c) => c.id !== currentOrder.customer.id);
		const newCustomer =
			availableCustomers[Math.floor(Math.random() * availableCustomers.length)] ||
			CUSTOMER_PROFILES[0];

		// Decide ticket size: 2 items initially, or random 2-3 items for varied customer orders
		const ticketCount = roundIndex < 2 ? 2 : Math.random() < 0.5 ? 2 : 3;

		// Pick unique items from active stall items
		const shuffledPool = [...activeFoodItems].sort(() => Math.random() - 0.5);
		const orderItems = shuffledPool.slice(0, ticketCount);

		currentOrder = {
			customer: newCustomer,
			items: orderItems,
			servedIds: []
		};

		serveResult = null;

		// Pronounce Chinese name of first target item via Web Speech TTS if enabled
		if (autoSpeakOrder && soundEnabled) {
			setTimeout(
				() => {
					speakWord(orderItems[0].hanzi, 'chinese');
				},
				isFirst ? 300 : 200
			);
		}
	}

	function repeatPronunciation(foodToSpeak?: FoodItem) {
		const target = foodToSpeak || targetFood;
		if (!target) return;
		speakWord(target.hanzi, 'chinese');
	}

	function handleFoodSelect(selectedId: string, screenPos?: { x: number; y: number }) {
		if (gamePhase !== 'playing' || isProcessingServe) return;

		const selectedFood = activeFoodItems.find((f) => f.id === selectedId);
		const isItemInOrder = currentOrder.items.some((f) => f.id === selectedId);
		const isAlreadyServed = currentOrder.servedIds.includes(selectedId);

		// Calculate screen position for floating notice
		let noticeX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
		let noticeY = typeof window !== 'undefined' ? window.innerHeight * 0.52 : 320;

		if (screenPos) {
			noticeX = Math.max(90, Math.min(window.innerWidth - 90, screenPos.x));
			noticeY = Math.max(140, Math.min(window.innerHeight - 90, screenPos.y));
		}

		const noticeId = ++noticeCounter;

		if (isItemInOrder && !isAlreadyServed) {
			serveResult = 'correct';
			const newServed = [...currentOrder.servedIds, selectedId];
			currentOrder.servedIds = newServed;

			combo += 1;
			if (combo > maxCombo) maxCombo = combo;
			correctCount += 1;

			const isOrderComplete = newServed.length === currentOrder.items.length;
			const basePoints = 100 + Math.min(150, (combo - 1) * 25);
			const bonusPoints = isOrderComplete ? 150 : 0;
			const points = basePoints + bonusPoints;
			score += points;

			if (soundEnabled) {
				playSound('correct');
			}

			if (isOrderComplete) {
				// FULL CUSTOMER TICKET SERVED!
				isProcessingServe = true;
				floatingNotices = [
					...floatingNotices,
					{
						id: noticeId,
						x: noticeX,
						y: noticeY,
						isCorrect: true,
						title: `🎉 ORDER SERVED! +${points} PTS!`,
						subtitle: `${currentCustomer.name}: "${currentCustomer.happySound}"`
					}
				];

				if (feedbackTimer) clearTimeout(feedbackTimer);
				feedbackTimer = setTimeout(() => {
					roundIndex += 1; // triggers plate slide out and stall items shuffle in 3D scene
					serveResult = null;
					isProcessingServe = false;
					floatingNotices = floatingNotices.filter((n) => n.id !== noticeId);
					nextCustomer();
				}, 1100);
			} else {
				// Partial item plated onto dish
				const remainingCount = currentOrder.items.length - newServed.length;
				floatingNotices = [
					...floatingNotices,
					{
						id: noticeId,
						x: noticeX,
						y: noticeY,
						isCorrect: true,
						title: `+${points} PTS! Plated! 🥢`,
						subtitle: `${selectedFood?.hanzi || ''} • ${remainingCount} more needed!`
					}
				];

				// Auto-speak next needed item
				const nextNeeded = currentOrder.items.find((f) => !newServed.includes(f.id));
				if (nextNeeded && autoSpeakOrder && soundEnabled) {
					setTimeout(() => {
						speakWord(nextNeeded.hanzi, 'chinese');
					}, 450);
				}

				if (feedbackTimer) clearTimeout(feedbackTimer);
				feedbackTimer = setTimeout(() => {
					serveResult = null;
					floatingNotices = floatingNotices.filter((n) => n.id !== noticeId);
				}, 700);
			}
		} else {
			// Wrong item tapped!
			serveResult = 'wrong';
			combo = 0;
			wrongCount += 1;

			if (soundEnabled) {
				playSound('wrong');
			}

			const tappedHanzi = selectedFood ? selectedFood.hanzi : '';
			const tappedPinyin = selectedFood ? selectedFood.pinyin : 'wrong';

			floatingNotices = [
				...floatingNotices,
				{
					id: noticeId,
					x: noticeX,
					y: noticeY,
					isCorrect: false,
					title: `❌ ${tappedHanzi} ${tappedPinyin}`,
					subtitle: isAlreadyServed
						? 'Already on the plate!'
						: `Not ordered by ${currentCustomer.name}!`
				}
			];

			if (feedbackTimer) clearTimeout(feedbackTimer);
			feedbackTimer = setTimeout(() => {
				serveResult = null;
				floatingNotices = floatingNotices.filter((n) => n.id !== noticeId);
			}, 1400);
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

{#if gamePhase === 'playing'}
	<!-- PLAYING SCREEN: Full Viewport, Zero Scrolling on Mobile, Authentic Street Market Background -->
	<div class="fixed inset-0 z-30 flex flex-col overflow-hidden bg-slate-950 font-sans select-none">
		<!-- Authentic Changing Street Market Background (Crossfades between authentic day/night street markets) -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out {roundIndex %
					2 ===
				0
					? 'opacity-100'
					: 'opacity-0'}"
				style="background-image: url('/images/food-cart/bg-day.jpg');"
			></div>
			<div
				class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out {roundIndex %
					2 ===
				1
					? 'opacity-100'
					: 'opacity-0'}"
				style="background-image: url('/images/food-cart/bg-night.jpg');"
			></div>
			<!-- Subtle dark vignette and warm tone overlay -->
			<div
				class="absolute inset-0 bg-linear-to-b from-slate-950/40 via-transparent to-slate-950/70"
			></div>
		</div>

		<!-- 1. Unified Compact HUD Bar -->
		<header
			class="relative z-20 flex h-12 shrink-0 items-center justify-between border-b border-amber-200/50 bg-white/90 px-3 backdrop-blur-md"
		>
			<!-- Left: Exit & Customer Chip with Kenney Avatar -->
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => {
						stopTimer();
						stopSpeech();
						gamePhase = 'lobby';
					}}
					aria-label="Exit to Lobby"
					class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-transform hover:bg-slate-50 active:scale-95"
				>
					<ChevronLeft size={18} strokeWidth={2.5} />
				</button>
				<div
					class="flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/90 px-2 py-0.5 text-xs font-bold text-amber-900"
				>
					<img
						src={currentCustomer.avatarImg}
						alt={currentCustomer.name}
						class="h-5 w-5 object-contain"
					/>
					<span class="font-headline text-[11px] sm:inline">{currentCustomer.name}</span>
				</div>
			</div>

			<!-- Center: Timer & Combo -->
			<div class="flex items-center gap-2">
				{#if gameMode === 'rush'}
					<div
						class="flex items-center gap-1 rounded-full px-2.5 py-0.5 font-headline text-xs font-extrabold transition-colors {timeLeft <=
						10
							? 'animate-pulse bg-rose-100 text-rose-700 ring-2 ring-rose-400/40'
							: 'bg-amber-100 text-amber-900'}"
					>
						<Timer size={14} strokeWidth={2.5} />
						<span class="tabular-nums">{timeLeft}s</span>
					</div>
				{:else}
					<div
						class="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-headline text-xs font-bold text-emerald-800"
					>
						<Sparkles size={12} />
						<span>Zen</span>
					</div>
				{/if}

				{#if combo >= 2}
					<div
						class="flex items-center gap-0.5 rounded-full bg-linear-to-r from-orange-500 to-rose-500 px-2 py-0.5 font-headline text-[11px] font-extrabold text-white shadow-xs"
					>
						<Flame size={12} class="fill-current" />
						<span>x{combo}</span>
					</div>
				{/if}
			</div>

			<!-- Right: Score, Sound & Menu Modal Button -->
			<div class="flex items-center gap-1.5">
				<div class="mr-1 text-right">
					<span class="font-headline text-xs font-black text-slate-900 tabular-nums">
						{score.toLocaleString()}
					</span>
					<span class="block text-[9px] leading-none font-bold text-slate-400 uppercase">PTS</span>
				</div>

				<button
					type="button"
					onclick={() => (soundEnabled = !soundEnabled)}
					aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
					class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95"
				>
					{#if soundEnabled}
						<Volume2 size={16} strokeWidth={2.2} class="text-indigo-600" />
					{:else}
						<VolumeX size={16} strokeWidth={2.2} class="text-slate-400" />
					{/if}
				</button>

				<button
					type="button"
					onclick={() => (isMenuModalOpen = true)}
					aria-label="Open Stall Dishes Menu"
					class="flex h-8 items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 font-headline text-xs font-extrabold text-amber-900 shadow-2xs transition-all hover:bg-amber-100 active:scale-95"
				>
					<BookOpen size={14} />
					<span>Menu</span>
				</button>
			</div>
		</header>

		<!-- 2. 3D Viewport (Flexible 100% remaining space, NO scroll) -->
		<div class="relative min-h-0 w-full flex-1 overflow-hidden">
			<!-- Floating Customer Order Card (Simulating Multi-Item Customer Tickets) -->
			<div
				class="absolute inset-x-3 top-2.5 z-20 flex flex-col gap-1.5 rounded-2xl border border-amber-200/90 bg-white/95 px-3 py-2 shadow-lg shadow-amber-950/15 backdrop-blur-md transition-all sm:inset-x-auto sm:left-1/2 sm:w-auto sm:min-w-[380px] sm:-translate-x-1/2"
			>
				<!-- Top Bar: Customer avatar, speech & Progress -->
				<div class="flex items-center justify-between gap-2 border-b border-amber-100 pb-1.5">
					<div class="flex min-w-0 items-center gap-2">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300 bg-amber-100/90 p-0.5 shadow-2xs"
						>
							<img
								src={currentCustomer.avatarImg}
								alt={currentCustomer.name}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="flex min-w-0 flex-col">
							<div class="flex items-center gap-1.5">
								<span class="truncate text-xs font-black text-amber-950">
									{currentCustomer.name}
								</span>
								<span
									class="py-0.2 rounded bg-amber-100 px-1.5 font-headline text-[9px] font-extrabold text-amber-900"
								>
									{currentCustomer.role}
								</span>
							</div>
							<span class="truncate text-[10px] text-amber-800/80 italic">
								"{currentCustomer.greeting}"
							</span>
						</div>
					</div>

					<div class="flex shrink-0 items-center gap-1.5">
						<span
							class="rounded-lg bg-amber-100/80 px-2 py-0.5 font-headline text-[10px] font-extrabold text-amber-900"
						>
							{currentOrder.servedIds.length}/{currentOrder.items.length} Plated
						</span>
						<!-- Clue Toggle Pill (Off by default) -->
						<button
							type="button"
							onclick={() => (showEnglishClue = !showEnglishClue)}
							class="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold transition-all active:scale-95 {showEnglishClue
								? 'bg-amber-600 text-white shadow-2xs'
								: 'border border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100'}"
						>
							{showEnglishClue ? 'Clue ON' : 'Clue OFF'}
						</button>
					</div>
				</div>

				<!-- Dishes in Customer Ticket -->
				<div class="flex flex-wrap items-center gap-1.5">
					{#each currentOrder.items as orderItem (orderItem.id)}
						{@const isServed = currentOrder.servedIds.includes(orderItem.id)}
						{@const isNextTarget = !isServed && orderItem.id === targetFood.id}
						<div
							class="flex items-center gap-1.5 rounded-xl border px-2 py-1 transition-all {isServed
								? 'border-emerald-300 bg-emerald-50/90 text-emerald-800 opacity-60'
								: isNextTarget
									? 'border-amber-400 bg-amber-500/15 text-amber-950 shadow-xs ring-1 ring-amber-400/50'
									: 'border-slate-200 bg-slate-50 text-slate-700'}"
						>
							{#if isServed}
								<span class="text-xs font-black text-emerald-600">✓</span>
							{/if}
							<button
								type="button"
								onclick={() => repeatPronunciation(orderItem)}
								aria-label={`Pronounce ${orderItem.pinyin}`}
								class="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-amber-800 shadow-2xs transition-transform hover:scale-105 active:scale-95"
							>
								<Volume2 size={13} strokeWidth={2.5} />
							</button>

							<div class="flex flex-col">
								<div class="flex items-baseline gap-1">
									<span
										class="font-headline text-xs font-black tracking-tight {isServed
											? 'text-emerald-900 line-through'
											: ''}"
									>
										{orderItem.pinyin}
									</span>
									<span class="font-headline text-[11px] font-bold text-slate-800">
										{orderItem.hanzi}
									</span>
								</div>
								{#if showEnglishClue}
									<span class="text-[9px] font-medium text-amber-700">
										{orderItem.english}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- 3D Scene -->
			<FoodCart3DScene
				items={activeFoodItems}
				activeTargetId={targetFood.id}
				onSelectItem={handleFoodSelect}
				isServeResult={serveResult}
				{roundIndex}
				plateItemIds={currentOrder.servedIds}
			/>

			<!-- Floating Indicators on Tapped Items (Error / Serve feedback) -->
			{#each floatingNotices as notice (notice.id)}
				<div
					class="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full transition-all duration-300"
					style="left: {notice.x}px; top: {notice.y - 12}px;"
				>
					<div
						class="relative flex flex-col items-center justify-center rounded-2xl px-3.5 py-1.5 text-center shadow-xl ring-2 backdrop-blur-md {notice.isCorrect
							? 'bg-emerald-600/95 text-white shadow-emerald-950/20 ring-emerald-300/80'
							: 'bg-rose-600/95 text-white shadow-rose-950/20 ring-rose-300/80'}"
					>
						<span class="font-headline text-xs font-black tracking-wide">{notice.title}</span>
						<span class="text-[10px] font-bold text-white/90">{notice.subtitle}</span>
						<!-- Pointer Arrow -->
						<div
							class="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-6 border-x-transparent {notice.isCorrect
								? 'border-t-emerald-600'
								: 'border-t-rose-600'}"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Stall Dishes Modal (Mobile Friendly, No Scrolling Needed on Main Page) -->
		{#if isMenuModalOpen}
			<div
				class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="stall-menu-title"
			>
				<!-- Backdrop button to close -->
				<button
					type="button"
					class="absolute inset-0 h-full w-full cursor-default"
					onclick={() => (isMenuModalOpen = false)}
					aria-label="Close menu"
				></button>

				<div
					class="relative flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl transition-all sm:rounded-3xl"
				>
					<!-- Modal Header -->
					<div class="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
						<div class="flex items-center gap-2">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 font-bold text-amber-600"
							>
								<BookOpen size={18} />
							</div>
							<div>
								<h3
									id="stall-menu-title"
									class="font-headline text-sm font-extrabold text-slate-900"
								>
									Stall Dishes • 点餐菜单
								</h3>
								<div class="flex items-center gap-1.5 text-[11px] text-slate-500">
									<img
										src={currentCustomer.avatarImg}
										alt=""
										class="inline h-4 w-4 object-contain"
									/>
									<span>{currentCustomer.name} wants:</span>
									<span class="font-bold text-indigo-600">{targetFood.pinyin}</span>
									<span>({targetFood.hanzi})</span>
								</div>
							</div>
						</div>
						<button
							type="button"
							onclick={() => (isMenuModalOpen = false)}
							aria-label="Close modal"
							class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 active:scale-95"
						>
							<X size={16} strokeWidth={2.5} />
						</button>
					</div>

					<!-- Dishes Grid (Thumb-friendly touch targets) -->
					<div class="xs:grid-cols-3 grid grid-cols-2 gap-2 overflow-y-auto p-3.5 sm:grid-cols-3">
						{#each activeFoodItems as food (food.id)}
							<button
								type="button"
								onclick={() => handleModalFoodSelect(food.id)}
								class="group flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all active:scale-95 {food.id ===
								targetFood.id
									? 'border-indigo-400 bg-indigo-50/90 text-indigo-950 shadow-sm ring-2 ring-indigo-400/30'
									: 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-white'}"
							>
								<span class="text-3xl transition-transform group-hover:scale-110">{food.emoji}</span
								>
								<span class="mt-1 font-headline text-xs font-black tracking-tight text-slate-900">
									{food.pinyin}
								</span>
								<span class="font-headline text-[11px] font-bold text-slate-500">
									{food.hanzi}
								</span>
								<span class="mt-0.5 max-w-[100px] truncate text-[10px] text-slate-400">
									{food.english}
								</span>
							</button>
						{/each}
					</div>

					<!-- Modal Footer -->
					<div
						class="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-500"
					>
						<span>Tap any dish above to serve</span>
						<button
							type="button"
							onclick={() => (isMenuModalOpen = false)}
							class="font-headline font-bold text-indigo-600 hover:underline"
						>
							Back to 3D Stall
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<!-- LOBBY / GAMEOVER SCREENS: Standard Page Flow -->
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
{/if}
