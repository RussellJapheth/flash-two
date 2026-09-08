<script lang="ts">
	import type { WordRecord } from '$lib/types';
	import { speakWord, playSound } from '$lib/utils/audio';
	import { Bookmark, Volume2, Pointer } from 'lucide-svelte';

	let {
		word,
		language = 'chinese',
		isFlipped = false,
		isSaved = false,
		showPinyin = true,
		onFlip = () => {},
		onToggleSave = () => {}
	} = $props<{
		word: WordRecord;
		language?: 'chinese' | 'french';
		isFlipped?: boolean;
		isSaved?: boolean;
		showPinyin?: boolean;
		onFlip?: () => void;
		onToggleSave?: () => void;
	}>();

	let targetWord = $derived(
		language === 'chinese' ? word['Chinese Word'] || '' : word['French Word'] || ''
	);
	let phonetic = $derived(word.Pinyin || '');
	let meaning = $derived(word['English Meaning'] || '');
	let partOfSpeech = $derived(word['Part of Speech'] || 'Word');
	let example = $derived(
		language === 'chinese'
			? word['Example (Chinese + Pinyin)'] || ''
			: word['Example (French)'] || ''
	);

	function handleFlip(e: MouseEvent | KeyboardEvent) {
		// Prevent flip if clicking on audio button or save button
		const target = e.target as HTMLElement;
		if (target.closest('button')) return;
		playSound('flip');
		onFlip();
	}

	function handleAudio(e: MouseEvent) {
		e.stopPropagation();
		speakWord(targetWord, language);
	}

	function handleSave(e: MouseEvent) {
		e.stopPropagation();
		onToggleSave();
	}
</script>

<div class="perspective-1000 w-full select-none">
	<div
		tabindex="0"
		role="button"
		aria-label="Flashcard: {targetWord}. Click to flip."
		onclick={handleFlip}
		onkeydown={(e) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				handleFlip(e);
			}
		}}
		class="transform-style-3d relative min-h-[380px] sm:min-h-[420px] w-full cursor-pointer rounded-[32px] transition-transform duration-500 {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- FRONT FACE -->
		<div
			class="backface-hidden absolute inset-0 flex flex-col justify-between rounded-[32px] border border-surface-container bg-surface-container-lowest p-6 shadow-card hover:shadow-card-active transition-shadow"
		>
			<!-- Front Header -->
			<div class="flex items-center justify-between">
				<span
					class="rounded-full bg-surface-container-low px-3 py-1 font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant"
				>
					{partOfSpeech}
				</span>

				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={handleSave}
						aria-label={isSaved ? 'Remove from saved' : 'Save word'}
						class="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 {isSaved
							? 'text-secondary'
							: 'text-outline hover:text-on-surface'}"
					>
						<Bookmark size={22} strokeWidth={1.75} class={isSaved ? 'fill-current' : ''} />
					</button>
				</div>
			</div>

			<!-- Front Content -->
			<div class="my-auto flex flex-col items-center justify-center text-center">
				<h2
					class="font-headline text-5xl sm:text-6xl font-extrabold tracking-tight text-on-surface {language ===
					'chinese'
						? 'font-hanzi'
						: ''}"
				>
					{targetWord}
				</h2>

				{#if showPinyin && phonetic}
					<p class="mt-3 font-headline text-lg font-semibold text-primary">
						{phonetic}
					</p>
				{/if}

				<!-- Audio Trigger Pill -->
				<button
					type="button"
					onclick={handleAudio}
					class="mt-6 inline-flex items-center gap-2 rounded-full border border-primary-fixed bg-primary-fixed/40 px-4 py-2 font-headline text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary-fixed hover:shadow active:scale-95"
				>
					<Volume2 size={18} strokeWidth={1.75} />
					<span>Listen</span>
				</button>
			</div>

			<!-- Front Footer Hint -->
			<div class="flex items-center justify-center gap-1.5 text-xs font-medium text-outline">
				<Pointer size={15} strokeWidth={1.75} />
				<span>Tap to flip</span>
			</div>
		</div>

		<!-- BACK FACE -->
		<div
			class="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-between rounded-[32px] border border-surface-container bg-surface-container-lowest p-6 shadow-card"
		>
			<!-- Back Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="rounded-full bg-primary-fixed px-3 py-1 font-headline text-xs font-bold text-primary"
					>
						{targetWord}
					</span>
					<span class="text-xs font-semibold text-on-surface-variant">
						{partOfSpeech}
					</span>
				</div>

				<button
					type="button"
					onclick={handleSave}
					aria-label={isSaved ? 'Remove from saved' : 'Save word'}
					class="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 {isSaved
						? 'text-secondary'
						: 'text-outline hover:text-on-surface'}"
				>
					<Bookmark size={22} strokeWidth={1.75} class={isSaved ? 'fill-current' : ''} />
				</button>
			</div>

			<!-- Back Center Content -->
			<div class="my-auto flex flex-col items-center justify-center text-center">
				<p class="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface">
					{meaning}
				</p>

				{#if example}
					<div
						class="mt-5 max-w-sm rounded-2xl bg-surface-container-low p-4 text-left border border-surface-container"
					>
						<p class="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
							Example:
						</p>
						<p class="text-sm font-medium text-on-surface leading-relaxed">
							{example}
						</p>
					</div>
				{/if}

				<!-- Audio Trigger -->
				<button
					type="button"
					onclick={handleAudio}
					class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
				>
					<Volume2 size={16} strokeWidth={1.75} />
					<span>Replay Audio</span>
				</button>
			</div>

			<!-- Back Footer Hint -->
			<div class="flex items-center justify-center gap-1.5 text-xs font-medium text-outline">
				<span>Rate your recall below</span>
			</div>
		</div>
	</div>
</div>
