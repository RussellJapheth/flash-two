<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import { onMount } from 'svelte';
	import { getMyWordsDeck, getWordProgress, saveWordProgress } from '$lib/storage';
	import { playSound } from '$lib/audio';
	import {
		calculateNextReview,
		filterWordsByCategory,
		type WordRecord,
		type StudyRating
	} from '@flash/shared';
	import { X, CircleCheckBig, RotateCcw } from 'lucide-svelte';

	let categoryParam = $derived(page.url.searchParams.get('category')?.trim() || '');
	let words = $state<WordRecord[]>([]);
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let isAdvancing = $state(false);
	let status = $state<'loading' | 'ready'>('loading');

	let currentWord = $derived(words[currentIndex] as WordRecord | undefined);
	let isFinished = $derived(status === 'ready' && words.length > 0 && currentIndex >= words.length);

	async function loadDeck() {
		status = 'loading';
		const deck = await getMyWordsDeck();
		const allWords = deck.words ?? [];
		words = categoryParam ? filterWordsByCategory(allWords, categoryParam) : allWords;
		currentIndex = 0;
		isFlipped = false;
		status = 'ready';
	}

	async function handleRate(rating: StudyRating) {
		if (!currentWord || isAdvancing) return;
		isAdvancing = true;
		playSound(rating === 'good' ? 'correct' : 'wrong');

		const key = `custom-my-words:${currentWord.No}`;
		const currentProgress = await getWordProgress(key);
		const nextProgress = calculateNextReview(currentProgress, rating);
		await saveWordProgress(key, nextProgress);

		setTimeout(() => {
			isFlipped = false;
			currentIndex += 1;
			isAdvancing = false;
		}, 200);
	}

	function handleRestart() {
		currentIndex = 0;
		isFlipped = false;
	}

	onMount(() => {
		loadDeck();
	});
</script>

<svelte:head>
	<title>FlashCards Lite — Study</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-white">
	<!-- Top Bar -->
	<header class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
		<button
			type="button"
			aria-label="Exit study"
			onclick={() => goto(resolve('/'))}
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="text-center">
			<span class="font-headline text-sm font-bold text-slate-800">
				{categoryParam || 'My Words'}
			</span>
			{#if words.length > 0 && !isFinished}
				<p class="font-sans text-[11px] font-semibold text-indigo-600">
					{currentIndex + 1} of {words.length} cards
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
				<p class="font-sans text-sm text-slate-500">Loading cards…</p>
			</div>
		{:else if isFinished}
			<!-- Session Complete -->
			<div
				class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<CircleCheckBig size={52} strokeWidth={1.75} class="mx-auto text-emerald-500" />
				<div>
					<h2 class="font-headline text-2xl font-black text-slate-900">Study Session Done!</h2>
					<p class="mt-1 font-sans text-sm text-slate-600">
						You completed all {words.length} cards in this category.
					</p>
				</div>

				<div class="space-y-2 pt-2">
					<button
						type="button"
						onclick={handleRestart}
						class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-headline text-base font-bold text-slate-700 hover:bg-slate-50"
					>
						<RotateCcw size={18} />
						<span>Practice Again</span>
					</button>

					<button
						type="button"
						onclick={() => goto(resolve('/'))}
						class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
					>
						Back to My Words
					</button>
				</div>
			</div>
		{:else if words.length === 0}
			<!-- Empty Deck -->
			<div
				class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-sm"
			>
				<p class="font-sans text-base text-slate-600">No words found in this deck.</p>
				<button
					type="button"
					onclick={() => goto(resolve('/'))}
					class="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
				>
					Back to My Words
				</button>
			</div>
		{:else if currentWord}
			<!-- Active Flashcard -->
			<div class="space-y-6">
				<FlashCard
					word={currentWord}
					language="chinese"
					{isFlipped}
					deckName={categoryParam || 'My Words'}
					onFlip={() => (isFlipped = !isFlipped)}
				/>

				<div class="pt-2">
					<SRSButtons onRate={handleRate} disabled={isAdvancing} />
				</div>
			</div>
		{/if}
	</main>
</div>
