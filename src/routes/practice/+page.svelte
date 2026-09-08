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
	import { calculateNextReview } from '$lib/utils/srs';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { playSound } from '$lib/utils/audio';
	import type { WordRecord, WordProgress, StudyRating } from '$lib/types';

	interface PracticeItem {
		packId: string;
		word: WordRecord;
		wrongCount: number;
		language: 'chinese' | 'french';
	}

	let items = $state<PracticeItem[]>([]);
	let allProgress = $state<Record<string, WordProgress>>({});
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isCurrentSaved = $state(false);
	let activeLanguage = $state<'chinese' | 'french'>('chinese');

	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);
	let showMilestoneModal = $state(false);
	let isSessionFinished = $state(false);

	let currentItem = $derived(items[currentIndex]);
	let progressCount = $derived(items.length > 0 ? currentIndex + 1 : 0);
	let sessionAccuracy = $derived(
		sessionCorrect + sessionWrong > 0
			? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
			: 100
	);

	async function loadWeakCards() {
		activeLanguage = getSavedLanguage();
		const progress = await getAllProgress();
		allProgress = progress;

		const packs = await getBuiltinPacks(activeLanguage);
		const customDecks = await getAllCustomDecks();
		const matchingCustom = customDecks.filter(
			(d) => !d.language || d.language === activeLanguage
		);

		const weakItems: PracticeItem[] = [];

		// Built-in packs
		for (const pack of packs) {
			for (const word of pack.words) {
				const p = progress[`${pack.id}:${word.No}`];
				if (p && (p.wrong || 0) > 0) {
					weakItems.push({
						packId: pack.id,
						word,
						wrongCount: p.wrong,
						language: activeLanguage
					});
				}
			}
		}

		// Custom decks
		for (const deck of matchingCustom) {
			for (const word of deck.words) {
				const p = progress[`${deck.id}:${word.No}`];
				if (p && (p.wrong || 0) > 0) {
					weakItems.push({
						packId: deck.id,
						word,
						wrongCount: p.wrong,
						language: deck.language || activeLanguage
					});
				}
			}
		}

		// Sort by highest error count first
		weakItems.sort((a, b) => b.wrongCount - a.wrongCount);

		items = weakItems;
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
		loadWeakCards();
	});
</script>

<svelte:head>
	<title>Practice Weak Cards — FlashCards</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-surface justify-between">
	<header
		class="sticky top-0 z-20 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-3 shadow-xs"
	>
		<button
			type="button"
			onclick={() => goto('/')}
			aria-label="Exit Practice Session"
			class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
		>
			<span class="material-symbols-outlined text-[22px]">close</span>
		</button>

		<div class="flex flex-col items-center">
			<h2 class="font-headline text-sm font-bold text-on-surface">Targeted Practice</h2>
			<span class="text-[11px] font-semibold text-on-surface-variant">
				{progressCount} / {items.length} difficult words
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 text-xs font-bold text-on-secondary-fixed"
		>
			<span class="material-symbols-outlined text-[14px]">fitness_center</span>
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<div class="w-full bg-surface-container-high h-1.5 overflow-hidden">
		<div
			class="bg-secondary h-full transition-all duration-300 ease-out"
			style="width: {items.length > 0 ? (progressCount / items.length) * 100 : 0}%"
		></div>
	</div>

	<main class="flex-1 flex flex-col justify-center px-4 py-4 max-w-md mx-auto w-full">
		{#if isSessionFinished}
			<div
				class="rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-xl space-y-4"
			>
				<div class="mx-auto flex h-24 w-24 items-center justify-center">
					<img
						src="/mascots/owl.png"
						alt="Owl celebration"
						class="h-20 w-20 object-contain drop-shadow-md select-none"
					/>
				</div>

				<div class="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-headline text-xs font-bold text-on-secondary-fixed">
					<span class="material-symbols-outlined text-[14px]">bolt</span>
					<span>PRACTICE COMPLETED</span>
				</div>

				<h2 class="font-headline text-2xl font-black text-on-surface">Great Perseverance!</h2>
				<p class="font-body text-xs text-on-surface-variant">
					You practiced your most difficult vocabulary words.
				</p>

				<div class="grid grid-cols-2 gap-3 py-3 border-y border-surface-container">
					<div class="rounded-2xl bg-emerald-50 p-3 text-center border border-emerald-100">
						<p class="font-headline text-xl font-black text-emerald-700">{sessionCorrect}</p>
						<p class="text-[11px] font-bold text-emerald-600">Correct This Run</p>
					</div>
					<div class="rounded-2xl bg-rose-50 p-3 text-center border border-rose-100">
						<p class="font-headline text-xl font-black text-rose-700">{sessionWrong}</p>
						<p class="text-[11px] font-bold text-rose-600">Still Needs Work</p>
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
				<!-- Card Difficulty Warning Badge -->
				<div class="flex justify-center">
					<span class="rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-[11px] font-bold text-rose-700">
						Missed {currentItem.wrongCount} times previously
					</span>
				</div>

				<FlashCard
					word={currentItem.word}
					language={currentItem.language}
					{isFlipped}
					isSaved={isCurrentSaved}
					showPinyin={true}
					onFlip={handleFlipCard}
					onToggleSave={handleToggleSave}
				/>

				<div class="transition-opacity {isFlipped ? 'opacity-100' : 'opacity-40 pointer-events-none'}">
					<SRSButtons onRate={handleRate} disabled={!isFlipped} />
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-on-surface-variant">
				<span class="material-symbols-outlined text-[48px] text-emerald-500 mb-2">sentiment_very_satisfied</span>
				<h3 class="font-headline text-lg font-bold text-on-surface">No Weak Words!</h3>
				<p class="font-body text-xs mt-1">You don't have any troublesome cards recorded yet.</p>
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
