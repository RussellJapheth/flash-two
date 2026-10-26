<script lang="ts">
	import { Volume2, Bookmark, Check, BookOpen, X, Loader2 } from 'lucide-svelte';
	import { speakWord } from '$lib/utils/audio';
	import { saveNotebookNote } from '$lib/utils/notebookStorage';
	import { openModal } from '$lib/utils/backNav';
	import { searchDictionary } from '$lib/utils/dictionary';
	import { pinyin } from 'pinyin-pro';

	let { word = null, onClose } = $props<{
		word: {
			hanzi: string;
			pinyin?: string;
			english?: string;
			context?: string;
		} | null;
		onClose: () => void;
	}>();

	let isSaved = $state(false);
	let saveFeedback = $state('');
	let autoMeaning = $state<string | null>(null);
	let autoExample = $state<string | null>(null);
	let isSearchingMeaning = $state(false);

	let displayPinyin = $derived(
		word?.pinyin || (word?.hanzi ? pinyin(word.hanzi, { toneType: 'symbol' }) : '')
	);

	let displayMeaning = $derived(word?.english || autoMeaning || '');
	let displayContext = $derived(word?.context || autoExample || '');

	$effect(() => {
		if (word && !word.english) {
			isSearchingMeaning = true;
			autoMeaning = null;
			autoExample = null;
			searchDictionary(word.hanzi)
				.then((results) => {
					isSearchingMeaning = false;
					if (results.length > 0) {
						const best = results[0];
						autoMeaning = best['English Meaning'] || null;
						autoExample = best['Example (Chinese + Pinyin)'] || null;
					}
				})
				.catch(() => {
					isSearchingMeaning = false;
				});
		} else {
			autoMeaning = null;
			autoExample = null;
			isSearchingMeaning = false;
		}
		isSaved = false;
		saveFeedback = '';
	});

	function playAudio() {
		if (!word) return;
		speakWord(word.hanzi, 'chinese');
	}

	function handleAddToNotes() {
		if (!word) return;
		saveNotebookNote({
			title: word.hanzi,
			content:
				`${displayPinyin}\n${displayMeaning}\n${displayContext ? 'Context: ' + displayContext : ''}`.trim(),
			language: 'chinese',
			pinyin: displayPinyin,
			tags: ['Field Guide', 'Vocabulary']
		});
		isSaved = true;
		saveFeedback = 'Saved to Notebook!';
		setTimeout(() => {
			saveFeedback = '';
		}, 2000);
	}

	function handleOpenDictionary() {
		if (!word) return;
		onClose();
		openModal({ dictionaryOpen: true });
	}
</script>

{#if word}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-xs transition-opacity sm:items-center"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop click to close -->
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default"
			onclick={onClose}
			aria-label="Close word lookup"
		></button>

		<!-- Modal Container -->
		<div
			class="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl transition-all sm:max-w-md"
		>
			<!-- Close Button -->
			<button
				type="button"
				onclick={onClose}
				class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
				aria-label="Close"
			>
				<X size={16} />
			</button>

			<!-- Word Header -->
			<div class="flex items-start justify-between pr-8">
				<div>
					<h3 class="font-headline text-3xl font-black tracking-tight text-slate-900">
						{word.hanzi}
					</h3>
					<div class="mt-1 flex items-center gap-2">
						<span class="font-mono text-base font-bold text-cyan-700">
							{displayPinyin}
						</span>
						<button
							type="button"
							onclick={playAudio}
							class="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100 active:scale-95"
							aria-label="Listen to pronunciation"
						>
							<Volume2 size={15} />
						</button>
					</div>
				</div>
			</div>

			<!-- Meaning / Context -->
			{#if isSearchingMeaning}
				<div
					class="mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-500"
				>
					<Loader2 size={14} class="animate-spin text-indigo-600" />
					<span>Looking up definition in dictionary...</span>
				</div>
			{:else if displayMeaning}
				<div class="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
					<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Meaning</div>
					<div class="mt-0.5 text-sm font-semibold text-slate-800">
						{displayMeaning}
					</div>
					{#if displayContext}
						<div class="mt-2 text-xs text-slate-500 italic">
							{displayContext}
						</div>
					{/if}
				</div>
			{:else}
				<div
					class="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs text-slate-500"
				>
					Tap search below to look up full definitions, stroke order & examples in dictionary.
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="mt-5 flex flex-col gap-2.5">
				<button
					type="button"
					onclick={handleAddToNotes}
					class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-98"
				>
					{#if isSaved}
						<Check size={16} />
						<span>{saveFeedback || 'Saved in Notebook'}</span>
					{:else}
						<Bookmark size={16} />
						<span>Save to Notebook</span>
					{/if}
				</button>

				<button
					type="button"
					onclick={handleOpenDictionary}
					class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-98"
				>
					<BookOpen size={16} />
					<span>Search in Dictionary</span>
				</button>
			</div>
		</div>
	</div>
{/if}
