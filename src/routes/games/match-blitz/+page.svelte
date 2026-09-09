<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ParticleCanvas from '$lib/components/games/ParticleCanvas.svelte';
	import MatchBlitzCard from '$lib/components/games/MatchBlitzCard.svelte';
	import GameAvatar from '$lib/components/games/GameAvatar.svelte';
	import {
		getBuiltinPacks,
		getPackWords,
		getAllCustomDecks,
		getAllSavedWords
	} from '$lib/utils/storage';
	import { saveGameScore, getGameHighScore, type GameScoreRecord } from '$lib/utils/gameStorage';
	import {
		playMatchFlip,
		playMatchSuccess,
		playMatchMismatch,
		playFrenzyIgnite,
		playHeartbeatWarning,
		speakWord,
		stopSpeech
	} from '$lib/utils/audio';
	import { addXP } from '$lib/utils/xp';
	import type { WordRecord, CustomDeck } from '$lib/types';
	import {
		RotateCcw,
		Flame,
		Trophy,
		Sparkles,
		ArrowRight,
		Play,
		Timer,
		Zap,
		Award,
		Volume2,
		Eye,
		Layers,
		CheckCircle2,
		AlertCircle
	} from 'lucide-svelte';

	type GamePhase = 'lobby' | 'countdown' | 'playing' | 'summary';

	interface MatchTile {
		id: string; // unique tile id
		pairId: string; // shared pair id
		type: 'term' | 'meaning';
		text: string;
		subtext?: string;
		isFlipped: boolean;
		isMatched: boolean;
		isMismatch: boolean;
		isHinted: boolean;
	}

	interface DeckOption {
		id: string;
		title: string;
		language: 'chinese' | 'french';
		count?: number;
		isCustom?: boolean;
	}

	// Game Lifecycle State
	let phase = $state<GamePhase>('lobby');
	let availableDecks = $state<DeckOption[]>([]);
	let selectedDeckId = $state<string>('');
	let activeWordPool = $state<WordRecord[]>([]);
	let currentDeckLanguage = $state<'chinese' | 'french'>('chinese');

	// Active Wave & Board State
	let waveNumber = $state(1);
	let tiles = $state<MatchTile[]>([]);
	let selectedTileIds = $state<string[]>([]);
	let isBoardLocked = $state(false);

	// Timers & Metrics
	let roundTimeLeft = $state(45);
	let countdownValue = $state(3);
	let score = $state(0);
	let combo = $state(0);
	let maxCombo = $state(0);
	let correctMatches = $state(0);
	let wrongMatches = $state(0);
	let comboShieldAvailable = $state(true); // Beginner-friendly grace shield
	let isFrenzy = $state(false);
	let earnedXP = $state(0);
	let isNewHighScore = $state(false);
	let summaryRecord = $state<GameScoreRecord | null>(null);

	// Idle hint timer tracking
	let lastActionTime = $state(Date.now());
	let idleHintInterval: ReturnType<typeof setInterval> | null = null;
	let gameTimer: ReturnType<typeof setInterval> | null = null;
	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

	let particleCanvasRef = $state<ParticleCanvas | null>(null);

	let highScore = $derived(getGameHighScore('match-blitz'));

	// Wave Difficulty Progression
	let pairsInCurrentWave = $derived.by(() => {
		if (waveNumber === 1) return 3; // 6 tiles (2x3 grid)
		if (waveNumber === 2) return 4; // 8 tiles (2x4 grid)
		return 6; // 12 tiles (3x4 or 4x3 grid)
	});

	let isAudioBlindWave = $derived(waveNumber >= 4 && waveNumber % 3 === 0);

	let rankGrade = $derived.by<{ tier: 'S' | 'A' | 'B' | 'C'; label: string; color: string }>(() => {
		if (!summaryRecord) return { tier: 'B', label: 'Great Focus', color: 'text-indigo-600' };
		const acc = summaryRecord.accuracy;
		const sc = summaryRecord.score;
		if (acc >= 90 && sc >= 2000)
			return { tier: 'S', label: 'Lightning Matcher', color: 'text-amber-500' };
		if (acc >= 80 && sc >= 1200)
			return { tier: 'A', label: 'Sharpshooter', color: 'text-indigo-600' };
		if (acc >= 65) return { tier: 'B', label: 'Quick Thinker', color: 'text-emerald-600' };
		return { tier: 'C', label: 'Apprentice', color: 'text-slate-600' };
	});

	async function loadDecks() {
		try {
			const options: DeckOption[] = [];

			// 1. Built-in Packs
			const zhPacks = await getBuiltinPacks('chinese');
			for (const pack of zhPacks) {
				options.push({
					id: pack.id,
					title: pack.title || `Chinese Pack ${pack.id}`,
					language: 'chinese',
					count: pack.words?.length || 0
				});
			}

			const frPacks = await getBuiltinPacks('french');
			for (const pack of frPacks) {
				options.push({
					id: pack.id,
					title: pack.title || `French Pack ${pack.id}`,
					language: 'french',
					count: pack.words?.length || 0
				});
			}

			// 2. Custom Decks
			const customDecks = await getAllCustomDecks();
			for (const cd of customDecks) {
				if (cd.words && cd.words.length >= 6) {
					options.push({
						id: `custom_${cd.id}`,
						title: cd.name,
						language: cd.language || 'chinese',
						count: cd.words.length,
						isCustom: true
					});
				}
			}

			// 3. Saved Words Deck
			const savedWords = await getAllSavedWords();
			if (savedWords && savedWords.length >= 6) {
				options.push({
					id: 'saved_words_deck',
					title: `Saved Favorites (${savedWords.length})`,
					language: 'chinese',
					count: savedWords.length
				});
			}

			availableDecks = options;
			if (options.length > 0 && !selectedDeckId) {
				selectedDeckId = options[0].id;
			}
		} catch (err) {
			console.error('Failed to load decks for Match Blitz:', err);
		}
	}

	async function getWordsForSelectedDeck(): Promise<WordRecord[]> {
		if (!selectedDeckId) return [];

		if (selectedDeckId === 'saved_words_deck') {
			const saved = await getAllSavedWords();
			const words: WordRecord[] = [];
			for (const sw of saved.slice(0, 50)) {
				const packWords = await getPackWords('chinese', sw.weekId);
				const matched = packWords.find((w) => w.No === sw.wordNo);
				if (matched) words.push(matched);
			}
			return words;
		}

		if (selectedDeckId.startsWith('custom_')) {
			const customId = selectedDeckId.replace('custom_', '');
			const allCustom = await getAllCustomDecks();
			const found = allCustom.find((d) => d.id === customId);
			return found ? found.words : [];
		}

		const selectedDeck = availableDecks.find((d) => d.id === selectedDeckId);
		const lang = selectedDeck?.language || 'chinese';
		currentDeckLanguage = lang;
		return await getPackWords(lang, selectedDeckId);
	}

	function shuffleArray<T>(arr: T[]): T[] {
		const copy = [...arr];
		for (let i = copy.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function spawnWave() {
		if (activeWordPool.length === 0) return;

		// Select pairs for current wave
		const numPairs = pairsInCurrentWave;
		const shuffledPool = shuffleArray(activeWordPool);
		const selectedWords = shuffledPool.slice(0, numPairs);

		const newTiles: MatchTile[] = [];

		selectedWords.forEach((word, idx) => {
			const pairId = `pair-${waveNumber}-${idx}-${word.No}`;
			const term =
				currentDeckLanguage === 'chinese' ? word['Chinese Word'] || '' : word['French Word'] || '';
			const subtext = currentDeckLanguage === 'chinese' ? word.Pinyin : undefined;
			const meaning = word['English Meaning'] || '';

			// Term Card
			newTiles.push({
				id: `tile-term-${pairId}`,
				pairId,
				type: 'term',
				text: term,
				subtext,
				isFlipped: false,
				isMatched: false,
				isMismatch: false,
				isHinted: false
			});

			// Meaning Card
			newTiles.push({
				id: `tile-meaning-${pairId}`,
				pairId,
				type: 'meaning',
				text: meaning,
				isFlipped: false,
				isMatched: false,
				isMismatch: false,
				isHinted: false
			});
		});

		tiles = shuffleArray(newTiles);
		selectedTileIds = [];
		isBoardLocked = false;
		lastActionTime = Date.now();
	}

	function startCountdown() {
		phase = 'countdown';
		countdownValue = 3;

		countdownTimer = setInterval(() => {
			countdownValue--;
			if (countdownValue <= 0) {
				if (countdownTimer) clearInterval(countdownTimer);
				startGameplay();
			}
		}, 850);
	}

	async function startNewGame() {
		cleanupTimers();
		stopSpeech();

		activeWordPool = await getWordsForSelectedDeck();
		if (activeWordPool.length < 3) {
			alert('Selected pack requires at least 3 vocabulary words to play.');
			return;
		}

		score = 0;
		combo = 0;
		maxCombo = 0;
		correctMatches = 0;
		wrongMatches = 0;
		comboShieldAvailable = true;
		isFrenzy = false;
		waveNumber = 1;
		roundTimeLeft = 45;
		isNewHighScore = false;
		summaryRecord = null;

		startCountdown();
	}

	function startGameplay() {
		phase = 'playing';
		spawnWave();

		// Main round countdown
		gameTimer = setInterval(() => {
			roundTimeLeft--;

			if (roundTimeLeft === 10) {
				playHeartbeatWarning();
			} else if (roundTimeLeft <= 5 && roundTimeLeft > 0) {
				playHeartbeatWarning();
			}

			if (roundTimeLeft <= 0) {
				endGame();
			}
		}, 1000);

		// Idle hint detector (runs every 1s)
		idleHintInterval = setInterval(() => {
			if (phase !== 'playing' || isBoardLocked) return;
			const idleSeconds = (Date.now() - lastActionTime) / 1000;
			if (idleSeconds >= 6) {
				triggerIdleHint();
			}
		}, 1000);
	}

	function triggerIdleHint() {
		const unmatched = tiles.filter((t) => !t.isMatched);
		if (unmatched.length === 0) return;
		const targetPairId = unmatched[0].pairId;
		tiles = tiles.map((t) => (t.pairId === targetPairId ? { ...t, isHinted: true } : t));
	}

	function clearHints() {
		tiles = tiles.map((t) => (t.isHinted ? { ...t, isHinted: false } : t));
	}

	async function handleTileSelect(tileId: string, event: MouseEvent | KeyboardEvent) {
		if (isBoardLocked || phase !== 'playing') return;

		const tileIndex = tiles.findIndex((t) => t.id === tileId);
		if (tileIndex === -1) return;
		const tile = tiles[tileIndex];

		if (tile.isFlipped || tile.isMatched) return;

		lastActionTime = Date.now();
		clearHints();

		// Flip card
		playMatchFlip();
		tiles[tileIndex] = { ...tile, isFlipped: true };
		selectedTileIds = [...selectedTileIds, tileId];

		// Play pronunciation if audio mode or term tile
		if (tile.type === 'term') {
			speakWord(tile.text, currentDeckLanguage);
		}

		// Check if two cards are flipped
		if (selectedTileIds.length === 2) {
			isBoardLocked = true;
			const [firstId, secondId] = selectedTileIds;
			const firstTile = tiles.find((t) => t.id === firstId)!;
			const secondTile = tiles.find((t) => t.id === secondId)!;

			if (firstTile.pairId === secondTile.pairId) {
				// MATCH SUCCESS!
				correctMatches++;
				combo++;
				if (combo > maxCombo) maxCombo = combo;

				const comboMultiplier = combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
				if (combo === 3 && !isFrenzy) {
					isFrenzy = true;
					playFrenzyIgnite();
				}

				const basePoints = 100 * comboMultiplier;
				score += basePoints;

				// Add bonus time (+2s per match, +3s during frenzy)
				roundTimeLeft = Math.min(60, roundTimeLeft + (isFrenzy ? 3 : 2));

				playMatchSuccess(combo);

				// Particle FX
				if (particleCanvasRef && 'clientX' in event) {
					particleCanvasRef.spawnBurst(event.clientX, event.clientY, 20, isFrenzy);
				}

				setTimeout(() => {
					tiles = tiles.map((t) =>
						t.id === firstId || t.id === secondId ? { ...t, isMatched: true, isFlipped: true } : t
					);
					selectedTileIds = [];
					isBoardLocked = false;

					// Check if wave is fully cleared
					const remaining = tiles.filter((t) => !t.isMatched);
					if (remaining.length === 0) {
						handleWaveCleared();
					}
				}, 260);
			} else {
				// MISMATCH
				wrongMatches++;
				playMatchMismatch();

				if (comboShieldAvailable) {
					// Consume grace shield instead of resetting combo
					comboShieldAvailable = false;
				} else {
					combo = 0;
					isFrenzy = false;
				}

				// Trigger shake animation on mismatched tiles
				tiles = tiles.map((t) =>
					t.id === firstId || t.id === secondId ? { ...t, isMismatch: true } : t
				);

				setTimeout(() => {
					tiles = tiles.map((t) =>
						t.id === firstId || t.id === secondId
							? { ...t, isFlipped: false, isMismatch: false }
							: t
					);
					selectedTileIds = [];
					isBoardLocked = false;
				}, 650);
			}
		}
	}

	function handleWaveCleared() {
		waveNumber++;
		comboShieldAvailable = true; // Refresh shield for new wave
		roundTimeLeft = Math.min(60, roundTimeLeft + 5); // Wave completion bonus time

		setTimeout(() => {
			spawnWave();
		}, 300);
	}

	async function endGame() {
		cleanupTimers();
		stopSpeech();
		phase = 'summary';

		const totalAttempts = correctMatches + wrongMatches;
		const accuracy = totalAttempts > 0 ? Math.round((correctMatches / totalAttempts) * 100) : 0;

		// Calculate XP (Base + Accuracy bonus + Combo bonus)
		earnedXP = Math.round(correctMatches * 5 + (accuracy >= 80 ? 25 : 10) + maxCombo * 3);
		if (earnedXP > 0) {
			addXP(earnedXP);
		}

		isNewHighScore = score > highScore && score > 0;

		const rec = await saveGameScore({
			gameId: 'match-blitz',
			gameName: 'Match Blitz',
			score,
			correct: correctMatches,
			wrong: wrongMatches,
			accuracy,
			maxCombo,
			mode: 'visual'
		});

		summaryRecord = rec;
	}

	function cleanupTimers() {
		if (gameTimer) {
			clearInterval(gameTimer);
			gameTimer = null;
		}
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
		if (idleHintInterval) {
			clearInterval(idleHintInterval);
			idleHintInterval = null;
		}
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
	}

	onMount(() => {
		loadDecks();
	});

	onDestroy(() => {
		cleanupTimers();
		stopSpeech();
	});
</script>

<svelte:head>
	<title>Match Blitz - Fast 3D Vocabulary Matching Game</title>
</svelte:head>

<div
	class="relative flex min-h-screen flex-col overflow-hidden text-slate-900 selection:bg-indigo-500 selection:text-white"
>
	<TopHeader title="Match Blitz" showBack={true} />

	<!-- Vibrant Daytime Arcade Background Image & Soft Mask (High Visibility) -->
	<div class="pointer-events-none absolute inset-0 z-0">
		<img
			src="/images/match-blitz-bg.jpg"
			alt="Match Blitz Arcade Arena"
			class="h-full w-full object-cover object-top opacity-90"
		/>
		<div
			class="absolute inset-0 bg-linear-to-b from-sky-100/25 via-transparent to-sky-100/35 backdrop-blur-[0.5px]"
		></div>
	</div>

	<main class="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-3 pb-8">
		<!-- PARTICLE OVERLAY FOR 3D MATCH BURSTS -->
		<ParticleCanvas bind:this={particleCanvasRef} />

		{#if phase === 'lobby'}
			<!-- LOBBY & DECK SELECTION -->
			<div class="flex flex-1 flex-col justify-between py-2">
				<div class="space-y-4">
					<!-- Hero Banner -->
					<div
						class="relative overflow-hidden rounded-3xl border border-white/60 bg-linear-to-br from-sky-400 via-indigo-500 to-indigo-600 p-6 text-white shadow-xl shadow-indigo-600/15"
					>
						<div
							class="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/20 blur-xl"
						></div>
						<div class="relative z-10 flex items-center justify-between">
							<div>
								<div
									class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md"
								>
									<Sparkles class="h-3.5 w-3.5 text-amber-300" />
									<span>3D Tile Match Arena</span>
								</div>
								<h1 class="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-xs">
									Match Blitz
								</h1>
								<p class="mt-1 text-xs font-medium text-sky-100">
									Flip, match, and chain combos before the timer strikes zero!
								</p>
							</div>
							<div
								class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/25 text-white shadow-inner backdrop-blur-md"
							>
								<Zap class="h-7 w-7 fill-amber-300 text-amber-300 drop-shadow-xs" />
							</div>
						</div>

						<!-- Best Score Badge -->
						{#if highScore > 0}
							<div
								class="mt-4 flex items-center gap-2 rounded-xl bg-black/15 px-3 py-2 text-xs font-bold text-amber-200 backdrop-blur-xs"
							>
								<Trophy class="h-4 w-4 text-amber-400" />
								<span>Best Score: {highScore.toLocaleString()} pts</span>
							</div>
						{/if}
					</div>

					<!-- Deck Selector with Glassmorphic Card Finish -->
					<div
						class="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-lg shadow-sky-950/5 backdrop-blur-xl"
					>
						<div class="mb-2.5 flex items-center justify-between">
							<label
								for="deck-select"
								class="block text-xs font-extrabold tracking-wider text-slate-600 uppercase"
							>
								Vocabulary Deck
							</label>
							{#if availableDecks.length > 0}
								<span
									class="rounded-full border border-indigo-100/80 bg-indigo-50/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 backdrop-blur-xs"
								>
									{availableDecks.length} available
								</span>
							{/if}
						</div>

						{#if availableDecks.length > 0}
							<div class="relative">
								<select
									id="deck-select"
									bind:value={selectedDeckId}
									class="w-full cursor-pointer appearance-none rounded-2xl border-2 border-white/80 bg-white/75 py-3.5 pr-11 pl-4 text-sm font-bold text-slate-800 shadow-2xs backdrop-blur-xs transition-all hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
								>
									{#each availableDecks as deck}
										<option value={deck.id}>
											{deck.title}
											{deck.count ? `(${deck.count} words)` : ''}
										</option>
									{/each}
								</select>
								<div
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-500"
								>
									<Layers class="h-5 w-5" />
								</div>
							</div>
						{:else}
							<div
								class="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3.5 text-xs font-semibold text-amber-800 backdrop-blur-xs"
							>
								<AlertCircle class="h-4 w-4 shrink-0 text-amber-600" />
								<span>Loading available vocabulary decks...</span>
							</div>
						{/if}
					</div>

					<!-- Enhanced Pastel Glass Info Cards -->
					<div class="grid grid-cols-3 gap-2.5 text-center">
						<div
							class="rounded-2xl border border-white/60 bg-linear-to-b from-white/70 via-indigo-50/40 to-purple-50/30 p-3.5 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div
								class="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100/80 text-indigo-600 shadow-2xs"
							>
								<Sparkles class="h-4 w-4" />
							</div>
							<div class="text-xs font-black text-slate-800">3D Flip</div>
							<div class="mt-0.5 text-[10px] font-semibold text-slate-500">Tap cards to reveal</div>
						</div>

						<div
							class="rounded-2xl border border-white/60 bg-linear-to-b from-white/70 via-amber-50/40 to-orange-50/30 p-3.5 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div
								class="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 shadow-2xs"
							>
								<Flame class="h-4 w-4 fill-amber-500" />
							</div>
							<div class="text-xs font-black text-slate-800">Combos</div>
							<div class="mt-0.5 text-[10px] font-semibold text-slate-500">Chain for frenzy</div>
						</div>

						<div
							class="rounded-2xl border border-white/60 bg-linear-to-b from-white/70 via-emerald-50/40 to-teal-50/30 p-3.5 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div
								class="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 shadow-2xs"
							>
								<Timer class="h-4 w-4" />
							</div>
							<div class="text-xs font-black text-slate-800">+Time</div>
							<div class="mt-0.5 text-[10px] font-semibold text-slate-500">Matches add secs</div>
						</div>
					</div>
				</div>

				<!-- Start Game Button -->
				<button
					type="button"
					class="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-98"
					onclick={startNewGame}
				>
					<Play class="h-5 w-5 fill-white" />
					<span>Start Match Blitz</span>
				</button>
			</div>
		{:else if phase === 'countdown'}
			<!-- 2. COUNTDOWN SCREEN (Identical to Number Rush) -->
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
					Flip and match character pairs before time expires!
				</p>
			</div>
		{:else if phase === 'playing'}
			<!-- ACTIVE GAME ARENA (Frosted Glass Shell) -->
			<div
				class="flex flex-1 flex-col justify-between rounded-3xl border border-white/70 bg-white/45 p-4 shadow-xl shadow-sky-950/10 backdrop-blur-xl"
			>
				<!-- Top HUD -->
				<div class="space-y-2.5">
					<div class="flex items-center justify-between">
						<!-- Wave & Frenzy Tag -->
						<div class="flex items-center gap-2">
							<span
								class="rounded-xl border border-indigo-200/80 bg-white/80 px-3 py-1 text-xs font-black text-indigo-700 shadow-2xs backdrop-blur-xs"
							>
								Wave {waveNumber}
							</span>
							{#if isFrenzy}
								<span
									class="inline-flex animate-pulse items-center gap-1 rounded-xl bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-xs"
								>
									<Flame class="h-3.5 w-3.5 fill-white" />
									<span>BLITZ FRENZY</span>
								</span>
							{/if}
						</div>

						<!-- Score HUD -->
						<div class="text-right">
							<div class="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
								Score
							</div>
							<div class="text-xl font-black tracking-tight text-slate-900">
								{score.toLocaleString()}
							</div>
						</div>
					</div>

					<!-- Timer & Combo Bar -->
					<div class="flex items-center gap-3">
						<!-- Timer Progress Bar -->
						<div class="relative flex-1">
							<div
								class="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-600"
							>
								<span class="flex items-center gap-1">
									<Timer
										class="h-3.5 w-3.5 {roundTimeLeft <= 10
											? 'animate-pulse text-rose-500'
											: 'text-slate-500'}"
									/>
									<span>Time Left</span>
								</span>
								<span class={roundTimeLeft <= 10 ? 'font-black text-rose-600' : 'text-slate-800'}>
									{roundTimeLeft}s
								</span>
							</div>
							<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60 backdrop-blur-xs">
								<div
									class="h-full rounded-full transition-all duration-300 {roundTimeLeft <= 10
										? 'animate-pulse bg-rose-500'
										: roundTimeLeft <= 20
											? 'bg-amber-500'
											: 'bg-indigo-600'}"
									style="width: {Math.min(100, (roundTimeLeft / 45) * 100)}%"
								></div>
							</div>
						</div>

						<!-- Combo Badge -->
						{#if combo >= 2}
							<div
								class="flex animate-bounce items-center gap-1 rounded-xl border border-amber-200/90 bg-amber-50/90 px-3 py-1.5 text-amber-800 shadow-xs backdrop-blur-xs"
							>
								<Flame class="h-4 w-4 fill-amber-500 text-amber-500" />
								<span class="text-xs font-black">{combo}x Streak</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- 3D CARDS BOARD -->
				<div class="my-auto py-3">
					<div
						class="grid gap-2.5 {pairsInCurrentWave === 3
							? 'grid-cols-2 sm:grid-cols-3'
							: pairsInCurrentWave === 4
								? 'grid-cols-2 sm:grid-cols-4'
								: 'grid-cols-3 sm:grid-cols-4'}"
					>
						{#each tiles as tile (tile.id)}
							<MatchBlitzCard
								id={tile.id}
								type={tile.type}
								text={tile.text}
								subtext={tile.subtext}
								isFlipped={tile.isFlipped}
								isMatched={tile.isMatched}
								isMismatch={tile.isMismatch}
								isHinted={tile.isHinted}
								isAudioBlind={isAudioBlindWave}
								disabled={isBoardLocked}
								onSelect={handleTileSelect}
							/>
						{/each}
					</div>
				</div>

				<!-- Bottom Action Bar / Hint Info -->
				<div
					class="flex items-center justify-between border-t border-white/50 pt-1.5 text-xs font-semibold text-slate-600"
				>
					<span>
						{#if comboShieldAvailable}
							🛡️ Streak Shield active
						{:else}
							⚡ Fast match keeps streak
						{/if}
					</span>
					<button
						type="button"
						class="cursor-pointer font-bold text-slate-500 transition-colors hover:text-slate-800"
						onclick={endGame}
					>
						End Round
					</button>
				</div>
			</div>
		{:else if phase === 'summary'}
			<!-- GAME OVER / SUMMARY REPORT -->
			<div class="flex flex-1 flex-col justify-between py-2">
				<div class="space-y-4">
					<!-- Hero Rating Card -->
					<div
						class="rounded-3xl border border-white/70 bg-white/65 p-6 text-center shadow-xl shadow-sky-950/5 backdrop-blur-xl"
					>
						<div
							class="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/90 text-indigo-600 shadow-inner"
						>
							<Award class="h-8 w-8" />
						</div>

						<div
							class="mt-3 inline-block rounded-full border border-indigo-100 bg-indigo-50/90 px-3 py-1 text-xs font-extrabold text-indigo-700"
						>
							Tier {rankGrade.tier} • {rankGrade.label}
						</div>

						<div class="mt-2 text-3xl font-black tracking-tight text-slate-900">
							{score.toLocaleString()} <span class="text-base font-bold text-slate-500">pts</span>
						</div>

						{#if isNewHighScore}
							<div
								class="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-black text-amber-700 backdrop-blur-xs"
							>
								<Sparkles class="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
								<span>NEW HIGH SCORE!</span>
							</div>
						{/if}
					</div>

					<!-- Metrics Grid -->
					<div class="grid grid-cols-2 gap-2.5">
						<div
							class="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div class="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
								Wave Reached
							</div>
							<div class="mt-1 text-xl font-black text-slate-800">Wave {waveNumber}</div>
						</div>

						<div
							class="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div class="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
								Max Combo
							</div>
							<div class="mt-1 text-xl font-black text-amber-600">{maxCombo}x</div>
						</div>

						<div
							class="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div class="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
								Accuracy
							</div>
							<div class="mt-1 text-xl font-black text-emerald-600">
								{correctMatches + wrongMatches > 0
									? Math.round((correctMatches / (correctMatches + wrongMatches)) * 100)
									: 0}%
							</div>
						</div>

						<div
							class="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-md shadow-sky-950/5 backdrop-blur-xl"
						>
							<div class="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
								XP Earned
							</div>
							<div class="mt-1 text-xl font-black text-indigo-600">+{earnedXP} XP</div>
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="mt-6 flex flex-col gap-2.5">
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-98"
						onclick={startNewGame}
					>
						<RotateCcw class="h-5 w-5" />
						<span>Play Again</span>
					</button>

					<a
						href={resolve('/games')}
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-white/70 bg-white/65 py-3.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/85"
					>
						<span>Back to Games Hub</span>
					</a>
				</div>
			</div>
		{/if}
	</main>
</div>
