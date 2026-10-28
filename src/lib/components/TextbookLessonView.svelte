<script lang="ts">
	import type { TextbookLesson } from '$lib/types';
	import type { FieldGuide } from '$lib/data/fieldGuides';
	import { resolve } from '$app/paths';
	import { speakText, playSound } from '$lib/utils/audio';
	import { addXP } from '$lib/utils/xp';
	import { getCompletedLessons, markLessonCompleted } from '$lib/utils/storage';
	import {
		Volume2,
		Sparkles,
		CheckCircle2,
		RotateCcw,
		Layers,
		ArrowRight,
		Check
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let { lesson, guide } = $props<{
		lesson: TextbookLesson;
		guide: FieldGuide;
	}>();

	// Completion & XP State
	let isAlreadyCompleted = $state(false);
	let justCompleted = $state(false);
	let awardedXP = $state(0);

	// Mini-Check 1 (Picture Match) State
	let selectedHanzi = $state<string | null>(null);
	const matchedPairs = new SvelteSet<string>();
	let check1Error = $state<string | null>(null);

	// Mini-Check 2 (Word Reorder) State
	let reorderedWords = $state<string[]>([]);
	let check2Status = $state<'idle' | 'correct' | 'wrong'>('idle');

	let isCheck1Complete = $derived(
		lesson.miniCheck[0]?.pictureMatch
			? matchedPairs.size === lesson.miniCheck[0].pictureMatch.pairs.length
			: true
	);

	let isCheck2Complete = $derived(check2Status === 'correct');

	onMount(() => {
		const completedList = getCompletedLessons();
		isAlreadyCompleted = completedList.includes(lesson.id);
	});

	function handleSpeak(text: string) {
		speakText(text, 'chinese').catch(() => {});
	}

	// Picture Match Logic
	function handleSelectHanzi(hanzi: string) {
		if (matchedPairs.has(hanzi)) return;
		selectedHanzi = hanzi;
		check1Error = null;
		playSound('flip');
	}

	function handleSelectPicture(emoji: string, correctHanzi: string) {
		if (!selectedHanzi) return;
		if (selectedHanzi === correctHanzi) {
			matchedPairs.add(correctHanzi);
			selectedHanzi = null;
			check1Error = null;
			playSound('correct');
			checkFullLessonCompletion();
		} else {
			check1Error = 'Not quite! Try matching with another character.';
			playSound('wrong');
			setTimeout(() => {
				check1Error = null;
			}, 2000);
		}
	}

	// Word Reorder Logic
	function handleTapWord(word: string) {
		if (check2Status === 'correct') return;
		reorderedWords = [...reorderedWords, word];
		playSound('flip');
	}

	function handleRemoveWord(index: number) {
		if (check2Status === 'correct') return;
		reorderedWords = reorderedWords.filter((_, i) => i !== index);
		check2Status = 'idle';
		playSound('flip');
	}

	function handleVerifyReorder() {
		const target = lesson.miniCheck[1]?.wordReorder?.sentenceHanzi.replace(/\s+/g, '') || '';
		const current = reorderedWords.join('').replace(/\s+/g, '');
		if (current === target) {
			check2Status = 'correct';
			playSound('correct');
			checkFullLessonCompletion();
		} else {
			check2Status = 'wrong';
			playSound('wrong');
		}
	}

	function handleResetReorder() {
		reorderedWords = [];
		check2Status = 'idle';
	}

	function checkFullLessonCompletion() {
		// Award XP if both interactive checks pass and not yet completed
		if (isCheck1Complete && isCheck2Complete && !isAlreadyCompleted && !justCompleted) {
			const success = markLessonCompleted(lesson.id);
			if (success) {
				const reward = lesson.xpReward || 15;
				addXP(reward);
				awardedXP = reward;
				justCompleted = true;
				isAlreadyCompleted = true;
				playSound('milestone');
			}
		}
	}

	function getToneBadgeColor(tone?: number): string {
		switch (tone) {
			case 1:
				return 'bg-rose-50 text-rose-700 border-rose-200';
			case 2:
				return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 3:
				return 'bg-indigo-50 text-indigo-700 border-indigo-200';
			case 4:
				return 'bg-amber-50 text-amber-700 border-amber-200';
			default:
				return 'bg-slate-100 text-slate-700 border-slate-200';
		}
	}
</script>

<div class="space-y-6">
	<!-- HOST HERO CARD (Children's Textbook Style Banner) -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-linear-to-b from-indigo-50 via-white to-amber-50/40 p-5"
	>
		<div class="flex items-start gap-3.5">
			<div
				class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-indigo-300 bg-white text-3xl shadow-xs"
			>
				{lesson.characterHost.avatarEmoji}
			</div>
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<span
						class="rounded-full border border-indigo-300 bg-indigo-600 px-2.5 py-0.5 font-headline text-[10px] font-extrabold tracking-wider text-white uppercase"
					>
						{lesson.unitBadge}
					</span>
					{#if isAlreadyCompleted}
						<span
							class="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 font-headline text-[10px] font-bold text-emerald-800"
						>
							<Check size={11} strokeWidth={3} />
							<span>Completed</span>
						</span>
					{/if}
				</div>
				<h2 class="font-headline text-lg font-black tracking-tight text-slate-900">
					{lesson.title}
				</h2>
				<p class="font-sans text-xs leading-relaxed text-slate-600">
					{lesson.characterHost.intro}
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 1: SITUATIONAL DIALOGUE COMIC -->
	<section class="shadow-card space-y-3.5 rounded-3xl border-2 border-slate-200 bg-white p-5">
		<div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
			<div class="flex items-center gap-2">
				<span class="rounded-xl bg-amber-100 p-1.5 text-base">💬</span>
				<div>
					<h3 class="font-headline text-sm font-extrabold text-slate-900">Scene Dialogue</h3>
					<p class="font-sans text-[11px] text-slate-500">{lesson.scene.setting}</p>
				</div>
			</div>
			<span class="font-sans text-[11px] font-medium text-slate-400">Tap bubble to listen</span>
		</div>

		<!-- Speech Panels -->
		<div class="space-y-3 pt-1">
			{#each lesson.scene.dialogue as turn, idx (idx)}
				<div class="flex items-start gap-2.5 {idx % 2 === 1 ? 'flex-row-reverse text-right' : ''}">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl shadow-xs"
						title={turn.speaker}
					>
						{turn.avatarEmoji}
					</div>

					<!-- Speech Bubble -->
					<button
						type="button"
						onclick={() => handleSpeak(turn.audioText || turn.hanzi)}
						class="group relative max-w-[85%] cursor-pointer rounded-2xl border-2 p-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] {idx %
							2 ===
						1
							? 'border-indigo-200 bg-indigo-50/70'
							: 'border-slate-200 bg-white hover:border-indigo-200'}"
					>
						<div class="flex items-center justify-between gap-2">
							<span class="font-headline text-[10px] font-bold text-slate-400">
								{turn.speaker}
							</span>
							<Volume2
								size={13}
								class="text-indigo-500 opacity-60 transition-opacity group-hover:opacity-100"
							/>
						</div>
						<p
							class="mt-1 font-headline text-base font-extrabold tracking-wide text-slate-900 group-hover:text-indigo-600"
						>
							{turn.hanzi}
						</p>
						<p class="font-mono text-xs font-medium text-indigo-700">{turn.pinyin}</p>
						<p class="mt-1 font-sans text-xs text-slate-600">{turn.english}</p>
					</button>
				</div>
			{/each}
		</div>
	</section>

	<!-- SECTION 2: WORD SPOTLIGHT CARDS -->
	<section class="shadow-card space-y-3.5 rounded-3xl border-2 border-slate-200 bg-white p-5">
		<div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
			<div class="flex items-center gap-2">
				<span class="rounded-xl bg-indigo-100 p-1.5 text-base">🔍</span>
				<div>
					<h3 class="font-headline text-sm font-extrabold text-slate-900">Spotlight Words</h3>
					<p class="font-sans text-[11px] text-slate-500">Hanzi strokes, tone guides & mnemonics</p>
				</div>
			</div>
			<span class="font-sans text-[11px] font-medium text-slate-400">Tap to hear</span>
		</div>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each lesson.spotlightWords as word (word.hanzi)}
				<div
					class="relative flex flex-col justify-between rounded-2xl border-2 border-slate-200/90 bg-slate-50/60 p-3.5 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-sm"
				>
					<div class="space-y-1">
						<div class="flex items-start justify-between">
							<!-- Oversized Hanzi -->
							<span class="font-headline text-3xl font-black tracking-tight text-slate-900">
								{word.hanzi}
							</span>
							<button
								type="button"
								onclick={() => handleSpeak(word.hanzi)}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95"
								title="Listen"
								aria-label="Listen {word.hanzi}"
							>
								<Volume2 size={15} />
							</button>
						</div>

						<div class="flex items-center gap-2">
							<span class="font-mono text-sm font-bold text-indigo-700">{word.pinyin}</span>
							{#if word.toneNumber}
								<span
									class="rounded-md border px-1.5 py-0.5 font-headline text-[10px] font-extrabold {getToneBadgeColor(
										word.toneNumber
									)}"
								>
									Tone {word.toneNumber}
								</span>
							{/if}
						</div>

						<p class="font-sans text-xs font-semibold text-slate-800">{word.english}</p>
					</div>

					<!-- Visual Mnemonic -->
					<div
						class="mt-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 p-2 text-[11px] font-medium text-amber-900"
					>
						<span class="font-bold">Mnemonic:</span>
						<span>{word.mnemonic}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- SECTION 3: PATTERN BOX (GRAMMAR FORMULA) -->
	<section
		class="shadow-card space-y-3 rounded-3xl border-2 border-indigo-200 bg-linear-to-br from-indigo-50/60 to-purple-50/60 p-5"
	>
		<div class="flex items-center gap-2 border-b border-indigo-100 pb-2">
			<span class="rounded-xl bg-indigo-600 p-1.5 text-base text-white">📐</span>
			<div>
				<h3 class="font-headline text-sm font-extrabold text-slate-900">
					Pattern Box: {lesson.patternBox.title}
				</h3>
				<p class="font-sans text-[11px] text-slate-500">Sentence construction formula</p>
			</div>
		</div>

		<!-- Formula Slot Display -->
		<div class="flex flex-wrap items-center gap-2 py-1">
			{#each lesson.patternBox.slots as slot, idx (idx)}
				<div class="flex items-center gap-2">
					<div
						class="flex flex-col items-center rounded-2xl border-2 border-indigo-300 bg-white px-3.5 py-2 shadow-xs"
					>
						<span class="font-headline text-[10px] font-extrabold text-indigo-600 uppercase">
							{slot.label}
						</span>
						<span class="font-headline text-base font-extrabold text-slate-900">
							{slot.example}
						</span>
						{#if slot.pinyin}
							<span class="font-mono text-[10px] text-slate-400">{slot.pinyin}</span>
						{/if}
					</div>
					{#if idx < lesson.patternBox.slots.length - 1}
						<span class="font-headline text-lg font-black text-indigo-400">+</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Pattern Formula String & Notes -->
		<div class="space-y-1 rounded-2xl border border-indigo-200/80 bg-white p-3">
			<p class="font-mono text-xs font-bold text-indigo-800">
				Formula: {lesson.patternBox.formula}
			</p>
			<p class="font-sans text-xs leading-relaxed text-slate-600">
				{lesson.patternBox.notes}
			</p>
		</div>
	</section>

	<!-- SECTION 4: INTERACTIVE "TRY IT" MINI-CHECKS -->
	<section class="shadow-card space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-5">
		<div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
			<div class="flex items-center gap-2">
				<span class="rounded-xl bg-emerald-100 p-1.5 text-base">✏️</span>
				<div>
					<h3 class="font-headline text-sm font-extrabold text-slate-900">
						Interactive Mini-Checks
					</h3>
					<p class="font-sans text-[11px] text-slate-500">Complete checks to master the lesson</p>
				</div>
			</div>
			<div class="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
				<span>+{lesson.xpReward || 15} XP Reward</span>
			</div>
		</div>

		<!-- Check 1: Character to Picture Match -->
		{#if lesson.miniCheck[0]?.pictureMatch}
			{@const pm = lesson.miniCheck[0].pictureMatch}
			<div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<div class="flex items-center justify-between">
					<h4 class="font-headline text-xs font-extrabold text-slate-800">
						1. {lesson.miniCheck[0].prompt}
					</h4>
					{#if isCheck1Complete}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700"
						>
							<Check size={11} strokeWidth={3} />
							<span>Match Complete!</span>
						</span>
					{/if}
				</div>

				{#if check1Error}
					<div
						class="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-600"
					>
						{check1Error}
					</div>
				{/if}

				<!-- Hanzi Word Bank -->
				<div class="space-y-1">
					<p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
						Step A: Tap a Character Word
					</p>
					<div class="flex flex-wrap gap-2">
						{#each pm.pairs as pair (pair.hanzi)}
							<button
								type="button"
								onclick={() => handleSelectHanzi(pair.hanzi)}
								disabled={matchedPairs.has(pair.hanzi)}
								class="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 font-headline text-sm font-bold transition-all {matchedPairs.has(
									pair.hanzi
								)
									? 'border-emerald-200 bg-emerald-50 text-emerald-700 opacity-60'
									: selectedHanzi === pair.hanzi
										? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
										: 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300'}"
							>
								<span>{pair.hanzi}</span>
								{#if matchedPairs.has(pair.hanzi)}
									<Check size={13} strokeWidth={3} />
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Picture Cards -->
				<div class="space-y-1 pt-1">
					<p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
						Step B: Tap the Matching Picture Card
					</p>
					<div class="grid grid-cols-3 gap-2">
						{#each pm.pairs as pair (pair.imageEmoji)}
							<button
								type="button"
								onclick={() => handleSelectPicture(pair.imageEmoji, pair.hanzi)}
								disabled={matchedPairs.has(pair.hanzi)}
								class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-3 text-center transition-all {matchedPairs.has(
									pair.hanzi
								)
									? 'border-emerald-300 bg-emerald-50/80 shadow-xs'
									: selectedHanzi
										? 'border-indigo-200 bg-white hover:border-indigo-600 hover:bg-indigo-50/30'
										: 'border-slate-200 bg-white'}"
							>
								<span class="text-2xl">{pair.imageEmoji}</span>
								<span class="mt-1 font-sans text-[11px] font-medium text-slate-700">
									{pair.english}
								</span>
								{#if matchedPairs.has(pair.hanzi)}
									<span class="font-headline text-xs font-bold text-emerald-700">
										{pair.hanzi}
									</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Check 2: Word Reorder Challenge -->
		{#if lesson.miniCheck[1]?.wordReorder}
			{@const wr = lesson.miniCheck[1].wordReorder}
			<div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
				<div class="flex items-center justify-between">
					<h4 class="font-headline text-xs font-extrabold text-slate-800">
						2. {lesson.miniCheck[1].prompt}
					</h4>
					{#if check2Status === 'correct'}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700"
						>
							<Check size={11} strokeWidth={3} />
							<span>Correct Order!</span>
						</span>
					{/if}
				</div>

				<!-- Target Sentence Prompt -->
				<div class="rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700">
					<span class="font-bold">Target:</span> "{wr.sentenceEnglish}"
				</div>

				<!-- User's Assembled Sentence Track -->
				<div
					class="flex min-h-12 flex-wrap items-center gap-1.5 rounded-2xl border-2 border-dashed p-2.5 transition-colors {check2Status ===
					'correct'
						? 'border-emerald-400 bg-emerald-50/60'
						: check2Status === 'wrong'
							? 'border-rose-400 bg-rose-50/60'
							: 'border-slate-300 bg-white'}"
				>
					{#if reorderedWords.length === 0}
						<span class="font-sans text-xs text-slate-400"> Tap the words below in order... </span>
					{:else}
						{#each reorderedWords as word, idx (idx)}
							<button
								type="button"
								onclick={() => handleRemoveWord(idx)}
								class="cursor-pointer rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 font-headline text-sm font-bold text-indigo-700 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
								title="Tap to remove"
							>
								{word}
							</button>
						{/each}
					{/if}
				</div>

				<!-- Word Chips Bank -->
				<div class="flex flex-wrap items-center justify-between gap-2 pt-1">
					<div class="flex flex-wrap gap-2">
						{#each wr.shuffledWords as word, idx (idx)}
							<button
								type="button"
								onclick={() => handleTapWord(word)}
								disabled={check2Status === 'correct'}
								class="cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-3.5 py-1.5 font-headline text-sm font-bold text-slate-800 shadow-xs transition-all hover:border-indigo-400 active:scale-95"
							>
								{word}
							</button>
						{/each}
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={handleResetReorder}
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 active:scale-95"
							title="Reset words"
							aria-label="Reset words"
						>
							<RotateCcw size={15} />
						</button>
						<button
							type="button"
							onclick={handleVerifyReorder}
							disabled={reorderedWords.length === 0 || check2Status === 'correct'}
							class="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
						>
							Check
						</button>
					</div>
				</div>
			</div>
		{/if}
	</section>

	<!-- REWARD / COMPLETION CELEBRATION CARD -->
	{#if justCompleted || isAlreadyCompleted}
		<section
			class="shadow-card relative overflow-hidden rounded-3xl border-2 border-emerald-300 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 p-5"
		>
			<div class="flex items-start gap-3.5">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs"
				>
					<CheckCircle2 size={24} />
				</div>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<h4 class="font-headline text-base font-black text-slate-900">Lesson Mastered!</h4>
						{#if justCompleted}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-headline text-[10px] font-black text-amber-800"
							>
								<Sparkles size={11} />
								<span>+{awardedXP} XP Earned</span>
							</span>
						{/if}
					</div>
					<p class="font-sans text-xs leading-relaxed text-slate-600">
						You finished the dialogue, vocabulary spotlight, sentence formula, and mini-checks for
						this textbook lesson!
					</p>
				</div>
			</div>
		</section>
	{/if}

	<!-- DIRECT SRS FLASHCARD PACK BRIDGE CTA -->
	<section
		class="shadow-card rounded-3xl border-2 border-indigo-200/90 bg-linear-to-r from-indigo-50 to-purple-50 p-5"
	>
		<div class="flex items-start justify-between gap-3">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<Layers size={18} class="text-indigo-600" />
					<h4 class="font-headline text-sm font-black text-slate-900">
						Companion SRS Flashcard Pack
					</h4>
				</div>
				<p class="font-sans text-xs leading-relaxed text-slate-600">
					Reinforce these characters and sentence patterns with spaced repetition flashcards.
				</p>
			</div>
		</div>

		<div class="pt-3">
			<a
				href={resolve(`/deck/${guide.packId}`)}
				class="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
			>
				<span>Practice Flashcard Pack ({guide.packTitle.split(':')[0]})</span>
				<ArrowRight size={16} />
			</a>
		</div>
	</section>
</div>
