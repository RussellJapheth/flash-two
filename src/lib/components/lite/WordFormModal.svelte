<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import type { CustomDeck, WordRecord } from '$lib/types';
	import {
		addMyWord,
		updateMyWord,
		deleteMyWord,
		validateMyWord,
		toMyWordInput,
		generateWordPinyin,
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
		onChanged: (deck: CustomDeck) => void;
	}

	let { open = $bindable(), word, existingWords, onChanged }: Props = $props();

	const uid = $props.id();
	const ids = {
		title: `${uid}-title`,
		word: `${uid}-word`,
		pinyin: `${uid}-pinyin`,
		meaning: `${uid}-meaning`,
		example: `${uid}-example`
	};

	const emptyInput: MyWordInput = { word: '', pinyin: '', meaning: '', example: '' };

	let dialog: HTMLDialogElement | undefined = $state();
	let form = $state<MyWordInput>({ ...emptyInput });
	let errors = $state<MyWordErrors>({});
	let saveError = $state('');
	let isSaving = $state(false);
	let confirmingDelete = $state(false);
	let pinyinManuallyEdited = $state(false);

	let isEdit = $derived(word !== null);

	const fields: { key: MyWordField; label: string; placeholder: string; optional: boolean }[] = [
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

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			form = word ? toMyWordInput(word) : { ...emptyInput };
			errors = {};
			saveError = '';
			confirmingDelete = false;
			pinyinManuallyEdited = Boolean(word?.Pinyin?.trim());
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function handleClose() {
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

	function handleFieldInput(key: MyWordField) {
		clearFieldError(key);
		if (key === 'word' && !pinyinManuallyEdited) {
			const auto = generateWordPinyin(form.word);
			form.pinyin = auto;
			if (auto) clearFieldError('pinyin');
		} else if (key === 'pinyin') {
			pinyinManuallyEdited = form.pinyin.trim().length > 0;
		}
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		saveError = '';
		const found = validateMyWord(form, existingWords, word?.No);
		errors = found;
		const firstInvalid = fields.find((f) => found[f.key]);
		if (firstInvalid) {
			document.getElementById(ids[firstInvalid.key])?.focus();
			return;
		}
		isSaving = true;
		try {
			const deck = word ? await updateMyWord(word.No, form) : await addMyWord(form);
			scheduleDebouncedSync();
			onChanged(deck);
			open = false;
		} catch (e: unknown) {
			saveError = e instanceof Error ? e.message : 'The word could not be saved. Please try again.';
		} finally {
			isSaving = false;
		}
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
					{/if}
				</div>
				<input
					id={ids[field.key]}
					type="text"
					bind:value={form[field.key]}
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
				{#if error}
					<p id="{ids[field.key]}-error" class="font-sans text-sm font-semibold text-rose-600">
						Error: {error}
					</p>
				{/if}
			</div>
		{/each}

		{#if saveError}
			<p
				role="alert"
				class="rounded-2xl bg-rose-50 p-3 font-sans text-sm font-semibold text-rose-600"
			>
				{saveError}
			</p>
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
