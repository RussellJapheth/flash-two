<script lang="ts">
	import { onMount } from 'svelte';
	import {
		BookOpen,
		Search,
		X,
		Bookmark,
		BookmarkCheck,
		Edit3,
		Check,
		AlertCircle,
		Loader2,
		PlusCircle,
		FileText,
		Volume2
	} from 'lucide-svelte';
	import type { WordRecord, CustomDeck } from '$lib/types';
	import { getSavedLanguage } from '$lib/utils/storage';
	import { speakWord } from '$lib/utils/audio';
	import {
		searchDictionary,
		getPersonalDictionaryDeck,
		savePersonalWord,
		removePersonalWord
	} from '$lib/utils/dictionary';

	let isOpen = $state(false);
	let modalTab = $state<'search' | 'add_note'>('search');
	let query = $state('');
	let results = $state<WordRecord[]>([]);
	let isSearching = $state(false);
	let currentLanguage = $state<'chinese' | 'french'>('chinese');
	let personalDeck = $state<CustomDeck | null>(null);
	let editingNotesMap = $state<Record<string, string>>({});
	let savedSuccessMsg = $state<string | null>(null);

	// Custom note form fields
	let customWord = $state('');
	let customPinyin = $state('');
	let customMeaning = $state('');
	let customNoteText = $state('');

	// Derived set of saved word keys for fast check
	let savedWordKeys = $derived(
		new Set(personalDeck?.words.map((w) => w['Chinese Word'] || `${w.No}`) || [])
	);

	onMount(() => {
		loadState();
	});

	async function loadState() {
		currentLanguage = getSavedLanguage();
		if (currentLanguage === 'chinese') {
			personalDeck = await getPersonalDictionaryDeck();
		}
	}

	function handleOpen() {
		loadState();
		isOpen = true;
	}

	function handleClose() {
		isOpen = false;
		query = '';
		results = [];
		savedSuccessMsg = null;
		modalTab = 'search';
	}

	async function handleCreateCustomNote() {
		if (!customWord.trim() && !customNoteText.trim()) return;

		const wordRecord: WordRecord = {
			No: Date.now(),
			'Chinese Word': customWord.trim() || 'Note',
			Pinyin: customPinyin.trim() || undefined,
			'Part of Speech': 'Personal Note',
			'English Meaning': customMeaning.trim() || 'Custom Note',
			customNote: customNoteText.trim()
		};

		personalDeck = await savePersonalWord(wordRecord, customNoteText.trim());
		showToast(`Saved note "${wordRecord['Chinese Word']}" to Personal Dictionary!`);

		// Reset form
		customWord = '';
		customPinyin = '';
		customMeaning = '';
		customNoteText = '';
		modalTab = 'search';
	}

	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		clearTimeout(searchTimeout);

		if (!query.trim()) {
			results = [];
			isSearching = false;
			return;
		}

		isSearching = true;
		searchTimeout = setTimeout(async () => {
			if (currentLanguage === 'chinese') {
				results = await searchDictionary(query);
			} else {
				results = [];
			}
			isSearching = false;
		}, 150);
	}

	async function toggleSave(word: WordRecord) {
		const zh = word['Chinese Word'] || '';
		if (!zh) return;

		const isSaved = savedWordKeys.has(zh);

		if (isSaved) {
			personalDeck = await removePersonalWord(zh);
			showToast(`Removed "${zh}" from Personal Dictionary`);
		} else {
			const note = editingNotesMap[zh] ?? word.customNote;
			personalDeck = await savePersonalWord(word, note);
			showToast(`Saved "${zh}" to Personal Dictionary!`);
		}
	}

	async function handleSaveNote(word: WordRecord) {
		const zh = word['Chinese Word'] || '';
		if (!zh) return;

		const note = editingNotesMap[zh];
		personalDeck = await savePersonalWord(word, note);
		showToast(`Updated note for "${zh}"`);
	}

	function showToast(msg: string) {
		savedSuccessMsg = msg;
		setTimeout(() => {
			if (savedSuccessMsg === msg) savedSuccessMsg = null;
		}, 2500);
	}

	function getSavedNote(word: WordRecord): string {
		const zh = word['Chinese Word'] || '';
		const saved = personalDeck?.words.find((w) => w['Chinese Word'] === zh);
		return editingNotesMap[zh] !== undefined
			? editingNotesMap[zh]
			: saved?.customNote || word.customNote || '';
	}

	function updateNoteState(zh: string, val: string) {
		editingNotesMap[zh] = val;
	}
</script>

<!-- Floating Dictionary Trigger Button -->
<button
	type="button"
	onclick={handleOpen}
	aria-label="Open Dictionary Lookup"
	title="Open Dictionary"
	class="fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95 sm:right-[calc(50%-13rem)]"
