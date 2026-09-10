<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { BUILTIN_STORIES } from '$lib/data/stories';
	import type { Story, StoryNode, StoryChoice } from '$lib/types';
	import {
		isSpeechRecognitionSupported,
		startSpeechRecognition,
		evaluateSpeechAccuracy,
		type SpeechRecognizerHandle,
		type SpeechEvaluationResult
	} from '$lib/utils/speech';
	import { saveStoryCompletion } from '$lib/utils/storyStorage';
	import { speakText, playSound } from '$lib/utils/audio';
	import {
		ChevronLeft,
		Volume2,
		Mic,
		CheckCircle2,
		AlertCircle,
		Sparkles,
		Star,
		RotateCcw,
		Languages,
		Check,
		ArrowRight
	} from 'lucide-svelte';

	let storyId = $derived(page.params.id);
	let story = $derived<Story | undefined>(BUILTIN_STORIES.find((s) => s.id === storyId));

	// State
	let currentNodeId = $state<string>('');
	let showPinyin = $state(true);
	let showTranslation = $state(false);

	// User Interaction & Choices
	let selectedChoice = $state<StoryChoice | null>(null);
	let choiceFeedback = $state<string | null>(null);

	// Cloze State
	let selectedClozeOption = $state<string | null>(null);
	let isClozeCorrect = $state<boolean | null>(null);

	// Speech State
	let isSpeechSupported = $state(false);
	let forceFallbackMode = $state(false);
	let isListening = $state(false);
	let speechTranscript = $state('');
	let speechResult = $state<SpeechEvaluationResult | null>(null);
	let speechRecognizer = $state<SpeechRecognizerHandle | null>(null);

	// Story Progress & Metrics
	let optimalChoicesCount = $state(0);
	let totalChoicesCount = $state(0);
	let earnedXP = $state(0);
	let isFinished = $state(false);
	let finalStars = $state(3);

	let currentNode = $derived<StoryNode | null>(
		story && currentNodeId && story.nodes[currentNodeId] ? story.nodes[currentNodeId] : null
	);

	let currentCharacter = $derived(() => {
		if (!story || !currentNode) return null;
		if (currentNode.speakerId === 'narrator') return null;
		if (currentNode.speakerId === 'player') {
			return { id: 'player', name: 'You', avatarUrl: '', role: 'Protagonist' };
		}
		return story.characters[currentNode.speakerId] || null;
	});

	onMount(() => {
		if (!story) {
			goto(resolve('/decks'), { replaceState: true });
			return;
		}
		isSpeechSupported = isSpeechRecognitionSupported();
		currentNodeId = story.startNodeId;
		speakCurrentNode();
	});

	onDestroy(() => {
		stopListening();
	});

	function speakCurrentNode() {
		if (currentNode?.audioText && story) {
			speakText(currentNode.audioText, story.language).catch(() => {});
		}
	}

	function handleSelectChoice(choice: StoryChoice) {
		selectedChoice = choice;
		choiceFeedback = choice.feedback || (choice.isOptimal ? 'Good response!' : 'Understood.');

		if (choice.isOptimal) {
			optimalChoicesCount++;
			playSound('correct');
		} else {
			playSound('flip');
		}
		totalChoicesCount++;
		earnedXP += choice.xpReward || 10;
	}

	function handleConfirmChoice() {
		if (!selectedChoice) return;
		const next = selectedChoice.nextNodeId;
		selectedChoice = null;
		choiceFeedback = null;
		advanceToNode(next);
	}

	function handleSelectCloze(option: string) {
		if (!currentNode?.cloze) return;
		selectedClozeOption = option;
		if (option === currentNode.cloze.correctOption) {
			isClozeCorrect = true;
			optimalChoicesCount++;
			totalChoicesCount++;
			earnedXP += 15;
			playSound('correct');
		} else {
			isClozeCorrect = false;
			totalChoicesCount++;
			playSound('wrong');
		}
	}

	function handleConfirmCloze() {
		if (!currentNode?.cloze || !isClozeCorrect) return;
		const next = currentNode.cloze.nextNodeId;
		selectedClozeOption = null;
		isClozeCorrect = null;
		advanceToNode(next);
	}

	function startListening() {
		if (!story || !currentNode?.expectedSpeech) return;
		stopListening();

		speechTranscript = '';
		speechResult = null;
		isListening = true;

		const langCode = story.language === 'chinese' ? 'zh-CN' : 'fr-FR';

		speechRecognizer = startSpeechRecognition({
			lang: langCode,
			onStart: () => {
				isListening = true;
			},
			onResult: (transcript, isFinal) => {
				speechTranscript = transcript;
				if (isFinal || transcript.trim().length >= 4) {
					evaluateSpeech(transcript);
				}
			},
			onError: (err) => {
				console.warn('Speech recognition notice:', err);
				isListening = false;
			},
			onEnd: () => {
				isListening = false;
				if (speechTranscript && !speechResult) {
					evaluateSpeech(speechTranscript);
				}
			}
		});
	}

	function stopListening() {
		if (speechRecognizer) {
			speechRecognizer.stop();
			speechRecognizer = null;
		}
		isListening = false;
	}

	function evaluateSpeech(transcript: string) {
		if (!story || !currentNode?.expectedSpeech) return;
		const evalRes = evaluateSpeechAccuracy(
			transcript,
			currentNode.expectedSpeech.target,
			story.language,
			currentNode.expectedSpeech.pinyin,
			currentNode.expectedSpeech.keywords
		);

		speechResult = evalRes;
		stopListening();

		if (evalRes.passed) {
			optimalChoicesCount++;
			earnedXP += 15;
			playSound('correct');
		} else {
			playSound('wrong');
		}
		totalChoicesCount++;
	}

	function handleConfirmSpeech() {
		if (!currentNode) return;
		const next = currentNode.nextNodeId || '';
		speechResult = null;
		speechTranscript = '';
		advanceToNode(next);
	}

	function advanceToNode(nextId?: string) {
		stopListening();
		selectedChoice = null;
		choiceFeedback = null;
		selectedClozeOption = null;
		isClozeCorrect = null;
		speechResult = null;
		speechTranscript = '';

		if (!nextId || !story?.nodes[nextId]) {
			finishStory();
			return;
		}

		currentNodeId = nextId;
		speakCurrentNode();
	}

	function finishStory() {
		if (!story) return;
		isFinished = true;

		// Compute final stars based on ratio of optimal choices & speech passes
		const accuracy = totalChoicesCount > 0 ? (optimalChoicesCount / totalChoicesCount) * 100 : 100;
		if (accuracy >= 85) finalStars = 3;
		else if (accuracy >= 60) finalStars = 2;
		else finalStars = 1;

		const totalAwardXP = Math.max(story.baseXP, earnedXP);
		saveStoryCompletion(story.id, Math.round(accuracy), finalStars, totalAwardXP);
		playSound('milestone');
	}

	function restartStory() {
		if (!story) return;
		currentNodeId = story.startNodeId;
		selectedChoice = null;
		choiceFeedback = null;
		selectedClozeOption = null;
		isClozeCorrect = null;
		speechResult = null;
		speechTranscript = '';
		optimalChoicesCount = 0;
		totalChoicesCount = 0;
		earnedXP = 0;
		isFinished = false;
		finalStars = 3;
		speakCurrentNode();
	}

	function getClozeOptionClass(opt: string): string {
		if (selectedClozeOption !== opt) {
			return 'border-white/60 bg-white/60 text-slate-800 hover:border-indigo-300 hover:bg-white/80';
		}
		if (isClozeCorrect === true) {
			return 'border-emerald-500 bg-emerald-50/90 text-emerald-800 ring-2 ring-emerald-500/20';
		}
		return 'border-rose-500 bg-rose-50/90 text-rose-800 ring-2 ring-rose-500/20';
	}
