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

	function handleKeyDown(e: KeyboardEvent) {
		if (phase !== 'playing' || isAnswerSubmitted || !currentQuestion) return;

		if (e.key === ' ' || e.key === 'r' || e.key === 'R') {
			e.preventDefault();
			playCurrentWord();
			return;
		}

		const num = parseInt(e.key, 10);
		if (num >= 1 && num <= currentQuestion.options.length) {
			e.preventDefault();
			submitAnswer(currentQuestion.options[num - 1]);
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

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
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-headline text-xs font-bold transition {mode ===
				'visual'
					? 'bg-white text-indigo-700 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				<Eye size={14} />
				Visual
			</button>
			<button
				type="button"
				onclick={() => toggleMode('audio')}
				class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-headline text-xs font-bold transition {mode ===
				'audio'
					? 'bg-white text-indigo-700 shadow-xs'
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
					src="/images/tone-pairs-icon.svg"
					alt="Tone Pair Lab"
					class="h-8 w-8 rounded-xl object-cover shadow-xs"
				/>
				<div>
					<div class="font-headline text-xs font-extrabold tracking-tight text-slate-900">
						Round {roundIndex}
						<span class="font-normal text-slate-400">/ {QUESTIONS_PER_ROUND}</span>
					</div>
					<div
						class="font-headline text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase"
					>
						Tone Pair Lab
					</div>
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
					class="flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 font-mono text-xs font-black text-indigo-700"
				>
					<Zap size={13} class="fill-indigo-500 text-indigo-600" />
					<span>{score}</span>
				</div>
			</div>
		</section>

		<!-- Progress Bar Line -->
		<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
			<div
				class="h-full bg-linear-to-r from-indigo-600 to-indigo-500 transition-all duration-300 ease-out"
				style="width: {(roundIndex / QUESTIONS_PER_ROUND) * 100}%"
			></div>
		</div>

		<!-- Main Prompt Card with Clean High-Contrast Layout -->
		<section
			class="shadow-card relative mt-3.5 flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-white via-indigo-50/20 to-white p-6 text-center"
		>
			{#if mode === 'visual'}
				<div class="relative py-2">
					<h2 class="font-headline text-5xl font-black tracking-tight text-slate-900">
						{currentQuestion.word.hanzi}
					</h2>
					<p class="mt-2 font-sans text-sm font-semibold text-slate-600">
						{currentQuestion.word.english}
					</p>
				</div>
			{:else}
				<div class="flex flex-col items-center py-2">
					<button
						type="button"
						onclick={playCurrentWord}
						class="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-tr from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-transform hover:scale-105 active:scale-95"
						aria-label="Replay audio"
					>
						<Volume2 size={36} />
					</button>
					<p class="mt-3 font-sans text-sm font-bold text-slate-700">
						"{currentQuestion.word.english}"
					</p>
					<p class="mt-0.5 font-sans text-xs text-slate-400">Listen & identify the tone pair</p>
				</div>
			{/if}

			<!-- Pronunciation Audio Replay Pill -->
			{#if mode === 'visual'}
				<button
					type="button"
					onclick={playCurrentWord}
					class="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-95"
				>
					<Volume2 size={14} class="text-indigo-600" />
					<span>Listen (Replay)</span>
				</button>
			{/if}

			<!-- Feedback Banner After Submission -->
			{#if isAnswerSubmitted}
				<div
					class="mt-4 w-full rounded-2xl p-3.5 text-center transition-all {isAnswerCorrect
						? 'border-2 border-emerald-300 bg-emerald-50 text-emerald-950 shadow-xs'
						: 'border-2 border-rose-300 bg-rose-50 text-rose-950 shadow-xs'}"
				>
					<div class="flex flex-wrap items-center justify-center gap-2">
						{#if isAnswerCorrect}
							<span class="font-headline text-sm font-black text-emerald-700">✓ Correct!</span>
						{:else}
							<span class="font-headline text-sm font-black text-rose-700">✗ Answer:</span>
						{/if}
						<span class="font-mono text-base font-bold text-slate-900">
							{currentQuestion.word.pinyin}
						</span>
						<span
							class="rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-0.5 font-headline text-xs font-bold text-slate-700"
						>
							Tone {currentQuestion.correctPair.tone1} ({currentQuestion.correctPair.symbol1}) +
							Tone {currentQuestion.correctPair.tone2} ({currentQuestion.correctPair.symbol2})
						</span>
					</div>
					<div class="mt-1.5 font-sans text-xs text-slate-600">
						{currentQuestion.correctPair.description}
					</div>
					<div class="mt-1 text-[11px] font-medium text-slate-500 italic">
						💡 {currentQuestion.correctPair.rehearsalTip}
					</div>
				</div>
			{/if}
		</section>

		<!-- 4 Tactile Arcade Multiple Choice Tone Options: Pure Tone Symbols Only -->
		<section class="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
			{#each currentQuestion.options as option, idx (option.id)}
				{@const isSelected = selectedOptionId === option.id}
				{@const isCorrect = option.id === currentQuestion.correctPair.id}
				{@const showCorrectHighlight = isAnswerSubmitted && isCorrect}
				{@const showWrongHighlight = isAnswerSubmitted && isSelected && !isCorrect}

				<button
					type="button"
					onclick={() => submitAnswer(option)}
					disabled={isAnswerSubmitted}
					title="Tone {option.tone1} ({option.symbol1}) + Tone {option.tone2} ({option.symbol2})"
					aria-label="Option {idx + 1}: Tone {option.tone1} and Tone {option.tone2}"
					class="group relative flex min-h-[96px] cursor-pointer items-center justify-center rounded-3xl border-2 p-4 text-center transition-all active:scale-[0.98] disabled:pointer-events-none sm:min-h-[104px] {showCorrectHighlight
						? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-300'
						: showWrongHighlight
							? 'border-rose-500 bg-rose-50 text-rose-950 shadow-md ring-2 ring-rose-300'
							: 'shadow-card border-slate-200/90 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20'}"
				>
					<!-- Key shortcut badge (1, 2, 3, 4) -->
					<span
						class="absolute top-2.5 left-3 font-mono text-[10px] font-bold transition-colors {showCorrectHighlight
							? 'text-emerald-700'
							: showWrongHighlight
								? 'text-rose-700'
								: 'text-slate-400 group-hover:text-indigo-600'}"
					>
						{idx + 1}
					</span>

					<!-- Pure Tone Symbols Display -->
					<div class="flex items-center justify-center gap-3">
						<span
							class="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all sm:h-13 sm:w-13 {showCorrectHighlight
								? 'border-emerald-300 bg-white text-emerald-700 shadow-xs'
								: showWrongHighlight
									? 'border-rose-300 bg-white text-rose-700 shadow-xs'
									: 'border-slate-200/80 bg-slate-50/80 text-slate-800 shadow-2xs group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700'}"
						>
							{@render toneGlyph(option.tone1)}
						</span>
						<span
							class="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all sm:h-13 sm:w-13 {showCorrectHighlight
								? 'border-emerald-300 bg-white text-emerald-700 shadow-xs'
								: showWrongHighlight
									? 'border-rose-300 bg-white text-rose-700 shadow-xs'
									: 'border-slate-200/80 bg-slate-50/80 text-slate-800 shadow-2xs group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700'}"
						>
							{@render toneGlyph(option.tone2)}
						</span>
					</div>
				</button>
			{/each}
		</section>
	{:else if phase === 'results'}
		<!-- Round Over / Results Summary Screen -->
		<section
			class="shadow-card mt-6 flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center"
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
					class="mt-3 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-headline text-xs font-black text-amber-800"
				>
					<Sparkles size={14} />
					NEW HIGH SCORE!
				</div>
			{/if}

			<!-- Score Grid -->
			<div class="mt-6 grid w-full grid-cols-3 gap-2">
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Score</div>
					<div class="mt-1 font-headline text-lg font-black text-indigo-700">{score}</div>
				</div>
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Accuracy</div>
					<div class="mt-1 font-headline text-lg font-black text-emerald-600">{accuracy}%</div>
				</div>
				<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
						Max Streak
					</div>
					<div class="mt-1 font-headline text-lg font-black text-amber-600">{maxCombo}x</div>
				</div>
			</div>

			<!-- XP Reward Breakdown -->
			<div
				class="mt-4 flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4"
			>
				<div class="flex items-center gap-2">
					<Sparkles size={18} class="text-indigo-600" />
					<div class="text-left">
						<div class="font-headline text-xs font-bold text-indigo-950">XP Earned</div>
						<div class="font-sans text-[11px] text-indigo-600">Mini-game economy reward</div>
					</div>
				</div>
				<div class="font-headline text-xl font-black text-indigo-700">+{earnedXP} XP</div>
			</div>

			<!-- Action Buttons -->
			<div class="mt-6 flex w-full flex-col gap-2.5">
				<button
					type="button"
					onclick={startNewRound}
					class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-98"
				>
					<RotateCcw size={16} />
					Play Another Round
				</button>
				<button
					type="button"
					onclick={() => goto(resolve('/games'))}
					class="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 font-headline text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-98"
				>
					Back to Games
				</button>
			</div>
		</section>
	{/if}
</main>

{#snippet toneGlyph(tone: number)}
	{#if tone === 1}
		<!-- Tone 1: High Level Flat -->
		<svg
			viewBox="0 0 24 24"
			class="h-6 w-6 stroke-current sm:h-7 sm:w-7"
			fill="none"
			stroke-width="3.5"
			stroke-linecap="round"
		>
			<line x1="4" y1="9" x2="20" y2="9" />
		</svg>
	{:else if tone === 2}
		<!-- Tone 2: Rising -->
		<svg
			viewBox="0 0 24 24"
			class="h-6 w-6 stroke-current sm:h-7 sm:w-7"
			fill="none"
			stroke-width="3.5"
			stroke-linecap="round"
		>
			<line x1="5" y1="18" x2="19" y2="7" />
		</svg>
	{:else if tone === 3}
		<!-- Tone 3: Dipping / Caron -->
		<svg
			viewBox="0 0 24 24"
			class="h-6 w-6 stroke-current sm:h-7 sm:w-7"
			fill="none"
			stroke-width="3.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M5 9 L12 18 L19 9" />
		</svg>
	{:else if tone === 4}
		<!-- Tone 4: Falling -->
		<svg
			viewBox="0 0 24 24"
			class="h-6 w-6 stroke-current sm:h-7 sm:w-7"
			fill="none"
			stroke-width="3.5"
			stroke-linecap="round"
		>
			<line x1="5" y1="7" x2="19" y2="18" />
		</svg>
	{/if}
{/snippet}
