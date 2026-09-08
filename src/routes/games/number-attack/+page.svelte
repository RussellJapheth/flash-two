<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import {
		generateNumberAttackQuestion,
		type NumberAttackQuestion
	} from '$lib/utils/chineseNumbers';
	import { saveGameScore, getGameHighScore, type GameScoreRecord } from '$lib/utils/gameStorage';
	import { playSound, speakWord, stopSpeech } from '$lib/utils/audio';
	import {
		Gamepad2,
		Volume2,
		RotateCcw,
		Flame,
		Trophy,
		Sparkles,
		ArrowRight,
		Play,
		Timer
	} from 'lucide-svelte';

	type GamePhase = 'lobby' | 'countdown' | 'playing' | 'summary';

	// Game Configuration & State
	let phase = $state<GamePhase>('lobby');
	let audioMode = $state(false); // Visual mode by default; toggleable for listening challenge
	let maxRange = $state(99); // Standard 0-99 (can scale to 999)

	// Round & Timer State
	let countdownValue = $state(3);
	let roundTimeLeft = $state(60);
	let questionTimeLeft = $state(5);
	let isAudioLoading = $state(false);

	// Score & Gameplay Metrics
	let score = $state(0);
	let combo = $state(0);
	let maxCombo = $state(0);
	let correctCount = $state(0);
	let wrongCount = $state(0);
	let highScore = $state(0);
	let isNewHighScore = $state(false);

	// Current Question & Selection Feedback
	let currentQuestion = $state<NumberAttackQuestion | null>(null);
	let selectedOption = $state<number | null>(null);
	let isAnswerLocked = $state(false);
	let lastAnswerStatus = $state<'correct' | 'wrong' | null>(null);

	// Timers & Intervals
	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let gameRoundTimer: ReturnType<typeof setInterval> | null = null;
	let questionTimer: ReturnType<typeof setInterval> | null = null;
	let summaryRecord = $state<GameScoreRecord | null>(null);

	onMount(() => {
		highScore = getGameHighScore('number-attack');
	});

	onDestroy(() => {
		cleanupTimers();
		stopSpeech();
	});

	function cleanupTimers() {
		if (countdownTimer) clearInterval(countdownTimer);
		if (gameRoundTimer) clearInterval(gameRoundTimer);
		if (questionTimer) clearInterval(questionTimer);
		countdownTimer = null;
		gameRoundTimer = null;
		questionTimer = null;
	}

	function startPreGameCountdown() {
		cleanupTimers();
		phase = 'countdown';
		countdownValue = 3;
		playSound('flip');

		countdownTimer = setInterval(() => {
			countdownValue -= 1;
			if (countdownValue > 0) {
				playSound('flip');
			} else if (countdownValue === 0) {
				playSound('milestone');
			} else {
				if (countdownTimer) clearInterval(countdownTimer);
				countdownTimer = null;
				beginActiveRound();
			}
		}, 1000);
	}

	let usedNumbersInRound = new Set<number>();

	function beginActiveRound() {
		phase = 'playing';
		roundTimeLeft = 60;
		questionTimeLeft = 5;
		score = 0;
		combo = 0;
		maxCombo = 0;
		correctCount = 0;
		wrongCount = 0;
		isNewHighScore = false;
		selectedOption = null;
		lastAnswerStatus = null;
		isAnswerLocked = false;
		usedNumbersInRound = new Set<number>();

		// 60-second round clock
		gameRoundTimer = setInterval(() => {
			roundTimeLeft -= 1;
			if (roundTimeLeft <= 0) {
				endGameRound();
			}
		}, 1000);

		nextQuestion();
	}

	async function nextQuestion() {
		if (phase !== 'playing') return;
		isAnswerLocked = false;
		selectedOption = null;
		lastAnswerStatus = null;

		const q = generateNumberAttackQuestion(maxRange, usedNumbersInRound);
		currentQuestion = q;

		if (audioMode) {
			questionTimeLeft = 5;
			isAudioLoading = true;
			// Trigger pronunciation with accommodation for speech loading
			try {
				await speakWord(q.hanzi, 'chinese');
			} finally {
				isAudioLoading = false;
			}
			startQuestionCountdown();
		}
	}

	function startQuestionCountdown() {
		if (questionTimer) clearInterval(questionTimer);
		questionTimeLeft = 5;

		questionTimer = setInterval(() => {
			if (phase !== 'playing' || !audioMode) {
				if (questionTimer) clearInterval(questionTimer);
				return;
			}
			questionTimeLeft -= 1;
			if (questionTimeLeft <= 0) {
				handleQuestionTimeout();
			}
		}, 1000);
	}

	function handleQuestionTimeout() {
		if (isAnswerLocked || phase !== 'playing') return;
		isAnswerLocked = true;
		wrongCount += 1;
		combo = 0;
		lastAnswerStatus = 'wrong';
		playSound('wrong');

		setTimeout(() => {
			nextQuestion();
		}, 600);
	}

	async function playQuestionAudio() {
		if (!currentQuestion) return;
		isAudioLoading = true;
		try {
			await speakWord(currentQuestion.hanzi, 'chinese');
		} finally {
			isAudioLoading = false;
		}
	}

	function handleSelectOption(opt: number) {
		if (isAnswerLocked || phase !== 'playing' || !currentQuestion) return;
		isAnswerLocked = true;
		selectedOption = opt;

		if (questionTimer) {
			clearInterval(questionTimer);
			questionTimer = null;
		}

		if (opt === currentQuestion.correctValue) {
			// Correct
			correctCount += 1;
			combo += 1;
			if (combo > maxCombo) maxCombo = combo;

			// Base score 100 + combo bonus
			const points = 100 + Math.min(combo * 15, 150);
			score += points;
			lastAnswerStatus = 'correct';
			playSound('correct');
		} else {
			// Wrong
			wrongCount += 1;
			combo = 0;
			lastAnswerStatus = 'wrong';
			playSound('wrong');
		}

		setTimeout(() => {
			nextQuestion();
		}, 380);
	}

	async function endGameRound() {
		cleanupTimers();
		stopSpeech();
		phase = 'summary';

		const totalAttempts = correctCount + wrongCount;
		const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

		const prevHigh = getGameHighScore('number-attack');
		if (score > prevHigh && score > 0) {
			isNewHighScore = true;
			highScore = score;
		}

		summaryRecord = await saveGameScore({
			gameId: 'number-attack',
			gameName: 'Number Attack',
			score,
			correct: correctCount,
			wrong: wrongCount,
			accuracy,
			maxCombo,
			mode: audioMode ? 'audio' : 'visual'
		});

		playSound('milestone');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (phase !== 'playing' || isAnswerLocked || !currentQuestion) return;
		const key = event.key;
		const keyMap: Record<string, number> = {
			'1': 0,
			'2': 1,
			'3': 2,
			'4': 3
		};
		if (key in keyMap) {
			const idx = keyMap[key];
			if (currentQuestion.options[idx] !== undefined) {
				handleSelectOption(currentQuestion.options[idx]);
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Number Attack (数字突击) — FlashCards</title>
</svelte:head>

<TopHeader title="Number Attack" showBack={true} onBack={() => history.back()} />

<main class="flex min-h-[calc(100vh-4rem)] flex-1 flex-col justify-between px-4 pt-3 pb-8">
	<!-- ══════════════════════════════════════════════════════════ -->
	<!-- 1. LOBBY SCREEN -->
	<!-- ══════════════════════════════════════════════════════════ -->
	{#if phase === 'lobby'}
		<div class="flex flex-1 flex-col justify-between space-y-5">
			<!-- Hero Card -->
			<section
				class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center"
			>
				<div
					class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-md shadow-indigo-600/10"
				>
					<Gamepad2 size={32} strokeWidth={2.25} />
				</div>

				<h2 class="font-headline text-2xl font-black text-slate-900">Number Attack</h2>
				<p class="font-headline text-xs font-bold tracking-wider text-indigo-600 uppercase">
					数字突击 • Mandarin Speed Drill
				</p>

				<p class="mx-auto mt-2 max-w-xs font-sans text-xs text-slate-600">
					Match Chinese numbers to their numerical values in 60 seconds. Build combos for maximum
					score!
				</p>

				<!-- High Score Pill -->
				<div class="mt-4 flex items-center justify-center gap-2">
					<div
						class="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-amber-900"
					>
						<Trophy size={14} strokeWidth={2.25} class="text-amber-600" />
						<span class="font-headline text-xs font-bold">Best Score: {highScore} pts</span>
					</div>
				</div>
			</section>

			<!-- Mode Settings Card -->
			<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
				<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
					Game Mode Configuration
				</h3>

				<!-- Audio / Visual Toggle -->
				<div class="space-y-2">
					<span class="font-headline text-xs font-bold text-slate-700">Drill Mode</span>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (audioMode = false)}
							class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-3 font-headline text-xs font-bold transition-all {audioMode ===
							false
								? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							<Sparkles size={16} strokeWidth={2} />
							<span>Visual (Pinyin + Hanzi)</span>
						</button>

						<button
							type="button"
							onclick={() => (audioMode = true)}
							class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-3 font-headline text-xs font-bold transition-all {audioMode ===
							true
								? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							<Volume2 size={16} strokeWidth={2} />
							<span>Audio (5s Listening)</span>
						</button>
					</div>
				</div>

				<!-- Number Range Selection -->
				<div class="space-y-2">
					<span class="font-headline text-xs font-bold text-slate-700">Number Range</span>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (maxRange = 99)}
							class="cursor-pointer rounded-2xl border p-2.5 font-headline text-xs font-bold transition-all {maxRange ===
							99
								? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							0 &ndash; 99 (Standard)
						</button>
						<button
							type="button"
							onclick={() => (maxRange = 999)}
							class="cursor-pointer rounded-2xl border p-2.5 font-headline text-xs font-bold transition-all {maxRange ===
							999
								? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							0 &ndash; 999 (Pro)
						</button>
					</div>
				</div>
			</section>

			<!-- Start CTA Button -->
			<button
				type="button"
				id="start-number-attack-btn"
				onclick={startPreGameCountdown}
				class="shadow-primary-glow flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
			>
				<Play size={18} strokeWidth={2.25} />
				<span>Start Round (60s)</span>
			</button>
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 2. COUNTDOWN SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'countdown'}
		<div class="flex flex-1 flex-col items-center justify-center py-16 text-center">
			<p class="font-headline text-sm font-bold tracking-widest text-indigo-600 uppercase">
				Get Ready!
			</p>
			<div
				class="my-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xl"
			>
				<span class="font-headline text-6xl font-black">
					{countdownValue > 0 ? countdownValue : 'GO!'}
				</span>
			</div>
			<p class="font-sans text-xs text-slate-500">
				{audioMode ? 'Listen carefully and select fast!' : 'Identify the number and tap the match!'}
			</p>
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 3. ACTIVE GAMEPLAY SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'playing' && currentQuestion}
		<div class="flex flex-1 flex-col justify-between space-y-4">
			<!-- Game Status HUD -->
			<div
				class="shadow-card flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5"
			>
				<!-- Round Timer -->
				<div
					class="flex items-center gap-1.5 font-headline text-sm font-black {roundTimeLeft <= 10
						? 'animate-pulse text-rose-600'
						: 'text-slate-800'}"
				>
					<Timer size={16} strokeWidth={2.25} />
					<span>{roundTimeLeft}s</span>
				</div>

				<!-- Live Score -->
				<div class="text-center">
					<span class="font-headline text-[10px] font-bold text-slate-400 uppercase">Score</span>
					<p class="font-headline text-lg font-black text-indigo-600">{score}</p>
				</div>

				<!-- Combo Flame Pill -->
				<div
					class="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-headline text-xs font-bold text-amber-700"
				>
					<Flame size={14} strokeWidth={2.25} class="text-amber-500" />
					<span>{combo}x Combo</span>
				</div>
			</div>

			<!-- Audio 5s Question Countdown Bar (Only in Audio Mode) -->
			{#if audioMode}
				<div class="space-y-1">
					<div class="flex items-center justify-between text-[11px] font-bold text-slate-500">
						<span class="flex items-center gap-1">
							<Volume2 size={13} strokeWidth={2} class="text-indigo-600" />
							Question Timer
						</span>
						<span class={questionTimeLeft <= 2 ? 'font-bold text-rose-600' : ''}
							>{questionTimeLeft}s</span
						>
					</div>
					<ProgressBar
						value={questionTimeLeft}
						max={5}
						variant={questionTimeLeft <= 2 ? 'amber' : 'primary'}
						height="h-1.5"
					/>
				</div>
			{/if}

			<!-- Prompt Card Area -->
			<section
				class="shadow-card relative flex min-h-[160px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center transition-all {lastAnswerStatus ===
				'correct'
					? 'border-emerald-500 bg-emerald-50/40'
					: lastAnswerStatus === 'wrong'
						? 'border-rose-500 bg-rose-50/40'
						: ''}"
			>
				{#if audioMode}
					<!-- Audio Mode: Listening Speaker View (Pinyin is hidden as requested) -->
					<div class="space-y-3">
						<button
							type="button"
							onclick={playQuestionAudio}
							disabled={isAudioLoading}
							aria-label="Replay audio"
							class="mx-auto flex h-16 w-16 cursor-pointer items-center justify-center rounded-3xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-md transition-all hover:bg-indigo-100 active:scale-95"
						>
							<Volume2 size={32} strokeWidth={2.25} class={isAudioLoading ? 'animate-pulse' : ''} />
						</button>
						<div>
							<p class="font-headline text-sm font-bold text-slate-700">
								{isAudioLoading ? 'Playing Mandarin audio…' : 'Tap speaker to repeat'}
							</p>
							<span
								class="mt-1 inline-block rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-0.5 font-headline text-xs font-bold text-indigo-700"
							>
								{currentQuestion.hanzi}
							</span>
						</div>
					</div>
				{:else}
					<!-- Visual Mode: Large Pinyin + Hanzi Badge -->
					<div class="space-y-2">
						<h3 class="font-headline text-3xl font-black tracking-wide text-indigo-600">
							{currentQuestion.pinyin}
						</h3>
						<span
							class="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 font-headline text-sm font-bold text-indigo-800 shadow-xs"
						>
							{currentQuestion.hanzi}
						</span>
					</div>
				{/if}
			</section>

			<!-- 4 Number Options (2x2 Grid) -->
			<div class="grid grid-cols-2 gap-3 pt-2">
				{#each currentQuestion.options as opt, idx (opt)}
					{@const isSelected = selectedOption === opt}
					{@const isThisCorrect = opt === currentQuestion.correctValue}
					{@const showSuccess = isAnswerLocked && isThisCorrect}
					{@const showError = isAnswerLocked && isSelected && !isThisCorrect}

					<button
						type="button"
						id="option-btn-{idx}"
						onclick={() => handleSelectOption(opt)}
						disabled={isAnswerLocked}
						class="shadow-card flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border text-center transition-all active:scale-[0.97] {showSuccess
							? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
							: showError
								? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20'
								: 'border-slate-200/90 bg-white text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/30'}"
					>
						<span class="font-headline text-3xl font-black">
							{opt}
						</span>
						<span class="font-headline text-[10px] font-semibold opacity-60">
							Key [{idx + 1}]
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 4. SUMMARY / GAME OVER SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'summary' && summaryRecord}
		<div class="flex flex-1 flex-col justify-between space-y-5">
			<!-- Summary Hero -->
			<section
				class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center"
			>
				{#if isNewHighScore}
					<div
						class="mx-auto mb-2 flex items-center justify-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900"
					>
						<Sparkles size={14} strokeWidth={2.25} class="text-amber-600" />
						<span>🎉 New High Score!</span>
					</div>
				{/if}

				<h2 class="font-headline text-sm font-bold tracking-wider text-slate-500 uppercase">
					Round Complete
				</h2>
				<p class="mt-1 font-headline text-4xl font-black text-slate-900">
					{summaryRecord.score} pts
				</p>

				<div class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
					<div class="rounded-xl bg-emerald-50 p-2.5">
						<span class="font-headline text-[10px] font-bold text-emerald-700 uppercase"
							>Correct</span
						>
						<p class="font-headline text-lg font-black text-emerald-800">{summaryRecord.correct}</p>
					</div>
					<div class="rounded-xl bg-rose-50 p-2.5">
						<span class="font-headline text-[10px] font-bold text-rose-700 uppercase">Wrong</span>
						<p class="font-headline text-lg font-black text-rose-800">{summaryRecord.wrong}</p>
					</div>
					<div class="rounded-xl bg-indigo-50 p-2.5">
						<span class="font-headline text-[10px] font-bold text-indigo-700 uppercase"
							>Accuracy</span
						>
						<p class="font-headline text-lg font-black text-indigo-800">
							{summaryRecord.accuracy}%
						</p>
					</div>
				</div>
			</section>

			<!-- Stats Details -->
			<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
				<h3 class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
					Performance Breakdown
				</h3>

				<div class="divide-y divide-slate-100">
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="font-sans text-slate-600">Max Combo Multiplier</span>
						<span class="font-headline font-bold text-slate-900">{summaryRecord.maxCombo}x</span>
					</div>
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="font-sans text-slate-600">Challenge Mode</span>
						<span class="font-headline font-bold text-slate-900 capitalize"
							>{summaryRecord.mode}</span
						>
					</div>
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="font-sans text-slate-600">Number Range</span>
						<span class="font-headline font-bold text-slate-900">0 &ndash; {maxRange}</span>
					</div>
				</div>
			</section>

			<!-- Action Buttons -->
			<div class="space-y-2">
				<button
					type="button"
					id="play-again-btn"
					onclick={startPreGameCountdown}
					class="shadow-primary-glow flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					<RotateCcw size={17} strokeWidth={2.25} />
					<span>Play Again</span>
				</button>

				<a
					href={resolve('/games')}
					class="flex h-11 w-full items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white font-headline text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
				>
					<span>Back to Games Hub</span>
					<ArrowRight size={15} strokeWidth={2} />
				</a>
			</div>
		</div>
	{/if}
</main>
