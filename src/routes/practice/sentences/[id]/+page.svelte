<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { getBuiltinPacks, getAllCustomDecks } from '$lib/utils/storage';
	import {
		buildCloze,
		buildClozeOptions,
		renderClozeSentence,
		shuffleArray,
		chunkSentence,
		type SentenceExample,
		type ClozeOption,
		type SentenceChunk
	} from '$lib/utils/sentencePractice';
	import {
		speakText,
		playSound,
		stopSpeech,
		isAudioRecordingSupported,
		startUserVoiceRecording,
		stopUserVoiceRecording,
		playUserAudio
	} from '$lib/utils/audio';
	import {
		isSpeechRecognitionSupported,
		startSpeechRecognition,
		evaluateSpeechAccuracy,
		type SpeechEvaluationResult,
		type SpeechRecognizerHandle
	} from '$lib/utils/speech';
	import { calculateReviewXP, calculateSessionBonus, addXP } from '$lib/utils/xp';
	import type { WordRecord } from '$lib/types';
	import {
		X,
		Volume2,
		Mic,
		CheckCircle2,
		AlertCircle,
		Check,
		Sparkles,
		RotateCcw,
		Languages,
		MessagesSquare,
		CheckCheck,
		Repeat,
		Play,
		Square,
		Turtle
	} from 'lucide-svelte';

	interface SentenceItem {
		packId: string;
		wordNo: number;
		cloze: SentenceExample;
		options: ClozeOption[];
	}

	type PracticeMode = 'cloze' | 'repeat';
	let practiceMode = $state<PracticeMode>('cloze');

	let deckId = $derived(page.params.id || '');
	let deckTitle = $state('Sentence Practice');
	let deckLanguage = $state<'chinese' | 'french'>('chinese');
	let items = $state<SentenceItem[]>([]);
	let currentIndex = $state(0);
	let isAdvancing = $state(false);
	let showTranslation = $state(false);

	let selectedOption = $state<string | null>(null);
	let isClozeCorrect = $state<boolean | null>(null);

	let currentItem = $derived(items[currentIndex]);
	let progressCount = $derived(items.length > 0 ? currentIndex + 1 : 0);

	let filledSentence = $derived(
		currentItem
			? renderClozeSentence(
					currentItem.cloze.fullSentence || currentItem.cloze.displaySentence,
					currentItem.cloze.targetWord
				)
			: ''
	);
	let filledPinyin = $derived(
		currentItem
			? renderClozeSentence(
					currentItem.cloze.fullPinyin || currentItem.cloze.pinyin,
					currentItem.cloze.targetPinyin
				)
			: ''
	);

	// Repeat-after-me progressive chunk state
	let currentChunks = $derived<SentenceChunk[]>(
		currentItem
			? chunkSentence(
					filledSentence,
					filledPinyin || currentItem.cloze.targetPinyin,
					deckLanguage
				)
			: []
	);
	let currentChunkIndex = $state(0);
	let activeChunk = $derived(currentChunks[currentChunkIndex] || null);
	let completedChunkIndices = $state<number[]>([]);
	let isRepeatComplete = $derived(
		currentChunks.length > 0 && completedChunkIndices.length >= currentChunks.length
	);
	let isUserRecording = $state(false);
	let recordedAudioUrl = $state<string | null>(null);
	let isAudioRecordingAvail = $state(false);

	let hasAnswered = $derived(practiceMode === 'cloze' ? isClozeCorrect !== null : isRepeatComplete);

	let sessionCorrect = $state(0);
	let sessionWrong = $state(0);
	let sessionEarnedXP = $state(0);
	let isSessionFinished = $state(false);

	let isSpeechSupported = $state(false);
	let isListening = $state(false);
	let speechTranscript = $state('');
	let speechResult = $state<SpeechEvaluationResult | null>(null);
	let recognizerHandle: SpeechRecognizerHandle | null = null;

	let sessionAccuracy = $derived(
		sessionCorrect + sessionWrong > 0
			? Math.round((sessionCorrect / (sessionCorrect + sessionWrong)) * 100)
			: 100
	);

	async function loadSession() {
		stopSpeech();
		let rawWords: WordRecord[] = [];
		let title = 'Sentence Practice';
		let lang: 'chinese' | 'french' = 'chinese';

		if (deckId.startsWith('custom-')) {
			const customDecks = await getAllCustomDecks();
			const match = customDecks.find((d) => d.id === deckId);
			if (match) {
				rawWords = match.words;
				title = match.name;
				lang = match.language || 'chinese';
			}
		} else {
			const chPacks = await getBuiltinPacks('chinese');
			const chMatch = chPacks.find(
				(p) =>
					p.id === deckId || p.id === `chinese-${deckId}` || p.id.replace('chinese-', '') === deckId
			);
			if (chMatch) {
				rawWords = chMatch.words;
				title = chMatch.title;
				lang = 'chinese';
			} else {
				const frPacks = await getBuiltinPacks('french');
				const frMatch = frPacks.find(
					(p) =>
						p.id === deckId || p.id === `french-${deckId}` || p.id.replace('french-', '') === deckId
				);
				if (frMatch) {
					rawWords = frMatch.words;
					title = frMatch.title;
					lang = 'french';
				}
			}
		}

		deckTitle = title;
		deckLanguage = lang;

		const built: SentenceItem[] = [];
		for (const word of rawWords) {
			const cloze = buildCloze(word, lang);
			if (!cloze) continue;
			built.push({
				packId: deckId,
				wordNo: word.No,
				cloze,
				options: buildClozeOptions(cloze, rawWords)
			});
		}

		items = shuffleArray(built);
		currentIndex = 0;
		isSessionFinished = false;
		sessionCorrect = 0;
		sessionWrong = 0;
		sessionEarnedXP = 0;
		resetItemState();
	}

	function resetItemState() {
		selectedOption = null;
		isClozeCorrect = null;
		showTranslation = false;
		stopListening();
		speechResult = null;
		speechTranscript = '';
		currentChunkIndex = 0;
		completedChunkIndices = [];
		if (recordedAudioUrl) {
			URL.revokeObjectURL(recordedAudioUrl);
			recordedAudioUrl = null;
		}
		isUserRecording = false;
	}

	function handleSelectOption(option: ClozeOption) {
		if (!currentItem || isAdvancing || hasAnswered) return;
		selectedOption = option.text;
		showTranslation = true;

		if (option.isCorrect) {
			isClozeCorrect = true;
			sessionCorrect++;
			const earned = calculateReviewXP('all', 'easy');
			addXP(earned);
			sessionEarnedXP += earned;
			playSound('correct');
		} else {
			isClozeCorrect = false;
			sessionWrong++;
			playSound('wrong');
		}
	}

	async function handleContinue() {
		if (!currentItem || !hasAnswered || isAdvancing) return;
		isAdvancing = true;

		try {
			if (currentIndex + 1 >= items.length) {
				const bonus = calculateSessionBonus('all', items.length, sessionCorrect);
				if (bonus.totalBonus > 0) {
					addXP(bonus.totalBonus);
					sessionEarnedXP += bonus.totalBonus;
				}
				stopSpeech();
				isSessionFinished = true;
				playSound('milestone');
			} else {
				currentIndex++;
				resetItemState();
			}
		} finally {
			isAdvancing = false;
		}
	}

	function getOptionClass(option: ClozeOption): string {
		if (!hasAnswered) {
			return 'border-white/70 bg-white/75 text-slate-800 backdrop-blur-md hover:border-indigo-300 hover:bg-white/90';
		}
		if (option.isCorrect) {
			return 'border-emerald-500 bg-emerald-50/90 text-emerald-800 ring-2 ring-emerald-500/20';
		}
		if (selectedOption === option.text) {
			return 'border-rose-500 bg-rose-50/90 text-rose-800 ring-2 ring-rose-500/20';
		}
		return 'border-slate-200/60 bg-white/60 text-slate-400 opacity-60';
	}

	function startListening(targetText?: string, targetPinyin?: string) {
		if (!currentItem) return;
		stopListening();
		speechTranscript = '';
		speechResult = null;
		isListening = true;

		const langCode = deckLanguage === 'chinese' ? 'zh-CN' : 'fr-FR';

		recognizerHandle = startSpeechRecognition({
			lang: langCode,
			continuous: false,
			onStart: () => {
				isListening = true;
			},
			onResult: (transcript, isFinal) => {
				speechTranscript = transcript;
				const target = targetText || filledSentence || currentItem?.cloze.fullSentence || '';
				if (isFinal || transcript.trim().length >= target.trim().length) {
					evaluateSpeech(transcript, targetText, targetPinyin);
				}
			},
			onError: () => {
				stopListening();
			},
			onEnd: () => {
				if (isListening && speechTranscript) {
					evaluateSpeech(speechTranscript, targetText, targetPinyin);
				}
				isListening = false;
			}
		});
	}

	function stopListening() {
		if (recognizerHandle) {
			recognizerHandle.stop();
			recognizerHandle = null;
		}
		isListening = false;
	}

	function evaluateSpeech(transcript: string, targetText?: string, targetPinyin?: string) {
		if (!currentItem) return;

		const expected = targetText || filledSentence || currentItem.cloze.fullSentence;
		const pinyin =
			targetPinyin ||
			filledPinyin ||
			currentItem.cloze.fullPinyin ||
			currentItem.cloze.pinyin ||
			currentItem.cloze.targetPinyin;
		const keywords = practiceMode === 'cloze' ? [currentItem.cloze.targetWord] : undefined;

		const result = evaluateSpeechAccuracy(transcript, expected, deckLanguage, pinyin, keywords);
		speechResult = result;
		stopListening();

		if (result.passed) {
			playSound('correct');

			if (practiceMode === 'repeat' && activeChunk) {
				if (!completedChunkIndices.includes(currentChunkIndex)) {
					completedChunkIndices = [...completedChunkIndices, currentChunkIndex];
				}

				// If not the last chunk, automatically advance chunk or celebrate completion
				if (currentChunkIndex + 1 < currentChunks.length) {
					setTimeout(() => {
						currentChunkIndex++;
						speechResult = null;
						speechTranscript = '';
					}, 1200);
				} else {
					// All chunks + full sentence completed!
					sessionCorrect++;
					const earned = calculateReviewXP('all', 'easy');
					addXP(earned);
					sessionEarnedXP += earned;
				}
			}
		} else {
			playSound('wrong');
			if (practiceMode === 'repeat') {
				sessionWrong++;
			}
		}
	}

	function handleReplayAudio(text?: string, rate = 0.8) {
		if (!currentItem) return;
		const toSpeak = text || filledSentence || currentItem.cloze.fullSentence;
		speakText(toSpeak, deckLanguage, { rate });
	}

	async function toggleUserRecording() {
		if (isUserRecording) {
			isUserRecording = false;
			const url = await stopUserVoiceRecording();
			if (url) {
				if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
				recordedAudioUrl = url;
			}
		} else {
			const started = await startUserVoiceRecording();
			if (started) {
				isUserRecording = true;
			}
		}
	}

	function playRecordedVoice() {
		if (recordedAudioUrl) {
			playUserAudio(recordedAudioUrl);
		}
	}

	onMount(() => {
		isSpeechSupported = isSpeechRecognitionSupported();
		isAudioRecordingAvail = isAudioRecordingSupported();
		loadSession();
	});

	onDestroy(() => {
		stopListening();
		stopSpeech();
		if (recordedAudioUrl) {
			URL.revokeObjectURL(recordedAudioUrl);
		}
	});
