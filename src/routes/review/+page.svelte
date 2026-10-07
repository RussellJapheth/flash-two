<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import HalfwayToast from '$lib/components/HalfwayToast.svelte';
	import StudyTimer from '$lib/components/StudyTimer.svelte';
	import { triggerAutoStartStudyTimer, triggerAutoStopStudyTimer } from '$lib/utils/studyTimer';
	import { onMount, onDestroy } from 'svelte';
	import {
		getAllProgress,
		getWordProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		saveProgress,
		isWordSaved,
		toggleSavedWord,
		getSavedLanguage
	} from '$lib/utils/storage';
	import { calculateNextReview, isCardDue } from '$lib/utils/srs';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { playSound } from '$lib/utils/audio';
	import { calculateReviewXP, calculateSessionBonus, addXP } from '$lib/utils/xp';
	import type { WordRecord, WordProgress, StudyRating } from '$lib/types';
	import { X, Brain, Flame, CircleCheckBig, Sparkles, Volume2, Clock } from 'lucide-svelte';

	interface ReviewItem {
		packId: string;
		deckName: string;
		word: WordRecord;
		language: 'chinese' | 'french';
	}

	let items = $state<ReviewItem[]>([]);
	let allProgress = $state<Record<string, WordProgress>>({});
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isCurrentSaved = $state(false);
	let isAdvancing = $state(false);
	let activeLanguage = $state<'chinese' | 'french'>('chinese');

	// Active recall mode toggles
	let isAudioFirst = $state(false);
	let isTimedSprint = $state(false);
	let sprintSecondsRemaining = $state(5);
	let timerInterval: ReturnType<typeof setInterval> | undefined;

	// Session metrics
	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);
	let sessionEarnedXP = $state(0);
	let halfwayTriggered = $state(false);
	let showHalfwayToast = $state(false);
	let halfwayToastTimer: ReturnType<typeof setTimeout> | undefined;
	let isSessionFinished = $state(false);

	let currentItem = $derived(items[currentIndex]);
	let currentProgress = $derived(
		currentItem
			? getWordProgress(allProgress, currentItem.packId, currentItem.word.No, currentItem.language)
			: undefined
	);
	let progressCount = $derived(items.length > 0 ? currentIndex + 1 : 0);
	let sessionAccuracy = $derived(
		sessionCorrect + sessionWrong > 0
			? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
			: 100
	);

	function startSprintTimer() {
		stopSprintTimer();
		if (!isTimedSprint || isFlipped || isSessionFinished || !currentItem) return;
		sprintSecondsRemaining = 5;
		timerInterval = setInterval(() => {
			if (sprintSecondsRemaining > 1) {
				sprintSecondsRemaining--;
			} else {
				stopSprintTimer();
				sprintSecondsRemaining = 0;
				if (!isFlipped && !isAdvancing) {
					playSound('wrong');
					isFlipped = true;
				}
			}
		}, 1000);
	}

	function stopSprintTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = undefined;
		}
	}

	$effect(() => {
		if (currentIndex >= 0 && items.length > 0) {
			if (isFlipped) {
				stopSprintTimer();
			} else if (isTimedSprint && !isSessionFinished) {
				startSprintTimer();
			}
		}
	});

	/**
	 * Interleaved stratified shuffle: mixes cards across different decks so user
	 * doesn't review cards from only one deck sequentially.
	 */
	function interleaveDecks(dueItems: ReviewItem[]): ReviewItem[] {
		const byDeck: Record<string, ReviewItem[]> = {};
		for (const item of dueItems) {
			if (!byDeck[item.packId]) byDeck[item.packId] = [];
			byDeck[item.packId].push(item);
		}

		// Shuffle cards within each deck bucket first
		const deckKeys = Object.keys(byDeck);
		for (const key of deckKeys) {
			for (let i = byDeck[key].length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[byDeck[key][i], byDeck[key][j]] = [byDeck[key][j], byDeck[key][i]];
			}
		}

		// Interleave round-robin across decks
		const result: ReviewItem[] = [];
		let added = true;
		let idx = 0;
		while (added) {
			added = false;
			for (const key of deckKeys) {
				if (idx < byDeck[key].length) {
					result.push(byDeck[key][idx]);
					added = true;
				}
			}
			idx++;
		}
		return result;
	}

	async function loadDueCards() {
		stopSprintTimer();
		activeLanguage = getSavedLanguage();
		const progress = await getAllProgress();
		allProgress = progress;

		const packs = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		const matchingCustom = customDecks.filter((d) => !d.language || d.language === activeLanguage);

		const dueItems: ReviewItem[] = [];

		// Built-in packs
		for (const pack of packs) {
			for (const word of pack.words) {
				const p = getWordProgress(progress, pack.id, word.No, activeLanguage);
				if (!p || isCardDue(p)) {
					dueItems.push({
						packId: pack.id,
						deckName: pack.title || `HSK ${pack.id}`,
						word,
						language: activeLanguage
					});
				}
			}
		}

		// Custom decks
		for (const deck of matchingCustom) {
			for (const word of deck.words) {
				const p = getWordProgress(progress, deck.id, word.No, deck.language || activeLanguage);
				if (!p || isCardDue(p)) {
					dueItems.push({
						packId: deck.id,
						deckName: deck.name || 'Custom Deck',
						word,
						language: (deck.language as 'chinese' | 'french') || activeLanguage
					});
				}
			}
		}

		// Apply interleaved stratified shuffle across decks
		items = interleaveDecks(dueItems);
		currentIndex = 0;
		isFlipped = false;
		isAdvancing = false;
		sessionCorrect = 0;
		sessionWrong = 0;
		sessionEarnedXP = 0;
		isSessionFinished = false;

		if (items.length > 0) {
			await updateSavedStatus();
			triggerAutoStartStudyTimer();
			if (isTimedSprint) startSprintTimer();
		}
	}

	async function updateSavedStatus() {
		if (!currentItem) return;
		isCurrentSaved = await isWordSaved(currentItem.packId, currentItem.word.No);
	}

	async function handleToggleSave() {
		if (!currentItem) return;
		isCurrentSaved = await toggleSavedWord(currentItem.packId, currentItem.word.No);
		scheduleDebouncedSync();
	}

	function handleFlipCard() {
		if (isAdvancing) return;
		isFlipped = !isFlipped;
	}

	async function handleRate(rating: StudyRating, customDays?: number) {
		if (isAdvancing || !currentItem) return;

		const currentProgress = getWordProgress(
			allProgress,
			currentItem.packId,
			currentItem.word.No,
			currentItem.language
		);
		const updated = calculateNextReview(currentProgress, rating, customDays);
		updated.weekId = currentItem.packId;
		updated.wordNo = currentItem.word.No;

		await saveProgress(updated);
		const key = `${currentItem.packId}:${currentItem.word.No}`;
		allProgress[key] = updated;
		scheduleDebouncedSync();

		const earned = calculateReviewXP('srs', rating);
		addXP(earned);
		sessionEarnedXP += earned;

		if (rating === 'again') {
			sessionWrong++;
		} else {
			sessionCorrect++;
		}

		const halfwayIndex = Math.floor(items.length / 2);
		if (!halfwayTriggered && items.length >= 4 && currentIndex + 1 === halfwayIndex) {
			halfwayTriggered = true;
			triggerHalfwayToast();
		}

		await advanceNextCard();
	}

	function triggerHalfwayToast() {
		playSound('milestone');
		showHalfwayToast = true;
		if (halfwayToastTimer) clearTimeout(halfwayToastTimer);
		halfwayToastTimer = setTimeout(() => {
			showHalfwayToast = false;
		}, 3000);
	}

	async function advanceNextCard() {
		if (isAdvancing) return;
		isAdvancing = true;

		try {
			if (currentIndex + 1 >= items.length) {
				const bonus = calculateSessionBonus('srs', items.length, sessionCorrect);
				if (bonus.totalBonus > 0) {
					addXP(bonus.totalBonus);
					sessionEarnedXP += bonus.totalBonus;
				}
				isSessionFinished = true;
				triggerAutoStopStudyTimer();
				playSound('milestone');
			} else {
				if (isFlipped) {
					isFlipped = false;
					await new Promise((r) => setTimeout(r, 250));
				}
				currentIndex++;
				isFlipped = false;
				await updateSavedStatus();
			}
		} finally {
			isAdvancing = false;
		}
	}

	onMount(() => {
		loadDueCards();
	});

	onDestroy(() => {
		if (halfwayToastTimer) clearTimeout(halfwayToastTimer);
		triggerAutoStopStudyTimer();
	});