>
	<BookOpen size={22} strokeWidth={2.25} />
</button>

<!-- Modal Container -->
{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dictionary-modal-title"
	>
		<!-- Modal Backdrop click to dismiss -->
		<button
			type="button"
			class="absolute inset-0 cursor-default border-0 bg-transparent"
			onclick={handleClose}
			aria-label="Close modal backdrop"
		></button>

		<!-- Modal Content Box -->
		<div
			class="animate-in slide-in-from-bottom relative flex max-h-[85vh] w-full flex-col rounded-t-3xl border border-slate-200 bg-white shadow-xl duration-250 sm:max-w-md sm:rounded-3xl"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
					>
						<BookOpen size={20} strokeWidth={2.25} />
					</div>
					<div>
						<h2
							id="dictionary-modal-title"
							class="font-headline text-lg font-extrabold text-slate-900"
						>
							Dictionary & Notes
						</h2>
						<p class="font-sans text-xs text-slate-500">
							{currentLanguage === 'chinese' ? 'Search words or add personal notes' : 'French Mode'}
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={handleClose}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Tab Switcher inside Modal -->
			{#if currentLanguage === 'chinese'}
				<div class="flex border-b border-slate-100 px-5 pt-1">
					<button
						type="button"
						onclick={() => (modalTab = 'search')}
						class="flex items-center gap-1.5 border-b-2 px-3 py-2 font-headline text-xs font-bold transition-all {modalTab ===
						'search'
							? 'border-indigo-600 text-indigo-600'
							: 'border-transparent text-slate-400 hover:text-slate-600'}"
					>
						<Search size={14} />
						<span>Search Dictionary</span>
					</button>
					<button
						type="button"
						onclick={() => (modalTab = 'add_note')}
						class="flex items-center gap-1.5 border-b-2 px-3 py-2 font-headline text-xs font-bold transition-all {modalTab ===
						'add_note'
							? 'border-indigo-600 text-indigo-600'
							: 'border-transparent text-slate-400 hover:text-slate-600'}"
					>
						<PlusCircle size={14} />
						<span>Add New Note</span>
					</button>
				</div>
			{/if}

			<!-- Success Toast Banner -->
			{#if savedSuccessMsg}
				<div
					class="flex items-center gap-2 bg-emerald-50 px-5 py-2 font-headline text-xs font-semibold text-emerald-800 transition-all"
				>
					<Check size={14} class="text-emerald-600" />
					<span>{savedSuccessMsg}</span>
				</div>
			{/if}

			<!-- Modal Body -->
			<div class="flex-1 space-y-4 overflow-y-auto p-5">
				{#if currentLanguage === 'french'}
					<!-- French Mode Unavailable Notice -->
					<div class="my-6 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5 text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700"
						>
							<AlertCircle size={24} />
						</div>
						<h3 class="font-headline text-base font-bold text-amber-900">
							Dictionary Unavailable in French Mode
						</h3>
						<p class="mt-1 font-sans text-xs leading-relaxed text-amber-800/90">
							The comprehensive dictionary lookup is currently available for Chinese mode. French
							dictionary support will be arriving in a future update!
						</p>
					</div>
				{:else if modalTab === 'add_note'}
					<!-- Create New Custom Note Form -->
					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleCreateCustomNote();
						}}
						class="space-y-3 pt-1"
					>
						<div>
							<label
								for="custom-word-input"
								class="mb-1 block font-headline text-xs font-bold text-slate-800"
							>
								Word / Hanzi / Title *
							</label>
							<input
								id="custom-word-input"
								type="text"
								bind:value={customWord}
								placeholder="e.g. 学习 or Important Note"
								required
								class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 font-sans text-sm text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
							/>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<div>
								<label
									for="custom-pinyin-input"
									class="mb-1 block font-headline text-xs font-bold text-slate-800"
								>
									Pinyin (Optional)
								</label>
								<input
									id="custom-pinyin-input"
									type="text"
									bind:value={customPinyin}
									placeholder="e.g. xuéxí"
									class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
								/>
							</div>
							<div>
								<label
									for="custom-meaning-input"
									class="mb-1 block font-headline text-xs font-bold text-slate-800"
								>
									Meaning (Optional)
								</label>
								<input
									id="custom-meaning-input"
									type="text"
									bind:value={customMeaning}
									placeholder="e.g. to study"
									class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 font-sans text-xs text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
								/>
							</div>
						</div>

						<div>
							<label
								for="custom-note-textarea"
								class="mb-1 block font-headline text-xs font-bold text-slate-800"
							>
								Personal Notes / Example Sentence
							</label>
							<textarea
								id="custom-note-textarea"
								rows={3}
								bind:value={customNoteText}
								placeholder="Write your custom notes, mnemonic, or example sentence here..."
								class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 font-headline text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
						>
							<FileText size={16} />
							<span>Save Note to Personal Dictionary</span>
						</button>
					</form>
				{:else}
					<!-- Chinese Search Bar -->
					<div class="relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"
						>
							{#if isSearching}
								<Loader2 size={18} class="animate-spin text-indigo-600" />
							{:else}
								<Search size={18} />
							{/if}
						</div>
						<input
							type="text"
							value={query}
							oninput={handleInput}
							placeholder="Lookup word (e.g. 你好, nihao, hello)..."
							class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-2.5 pr-9 pl-10 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none"
						/>
						{#if query}
							<button
								type="button"
								onclick={() => {
									query = '';
									results = [];
								}}
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
							>
								<X size={16} />
							</button>
						{/if}
					</div>

					<!-- Search Results Container -->
					{#if isSearching && results.length === 0}
						<div class="py-10 text-center font-sans text-xs text-slate-400">
							Searching CC-CEDICT & vocabulary dictionary...
						</div>
					{:else if query.trim() && results.length === 0}
						<div class="py-10 text-center font-sans">
							<p class="text-sm font-semibold text-slate-700">No matching words found</p>
							<p class="mt-1 text-xs text-slate-400">
								Try searching by Chinese characters, Pinyin, or English
							</p>
						</div>
					{:else if results.length > 0}
						<div class="space-y-3">
							<p class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
								Results ({results.length})
							</p>

							{#each results as word (word.No + '_' + (word['Chinese Word'] || ''))}
								{@const zh = word['Chinese Word'] || ''}
								{@const isSaved = savedWordKeys.has(zh)}
								{@const note = getSavedNote(word)}

								<div
									class="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-indigo-200"
								>
									<div class="flex items-start justify-between gap-3">
										<div>
											<div class="flex items-center gap-2">
												<span class="font-headline text-xl font-black text-slate-900">{zh}</span>
												<button
													type="button"
													onclick={() => speakWord(zh, 'chinese')}
													title="Listen to pronunciation"
													aria-label="Listen to {zh}"
													class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white active:scale-95"
												>
													<Volume2 size={14} strokeWidth={2} />
												</button>
												{#if word.Pinyin}
													<span class="font-headline text-xs font-bold text-indigo-600"
														>{word.Pinyin}</span
													>
												{/if}
											</div>
											{#if word['Part of Speech']}
												<span
													class="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-headline text-[10px] font-bold text-slate-600"
												>
													{word['Part of Speech']}
												</span>
											{/if}
										</div>

										<!-- Save / Unsave Button -->
										<button
											type="button"
											onclick={() => toggleSave(word)}
											class="flex h-9 w-9 items-center justify-center rounded-xl transition-all {isSaved
												? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
												: 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}"
											title={isSaved
												? 'Remove from Personal Dictionary'
												: 'Save to Personal Dictionary'}
										>
											{#if isSaved}
												<BookmarkCheck size={18} />
											{:else}
												<Bookmark size={18} />
											{/if}
										</button>
									</div>

									<!-- English Meaning -->
									<p class="mt-2 font-sans text-xs leading-relaxed font-medium text-slate-700">
										{word['English Meaning']}
									</p>

									<!-- Example sentence if available -->
									{#if word['Example (Chinese + Pinyin)']}
										<p
											class="mt-2 rounded-xl bg-slate-50 p-2.5 font-sans text-xs text-slate-600 italic"
										>
											{word['Example (Chinese + Pinyin)']}
										</p>
									{/if}

									<!-- Personal Note Input Section -->
									<div class="mt-3 border-t border-slate-100 pt-3">
										<div
											class="mb-1 flex items-center justify-between font-headline text-xs font-bold text-slate-500"
										>
											<span class="flex items-center gap-1.5 text-[11px]">
												<Edit3 size={13} />
												Personal Notes / Example Sentence
											</span>
											{#if isSaved}
												<button
													type="button"
													onclick={() => handleSaveNote(word)}
													class="text-[11px] font-bold text-indigo-600 hover:underline"
												>
													Save Note
												</button>
											{/if}
										</div>
										<textarea
											rows={2}
											value={note}
											oninput={(e) => updateNoteState(zh, (e.target as HTMLTextAreaElement).value)}
											placeholder="Add a custom note or example sentence for this word..."
											class="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 font-sans text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
										></textarea>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Default Empty State inside Modal -->
						<div class="py-12 text-center">
							<div
								class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
							>
								<Search size={22} />
							</div>
							<p class="font-headline text-sm font-extrabold text-slate-800">Lookup Any Word</p>
							<p class="mx-auto mt-1 max-w-xs font-sans text-xs text-slate-500">
								Type characters, Pinyin (e.g. nihao), or English to search the comprehensive Chinese
								dictionary.
							</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}
