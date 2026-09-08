<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import MilestoneModal from '$lib/components/MilestoneModal.svelte';
	import { onMount } from 'svelte';
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
	import type { WordRecord, WordProgress, StudyRating } from '$lib/types';
	import { X, Brain, Flame, CircleCheckBig } from 'lucide-svelte';

	interface ReviewItem {
		packId: string;
		word: WordRecord;
		language: 'chinese' | 'french';
	}

	let items = $state<ReviewItem[]>([]);
	let allProgress = $state<Record<string, WordProgress>>({});
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isCurrentSaved = $state(false);
	let activeLanguage = $state<'chinese' | 'french'>('chinese');

	// Session metrics
	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);
	let halfwayTriggered = $state(false);
	let showMilestoneModal = $state(false);
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

	async function loadDueCards() {
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
				if (isCardDue(p)) {
					dueItems.push({ packId: pack.id, word, language: activeLanguage });
				}
			}
		}

		// Custom decks
		for (const deck of matchingCustom) {
			for (const word of deck.words) {
				const p = getWordProgress(progress, deck.id, word.No, deck.language || activeLanguage);
				if (isCardDue(p)) {
					dueItems.push({
						packId: deck.id,
						word,
						language: (deck.language as 'chinese' | 'french') || activeLanguage
					});
				}
			}
		}

		items = dueItems;
		currentIndex = 0;
		isFlipped = false;

		if (items.length > 0) {
			await updateSavedStatus();
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
		isFlipped = !isFlipped;
	}

	async function handleRate(rating: StudyRating, customDays?: number) {
		if (!currentItem) return;

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

		if (rating === 'again') {
			sessionWrong++;
		} else {
			sessionCorrect++;
		}

		const halfwayIndex = Math.floor(items.length / 2);
		if (!halfwayTriggered && items.length >= 4 && currentIndex + 1 === halfwayIndex) {
			halfwayTriggered = true;
			showMilestoneModal = true;
			return;
		}

		advanceNextCard();
	}

	function advanceNextCard() {
		if (currentIndex + 1 >= items.length) {
			isSessionFinished = true;
			playSound('milestone');
		} else {
			currentIndex++;
			isFlipped = false;
			updateSavedStatus();
		}
	}

	onMount(() => {
		loadDueCards();
	});
</script>

<svelte:head>
	<title>SRS Due Reviews — FlashCards</title>
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
			<h2 class="font-headline text-sm font-bold text-slate-900">SRS Scheduled Reviews</h2>
			<span class="font-headline text-[11px] font-semibold text-slate-500">
				{progressCount} / {items.length} cards due
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-headline text-xs font-bold text-indigo-700"
		>
			<Brain size={13} strokeWidth={2.25} />
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<div class="h-1.5 w-full overflow-hidden bg-slate-100">
		<div
			class="h-full bg-indigo-600 transition-all duration-300 ease-out"
			style="width: {items.length > 0 ? (progressCount / items.length) * 100 : 0}%"
		></div>
	</div>

	<main class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-4">
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

				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900"
				>
					<Flame size={13} strokeWidth={2.25} />
					<span>ALL DUE CARDS REVIEWED</span>
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
			<div class="space-y-6">
				<FlashCard
					word={currentItem.word}
					language={currentItem.language}
					{isFlipped}
					isSaved={isCurrentSaved}
					showPinyin={true}
					onFlip={handleFlipCard}
					onToggleSave={handleToggleSave}
				/>

				<div
					class="transition-opacity {isFlipped ? 'opacity-100' : 'pointer-events-none opacity-40'}"
				>
					<SRSButtons onRate={handleRate} disabled={!isFlipped} progress={currentProgress} />
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

<MilestoneModal
	isOpen={showMilestoneModal}
	title="Halfway Done!"
	subtitle="You've conquered half your scheduled cards for today!"
	badgeText="SRS REVIEW MILESTONE"
	mascot="/mascots/flame.png"
	stats={{
		reviewed: currentIndex + 1,
		total: items.length,
		accuracy: sessionAccuracy,
		correct: sessionCorrect,
		wrong: sessionWrong
	}}
	onPrimaryAction={() => {
		showMilestoneModal = false;
		advanceNextCard();
	}}
	onSecondaryAction={() => {
		showMilestoneModal = false;
		goto(resolve('/'));
	}}
/>
