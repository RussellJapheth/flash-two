<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import DeckSpreadsheetModal from '$lib/components/DeckSpreadsheetModal.svelte';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
		getWordProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		saveCustomDeck,
		deleteCustomDeck,
		computeStreakStats,
		recordRecentlyOpenedPack,
		isWordSaved,
		toggleSavedWord
	} from '$lib/utils/storage';
	import { speakWord } from '$lib/utils/audio';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { isCardDue, isCardMastered, isCardLearning } from '$lib/utils/srs';
	import type { WordRecord, StreakStats, WordProgress, CustomDeck } from '$lib/types';
	import {
		Brain,
		BookOpen,
		Dumbbell,
		Play,
		PlayCircle,
		Volume2,
		Bookmark,
		Search,
		Table,
		SlidersHorizontal,
		CheckCircle2,
		Clock,
		Pencil,
		Trash2,
		Plus
	} from 'lucide-svelte';

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let deckId = $derived(page.params.id || '');
	let deckTitle = $state('Loading Deck...');
	let deckLanguage = $state<'chinese' | 'french'>('chinese');
	let words = $state<WordRecord[]>([]);
	let allProgress = $state<Record<string, WordProgress>>({});
	let savedWordNos = new SvelteSet<number>();
	let currentCustomDeck = $state<CustomDeck | null>(null);
	let isSpreadsheetModalOpen = $state(false);

	let masteredCount = $state(0);
	let learningCount = $state(0);
	let dueCount = $state(0);
	let weakCount = $state(0);

	// View tab: 'study' or 'table'
	let activeViewTab = $state<'study' | 'table'>('study');

	// Study Settings
	let studyMode = $state<'srs' | 'all' | 'weak'>('srs');
	let cardLimit = $state<number>(20);
	let showPinyin = $state(true);

	// Table Search & Filters
	let tableSearch = $state('');
	let tableFilter = $state<'all' | 'saved' | 'due' | 'learning' | 'mastered'>('all');

	async function loadDeckData() {
		const progress = await getAllProgress();
		allProgress = progress;
		streakStats = computeStreakStats(progress);

		let foundWords: WordRecord[] = [];
		let title = 'Vocabulary Pack';
		let lang: 'chinese' | 'french' = 'chinese';

		if (deckId.startsWith('custom-')) {
			const customDecks = await getAllCustomDecks();
			const match = customDecks.find((d) => d.id === deckId);
			if (match) {
				currentCustomDeck = match;
				foundWords = match.words;
				title = match.name;
				lang = match.language || 'chinese';
			} else {
				currentCustomDeck = null;
			}
		} else {
			currentCustomDeck = null;
			// Check Chinese packs then French packs
			const chPacks = await getBuiltinPacks('chinese');
			const chMatch = chPacks.find(
				(p) =>
					p.id === deckId || p.id === `chinese-${deckId}` || p.id.replace('chinese-', '') === deckId
			);
			if (chMatch) {
				foundWords = chMatch.words;
				title = chMatch.title;
				lang = 'chinese';
			} else {
				const frPacks = await getBuiltinPacks('french');
				const frMatch = frPacks.find(
					(p) =>
						p.id === deckId || p.id === `french-${deckId}` || p.id.replace('french-', '') === deckId
				);
				if (frMatch) {
					foundWords = frMatch.words;
					title = frMatch.title;
					lang = 'french';
				}
			}
		}

		words = foundWords;
		deckTitle = title;
		deckLanguage = lang;
		if (deckId) {
			recordRecentlyOpenedPack(deckId);
		}

		let mastered = 0;
		let learning = 0;
		let due = 0;
		let weak = 0;

		savedWordNos.clear();
		for (const w of foundWords) {
			const p = getWordProgress(progress, deckId, w.No, lang);
			if (p) {
				if (isCardMastered(p)) mastered++;
				else if (isCardLearning(p)) learning++;
				if (isCardDue(p)) due++;
				if (p.wrong > 0) weak++;
			} else {
				due++;
			}

			const saved = await isWordSaved(deckId, w.No);
			if (saved) savedWordNos.add(w.No);
		}

		masteredCount = mastered;
		learningCount = learning;
		dueCount = due;
		weakCount = weak;
	}

	async function handleToggleSave(wordNo: number) {
		const isNowSaved = await toggleSavedWord(deckId, wordNo);
		scheduleDebouncedSync();
		if (isNowSaved) {
			savedWordNos.add(wordNo);
		} else {
			savedWordNos.delete(wordNo);
		}
	}

	function getWordStatus(wordNo: number): 'mastered' | 'learning' | 'due' | 'new' {
		const p = getWordProgress(allProgress, deckId, wordNo, deckLanguage);
		if (!p) return 'new';
		if (isCardMastered(p)) return 'mastered';
		if (isCardLearning(p)) return 'learning';
		if (isCardDue(p)) return 'due';
		return 'learning';
	}

	async function handleSaveCustomDeck(deck: CustomDeck) {
		await saveCustomDeck(deck);
		scheduleDebouncedSync();
		await loadDeckData();
	}

	async function handleDeleteCustomDeck() {
		if (confirm('Are you sure you want to delete this custom deck?')) {
			await deleteCustomDeck(deckId);
			scheduleDebouncedSync();
			goto(resolve('/decks'));
		}
	}

	async function handleDeleteSingleWord(wordNo: number) {
		if (!currentCustomDeck) return;
		if (confirm('Remove this card from the deck?')) {
			const updatedWords = currentCustomDeck.words
				.filter((w) => w.No !== wordNo)
				.map((w, idx) => ({ ...w, No: idx + 1 }));

			const updatedDeck: CustomDeck = {
				...currentCustomDeck,
				words: updatedWords
			};

			await saveCustomDeck(updatedDeck);
			scheduleDebouncedSync();
			await loadDeckData();
		}
	}

	let filteredTableWords = $derived(
		words.filter((w) => {
			const target = deckLanguage === 'chinese' ? w['Chinese Word'] || '' : w['French Word'] || '';
			const pinyin = w.Pinyin || '';
			const meaning = w['English Meaning'] || '';
			const example =
				deckLanguage === 'chinese'
					? w['Example (Chinese + Pinyin)'] || ''
					: w['Example (French)'] || '';

			if (tableSearch.trim()) {
				const q = tableSearch.toLowerCase().trim();
				const matchQuery =
					target.toLowerCase().includes(q) ||
					pinyin.toLowerCase().includes(q) ||
					meaning.toLowerCase().includes(q) ||
					example.toLowerCase().includes(q);
				if (!matchQuery) return false;
			}

			const isSaved = savedWordNos.has(w.No);
			const status = getWordStatus(w.No);

			if (tableFilter === 'saved' && !isSaved) return false;
			if (tableFilter === 'due' && status !== 'due' && status !== 'new') return false;
			if (tableFilter === 'learning' && status !== 'learning') return false;
			if (tableFilter === 'mastered' && status !== 'mastered') return false;

			return true;
		})
	);

	onMount(() => {
		loadDeckData();
	});