</script>

<svelte:head>
	<title>Sentence Practice — {deckTitle}</title>
</svelte:head>

<div
	class="relative flex min-h-screen flex-col justify-between overflow-hidden bg-linear-to-b from-indigo-100 via-indigo-50/40 to-white"
>
	<div class="pointer-events-none absolute inset-0 z-0">
		<div class="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl"></div>
		<div class="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl"></div>
		<div class="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
	</div>

	<header
		class="sticky top-0 z-30 flex items-center justify-between border-b border-white/60 bg-white/60 px-4 py-3 shadow-xs backdrop-blur-xl"
	>
		<button
			type="button"
			onclick={() => goto(resolve(`/deck/${deckId}/preview`))}
			aria-label="Exit Sentence Practice"
			class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
		>
			<X size={18} strokeWidth={2.25} />
		</button>

		<div class="flex flex-col items-center">
			<h2 class="max-w-[170px] truncate font-headline text-sm font-bold text-slate-900">
				{deckTitle}
			</h2>
			<span class="font-headline text-[11px] font-semibold text-slate-500">
				{progressCount} / {items.length} sentences
			</span>
		</div>

		<div
			class="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 font-headline text-xs font-bold text-emerald-700"
		>
			<CheckCheck size={13} strokeWidth={2.25} />
			<span>{sessionAccuracy}%</span>
		</div>
	</header>

	<div class="h-1.5 w-full overflow-hidden bg-white/60 backdrop-blur-xs">
		<div
			class="h-full bg-indigo-600 transition-all duration-300 ease-out"
			style="width: {items.length > 0 ? (progressCount / items.length) * 100 : 0}%"
		></div>
	</div>

	<main
		class="relative z-10 mx-auto flex w-full flex-1 flex-col justify-center px-4 py-4 sm:max-w-md"
	>
		{#if isSessionFinished}
			<div
				class="space-y-4 rounded-3xl border border-white/60 bg-white/60 p-6 text-center shadow-xl shadow-indigo-600/5 backdrop-blur-xl"
			>
				<div
					class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-100 bg-indigo-50"
				>
					<MessagesSquare size={36} strokeWidth={1.75} class="text-indigo-600" />
				</div>

				<div class="flex flex-wrap items-center justify-center gap-2">
					<div
						class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-headline text-xs font-bold text-indigo-700"
					>
						<Check size={13} strokeWidth={2.25} />
						<span>PRACTICE COMPLETED</span>
					</div>

					{#if sessionEarnedXP > 0}
						<div
							class="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900"
						>
							<Sparkles size={13} strokeWidth={2.25} class="text-amber-600" />
							<span>+{sessionEarnedXP} XP</span>
						</div>
					{/if}
				</div>

				<h2 class="font-headline text-2xl font-black text-slate-900">Great Work!</h2>
				<p class="font-body text-xs text-slate-500">
					You completed all {items.length} example sentences in this run.
				</p>

				<div class="grid grid-cols-2 gap-3 border-y border-slate-100 py-3">
					<div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-emerald-700">{sessionCorrect}</p>
						<p class="text-[11px] font-bold text-emerald-600">Correct</p>
					</div>
					<div class="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
						<p class="font-headline text-xl font-black text-rose-700">{sessionWrong}</p>
						<p class="text-[11px] font-bold text-rose-600">Extra Tries</p>
					</div>
				</div>

				<button
					type="button"
					onclick={loadSession}
					class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98]"
				>
					<RotateCcw size={16} strokeWidth={2.25} />
					<span>Practice Again</span>
				</button>
				<button
					type="button"
					onclick={() => goto(resolve(`/deck/${deckId}/preview`))}
					class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-100 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
				>
					Back to Deck
				</button>
			</div>
		{:else if currentItem}
			<div class="space-y-4">
				<!-- Segmented Mode Control adhering to design.md -->
				<div
					class="flex rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1 backdrop-blur-xs"
					role="tablist"
					aria-label="Practice Mode"
				>
					<button
						type="button"
						role="tab"
						aria-selected={practiceMode === 'cloze'}
						onclick={() => {
							practiceMode = 'cloze';
							resetItemState();
						}}
						class="flex-1 cursor-pointer rounded-xl py-2 text-center font-headline text-xs font-bold transition-all {practiceMode ===
						'cloze'
							? 'bg-white text-indigo-700 shadow-sm'
							: 'text-slate-500 hover:text-slate-800'}"
					>
						Fill the Blank
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={practiceMode === 'repeat'}
						onclick={() => {
							practiceMode = 'repeat';
							resetItemState();
						}}
						class="flex-1 cursor-pointer rounded-xl py-2 text-center font-headline text-xs font-bold transition-all {practiceMode ===
						'repeat'
							? 'bg-white text-indigo-700 shadow-sm'
							: 'text-slate-500 hover:text-slate-800'}"
					>
						Repeat After Me
					</button>
				</div>

				{#if practiceMode === 'cloze'}
					<!-- Existing Cloze Mode View -->
					<div
						class="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-xl shadow-indigo-600/5 backdrop-blur-xl"
					>
						<div class="flex items-center justify-between gap-2">
							<span
								class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-1 font-headline text-[10px] font-bold tracking-wider text-indigo-700 uppercase backdrop-blur-xs"
							>
								<MessagesSquare size={11} strokeWidth={2.25} />
								<span>Complete the sentence</span>
							</span>

							<div class="flex items-center gap-1">
								{#if isSpeechSupported}
									<button
										type="button"
										onclick={() =>
											isListening
												? stopListening()
												: startListening(
														currentItem?.cloze.fullSentence,
														currentItem?.cloze.pinyin || currentItem?.cloze.targetPinyin
													)}
										title="Practice speaking this sentence"
										aria-label="Practice speaking this sentence"
										class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors active:scale-95 {isListening
											? 'animate-pulse bg-rose-50 text-rose-600'
											: 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}"
									>
										<Mic size={15} strokeWidth={2.25} />
									</button>
								{/if}

								<button
									type="button"
									onclick={() => handleReplayAudio()}
									title="Replay example audio"
									aria-label="Replay example audio"
									class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
								>
									<Volume2 size={15} strokeWidth={2.25} />
								</button>

								{#if currentItem.cloze.translation}
									<button
										type="button"
										onclick={() => (showTranslation = !showTranslation)}
										class="flex h-8 cursor-pointer items-center gap-1 rounded-xl px-2 font-headline text-[10px] font-bold transition-colors active:scale-95 {showTranslation
											? 'bg-indigo-600 text-white'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
										title="Toggle English Translation"
									>
										<Languages size={12} strokeWidth={2.25} />
										<span>EN</span>
									</button>
								{/if}
							</div>
						</div>

						<div class="mt-4 text-center">
							<p
								class="font-headline text-lg leading-snug font-extrabold text-slate-900 {deckLanguage ===
								'chinese'
									? 'font-hanzi'
									: ''}"
							>
								{renderClozeSentence(
									currentItem.cloze.displaySentence,
									hasAnswered ? currentItem.cloze.targetWord : undefined
								)}
							</p>

							{#if currentItem.cloze.pinyin}
								<p class="mt-2 font-sans text-sm font-semibold tracking-wide text-indigo-500">
									{renderClozeSentence(
										currentItem.cloze.pinyin,
										hasAnswered ? currentItem.cloze.targetPinyin : '[ ______ ]'
									)}
								</p>
							{/if}

							{#if showTranslation && currentItem.cloze.translation}
								<p class="mt-1.5 font-sans text-xs leading-relaxed text-slate-400 italic">
									"{currentItem.cloze.translation}"
								</p>
							{/if}
						</div>

						{#if speechResult}
							<div
								class="mt-4 rounded-2xl border p-3 text-xs font-bold {speechResult.passed
									? 'border-emerald-100 bg-emerald-50 text-emerald-800'
									: 'border-amber-100 bg-amber-50 text-amber-800'}"
							>
								<div class="flex items-center justify-between gap-2">
									<div class="flex items-center gap-2">
										{#if speechResult.passed}
											<CheckCircle2 size={16} class="text-emerald-500" />
										{:else}
											<AlertCircle size={16} class="text-amber-500" />
										{/if}
										<span>{speechResult.feedback}</span>
									</div>
									<span
										class="rounded-full bg-white px-2 py-0.5 font-headline text-[11px] shadow-xs"
									>
										{Math.round(speechResult.score * 100)}%
									</span>
								</div>
							</div>
						{/if}

						{#if speechTranscript && !speechResult}
							<div class="mt-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-center">
								<p class="font-sans text-[10px] text-slate-400">Heard:</p>
								<p class="font-headline text-xs font-bold text-slate-900">"{speechTranscript}"</p>
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-2 gap-2">
						{#each currentItem.options as option (option.text)}
							<button
								type="button"
								onclick={() => handleSelectOption(option)}
								disabled={hasAnswered}
								class="flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border px-3 py-3 text-center shadow-sm transition-all active:scale-[0.98] {getOptionClass(
									option
								)}"
							>
								<span
									class="font-headline text-sm font-bold text-slate-900 {deckLanguage === 'chinese'
										? 'font-hanzi'
										: ''}"
								>
									{option.text}
								</span>
								{#if option.pinyin}
									<span class="font-sans text-[11px] font-semibold text-indigo-500">
										{option.pinyin}
									</span>
								{/if}
							</button>
						{/each}
					</div>

					{#if isClozeCorrect !== null}
						<div
							class="flex items-center gap-2 rounded-xl p-3 text-xs font-bold {isClozeCorrect
								? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
								: 'border border-rose-100 bg-rose-50 text-rose-700'}"
						>
							{#if isClozeCorrect}
								<CheckCircle2 size={16} class="shrink-0" />
								<span>Correct! You nailed this sentence.</span>
							{:else}
								<AlertCircle size={16} class="shrink-0" />
								<span>That's incorrect.</span>
							{/if}
						</div>
					{/if}
				{:else}
					<!-- Repeat After Me (Shadowing & Stepping) Mode View -->
					<div
						class="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-xl shadow-indigo-600/5 backdrop-blur-xl"
					>
						<!-- Chunk progress indicator chips -->
						<div class="flex items-center justify-between gap-1 border-b border-slate-100 pb-3">
							<span
								class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/90 px-2.5 py-1 font-headline text-[10px] font-bold tracking-wider text-indigo-700 uppercase"
							>
								<Repeat size={11} strokeWidth={2.25} />
								<span>Repeat After Me</span>
							</span>

							<div class="flex flex-wrap items-center gap-1">
								{#each currentChunks as chunk, idx (chunk.text + idx)}
									<button
										type="button"
										onclick={() => {
											currentChunkIndex = idx;
											speechResult = null;
											speechTranscript = '';
										}}
										class="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-headline text-[10px] font-bold transition-all {idx ===
										currentChunkIndex
											? 'border border-indigo-600 bg-indigo-600 text-white shadow-xs'
											: completedChunkIndices.includes(idx)
												? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
												: 'border border-slate-200 bg-white text-slate-400'}"
									>
										{#if completedChunkIndices.includes(idx)}
											<Check size={10} strokeWidth={2.5} />
										{/if}
										<span>{chunk.isFullSentence ? 'Full Sentence' : `Part ${idx + 1}`}</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- Active Clause Display -->
						{#if activeChunk}
							<div class="mt-4 text-center">
								<p
									class="font-headline text-xl leading-snug font-extrabold text-slate-900 {deckLanguage ===
									'chinese'
										? 'font-hanzi'
										: ''}"
								>
									{renderClozeSentence(activeChunk.text, currentItem.cloze.targetWord)}
								</p>

								{#if activeChunk.pinyin}
									<p class="mt-2 font-sans text-sm font-semibold tracking-wide text-indigo-600">
										{renderClozeSentence(activeChunk.pinyin, currentItem.cloze.targetPinyin)}
									</p>
								{/if}

								{#if currentItem.cloze.translation}
									<p class="mt-1.5 font-sans text-xs text-slate-400 italic">
										"{currentItem.cloze.translation}"
									</p>
								{/if}
							</div>

							<!-- Audio Controls and Shadowing Actions -->
							<div class="mt-5 flex flex-wrap items-center justify-center gap-2">
								<!-- Listen standard speed -->
								<button
									type="button"
									onclick={() => handleReplayAudio(activeChunk.text, 0.82)}
									class="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 font-headline text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 active:scale-95"
									title="Listen to native pronunciation"
								>
									<Volume2 size={16} strokeWidth={2.25} />
									<span>Listen</span>
								</button>

								<!-- Listen slow speed -->
								<button
									type="button"
									onclick={() => handleReplayAudio(activeChunk.text, 0.65)}
									class="flex h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-3 font-headline text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
									title="Slow speed (0.65x)"
								>
									<Turtle size={14} strokeWidth={2.25} />
									<span>Slow</span>
								</button>

								<!-- Speak button -->
								{#if isSpeechSupported}
									<button
										type="button"
										onclick={() =>
											isListening
												? stopListening()
												: startListening(activeChunk.text, activeChunk.pinyin)}
										class="flex h-11 cursor-pointer items-center gap-2 rounded-2xl px-5 font-headline text-xs font-bold text-white shadow-md transition-all active:scale-95 {isListening
											? 'animate-pulse bg-rose-600 shadow-rose-600/20'
											: 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700'}"
									>
										<Mic size={16} strokeWidth={2.25} />
										<span>{isListening ? 'Listening...' : 'Speak Now'}</span>
									</button>
								{/if}

								<!-- Optional user voice recording for self-comparison -->
								{#if isAudioRecordingAvail}
									<button
										type="button"
										onclick={toggleUserRecording}
										class="flex h-11 cursor-pointer items-center gap-1.5 rounded-2xl border px-3 font-headline text-xs font-bold transition-all active:scale-95 {isUserRecording
											? 'animate-pulse border-rose-300 bg-rose-50 text-rose-700'
											: 'border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50'}"
										title="Record your voice to listen back"
									>
										{#if isUserRecording}
											<Square size={13} strokeWidth={2.5} class="text-rose-600" />
											<span>Stop</span>
										{:else}
											<Mic size={13} strokeWidth={2.25} />
											<span>Record Self</span>
										{/if}
									</button>

									{#if recordedAudioUrl}
										<button
											type="button"
											onclick={playRecordedVoice}
											class="flex h-11 cursor-pointer items-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 font-headline text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 active:scale-95"
											title="Listen to your recorded attempt"
										>
											<Play size={13} strokeWidth={2.5} />
											<span>My Voice</span>
										</button>
									{/if}
								{/if}
							</div>

							<!-- Feedback box -->
							{#if speechResult}
								<div
									class="mt-4 rounded-2xl border p-3 text-xs font-bold {speechResult.passed
										? 'border-emerald-100 bg-emerald-50 text-emerald-800'
										: 'border-amber-100 bg-amber-50 text-amber-800'}"
								>
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2">
											{#if speechResult.passed}
												<CheckCircle2 size={16} class="text-emerald-500" />
											{:else}
												<AlertCircle size={16} class="text-amber-500" />
											{/if}
											<span>{speechResult.feedback}</span>
										</div>
										<span
											class="rounded-full bg-white px-2 py-0.5 font-headline text-[11px] shadow-xs"
										>
											{Math.round(speechResult.score * 100)}%
										</span>
									</div>
								</div>
							{/if}

							{#if speechTranscript && !speechResult}
								<div
									class="mt-3 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-center"
								>
									<p class="font-sans text-[10px] text-slate-400">Heard:</p>
									<p class="font-headline text-xs font-bold text-slate-900">"{speechTranscript}"</p>
								</div>
							{/if}
						{/if}
					</div>
				{/if}

				{#if hasAnswered}
					<button
						type="button"
						onclick={handleContinue}
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
					>
						<span>{currentIndex + 1 >= items.length ? 'Finish Practice' : 'Continue'}</span>
					</button>
				{/if}
			</div>
		{:else}
			<div
				class="space-y-3 rounded-3xl border border-dashed border-white/60 bg-white/50 p-8 text-center text-slate-500 shadow-xl shadow-indigo-600/5 backdrop-blur-xl"
			>
				<MessagesSquare size={40} strokeWidth={1.5} class="mx-auto mb-2 text-slate-400" />
				<h3 class="font-headline text-base font-bold text-slate-800">
					No Example Sentences Available
				</h3>
				<p class="font-sans text-xs text-slate-400">
					This deck has no cards with example sentences to practice.
				</p>
				<a
					href={resolve(`/deck/${deckId}/preview`)}
					class="flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-600 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
				>
					Back to Deck
				</a>
			</div>
		{/if}
	</main>
</div>
