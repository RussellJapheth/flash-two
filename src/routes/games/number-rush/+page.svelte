<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import GameCanvasFX from '$lib/components/games/GameCanvasFX.svelte';
	import GameAvatar from '$lib/components/games/GameAvatar.svelte';
	import GameComboFloat from '$lib/components/games/GameComboFloat.svelte';
	import {
		generateNumberRushQuestion,
		numberToEnglish,
		parseEnglishSpokenNumber,
		type NumberRushQuestion
	} from '$lib/utils/chineseNumbers';
	import {
		saveGameScore,
		getGameHighScore,
		isCloudSyncEnabled,
		syncPendingGameScores,
		type GameScoreRecord
	} from '$lib/utils/gameStorage';
	import { isDebugModeEnabled } from '$lib/utils/storage';
	import { addXP, calculateGameXP } from '$lib/utils/xp';
	import { playSound, speakWord, stopSpeech } from '$lib/utils/audio';
	import {
		startSpeechRecognition,
		isSpeechRecognitionSupported,
		type SpeechRecognizerHandle
	} from '$lib/utils/speech';
	import {
		Volume2,
		RotateCcw,
		Flame,
		Trophy,
		Sparkles,
		ArrowRight,
		Play,
		Timer,
		Award,
		Zap,
		Mic,
		AlertCircle
	} from 'lucide-svelte';

	type GamePhase = 'lobby' | 'countdown' | 'playing' | 'summary';
	type GameMode = 'visual' | 'audio' | 'voice';

	// Game Configuration & State
	let phase = $state<GamePhase>('lobby');
	let gameMode = $state<GameMode>('visual');
	let maxRange = $state(99); // Standard 0-99 (can scale to 999)
	let isSpeechSupported = $state(false);
	let storageVersion = $state(0);
	let isDebugMode = $derived.by(() => {
		void storageVersion;
		void phase;
		return isDebugModeEnabled();
	});

	// Round & Timer State
	let countdownValue = $state(3);
	let roundTimeLeft = $state(60);
	let questionTimeLeft = $state(5);
	let isAudioLoading = $state(false);

	// Voice Mode State
	let isMicListening = $state(false);
	let isMicPermissionPending = $state(false);
	let isMicPermissionDenied = $state(false);
	let voiceTranscript = $state('');
	let voiceDebugTranscript = $state('');
	let voiceDebugIsFinal = $state(false);
	let voiceDebugError = $state('');
	let voiceDebugParsed = $state<number | null>(null);
	let voiceDebugAlternatives = $state<string[]>([]);
	let voiceDebugLog = $state<string[]>([]);
	let recognizerHandle: SpeechRecognizerHandle | null = null;

	// Score & Gameplay Metrics
	let score = $state(0);
	let combo = $state(0);
	let maxCombo = $state(0);
	let correctCount = $state(0);
	let wrongCount = $state(0);
	let earnedXP = $state(0);
	let isNewHighScore = $state(false);
	let highScore = $derived.by(() => {
		void storageVersion;
		return getGameHighScore('number-rush', gameMode);
	});

	// Current Question & Selection Feedback
	let currentQuestion = $state<NumberRushQuestion | null>(null);
	let selectedOption = $state<number | null>(null);
	let isAnswerLocked = $state(false);
	let lastAnswerStatus = $state<'correct' | 'wrong' | null>(null);

	// Canvas & Floating FX references
	let canvasFxRef: {
		triggerHit: (x?: number, y?: number, type?: 'correct' | 'wrong' | 'combo') => void;
		triggerConfetti: () => void;
	} | null = $state(null);
	let comboFloatRef: {
		spawn: (
			text: string,
			subtext?: string,
			type?: 'correct' | 'wrong' | 'combo',
			x?: number,
			y?: number
		) => void;
	} | null = $state(null);

	// Timers & Intervals
	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let gameRoundTimer: ReturnType<typeof setInterval> | null = null;
	let questionTimer: ReturnType<typeof setInterval> | null = null;
	let summaryRecord = $state<GameScoreRecord | null>(null);

	// Mascot state calculation
	let avatarState = $derived.by<'idle' | 'combo' | 'danger' | 'victory' | 'wrong'>(() => {
		if (phase === 'summary') return 'victory';
		if (phase === 'playing') {
			if (lastAnswerStatus === 'wrong') return 'wrong';
			if (roundTimeLeft <= 10) return 'danger';
			if (combo >= 2) return 'combo';
		}
		return 'idle';
	});

	// Performance Rank Rating (S, A, B, C)
	let rankGrade = $derived.by<{ tier: 'S' | 'A' | 'B' | 'C'; label: string; color: string }>(() => {
		if (!summaryRecord) return { tier: 'B', label: 'Great Effort', color: 'text-indigo-600' };
		const acc = summaryRecord.accuracy;
		const sc = summaryRecord.score;
		if (acc >= 90 && sc >= 1800)
			return { tier: 'S', label: 'Grandmaster Speed', color: 'text-amber-500' };
		if (acc >= 80 && sc >= 1200)
			return { tier: 'A', label: 'Expert Reflexes', color: 'text-indigo-600' };
		if (acc >= 65) return { tier: 'B', label: 'Skilled Challenger', color: 'text-emerald-600' };
		return { tier: 'C', label: 'Apprentice', color: 'text-slate-600' };
	});

	onMount(async () => {
		isSpeechSupported = isSpeechRecognitionSupported();
		if (!isSpeechSupported && gameMode === 'voice') {
			gameMode = 'visual';
		}
		storageVersion++;
		if (isCloudSyncEnabled()) {
			await syncPendingGameScores();
			storageVersion++;
		}
	});

	onDestroy(() => {
		cleanupTimers();
		stopRecognizer();
		stopSpeech();
	});

	function stopRecognizer() {
		if (recognizerHandle) {
			recognizerHandle.abort();
			recognizerHandle = null;
		}
		isMicListening = false;
	}

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
		stopRecognizer();
		storageVersion++;
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
		earnedXP = 0;
		isNewHighScore = false;
		selectedOption = null;
		lastAnswerStatus = null;
		isAnswerLocked = false;
		voiceTranscript = '';
		isMicPermissionPending = false;
		isMicPermissionDenied = false;
		usedNumbersInRound = new Set<number>();

		if (gameMode !== 'voice') {
			// For visual & audio modes: start 60s round clock immediately
			gameRoundTimer = setInterval(() => {
				roundTimeLeft -= 1;
				if (roundTimeLeft <= 0) {
					endGameRound();
				}
			}, 1000);
			nextQuestion();
		} else {
			// For voice mode: wait until browser mic permission is granted and speech recognition is ready
			isMicPermissionPending = true;
			nextQuestion();
			startVoiceRecognition();
		}
	}

	async function nextQuestion() {
		if (gameMode !== 'voice') {
			stopRecognizer();
		}
		if (phase !== 'playing') return;
		isAnswerLocked = false;
		selectedOption = null;
		lastAnswerStatus = null;
		voiceTranscript = '';
		voiceDebugTranscript = '';
		voiceDebugParsed = null;
		voiceDebugAlternatives = [];

		const q = generateNumberRushQuestion(maxRange, usedNumbersInRound);
		currentQuestion = q;

		if (gameMode === 'audio') {
			questionTimeLeft = 5;
			isAudioLoading = true;
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
		if (gameMode !== 'audio' || phase !== 'playing') return;
		questionTimeLeft = 5;

		questionTimer = setInterval(() => {
			if (phase !== 'playing' || gameMode !== 'audio') {
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
		if (gameMode !== 'voice') {
			stopRecognizer();
		}
		isAnswerLocked = true;
		wrongCount += 1;
		combo = 0;
		lastAnswerStatus = 'wrong';
		playSound('wrong');

		canvasFxRef?.triggerHit(undefined, undefined, 'wrong');
		comboFloatRef?.spawn('TIME OUT!', 'Combo Lost', 'wrong', 50, 45);

		setTimeout(() => {
			nextQuestion();
		}, 550);
	}

	function evaluateSpokenCandidates(
		candidates: string[],
		question: NumberRushQuestion
	): { isCorrect: boolean; matchedValue: number; matchedText: string } | null {
		if (!candidates || candidates.length === 0) return null;

		const expectedEnglish = numberToEnglish(question.correctValue).toLowerCase().trim();
		const digitStr = String(question.correctValue);

		for (const text of candidates) {
			if (!text || !text.trim()) continue;

			// 1. Direct parsed numerical value
			const parsedVal = parseEnglishSpokenNumber(text);
			if (parsedVal !== null && parsedVal === question.correctValue) {
				return { isCorrect: true, matchedValue: question.correctValue, matchedText: text };
			}

			// 2. Strict exact match (no substring contains or fuzzy similarity)
			const cleanSpoken = text
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();

			if (cleanSpoken === expectedEnglish || cleanSpoken === digitStr) {
				return { isCorrect: true, matchedValue: question.correctValue, matchedText: text };
			}
		}

		return null;
	}

	function startVoiceRecognition() {
		if (phase !== 'playing' || gameMode !== 'voice') return;

		stopRecognizer();

		console.log('[Voice Debug] Starting continuous SpeechRecognition for round (en-US)...');
		voiceDebugError = '';

		recognizerHandle = startSpeechRecognition({
			lang: 'en-US',
			continuous: true,
			onStart: () => {
				console.log('[Voice Debug] onStart: Microphone listening (continuous en-US)');
				isMicListening = true;
				isMicPermissionPending = false;
				isMicPermissionDenied = false;
				voiceDebugError = '';
				voiceDebugLog = [
					`[${new Date().toLocaleTimeString()}] Round mic active (en-US continuous)`,
					...voiceDebugLog.slice(0, 5)
				];

				// Start 60s round clock only once browser is ready and listening
				if (!gameRoundTimer) {
					gameRoundTimer = setInterval(() => {
						roundTimeLeft -= 1;
						if (roundTimeLeft <= 0) {
							endGameRound();
						}
					}, 1000);
				}
			},
			onResult: (transcript, isFinal, alternatives) => {
				console.log('[Voice Debug] onResult:', { transcript, isFinal, alternatives });
				if (phase !== 'playing' || isAnswerLocked || !currentQuestion) return;

				voiceTranscript = transcript;
				voiceDebugTranscript = transcript;
				voiceDebugIsFinal = isFinal;
				voiceDebugAlternatives = alternatives || [];

				const candidateList = Array.from(new Set([transcript, ...(alternatives || [])]));
				const evaluated = evaluateSpokenCandidates(candidateList, currentQuestion);
				const parsed = parseEnglishSpokenNumber(transcript);
				voiceDebugParsed = parsed;
				const altStr =
					alternatives && alternatives.length > 1
						? ` (alts: ${alternatives.slice(1).join(', ')})`
						: '';
				voiceDebugLog = [
					`[${new Date().toLocaleTimeString()}] "${transcript}"${altStr} (${isFinal ? 'final' : 'interim'}, eval:${evaluated ? 'HIT' : 'awaiting'})`,
					...voiceDebugLog.slice(0, 6)
				];

				if (evaluated && evaluated.isCorrect) {
					handleSelectOption(evaluated.matchedValue);
				}
			},
			onError: (err) => {
				if (err === 'aborted' || err === 'no-speech') return;
				console.warn('[Voice Debug] onError:', err);
				voiceDebugError = String(err);
				voiceDebugLog = [
					`[${new Date().toLocaleTimeString()}] Error: ${err}`,
					...voiceDebugLog.slice(0, 5)
				];
				if (err === 'not-allowed' || err === 'service-not-allowed') {
					isMicPermissionDenied = true;
					isMicPermissionPending = false;
					isMicListening = false;
				}
			},
			onEnd: () => {
				console.log('[Voice Debug] onEnd: Stream ended');
				isMicListening = false;
				recognizerHandle = null;
				// Auto-reconnect continuous stream if round is still active
				if (phase === 'playing' && gameMode === 'voice' && !isMicPermissionDenied) {
					startVoiceRecognition();
				}
			}
		});
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

	function handleSelectOption(opt: number, event?: MouseEvent) {
		if (isAnswerLocked || phase !== 'playing' || !currentQuestion) return;
		if (gameMode !== 'voice') {
			stopRecognizer();
		}
		isAnswerLocked = true;
		selectedOption = opt;

		let clickX: number | undefined;
		let clickY: number | undefined;
		if (event) {
			clickX = event.clientX;
			clickY = event.clientY;
		}

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

			const isHighCombo = combo >= 3;
			canvasFxRef?.triggerHit(clickX, clickY, isHighCombo ? 'combo' : 'correct');

			if (isHighCombo) {
				comboFloatRef?.spawn(`+${points}`, `🔥 ${combo}X COMBO!`, 'combo', 50, 40);
			} else {
				comboFloatRef?.spawn(`+${points}`, 'PERFECT', 'correct', 50, 42);
			}
		} else {
			// Wrong
			wrongCount += 1;
			combo = 0;
			lastAnswerStatus = 'wrong';
			playSound('wrong');

			canvasFxRef?.triggerHit(clickX, clickY, 'wrong');
			comboFloatRef?.spawn('MISS!', 'Combo Reset', 'wrong', 50, 45);
		}

		setTimeout(() => {
			nextQuestion();
		}, 380);
	}

	async function endGameRound() {
		cleanupTimers();
		stopRecognizer();
		stopSpeech();
		phase = 'summary';

		const totalAttempts = correctCount + wrongCount;
		const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

		// Calculate XP (scaled for mini-games so learning activities remain primary XP source)
		earnedXP = calculateGameXP(correctCount, accuracy, maxCombo);
		if (earnedXP > 0) {
			addXP(earnedXP);
		}

		const prevHigh = getGameHighScore('number-rush', gameMode);
		if (score > prevHigh && score > 0) {
			isNewHighScore = true;
		}

		summaryRecord = await saveGameScore({
			gameId: 'number-rush',
			gameName: 'Number Rush',
			score,
			correct: correctCount,
			wrong: wrongCount,
			accuracy,
			maxCombo,
			mode: gameMode
		});
		storageVersion++;

		playSound('milestone');
		setTimeout(() => {
			canvasFxRef?.triggerConfetti();
		}, 200);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (phase !== 'playing' || isAnswerLocked || !currentQuestion || gameMode === 'voice') return;
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

<svelte:window onkeydown={handleKeydown} onfocus={() => storageVersion++} />

<svelte:head>
	<title>Number Rush (数字狂飙) — FlashCards</title>
</svelte:head>

<TopHeader title="Number Rush" showBack={true} onBack={() => history.back()} />

<main
	class="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col justify-between overflow-hidden px-4 pt-3 pb-8"
>
	<!-- Sunny Numbers Track Daytime Background Image & Soft Blur Mask -->
	<div class="pointer-events-none absolute inset-0 z-0">
		<img
			src="/images/game-bg.jpg"
			alt="Sunny Numbers Track"
			class="h-full w-full object-cover object-top opacity-90"
		/>
		<div
			class="absolute inset-0 bg-linear-to-b from-sky-100/20 via-transparent to-sky-100/30 backdrop-blur-[0.5px]"
		></div>
	</div>

	<!-- Dynamic Canvas FX Layer (sparks, waves, confetti) -->
	<GameCanvasFX
		bind:this={canvasFxRef}
		audioActive={(gameMode === 'audio' && isAudioLoading) ||
			(gameMode === 'voice' && isMicListening)}
	/>

	<!-- Floating points / combo notification layer -->
	<GameComboFloat bind:this={comboFloatRef} />

	<!-- ══════════════════════════════════════════════════════════ -->
	<!-- 1. LOBBY SCREEN (Modeled directly after reference image)  -->
	<!-- ══════════════════════════════════════════════════════════ -->
	{#if phase === 'lobby'}
		<div class="relative z-10 flex flex-1 flex-col justify-between space-y-4">
			<!-- Hero Card with Frosted Glassmorphism & Soft Glow -->
			<section
				class="shadow-card relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/85 p-6 text-center shadow-xl shadow-sky-900/5 backdrop-blur-xl"
			>
				<!-- Subtle ambient radial gradient -->
				<div
					class="pointer-events-none absolute -top-12 left-1/2 h-36 w-48 -translate-x-1/2 rounded-full bg-sky-200/40 blur-2xl"
				></div>

				<!-- Floating Squircle Mascot Avatar Badge -->
				<div class="relative mb-3 flex justify-center">
					<div
						class="flex h-18 w-18 items-center justify-center rounded-3xl border-2 border-white/95 bg-linear-to-b from-white to-sky-50/90 p-2 shadow-md shadow-sky-600/10"
					>
						<img
							src="/mascots/owl.png"
							alt="Party Mascot"
							class="h-full w-full object-contain drop-shadow-xs"
						/>
					</div>
				</div>

				<h2 class="font-headline text-[1.65rem] font-black tracking-tight text-slate-900">
					Number Rush
				</h2>
				<p
					class="mt-0.5 font-headline text-xs font-extrabold tracking-wider text-amber-500 uppercase"
				>
					MANDARIN SPEED DRILL
				</p>

				<p
					class="mx-auto mt-2 max-w-xs font-sans text-xs leading-relaxed font-medium text-slate-600"
				>
					Race down the speed numbers track! Match Mandarin numbers to numeric values in 60 seconds.
				</p>

				<!-- High Score Pill with Golden Accent -->
				<div class="mt-3.5 flex items-center justify-center">
					<div
						class="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-linear-to-r from-amber-50 via-amber-100/60 to-amber-50 px-4 py-1 text-amber-900 shadow-xs"
					>
						<Trophy size={14} strokeWidth={2.5} class="text-amber-600" />
						<span class="font-headline text-xs font-black">Best Score: {highScore} pts</span>
					</div>
				</div>
			</section>

			<!-- Mode Configuration Card -->
			<section
				class="shadow-card space-y-4 rounded-[2.25rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-xl"
			>
				<div class="flex items-center justify-between">
					<h3 class="font-headline text-[11px] font-black tracking-wider text-slate-800 uppercase">
						GAME MODE CONFIGURATION
					</h3>
					<span
						class="flex items-center gap-1 font-headline text-[11px] font-extrabold text-sky-600"
					>
						<Zap size={13} strokeWidth={2.5} />
						Speed Rules
					</span>
				</div>

				<!-- Challenge Format Toggle -->
				<div class="space-y-2">
					<span class="font-headline text-xs font-bold text-slate-900">Challenge Format</span>

					{#if isSpeechSupported}
						<div class="grid grid-cols-3 gap-2">
							<button
								type="button"
								onclick={() => (gameMode = 'visual')}
								class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 text-center font-headline text-xs font-extrabold transition-all {gameMode ===
								'visual'
									? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
									: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
							>
								<Sparkles
									size={16}
									strokeWidth={2.25}
									class={gameMode === 'visual' ? 'text-sky-600' : 'text-slate-400'}
								/>
								<span>Visual</span>
							</button>

							<button
								type="button"
								onclick={() => (gameMode = 'audio')}
								class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 text-center font-headline text-xs font-extrabold transition-all {gameMode ===
								'audio'
									? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
									: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
							>
								<Volume2
									size={16}
									strokeWidth={2.25}
									class={gameMode === 'audio' ? 'text-sky-600' : 'text-slate-400'}
								/>
								<span>Audio (5s)</span>
							</button>

							<button
								type="button"
								onclick={() => (gameMode = 'voice')}
								class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 text-center font-headline text-xs font-extrabold transition-all {gameMode ===
								'voice'
									? 'border-2 border-indigo-500 bg-indigo-50/90 text-indigo-950 shadow-xs'
									: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
							>
								<Mic
									size={16}
									strokeWidth={2.25}
									class={gameMode === 'voice' ? 'text-indigo-600' : 'text-slate-400'}
								/>
								<span>Voice (Speak)</span>
							</button>
						</div>
					{:else}
						<div class="grid grid-cols-2 gap-2.5">
							<button
								type="button"
								onclick={() => (gameMode = 'visual')}
								class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl p-3 font-headline text-xs font-extrabold transition-all {gameMode ===
								'visual'
									? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
									: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
							>
								<Sparkles
									size={16}
									strokeWidth={2.25}
									class={gameMode === 'visual' ? 'text-sky-600' : 'text-slate-400'}
								/>
								<span>Visual (Pinyin + Hanzi)</span>
							</button>

							<button
								type="button"
								onclick={() => (gameMode = 'audio')}
								class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl p-3 font-headline text-xs font-extrabold transition-all {gameMode ===
								'audio'
									? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
									: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
							>
								<Volume2
									size={16}
									strokeWidth={2.25}
									class={gameMode === 'audio' ? 'text-sky-600' : 'text-slate-400'}
								/>
								<span>Audio (5s Speed Test)</span>
							</button>
						</div>
					{/if}
				</div>

				<!-- Difficulty Range Selection -->
				<div class="space-y-2">
					<span class="font-headline text-xs font-bold text-slate-900">Difficulty Range</span>
					<div class="grid grid-cols-2 gap-2.5">
						<button
							type="button"
							onclick={() => (maxRange = 99)}
							class="cursor-pointer rounded-2xl p-3 font-headline text-xs font-extrabold transition-all {maxRange ===
							99
								? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
								: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
						>
							0 &ndash; 99 (Standard)
						</button>
						<button
							type="button"
							onclick={() => (maxRange = 999)}
							class="cursor-pointer rounded-2xl p-3 font-headline text-xs font-extrabold transition-all {maxRange ===
							999
								? 'border-2 border-sky-400 bg-sky-50/80 text-slate-900 shadow-xs'
								: 'border border-slate-200/80 bg-slate-100/40 text-slate-500 hover:bg-white/60'}"
						>
							0 &ndash; 999 (Pro Master)
						</button>
					</div>
				</div>
			</section>

			<!-- Start CTA Button with Bright Royal Gradient -->
			<button
				type="button"
				id="start-number-rush-btn"
				onclick={startPreGameCountdown}
				class="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-500 via-indigo-500 to-indigo-600 font-headline text-sm font-black tracking-wide text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-105 active:scale-[0.98]"
			>
				<Play size={18} strokeWidth={2.75} />
				<span>START ROUND (60s)</span>
			</button>
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 2. COUNTDOWN SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'countdown'}
		<div class="relative z-10 flex flex-1 flex-col items-center justify-center py-16 text-center">
			<GameAvatar state="combo" size="lg" />

			<p class="mt-4 font-headline text-sm font-black tracking-widest text-indigo-600 uppercase">
				GET READY!
			</p>

			<!-- Expanding arcade countdown pulse -->
			<div class="relative my-8 flex items-center justify-center">
				<div
					class="absolute h-36 w-36 animate-ping rounded-full border-4 border-sky-400 opacity-50 duration-1000"
				></div>
				<div
					class="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-linear-to-b from-blue-500 to-indigo-600 p-2 text-white shadow-2xl"
				>
					<span
						class="font-headline font-black drop-shadow-md select-none {countdownValue > 0
							? 'text-6xl'
							: 'text-4xl tracking-wider'}"
					>
						{countdownValue > 0 ? countdownValue : 'GO!'}
					</span>
				</div>
			</div>

			<p
				class="rounded-full border border-white/80 bg-white/85 px-4 py-1.5 font-sans text-xs font-bold text-sky-950 shadow-xs backdrop-blur-md"
			>
				{#if gameMode === 'voice'}
					Speak the number in English!
				{:else if gameMode === 'audio'}
					Listen carefully and select fast!
				{:else}
					Identify the number and tap the match!
				{/if}
			</p>
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 3. ACTIVE GAMEPLAY SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'playing' && currentQuestion}
		<div class="relative z-10 flex flex-1 flex-col justify-between space-y-4">
			<!-- Game Status HUD with Frosted Gloss -->
			<div
				class="shadow-card flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-4 py-2.5 shadow-lg shadow-sky-900/5 backdrop-blur-xl"
			>
				<!-- Round Timer with Critical Pulse -->
				<div
					class="flex items-center gap-1.5 font-headline text-sm font-black {roundTimeLeft <= 10
						? 'animate-pulse text-rose-600 drop-shadow-xs'
						: 'text-slate-900'}"
				>
					<Timer size={16} strokeWidth={2.25} />
					<span>{roundTimeLeft}s</span>
				</div>

				<!-- Live Score Display -->
				<div class="text-center">
					<span class="font-headline text-[10px] font-bold text-slate-400 uppercase">Score</span>
					<p class="font-headline text-lg font-black text-indigo-600">{score}</p>
				</div>

				<!-- Companion Avatar + Combo Heat Pill -->
				<div class="flex items-center gap-2">
					<GameAvatar state={avatarState} {combo} size="sm" />
					<div
						class="flex items-center gap-1 rounded-full border px-2.5 py-1 font-headline text-xs font-black transition-all {combo >=
						3
							? 'border-amber-400 bg-amber-500 text-white shadow-md shadow-amber-500/30'
							: 'border-amber-200 bg-amber-50 text-amber-800'}"
					>
						<Flame
							size={13}
							strokeWidth={2.5}
							class={combo >= 3 ? 'animate-bounce text-white' : 'text-amber-500'}
						/>
						<span>{combo}x</span>
					</div>
				</div>
			</div>

			<!-- 5s Question Countdown Bar (Audio Mode Only) -->
			{#if gameMode === 'audio'}
				<div class="space-y-1">
					<div class="flex items-center justify-between text-[11px] font-black text-slate-700">
						<span class="flex items-center gap-1">
							<Volume2 size={13} strokeWidth={2} class="text-indigo-600" />
							<span>Audio Timer</span>
						</span>
						<span class={questionTimeLeft <= 2 ? 'font-black text-rose-600' : ''}
							>{questionTimeLeft}s</span
						>
					</div>
					<ProgressBar
						value={questionTimeLeft}
						max={5}
						variant={questionTimeLeft <= 2 ? 'amber' : 'primary'}
						height="h-2"
					/>
				</div>
			{/if}

			<!-- Prompt Card Area with Dynamic Border Glow -->
			<section
				class="shadow-card relative flex {gameMode === 'voice'
					? 'min-h-[280px] flex-1'
					: 'min-h-[170px]'} flex-col items-center justify-center rounded-[2.25rem] border border-white/80 bg-white/90 p-6 text-center shadow-xl shadow-sky-900/5 backdrop-blur-xl transition-all {lastAnswerStatus ===
				'correct'
					? 'border-2 border-emerald-500 bg-emerald-50/90 shadow-emerald-500/20'
					: lastAnswerStatus === 'wrong'
						? 'border-2 border-rose-500 bg-rose-50/90 shadow-rose-500/20'
						: ''}"
			>
				{#if gameMode === 'audio'}
					<!-- Audio Mode: Listening Speaker View -->
					<div class="space-y-3">
						<button
							type="button"
							onclick={playQuestionAudio}
							disabled={isAudioLoading}
							aria-label="Replay audio"
							class="mx-auto flex h-18 w-18 cursor-pointer items-center justify-center rounded-3xl border border-indigo-200 bg-sky-50 text-indigo-600 shadow-md transition-all hover:bg-sky-100 active:scale-95"
						>
							<Volume2 size={34} strokeWidth={2.25} class={isAudioLoading ? 'animate-pulse' : ''} />
						</button>
						<div>
							<p class="font-headline text-sm font-bold text-slate-700">
								{isAudioLoading ? 'Playing Mandarin audio…' : 'Tap speaker to repeat'}
							</p>
							<span
								class="mt-1 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-0.5 font-headline text-xs font-black text-indigo-700 shadow-xs"
							>
								{currentQuestion.hanzi}
							</span>
						</div>
					</div>
				{:else if gameMode === 'voice'}
					<!-- Voice Mode: Large Pinyin + Hanzi Badge + Focused Voice Recognition Center -->
					<div class="flex flex-col items-center justify-center space-y-4">
						<div class="space-y-1.5">
							<h3
								class="font-headline text-4xl font-black tracking-wide text-indigo-600 drop-shadow-xs"
							>
								{currentQuestion.pinyin}
							</h3>
							<div>
								<span
									class="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-5 py-1.5 font-headline text-xl font-black text-indigo-800 shadow-xs"
								>
									{currentQuestion.hanzi}
								</span>
							</div>
						</div>

						<!-- Large Animated Mic Waveform & Status Indicator -->
						<div class="pt-2">
							{#if isMicPermissionDenied}
								<div
									class="inline-flex max-w-xs items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-left font-sans text-xs font-semibold text-rose-700"
								>
									<AlertCircle size={18} class="shrink-0 text-rose-600" />
									<span
										>Microphone access was denied. Please allow microphone in browser settings.</span
									>
								</div>
							{:else if isMicPermissionPending}
								<div
									class="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 font-headline text-xs font-black text-amber-900 shadow-xs"
								>
									<Mic size={15} class="animate-pulse text-amber-600" />
									<span>Allow microphone access to begin…</span>
								</div>
							{:else}
								<div class="flex flex-col items-center space-y-2">
									<!-- Pulse Ring Mic Container -->
									<div class="relative flex items-center justify-center">
										{#if isMicListening}
											<div
												class="absolute h-16 w-16 animate-ping rounded-full bg-indigo-400/40 duration-1000"
											></div>
										{/if}
										<div
											class="flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all {isMicListening
												? 'border-indigo-400 bg-indigo-50 text-indigo-600 shadow-md shadow-indigo-500/20'
												: 'border-slate-200 bg-slate-100 text-slate-400'}"
										>
											<Mic size={24} strokeWidth={2.5} />
										</div>
									</div>

									<!-- Transcribed Speech Feedback -->
									<div
										class="inline-flex items-center gap-2 rounded-full border px-4 py-1 font-headline text-xs font-extrabold transition-all {voiceTranscript
											? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-xs'
											: 'border-slate-200 bg-slate-100/80 text-slate-600'}"
									>
										{#if voiceTranscript}
											<span>Heard: &ldquo;{voiceTranscript}&rdquo;</span>
										{:else}
											<span>Speak the number in English…</span>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<!-- Visual Mode: Large Pinyin + Hanzi Badge -->
					<div class="space-y-2">
						<h3
							class="font-headline text-3xl font-black tracking-wide text-indigo-600 drop-shadow-xs"
						>
							{currentQuestion.pinyin}
						</h3>
						<span
							class="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 font-headline text-base font-black text-indigo-800 shadow-xs"
						>
							{currentQuestion.hanzi}
						</span>
					</div>
				{/if}
			</section>

			<!-- VOICE RECOGNIZER DEBUG PANEL (Controlled by Settings Debug Mode toggle) -->
			{#if isDebugMode && gameMode === 'voice' && currentQuestion}
				<div
					class="rounded-2xl border-2 border-dashed border-indigo-400 bg-slate-900/95 p-3.5 text-left font-mono text-xs text-white shadow-xl backdrop-blur-md"
				>
					<div
						class="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold text-indigo-300"
					>
						<span class="flex items-center gap-1.5">
							<span
								class="inline-block h-2.5 w-2.5 rounded-full {isMicListening
									? 'animate-pulse bg-emerald-400'
									: 'bg-rose-400'}"
							></span>
							VOICE RECOGNIZER DEBUG
						</span>
						<span class="rounded bg-indigo-950 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
							Target: {currentQuestion.correctValue} (&ldquo;{numberToEnglish(
								currentQuestion.correctValue
							)}&rdquo;)
						</span>
					</div>

					<div class="mt-2.5 space-y-2 text-[11px]">
						<div class="flex items-center justify-between">
							<span class="text-slate-400">Mic State:</span>
							<span class="font-bold text-amber-300">
								{isMicListening
									? 'LISTENING (en-US)'
									: isMicPermissionPending
										? 'WAITING PERMISSION'
										: isMicPermissionDenied
											? 'PERMISSION DENIED'
											: 'IDLE'}
							</span>
						</div>

						<div class="space-y-1 rounded-xl border border-slate-700/80 bg-slate-800/80 p-2.5">
							<div class="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
								Raw Speech Output
							</div>
							<div class="text-sm font-black break-all text-emerald-300">
								{voiceDebugTranscript ? `"${voiceDebugTranscript}"` : '(awaiting speech...)'}
							</div>
							<div class="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-300">
								<span
									>isFinal: <strong
										class={voiceDebugIsFinal ? 'text-emerald-400' : 'text-amber-400'}
										>{voiceDebugIsFinal ? 'true' : 'false'}</strong
									></span
								>
								<span
									>Parsed: <strong class="text-sky-300"
										>{voiceDebugParsed !== null ? voiceDebugParsed : 'null'}</strong
									></span
								>
							</div>
						</div>

						{#if voiceDebugAlternatives && voiceDebugAlternatives.length > 0}
							<div class="space-y-1 rounded-xl border border-slate-700/80 bg-slate-800/50 p-2">
								<div class="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
									All Speech Alternatives ({voiceDebugAlternatives.length})
								</div>
								<div class="flex flex-wrap gap-1.5 pt-0.5">
									{#each voiceDebugAlternatives as alt, idx (idx)}
										<span
											class="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-indigo-200"
										>
											"{alt}"
										</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if voiceDebugError}
							<div class="rounded-xl border border-rose-800 bg-rose-950/80 p-2 text-rose-300">
								<span class="font-bold text-rose-400">Last Error:</span>
								{voiceDebugError}
							</div>
						{/if}
					</div>

					{#if voiceDebugLog.length > 0}
						<div class="mt-2.5 border-t border-slate-800 pt-2 text-[10px] text-slate-300">
							<span class="font-semibold text-slate-400">Stream Event History:</span>
							<ul class="mt-1 space-y-0.5">
								{#each voiceDebugLog as log, idx (idx)}
									<li class="truncate rounded bg-slate-800/40 px-2 py-0.5 text-slate-300">{log}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}

			<!-- 4 Tactile Number Option Buttons (Only for Visual & Audio Modes) -->
			{#if gameMode !== 'voice'}
				<div class="grid grid-cols-2 gap-3 pt-2">
					{#each currentQuestion.options as opt, idx (opt)}
						{@const isSelected = selectedOption === opt}
						{@const isThisCorrect = opt === currentQuestion.correctValue}
						{@const showSuccess = isAnswerLocked && isThisCorrect}
						{@const showError = isAnswerLocked && isSelected && !isThisCorrect}

						<button
							type="button"
							id="option-btn-{idx}"
							onclick={(e) => handleSelectOption(opt, e)}
							disabled={isAnswerLocked}
							class="shadow-card flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border text-center transition-all {showSuccess
								? 'border-2 border-emerald-600 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
								: showError
									? 'border-2 border-rose-600 bg-rose-500 text-white shadow-lg shadow-rose-500/30'
									: 'border-2 border-white/90 bg-white/90 text-slate-900 shadow-md hover:border-sky-300 hover:bg-sky-50/60 active:scale-[0.98]'}"
						>
							<span class="font-headline text-3xl font-black">
								{opt}
							</span>
							<span class="font-headline text-[10px] font-bold text-slate-400">
								Key [{idx + 1}]
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ══════════════════════════════════════════════════════════ -->
		<!-- 4. SUMMARY / GAME OVER SCREEN -->
		<!-- ══════════════════════════════════════════════════════════ -->
	{:else if phase === 'summary' && summaryRecord}
		<div class="relative z-10 flex flex-1 flex-col justify-between space-y-4">
			<!-- Steam-Style Victory Podium & Rank Badge -->
			<section
				class="shadow-card relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 p-6 text-center shadow-xl shadow-sky-900/5 backdrop-blur-xl"
			>
				<div class="mb-3 flex justify-center">
					<GameAvatar state="victory" size="lg" />
				</div>

				{#if isNewHighScore}
					<div
						class="mx-auto mb-2 flex items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-headline text-xs font-black text-amber-900 shadow-xs"
					>
						<Sparkles size={14} strokeWidth={2.5} class="text-amber-600" />
						<span>NEW HIGH SCORE RECORD!</span>
					</div>
				{/if}

				<!-- Rank Grade Emblem -->
				<div class="my-2 flex items-center justify-center gap-3">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-300 bg-linear-to-b from-amber-100 to-amber-200 font-headline text-3xl font-black text-amber-900 shadow-md"
					>
						{rankGrade.tier}
					</div>
					<div class="text-left">
						<span
							class="font-headline text-[11px] font-extrabold tracking-wider text-indigo-600 uppercase"
						>
							Rank Rating
						</span>
						<h3 class="font-headline text-base font-black text-slate-900">{rankGrade.label}</h3>
					</div>
				</div>

				<p class="mt-2 font-headline text-4xl font-black text-slate-900 drop-shadow-xs">
					{summaryRecord.score} <span class="text-lg font-bold text-slate-500">pts</span>
				</p>

				<!-- Stat Badges -->
				<div class="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
					<div class="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5">
						<span class="font-headline text-[10px] font-black text-emerald-700 uppercase"
							>Correct</span
						>
						<p class="font-headline text-lg font-black text-emerald-800">{summaryRecord.correct}</p>
					</div>
					<div class="rounded-xl border border-rose-100 bg-rose-50 p-2.5">
						<span class="font-headline text-[10px] font-black text-rose-700 uppercase">Wrong</span>
						<p class="font-headline text-lg font-black text-rose-800">{summaryRecord.wrong}</p>
					</div>
					<div class="rounded-xl border border-indigo-100 bg-indigo-50 p-2.5">
						<span class="font-headline text-[10px] font-black text-indigo-700 uppercase"
							>Accuracy</span
						>
						<p class="font-headline text-lg font-black text-indigo-800">
							{summaryRecord.accuracy}%
						</p>
					</div>
					<div class="rounded-xl border border-amber-100 bg-amber-50 p-2.5">
						<span class="font-headline text-[10px] font-black text-amber-700 uppercase"
							>XP Earned</span
						>
						<p class="font-headline text-lg font-black text-amber-900">+{earnedXP}</p>
					</div>
				</div>
			</section>

			<!-- Performance Breakdown Card -->
			<section
				class="shadow-card space-y-3 rounded-[2.25rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-sky-900/5 backdrop-blur-xl"
			>
				<h3 class="font-headline text-xs font-black tracking-wider text-slate-500 uppercase">
					Performance Breakdown
				</h3>

				<div class="divide-y divide-slate-100">
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="flex items-center gap-1.5 font-sans font-medium text-slate-600">
							<Flame size={14} strokeWidth={2.25} class="text-amber-500" />
							Max Combo Chain
						</span>
						<span class="font-headline font-black text-slate-900"
							>{summaryRecord.maxCombo}x Multiplier</span
						>
					</div>
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="flex items-center gap-1.5 font-sans font-medium text-slate-600">
							<Sparkles size={14} strokeWidth={2.25} class="text-amber-500" />
							XP Rewarded
						</span>
						<span class="font-headline font-black text-indigo-600">+{earnedXP} XP</span>
					</div>
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="flex items-center gap-1.5 font-sans font-medium text-slate-600">
							<Award size={14} strokeWidth={2.25} class="text-indigo-600" />
							Trial Format
						</span>
						<span class="font-headline font-bold text-slate-900 capitalize"
							>{summaryRecord.mode} Mode</span
						>
					</div>
					<div class="flex items-center justify-between py-2 text-xs">
						<span class="font-sans font-medium text-slate-600">Number Scale</span>
						<span class="font-headline font-bold text-slate-900">0 &ndash; {maxRange}</span>
					</div>
				</div>
			</section>

			<!-- Action CTAs with Bright Gradient -->
			<div class="space-y-2.5">
				<button
					type="button"
					id="play-again-btn"
					onclick={startPreGameCountdown}
					class="shadow-primary-glow flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-4 border-indigo-800 bg-indigo-600 font-headline text-sm font-black text-white transition-all hover:bg-indigo-700 active:translate-y-1 active:scale-[0.99] active:border-b-0"
				>
					<RotateCcw size={17} strokeWidth={2.5} />
					<span>PLAY AGAIN</span>
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
