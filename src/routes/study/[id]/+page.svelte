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

<div class="flex min-h-screen flex-col justify-between bg-surface">
	<!-- Top Session Bar -->
	<header
		class="sticky top-0 z-20 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-3 shadow-xs"
	>
		<button
			type="button"
			onclick={() => goto(`/deck/${deckId}/preview`)}
			aria-label="Exit Study Session"
			class="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
		>
			<X size={20} strokeWidth={2} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="max-w-[180px] truncate font-headline text-sm font-bold text-on-surface">
				{deckTitle}
			</h2>
			<span class="text-[11px] font-semibold text-on-surface-variant">
				{progressCount} / {cards.length} cards
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold text-on-surface-variant"
		>
			<CheckCheck size={13} strokeWidth={2} class="text-tertiary-container" />
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<!-- Linear Progress Bar -->
	<div class="h-1.5 w-full overflow-hidden bg-surface-container-high">
		<div
			class="h-full bg-primary-container transition-all duration-300 ease-out"
			style="width: {cards.length > 0 ? (progressCount / cards.length) * 100 : 0}%"
		></div>
	</div>

	<!-- Main Study Arena -->
	<main class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-4">
		{#if isSessionFinished}
			<!-- FINISHED SESSION SUMMARY -->
			<div
				class="space-y-4 rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-xl"
			>
				<div class="mx-auto flex h-24 w-24 items-center justify-center">
					<img
						src="/mascots/owl.png"
						alt="Celebration owl mascot"
						class="h-20 w-20 object-contain drop-shadow-md select-none"
					/>
				</div>

				<div
					class="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-headline text-xs font-bold text-primary"
				>
					<Award size={13} strokeWidth={2} />
					<span>SESSION COMPLETED</span>
				</div>

				<h2 class="font-headline text-2xl font-black text-on-surface">Great Work!</h2>
				<p class="font-body text-xs text-on-surface-variant">
					You completed all {cards.length} cards in this study run.
				</p>

				<div class="grid grid-cols-2 gap-3 border-y border-surface-container py-3">
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
						class="flex h-12 w-full items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-white shadow-md hover:bg-primary active:scale-95"
					>
						Study Again
					</button>
					<button
						type="button"
						onclick={() => goto('/')}
						class="flex h-11 w-full items-center justify-center rounded-full bg-surface-container font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
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
			<div class="py-12 text-center text-on-surface-variant">
				<p class="font-headline text-sm font-bold">No cards available in this set.</p>
				<button
					type="button"
					onclick={() => goto('/')}
					class="mt-4 rounded-full bg-primary-container px-4 py-2 text-xs font-bold text-white"
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
