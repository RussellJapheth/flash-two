<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import SRSButtons from '$lib/components/SRSButtons.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import MilestoneModal from '$lib/components/MilestoneModal.svelte';
	import { onMount } from 'svelte';
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
	import { playSound } from '$lib/utils/audio';
	import type { WordRecord, WordProgress, StudyRating } from '$lib/types';
	import { X, Award, CheckCheck } from 'lucide-svelte';

	let deckId = $derived(page.params.id || '');
	let studyMode = $derived((page.url.searchParams.get('mode') as 'srs' | 'all' | 'weak') || 'srs');
	let cardLimit = $derived(parseInt(page.url.searchParams.get('limit') || '20', 10));
	let showPinyinSetting = $derived(page.url.searchParams.get('pinyin') !== '0');

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
		let filtered: WordRecord[] = [];
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
			// Fallback to all cards if none match strict filter
			filtered = [...rawWords];
		}

		// Apply card limit if set
		if (cardLimit > 0 && filtered.length > cardLimit) {
			filtered = filtered.slice(0, cardLimit);
		}

		cards = filtered;
		currentIndex = 0;
		isFlipped = false;

		if (cards.length > 0) {
			await updateSavedStatus();
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
		if (!halfwayTriggered && cards.length >= 4 && currentIndex + 1 === halfwayIndex) {
			halfwayTriggered = true;
			showMilestoneModal = true;
			return;
		}

		advanceNextCard();
	}

	function advanceNextCard() {
		if (currentIndex + 1 >= cards.length) {
			isSessionFinished = true;
			playSound('milestone');
		} else {
			currentIndex++;
			isFlipped = false;
			updateSavedStatus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isSessionFinished || showMilestoneModal) return;

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
		};
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
			onclick={() => goto(`/deck/${deckId}/preview`)}
			aria-label="Exit Study Session"
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="max-w-[180px] truncate font-headline text-sm font-bold text-slate-900">
				{deckTitle}
			</h2>
			<span class="font-headline text-[11px] font-semibold text-slate-500">
				{progressCount} / {cards.length} cards
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-headline text-xs font-bold text-emerald-700"
		>
			<CheckCheck size={13} strokeWidth={2.25} />
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<!-- Linear Progress Bar -->
	<div class="h-1.5 w-full overflow-hidden bg-slate-100">
		<div
			class="h-full bg-indigo-600 transition-all duration-300 ease-out"
			style="width: {cards.length > 0 ? (progressCount / cards.length) * 100 : 0}%"
		></div>
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
						onclick={() => goto('/')}
						class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-100 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
					>
						Return to Dashboard
					</button>
				</div>
			</div>
		{:else if currentWord}
			<!-- ACTIVE FLASHCARD -->
			<div class="space-y-6">
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
				<p class="font-headline text-sm font-bold text-slate-800">No cards available in this set.</p>
				<button
					type="button"
					onclick={() => goto('/')}
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
		goto('/');
	}}
/>
