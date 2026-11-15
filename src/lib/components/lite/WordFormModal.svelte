<script lang="ts">
	import { Sparkles, RefreshCw, Plus } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '$lib/types';
	import {
		ALL_WORDS_CATEGORY,
		DUPLICATE_WORD_ERROR,
		addMyWord,
		updateMyWord,
		deleteMyWord,
		validateMyWord,
		toMyWordInput,
		generateWordPinyin,
		lookupWordSuggestions,
		getMyWordsSubcategories,
		type MeaningCandidate,
		type MyWordErrors,
		type MyWordField,
		type MyWordInput
	} from '$lib/utils/myWords';
	import { scheduleDebouncedSync } from '$lib/utils/cloud';

	interface Props {
		open: boolean;
		/** Word being edited. `null` means Add mode. */
		word: WordRecord | null;
		existingWords: WordRecord[];
		defaultCategory?: string;
		onChanged: (deck: CustomDeck) => void;
	}

	let {
		open = $bindable(),
		word,
		existingWords,
		defaultCategory = '',
		onChanged
	}: Props = $props();

	const uid = $props.id();
	const ids: Record<MyWordField | 'title', string> = {
		title: `${uid}-title`,
		word: `${uid}-word`,
		pinyin: `${uid}-pinyin`,
		meaning: `${uid}-meaning`,
		example: `${uid}-example`,
		category: `${uid}-category`
	};

	const emptyInput: MyWordInput = { word: '', pinyin: '', meaning: '', example: '', category: '' };

	let dialog: HTMLDialogElement | undefined = $state();
	let form = $state<MyWordInput>({ ...emptyInput });
	let errors = $state<MyWordErrors>({});
	let saveError = $state('');
	let isSaving = $state(false);
	let confirmingDelete = $state(false);
	let duplicateWarningShown = $state(false);
	let creatingCategory = $state(false);
	let newCategoryName = $state('');
	let pinyinManuallyEdited = $state(false);
	let meaningManuallyEdited = $state(false);
	let exampleManuallyEdited = $state(false);
	let meaningCandidates = $state<MeaningCandidate[]>([]);
	let exampleCandidates = $state<string[]>([]);
	let exampleIndex = $state(0);
	let isComposing = $state(false);

	let lookupTimer: ReturnType<typeof setTimeout> | null = null;
	let lookupSeq = 0;

	let isEdit = $derived(word !== null);
	let subcategories = $derived(getMyWordsSubcategories(existingWords));

	const fields: {
		key: Exclude<MyWordField, 'category'>;
		label: string;
		placeholder: string;
		optional: boolean;
	}[] = [
		{ key: 'word', label: 'Chinese word', placeholder: 'e.g. 你好', optional: false },
		{ key: 'pinyin', label: 'Pinyin', placeholder: 'e.g. nǐ hǎo', optional: false },
		{ key: 'meaning', label: 'English meaning', placeholder: 'e.g. hello', optional: false },
		{
			key: 'example',
			label: 'Example sentence',
			placeholder: 'e.g. 你好，我叫小明。',
			optional: true
		}
	];

	function resolveInitialCategory(): string {
		if (word) {
			return (word.category || '').trim();
		}
		const trimmed = defaultCategory.trim();
		if (!trimmed || trimmed.toLowerCase() === ALL_WORDS_CATEGORY.toLowerCase()) {
			return '';
		}
		return trimmed;
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			const initCat = resolveInitialCategory();
			form = word
				? { ...toMyWordInput(word), category: initCat }
				: { ...emptyInput, category: initCat };
			errors = {};
			saveError = '';
			confirmingDelete = false;
			duplicateWarningShown = false;
			creatingCategory = false;
			newCategoryName = '';
			pinyinManuallyEdited = Boolean(word?.Pinyin?.trim());
			meaningManuallyEdited = Boolean(word?.['English Meaning']?.trim());
			exampleManuallyEdited = Boolean(word?.['Example (Chinese + Pinyin)']?.trim());
			meaningCandidates = [];
			exampleCandidates = [];
			exampleIndex = 0;
			dialog.showModal();
			if (word?.['Chinese Word']?.trim()) {
				void runWordLookup(word['Chinese Word'], false);
			}
		} else if (!open && dialog.open) {
			if (lookupTimer) clearTimeout(lookupTimer);
			dialog.close();
		}
	});

	function handleClose() {
		if (lookupTimer) clearTimeout(lookupTimer);
		open = false;
	}

	// Light-dismiss fallback for browsers without `closedby` support (Safari).
	function handleDialogClick(event: MouseEvent) {
		if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
		if (event.target !== dialog) return;
		const rect = dialog.getBoundingClientRect();
		const inside =
			rect.top <= event.clientY &&
			event.clientY <= rect.bottom &&
			rect.left <= event.clientX &&
			event.clientX <= rect.right;
		if (!inside) dialog.close();
	}

	function clearFieldError(key: MyWordField) {
		if (errors[key]) {
			const next = { ...errors };
			delete next[key];
			errors = next;
		}
	}

	async function runWordLookup(rawWord: string, autoFill: boolean) {
		const seq = ++lookupSeq;
		const trimmed = rawWord.trim();
		if (!trimmed) {
			meaningCandidates = [];
			exampleCandidates = [];
			exampleIndex = 0;
			if (autoFill) {
				if (!pinyinManuallyEdited) form.pinyin = '';
				if (!meaningManuallyEdited) form.meaning = '';
				if (!exampleManuallyEdited) form.example = '';
			}
			return;
		}

		const suggestions = await lookupWordSuggestions(trimmed);
		if (seq !== lookupSeq) return;

		meaningCandidates = suggestions.meanings;
		exampleCandidates = suggestions.examples;
		exampleIndex = 0;

		if (autoFill) {
			if (!pinyinManuallyEdited && suggestions.pinyin) {
				form.pinyin = suggestions.pinyin;
				clearFieldError('pinyin');
			}
			if (!meaningManuallyEdited) {
				form.meaning = suggestions.meanings[0]?.meaning ?? '';
				if (form.meaning) clearFieldError('meaning');
			}
			if (!exampleManuallyEdited) {
				form.example = suggestions.examples[0] ?? '';
			}
		}
	}

	function scheduleWordLookup(rawWord: string) {
		if (lookupTimer) clearTimeout(lookupTimer);
		lookupTimer = setTimeout(() => {
			void runWordLookup(rawWord, true);
		}, 150);
	}

	function handleFieldInput(key: MyWordField) {
		clearFieldError(key);
		if (key === 'word') {
			duplicateWarningShown = false;
			if (isComposing) return;
			if (!pinyinManuallyEdited) {
				const auto = generateWordPinyin(form.word);
				form.pinyin = auto;
				if (auto) clearFieldError('pinyin');
			}
			scheduleWordLookup(form.word);
		} else if (key === 'pinyin') {
			pinyinManuallyEdited = form.pinyin.trim().length > 0;
		} else if (key === 'meaning') {
			meaningManuallyEdited = form.meaning.trim().length > 0;
		} else if (key === 'example') {
			exampleManuallyEdited = form.example.trim().length > 0;
		}
	}

	function selectCategory(cat: string) {
		creatingCategory = false;
		newCategoryName = '';
		form.category = cat;
		clearFieldError('category');
	}

	function startNewCategory() {
		creatingCategory = true;
		clearFieldError('category');
		setTimeout(() => {
			document.getElementById(ids.category)?.focus();
		}, 0);
	}

	function selectMeaningCandidate(candidate: MeaningCandidate) {
		form.meaning = candidate.meaning;
		meaningManuallyEdited = true;
		clearFieldError('meaning');
		if (candidate.pinyin && !pinyinManuallyEdited) {
			form.pinyin = candidate.pinyin;
			clearFieldError('pinyin');
		}
	}

	function handleNextExample() {
		if (exampleCandidates.length === 0) return;
		exampleIndex = (exampleIndex + 1) % exampleCandidates.length;
		form.example = exampleCandidates[exampleIndex];
		exampleManuallyEdited = false;
	}

	function handleAutoPinyin() {
		if (!form.word.trim()) {
			errors = { ...errors, word: 'Please enter the Chinese word' };
			document.getElementById(ids.word)?.focus();
			return;
		}
		const auto = generateWordPinyin(form.word);
		if (auto) {
			form.pinyin = auto;
			pinyinManuallyEdited = false;
			clearFieldError('pinyin');
		}
	}

	async function saveWord(allowDuplicate: boolean) {
		saveError = '';
		if (creatingCategory) {
			const trimmedCat = newCategoryName.trim();
			if (!trimmedCat) {
				errors = { ...errors, category: 'Please enter a category name' };
				document.getElementById(ids.category)?.focus();
				return;
			}
			form.category = trimmedCat;
		}

		const found = validateMyWord(form, existingWords, word?.No, { allowDuplicate });
		errors = found;
		if (found.word === DUPLICATE_WORD_ERROR && !found.pinyin && !found.meaning) {
			duplicateWarningShown = true;
			return;
		}

		const firstInvalid = fields.find((f) => found[f.key]);
		if (firstInvalid) {
			document.getElementById(ids[firstInvalid.key])?.focus();
			return;
		}

		isSaving = true;
		try {
			const deck = word
				? await updateMyWord(word.No, form, { allowDuplicate })
				: await addMyWord(form, { allowDuplicate });
			scheduleDebouncedSync();
			onChanged(deck);
			open = false;
		} catch (e: unknown) {
			saveError = e instanceof Error ? e.message : 'The word could not be saved. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await saveWord(false);
	}

	async function handleDelete() {
		if (!word) return;
		saveError = '';
		isSaving = true;
		try {
			const deck = await deleteMyWord(word.No);
			scheduleDebouncedSync();
			onChanged(deck);
			open = false;
		} catch (e: unknown) {
			saveError =
				e instanceof Error ? e.message : 'The word could not be deleted. Please try again.';
		} finally {
			isSaving = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	{...{ closedby: 'any' }}
	aria-labelledby={ids.title}
	onclose={handleClose}
	onclick={handleDialogClick}
	class="shadow-card-hover m-auto rounded-3xl border border-slate-200/90 bg-white p-0 text-slate-900 backdrop:bg-slate-900/50"
>
	<form novalidate onsubmit={handleSubmit} class="space-y-4 p-5">
		<h2 id={ids.title} class="font-headline text-xl font-bold text-slate-900">
			{isEdit ? 'Edit Word' : 'Add Word'}
		</h2>

		{#each fields as field (field.key)}
			{@const error = errors[field.key]}
			<div class="space-y-1.5">
				<div class="flex items-center justify-between gap-2">
					<label
						for={ids[field.key]}
						class="block font-headline text-base font-bold text-slate-900"
					>
						{field.label}
						{#if field.optional}
							<span class="font-sans text-sm font-normal text-slate-600">(optional)</span>
						{/if}
					</label>
					{#if field.key === 'pinyin'}
						<button
							type="button"
							onclick={handleAutoPinyin}
							class="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl px-2.5 font-headline text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
						>
							<Sparkles size={16} aria-hidden="true" />
							<span>Auto Pinyin</span>
						</button>
					{:else if field.key === 'example' && exampleCandidates.length > 1}
						<button
							type="button"
							onclick={handleNextExample}
							class="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl px-2.5 font-headline text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
						>
							<RefreshCw size={15} aria-hidden="true" />
							<span>Next example</span>
						</button>
					{/if}
				</div>
				<input
					id={ids[field.key]}
					type="text"
					bind:value={form[field.key]}
					oncompositionstart={() => {
						if (field.key === 'word') isComposing = true;
					}}
					oncompositionend={() => {
						if (field.key === 'word') {
							isComposing = false;
							handleFieldInput('word');
						}
					}}
					oninput={() => handleFieldInput(field.key)}
					placeholder={field.placeholder}
					required={!field.optional}
					autocomplete="off"
					aria-invalid={error ? 'true' : 'false'}
					aria-describedby={error ? `${ids[field.key]}-error` : undefined}
					class="h-12 w-full rounded-2xl border bg-white px-4 font-sans text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none {error
						? 'border-rose-600'
						: 'border-slate-200'}"
				/>
				{#if field.key === 'meaning' && meaningCandidates.length > 1}
					<div class="flex flex-wrap gap-1.5 pt-1" role="group" aria-label="Suggested meanings">
						{#each meaningCandidates as candidate (candidate.meaning)}
							{@const selected =
								form.meaning.trim().toLowerCase() === candidate.meaning.toLowerCase()}
							<button
								type="button"
								onclick={() => selectMeaningCandidate(candidate)}
								aria-pressed={selected}
								class="min-h-11 cursor-pointer rounded-xl border px-3 py-1.5 font-sans text-sm font-semibold transition-colors {selected
									? 'border-indigo-200 bg-indigo-50 text-indigo-600'
									: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
							>
								{candidate.meaning}
							</button>
						{/each}
					</div>
				{/if}
				{#if error}
					<p id="{ids[field.key]}-error" class="font-sans text-sm font-semibold text-rose-600">
						Error: {error}
					</p>
				{/if}
			</div>
		{/each}

		<!-- Category Selector -->
		<div class="space-y-1.5">
			<label for={ids.category} class="block font-headline text-base font-bold text-slate-900">
				Category
				<span class="font-sans text-sm font-normal text-slate-600">(optional)</span>
			</label>
			<div class="flex flex-wrap gap-1.5" role="group" aria-label="Word category">
				<button
					type="button"
					onclick={() => selectCategory('')}
					aria-pressed={!creatingCategory && !form.category?.trim()}
					class="min-h-11 cursor-pointer rounded-xl border px-3 py-1.5 font-sans text-sm font-semibold transition-colors {!creatingCategory &&
					!form.category?.trim()
						? 'border-indigo-200 bg-indigo-50 text-indigo-600'
						: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
				>
					{ALL_WORDS_CATEGORY}
				</button>

				{#each subcategories as cat (cat)}
					{@const isSelected = !creatingCategory && form.category?.trim() === cat}
					<button
						type="button"
						onclick={() => selectCategory(cat)}
						aria-pressed={isSelected}
						class="min-h-11 cursor-pointer rounded-xl border px-3 py-1.5 font-sans text-sm font-semibold transition-colors {isSelected
							? 'border-indigo-200 bg-indigo-50 text-indigo-600'
							: 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}"
					>
						{cat}
					</button>
				{/each}

				<button
					type="button"
					onclick={startNewCategory}
					aria-pressed={creatingCategory}
					class="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border px-3 py-1.5 font-sans text-sm font-semibold transition-colors {creatingCategory
						? 'border-indigo-200 bg-indigo-50 text-indigo-600'
						: 'border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50'}"
				>
					<Plus size={15} strokeWidth={2.5} aria-hidden="true" />
					<span>New category</span>
				</button>
			</div>

			{#if creatingCategory}
				<input
					id={ids.category}
					type="text"
					bind:value={newCategoryName}
					oninput={() => clearFieldError('category')}
					placeholder="e.g. Week 1"
					autocomplete="off"
					aria-invalid={errors.category ? 'true' : 'false'}
					aria-describedby={errors.category ? `${ids.category}-error` : undefined}
					class="mt-1.5 h-12 w-full rounded-2xl border bg-white px-4 font-sans text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none {errors.category
						? 'border-rose-600'
						: 'border-slate-200'}"
				/>
			{/if}

			{#if errors.category}
				<p id="{ids.category}-error" class="font-sans text-sm font-semibold text-rose-600">
					Error: {errors.category}
				</p>
			{/if}
		</div>

		{#if saveError}
			<p
				role="alert"
				class="rounded-2xl bg-rose-50 p-3 font-sans text-sm font-semibold text-rose-600"
			>
				{saveError}
			</p>
		{/if}

		{#if duplicateWarningShown}
			<div
				role="alert"
				class="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-slate-900"
			>
				<p class="font-sans text-sm font-semibold text-amber-900">
					"{form.word.trim()}" is already in My Words. Do you want to add it again?
				</p>
				<button
					type="button"
					disabled={isSaving}
					onclick={() => saveWord(true)}
					class="h-11 w-full cursor-pointer rounded-xl bg-amber-600 font-headline text-sm font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
				>
					{isSaving ? 'Saving…' : 'Add Word Anyway'}
				</button>
			</div>
		{/if}

		<div class="space-y-2 pt-1">
			<button
				type="submit"
				disabled={isSaving}
				class="h-12 w-full cursor-pointer rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 transition-colors hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
			>
				{isSaving ? 'Saving…' : 'Save Word'}
			</button>
			<button
				type="button"
				onclick={() => (open = false)}
				class="h-12 w-full cursor-pointer rounded-2xl font-headline text-base font-bold text-slate-600 transition-colors hover:bg-slate-100"
			>
				Cancel
			</button>
		</div>

		{#if isEdit}
			<div class="border-t border-slate-200 pt-3 text-center">
				{#if confirmingDelete}
					<p class="mb-2 font-sans text-base text-slate-900">Delete this word from My Words?</p>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => (confirmingDelete = false)}
							class="h-12 flex-1 cursor-pointer rounded-2xl border border-slate-200 font-headline text-base font-bold text-slate-600 hover:bg-slate-100"
						>
							Keep it
						</button>
						<button
							type="button"
							disabled={isSaving}
							onclick={handleDelete}
							class="h-12 flex-1 cursor-pointer rounded-2xl bg-rose-600 font-headline text-base font-bold text-white disabled:opacity-60"
						>
							Yes, delete
						</button>
					</div>
				{:else}
					<button
						type="button"
						onclick={() => (confirmingDelete = true)}
						class="min-h-11 cursor-pointer px-3 font-sans text-sm font-semibold text-rose-600 underline-offset-2 hover:underline"
					>
						Delete word
					</button>
				{/if}
			</div>
		{/if}
	</form>
</dialog>

<style>
	dialog {
		width: min(28rem, 100% - 2rem);
		max-height: calc(100dvh - 2rem);
	}
	dialog:modal {
		overscroll-behavior: contain;
	}
	dialog::backdrop {
		overflow: hidden;
		overscroll-behavior: contain;
	}
</style>
