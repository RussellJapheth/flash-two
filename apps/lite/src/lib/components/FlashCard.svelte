<script lang="ts">
	import type { WordRecord } from '@flash/shared';
	import { speakWord, playSound } from '$lib/audio';
	import { Volume2, Pointer } from 'lucide-svelte';

	let {
		word,
		language = 'chinese',
		isFlipped = false,
		showPinyin = true,
		deckName = '',
		onFlip = () => {}
	} = $props<{
		word: WordRecord;
		language?: 'chinese' | 'french';
		isFlipped?: boolean;
		showPinyin?: boolean;
		deckName?: string;
		onFlip?: () => void;
	}>();

	function handleFlip() {
		playSound('flip');
		onFlip();
	}

	function handleSpeak(e: MouseEvent) {
		e.stopPropagation();
		const text = word['Chinese Word'] || '';
		speakWord(text, language);
	}
</script>

<!-- FlashCard Container -->
<div
	role="button"
	tabindex="0"
	aria-label="Flashcard, click to flip"
	onclick={handleFlip}
	onkeydown={(e) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			handleFlip();
		}
	}}
	class="perspective-1000 relative min-h-[380px] w-full cursor-pointer select-none"
>
	<!-- Card 3D Rotator -->
	<div
		class="preserve-3d relative h-full w-full transition-transform duration-400 ease-out {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- FRONT FACE -->
		<div
			class="shadow-card absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 backface-hidden"
		>
			<!-- Front Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="rounded-full bg-slate-100 px-3 py-1 font-headline text-xs font-semibold text-slate-600"
					>
						{deckName || 'My Words'}
					</span>
					{#if word.category}
						<span
							class="rounded-full bg-indigo-50 px-2.5 py-0.5 font-headline text-[11px] font-semibold text-indigo-700"
						>
							{word.category}
						</span>
					{/if}
				</div>

				<button
					type="button"
					aria-label="Pronounce word"
					onclick={handleSpeak}
					class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
				>
					<Volume2 size={18} strokeWidth={2} />
				</button>
			</div>

			<!-- Front Center: Hanzi + Pinyin -->
			<div class="my-auto flex flex-col items-center justify-center text-center">
				<h2
					class="font-headline text-5xl font-black tracking-tight text-slate-900 transition-transform active:scale-95 sm:text-6xl"
				>
					{word['Chinese Word']}
				</h2>

				{#if showPinyin && word.Pinyin}
					<p class="mt-3 font-headline text-lg font-bold text-indigo-600">
						{word.Pinyin}
					</p>
				{/if}
			</div>

			<!-- Front Footer Hint -->
			<div class="flex items-center justify-center">
				<div
					class="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 font-headline text-sm font-bold text-indigo-700 shadow-xs"
				>
					<Pointer size={18} strokeWidth={2.25} />
					<span>Tap to flip</span>
				</div>
			</div>
		</div>

		<!-- BACK FACE -->
		<div
			class="shadow-card absolute inset-0 flex rotate-y-180 flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 backface-hidden"
		>
			<!-- Back Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="rounded-full bg-indigo-50 px-3 py-1 font-headline text-xs font-bold text-indigo-700"
					>
						Definition
					</span>
				</div>

				<button
					type="button"
					aria-label="Pronounce word"
					onclick={handleSpeak}
					class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
				>
					<Volume2 size={18} strokeWidth={2} />
				</button>
			</div>

			<!-- Back Center: Meaning + Example -->
			<div class="my-auto space-y-4 text-center">
				<div>
					<h3 class="font-headline text-2xl font-black text-slate-900 sm:text-3xl">
						{word['English Meaning']}
					</h3>
					{#if word.Pinyin}
						<p class="mt-1 font-headline text-sm font-semibold text-indigo-600">
							{word.Pinyin}
						</p>
					{/if}
				</div>

				{#if word['Example (Chinese + Pinyin)']}
					<div class="rounded-2xl bg-slate-50 p-4 text-left">
						<p class="font-headline text-sm font-bold text-slate-800">
							{word['Example (Chinese + Pinyin)']}
						</p>
					</div>
				{/if}
			</div>

			<!-- Back Footer -->
			<div class="flex items-center justify-center text-xs font-medium text-slate-400">
				<span>Rate your recall below</span>
			</div>
		</div>
	</div>
</div>
