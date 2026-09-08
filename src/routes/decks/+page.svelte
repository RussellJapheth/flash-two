<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { onMount } from 'svelte';
	import {
		getAllProgress,
		getBuiltinPacks,
		getAllCustomDecks,
		saveCustomDeck,
		deleteCustomDeck,
		computeStreakStats
	} from '$lib/utils/storage';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';
	import { isCardDue, isCardMastered } from '$lib/utils/srs';
	import type { DeckSummary, CustomDeck, WordRecord, StreakStats } from '$lib/types';

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	let filterType = $state<'all' | 'chinese' | 'french' | 'custom'>('all');
	let searchQuery = $state('');
	let allDecks = $state<DeckSummary[]>([]);
	let customDecksRaw = $state<CustomDeck[]>([]);

	// Modal states
	let isCreateModalOpen = $state(false);
	let isImportModalOpen = $state(false);

	// Create Deck Form
	let newDeckName = $state('');
	let newDeckLang = $state<'chinese' | 'french'>('chinese');
	let newWords = $state<
		{ targetWord: string; phonetic: string; meaning: string; partOfSpeech: string; example: string }[]
	>([
		{ targetWord: '', phonetic: '', meaning: '', partOfSpeech: 'noun', example: '' }
	]);

	// Import Deck Form
	let importDeckName = $state('');
	let importDeckLang = $state<'chinese' | 'french'>('chinese');
	let importRawText = $state('');
	let importError = $state('');

	async function loadDecks() {
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);

		const chinesePacks = await getBuiltinPacks('chinese');
		const frenchPacks = await getBuiltinPacks('french');
		const customDecks = await getAllCustomDecks();
		customDecksRaw = customDecks;

		const summaries: DeckSummary[] = [];

		// Chinese packs
		for (const pack of chinesePacks) {
			let mastered = 0;
			let learning = 0;
			let due = 0;
			let correctSum = 0;
			let totalAttempts = 0;

			for (const word of pack.words) {
				const p = progress[`${pack.id}:${word.No}`];
				if (p) {
					if (isCardMastered(p)) mastered++;
					else learning++;
					if (isCardDue(p)) due++;
					correctSum += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++;
				}
			}

			const accuracy =
				totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

			summaries.push({
				id: pack.id,
				title: pack.title,
				language: 'chinese',
				totalCards: pack.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: false
			});
		}

		// French packs
		for (const pack of frenchPacks) {
			let mastered = 0;
			let learning = 0;
			let due = 0;
			let correctSum = 0;
			let totalAttempts = 0;

			for (const word of pack.words) {
				const p = progress[`${pack.id}:${word.No}`];
				if (p) {
					if (isCardMastered(p)) mastered++;
					else learning++;
					if (isCardDue(p)) due++;
					correctSum += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++;
				}
			}

			const accuracy =
				totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

			summaries.push({
				id: pack.id,
				title: pack.title,
				language: 'french',
				totalCards: pack.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: false
			});
		}

		// Custom Decks
		for (const deck of customDecks) {
			let mastered = 0;
			let learning = 0;
			let due = 0;
			let correctSum = 0;
			let totalAttempts = 0;

			for (const word of deck.words) {
				const p = progress[`${deck.id}:${word.No}`];
				if (p) {
					if (isCardMastered(p)) mastered++;
					else learning++;
					if (isCardDue(p)) due++;
					correctSum += p.correct || 0;
					totalAttempts += (p.correct || 0) + (p.wrong || 0);
				} else {
					due++;
				}
			}

			const accuracy =
				totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

			summaries.push({
				id: deck.id,
				title: deck.name,
				language: deck.language || 'chinese',
				totalCards: deck.words.length,
				masteredCards: mastered,
				learningCards: learning,
				dueCards: due,
				accuracy,
				isCustom: true
			});
		}

		allDecks = summaries;
	}

	let filteredDecks = $derived(
		allDecks.filter((deck) => {
			if (filterType === 'chinese' && (deck.language !== 'chinese' || deck.isCustom))
				return false;
			if (filterType === 'french' && (deck.language !== 'french' || deck.isCustom))
				return false;
			if (filterType === 'custom' && !deck.isCustom) return false;

			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return deck.title.toLowerCase().includes(q);
			}
			return true;
		})
	);

	function addWordRow() {
		newWords.push({
			targetWord: '',
			phonetic: '',
			meaning: '',
			partOfSpeech: 'noun',
			example: ''
		});
	}

	function removeWordRow(index: number) {
		if (newWords.length > 1) {
			newWords = newWords.filter((_, i) => i !== index);
		}
	}

	async function handleCreateDeck() {
		if (!newDeckName.trim()) return;

		const validWords: WordRecord[] = newWords
			.filter((w) => w.targetWord.trim() && w.meaning.trim())
			.map((w, idx) => ({
				No: idx + 1,
				'Chinese Word': newDeckLang === 'chinese' ? w.targetWord.trim() : undefined,
				'French Word': newDeckLang === 'french' ? w.targetWord.trim() : undefined,
				Pinyin: w.phonetic.trim() || undefined,
				'Part of Speech': w.partOfSpeech.trim() || 'noun',
				'English Meaning': w.meaning.trim(),
				'Example (Chinese + Pinyin)':
					newDeckLang === 'chinese' ? w.example.trim() || undefined : undefined,
				'Example (French)':
					newDeckLang === 'french' ? w.example.trim() || undefined : undefined
			}));

		if (validWords.length === 0) return;

		const newDeck: CustomDeck = {
			id: `custom-${Date.now()}`,
			name: newDeckName.trim(),
			words: validWords,
			language: newDeckLang,
			createdAt: Date.now()
		};

		await saveCustomDeck(newDeck);
		scheduleDebouncedSync();

		isCreateModalOpen = false;
		newDeckName = '';
		newWords = [{ targetWord: '', phonetic: '', meaning: '', partOfSpeech: 'noun', example: '' }];
		await loadDecks();
	}

	async function handleImportDeck() {
		importError = '';
		if (!importDeckName.trim() || !importRawText.trim()) {
			importError = 'Please provide both deck title and data.';
			return;
		}

		try {
			let words: WordRecord[] = [];
			const trimmed = importRawText.trim();

			if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
				// Parse JSON format
				const parsed = JSON.parse(trimmed);
				const array = Array.isArray(parsed) ? parsed : parsed.words;
				if (!Array.isArray(array)) throw new Error('JSON must contain an array of words');

				words = array.map((item, idx) => ({
					No: idx + 1,
					'Chinese Word': item['Chinese Word'] || item.word || item.target,
					'French Word': item['French Word'] || item.french || (importDeckLang === 'french' ? item.word : undefined),
					Pinyin: item.Pinyin || item.pinyin || item.phonetic,
					'Part of Speech': item['Part of Speech'] || item.pos || 'noun',
					'English Meaning': item['English Meaning'] || item.meaning || item.translation || '',
					'Example (Chinese + Pinyin)': item['Example (Chinese + Pinyin)'] || item.example,
					'Example (French)': item['Example (French)'] || item.example
				}));
			} else {
				// Parse CSV (Word, Meaning, Phonetic, POS, Example)
				const lines = trimmed.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
				words = lines.map((line, idx) => {
					const parts = line.split(',').map((p) => p.trim());
					const targetWord = parts[0] || '';
					const meaning = parts[1] || '';
					const phonetic = parts[2] || '';
					const pos = parts[3] || 'noun';
					const example = parts[4] || '';

					return {
						No: idx + 1,
						'Chinese Word': importDeckLang === 'chinese' ? targetWord : undefined,
						'French Word': importDeckLang === 'french' ? targetWord : undefined,
						Pinyin: phonetic || undefined,
						'Part of Speech': pos,
						'English Meaning': meaning,
						'Example (Chinese + Pinyin)': importDeckLang === 'chinese' ? example || undefined : undefined,
						'Example (French)': importDeckLang === 'french' ? example || undefined : undefined
					};
				});
			}

			if (words.length === 0) {
				importError = 'No valid words could be parsed.';
				return;
			}

			const customDeck: CustomDeck = {
				id: `custom-${Date.now()}`,
				name: importDeckName.trim(),
				words,
				language: importDeckLang,
				createdAt: Date.now()
			};

			await saveCustomDeck(customDeck);
			scheduleDebouncedSync();

			isImportModalOpen = false;
			importDeckName = '';
			importRawText = '';
			await loadDecks();
		} catch (e: unknown) {
			importError = e instanceof Error ? e.message : 'Failed to parse deck data.';
		}
	}

	async function handleDeleteCustomDeck(id: string) {
		if (confirm('Are you sure you want to delete this custom deck?')) {
			await deleteCustomDeck(id);
			scheduleDebouncedSync();
			await loadDecks();
		}
	}

	onMount(() => {
		loadDecks();
	});
