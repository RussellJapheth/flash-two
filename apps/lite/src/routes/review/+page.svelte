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

	interface ReviewItem {
		word: WordRecord;
		progress?: WordProgress;
	}

	let items = $state<ReviewItem[]>([]);
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isAdvancing = $state(false);
	let status = $state<'loading' | 'ready'>('loading');

	let currentItem = $derived(items[currentIndex] as ReviewItem | undefined);
	let currentWord = $derived(currentItem?.word);
	let isFinished = $derived(status === 'ready' && items.length > 0 && currentIndex >= items.length);

	async function loadDueCards() {
		status = 'loading';
		const [deck, progressMap] = await Promise.all([getMyWordsDeck(), getAllProgress()]);

		const due: ReviewItem[] = [];
		for (const word of deck.words) {
			const key = `custom-my-words:${word.No}`;
			const p = progressMap[key];
			if (isCardDue(p)) {
				due.push({ word, progress: p });
			}
		}

		items = due;
		currentIndex = 0;
		isFlipped = false;
		status = 'ready';
	}

	async function handleRate(rating: StudyRating) {
		if (!currentItem || isAdvancing) return;
		isAdvancing = true;
		playSound(rating === 'good' ? 'correct' : 'wrong');

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
	<title>FlashCards Lite — Review</title>
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
			<span class="font-headline text-sm font-bold text-slate-800">Review Queue</span>
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
				class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<CircleCheckBig size={52} strokeWidth={1.75} class="mx-auto text-emerald-500" />
				<div>
					<h2 class="font-headline text-2xl font-black text-slate-900">Review Complete!</h2>
					<p class="mt-1 font-sans text-sm text-slate-600">
						You finished reviewing all {items.length} due cards.
					</p>
				</div>
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
				>
					Back to My Words
				</button>
			</div>
		{:else if items.length === 0}
			<!-- Empty Queue -->
			<div
				class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<CircleCheckBig size={52} strokeWidth={1.75} class="mx-auto text-emerald-500" />
				<div>
					<h2 class="font-headline text-xl font-bold text-slate-900">No Cards Due for Review</h2>
					<p class="mt-1 font-sans text-sm text-slate-600">
						Your spaced repetition reviews are completely up to date.
					</p>
				</div>
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
				>
					Back to My Words
				</button>
			</div>
		{:else if currentWord}
			<!-- Active Review Card -->
			<div class="space-y-6">
				<FlashCard
					word={currentWord}
					language="chinese"
					{isFlipped}
					deckName="Review"
					onFlip={() => (isFlipped = !isFlipped)}
				/>

				<div class="pt-2">
					<SRSButtons onRate={handleRate} disabled={isAdvancing} />
				</div>
			</div>
		{/if}
	</main>
</div>
