<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import { onMount } from 'svelte';
	import { getMyWordsDeck, getAllProgress, saveWordProgress } from '$lib/storage';
	import { playSound } from '$lib/audio';
	import {
		calculateNextReview,
		isCardDue,
		type WordRecord,
		type WordProgress,
		type StudyRating
	} from '@flash/shared';
	import { X, CircleCheckBig } from 'lucide-svelte';

	const MAX_SESSION_CARDS = 10;

	interface ReviewItem {
		word: WordRecord;
		progress?: WordProgress;
	}

	let items = $state<ReviewItem[]>([]);
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isAdvancing = $state(false);
	let status = $state<'loading' | 'ready'>('loading');
	let isPracticeMode = $state(false);
	let remainingDueCount = $state(0);
	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);

	let currentItem = $derived(items[currentIndex] as ReviewItem | undefined);
	let currentWord = $derived(currentItem?.word);
	let isFinished = $derived(status === 'ready' && items.length > 0 && currentIndex >= items.length);

	async function loadDueCards() {
		status = 'loading';
		isPracticeMode = false;
		sessionCorrect = 0;
		sessionWrong = 0;

		const [deck, progressMap] = await Promise.all([getMyWordsDeck(), getAllProgress()]);

		const due: ReviewItem[] = [];
		for (const word of deck.words) {
			const key = `custom-my-words:${word.No}`;
			const p = progressMap[key];
			if (isCardDue(p)) {
				due.push({ word, progress: p });
			}
		}

		// Prioritize unreviewed words first, then oldest due dates ascending
		due.sort((a, b) => {
			const aReviewed = Boolean(a.progress?.lastReviewed);
			const bReviewed = Boolean(b.progress?.lastReviewed);
			if (!aReviewed && bReviewed) return -1;
			if (aReviewed && !bReviewed) return 1;

			const aDue = a.progress?.dueDate ?? 0;
			const bDue = b.progress?.dueDate ?? 0;
			return aDue - bDue;
		});

		remainingDueCount = Math.max(0, due.length - MAX_SESSION_CARDS);
		items = due.slice(0, MAX_SESSION_CARDS);
		currentIndex = 0;
		isFlipped = false;
		status = 'ready';
	}

	async function loadPracticeAll() {
		status = 'loading';
		isPracticeMode = true;
		sessionCorrect = 0;
		sessionWrong = 0;

		const [deck, progressMap] = await Promise.all([getMyWordsDeck(), getAllProgress()]);

		const practiceItems: ReviewItem[] = deck.words.map((word) => {
			const key = `custom-my-words:${word.No}`;
			return { word, progress: progressMap[key] };
		});

		// Sort by least recently reviewed
		practiceItems.sort((a, b) => {
			const aTime = a.progress?.lastReviewed ?? 0;
			const bTime = b.progress?.lastReviewed ?? 0;
			return aTime - bTime;
		});

		remainingDueCount = 0;
		items = practiceItems.slice(0, MAX_SESSION_CARDS);
		currentIndex = 0;
		isFlipped = false;
		status = 'ready';
	}

	async function handleRate(rating: StudyRating) {
		if (!currentItem || isAdvancing) return;
		isAdvancing = true;
		playSound(rating === 'good' ? 'correct' : 'wrong');

		if (rating === 'good') {
			sessionCorrect += 1;
		} else {
			sessionWrong += 1;
		}

		const word = currentItem.word;
		const key = `custom-my-words:${word.No}`;
		const nextProgress = calculateNextReview(currentItem.progress, rating);

		await saveWordProgress(key, nextProgress);

		setTimeout(() => {
			isFlipped = false;
			currentIndex += 1;
			isAdvancing = false;
		}, 200);
	}

	onMount(() => {
		loadDueCards();
	});
</script>

