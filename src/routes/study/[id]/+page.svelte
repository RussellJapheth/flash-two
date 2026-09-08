<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import MilestoneModal from '$lib/components/MilestoneModal.svelte';
	import { onMount, onDestroy } from 'svelte';
	import {
		getAllProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		saveProgress,
		isWordSaved,
		toggleSavedWord,
		recordRecentlyOpenedPack
	} from '$lib/utils/storage';

	import { calculateNextReview, isCardDue } from '$lib/utils/srs';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { playSound, speakWord } from '$lib/utils/audio';
	import type { WordRecord, WordProgress, StudyRating } from '$lib/types';
	import { X, Award, CheckCheck, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-svelte';

	let deckId = $derived(page.params.id || '');
	let studyMode = $derived((page.url.searchParams.get('mode') as 'srs' | 'all' | 'weak') || 'srs');
	let cardLimit = $derived(parseInt(page.url.searchParams.get('limit') || '20', 10));
	let showPinyinSetting = $derived(page.url.searchParams.get('pinyin') !== '0');
	let initialAutoplay = $derived(page.url.searchParams.get('autoplay') === '1');

	let deckTitle = $state('Study Session');
	let deckLanguage = $state<'chinese' | 'french'>('chinese');
	let cards = $state<WordRecord[]>([]);
	let allProgress = $state<Record<string, WordProgress>>({});
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isCurrentSaved = $state(false);

	// Session metrics
	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);
	let halfwayTriggered = $state(false);
	let showMilestoneModal = $state(false);
	let isSessionFinished = $state(false);

	// Autoplay state & options
	let isAutoplay = $state(false);
	let autoplaySpeed = $state<number>(2.5); // seconds
	let autoplayAutoSpeak = $state(true);
	let autoplayLoop = $state(false);
	let autoplayTimer: ReturnType<typeof setTimeout> | null = null;
	let autoplayAnimProgress = $state(0);
	let animInterval: ReturnType<typeof setInterval> | null = null;

	let currentWord = $derived(cards[currentIndex]);
	let currentProgress = $derived(
		currentWord ? allProgress[`${deckId}:${currentWord.No}`] : undefined
	);
	let progressCount = $derived(cards.length > 0 ? currentIndex + 1 : 0);
	let sessionAccuracy = $derived(
		sessionCorrect + sessionWrong > 0
			? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
			: 100
	);

	async function loadStudyDeck() {
		clearAutoplay();
		const progress = await getAllProgress();
		allProgress = progress;

		let rawWords: WordRecord[] = [];
		let title = 'Vocabulary Drill';
		let lang: 'chinese' | 'french' = 'chinese';

		if (deckId.startsWith('custom-')) {
			const customDecks = await getAllCustomDecks();
			const match = customDecks.find((d) => d.id === deckId);
			if (match) {
				rawWords = match.words;
				title = match.name;
				lang = match.language || 'chinese';
			}
		} else {
			const chPacks = await getBuiltinPacks('chinese');
			const chMatch = chPacks.find(
				(p) =>
					p.id === deckId || p.id === `chinese-${deckId}` || p.id.replace('chinese-', '') === deckId
			);
			if (chMatch) {
				rawWords = chMatch.words;
				title = chMatch.title;
				lang = 'chinese';
			} else {
				const frPacks = await getBuiltinPacks('french');
				const frMatch = frPacks.find(
					(p) =>
						p.id === deckId || p.id === `french-${deckId}` || p.id.replace('french-', '') === deckId
				);
				if (frMatch) {
					rawWords = frMatch.words;
					title = frMatch.title;
					lang = 'french';
				}
			}
		}

		deckTitle = title;
		deckLanguage = lang;
		if (deckId) {
			recordRecentlyOpenedPack(deckId);
		}

		// Filter cards by studyMode
		let filtered: WordRecord[];
		if (studyMode === 'weak') {
			filtered = rawWords.filter((w) => {
				const p =
					progress[`${deckId}:${w.No}`] ||
					progress[`${deckId.replace('chinese-', '').replace('french-', '')}:${w.No}`];
				return p && (p.wrong || 0) > 0;
			});
		} else if (studyMode === 'srs') {
			filtered = rawWords.filter((w) => {
				const p =
					progress[`${deckId}:${w.No}`] ||
					progress[`${deckId.replace('chinese-', '').replace('french-', '')}:${w.No}`];
				return !p || isCardDue(p);
			});
		} else {
			filtered = [...rawWords];
		}

		if (filtered.length === 0) {
			filtered = [...rawWords];
		}

		// Apply card limit if set
		if (cardLimit > 0 && filtered.length > cardLimit) {
			filtered = filtered.slice(0, cardLimit);
		}

		cards = filtered;
		currentIndex = 0;
		isFlipped = false;
		isSessionFinished = false;
		sessionCorrect = 0;
		sessionWrong = 0;

		if (cards.length > 0) {
			await updateSavedStatus();
			if (initialAutoplay) {
				startAutoplay();
			}
		}
	}

	async function updateSavedStatus() {
		if (!currentWord) return;
		isCurrentSaved = await isWordSaved(deckId, currentWord.No);
	}

	async function handleToggleSave() {
		if (!currentWord) return;
		isCurrentSaved = await toggleSavedWord(deckId, currentWord.No);
		scheduleDebouncedSync();
	}

	function handleFlipCard() {
		isFlipped = !isFlipped;
		if (isAutoplay) {
			scheduleAutoplayNextStep();
		}
	}

	async function handleRate(rating: StudyRating, customDays?: number) {
		if (!currentWord) return;

		const key = `${deckId}:${currentWord.No}`;
		const currentProgress = allProgress[key];
		const updated = calculateNextReview(currentProgress, rating, customDays);
		updated.weekId = deckId;
		updated.wordNo = currentWord.No;

		await saveProgress(updated);
		allProgress[key] = updated;
		scheduleDebouncedSync();

		if (rating === 'again') {
			sessionWrong++;
		} else {
			sessionCorrect++;
		}

		// Check for halfway milestone
		const halfwayIndex = Math.floor(cards.length / 2);
		if (
			!isAutoplay &&
			!halfwayTriggered &&
			cards.length >= 4 &&
			currentIndex + 1 === halfwayIndex
		) {
			halfwayTriggered = true;
			showMilestoneModal = true;
			return;
		}

		advanceNextCard();
	}

	function advanceNextCard() {
		if (currentIndex + 1 >= cards.length) {
			if (isAutoplay && autoplayLoop) {
				currentIndex = 0;
				isFlipped = false;
				updateSavedStatus();
				scheduleAutoplayNextStep();
			} else {
				clearAutoplay();
				isSessionFinished = true;
				playSound('milestone');
			}
		} else {
			currentIndex++;
			isFlipped = false;
			updateSavedStatus();
			if (isAutoplay) {
				scheduleAutoplayNextStep();
			}
		}
	}

	// ─── AUTOPLAY ENGINE ────────────────────────────────────────────────────────
	function clearAutoplay() {
		if (autoplayTimer) {
			clearTimeout(autoplayTimer);
			autoplayTimer = null;
		}
		if (animInterval) {
			clearInterval(animInterval);
			animInterval = null;
		}
		autoplayAnimProgress = 0;
	}

	function startAutoplay() {
		isAutoplay = true;
		scheduleAutoplayNextStep();
	}

	function pauseAutoplay() {
		isAutoplay = false;
		clearAutoplay();
	}

	function toggleAutoplay() {
		if (isAutoplay) {
			pauseAutoplay();
		} else {
			startAutoplay();
		}
	}

	function scheduleAutoplayNextStep() {
		clearAutoplay();
		if (!isAutoplay || isSessionFinished || !currentWord) return;

		const target =
			deckLanguage === 'chinese'
				? currentWord['Chinese Word'] || ''
				: currentWord['French Word'] || '';

		const totalMs = autoplaySpeed * 1000;
		const startTime = Date.now();

		if (!isFlipped) {
			// Front card: Speak target word automatically if audio enabled
			if (autoplayAutoSpeak && target) {
				speakWord(target, deckLanguage);
			}

			// Progress bar animation for front delay
			animInterval = setInterval(() => {
				const elapsed = Date.now() - startTime;
				autoplayAnimProgress = Math.min(100, Math.round((elapsed / totalMs) * 100));
			}, 50);

			autoplayTimer = setTimeout(() => {
				clearAutoplay();
				if (!isAutoplay) return;
				isFlipped = true;
				playSound('flip');
				scheduleAutoplayNextStep();
			}, totalMs);
		} else {
			// Back card: wait delay, then rate 'good' and advance
			animInterval = setInterval(() => {
				const elapsed = Date.now() - startTime;
				autoplayAnimProgress = Math.min(100, Math.round((elapsed / totalMs) * 100));
			}, 50);

			autoplayTimer = setTimeout(async () => {
				clearAutoplay();
				if (!isAutoplay) return;
				await handleRate('good');
			}, totalMs);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isSessionFinished || showMilestoneModal) return;

		if (e.key === 'p' || e.key === 'P') {
			e.preventDefault();
			toggleAutoplay();
			return;
		}

		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			handleFlipCard();
		} else if (isFlipped) {
			if (e.key === '1') handleRate('again');
			else if (e.key === '2') handleRate('hard');
			else if (e.key === '3') handleRate('good');
			else if (e.key === '4') handleRate('easy');
		}
	}

	onMount(() => {
		loadStudyDeck();
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			clearAutoplay();
		};
	});

	onDestroy(() => {
		clearAutoplay();
	});