</script>

<svelte:head>
	<title>{story ? `${story.title} — Story Mode` : 'Story Mode'}</title>
</svelte:head>

{#if !story}
	<div class="flex min-h-screen items-center justify-center p-6 text-slate-500">
		<p class="font-headline text-sm font-semibold">Loading story scenario...</p>
	</div>
{:else}
	<div class="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-50 text-slate-900">
		<!-- Header bar -->
		<header
			class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-md"
		>
			<div class="flex items-center gap-2">
				<a
					href={resolve('/decks')}
					class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
					aria-label="Back to Decks"
				>
					<ChevronLeft size={18} strokeWidth={2.5} />
				</a>
				<div>
					<h1 class="font-headline text-xs font-bold text-slate-900">
						{story.title}
					</h1>
					<p class="font-sans text-[10px] text-slate-400">
						{story.difficulty} · ~{story.durationMinutes} min
					</p>
				</div>
			</div>

			<!-- Accessibility / Display Toggles -->
			<div class="flex items-center gap-1.5">
				{#if story.language === 'chinese'}
					<button
						type="button"
						onclick={() => (showPinyin = !showPinyin)}
						class="rounded-lg px-2.5 py-1 font-headline text-[11px] font-bold transition-colors {showPinyin
							? 'bg-indigo-600 text-white shadow-xs'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
						title="Toggle Pinyin"
					>
						拼
					</button>
				{/if}

				<button
					type="button"
					onclick={() => (showTranslation = !showTranslation)}
					class="flex items-center gap-1 rounded-lg px-2.5 py-1 font-headline text-[11px] font-bold transition-colors {showTranslation
						? 'bg-indigo-600 text-white shadow-xs'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					title="Toggle English Translation"
				>
					<Languages size={13} />
					<span>EN</span>
				</button>
			</div>
		</header>

		<!-- Scene Image — top fixed portion -->
		<div class="relative h-[42%] shrink-0 overflow-hidden bg-slate-200">
			<img src={story.bgImageUrl} alt="Scene Background" class="h-full w-full object-cover" />
			<!-- Soft bottom fade to blend into the content panel -->
			<div
				class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"
			></div>

			<!-- Character badge pinned over the image -->
			{#if currentCharacter()}
				<div class="absolute bottom-4 left-4">
					<div
						class="flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/85 p-1.5 pr-3.5 shadow-md backdrop-blur-sm"
					>
						<div class="relative">
							<img
								src={currentCharacter()?.avatarUrl}
								alt={currentCharacter()?.name}
								class="h-10 w-10 rounded-xl border border-white/90 object-cover shadow-xs"
							/>
							{#if currentNode?.speakerId !== 'player'}
								<button
									type="button"
									onclick={speakCurrentNode}
									class="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
									title="Replay Voice"
								>
									<Volume2 size={11} />
								</button>
							{/if}
						</div>
						<div>
							<span
								class="inline-block rounded-sm bg-indigo-50 px-1.5 py-0.5 font-headline text-[9px] font-bold tracking-wider text-indigo-600 uppercase"
							>
								{currentCharacter()?.role}
							</span>
							<h2 class="font-headline text-xs font-extrabold text-slate-900">
								{currentCharacter()?.name}
							</h2>
						</div>
					</div>
				</div>
			{:else}
				<!-- Narrator badge -->
				<div class="absolute bottom-4 left-4">
					<div
						class="inline-flex items-center gap-1.5 rounded-xl border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md backdrop-blur-sm"
					>
						<Sparkles size={14} class="text-amber-500" />
						<span>Scene Guide</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Dialogue Panel — scrollable content below image -->
		<div class="flex min-h-0 flex-1 flex-col overflow-y-auto bg-slate-50 px-4 pt-3 pb-6">
			{#if currentNode}
				<div class="space-y-3">
					<!-- Speaker Text -->
					<div class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
						<div class="flex items-start justify-between gap-2">
							<h3
								class="font-headline text-base leading-snug font-extrabold text-slate-900 sm:text-lg"
							>
								{currentNode.text}
							</h3>

							{#if currentNode.audioText}
								<button
									type="button"
									onclick={speakCurrentNode}
									class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95"
									title="Listen to audio"
								>
									<Volume2 size={15} />
								</button>
							{/if}
						</div>

						{#if showPinyin && currentNode.pinyin}
							<p class="mt-1.5 font-sans text-xs font-semibold tracking-wide text-indigo-500">
								{currentNode.pinyin}
							</p>
						{/if}

						{#if showTranslation && currentNode.translation}
							<p class="mt-1 font-sans text-xs leading-relaxed text-slate-500 italic">
								"{currentNode.translation}"
							</p>
						{/if}
					</div>

					<!-- 1. MULTIPLE CHOICE MODE -->
					{#if currentNode.type === 'choice' && currentNode.choices}
						<div class="space-y-2">
							<p
								class="px-1 font-headline text-[10px] font-bold tracking-wider text-slate-400 uppercase"
							>
								Choose your response
							</p>

							{#each currentNode.choices as choice (choice.id)}
								<button
									type="button"
									onclick={() => handleSelectChoice(choice)}
									class="w-full cursor-pointer rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-all duration-150 {selectedChoice?.id ===
									choice.id
										? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-400/20'
										: 'border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30'}"
								>
									<div class="flex items-center justify-between gap-2">
										<span class="font-headline text-sm font-bold text-slate-900">
											{choice.text}
										</span>
										{#if selectedChoice?.id === choice.id}
											<div
												class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white"
											>
												<Check size={12} strokeWidth={3} />
											</div>
										{/if}
									</div>

									{#if showPinyin && choice.pinyin}
										<p class="mt-0.5 font-sans text-xs font-medium text-indigo-500">
											{choice.pinyin}
										</p>
									{/if}

									{#if showTranslation && choice.translation}
										<p class="mt-0.5 font-sans text-xs text-slate-400">
											{choice.translation}
										</p>
									{/if}
								</button>
							{/each}

							{#if choiceFeedback}
								<div
									class="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-800"
								>
									<Sparkles size={14} class="shrink-0 text-amber-500" />
									<span>{choiceFeedback}</span>
								</div>
							{/if}

							{#if selectedChoice}
								<button
									type="button"
									onclick={handleConfirmChoice}
									class="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
								>
									<span>Continue</span>
									<ArrowRight size={16} />
								</button>
							{/if}
						</div>
					{/if}

					<!-- 2. CLOZE FILL-IN-THE-BLANK MODE -->
					{#if currentNode.type === 'cloze' && currentNode.cloze}
						<div class="space-y-3">
							<p
								class="px-1 font-headline text-[10px] font-bold tracking-wider text-slate-400 uppercase"
							>
								Complete the sentence
							</p>

							<div
								class="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm"
							>
								<p class="font-headline text-base font-bold text-slate-900">
									{#if selectedClozeOption}
										{currentNode.cloze.sentence.replace('{blank}', `[ ${selectedClozeOption} ]`)}
									{:else}
										{currentNode.cloze.sentence.replace('{blank}', '[ ______ ]')}
									{/if}
								</p>
								{#if showPinyin && currentNode.cloze.pinyin}
									<p class="mt-1 font-sans text-xs text-indigo-500">
										{currentNode.cloze.pinyin}
									</p>
								{/if}
								{#if showTranslation && currentNode.cloze.translation}
									<p class="mt-1 font-sans text-xs text-slate-400">
										{currentNode.cloze.translation}
									</p>
								{/if}
							</div>

							<div class="grid grid-cols-2 gap-2">
								{#each currentNode.cloze.options as opt (opt)}
									<button
										type="button"
										onclick={() => handleSelectCloze(opt)}
										class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white px-3 py-3 text-center shadow-sm transition-all {getClozeOptionClass(
											opt
										)}"
									>
										<span class="font-headline text-sm font-bold text-slate-900">{opt}</span>
										{#if showPinyin && currentNode.cloze.optionPinyins?.[opt]}
											<span class="mt-0.5 font-sans text-[11px] font-semibold text-indigo-500">
												{currentNode.cloze.optionPinyins?.[opt]}
											</span>
										{/if}
										{#if showTranslation && currentNode.cloze.optionTranslations?.[opt]}
											<span class="mt-0.5 font-sans text-[10px] text-slate-400">
												{currentNode.cloze.optionTranslations?.[opt]}
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
										<CheckCircle2 size={16} />
										<span>Correct! Great word choice.</span>
									{:else}
										<AlertCircle size={16} />
										<span>Incorrect word. Tap another option!</span>
									{/if}
								</div>
							{/if}

							{#if isClozeCorrect}
								<button
									type="button"
									onclick={handleConfirmCloze}
									class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
								>
									<span>Continue</span>
									<ArrowRight size={16} />
								</button>
							{/if}
						</div>
					{/if}

					<!-- 3. SPEECH CHECKPOINT MODE -->
					{#if currentNode.type === 'speech' && currentNode.expectedSpeech}
						<div class="space-y-3">
							<div class="flex items-center justify-between px-1">
								<p
									class="font-headline text-[10px] font-bold tracking-wider text-slate-400 uppercase"
								>
									Speech Checkpoint
								</p>
								<button
									type="button"
									onclick={() => (forceFallbackMode = !forceFallbackMode)}
									class="font-headline text-[11px] font-bold text-indigo-600 hover:underline"
								>
									{forceFallbackMode ? 'Use Voice' : 'Tap Choices Instead'}
								</button>
							</div>

							{#if isSpeechSupported && !forceFallbackMode}
								<div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center">
									<p class="font-headline text-base font-extrabold text-slate-900">
										"{currentNode.expectedSpeech.target}"
									</p>
									{#if showPinyin && currentNode.expectedSpeech.pinyin}
										<p class="mt-1 font-sans text-xs font-bold text-indigo-500">
											{currentNode.expectedSpeech.pinyin}
										</p>
									{/if}
								</div>

								<div class="flex flex-col items-center justify-center py-2">
									<button
										type="button"
										onclick={isListening ? stopListening : startListening}
										class="relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95 {isListening
											? 'animate-pulse bg-rose-500 text-white shadow-lg ring-8 ring-rose-100'
											: 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'}"
										title={isListening ? 'Stop recording' : 'Start speaking'}
									>
										<Mic size={32} strokeWidth={2.2} />
									</button>
									<p class="mt-2.5 font-headline text-xs font-bold text-slate-500">
										{isListening ? 'Listening... Speak clearly now!' : 'Tap mic and speak phrase'}
									</p>
								</div>

								{#if speechTranscript}
									<div
										class="rounded-xl border border-slate-200/80 bg-white p-3 text-center shadow-sm"
									>
										<p class="font-sans text-xs text-slate-400">Heard:</p>
										<p class="font-headline text-sm font-bold text-slate-900">
											"{speechTranscript}"
										</p>
									</div>
								{/if}

								{#if speechResult}
									<div
										class="rounded-2xl border p-3.5 text-xs font-bold {speechResult.passed
											? 'border-emerald-100 bg-emerald-50 text-emerald-800'
											: 'border-amber-100 bg-amber-50 text-amber-800'}"
									>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												{#if speechResult.passed}
													<CheckCircle2 size={18} class="text-emerald-500" />
												{:else}
													<AlertCircle size={18} class="text-amber-500" />
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

									{#if speechResult.passed}
										<button
											type="button"
											onclick={handleConfirmSpeech}
											class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
										>
											<span>Continue</span>
											<ArrowRight size={16} />
										</button>
									{:else}
										<button
											type="button"
											onclick={startListening}
											class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 py-2.5 font-headline text-xs font-bold text-indigo-600 hover:bg-indigo-100"
										>
											<RotateCcw size={14} />
											<span>Try Speaking Again</span>
										</button>
									{/if}
								{/if}
							{:else}
								<div class="space-y-2">
									{#each currentNode.expectedSpeech.fallbackChoices as choice (choice.id)}
										<button
											type="button"
											onclick={() => handleSelectChoice(choice)}
											class="w-full cursor-pointer rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-all {selectedChoice?.id ===
											choice.id
												? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-400/20'
												: 'border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/30'}"
										>
											<span class="font-headline text-sm font-bold text-slate-900">
												{choice.text}
											</span>
											{#if showPinyin && choice.pinyin}
												<p class="mt-0.5 font-sans text-xs text-indigo-500">{choice.pinyin}</p>
											{/if}
										</button>
									{/each}

									{#if selectedChoice}
										<button
											type="button"
											onclick={handleConfirmChoice}
											class="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
										>
											<span>Continue</span>
											<ArrowRight size={16} />
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					<!-- 4. DIALOGUE MODE -->
					{#if currentNode.type === 'dialogue'}
						<button
							type="button"
							onclick={() => advanceToNode(currentNode?.nextNodeId)}
							class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
						>
							<span>{currentNode.nextNodeId ? 'Continue' : 'Complete Quest'}</span>
							<ArrowRight size={16} />
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- FINISH / CELEBRATION MODAL -->
		{#if isFinished}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
			>
				<div
					class="w-full max-w-md space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-2xl"
				>
					<div class="flex justify-center gap-2 pt-2">
						{#each [1, 2, 3] as s (s)}
							<Star
								size={36}
								class="transition-transform duration-300 {s <= finalStars
									? 'scale-110 fill-amber-400 text-amber-400'
									: 'fill-slate-200 text-slate-200'}"
							/>
						{/each}
					</div>

					<div class="space-y-1">
						<h3 class="font-headline text-2xl font-extrabold text-slate-900">
							Scenario Completed!
						</h3>
						<p class="font-sans text-xs text-slate-400">
							You successfully navigated {story.title}
						</p>
					</div>

					<div
						class="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2 font-headline text-sm font-extrabold text-indigo-700"
					>
						<Sparkles size={18} class="text-indigo-600" />
						<span>+{earnedXP || story.baseXP} XP Earned</span>
					</div>

					{#if story.summaryVocabulary && story.summaryVocabulary.length > 0}
						<div class="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-left">
							<p
								class="font-headline text-[11px] font-bold tracking-wider text-slate-400 uppercase"
							>
								Vocabulary Practiced
							</p>
							<div class="mt-2 space-y-1.5">
								{#each story.summaryVocabulary as vocab (vocab.word)}
									<div class="flex items-center justify-between text-xs">
										<span class="font-headline font-bold text-slate-900">{vocab.word}</span>
										<span class="font-sans text-slate-500">{vocab.meaning}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-3 pt-2">
						<button
							type="button"
							onclick={restartStory}
							class="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-3 font-headline text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
						>
							<RotateCcw size={14} />
							<span>Play Again</span>
						</button>

						<a
							href={resolve('/decks')}
							class="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
						>
							<span>Back to Decks</span>
							<ArrowRight size={14} />
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
