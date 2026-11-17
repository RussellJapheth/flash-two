<script lang="ts">
	import { Plus, Layers, Check, Trash2, X, Loader2, AlertCircle } from 'lucide-svelte';
	import type { CustomDeck, WordRecord, MyWordInput } from '@flash/shared';
	import { ALL_WORDS_CATEGORY, ALL_WEEKS_LABEL, toMyWordInput } from '@flash/shared';
	import { addMyWordsBulk, updateMyWord, deleteMyWord } from '$lib/storage';
	import { countBulkWords, generateCardForWord, generateCardsInBulk } from '$lib/generator';
	import { getUnlockedWeeks, getCurrentWeekLabel } from '$lib/weeks';

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

	let dialog: HTMLDialogElement | undefined = $state();
	let isEdit = $derived(word !== null);

	// Tabs for add mode: 'single' | 'bulk'
	let activeTab = $state<'single' | 'bulk'>('bulk');
	let singleWord = $state('');
	let bulkText = $state('');
	let selectedWeek = $state('Week 1');

	// Generation state: 'input' | 'generating' | 'preview'
	let step = $state<'input' | 'generating' | 'preview'>('input');
	let progressCurrent = $state(0);
	let progressTotal = $state(0);
	let generatedCards = $state<MyWordInput[]>([]);
	let errorMessage = $state('');
	let isSaving = $state(false);

	// Edit mode state
	let editForm = $state<MyWordInput>({
		word: '',
		pinyin: '',
		meaning: '',
		example: '',
		category: ''
	});
	let confirmingDelete = $state(false);

	let bulkWordCount = $derived(countBulkWords(bulkText));
	let unlockedWeeks = $derived(getUnlockedWeeks(existingWords));

	function resolveInitialWeek(): string {
		const def = defaultCategory.trim();
		if (
			def &&
			def.toLowerCase() !== ALL_WORDS_CATEGORY.toLowerCase() &&
			def.toLowerCase() !== ALL_WEEKS_LABEL.toLowerCase()
		) {
			return def;
		}
		return getCurrentWeekLabel();
	}

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			errorMessage = '';
			isSaving = false;
			confirmingDelete = false;
			step = 'input';
			progressCurrent = 0;
			progressTotal = 0;
			generatedCards = [];

			if (word) {
				editForm = toMyWordInput(word);
			} else {
				activeTab = 'bulk';
				singleWord = '';
				bulkText = '';
				selectedWeek = resolveInitialWeek();
			}
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function handleClose() {
		open = false;
	}

	// Light-dismiss fallback
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

	async function handleGenerateSingle() {
		errorMessage = '';
		const trimmed = singleWord.trim();
		if (!trimmed) {
			errorMessage = 'Please enter a Chinese word or characters.';
			return;
		}

		step = 'generating';
		progressCurrent = 1;
		progressTotal = 1;

		try {
			const card = await generateCardForWord(trimmed, selectedWeek);
			generatedCards = [card];
			step = 'preview';
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Failed to generate card.';
			step = 'input';
		}
	}

	async function handleGenerateBulk() {
		errorMessage = '';
		if (bulkWordCount === 0) {
			errorMessage = 'Please enter at least one Chinese word.';
			return;
		}

		step = 'generating';
		progressCurrent = 0;
		progressTotal = bulkWordCount;

		try {
			const cards = await generateCardsInBulk(bulkText, selectedWeek, (curr, total) => {
				progressCurrent = curr;
				progressTotal = total;
			});
			generatedCards = cards;
			step = 'preview';
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Failed to generate cards.';
			step = 'input';
		}
	}

	function removeGeneratedCard(index: number) {
		generatedCards = generatedCards.filter((_, i) => i !== index);
		if (generatedCards.length === 0) {
			step = 'input';
		}
	}

	async function handleSaveAll() {
		if (generatedCards.length === 0 || isSaving) return;
		isSaving = true;
		errorMessage = '';

		try {
			const updatedDeck = await addMyWordsBulk(generatedCards, { allowDuplicate: true });
			onChanged(updatedDeck);
			handleClose();
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Failed to save cards.';
			isSaving = false;
		}
	}

	async function handleSaveEdit() {
		if (!word || isSaving) return;
		isSaving = true;
		errorMessage = '';

		try {
			const updatedDeck = await updateMyWord(word.No, editForm, { allowDuplicate: true });
			onChanged(updatedDeck);
			handleClose();
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Failed to update word.';
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!word || isSaving) return;
		isSaving = true;
		errorMessage = '';

		try {
			const updatedDeck = await deleteMyWord(word.No);
			onChanged(updatedDeck);
			handleClose();
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Failed to delete word.';
			isSaving = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleClose}
	onclick={handleDialogClick}
	class="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-xs"
>
	<div class="flex max-h-[90vh] flex-col overflow-hidden">
		<!-- Modal Header -->
		<div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
			<div>
				<h2 class="font-headline text-xl font-bold text-slate-900">
					{#if isEdit}
						Edit Word
					{:else if step === 'preview'}
						Review Cards ({generatedCards.length})
					{:else}
						Add to {selectedWeek}
					{/if}
				</h2>
				<p class="font-sans text-xs text-slate-500">
					{#if isEdit}
						Adjust characters, pinyin, or meaning
					{:else if step === 'preview'}
						Pinyin and examples automatically generated
					{:else}
						Only enter Chinese characters — system handles the rest
					{/if}
				</p>
			</div>

			<button
				type="button"
				onclick={handleClose}
				aria-label="Close dialog"
				class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
			>
				<X size={20} strokeWidth={2.5} />
			</button>
		</div>

		<!-- Error Banner -->
		{#if errorMessage}
			<div
				class="mx-6 mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800"
			>
				<AlertCircle size={18} class="shrink-0 text-rose-600" />
				<span class="font-sans text-xs font-semibold">{errorMessage}</span>
			</div>
		{/if}

		<!-- Modal Body -->
		<div class="flex-1 overflow-y-auto px-6 py-4">
			{#if isEdit}
				<!-- EDIT FORM -->
				<div class="space-y-4">
					<div>
						<label
							for="edit-word"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							Chinese Word
						</label>
						<input
							id="edit-word"
							type="text"
							bind:value={editForm.word}
							class="w-full rounded-2xl border border-slate-200 px-4 py-3 font-headline text-lg font-bold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
						/>
					</div>

					<div>
						<label
							for="edit-pinyin"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							Pinyin
						</label>
						<input
							id="edit-pinyin"
							type="text"
							bind:value={editForm.pinyin}
							class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 font-sans text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
						/>
					</div>

					<div>
						<label
							for="edit-meaning"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							English Meaning
						</label>
						<input
							id="edit-meaning"
							type="text"
							bind:value={editForm.meaning}
							class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 font-sans text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
						/>
					</div>

					<div>
						<label
							for="edit-example"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							Example Sentence
						</label>
						<textarea
							id="edit-example"
							rows={2}
							bind:value={editForm.example}
							class="w-full rounded-2xl border border-slate-200 px-4 py-2.5 font-sans text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
						></textarea>
					</div>

					<div>
						<label
							for="edit-category"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							Week / Category
						</label>
						<select
							id="edit-category"
							bind:value={editForm.category}
							class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-headline text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
						>
							{#each unlockedWeeks as week (week)}
								<option value={week}>{week}</option>
							{/each}
						</select>
					</div>
				</div>
			{:else if step === 'generating'}
				<!-- GENERATING PROGRESS STATE -->
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600"
					>
						<Loader2 size={32} class="animate-spin" />
					</div>
					<h3 class="mt-4 font-headline text-lg font-bold text-slate-900">
						Generating your flashcards...
					</h3>
					<p class="mt-1 font-sans text-sm text-slate-500">
						Adding Pinyin, English definitions, and example sentences
					</p>
					{#if progressTotal > 0}
						<div class="mt-4 w-48 rounded-full bg-slate-100 p-1">
							<div
								class="h-2 rounded-full bg-indigo-600 transition-all duration-300"
								style="width: {(progressCurrent / progressTotal) * 100}%"
							></div>
						</div>
						<span class="mt-2 font-headline text-xs font-semibold text-slate-600">
							{progressCurrent} of {progressTotal} words
						</span>
					{/if}
				</div>
			{:else if step === 'preview'}
				<!-- PREVIEW STEP -->
				<div class="space-y-3">
					<div class="flex items-center justify-between pb-1">
						<span class="font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
							Target: {selectedWeek}
						</span>
						<button
							type="button"
							onclick={() => (step = 'input')}
							class="font-headline text-xs font-bold text-indigo-600 hover:underline"
						>
							+ Add More Words
						</button>
					</div>

					{#each generatedCards as card, i (i)}
						<div class="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
							<button
								type="button"
								onclick={() => removeGeneratedCard(i)}
								aria-label="Remove word"
								class="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
							>
								<Trash2 size={16} />
							</button>

							<div class="pr-8">
								<div class="flex items-baseline gap-2">
									<span class="font-headline text-xl font-extrabold text-slate-900">
										{card.word}
									</span>
									<span class="font-sans text-xs font-bold text-indigo-600">
										{card.pinyin}
									</span>
								</div>
								<p class="mt-1 font-sans text-sm font-semibold text-slate-800">
									{card.meaning}
								</p>
								{#if card.example}
									<p class="mt-1.5 font-sans text-xs text-slate-500 italic">
										{card.example}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- ADD INPUT STEP -->
				<div class="space-y-4">
					<!-- Target Week Picker -->
					<div>
						<label
							for="target-week"
							class="mb-1 block font-headline text-xs font-bold text-slate-700"
						>
							Save to Week
						</label>
						<select
							id="target-week"
							bind:value={selectedWeek}
							class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-headline text-sm font-semibold text-slate-800 focus:border-indigo-600 focus:outline-hidden"
						>
							{#each unlockedWeeks as week (week)}
								<option value={week}>{week}</option>
							{/each}
						</select>
					</div>

					<!-- Single vs Bulk Tabs -->
					<div class="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
						<button
							type="button"
							onclick={() => (activeTab = 'single')}
							class="min-h-10 cursor-pointer rounded-xl font-headline text-xs font-bold transition-all {activeTab ===
							'single'
								? 'bg-white text-indigo-600 shadow-xs'
								: 'text-slate-600 hover:text-slate-900'}"
						>
							Single Word
						</button>
						<button
							type="button"
							onclick={() => (activeTab = 'bulk')}
							class="min-h-10 cursor-pointer rounded-xl font-headline text-xs font-bold transition-all {activeTab ===
							'bulk'
								? 'bg-white text-indigo-600 shadow-xs'
								: 'text-slate-600 hover:text-slate-900'}"
						>
							Multiple Words (Bulk)
						</button>
					</div>

					{#if activeTab === 'single'}
						<!-- SINGLE WORD INPUT -->
						<div class="space-y-3">
							<div>
								<label
									for="single-word-input"
									class="mb-1 block font-headline text-xs font-bold text-slate-700"
								>
									Enter Chinese Word
								</label>
								<input
									id="single-word-input"
									type="text"
									placeholder="e.g. 朋友"
									bind:value={singleWord}
									onkeydown={(e) => e.key === 'Enter' && handleGenerateSingle()}
									class="w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-headline text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:outline-hidden"
								/>
							</div>

							<div class="flex items-center gap-2">
								<span class="font-sans text-xs text-slate-400">Quick try:</span>
								{#each ['苹果', '朋友', '谢谢'] as sample (sample)}
									<button
										type="button"
										onclick={() => (singleWord = sample)}
										class="cursor-pointer rounded-lg bg-slate-100 px-2 py-1 font-headline text-xs font-bold text-slate-700 hover:bg-slate-200"
									>
										{sample}
									</button>
								{/each}
							</div>
						</div>
					{:else}
						<!-- BULK WORD INPUT -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label
									for="bulk-words-input"
									class="font-headline text-xs font-bold text-slate-700"
								>
									Enter Words (one per line)
								</label>
								<span class="font-headline text-xs font-bold text-indigo-600">
									{bulkWordCount}
									{bulkWordCount === 1 ? 'word' : 'words'} entered
								</span>
							</div>

							<textarea
								id="bulk-words-input"
								rows={6}
								placeholder="苹果&#10;香蕉&#10;西瓜&#10;猫"
								bind:value={bulkText}
								class="w-full rounded-2xl border border-slate-200 p-4 font-headline text-lg leading-relaxed font-bold text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:outline-hidden"
							></textarea>

							<div class="flex items-center justify-between text-xs text-slate-400">
								<span>Blank lines and extra spaces are ignored.</span>
								<div class="flex items-center gap-1.5">
									<span>Sample:</span>
									<button
										type="button"
										onclick={() => (bulkText = '苹果\n香蕉\n西瓜')}
										class="cursor-pointer font-bold text-indigo-600 hover:underline"
									>
										Fruits
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Modal Footer Actions -->
		<div class="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
			{#if isEdit}
				<div class="flex items-center justify-between gap-3">
					{#if confirmingDelete}
						<div class="flex flex-1 items-center justify-between">
							<span class="font-sans text-xs font-bold text-rose-700">Delete this word?</span>
							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => (confirmingDelete = false)}
									class="min-h-10 cursor-pointer rounded-xl bg-slate-200 px-3 font-headline text-xs font-bold text-slate-700"
								>
									Cancel
								</button>
								<button
									type="button"
									onclick={handleDelete}
									disabled={isSaving}
									class="min-h-10 cursor-pointer rounded-xl bg-rose-600 px-3 font-headline text-xs font-bold text-white hover:bg-rose-700"
								>
									Yes, Delete
								</button>
							</div>
						</div>
					{:else}
						<button
							type="button"
							onclick={() => (confirmingDelete = true)}
							class="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-3 font-headline text-xs font-bold text-rose-600 hover:bg-rose-50"
						>
							<Trash2 size={16} />
							<span>Delete</span>
						</button>

						<button
							type="button"
							onclick={handleSaveEdit}
							disabled={isSaving || !editForm.word.trim()}
							class="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
						>
							{#if isSaving}
								<Loader2 size={18} class="animate-spin" />
								<span>Saving...</span>
							{:else}
								<Check size={18} strokeWidth={2.5} />
								<span>Save Changes</span>
							{/if}
						</button>
					{/if}
				</div>
			{:else if step === 'preview'}
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={() => (step = 'input')}
						class="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 font-headline text-sm font-bold text-slate-700 hover:bg-slate-50"
					>
						Back
					</button>

					<button
						type="button"
						onclick={handleSaveAll}
						disabled={isSaving || generatedCards.length === 0}
						class="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-98 disabled:opacity-50"
					>
						{#if isSaving}
							<Loader2 size={20} class="animate-spin" />
							<span>Saving to {selectedWeek}...</span>
						{:else}
							<Check size={20} strokeWidth={2.5} />
							<span
								>Save {generatedCards.length}
								{generatedCards.length === 1 ? 'Card' : 'Cards'} to {selectedWeek}</span
							>
						{/if}
					</button>
				</div>
			{:else if activeTab === 'single'}
				<button
					type="button"
					onclick={handleGenerateSingle}
					disabled={!singleWord.trim()}
					class="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-98 disabled:opacity-50"
				>
					<Plus size={20} strokeWidth={2.5} />
					<span>Add Word to {selectedWeek}</span>
				</button>
			{:else}
				<button
					type="button"
					onclick={handleGenerateBulk}
					disabled={bulkWordCount === 0}
					class="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-base font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-98 disabled:opacity-50"
				>
					<Layers size={20} strokeWidth={2.5} />
					<span>
						{bulkWordCount > 0
							? `Generate ${bulkWordCount} ${bulkWordCount === 1 ? 'Card' : 'Cards'} for ${selectedWeek}`
							: 'Enter Words to Generate'}
					</span>
				</button>
			{/if}
		</div>
	</div>
</dialog>