</script>

<svelte:head>
	<title>{deckTitle} — FlashCards</title>
</svelte:head>

<TopHeader
	title="Deck Overview"
	showBack={true}
	onBack={() => goto(resolve('/'))}
	streak={streakStats.currentStreak}
/>

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Deck Summary Hero -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span
					class="rounded-full px-3 py-1 font-headline text-xs font-bold tracking-wider uppercase {deckLanguage ===
					'french'
						? 'border border-amber-200/80 bg-amber-50 text-amber-800'
						: 'border border-indigo-100 bg-indigo-50 text-indigo-700'}"
				>
					{deckLanguage}
				</span>
				{#if currentCustomDeck}
					<span
						class="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-violet-700"
					>
						Custom
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				{#if currentCustomDeck}
					<button
						type="button"
						onclick={() => (isSpreadsheetModalOpen = true)}
						title="Edit Custom Deck"
						aria-label="Edit custom deck"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
					>
						<Pencil size={15} strokeWidth={2} />
					</button>

					<button
						type="button"
						onclick={handleDeleteCustomDeck}
						title="Delete Custom Deck"
						aria-label="Delete custom deck"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
					>
						<Trash2 size={15} strokeWidth={2} />
					</button>
				{/if}

				<span class="font-headline text-xs font-bold text-slate-500">
					{words.length} Cards
				</span>
			</div>
		</div>

		<h2 class="mt-2 font-headline text-2xl font-extrabold tracking-tight text-slate-900">
			{deckTitle}
		</h2>

		<!-- Progress Bar -->
		<div class="mt-4">
			<div class="mb-1.5 flex justify-between text-xs font-bold text-slate-900">
				<span class="font-headline">Mastery</span>
				<span class="font-headline text-emerald-600">{masteredCount} / {words.length} cards</span>
			</div>
			<ProgressBar value={masteredCount} max={words.length} variant="emerald" height="h-2" />
		</div>

		<!-- Card status breakdown badges -->
		<div class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
			<div class="rounded-2xl border border-indigo-100/60 bg-indigo-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-indigo-700">{dueCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Due Review</p>
			</div>
			<div class="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-amber-700">{learningCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Learning</p>
			</div>
			<div class="rounded-2xl border border-emerald-100/60 bg-emerald-50/50 p-2.5 text-center">
				<p class="font-headline text-lg font-black text-emerald-700">{masteredCount}</p>
				<p class="font-headline text-[10px] font-bold text-slate-500 uppercase">Mastered</p>
			</div>
		</div>
	</section>

	<!-- Mode Switcher: Study Practice vs. Full Word List Table -->
	<div class="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
		<button
			type="button"
			onclick={() => (activeViewTab = 'study')}
			class="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 font-headline text-xs font-bold transition-all {activeViewTab ===
			'study'
				? 'bg-white text-indigo-700 shadow-xs'
				: 'text-slate-600 hover:text-slate-900'}"
		>
			<SlidersHorizontal size={15} strokeWidth={2.25} />
			<span>Study Session</span>
		</button>

		<button
			type="button"
			onclick={() => (activeViewTab = 'table')}
			class="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 font-headline text-xs font-bold transition-all {activeViewTab ===
			'table'
				? 'bg-white text-indigo-700 shadow-xs'
				: 'text-slate-600 hover:text-slate-900'}"
		>
			<Table size={15} strokeWidth={2.25} />
			<span>Word Table ({words.length})</span>
		</button>
	</div>

	{#if activeViewTab === 'study'}
		<!-- Study Mode Options -->
		<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
			<h3 class="font-headline text-base font-bold text-slate-900">Session Preferences</h3>

			<!-- Study Mode Selection -->
			<div>
				<span class="block font-headline text-xs font-bold text-slate-900">Study Mode</span>
				<div class="mt-2 grid grid-cols-3 gap-2">
					<button
						type="button"
						onclick={() => (studyMode = 'srs')}
						class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
						'srs'
							? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
							: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
					>
						<Brain size={19} strokeWidth={2} class="mb-1" />
						<span class="font-headline text-xs font-bold">Spaced SRS</span>
						<span class="font-sans text-[10px] opacity-75">{dueCount} cards</span>
					</button>

					<button
						type="button"
						onclick={() => (studyMode = 'all')}
						class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
						'all'
							? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
							: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
					>
						<BookOpen size={19} strokeWidth={2} class="mb-1" />
						<span class="font-headline text-xs font-bold">All Cards</span>
						<span class="font-sans text-[10px] opacity-75">{words.length} cards</span>
					</button>

					<button
						type="button"
						onclick={() => (studyMode = 'weak')}
						class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all {studyMode ===
						'weak'
							? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
							: 'border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
					>
						<Dumbbell size={19} strokeWidth={2} class="mb-1" />
						<span class="font-headline text-xs font-bold">Difficult</span>
						<span class="font-sans text-[10px] opacity-75">{weakCount} cards</span>
					</button>
				</div>
			</div>

			<!-- Card Count Limits -->
			<div>
				<span class="block font-headline text-xs font-bold text-slate-900">Cards per Session</span>
				<div class="mt-2 flex gap-2">
					{#each [10, 20, 30, 0] as limit (limit)}
						<button
							type="button"
							onclick={() => (cardLimit = limit)}
							class="flex-1 cursor-pointer rounded-2xl py-2 font-headline text-xs font-bold transition-all {cardLimit ===
							limit
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200/80 bg-slate-50 text-slate-600 hover:bg-slate-100'}"
						>
							{limit === 0 ? 'All' : `${limit}`}
						</button>
					{/each}
				</div>
			</div>

			<!-- Show Pinyin / Phonetic Toggle -->
			{#if deckLanguage === 'chinese'}
				<div class="flex items-center justify-between pt-1">
					<div>
						<p class="font-headline text-xs font-bold text-slate-900">Show Pinyin Guide</p>
						<p class="font-sans text-[11px] text-slate-500">
							Display romanized pronunciation on front
						</p>
					</div>
					<button
						type="button"
						onclick={() => (showPinyin = !showPinyin)}
						class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out {showPinyin
							? 'bg-indigo-600'
							: 'bg-slate-200'}"
						aria-label="Toggle Pinyin"
					>
						<span
							class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out {showPinyin
								? 'translate-x-5'
								: 'translate-x-0'}"
						></span>
					</button>
				</div>
			{/if}
		</section>

		<!-- Primary Launch CTAs -->
		<div class="space-y-2.5">
			<a
				href={resolve(
					`/study/${deckId}?mode=${studyMode}&limit=${cardLimit}&pinyin=${showPinyin ? '1' : '0'}`
				)}
				class="flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
			>
				<Play size={18} strokeWidth={2.5} class="fill-current" />
				<span>Start Studying Now</span>
			</a>

			<a
				href={resolve(
					`/study/${deckId}?mode=${studyMode}&limit=${cardLimit}&pinyin=${showPinyin ? '1' : '0'}&autoplay=1`
				)}
				class="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/70 font-headline text-sm font-bold text-indigo-700 transition-all hover:bg-indigo-100/80 active:scale-[0.98]"
			>
				<PlayCircle size={18} strokeWidth={2.25} class="text-indigo-600" />
				<span>Autoplay Deck Hands-Free</span>
			</a>
		</div>
	{:else}
		<!-- VOCABULARY TABLE VIEW -->
		<section class="space-y-3">
			<!-- Table Controls & Filters -->
			<div class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-4">
				<div class="flex items-center gap-2">
					<!-- Search Bar -->
					<div class="relative flex-1">
						<Search
							size={16}
							strokeWidth={2.25}
							class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
						/>
						<input
							type="text"
							bind:value={tableSearch}
							placeholder="Search target word, pinyin, meaning..."
							class="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 py-2.5 pr-4 pl-10 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
						/>
					</div>

					{#if currentCustomDeck}
						<button
							type="button"
							onclick={() => (isSpreadsheetModalOpen = true)}
							class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl bg-indigo-600 px-3 py-2.5 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
						>
							<Plus size={15} strokeWidth={2.5} />
							<span>Spreadsheet Editor</span>
						</button>
					{/if}
				</div>

				<!-- Filter Chips -->
				<div class="flex flex-wrap items-center gap-1.5">
					<button
						type="button"
						onclick={() => (tableFilter = 'all')}
						class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {tableFilter ===
						'all'
							? 'bg-indigo-600 text-white'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					>
						All ({words.length})
					</button>

					<button
						type="button"
						onclick={() => (tableFilter = 'saved')}
						class="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {tableFilter ===
						'saved'
							? 'bg-amber-600 text-white'
							: 'bg-amber-50 text-amber-800 hover:bg-amber-100'}"
					>
						<Bookmark size={11} strokeWidth={2.5} class="fill-current" />
						<span>Saved ({savedWordNos.size})</span>
					</button>

					<button
						type="button"
						onclick={() => (tableFilter = 'due')}
						class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {tableFilter ===
						'due'
							? 'bg-rose-600 text-white'
							: 'bg-rose-50 text-rose-700 hover:bg-rose-100'}"
					>
						Due ({dueCount})
					</button>

					<button
						type="button"
						onclick={() => (tableFilter = 'learning')}
						class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {tableFilter ===
						'learning'
							? 'bg-amber-600 text-white'
							: 'bg-amber-50 text-amber-700 hover:bg-amber-100'}"
					>
						Learning ({learningCount})
					</button>

					<button
						type="button"
						onclick={() => (tableFilter = 'mastered')}
						class="cursor-pointer rounded-full px-3 py-1 font-headline text-[11px] font-bold transition-colors {tableFilter ===
						'mastered'
							? 'bg-emerald-600 text-white'
							: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
					>
						Mastered ({masteredCount})
					</button>
				</div>
			</div>

			<!-- Word Table Container -->
			{#if filteredTableWords.length === 0}
				<div
					class="shadow-card rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500"
				>
					<Search size={32} strokeWidth={1.5} class="mx-auto mb-2 text-slate-300" />
					<p class="font-headline text-sm font-bold text-slate-800">No words match this filter</p>
					<p class="mt-1 font-sans text-xs text-slate-400">
						Try clearing your search query or selecting a different status filter.
					</p>
				</div>
			{:else}
				<div class="shadow-card overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
					<div class="overflow-x-auto">
						<table class="w-full text-left font-sans text-xs">
							<thead
								class="border-b border-slate-100 bg-slate-50 font-headline text-[11px] font-bold text-slate-500 uppercase"
							>
								<tr>
									<th class="py-3 pr-2 pl-4 text-center">#</th>
									<th class="px-3 py-3">Word</th>
									{#if deckLanguage === 'chinese'}
										<th class="px-3 py-3">Pinyin</th>
									{/if}
									<th class="px-3 py-3">Meaning</th>
									<th class="px-3 py-3 text-center">Status</th>
									<th class="py-3 pr-4 pl-2 text-right">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each filteredTableWords as word (word.No)}
									{@const target =
										deckLanguage === 'chinese'
											? word['Chinese Word'] || ''
											: word['French Word'] || ''}
									{@const isSaved = savedWordNos.has(word.No)}
									{@const status = getWordStatus(word.No)}
									<tr class="transition-colors hover:bg-slate-50/70">
										<!-- No. -->
										<td
											class="py-3 pr-2 pl-4 text-center font-headline text-xs font-semibold text-slate-400"
										>
											{word.No}
										</td>

										<!-- Target Word -->
										<td class="px-3 py-3">
											<div class="flex flex-col">
												<span
													class="font-headline text-base font-bold text-slate-900 {deckLanguage ===
													'chinese'
														? 'font-hanzi'
														: ''}"
												>
													{target}
												</span>
												{#if word['Part of Speech']}
													<span
														class="py-0.2 mt-0.5 inline-block w-fit rounded-md bg-slate-100 px-1.5 font-headline text-[10px] font-bold text-slate-600 uppercase"
													>
														{word['Part of Speech']}
													</span>
												{/if}
											</div>
										</td>

										<!-- Pinyin / Romanization -->
										{#if deckLanguage === 'chinese'}
											<td class="px-3 py-3 font-headline text-xs font-bold text-indigo-600">
												{word.Pinyin || '—'}
											</td>
										{/if}

										<!-- Meaning & Example -->
										<td class="px-3 py-3">
											<p class="font-sans font-medium text-slate-800">{word['English Meaning']}</p>
											{#if deckLanguage === 'chinese' && word['Example (Chinese + Pinyin)']}
												<p class="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
													{word['Example (Chinese + Pinyin)']}
												</p>
											{:else if deckLanguage === 'french' && word['Example (French)']}
												<p class="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
													{word['Example (French)']}
												</p>
											{/if}
										</td>

										<!-- Status Badge -->
										<td class="px-3 py-3 text-center">
											{#if status === 'mastered'}
												<span
													class="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 font-headline text-[10px] font-bold text-emerald-700"
												>
													<CheckCircle2 size={11} strokeWidth={2.5} />
													<span>Mastered</span>
												</span>
											{:else if status === 'learning'}
												<span
													class="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 font-headline text-[10px] font-bold text-amber-700"
												>
													<Clock size={11} strokeWidth={2.5} />
													<span>Learning</span>
												</span>
											{:else if status === 'due'}
												<span
													class="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 font-headline text-[10px] font-bold text-rose-600"
												>
													<span>Due</span>
												</span>
											{:else}
												<span
													class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-headline text-[10px] font-bold text-slate-500"
												>
													New
												</span>
											{/if}
										</td>

										<!-- Action buttons -->
										<td class="py-3 pr-4 pl-2 text-right">
											<div class="flex items-center justify-end gap-1">
												<!-- Speak audio -->
												<button
													type="button"
													onclick={() => speakWord(target, deckLanguage)}
													aria-label="Listen to {target}"
													title="Play pronunciation"
													class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
												>
													<Volume2 size={16} strokeWidth={2} />
												</button>

												<!-- Bookmark toggle -->
												<button
													type="button"
													onclick={() => handleToggleSave(word.No)}
													aria-label={isSaved ? 'Remove from saved' : 'Save word'}
													title={isSaved ? 'Remove bookmark' : 'Bookmark word'}
													class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-transform hover:scale-110 active:scale-95 {isSaved
														? 'text-amber-500'
														: 'text-slate-300 hover:text-slate-500'}"
												>
													<Bookmark
														size={16}
														strokeWidth={2}
														class={isSaved ? 'fill-current' : ''}
													/>
												</button>

												<!-- Delete card from custom deck -->
												{#if currentCustomDeck}
													<button
														type="button"
														onclick={() => handleDeleteSingleWord(word.No)}
														aria-label="Delete word from deck"
														title="Delete word from deck"
														class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
													>
														<Trash2 size={15} strokeWidth={2} />
													</button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</section>
	{/if}
</main>

<!-- SPREADSHEET DECK EDITOR MODAL -->
<DeckSpreadsheetModal
	isOpen={isSpreadsheetModalOpen}
	deckToEdit={currentCustomDeck}
	onClose={() => (isSpreadsheetModalOpen = false)}
	onSave={handleSaveCustomDeck}
/>