</script>

<svelte:head>
	<title>FlashCards — My Decks</title>
</svelte:head>

<TopHeader title="My Decks" streak={streakStats.currentStreak} />

<main class="flex-1 px-4 pt-3 pb-8 space-y-4">
	<!-- Top Bar Actions -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<!-- Create New Deck Button -->
			<button
				type="button"
				onclick={() => (isCreateModalOpen = true)}
				class="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3.5 py-1.5 font-headline text-xs font-bold text-white shadow-sm transition-all hover:bg-primary active:scale-95"
			>
				<span class="material-symbols-outlined text-[18px]">add</span>
				<span>Create Deck</span>
			</button>

			<!-- Import Deck Button -->
			<button
				type="button"
				onclick={() => (isImportModalOpen = true)}
				class="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95"
			>
				<span class="material-symbols-outlined text-[18px]">upload_file</span>
				<span>Import</span>
			</button>
		</div>

		<span class="font-headline text-xs font-bold text-on-surface-variant">
			{filteredDecks.length} Decks
		</span>
	</div>

	<!-- Search Input -->
	<div class="relative">
		<span class="material-symbols-outlined absolute left-3.5 top-2.5 text-[20px] text-outline">
			search
		</span>
		<input
			type="text"
			placeholder="Search decks..."
			bind:value={searchQuery}
			class="w-full rounded-2xl border border-surface-container bg-surface-container-lowest pl-10 pr-4 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
		/>
	</div>

	<!-- Filter Chips -->
	<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
		{#each ['all', 'chinese', 'french', 'custom'] as f}
			<button
				type="button"
				onclick={() => (filterType = f as typeof filterType)}
				class="rounded-full px-4 py-1.5 font-headline text-xs font-bold capitalize transition-all {filterType ===
				f
					? 'bg-primary-container text-white shadow-sm'
					: 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}"
			>
				{f}
			</button>
		{/each}
	</div>

	<!-- Decks List -->
	<div class="space-y-3 pt-1">
		{#if filteredDecks.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-container p-8 text-center text-on-surface-variant"
			>
				<span class="material-symbols-outlined text-[40px] text-outline mb-2">folder_open</span>
				<p class="font-headline text-sm font-bold">No decks found</p>
				<p class="font-body text-xs mt-1">Try another filter or create a new custom deck.</p>
			</div>
		{:else}
			{#each filteredDecks as deck (deck.id)}
				<div
					class="relative flex flex-col justify-between rounded-2xl border border-surface-container bg-surface-container-lowest p-4 shadow-card hover:border-primary/30 transition-all"
				>
					<div class="flex items-start justify-between">
						<div>
							<div class="flex items-center gap-2 mb-1">
								<span
									class="rounded-full px-2.5 py-0.5 font-headline text-[10px] font-bold uppercase tracking-wider {deck.language ===
									'french'
										? 'bg-secondary-fixed text-on-secondary-fixed'
										: 'bg-primary-fixed text-primary'}"
								>
									{deck.language}
									{#if deck.isCustom}
										• Custom
									{/if}
								</span>

								{#if deck.dueCards > 0}
									<span class="rounded-full bg-error-container px-2 py-0.5 text-[10px] font-bold text-on-error-container">
										{deck.dueCards} due
									</span>
								{/if}
							</div>

							<h3 class="font-headline text-base font-bold text-on-surface">
								{deck.title}
							</h3>

							<div class="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
								<span>{deck.totalCards} words</span>
								<span>•</span>
								<span>{deck.masteredCards} mastered</span>
								{#if deck.accuracy > 0}
									<span>•</span>
									<span class="font-semibold text-tertiary-container">{deck.accuracy}% acc</span>
								{/if}
							</div>
						</div>

						{#if deck.isCustom}
							<button
								type="button"
								onclick={() => handleDeleteCustomDeck(deck.id)}
								title="Delete Custom Deck"
								class="flex h-8 w-8 items-center justify-center rounded-full text-outline hover:bg-red-50 hover:text-red-600 transition-colors"
							>
								<span class="material-symbols-outlined text-[18px]">delete</span>
							</button>
						{/if}
					</div>

					<div class="mt-4 flex items-center gap-3">
						<div class="flex-1">
							<ProgressBar
								value={deck.masteredCards}
								max={deck.totalCards}
								variant="emerald"
								height="h-2"
							/>
						</div>
						<a
							href="/deck/{deck.id}/preview"
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-white transition-transform hover:bg-primary active:scale-95"
						>
							<span class="material-symbols-outlined text-[20px]">play_arrow</span>
						</a>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</main>

<!-- CREATE DECK MODAL -->
{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
	>
		<div
			class="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-surface-container bg-surface-container-lowest p-6 shadow-2xl"
		>
			<div class="flex items-center justify-between pb-3 border-b border-surface-container">
				<h3 class="font-headline text-lg font-bold text-on-surface">Create Custom Deck</h3>
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="text-outline hover:text-on-surface"
				>
					<span class="material-symbols-outlined text-[22px]">close</span>
				</button>
			</div>

			<div class="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
				<div>
					<label for="new-deck-name" class="font-headline text-xs font-bold text-on-surface block">Deck Name</label>
					<input
						id="new-deck-name"
						type="text"
						placeholder="e.g. Travel Chinese / Business French"
						bind:value={newDeckName}
						class="mt-1 w-full rounded-2xl border border-surface-container px-3.5 py-2 font-body text-sm text-on-surface focus:border-primary focus:outline-none"
					/>
				</div>

				<div>
					<span class="font-headline text-xs font-bold text-on-surface block">Target Language</span>
					<div class="mt-1 flex gap-2">
						<button
							type="button"
							onclick={() => (newDeckLang = 'chinese')}
							class="flex-1 rounded-xl py-2 font-headline text-xs font-bold {newDeckLang ===
							'chinese'
								? 'bg-primary text-white'
								: 'bg-surface-container text-on-surface'}"
						>
							Chinese
						</button>
						<button
							type="button"
							onclick={() => (newDeckLang = 'french')}
							class="flex-1 rounded-xl py-2 font-headline text-xs font-bold {newDeckLang ===
							'french'
								? 'bg-primary text-white'
								: 'bg-surface-container text-on-surface'}"
						>
							French
						</button>
					</div>
				</div>

				<!-- Words List Inputs -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<span class="font-headline text-xs font-bold text-on-surface block">Vocabulary Cards</span>
						<button
							type="button"
							onclick={addWordRow}
							class="text-xs font-bold text-primary hover:underline"
						>
							+ Add Card
						</button>
					</div>

					<div class="space-y-3">
						{#each newWords as word, idx}
							<div
								class="relative rounded-2xl border border-surface-container bg-surface-container-low p-3 space-y-2"
							>
								<div class="flex items-center justify-between">
									<span class="font-headline text-[11px] font-bold text-on-surface-variant"
										>Card #{idx + 1}</span
									>
									{#if newWords.length > 1}
										<button
											type="button"
											onclick={() => removeWordRow(idx)}
											class="text-xs text-rose-500 hover:text-rose-700 font-bold"
										>
											Remove
										</button>
									{/if}
								</div>

								<div class="grid grid-cols-2 gap-2">
									<input
										type="text"
										placeholder={newDeckLang === 'chinese' ? 'Word (Hanzi)' : 'French Word'}
										bind:value={word.targetWord}
										class="rounded-xl border border-surface-container-highest px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
									/>
									<input
										type="text"
										placeholder={newDeckLang === 'chinese' ? 'Pinyin' : 'Phonetic (optional)'}
										bind:value={word.phonetic}
										class="rounded-xl border border-surface-container-highest px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
									/>
								</div>

								<input
									type="text"
									placeholder="English Meaning"
									bind:value={word.meaning}
									class="w-full rounded-xl border border-surface-container-highest px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
								/>

								<input
									type="text"
									placeholder="Example sentence (optional)"
									bind:value={word.example}
									class="w-full rounded-xl border border-surface-container-highest px-3 py-1.5 text-xs text-on-surface focus:border-primary focus:outline-none"
								/>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="pt-3 border-t border-surface-container flex gap-2">
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="flex-1 rounded-full bg-surface-container py-2.5 font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleCreateDeck}
					class="flex-1 rounded-full bg-primary-container py-2.5 font-headline text-xs font-bold text-white hover:bg-primary shadow-sm"
				>
					Create Deck
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- IMPORT DECK MODAL -->
{#if isImportModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
	>
		<div
			class="w-full max-w-md rounded-3xl border border-surface-container bg-surface-container-lowest p-6 shadow-2xl"
		>
			<div class="flex items-center justify-between pb-3 border-b border-surface-container">
				<h3 class="font-headline text-lg font-bold text-on-surface">Import Deck (JSON or CSV)</h3>
				<button
					type="button"
					onclick={() => (isImportModalOpen = false)}
					class="text-outline hover:text-on-surface"
				>
					<span class="material-symbols-outlined text-[22px]">close</span>
				</button>
			</div>

			<div class="space-y-3 py-4">
				<div>
					<label for="import-deck-name" class="font-headline text-xs font-bold text-on-surface block">Deck Title</label>
					<input
						id="import-deck-name"
						type="text"
						placeholder="e.g. HSK 2 Practice Set"
						bind:value={importDeckName}
						class="mt-1 w-full rounded-2xl border border-surface-container px-3.5 py-2 font-body text-sm text-on-surface focus:border-primary focus:outline-none"
					/>
				</div>

				<div>
					<span class="font-headline text-xs font-bold text-on-surface block">Language</span>
					<div class="mt-1 flex gap-2">
						<button
							type="button"
							onclick={() => (importDeckLang = 'chinese')}
							class="flex-1 rounded-xl py-2 font-headline text-xs font-bold {importDeckLang ===
							'chinese'
								? 'bg-primary text-white'
								: 'bg-surface-container text-on-surface'}"
						>
							Chinese
						</button>
						<button
							type="button"
							onclick={() => (importDeckLang = 'french')}
							class="flex-1 rounded-xl py-2 font-headline text-xs font-bold {importDeckLang ===
							'french'
								? 'bg-primary text-white'
								: 'bg-surface-container text-on-surface'}"
						>
							French
						</button>
					</div>
				</div>

				<div>
					<label for="import-raw-data" class="font-headline text-xs font-bold text-on-surface block">Paste JSON or CSV</label>
					<p class="text-[11px] text-on-surface-variant">
						CSV format: <code>Word, Meaning, Phonetic, PartOfSpeech, Example</code>
					</p>
					<textarea
						id="import-raw-data"
						rows="6"
						placeholder={`你好, Hello, nǐ hǎo, noun, 你好世界\n再见, Goodbye, zài jiàn, verb, 明天见`}
						bind:value={importRawText}
						class="mt-1.5 w-full rounded-2xl border border-surface-container p-3 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
					></textarea>
				</div>

				{#if importError}
					<p class="text-xs font-semibold text-rose-600">{importError}</p>
				{/if}
			</div>

			<div class="pt-2 flex gap-2">
				<button
					type="button"
					onclick={() => (isImportModalOpen = false)}
					class="flex-1 rounded-full bg-surface-container py-2.5 font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleImportDeck}
					class="flex-1 rounded-full bg-primary-container py-2.5 font-headline text-xs font-bold text-white hover:bg-primary shadow-sm"
				>
					Import Deck
				</button>
			</div>
		</div>
	</div>
{/if}
