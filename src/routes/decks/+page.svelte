<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import DeckCard from '$lib/components/DeckCard.svelte';
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
	import { Plus, FileUp, Search, FolderOpen, Trash2, Play, X, Sparkles } from 'lucide-svelte';

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
		{
			targetWord: string;
			phonetic: string;
			meaning: string;
			partOfSpeech: string;
			example: string;
		}[]
	>([{ targetWord: '', phonetic: '', meaning: '', partOfSpeech: 'noun', example: '' }]);

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
				const p =
					progress[`${pack.id}:${word.No}`] ||
					progress[`${pack.id.replace('chinese-', '')}:${word.No}`];
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

			const accuracy = totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

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
				const p =
					progress[`${pack.id}:${word.No}`] ||
					progress[`${pack.id.replace('french-', '')}:${word.No}`];
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

			const accuracy = totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

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

			const accuracy = totalAttempts > 0 ? Math.round((correctSum / totalAttempts) * 100) : 0;

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
			if (filterType === 'chinese' && (deck.language !== 'chinese' || deck.isCustom)) return false;
			if (filterType === 'french' && (deck.language !== 'french' || deck.isCustom)) return false;
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
				'Example (French)': newDeckLang === 'french' ? w.example.trim() || undefined : undefined
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
					'French Word':
						item['French Word'] ||
						item.french ||
						(importDeckLang === 'french' ? item.word : undefined),
					Pinyin: item.Pinyin || item.pinyin || item.phonetic,
					'Part of Speech': item['Part of Speech'] || item.pos || 'noun',
					'English Meaning': item['English Meaning'] || item.meaning || item.translation || '',
					'Example (Chinese + Pinyin)': item['Example (Chinese + Pinyin)'] || item.example,
					'Example (French)': item['Example (French)'] || item.example
				}));
			} else {
				// Parse CSV (Word, Meaning, Phonetic, POS, Example)
				const lines = trimmed
					.split('\n')
					.map((l) => l.trim())
					.filter((l) => l.length > 0);
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
						'Example (Chinese + Pinyin)':
							importDeckLang === 'chinese' ? example || undefined : undefined,
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

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Top Bar Actions -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<!-- Create New Deck Button -->
			<button
				type="button"
				onclick={() => (isCreateModalOpen = true)}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
			>
				<Plus size={16} strokeWidth={2.5} />
				<span>Create Deck</span>
			</button>

			<!-- Import Deck Button -->
			<button
				type="button"
				onclick={() => (isImportModalOpen = true)}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 font-headline text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 active:scale-95"
			>
				<FileUp size={16} strokeWidth={2} />
				<span>Import</span>
			</button>
		</div>

		<span class="font-headline text-xs font-bold text-slate-500">
			{filteredDecks.length} Decks
		</span>
	</div>

	<!-- Search Input -->
	<div class="relative">
		<Search size={18} strokeWidth={2} class="absolute top-2.5 left-3.5 text-slate-400" />
		<input
			type="text"
			placeholder="Search decks..."
			bind:value={searchQuery}
			class="w-full rounded-2xl border border-slate-200/80 bg-white py-2 pr-4 pl-10 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
		/>
	</div>

	<!-- Filter Chips (Segmented Pill Pattern) -->
	<div class="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
		{#each ['all', 'chinese', 'french', 'custom'] as f}
			<button
				type="button"
				onclick={() => (filterType = f as typeof filterType)}
				class="cursor-pointer rounded-xl px-3.5 py-1.5 font-headline text-xs font-bold capitalize transition-all {filterType ===
				f
					? 'bg-indigo-600 text-white shadow-xs'
					: 'border border-slate-200/60 bg-white text-slate-600 hover:bg-slate-50'}"
			>
				{f}
			</button>
		{/each}
	</div>

	<!-- Decks List -->
	<div class="space-y-2.5 pt-1">
		{#if filteredDecks.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500"
			>
				<FolderOpen size={36} strokeWidth={1.5} class="mb-2 text-slate-400" />
				<p class="font-headline text-sm font-bold text-slate-800">No decks found</p>
				<p class="mt-1 font-sans text-xs text-slate-400">
					Try another filter or create a new custom deck.
				</p>
			</div>
		{:else}
			{#each filteredDecks as deck (deck.id)}
				<div class="relative">
					<DeckCard {deck} />
					{#if deck.isCustom}
						<button
							type="button"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleDeleteCustomDeck(deck.id);
							}}
							title="Delete Custom Deck"
							aria-label="Delete {deck.title}"
							class="absolute top-3 right-12 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
						>
							<Trash2 size={16} strokeWidth={2} />
						</button>
					{/if}
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
			class="shadow-sheet flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-6"
		>
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<h3 class="font-headline text-lg font-extrabold text-slate-900">Create Custom Deck</h3>
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					aria-label="Close"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
				>
					<X size={18} strokeWidth={2} />
				</button>
			</div>

			<div class="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
				<div>
					<label for="new-deck-name" class="block font-headline text-xs font-bold text-slate-900"
						>Deck Name</label
					>
					<input
						id="new-deck-name"
						type="text"
						placeholder="e.g. Travel Chinese / Business French"
						bind:value={newDeckName}
						class="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2 font-sans text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
					/>
				</div>

				<div>
					<span class="block font-headline text-xs font-bold text-slate-900">Target Language</span>
					<div class="mt-1 flex gap-2">
						<button
							type="button"
							onclick={() => (newDeckLang = 'chinese')}
							class="flex-1 cursor-pointer rounded-xl py-2 font-headline text-xs font-bold transition-all {newDeckLang ===
							'chinese'
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
						>
							Chinese
						</button>
						<button
							type="button"
							onclick={() => (newDeckLang = 'french')}
							class="flex-1 cursor-pointer rounded-xl py-2 font-headline text-xs font-bold transition-all {newDeckLang ===
							'french'
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
						>
							French
						</button>
					</div>
				</div>

				<!-- Words List Inputs -->
				<div>
					<div class="mb-2 flex items-center justify-between">
						<span class="block font-headline text-xs font-bold text-slate-900"
							>Vocabulary Cards</span
						>
						<button
							type="button"
							onclick={addWordRow}
							class="font-headline text-xs font-bold text-indigo-600 hover:underline"
						>
							+ Add Card
						</button>
					</div>

					<div class="space-y-3">
						{#each newWords as word, idx}
							<div
								class="relative space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5"
							>
								<div class="flex items-center justify-between">
									<span class="font-headline text-[11px] font-bold text-slate-600"
										>Card #{idx + 1}</span
									>
									{#if newWords.length > 1}
										<button
											type="button"
											onclick={() => removeWordRow(idx)}
											class="font-headline text-xs font-bold text-rose-500 hover:text-rose-700"
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
										class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
									/>
									<input
										type="text"
										placeholder={newDeckLang === 'chinese' ? 'Pinyin' : 'Phonetic (optional)'}
										bind:value={word.phonetic}
										class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
									/>
								</div>

								<input
									type="text"
									placeholder="English Meaning"
									bind:value={word.meaning}
									class="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
								/>

								<input
									type="text"
									placeholder="Example sentence (optional)"
									bind:value={word.example}
									class="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
								/>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex gap-2 border-t border-slate-100 pt-3">
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="flex-1 cursor-pointer rounded-2xl bg-slate-100 py-2.5 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleCreateDeck}
					class="flex-1 cursor-pointer rounded-2xl bg-indigo-600 py-2.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
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
			class="shadow-sheet w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6"
		>
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<h3 class="font-headline text-lg font-extrabold text-slate-900">Import Deck (JSON or CSV)</h3>
				<button
					type="button"
					onclick={() => (isImportModalOpen = false)}
					aria-label="Close"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
				>
					<X size={18} strokeWidth={2} />
				</button>
			</div>

			<div class="space-y-3 py-4">
				<div>
					<label
						for="import-deck-name"
						class="block font-headline text-xs font-bold text-slate-900">Deck Title</label
					>
					<input
						id="import-deck-name"
						type="text"
						placeholder="e.g. HSK 2 Practice Set"
						bind:value={importDeckName}
						class="mt-1 w-full rounded-2xl border border-slate-200 px-3.5 py-2 font-sans text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
					/>
				</div>

				<div>
					<span class="block font-headline text-xs font-bold text-slate-900">Language</span>
					<div class="mt-1 flex gap-2">
						<button
							type="button"
							onclick={() => (importDeckLang = 'chinese')}
							class="flex-1 cursor-pointer rounded-xl py-2 font-headline text-xs font-bold transition-all {importDeckLang ===
							'chinese'
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
						>
							Chinese
						</button>
						<button
							type="button"
							onclick={() => (importDeckLang = 'french')}
							class="flex-1 cursor-pointer rounded-xl py-2 font-headline text-xs font-bold transition-all {importDeckLang ===
							'french'
								? 'bg-indigo-600 text-white shadow-xs'
								: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}"
						>
							French
						</button>
					</div>
				</div>

				<div>
					<label for="import-raw-data" class="block font-headline text-xs font-bold text-slate-900"
						>Paste JSON or CSV</label
					>
					<p class="text-[11px] text-slate-500">
						CSV format: <code>Word, Meaning, Phonetic, PartOfSpeech, Example</code>
					</p>
					<textarea
						id="import-raw-data"
						rows="6"
						placeholder={`你好, Hello, nǐ hǎo, noun, 你好世界\n再见, Goodbye, zài jiàn, verb, 明天见`}
						bind:value={importRawText}
						class="mt-1.5 w-full rounded-2xl border border-slate-200 p-3 font-mono text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
					></textarea>
				</div>

				{#if importError}
					<p class="font-headline text-xs font-bold text-rose-600">{importError}</p>
				{/if}
			</div>

			<div class="flex gap-2 pt-2">
				<button
					type="button"
					onclick={() => (isImportModalOpen = false)}
					class="flex-1 cursor-pointer rounded-2xl bg-slate-100 py-2.5 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleImportDeck}
					class="flex-1 cursor-pointer rounded-2xl bg-indigo-600 py-2.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
				>
					Import Deck
				</button>
			</div>
		</div>
	</div>
{/if}
