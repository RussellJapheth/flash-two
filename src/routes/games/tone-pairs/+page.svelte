<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { triggerAutoStartStudyTimer, triggerAutoStopStudyTimer } from '$lib/utils/studyTimer';
	import SessionExitGuard from '$lib/components/SessionExitGuard.svelte';
	import {
		generateToneQuestion,
		validateToneAnswer,
		type ToneQuestion,
		type TonePairConfig
	} from '$lib/data/tonePairs';
	import { playSound, speakWord } from '$lib/utils/audio';
	import { getGameHighScore, saveGameScore } from '$lib/utils/gameStorage';
	import { addXP, calculateGameXP } from '$lib/utils/xp';
	import {
		ChevronLeft,
		Volume2,
		VolumeX,
		RotateCcw,
		Sparkles,
		Trophy,
		Zap,
		Flame,
		Headphones,
		Eye
	} from 'lucide-svelte';

	const GAME_ID = 'tone-pairs';
	const GAME_NAME = 'Tone Pair Lab';
	const QUESTIONS_PER_ROUND = 10;

	type Phase = 'playing' | 'results';
	type Mode = 'visual' | 'audio';

	let phase = $state<Phase>('playing');
	let mode = $state<Mode>('visual');
	let soundEnabled = $state(true);
	let highScore = $state(0);
	let isNewHighScore = $state(false);

	let currentQuestion = $state<ToneQuestion | null>(null);
	let selectedOptionId = $state<string | null>(null);
	let isAnswerSubmitted = $state(false);
	let isAnswerCorrect = $state(false);

	let roundIndex = $state(0);
	let correctCount = $state(0);
	let wrongCount = $state(0);
	let currentCombo = $state(0);
	let maxCombo = $state(0);
	let score = $state(0);

	let earnedXP = $state(0);
	let accuracy = $state(0);
	let exitGuard: { requestExit: (proceed: () => void) => void } | null = $state(null);

	function requestExit(proceed: () => void) {
		if (exitGuard) {
			exitGuard.requestExit(proceed);
		} else {
			proceed();
		}
	}

	onMount(() => {
		highScore = getGameHighScore(GAME_ID, mode);
		triggerAutoStartStudyTimer();
		startNewRound();
	});

	onDestroy(() => {
		triggerAutoStopStudyTimer();
	});

	function startNewRound() {
		phase = 'playing';
		roundIndex = 0;
		correctCount = 0;
		wrongCount = 0;
		currentCombo = 0;
		maxCombo = 0;
		score = 0;
		earnedXP = 0;
		loadNextQuestion();
	}

	function loadNextQuestion() {
		if (roundIndex >= QUESTIONS_PER_ROUND) {
			finishRound();
			return;
		}

		roundIndex++;
		currentQuestion = generateToneQuestion();
		selectedOptionId = null;
		isAnswerSubmitted = false;

		if (soundEnabled && mode === 'audio' && currentQuestion) {
			speakWord(currentQuestion.word.hanzi, 'chinese');
		}
	}

	function playCurrentWord() {
		if (!currentQuestion) return;
		speakWord(currentQuestion.word.hanzi, 'chinese');
	}

	function submitAnswer(option: TonePairConfig) {
		if (isAnswerSubmitted || !currentQuestion) return;

		selectedOptionId = option.id;
		isAnswerSubmitted = true;
		isAnswerCorrect = validateToneAnswer(option.id, currentQuestion.correctPair.id);

		if (isAnswerCorrect) {
			correctCount++;
			currentCombo++;
			if (currentCombo > maxCombo) maxCombo = currentCombo;

			const comboMultiplier = Math.min(4, 1 + Math.floor(currentCombo / 2));
			score += 100 * comboMultiplier;

			if (soundEnabled) playSound('correct');
		} else {
			wrongCount++;
			currentCombo = 0;
			if (soundEnabled) playSound('wrong');
		}

		// Also speak the word upon answering so ear reinforces the contour
		if (soundEnabled && mode === 'visual') {
			speakWord(currentQuestion.word.hanzi, 'chinese');
		}

		setTimeout(() => {
			loadNextQuestion();
		}, 1400);
	}

	async function finishRound() {
		phase = 'results';
		const total = correctCount + wrongCount;
		accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

		earnedXP = calculateGameXP(correctCount, accuracy, maxCombo);
		if (earnedXP > 0) {
			try {
				await addXP(earnedXP);
			} catch (e) {
				console.warn('Failed to award game XP:', e);
			}
		}

		if (score > highScore) {
			highScore = score;
			isNewHighScore = true;
			saveGameScore({
				gameId: GAME_ID,
				gameName: GAME_NAME,
				score,
				correct: correctCount,
				wrong: wrongCount,
				accuracy,
				maxCombo,
				mode
			});
		} else {
			isNewHighScore = false;
		}
	}

	function toggleMode(newMode: Mode) {
		if (mode === newMode) return;
		mode = newMode;
		highScore = getGameHighScore(GAME_ID, mode);
		startNewRound();
	}