<svelte:head>
	<title>FlashCards Lite — {isPracticeMode ? 'Practice All' : 'Review'}</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-white">
	<!-- Top Bar -->
	<header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
		<button
			type="button"
			aria-label="Exit review"
			onclick={() => goto(resolve('/'))}
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="text-center">
			<span class="font-headline text-sm font-bold text-slate-800">
				{isPracticeMode ? 'Practice All' : 'Spaced Repetition'}
			</span>
			{#if items.length > 0 && !isFinished}
				<p class="font-sans text-[11px] font-semibold text-indigo-600">
					{currentIndex + 1} of {items.length} cards
				</p>
			{/if}
		</div>

		<div class="w-9"></div>
	</header>

	<main class="flex flex-1 flex-col justify-center px-4 py-6">
		{#if status === 'loading'}
			<div class="space-y-4 text-center">
				<div
					class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
				></div>
				<p class="font-sans text-sm text-slate-500">Checking due cards…</p>
			</div>
		{:else if isFinished}
			<!-- Session Complete -->
			<div
				class="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
				>
					<CircleCheckBig size={36} strokeWidth={2.25} />
				</div>
				<div>
					<h2 class="font-headline text-2xl font-black text-slate-900">Session Complete!</h2>
					<p class="mt-1 font-sans text-sm text-slate-600">
						You finished {items.length} cards in this session.
					</p>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-2 gap-3 pt-1 text-left">
					<div class="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
						<span class="block font-sans text-xs font-semibold text-emerald-700">Correct</span>
						<span class="font-headline text-2xl font-black text-emerald-900">{sessionCorrect}</span>
					</div>
					<div class="rounded-2xl border border-rose-100 bg-rose-50/70 p-3.5">
						<span class="block font-sans text-xs font-semibold text-rose-700">Needs Review</span>
						<span class="font-headline text-2xl font-black text-rose-900">{sessionWrong}</span>
					</div>
				</div>

				<div class="space-y-2 pt-2">
					{#if !isPracticeMode && (remainingDueCount > 0 || sessionWrong > 0)}
						<button
							type="button"
							onclick={loadDueCards}
							class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
						>
							{#if remainingDueCount > 0}
								Review Next {Math.min(remainingDueCount + sessionWrong, MAX_SESSION_CARDS)} Due
							{:else}
								Review Needs Practice ({sessionWrong})
							{/if}
						</button>
					{:else}
						<button
							type="button"
							onclick={loadPracticeAll}
							class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
						>
							Practice All Words
						</button>
					{/if}

					<button
						type="button"
						onclick={() => goto(resolve('/'))}
						class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white font-headline text-base font-bold text-slate-700 hover:bg-slate-50"
					>
						Back to My Words
					</button>
				</div>
			</div>
		{:else if items.length === 0}
			<!-- All Caught Up -->
			<div
				class="space-y-5 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
				>
					<CircleCheckBig size={36} strokeWidth={2.25} />
				</div>
				<div>
					<h2 class="font-headline text-2xl font-black text-slate-900">All Caught Up!</h2>
					<p class="mt-1 font-sans text-sm text-slate-600">
						You have reviewed all cards due for now.
					</p>
				</div>

				<div class="space-y-2 pt-2">
					<button
						type="button"
						onclick={loadPracticeAll}
						class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
					>
						<span>Practice All Words</span>
					</button>

					<button
						type="button"
						onclick={() => goto(resolve('/'))}
						class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white font-headline text-base font-bold text-slate-700 hover:bg-slate-50"
					>
						Back to My Words
					</button>
				</div>
			</div>
		{:else if currentWord}
			<!-- Active Review Card -->
			<div class="space-y-6">
				{#key currentIndex}
					<FlashCard
						word={currentWord}
						language="chinese"
						{isFlipped}
						deckName={isPracticeMode ? 'Practice All' : 'Review'}
						onFlip={() => {
							if (!isAdvancing) isFlipped = !isFlipped;
						}}
					/>
				{/key}

				<div class="pt-2">
					<SRSButtons onRate={handleRate} disabled={isAdvancing} />
				</div>
			</div>
		{/if}
	</main>
</div>