</script>

<svelte:head>
	<title>Studying {deckTitle} — FlashCards</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-between bg-white">
	<!-- Top Session Bar -->
	<header
		class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-md"
	>
		<button
			type="button"
			onclick={() => {
				clearAutoplay();
				goto(resolve(`/deck/${deckId}/preview`));
			}}
			aria-label="Exit Study Session"
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="max-w-[170px] truncate font-headline text-sm font-bold text-slate-900">
				{deckTitle}
			</h2>
			<span class="font-headline text-[11px] font-semibold text-slate-500">
				{progressCount} / {cards.length} cards
			</span>
		</div>

		<!-- Autoplay & Accuracy Controls -->
		<div class="flex items-center gap-1.5">
			<!-- Autoplay Toggle Button -->
			<button
				type="button"
				onclick={toggleAutoplay}
				title={isAutoplay ? 'Pause hands-free autoplay' : 'Start hands-free autoplay'}
				class="flex h-8 items-center gap-1.5 rounded-full px-2.5 font-headline text-xs font-bold transition-all active:scale-95 {isAutoplay
					? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
					: 'border border-slate-200/90 bg-slate-50 text-slate-700 hover:bg-slate-100'}"
			>
				{#if isAutoplay}
					<Pause size={13} strokeWidth={2.5} class="fill-current" />
					<span>Auto</span>
				{:else}
					<Play size={13} strokeWidth={2.5} class="fill-current" />
					<span>Auto</span>
				{/if}
			</button>

			<div
				class="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 font-headline text-xs font-bold text-emerald-700"
			>
				<CheckCheck size={13} strokeWidth={2.25} />
				<span>{sessionAccuracy}%</span>
			</div>
		</div>
	</header>

	<!-- Linear Progress Bar -->
	<div class="relative h-1.5 w-full overflow-hidden bg-slate-100">
		<div
			class="h-full bg-indigo-600 transition-all duration-300 ease-out"
			style="width: {cards.length > 0 ? (progressCount / cards.length) * 100 : 0}%"
		></div>
		{#if isAutoplay}
			<!-- Micro animated step countdown bar -->
			<div
				class="absolute top-0 bottom-0 left-0 bg-amber-400 opacity-75 transition-all duration-75 ease-linear"
				style="width: {autoplayAnimProgress}%"
			></div>
		{/if}
	</div>

	<!-- Main Study Arena -->
	<main class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-4">
		{#if isSessionFinished}
			<!-- FINISHED SESSION SUMMARY -->
			<div
				class="shadow-card space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 text-center"
			>
				<div class="mx-auto flex h-24 w-24 items-center justify-center">
					<img
						src="/mascots/owl.png"
						alt="Celebration owl mascot"
						class="h-20 w-20 object-contain drop-shadow-md select-none"
					/>
				</div>

				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-headline text-xs font-bold text-indigo-700"
				>
					<Award size={13} strokeWidth={2.25} />
					<span>SESSION COMPLETED</span>
				</div>

				<h2 class="font-headline text-2xl font-black text-slate-900">Great Work!</h2>
				<p class="font-body text-xs text-slate-500">
					You completed all {cards.length} cards in this study run.
				</p>

				<div class="grid grid-cols-2 gap-3 border-y border-slate-100 py-3">
					<div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-emerald-700">{sessionCorrect}</p>
						<p class="text-[11px] font-bold text-emerald-600">Correct Recall</p>
					</div>
					<div class="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-rose-700">{sessionWrong}</p>
						<p class="text-[11px] font-bold text-rose-600">Needs Review</p>
					</div>
				</div>

				<div class="flex flex-col gap-2 pt-2">
					<button
						type="button"
						onclick={() => loadStudyDeck()}
						class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98]"
					>
						Study Again
					</button>
					<button
						type="button"
						onclick={() => goto(resolve('/'))}
						class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-100 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
					>
						Return to Dashboard
					</button>
				</div>
			</div>
		{:else if currentWord}
			<!-- ACTIVE FLASHCARD & CONTROLS -->
			<div class="space-y-4">
				<!-- Floating Autoplay Control Bar -->
				<div
					class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/90 px-3.5 py-2 shadow-xs"
				>
					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={toggleAutoplay}
							aria-label={isAutoplay ? 'Pause Autoplay' : 'Play Autoplay'}
							class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-all active:scale-95 {isAutoplay
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}"
						>
							{#if isAutoplay}
								<Pause size={15} strokeWidth={2.5} class="fill-current" />
							{:else}
								<Play size={15} strokeWidth={2.5} class="translate-x-0.5 fill-current" />
							{/if}
						</button>

						<div>
							<p class="font-headline text-xs font-bold text-slate-900">
								{isAutoplay ? 'Autoplaying Hands-Free' : 'Manual Study'}
							</p>
							<p class="font-sans text-[10px] text-slate-500">
								{isAutoplay
									? `${autoplaySpeed}s pace • ${autoplayAutoSpeak ? 'Voice on' : 'Voice off'}`
									: 'Tap card or spacebar to flip'}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-1">
						<!-- Autoplay Speed Toggle -->
						<button
							type="button"
							onclick={() => {
								if (autoplaySpeed === 1.5) autoplaySpeed = 2.5;
								else if (autoplaySpeed === 2.5) autoplaySpeed = 4;
								else autoplaySpeed = 1.5;
								if (isAutoplay) scheduleAutoplayNextStep();
							}}
							title="Cycle speed"
							class="cursor-pointer rounded-lg border border-slate-200/80 bg-white px-2 py-1 font-headline text-[10px] font-bold text-slate-700 hover:bg-slate-100"
						>
							{autoplaySpeed}s
						</button>

						<!-- Voice Auto-speak Toggle -->
						<button
							type="button"
							onclick={() => (autoplayAutoSpeak = !autoplayAutoSpeak)}
							title={autoplayAutoSpeak ? 'Auto-speak enabled' : 'Auto-speak muted'}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100"
						>
							{#if autoplayAutoSpeak}
								<Volume2 size={13} strokeWidth={2.25} />
							{:else}
								<VolumeX size={13} strokeWidth={2.25} />
							{/if}
						</button>

						<!-- Loop Toggle -->
						<button
							type="button"
							onclick={() => (autoplayLoop = !autoplayLoop)}
							title={autoplayLoop ? 'Loop mode ON' : 'Loop mode OFF'}
							class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 transition-colors {autoplayLoop
								? 'border-indigo-200 bg-indigo-100 text-indigo-700'
								: 'bg-white text-slate-400 hover:bg-slate-100'}"
						>
							<RotateCcw size={12} strokeWidth={2.25} />
						</button>
					</div>
				</div>

				<FlashCard
					word={currentWord}
					language={deckLanguage}
					{isFlipped}
					isSaved={isCurrentSaved}
					showPinyin={showPinyinSetting}
					onFlip={handleFlipCard}
					onToggleSave={handleToggleSave}
				/>

				<!-- SRS EVALUATION CONTROLS -->
				<div
					class="transition-opacity {isFlipped ? 'opacity-100' : 'pointer-events-none opacity-40'}"
				>
					<SRSButtons onRate={handleRate} disabled={!isFlipped} progress={currentProgress} />
				</div>
			</div>
		{:else}
			<div class="py-12 text-center text-slate-500">
				<p class="font-headline text-sm font-bold text-slate-800">
					No cards available in this set.
				</p>
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="mt-4 cursor-pointer rounded-2xl bg-indigo-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
				>
					Back to Home
				</button>
			</div>
		{/if}
	</main>
</div>

<!-- HALFWAY MILESTONE CELEBRATION MODAL -->
<MilestoneModal
	isOpen={showMilestoneModal}
	title="Halfway There!"
	subtitle="You're halfway through your cards with {sessionAccuracy}% accuracy. Keep the momentum going!"
	badgeText="HALFWAY MILESTONE"
	mascot="/mascots/owl.png"
	stats={{
		reviewed: currentIndex + 1,
		total: cards.length,
		accuracy: sessionAccuracy,
		correct: sessionCorrect,
		wrong: sessionWrong
	}}
	primaryActionText="Keep Going"
	secondaryActionText="Take a Break"
	onPrimaryAction={() => {
		showMilestoneModal = false;
		advanceNextCard();
	}}
	onSecondaryAction={() => {
		showMilestoneModal = false;
		goto(resolve('/'));
	}}
/>