</script>

<svelte:head>
	<title>{GAME_NAME} | Mandarin Flashcards</title>
</svelte:head>

<SessionExitGuard
	bind:this={exitGuard}
	active={phase === 'playing' && (correctCount > 0 || wrongCount > 0)}
	title="Leave Tone Pair Lab?"
	message="Exiting now will end this round. Your earned XP from completed rounds is already saved."
	confirmLabel="Leave Lab"
	stayLabel="Keep Practicing"
/>

<main
	class="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-slate-50 px-4 py-4 text-slate-800"
>
	<!-- Top Navigation & Controls -->
	<header class="flex items-center justify-between gap-2 pb-3">
		<button
			type="button"
			onclick={() => requestExit(() => goto(resolve('/games')))}
			class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 active:scale-95"
			aria-label="Back to Games"
		>
			<ChevronLeft size={20} />
		</button>

		<!-- Mode Switcher -->
		<div class="flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
			<button
				type="button"
				onclick={() => toggleMode('visual')}
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition {mode ===
				'visual'
					? 'bg-white text-cyan-700 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				<Eye size={14} />
				Visual
			</button>
			<button
				type="button"
				onclick={() => toggleMode('audio')}
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition {mode ===
				'audio'
					? 'bg-white text-cyan-700 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				<Headphones size={14} />
				Audio
			</button>
		</div>

		<!-- Sound Toggle -->
		<button
			type="button"
			onclick={() => (soundEnabled = !soundEnabled)}
			class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 active:scale-95"
			aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
		>
			{#if soundEnabled}
				<Volume2 size={18} />
			{:else}
				<VolumeX size={18} class="text-rose-500" />
			{/if}
		</button>
	</header>

	{#if phase === 'playing' && currentQuestion}
		<!-- Game HUD Header with Icon, Question Counter, Combo & Points -->
		<section
			class="mt-1 flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs"
		>
			<div class="flex items-center gap-2">
				<img
					src="/images/tone-pairs-icon.jpg"
					alt="Tone Pair Lab"
					class="h-8 w-8 rounded-xl object-cover shadow-xs"
				/>
				<div>
					<div class="font-headline text-xs font-extrabold tracking-tight text-slate-900">
						Round {roundIndex}
						<span class="font-normal text-slate-400">/ {QUESTIONS_PER_ROUND}</span>
					</div>
					<div class="text-[10px] font-bold text-cyan-600 uppercase">Tone Pair Lab</div>
				</div>
			</div>

			<div class="flex items-center gap-2">
				{#if currentCombo > 1}
					<span
						class="flex animate-bounce items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs"
					>
						<Flame size={12} class="fill-current" />
						{currentCombo}x
					</span>
				{/if}
				<div
					class="flex items-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50/80 px-2.5 py-1 font-mono text-xs font-black text-cyan-700"
				>
					<Zap size={13} class="fill-cyan-500 text-cyan-600" />
					<span>{score}</span>
				</div>
			</div>
		</section>

		<!-- Progress Bar Line -->
		<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
			<div
				class="h-full bg-linear-to-r from-cyan-500 to-blue-600 transition-all duration-300 ease-out"
				style="width: {(roundIndex / QUESTIONS_PER_ROUND) * 100}%"
			></div>
		</div>

		<!-- Main Prompt Card with Arcade Frame -->
		<section
			class="shadow-card relative mt-3.5 flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-cyan-100 bg-linear-to-b from-white via-cyan-50/20 to-blue-50/20 p-6 text-center"
		>
			{#if mode === 'visual'}
				<div class="relative py-1">
					<h2 class="text-5xl font-black tracking-tight text-slate-900 drop-shadow-xs">
						{currentQuestion.word.hanzi}
					</h2>
					<p class="mt-2 text-base font-bold text-slate-500">
						{currentQuestion.word.english}
					</p>
				</div>
			{:else}
				<div class="py-3">
					<button
						type="button"
						onclick={playCurrentWord}
						class="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105 active:scale-95"
						aria-label="Replay audio"
					>
						<Volume2 size={36} />
					</button>
					<p class="mt-3 text-xs font-bold tracking-wider text-cyan-700 uppercase">
						Listen & Identify Tone Pair
					</p>
				</div>
			{/if}

			<!-- Pronunciation Audio Replay Pill -->
			<button
				type="button"
				onclick={playCurrentWord}
				class="mt-3 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
			>
				<Volume2 size={13} class="text-cyan-600" />
				<span>Listen (Replay)</span>
			</button>

			<!-- Feedback Banner After Submission -->
			{#if isAnswerSubmitted}
				<div
					class="mt-4 w-full rounded-2xl p-3 text-sm font-bold transition-all {isAnswerCorrect
						? 'border-2 border-emerald-300 bg-emerald-50 text-emerald-900 shadow-xs'
						: 'border-2 border-rose-300 bg-rose-50 text-rose-900 shadow-xs'}"
				>
					<div class="flex items-center justify-center gap-2 text-base">
						{#if isAnswerCorrect}
							<span class="flex items-center gap-1 font-black text-emerald-700">✓ Correct!</span>
							<span class="font-headline font-bold text-slate-800">
								Tone {currentQuestion.correctPair.tone1} ({currentQuestion.correctPair.symbol1}) +
								Tone {currentQuestion.correctPair.tone2} ({currentQuestion.correctPair.symbol2})
							</span>
						{:else}
							<span class="flex items-center gap-1 font-black text-rose-700">✗ Answer:</span>
							<span class="font-headline font-bold text-slate-800">
								Tone {currentQuestion.correctPair.tone1} ({currentQuestion.correctPair.symbol1}) +
								Tone {currentQuestion.correctPair.tone2} ({currentQuestion.correctPair.symbol2})
							</span>
						{/if}
					</div>
					<div class="mt-1 font-sans text-xs font-medium text-slate-600">
						{currentQuestion.word.pinyin} • {currentQuestion.correctPair.description}
					</div>
					<div class="mt-1 text-[11px] font-medium text-slate-500 italic">
						💡 {currentQuestion.correctPair.rehearsalTip}
					</div>
				</div>
			{/if}
		</section>

		<!-- 4 Tactile Arcade Multiple Choice Tone Options with Tone Symbols -->
		<section class="mt-3.5 grid grid-cols-2 gap-3">
			{#each currentQuestion.options as option (option.id)}
				{@const isSelected = selectedOptionId === option.id}
				{@const isCorrect = option.id === currentQuestion.correctPair.id}
				{@const showCorrectHighlight = isAnswerSubmitted && isCorrect}
				{@const showWrongHighlight = isAnswerSubmitted && isSelected && !isCorrect}

				<button
					type="button"
					onclick={() => submitAnswer(option)}
					disabled={isAnswerSubmitted}
					class="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-b-4 p-3.5 text-center transition-all active:translate-y-0.5 active:border-b-2 disabled:pointer-events-none {showCorrectHighlight
						? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-400'
						: showWrongHighlight
							? 'border-rose-500 bg-rose-50 text-rose-950 shadow-md'
							: 'border-slate-200 bg-white text-slate-800 shadow-xs hover:border-cyan-400 hover:bg-cyan-50/20'}"
				>
					<!-- Dual Tone Badges with Specific Tone Symbols (¯, ˊ, ˇ, ˋ) -->
					<div class="flex items-center justify-center gap-1.5 sm:gap-2">
						<div class="flex items-center gap-1">
							<span class="font-headline text-sm font-black text-slate-900 sm:text-base"
								>T{option.tone1}</span
							>
							<span
								class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 font-mono text-sm font-black text-cyan-800 shadow-2xs ring-1 ring-cyan-300 sm:h-7 sm:w-7 sm:text-base"
							>
								{option.symbol1}
							</span>
						</div>
						<span class="text-xs font-bold text-slate-300">+</span>
						<div class="flex items-center gap-1">
							<span class="font-headline text-sm font-black text-slate-900 sm:text-base"
								>T{option.tone2}</span
							>
							<span
								class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-100 font-mono text-sm font-black text-cyan-800 shadow-2xs ring-1 ring-cyan-300 sm:h-7 sm:w-7 sm:text-base"
							>
								{option.symbol2}
							</span>
						</div>
					</div>

					<div
						class="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500"
					>
						<span
							class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-600"
						>
							{option.pitchContour1[0]}-{option.pitchContour1[1]} · {option
								.pitchContour2[0]}-{option.pitchContour2[1]}
						</span>
						<span class="truncate">{option.description}</span>
					</div>
				</button>
			{/each}
		</section>
	{:else if phase === 'results'}
		<!-- Round Over / Results Summary Screen -->
		<section
			class="mt-6 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-md"
		>
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20"
			>
				<Trophy size={40} />
			</div>

			<h2 class="mt-4 font-headline text-2xl font-black text-slate-900">Lab Complete!</h2>
			<p class="font-sans text-xs text-slate-500">Tone pair pitch combinations mastered</p>

			{#if isNewHighScore}
				<div
					class="mt-3 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800"
				>
					<Sparkles size={14} />
					NEW HIGH SCORE!
				</div>
			{/if}

			<!-- Score Grid -->
			<div class="mt-6 grid w-full grid-cols-3 gap-2">
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Score</div>
					<div class="mt-1 text-lg font-black text-cyan-700">{score}</div>
				</div>
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Accuracy</div>
					<div class="mt-1 text-lg font-black text-emerald-600">{accuracy}%</div>
				</div>
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
						Max Streak
					</div>
					<div class="mt-1 text-lg font-black text-amber-600">{maxCombo}x</div>
				</div>
			</div>

			<!-- XP Reward Breakdown -->
			<div
				class="mt-4 flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"
			>
				<div class="flex items-center gap-2">
					<Sparkles size={18} class="text-indigo-600" />
					<div class="text-left">
						<div class="text-xs font-bold text-indigo-950">XP Earned</div>
						<div class="text-[11px] text-indigo-600">Mini-game economy reward</div>
					</div>
				</div>
				<div class="text-xl font-black text-indigo-700">+{earnedXP} XP</div>
			</div>

			<!-- Action Buttons -->
			<div class="mt-6 flex w-full flex-col gap-2.5">
				<button
					type="button"
					onclick={startNewRound}
					class="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-700 active:scale-98"
				>
					<RotateCcw size={16} />
					Play Another Round
				</button>
				<button
					type="button"
					onclick={() => goto(resolve('/games'))}
					class="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-98"
				>
					Back to Games
				</button>
			</div>
		</section>
	{/if}
</main>
