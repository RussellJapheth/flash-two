<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Heart, Volume2, VolumeX } from 'lucide-svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import ParticleCanvas from '$lib/components/games/ParticleCanvas.svelte';
	import { playSound, speakWord, stopSpeech } from '$lib/utils/audio';
	import {
		ITEM_TIME_MS,
		MAX_LIVES,
		ORDER_STATIONS,
		buildItemOptions,
		buildOrder,
		flattenServiceMenu,
		itemPoints,
		resolveServiceMenu,
		speedBonus,
		type DishSpec
	} from '$lib/utils/restaurantRecipes';
	import {
		DINER_PROFILES,
		STATION_LABELS,
		type MenuItem,
		type RestaurantMenu
	} from '$lib/data/restaurantDishes';
	import KitchenScene from './KitchenScene.svelte';

	export interface RoundResult {
		score: number;
		correct: number;
		wrong: number;
		maxCombo: number;
		itemsPlated: number;
		orderSize: number;
	}

	interface Props {
		menu: RestaurantMenu;
		soundEnabled: boolean;
		highScore: number;
		onFinish: (result: RoundResult) => void;
		onExit: () => void;
		onToggleSound: () => void;
	}

	let { menu, soundEnabled, highScore, onFinish, onExit, onToggleSound }: Props = $props();

	const TICK_MS = 40;
	const LIFE_SLOTS = Array.from({ length: MAX_LIVES }, (_, index) => index);
	/** Verdict beat for correct answers. */
	const OUTCOME_MS = 2000;
	/** Verdict beat for wrong answers. The message stays for 5 seconds so the user has time to read it. */
	const WRONG_OUTCOME_MS = 3500;

	let phase = $state<'briefing' | 'playing' | 'finished'>('briefing');
	let order = $state<DishSpec | null>(null);
	let service = $state<MenuItem[]>([]);
	let options = $state<MenuItem[]>([]);
	let cursor = $state(0);
	let currentId = $state<string | null>(null);
	let platedIds = $state<string[]>([]);
	let diner = $state(DINER_PROFILES[0]);
	let lives = $state(MAX_LIVES);
	let combo = $state(0);
	let maxCombo = $state(0);
	let score = $state(0);
	let correctCount = $state(0);
	let wrongCount = $state(0);
	let timeLeftMs = $state(ITEM_TIME_MS);
	let revealed = $state<MenuItem | null>(null);
	let feedback = $state<{ id: number; title: string; detail: string; tone: 'good' | 'bad' } | null>(
		null
	);

	let currentItem = $derived(
		order && currentId
			? order.components.find((component) => component.id === currentId)
			: undefined
	);
	let courseLabel = $derived(currentItem ? STATION_LABELS[currentItem.station] : '');
	let timeRatio = $derived(Math.max(0, timeLeftMs / ITEM_TIME_MS));
	let locked = $derived(revealed !== null);
	// loadItem advances the cursor before serving, so the shown course is cursor - 1.
	let questionIndex = $derived(Math.max(cursor - 1, 0));
	let remaining = $derived(order ? order.requirements.length - cursor : 0);

	let particleCanvasRef = $state<ParticleCanvas | null>(null);
	let promptEl = $state<HTMLDivElement | null>(null);

	let timerId: ReturnType<typeof setInterval> | undefined;
	let speechTimer: ReturnType<typeof setTimeout> | undefined;
	let feedbackSeq = 0;
	let roundActive = false;
	const pending = new SvelteSet<ReturnType<typeof setTimeout>>();

	/** setTimeout that is always cancelled when the player leaves or a round ends. */
	function later(callback: () => void, delay: number) {
		const timer = setTimeout(() => {
			pending.delete(timer);
			callback();
		}, delay);
		pending.add(timer);
	}

	function clearPending() {
		for (const timer of pending) clearTimeout(timer);
		pending.clear();
		if (speechTimer) clearTimeout(speechTimer);
	}

	function announce(title: string, detail: string, tone: 'good' | 'bad', duration?: number) {
		const id = ++feedbackSeq;
		feedback = { id, title, detail, tone };
		const timeout = duration ?? (tone === 'bad' ? WRONG_OUTCOME_MS : OUTCOME_MS - 200);
		later(() => {
			if (feedback?.id === id) feedback = null;
		}, timeout);
	}

	function componentById(id: string): MenuItem | undefined {
		return service.find((component) => component.id === id);
	}

	/**
	 * Pulls the sprite through the network and decoder before it is needed, so an
	 * answer button never paints half-empty. Runs on mount for the whole menu and
	 * again for the exact round that is about to be served.
	 */
	function warmSprites(items: readonly { sprites: string[] }[]) {
		const sources = new Set(items.flatMap((item) => item.sprites));
		for (const src of sources) {
			const image = new Image();
			image.decoding = 'async';
			image.src = src;
		}
	}

	function say(word: string | undefined, delay = 120) {
		if (!soundEnabled || !word) return;
		if (speechTimer) clearTimeout(speechTimer);
		speechTimer = setTimeout(() => speakWord(word, 'chinese'), delay);
	}

	function burst() {
		if (!particleCanvasRef || !promptEl) return;
		const rect = promptEl.getBoundingClientRect();
		particleCanvasRef.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26, true);
	}

	/** Serves the next course together with a fresh timer; both switch at once. */
	function loadItem() {
		if (!order) return;
		const requirement = order.requirements[cursor];
		if (!requirement) return;
		cursor += 1;
		currentId = requirement.componentId;
		options = buildItemOptions(
			Math.random,
			service.filter((item) => item.station === requirement.station),
			requirement.componentId
		);
		revealed = null;
		timeLeftMs = ITEM_TIME_MS;
		say(componentById(requirement.componentId)?.hanzi);
		startTimer();
	}

	function startTimer() {
		stopTimer();
		timerId = setInterval(() => {
			if (!roundActive || revealed) return;
			timeLeftMs -= TICK_MS;
			if (timeLeftMs <= 0) {
				timeLeftMs = 0;
				loseLife(true);
			}
		}, TICK_MS);
	}

	function stopTimer() {
		if (timerId) clearInterval(timerId);
		timerId = undefined;
	}

	function loseLife(timedOut: boolean, tapped?: MenuItem) {
		if (!order || revealed || !roundActive || !currentId) return;
		const answer = componentById(currentId);
		lives -= 1;
		wrongCount += 1;
		combo = 0;
		stopTimer();
		revealed = answer ?? null;
		options = [];
		if (soundEnabled) {
			playSound('wrong');
			if (answer?.hanzi) say(answer.hanzi, 300);
		}
		const detail = answer
			? `${answer.hanzi} (${answer.pinyin}) means ${answer.english}`
			: 'This menu item has no meaning loaded';
		announce(
			timedOut ? "Time's up" : tapped ? `Not ${tapped.english}` : 'Incorrect',
			detail,
			'bad',
			WRONG_OUTCOME_MS
		);
		later(() => {
			if (lives <= 0 || cursor >= (order?.requirements.length ?? 0)) {
				finishRound();
				return;
			}
			loadItem();
		}, WRONG_OUTCOME_MS);
	}

	function chooseOption(option: MenuItem) {
		if (!order || revealed || !roundActive || !currentItem) return;

		if (option.id === currentItem.id) {
			revealed = option;
			stopTimer();
			options = [];
			correctCount += 1;
			combo += 1;
			if (combo > maxCombo) maxCombo = combo;
			const completesOrder = cursor >= order.requirements.length;
			const bonus = speedBonus(ITEM_TIME_MS - timeLeftMs, ITEM_TIME_MS);
			const points = itemPoints(combo, completesOrder) + bonus;
			score += points;
			platedIds = [...platedIds, option.id];
			if (soundEnabled) {
				playSound('correct');
				speakWord(option.hanzi, 'chinese');
			}
			announce(`+${points}`, `${option.hanzi} means ${option.english}`, 'good');
			burst();
			later(() => {
				if (completesOrder) finishRound();
				else loadItem();
			}, OUTCOME_MS);
			return;
		}

		loseLife(false, option);
	}

	function finishRound() {
		if (!roundActive) return;
		roundActive = false;
		stopTimer();
		stopSpeech();
		clearPending();
		phase = 'finished';
		onFinish({
			score,
			correct: correctCount,
			wrong: wrongCount,
			maxCombo,
			itemsPlated: platedIds.length,
			orderSize: order?.requirements.length ?? 0
		});
	}

	function startRound() {
		clearPending();
		roundActive = true;
		diner = DINER_PROFILES[Math.floor(Math.random() * DINER_PROFILES.length)];
		service = flattenServiceMenu(resolveServiceMenu(Math.random, menu.byStation));
		warmSprites(service);
		order = buildOrder(
			Math.random,
			{
				main: service.filter((item) => item.station === 'main'),
				dish: service.filter((item) => item.station === 'dish'),
				produce: service.filter((item) => item.station === 'produce'),
				drink: service.filter((item) => item.station === 'drink'),
				pantry: service.filter((item) => item.station === 'pantry')
			},
			ORDER_STATIONS
		);
		cursor = 0;
		currentId = null;
		platedIds = [];
		lives = MAX_LIVES;
		combo = 0;
		maxCombo = 0;
		score = 0;
		correctCount = 0;
		wrongCount = 0;
		feedback = null;
		loadItem();
		phase = 'playing';
		if (soundEnabled) speakWord(diner.greeting.split(/[.!?]/)[0] ?? diner.greeting, 'english');
	}

	function leave() {
		roundActive = false;
		stopTimer();
		stopSpeech();
		clearPending();
		onExit();
	}

	onMount(() => {
		const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200));
		idle(() => warmSprites(menu.components));
	});

	onDestroy(() => {
		roundActive = false;
		stopTimer();
		stopSpeech();
		clearPending();
	});