</script>

<svelte:head>
	<title>Spaced Review — FlashCards</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-between bg-white">
	<header
		class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 shadow-xs backdrop-blur-md"
	>
		<button
			type="button"
			onclick={() => goto(resolve('/'))}
			aria-label="Exit Review Session"
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="font-headline text-sm font-bold text-slate-900">Spaced Review</h2>
			<span class="font-headline text-[11px] font-semibold text-slate-500">
				{progressCount} / {items.length} cards due
			</span>
		</div>

		<div class="flex items-center gap-1.5">
			<!-- Discreet Study Timer -->
			<StudyTimer compact={true} />

			<div
				class="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-headline text-xs font-bold text-indigo-700"
			>
				<Brain size={13} strokeWidth={2.25} />
				<span>{sessionAccuracy}%</span>
			</div>
		</div>
	</header>

	<div class="h-1.5 w-full overflow-hidden bg-slate-100">
		<div
			class="h-full bg-indigo-600 transition-all duration-300 ease-out"
			style="width: {items.length > 0 ? (progressCount / items.length) * 100 : 0}%"
		></div>
	</div>

	<main class="mx-auto flex w-full flex-1 flex-col justify-center px-4 py-4 sm:max-w-md">
		{#if isSessionFinished}
			<div
				class="shadow-card space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 text-center"
			>
				<div class="mx-auto flex h-24 w-24 items-center justify-center">
					<img
						src="/mascots/flame.png"
						alt="Celebration flame mascot"
						class="h-20 w-20 object-contain drop-shadow-md select-none"
					/>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-2">
					<div
						class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900"
					>
						<Flame size={13} strokeWidth={2.25} />
						<span>ALL DUE CARDS REVIEWED</span>
					</div>

					{#if sessionEarnedXP > 0}
						<div
							class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900 shadow-xs"
						>
							<Sparkles size={13} strokeWidth={2.25} class="text-amber-600" />
							<span>+{sessionEarnedXP} XP</span>
						</div>
					{/if}
				</div>

				<h2 class="font-headline text-2xl font-black text-slate-900">Inbox Zero!</h2>
				<p class="font-body text-xs text-slate-500">
					You're all caught up with your spaced repetition schedule.
				</p>

				<div class="grid grid-cols-2 gap-3 border-y border-slate-100 py-3">
					<div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-emerald-700">{sessionCorrect}</p>
						<p class="text-[11px] font-bold text-emerald-600">Correct Recall</p>
					</div>
					<div class="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-rose-700">{sessionWrong}</p>
						<p class="text-[11px] font-bold text-rose-600">Lapsed / Needs Review</p>
					</div>
				</div>

				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					Return to Dashboard
				</button>
			</div>
		{:else if currentItem}
			<div class="space-y-4">
				<!-- Active Recall Mode Toggle Bar -->
				<div class="flex items-center justify-center gap-2.5">
					<button
						type="button"
						onclick={() => (isAudioFirst = !isAudioFirst)}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-headline text-xs font-bold transition-all active:scale-95 {isAudioFirst
							? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-2xs'
							: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
					>
						<Volume2 size={13} strokeWidth={2.2} />
						<span>{isAudioFirst ? 'Audio-First ON' : 'Audio-First'}</span>
					</button>

					<button
						type="button"
						onclick={() => {
							isTimedSprint = !isTimedSprint;
							if (isTimedSprint) startSprintTimer();
							else stopSprintTimer();
						}}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 font-headline text-xs font-bold transition-all active:scale-95 {isTimedSprint
							? 'border-amber-300 bg-amber-50 text-amber-800 shadow-2xs'
							: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
					>
						<Clock size={13} strokeWidth={2.2} />
						<span>{isTimedSprint ? 'Timed 5s Sprint ON' : 'Timed 5s Sprint'}</span>
					</button>
				</div>

				<FlashCard
					word={currentItem.word}
					language={currentItem.language}
					{isFlipped}
					isSaved={isCurrentSaved}
					showPinyin={true}
					audioFirst={isAudioFirst}
					deckName={currentItem.deckName}
					timed={isTimedSprint}
					timeRemaining={sprintSecondsRemaining}
					onFlip={handleFlipCard}
					onToggleSave={handleToggleSave}
				/>

				<div
					class="transition-opacity {isFlipped && !isAdvancing
						? 'opacity-100'
						: 'pointer-events-none opacity-40'}"
				>
					<SRSButtons
						onRate={handleRate}
						disabled={!isFlipped || isAdvancing}
						progress={currentProgress}
					/>
				</div>
			</div>
		{:else}
			<div class="py-12 text-center text-slate-500">
				<CircleCheckBig size={44} strokeWidth={1.5} class="mb-2 inline-block text-emerald-500" />
				<h3 class="font-headline text-lg font-bold text-slate-900">No Due Cards</h3>
				<p class="mt-1 font-sans text-xs text-slate-400">
					You are completely up to date with your spaced repetition reviews.
				</p>
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="mt-4 cursor-pointer rounded-2xl bg-indigo-600 px-5 py-2.5 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
				>
					Back to Dashboard
				</button>
			</div>
		{/if}
	</main>
</div>

<HalfwayToast
	show={showHalfwayToast}
	title="Halfway Done!"
	subtitle="Conquered half your scheduled reviews • Keep going!"
	mascot="/mascots/flame.png"
/>
