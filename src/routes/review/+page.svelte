<script lang="ts">
	import { goto } from '$app/navigation';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import MilestoneModal from '$lib/components/MilestoneModal.svelte';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
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
		currentItem ? allProgress[`${currentItem.packId}:${currentItem.word.No}`] : undefined
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
				const p = progress[`${pack.id}:${word.No}`];
				if (isCardDue(p)) {
					dueItems.push({ packId: pack.id, word, language: activeLanguage });
				}
			}
		}

		// Custom decks
		for (const deck of matchingCustom) {
			for (const word of deck.words) {
				const p = progress[`${deck.id}:${word.No}`];
				if (isCardDue(p)) {
					dueItems.push({
						packId: deck.id,
						word,
						language: deck.language || activeLanguage
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

		const key = `${currentItem.packId}:${currentItem.word.No}`;
		const currentProgress = allProgress[key];
		const updated = calculateNextReview(currentProgress, rating, customDays);
		updated.weekId = currentItem.packId;
		updated.wordNo = currentItem.word.No;

		await saveProgress(updated);
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

<div class="flex min-h-screen flex-col justify-between bg-surface">
	<header
		class="sticky top-0 z-20 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-3 shadow-xs"
	>
		<button
			type="button"
			onclick={() => goto('/')}
			aria-label="Exit Review Session"
			class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
		>
			<X size={20} strokeWidth={2} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="font-headline text-sm font-bold text-on-surface">SRS Scheduled Reviews</h2>
			<span class="text-[11px] font-semibold text-on-surface-variant">
				{progressCount} / {items.length} cards due
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-1 text-xs font-bold text-primary"
		>
			<Brain size={13} strokeWidth={2} />
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<div class="h-1.5 w-full overflow-hidden bg-surface-container-high">
		<div
			class="h-full bg-primary-container transition-all duration-300 ease-out"
			style="width: {items.length > 0 ? (progressCount / items.length) * 100 : 0}%"
		></div>
	</div>

	<main class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-4">
		{#if isSessionFinished}
			<div
				class="space-y-4 rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-xl"
			>
				<div class="mx-auto flex h-24 w-24 items-center justify-center">
					<img
						src="/mascots/flame.png"
						alt="Celebration flame mascot"
						class="h-20 w-20 object-contain drop-shadow-md select-none"
					/>
				</div>

				<div
					class="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-headline text-xs font-bold text-on-secondary-fixed"
				>
					<Flame size={13} strokeWidth={1.75} />
					<span>ALL DUE CARDS REVIEWED</span>
				</div>

				<h2 class="font-headline text-2xl font-black text-on-surface">Inbox Zero!</h2>
				<p class="font-body text-xs text-on-surface-variant">
					You're all caught up with your spaced repetition schedule.
				</p>

				<div class="grid grid-cols-2 gap-3 border-y border-surface-container py-3">
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
					onclick={() => goto('/')}
					class="flex h-12 w-full items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-white shadow-md hover:bg-primary active:scale-95"
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
			<div class="py-12 text-center text-on-surface-variant">
				<CircleCheckBig size={44} strokeWidth={1.25} class="mb-2 text-emerald-500" />
				<h3 class="font-headline text-lg font-bold text-on-surface">No Due Cards</h3>
				<p class="font-body mt-1 text-xs">
					You are completely up to date with your spaced repetition reviews.
				</p>
				<button
					type="button"
					onclick={() => goto('/')}
					class="mt-4 rounded-full bg-primary-container px-5 py-2.5 text-xs font-bold text-white"
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
		goto('/');
	}}
/>