</script>

<svelte:head>
	<title>Kitchen Line • Restaurant</title>
</svelte:head>

<div class="flex min-h-full flex-col">
	<header
		class="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-slate-200/90 bg-white/90 px-3 backdrop-blur-md"
	>
		<button
			type="button"
			onclick={leave}
			aria-label={phase === 'briefing' ? 'Back to Games' : 'Exit the shift'}
			class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition-transform hover:bg-slate-50 active:scale-95"
		>
			<svg
				viewBox="0 0 24 24"
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				aria-hidden="true"
			>
				<path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		{#if phase === 'briefing'}
			<h1 class="flex-1 truncate text-center font-headline text-sm font-extrabold text-slate-900">
				Kitchen Line
			</h1>
		{:else}
			<div
				class="flex flex-1 items-center justify-center gap-1"
				role="status"
				aria-label={`Lives left: ${lives}`}
			>
				{#each LIFE_SLOTS as index (index)}
					<Heart
						size={18}
						strokeWidth={2.2}
						fill={index < lives ? 'currentColor' : 'none'}
						class={index < lives ? 'text-rose-500' : 'text-slate-300'}
					/>
				{/each}
			</div>
		{/if}

		<div class="flex items-center gap-2">
			{#if phase !== 'briefing'}
				{#if combo >= 2}
					<span
						class="rounded-full bg-amber-100 px-2 py-0.5 font-headline text-[11px] font-extrabold text-amber-900"
					>
						x{combo}
					</span>
				{/if}
				<span class="font-headline text-xs font-black text-slate-900 tabular-nums">
					{score.toLocaleString()}
				</span>
			{/if}
			<button
				type="button"
				onclick={onToggleSound}
				aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
				class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white transition-colors hover:bg-slate-50 active:scale-95"
			>
				{#if soundEnabled}
					<Volume2 size={16} strokeWidth={2.2} class="text-indigo-600" />
				{:else}
					<VolumeX size={16} strokeWidth={2.2} class="text-slate-400" />
				{/if}
			</button>
		</div>
	</header>

	{#if phase === 'briefing'}
		<div class="relative flex flex-1 flex-col justify-center gap-4 p-5">
			<KitchenScene />
			<section
				class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5"
			>
				<span
					class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-headline text-[11px] font-extrabold tracking-wider text-amber-900 uppercase"
				>
					Kitchen Line
				</span>
				<h2 class="mt-3 font-headline text-xl font-black tracking-tight text-slate-900">
					Plate the order
				</h2>
				<p class="mt-1.5 text-sm leading-relaxed text-slate-600">
					Each course shows its hanzi and pinyin. Tap the English meaning before the timer runs out
					— three misses and the diner walks out.
				</p>

				{#if highScore > 0}
					<div
						class="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 font-headline text-xs font-bold text-amber-900"
					>
						<span>Best service: {highScore.toLocaleString()} pts</span>
					</div>
				{/if}

				<button
					type="button"
					onclick={startRound}
					class="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					Start shift
				</button>
			</section>
		</div>
	{:else if order && currentItem}
		<div class="relative flex min-h-full flex-col">
			<KitchenScene />
			<!-- Diner -->
			<section
				class="shadow-card mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3"
			>
				<img
					src={diner.avatarImg}
					alt={diner.name}
					class="h-11 w-11 shrink-0 rounded-xl bg-slate-100 object-cover"
				/>
				<div class="min-w-0 flex-1">
					<p class="truncate font-headline text-xs font-extrabold text-slate-900">{diner.name}</p>
					<p class="truncate text-[11px] text-slate-500">{diner.greeting}</p>
				</div>
				<p
					class="shrink-0 rounded-full bg-indigo-50 px-2 py-1 font-headline text-[11px] font-extrabold text-indigo-700"
				>
					{remaining} left
				</p>
			</section>

			<p
				class="mt-3 text-center font-headline text-[11px] font-bold tracking-wider text-slate-400 uppercase"
			>
				{courseLabel} · Course {Math.min(questionIndex + 1, order.requirements.length)} of {order
					.requirements.length}
			</p>

			<!-- Prompt: the hanzi + pinyin the player has to translate -->
			<div bind:this={promptEl} class="relative mx-3 mt-4 flex flex-1 flex-col">
				<section
					class="shadow-card flex flex-1 flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-5"
				>
					<span class="font-headline text-[11px] font-bold tracking-wider text-slate-400 uppercase">
						What does this mean?
					</span>

					<p class="mt-4 font-headline text-6xl font-black tracking-tight text-slate-900">
						{currentItem.hanzi}
					</p>
					<button
						type="button"
						onclick={() => say(currentItem.hanzi, 0)}
						aria-label={`Hear ${currentItem.hanzi} pronounced`}
						class="mt-1 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-headline text-sm font-bold text-slate-600 transition-colors hover:bg-indigo-600 hover:text-white active:scale-95"
					>
						<svg
							viewBox="0 0 24 24"
							width="15"
							height="15"
							fill="none"
							stroke="currentColor"
							stroke-width="2.25"
							aria-hidden="true"
						>
							<path d="M11 5L6 9H3v6h3l5 4V5z" stroke-linejoin="round" />
							<path d="M16 9a4 4 0 010 6" stroke-linecap="round" />
						</svg>
						{currentItem.pinyin}
					</button>

					<!-- Per-item timer -->
					<div
						class="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200"
						role="progressbar"
						aria-label="Time left to answer"
						aria-valuemin="0"
						aria-valuemax={ITEM_TIME_MS}
						aria-valuenow={Math.round(timeLeftMs)}
					>
						<div
							class="h-full rounded-full transition-[width] duration-75 {timeRatio < 0.25
								? 'bg-rose-500'
								: timeRatio < 0.5
									? 'bg-amber-500'
									: 'bg-emerald-500'}"
							style="width: {timeRatio * 100}%"
						></div>
					</div>
				</section>

				<ParticleCanvas bind:this={particleCanvasRef} />
			</div>

			{#if feedback}
				<div
					role="status"
					class="mx-3 mt-3 rounded-2xl px-4 py-2.5 text-center {feedback.tone === 'bad'
						? 'bg-rose-600'
						: 'bg-emerald-600'}"
				>
					<p class="font-headline text-sm font-black text-white">{feedback.title}</p>
					<p class="text-xs font-semibold text-white/85">{feedback.detail}</p>
				</div>
			{/if}

			<!-- English answers -->
			<section class="mt-3 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
				{#if locked}
					{#if revealed}
						{#if feedback?.tone === 'bad'}
							<div
								class="shadow-card flex flex-col items-center rounded-3xl border border-rose-200 bg-white p-5 text-center"
								role="alert"
							>
								<span
									class="rounded-full bg-rose-100 px-3 py-1 font-headline text-[11px] font-extrabold tracking-wider text-rose-700 uppercase"
								>
									Correct Answer
								</span>

								<img
									src={revealed.sprite}
									alt={revealed.english}
									class="my-3 h-20 w-20 object-contain drop-shadow-sm"
								/>

								<p class="font-headline text-4xl font-black tracking-tight text-slate-900">
									{revealed.hanzi}
								</p>
								<p class="mt-0.5 font-headline text-base font-bold text-indigo-600">
									{revealed.pinyin}
								</p>
								<p class="mt-1.5 font-headline text-lg font-black text-slate-800">
									{revealed.english}
								</p>
							</div>
						{:else}
							<div
								class="shadow-card flex items-center justify-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4"
							>
								<img
									src={revealed.sprite}
									alt={revealed.english}
									class="h-12 w-12 object-contain"
								/>
								<div>
									<p class="font-headline text-base font-black text-slate-900">
										{revealed.hanzi}
										<span class="text-sm font-bold text-indigo-600">({revealed.pinyin})</span>
									</p>
									<p class="text-sm font-bold text-slate-700">{revealed.english}</p>
								</div>
							</div>
						{/if}
					{:else}
						<p class="text-center text-sm font-semibold text-slate-500">Loading next course...</p>
					{/if}
				{:else}
					<div class="grid gap-2">
						{#each options as option (option.id)}
							<button
								type="button"
								onclick={() => chooseOption(option)}
								aria-label={option.english}
								class="shadow-card hover:shadow-card-hover flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left transition-all hover:border-indigo-200 active:scale-[0.98]"
							>
								<img
									src={option.sprite}
									alt={option.english}
									decoding="async"
									class="h-10 w-10 shrink-0 object-contain"
								/>
								<span class="flex-1 font-headline text-sm font-bold text-slate-900">
									{option.english}
								</span>
								<svg
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									class="shrink-0 text-slate-300"
									aria-hidden="true"
								>
									<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{/if}
</div>
