<script lang="ts">
	import type { WordRecord } from '$lib/types';
	import { speakWord, playSound } from '$lib/utils/audio';
	import {
		isSpeechRecognitionSupported,
		startSpeechRecognition,
		evaluateSpeechAccuracy,
		type SpeechEvaluationResult,
		type SpeechRecognizerHandle
	} from '$lib/utils/speech';
	import { Bookmark, Volume2, Pointer, Mic, MicOff, Check, RotateCcw } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';

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

	let hasSpeechSupport = $state(false);
	let isListening = $state(false);
	let speechResult = $state<SpeechEvaluationResult | null>(null);
	let currentTranscript = $state('');
	let recognizerHandle: SpeechRecognizerHandle | null = null;

	onMount(() => {
		hasSpeechSupport = isSpeechRecognitionSupported();
	});

	onDestroy(() => {
		stopListening();
	});

	$effect(() => {
		// Reset speech state when the target word changes
		if (word) {
			stopListening();
			speechResult = null;
			currentTranscript = '';
		}
	});

	function stopListening() {
		if (recognizerHandle) {
			recognizerHandle.stop();
			recognizerHandle = null;
		}
		isListening = false;
	}

	function handleToggleMic(e: MouseEvent) {
		e.stopPropagation();
		if (isListening) {
			stopListening();
			return;
		}

		speechResult = null;
		currentTranscript = '';
		isListening = true;

		const recognitionLang = language === 'chinese' ? 'zh-CN' : 'fr-FR';

		recognizerHandle = startSpeechRecognition({
			lang: recognitionLang,
			continuous: false,
			onStart: () => {
				isListening = true;
			},
			onResult: (transcript, isFinal) => {
				currentTranscript = transcript;
				if (isFinal || transcript.trim().length >= targetWord.trim().length) {
					gradeSpeech(transcript);
					stopListening();
				}
			},
			onError: () => {
				stopListening();
			},
			onEnd: () => {
				if (isListening && currentTranscript) {
					gradeSpeech(currentTranscript);
				}
				isListening = false;
			}
		});
	}

	function gradeSpeech(spoken: string) {
		if (!spoken.trim()) return;
		const result = evaluateSpeechAccuracy(
			spoken,
			targetWord,
			language,
			phonetic,
			targetWord ? [targetWord] : []
		);
		speechResult = result;
		if (result.passed) {
			playSound('correct');
		} else {
			playSound('wrong');
		}
	}

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
		class="transform-style-3d relative min-h-[380px] w-full cursor-pointer rounded-3xl transition-transform duration-300 sm:min-h-[420px] {isFlipped
			? 'rotate-y-180'
			: ''}"
	>
		<!-- FRONT FACE -->
		<div
			class="shadow-card hover:shadow-card-hover absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 transition-all backface-hidden"
		>
			<!-- Front Header -->
			<div class="flex items-center justify-between">
				<span
					class="rounded-full bg-slate-100 px-3 py-1 font-headline text-xs font-bold tracking-wider text-slate-600 uppercase"
				>
					{partOfSpeech}
				</span>

				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={handleSave}
						aria-label={isSaved ? 'Remove from saved' : 'Save word'}
						class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 {isSaved
							? 'text-amber-500'
							: 'text-slate-400 hover:text-slate-600'}"
					>
						<Bookmark size={20} strokeWidth={2} class={isSaved ? 'fill-current' : ''} />
					</button>
				</div>
			</div>

			<!-- Front Content -->
			<div class="my-auto flex flex-col items-center justify-center text-center">
				<h2
					class="font-headline text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl {language ===
					'chinese'
						? 'font-hanzi'
						: ''}"
				>
					{targetWord}
				</h2>

				{#if showPinyin && phonetic}
					<p class="mt-3 font-headline text-lg font-bold text-indigo-600">
						{phonetic}
					</p>
				{/if}

				<!-- Audio & Pronunciation Trigger Controls -->
				<div class="mt-6 flex flex-wrap items-center justify-center gap-2.5">
					<button
						type="button"
						onclick={handleAudio}
						class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 font-headline text-sm font-bold text-indigo-700 shadow-xs transition-all hover:bg-indigo-100 hover:shadow-sm active:scale-95"
					>
						<Volume2 size={18} strokeWidth={2} />
						<span>Listen</span>
					</button>

					{#if hasSpeechSupport}
						<button
							type="button"
							onclick={handleToggleMic}
							class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 font-headline text-sm font-bold shadow-xs transition-all active:scale-95 {isListening
								? 'animate-pulse border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
								: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'}"
						>
							<Mic
								size={18}
								strokeWidth={2}
								class={isListening ? 'text-rose-600' : 'text-slate-600'}
							/>
							<span>{isListening ? 'Listening...' : 'Speak'}</span>
						</button>
					{/if}
				</div>

				<!-- Pronunciation Feedback Badge -->
				{#if speechResult}
					<div
						class="mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-center transition-all {speechResult.passed
							? 'border-emerald-200 bg-emerald-50 text-emerald-800'
							: 'border-amber-200 bg-amber-50 text-amber-800'}"
					>
						<div class="flex items-center gap-1.5 font-headline text-xs font-bold">
							{#if speechResult.passed}
								<Check size={14} class="text-emerald-600 stroke-[3]" />
								<span>{Math.round(speechResult.score * 100)}% Match</span>
							{:else}
								<RotateCcw size={14} class="text-amber-600" />
								<span>{Math.round(speechResult.score * 100)}% · Try Again</span>
							{/if}
						</div>
					</div>
				{:else if isListening}
					<div
						class="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-sans text-xs font-medium text-indigo-700"
					>
						<span class="inline-block h-2 w-2 animate-ping rounded-full bg-indigo-500"></span>
						<span>Listening...</span>
					</div>
				{/if}
			</div>

			<!-- Front Footer Hint -->
			<div
				class="flex items-center justify-center gap-1.5 font-sans text-xs font-medium text-slate-400"
			>
				<Pointer size={15} strokeWidth={1.75} />
				<span>Tap to flip</span>
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
						{targetWord}
					</span>
					<span class="font-sans text-xs font-semibold text-slate-500">
						{partOfSpeech}
					</span>
				</div>

				<button
					type="button"
					onclick={handleSave}
					aria-label={isSaved ? 'Remove from saved' : 'Save word'}
					class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 {isSaved
						? 'text-amber-500'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					<Bookmark size={20} strokeWidth={2} class={isSaved ? 'fill-current' : ''} />
				</button>
			</div>

			<!-- Back Center Content -->
			<div class="my-auto flex flex-col items-center justify-center text-center">
				<p class="font-headline text-2xl font-extrabold text-slate-900 sm:text-3xl">
					{meaning}
				</p>

				{#if example}
					<div
						class="mt-5 max-w-sm rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left"
					>
						<p class="mb-1 font-headline text-xs font-bold tracking-wider text-slate-500 uppercase">
							Example:
						</p>
						<p class="font-sans text-sm leading-relaxed font-medium text-slate-800">
							{example}
						</p>
					</div>
				{/if}

				<!-- Audio & Speech Trigger Controls -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						onclick={handleAudio}
						class="inline-flex cursor-pointer items-center gap-1.5 font-headline text-xs font-bold text-indigo-600 hover:underline"
					>
						<Volume2 size={16} strokeWidth={2} />
						<span>Replay Audio</span>
					</button>

					{#if hasSpeechSupport}
						<button
							type="button"
							onclick={handleToggleMic}
							class="inline-flex cursor-pointer items-center gap-1.5 font-headline text-xs font-bold {isListening
								? 'animate-pulse text-rose-600'
								: 'text-slate-600 hover:text-slate-900 hover:underline'}"
						>
							<Mic size={16} strokeWidth={2} />
							<span>{isListening ? 'Listening...' : 'Practice Speaking'}</span>
						</button>
					{/if}
				</div>

				{#if speechResult}
					<div
						class="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-headline text-xs font-bold {speechResult.passed
							? 'border-emerald-200 bg-emerald-50 text-emerald-800'
							: 'border-amber-200 bg-amber-50 text-amber-800'}"
					>
						{#if speechResult.passed}
							<Check size={13} class="text-emerald-600 stroke-[3]" />
							<span>{Math.round(speechResult.score * 100)}% Accuracy</span>
						{:else}
							<RotateCcw size={13} class="text-amber-600" />
							<span>{Math.round(speechResult.score * 100)}% · Try Again</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Back Footer Hint -->
			<div
				class="flex items-center justify-center gap-1.5 font-sans text-xs font-medium text-slate-400"
			>
				<span>Rate your recall below</span>
			</div>
		</div>
	</div>
</div>
