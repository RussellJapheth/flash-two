<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import {
		getAllNotebookNotes,
		saveNotebookNote,
		deleteNotebookNote,
		togglePinNotebookNote,
		generatePinyin,
		exportNotesAsMarkdown
	} from '$lib/utils/notebookStorage';
	import { speakWord } from '$lib/utils/audio';
	import type { NotebookNote } from '$lib/types';
	import {
		Plus,
		Search,
		X,
		Volume2,
		Pin,
		Edit3,
		Trash2,
		Download,
		BookOpen,
		Sparkles,
		Tag
	} from 'lucide-svelte';

	let notes = $state<NotebookNote[]>([]);
	let searchQuery = $state('');
	let selectedLang = $state<'all' | 'chinese' | 'french'>('all');
	let selectedTag = $state<string | null>(null);

	// Modal / Editor State
	let isModalOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formTitle = $state('');
	let formContent = $state('');
	let formLang = $state<'chinese' | 'french'>('chinese');
	let formPinyin = $state('');
	let formTags = $state('');
	let formIsPinned = $state(false);
	let formError = $state('');

	function loadNotes() {
		notes = getAllNotebookNotes();
	}

	onMount(() => {
		loadNotes();
	});

	// Unique list of all tags present in user's notes
	let allTags = $derived(Array.from(new Set(notes.flatMap((n) => n.tags || []))).sort());

	// Filtered notes based on search, language, and selected tag
	let filteredNotes = $derived(
		notes.filter((note) => {
			if (selectedLang !== 'all' && note.language !== selectedLang) return false;
			if (selectedTag && !note.tags.includes(selectedTag)) return false;

			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchTitle = note.title.toLowerCase().includes(q);
				const matchContent = note.content.toLowerCase().includes(q);
				const matchPinyin = note.pinyin?.toLowerCase().includes(q) ?? false;
				const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
				return matchTitle || matchContent || matchPinyin || matchTags;
			}
			return true;
		})
	);

	let pinnedNotes = $derived(filteredNotes.filter((n) => n.isPinned));
	let regularNotes = $derived(filteredNotes.filter((n) => !n.isPinned));

	function openCreateModal() {
		editingId = null;
		formTitle = '';
		formContent = '';
		formLang = 'chinese';
		formPinyin = '';
		formTags = '';
		formIsPinned = false;
		formError = '';
		isModalOpen = true;
	}

	function openEditModal(note: NotebookNote) {
		editingId = note.id;
		formTitle = note.title;
		formContent = note.content;
		formLang = note.language;
		formPinyin = note.pinyin || '';
		formTags = note.tags.join(', ');
		formIsPinned = note.isPinned;
		formError = '';
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		editingId = null;
		formError = '';
	}

	function handleAutoPinyin() {
		if (!formTitle.trim()) return;
		const auto = generatePinyin(formTitle);
		if (auto) {
			formPinyin = auto;
		}
	}

	function handleSaveNote() {
		formError = '';
		if (!formTitle.trim()) {
			formError = 'Please enter a phrase or title.';
			return;
		}

		const parsedTags = formTags
			.split(/[,，\s]+/)
			.map((t) => t.trim().toLowerCase())
			.filter((t) => t.length > 0);

		saveNotebookNote({
			id: editingId || undefined,
			title: formTitle,
			content: formContent,
			language: formLang,
			pinyin: formLang === 'chinese' ? formPinyin.trim() || undefined : undefined,
			tags: parsedTags,
			isPinned: formIsPinned
		});

		closeModal();
		loadNotes();
	}

	function handleDeleteNote(id: string, title: string) {
		if (confirm(`Delete "${title}" from your notebook?`)) {
			deleteNotebookNote(id);
			loadNotes();
		}
	}

	function handleTogglePin(id: string) {
		togglePinNotebookNote(id);
		loadNotes();
	}

	function handleSpeak(text: string, lang: 'chinese' | 'french') {
		speakWord(text, lang);
	}

	function handleExportMarkdown() {
		if (notes.length === 0) return;
		const md = exportNotesAsMarkdown(notes);
		const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `flashcards-notebook-${new Date().toISOString().split('T')[0]}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Notebook — FlashCards</title>
</svelte:head>

<TopHeader title="Notebook" />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Top Bar: Overview & Primary Actions -->
	<div
		class="shadow-card flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h2 class="font-headline text-lg font-extrabold tracking-tight text-slate-900">
				Language Notebook
			</h2>
			<p class="font-sans text-xs text-slate-500">
				{notes.length}
				{notes.length === 1 ? 'phrase & note' : 'phrases & notes'} · No drills or review pressure
			</p>
		</div>

		<div class="flex items-center gap-2">
			{#if notes.length > 0}
				<button
					type="button"
					onclick={handleExportMarkdown}
					title="Export notes as Markdown"
					aria-label="Export Markdown"
					class="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 font-headline text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
				>
					<Download size={14} strokeWidth={2} />
					<span>Export</span>
				</button>
			{/if}

			<button
				type="button"
				onclick={openCreateModal}
				class="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
			>
				<Plus size={15} strokeWidth={2.5} />
				<span>New Note</span>
			</button>
		</div>
	</div>

	<!-- Search & Language Filter Controls -->
	<div class="space-y-2.5">
		<!-- Search Bar -->
		<div class="relative">
			<Search
				size={16}
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
			/>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search phrases, notes, or tags..."
				aria-label="Search notebook"
				class="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-9 pl-9.5 font-sans text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => (searchQuery = '')}
					aria-label="Clear search"
					class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
				>
					<X size={15} strokeWidth={2} />
				</button>
			{/if}
		</div>

		<!-- Language Filter Tabs -->
		<div class="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
			<button
				type="button"
				onclick={() => (selectedLang = 'all')}
				class="cursor-pointer rounded-xl py-1.5 text-center font-headline text-xs font-bold transition-all {selectedLang ===
				'all'
					? 'bg-white text-slate-900 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				All
			</button>
			<button
				type="button"
				onclick={() => (selectedLang = 'chinese')}
				class="cursor-pointer rounded-xl py-1.5 text-center font-headline text-xs font-bold transition-all {selectedLang ===
				'chinese'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				Chinese (中文)
			</button>
			<button
				type="button"
				onclick={() => (selectedLang = 'french')}
				class="cursor-pointer rounded-xl py-1.5 text-center font-headline text-xs font-bold transition-all {selectedLang ===
				'french'
					? 'bg-white text-amber-600 shadow-xs'
					: 'text-slate-500 hover:text-slate-800'}"
			>
				French (FR)
			</button>
		</div>

		<!-- Tag Pills Bar (if user has tags) -->
		{#if allTags.length > 0}
			<div class="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
				<button
					type="button"
					onclick={() => (selectedTag = null)}
					class="shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-headline text-[11px] font-bold transition-colors {selectedTag ===
					null
						? 'bg-slate-900 text-white'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					#all
				</button>
				{#each allTags as tag (tag)}
					<button
						type="button"
						onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
						class="shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-headline text-[11px] font-bold transition-colors {selectedTag ===
						tag
							? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					>
						#{tag}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Pinned Notes Section -->
	{#if pinnedNotes.length > 0}
		<div class="space-y-3 pt-1">
			<div class="flex items-center gap-1.5">
				<Pin size={13} class="fill-current text-amber-500" />
				<h3 class="font-headline text-xs font-extrabold tracking-wider text-slate-500 uppercase">
					Pinned ({pinnedNotes.length})
				</h3>
			</div>

			<div class="space-y-3">
				{#each pinnedNotes as note (note.id)}
					<article
						class="shadow-card hover:shadow-card-hover rounded-3xl border border-slate-200/90 bg-white p-5 transition-all hover:border-indigo-200"
					>
						<!-- Card Header: Badges & Actions -->
						<div class="flex items-start justify-between gap-2">
							<div class="flex flex-wrap items-center gap-1.5">
								<span
									class="rounded-full px-2.5 py-0.5 font-headline text-[10px] font-extrabold tracking-wider uppercase {note.language ===
									'chinese'
										? 'bg-indigo-50 text-indigo-700'
										: 'bg-amber-50 text-amber-700'}"
								>
									{note.language === 'chinese' ? 'ZH' : 'FR'}
								</span>

								{#each note.tags as tag (tag)}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-600"
									>
										<Tag size={10} class="text-slate-400" />
										<span>{tag}</span>
									</span>
								{/each}
							</div>

							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => handleTogglePin(note.id)}
									title="Unpin note"
									aria-label="Unpin note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50"
								>
									<Pin size={14} class="fill-current" />
								</button>
								<button
									type="button"
									onclick={() => openEditModal(note)}
									title="Edit note"
									aria-label="Edit note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
								>
									<Edit3 size={14} />
								</button>
								<button
									type="button"
									onclick={() => handleDeleteNote(note.id, note.title)}
									title="Delete note"
									aria-label="Delete note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>

						<!-- Phrase & Audio Pronunciation -->
						<div class="mt-2.5 flex items-start justify-between gap-3">
							<div>
								<h4
									class="font-headline text-lg leading-snug font-extrabold text-slate-900 sm:text-xl"
								>
									{note.title}
								</h4>
								{#if note.pinyin}
									<p class="mt-0.5 font-headline text-xs font-bold tracking-wide text-indigo-600">
										{note.pinyin}
									</p>
								{/if}
							</div>

							<button
								type="button"
								onclick={() => handleSpeak(note.title, note.language)}
								title="Listen to pronunciation"
								aria-label="Play pronunciation"
								class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform hover:bg-indigo-100 active:scale-90"
							>
								<Volume2 size={16} strokeWidth={2} />
							</button>
						</div>

						<!-- Freeform Body -->
						{#if note.content}
							<div class="mt-3 border-t border-slate-100 pt-3">
								<p
									class="font-sans text-xs leading-relaxed font-normal whitespace-pre-wrap text-slate-700 sm:text-sm"
								>
									{note.content}
								</p>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Regular Notes Section -->
	{#if regularNotes.length > 0}
		<div class="space-y-3 pt-1">
			{#if pinnedNotes.length > 0}
				<h3 class="font-headline text-xs font-extrabold tracking-wider text-slate-500 uppercase">
					Notes ({regularNotes.length})
				</h3>
			{/if}

			<div class="space-y-3">
				{#each regularNotes as note (note.id)}
					<article
						class="shadow-card hover:shadow-card-hover rounded-3xl border border-slate-200/90 bg-white p-5 transition-all hover:border-indigo-200"
					>
						<!-- Card Header: Badges & Actions -->
						<div class="flex items-start justify-between gap-2">
							<div class="flex flex-wrap items-center gap-1.5">
								<span
									class="rounded-full px-2.5 py-0.5 font-headline text-[10px] font-extrabold tracking-wider uppercase {note.language ===
									'chinese'
										? 'bg-indigo-50 text-indigo-700'
										: 'bg-amber-50 text-amber-700'}"
								>
									{note.language === 'chinese' ? 'ZH' : 'FR'}
								</span>

								{#each note.tags as tag (tag)}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-600"
									>
										<Tag size={10} class="text-slate-400" />
										<span>{tag}</span>
									</span>
								{/each}
							</div>

							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => handleTogglePin(note.id)}
									title="Pin note"
									aria-label="Pin note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-amber-500"
								>
									<Pin size={14} />
								</button>
								<button
									type="button"
									onclick={() => openEditModal(note)}
									title="Edit note"
									aria-label="Edit note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
								>
									<Edit3 size={14} />
								</button>
								<button
									type="button"
									onclick={() => handleDeleteNote(note.id, note.title)}
									title="Delete note"
									aria-label="Delete note"
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>

						<!-- Phrase & Audio Pronunciation -->
						<div class="mt-2.5 flex items-start justify-between gap-3">
							<div>
								<h4
									class="font-headline text-lg leading-snug font-extrabold text-slate-900 sm:text-xl"
								>
									{note.title}
								</h4>
								{#if note.pinyin}
									<p class="mt-0.5 font-headline text-xs font-bold tracking-wide text-indigo-600">
										{note.pinyin}
									</p>
								{/if}
							</div>

							<button
								type="button"
								onclick={() => handleSpeak(note.title, note.language)}
								title="Listen to pronunciation"
								aria-label="Play pronunciation"
								class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform hover:bg-indigo-100 active:scale-90"
							>
								<Volume2 size={16} strokeWidth={2} />
							</button>
						</div>

						<!-- Freeform Body -->
						{#if note.content}
							<div class="mt-3 border-t border-slate-100 pt-3">
								<p
									class="font-sans text-xs leading-relaxed font-normal whitespace-pre-wrap text-slate-700 sm:text-sm"
								>
									{note.content}
								</p>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Empty State: Zero Notes or Search Filter Empty -->
	{#if filteredNotes.length === 0}
		<div
			class="shadow-card flex flex-col items-center justify-center rounded-3xl border border-slate-200/90 bg-white p-8 text-center"
		>
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
			>
				<BookOpen size={28} strokeWidth={2} />
			</div>

			{#if searchQuery || selectedTag || selectedLang !== 'all'}
				<h3 class="mt-4 font-headline text-base font-bold text-slate-900">
					No matching notes found
				</h3>
				<p class="mt-1 font-sans text-xs text-slate-500">
					Try clearing your search query or removing the tag filter.
				</p>
				<button
					type="button"
					onclick={() => {
						searchQuery = '';
						selectedTag = null;
						selectedLang = 'all';
					}}
					class="mt-4 cursor-pointer rounded-xl bg-slate-100 px-3.5 py-2 font-headline text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
				>
					Reset Filters
				</button>
			{:else}
				<h3 class="mt-4 font-headline text-base font-bold text-slate-900">
					Your notebook is empty
				</h3>
				<p class="mt-1 max-w-xs font-sans text-xs leading-relaxed text-slate-500">
					Save interesting phrases, grammar patterns, dialogues, or personal notes here. Freeform
					text with zero review drills.
				</p>
				<button
					type="button"
					onclick={openCreateModal}
					class="mt-4 flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
				>
					<Plus size={15} strokeWidth={2.5} />
					<span>Add First Note</span>
				</button>
			{/if}
		</div>
	{/if}
</main>

<!-- Create / Edit Note Modal -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-xs sm:items-center sm:p-4"
	>
		<div
			class="flex max-h-[92vh] w-full flex-col rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
				<div class="flex items-center gap-2">
					<div
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
					>
						<BookOpen size={16} strokeWidth={2.25} />
					</div>
					<h3 class="font-headline text-base font-bold text-slate-900">
						{editingId ? 'Edit Note' : 'New Phrase / Note'}
					</h3>
				</div>
				<button
					type="button"
					onclick={closeModal}
					aria-label="Close modal"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Modal Body Form -->
			<div class="space-y-4 overflow-y-auto p-5">
				{#if formError}
					<div
						class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-sans text-xs text-rose-700"
					>
						{formError}
					</div>
				{/if}

				<!-- Language Selection -->
				<div>
					<span class="mb-1.5 block font-headline text-xs font-bold text-slate-700">
						Language
					</span>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (formLang = 'chinese')}
							class="cursor-pointer rounded-xl border py-2 text-center font-headline text-xs font-bold transition-all {formLang ===
							'chinese'
								? 'border-indigo-600 bg-indigo-50 text-indigo-700'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							Chinese (中文)
						</button>
						<button
							type="button"
							onclick={() => (formLang = 'french')}
							class="cursor-pointer rounded-xl border py-2 text-center font-headline text-xs font-bold transition-all {formLang ===
							'french'
								? 'border-amber-600 bg-amber-50 text-amber-700'
								: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}"
						>
							French (FR)
						</button>
					</div>
				</div>

				<!-- Phrase / Title Input -->
				<div>
					<div class="mb-1.5 flex items-center justify-between">
						<label
							for="note-title-input"
							class="block font-headline text-xs font-bold text-slate-700"
						>
							Phrase or Topic <span class="text-rose-500">*</span>
						</label>
						{#if formLang === 'chinese'}
							<button
								type="button"
								onclick={handleAutoPinyin}
								class="inline-flex cursor-pointer items-center gap-1 font-headline text-xs font-bold text-indigo-600 hover:text-indigo-800"
							>
								<Sparkles size={12} />
								<span>Auto Pinyin</span>
							</button>
						{/if}
					</div>
					<input
						id="note-title-input"
						type="text"
						bind:value={formTitle}
						placeholder={formLang === 'chinese' ? 'e.g. 去超市买东西' : 'e.g. Au supermarché'}
						class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-sans text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
					/>
				</div>

				<!-- Pinyin Input (Chinese only) -->
				{#if formLang === 'chinese'}
					<div>
						<label
							for="note-pinyin-input"
							class="mb-1.5 block font-headline text-xs font-bold text-slate-700"
						>
							Pinyin (Optional)
						</label>
						<input
							id="note-pinyin-input"
							type="text"
							bind:value={formPinyin}
							placeholder="e.g. qù chāo shì mǎi dōng xī"
							class="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-sans text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
						/>
					</div>
				{/if}

				<!-- Freeform Content Textarea -->
				<div>
					<label
						for="note-content-input"
						class="mb-1.5 block font-headline text-xs font-bold text-slate-700"
					>
						Notes & Explanations (Freeform)
					</label>
					<textarea
						id="note-content-input"
						bind:value={formContent}
						rows={5}
						placeholder="Translations, context, example sentences, cultural nuances, grammar rules..."
						class="w-full resize-y rounded-xl border border-slate-200 p-3.5 font-sans text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden sm:text-sm"
					></textarea>
				</div>

				<!-- Tags Input -->
				<div>
					<label
						for="note-tags-input"
						class="mb-1.5 block font-headline text-xs font-bold text-slate-700"
					>
						Tags (Comma separated)
					</label>
					<input
						id="note-tags-input"
						type="text"
						bind:value={formTags}
						placeholder="e.g. travel, dining, grammar"
						class="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-sans text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
					/>
				</div>

				<!-- Pin Toggle -->
				<label class="flex cursor-pointer items-center gap-2.5 pt-1">
					<input
						type="checkbox"
						bind:checked={formIsPinned}
						class="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
					/>
					<span class="font-headline text-xs font-bold text-slate-700">
						Pin to top of notebook
					</span>
				</label>
			</div>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
				<button
					type="button"
					onclick={closeModal}
					class="cursor-pointer rounded-xl px-4 py-2 font-headline text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleSaveNote}
					class="cursor-pointer rounded-xl bg-indigo-600 px-4.5 py-2 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
				>
					{editingId ? 'Save Changes' : 'Create Note'}
				</button>
			</div>
		</div>
	</div>
{/if}
