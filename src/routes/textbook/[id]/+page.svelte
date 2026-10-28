<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import WordLookupModal from '$lib/components/WordLookupModal.svelte';
	import { getTextbookUnitById, getAdjacentTextbookUnits } from '$lib/data/textbook';
	import {
		isTextbookUnitCompleted,
		markTextbookUnitCompleted,
		setLastViewedTextbookUnit
	} from '$lib/utils/textbookStorage';
	import { speakText, speakWord, playSound } from '$lib/utils/audio';
	import { onMount } from 'svelte';
	import {
		Volume2,
		CheckCircle2,
		ArrowRight,
		ArrowLeft,
		Eye,
		EyeOff,
		RotateCcw,
		Zap,
		Award
	} from 'lucide-svelte';

	let unitId = $derived(page.params.id || '');
	let unit = $derived(getTextbookUnitById(unitId));
	let adjacent = $derived(getAdjacentTextbookUnits(unitId));

	// Display preference toggles
	let showPinyin = $state(true);
	let showEnglish = $state(true);

	// Word lookup modal state
	let selectedLookupWord = $state<{
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	} | null>(null);

	// Completion & XP status
	let isCompleted = $state(false);
	let justCompletedNow = $state(false);
	let awardedXP = $state(0);

	// Mini-Check 1 (Comprehension)
	let selectedOptionIndex = $state<number | null>(null);
	let comprehensionStatus = $state<'idle' | 'correct' | 'wrong'>('idle');

	// Mini-Check 2 (Word Reorder)
	let currentReorderedWords = $state<string[]>([]);
	let reorderStatus = $state<'idle' | 'correct' | 'wrong'>('idle');

	// Mini-Check 3 (Roleplay / Pragmatics)
	let selectedRoleplayIndex = $state<number | null>(null);
	let roleplayStatus = $state<'idle' | 'correct' | 'wrong'>('idle');

	function loadState() {
		if (!unit) return;
		setLastViewedTextbookUnit(unit.id);
		isCompleted = isTextbookUnitCompleted(unit.id);
		justCompletedNow = false;
		selectedOptionIndex = null;
		comprehensionStatus = 'idle';
		currentReorderedWords = [];
		reorderStatus = 'idle';
		selectedRoleplayIndex = null;
		roleplayStatus = 'idle';
	}

	$effect(() => {
		if (unitId) {
			loadState();
		}
	});

	onMount(() => {
		loadState();
	});

	function handleSpeak(text: string) {
		speakText(text, 'chinese').catch(() => {});
	}

	function handleSpeakWord(w: string) {
		speakWord(w, 'chinese').catch(() => {});
	}

	function openLookup(item: {
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	}) {
		selectedLookupWord = item;
	}

	// Quiz 1 handlers
	function handleSelectComprehension(idx: number) {
		if (!unit || comprehensionStatus === 'correct') return;
		selectedOptionIndex = idx;
		if (idx === unit.miniCheck.comprehension.correctIndex) {
			comprehensionStatus = 'correct';
			playSound('correct');
			verifyAllChecksPassed();
		} else {
			comprehensionStatus = 'wrong';
			playSound('wrong');
		}
	}

	// Quiz 2 (Word Reorder) handlers
	function handleTapReorderWord(word: string) {
		if (reorderStatus === 'correct') return;
		currentReorderedWords = [...currentReorderedWords, word];
		playSound('flip');
	}

	function handleRemoveReorderWord(idx: number) {
		if (reorderStatus === 'correct') return;
		currentReorderedWords = currentReorderedWords.filter((_, i) => i !== idx);
		reorderStatus = 'idle';
		playSound('flip');
	}

	function handleVerifyReorder() {
		if (!unit) return;
		const target = unit.miniCheck.wordReorder.sentenceHanzi.replace(/\s+/g, '');
		const entered = currentReorderedWords.join('').replace(/\s+/g, '');
		if (entered === target) {
			reorderStatus = 'correct';
			playSound('correct');
			verifyAllChecksPassed();
		} else {
			reorderStatus = 'wrong';
			playSound('wrong');
		}
	}

	// Quiz 3 (Roleplay / Pragmatics) handlers
	function handleSelectRoleplay(idx: number) {
		if (!unit || !unit.miniCheck.roleplayCheck || roleplayStatus === 'correct') return;
		selectedRoleplayIndex = idx;
		const opt = unit.miniCheck.roleplayCheck.options[idx];
		if (opt && opt.isCorrect) {
			roleplayStatus = 'correct';
			playSound('correct');
			verifyAllChecksPassed();
		} else {
			roleplayStatus = 'wrong';
			playSound('wrong');
		}
	}

	function verifyAllChecksPassed() {
		if (!unit) return;
		const check1Pass = comprehensionStatus === 'correct';
		const check2Pass = reorderStatus === 'correct';
		const check3Pass = unit.miniCheck.roleplayCheck ? roleplayStatus === 'correct' : true;

		if (check1Pass && check2Pass && check3Pass && !isCompleted) {
			const res = markTextbookUnitCompleted(unit.id);
			if (res.justCompleted) {
				isCompleted = true;
				justCompletedNow = true;
				awardedXP = res.xpAwarded;
				playSound('milestone');
			}
		}
	}
</script>

<svelte:head>
	<title
		>{unit ? `${unit.chineseTitle} (${unit.title}) | Unit ${unit.unitNumber}` : 'Textbook Unit'} | Mandarin
		Textbook</title
	>
</svelte:head>

{#if !unit}
	<div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
		<h2 class="font-headline text-lg font-bold text-slate-800">Unit Not Found</h2>
		<p class="mt-1 text-xs text-slate-500">The requested textbook lesson could not be located.</p>
		<button
			type="button"
			onclick={() => goto(resolve('/textbook'))}
			class="mt-4 cursor-pointer rounded-2xl bg-indigo-600 px-5 py-2.5 font-headline text-xs font-bold text-white shadow-md hover:bg-indigo-700"
		>
			Return to Course Syllabus
		</button>
	</div>
{:else}
	<div class="flex min-h-screen flex-col bg-slate-50">
		<TopHeader
			title={`Unit ${unit.unitNumber}: ${unit.chineseTitle}`}
			showBack={true}
			onBack={() => goto(resolve('/textbook'))}
		/>

		<main class="mx-auto w-full max-w-lg space-y-5 px-4 pt-4 pb-28">
			<!-- Unit Header Hero -->
			<header class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span
							class="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black tracking-wider text-indigo-700 uppercase"
						>
							{unit.partTitle} · Unit {unit.unitNumber}
						</span>
						<span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
							{unit.stage}
						</span>
					</div>

					{#if isCompleted}
						<span
							class="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700"
						>
							<CheckCircle2 size={13} class="text-emerald-600" />
							Passed
						</span>
					{:else}
						<span
							class="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700"
						>
							<Zap size={12} class="fill-amber-500 text-amber-500" />
							+{unit.xpReward} XP
						</span>
					{/if}
				</div>

				<div class="mt-3">
					<h1 class="font-headline text-2xl font-black tracking-tight text-slate-900">
						{unit.chineseTitle}
					</h1>
					<p class="mt-0.5 font-headline text-sm font-semibold text-indigo-600">
						{unit.title}
					</p>
					<p class="mt-1 text-xs text-slate-500">
						{unit.subtitle}
					</p>
				</div>

				<!-- ACTFL Can-Do Target -->
				<div class="mt-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
					<div class="flex items-center gap-1.5 text-[11px] font-bold text-indigo-900">
						<Award size={14} class="text-indigo-600" />
						<span>ACTFL Can-Do Goal</span>
					</div>
					<p class="mt-1 text-xs leading-relaxed text-indigo-900/85">
						{unit.milestoneGoal}
					</p>
				</div>

				<!-- Character Host Welcome -->
				<div
					class="mt-3 flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-slate-50 p-3"
				>
					<span class="text-2xl select-none">{unit.characterHost.avatarEmoji}</span>
					<div class="space-y-0.5 text-xs">
						<span class="font-headline font-bold text-slate-900">{unit.characterHost.name}</span>
						<p class="leading-relaxed text-slate-600">{unit.characterHost.intro}</p>
					</div>
				</div>
			</header>

			<!-- Reading Toolbar (Pinyin & English Toggles) -->
			<div
				class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs"
			>
				<span class="text-xs font-bold text-slate-500">Display Options:</span>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (showPinyin = !showPinyin)}
						class="flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors {showPinyin
							? 'border border-indigo-200/60 bg-indigo-50 text-indigo-700'
							: 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
					>
						{#if showPinyin}
							<Eye size={13} />
						{:else}
							<EyeOff size={13} />
						{/if}
						Pinyin
					</button>

					<button
						type="button"
						onclick={() => (showEnglish = !showEnglish)}
						class="flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors {showEnglish
							? 'border border-indigo-200/60 bg-indigo-50 text-indigo-700'
							: 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
					>
						{#if showEnglish}
							<Eye size={13} />
						{:else}
							<EyeOff size={13} />
						{/if}
						English
					</button>
				</div>
			</div>

			<!-- Pronunciation Workshop (if present) -->
			{#if unit.pronunciationLab}
				<section class="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
					<div class="flex items-center gap-2">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
						>
							1
						</span>
						<h2 class="font-headline text-base font-extrabold text-slate-900">
							{unit.pronunciationLab.title}
						</h2>
					</div>
					<p class="text-xs text-slate-500">
						{unit.pronunciationLab.explanation}
					</p>

					<div class="space-y-2 pt-1">
						{#each unit.pronunciationLab.items as item (item.pinyin)}
							<div
								class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3"
							>
								<div class="space-y-0.5">
									<div class="flex items-baseline gap-2">
										{#if item.hanzi}
											<span class="font-headline text-sm font-bold text-slate-900">
												{item.hanzi}
											</span>
										{/if}
										<span class="font-mono text-xs font-semibold text-indigo-600">
											{item.pinyin}
										</span>
										<span class="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
											· {item.tone}
										</span>
									</div>
									<p class="text-[11px] text-slate-500">{item.tip}</p>
								</div>
								<button
									type="button"
									onclick={() => handleSpeak(item.audioText)}
									class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-indigo-400 hover:text-indigo-600 active:scale-95"
									aria-label="Play pronunciation"
								>
									<Volume2 size={16} />
								</button>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Authentic Scene Dialogue -->
			<section class="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
						>
							2
						</span>
						<h2 class="font-headline text-base font-extrabold text-slate-900">
							Authentic Dialogue · 实景对话
						</h2>
					</div>
					<span class="text-[11px] font-medium text-slate-400">Tap word for dictionary</span>
				</div>

				<div class="space-y-3 pt-2">
					{#each unit.dialogue as turn, turnIdx (turnIdx)}
						<div
							class="flex items-start gap-3 rounded-2xl border border-slate-200/60 bg-slate-50 p-3.5"
						>
							<span class="shrink-0 text-2xl select-none">{turn.avatarEmoji}</span>
							<div class="flex-1 space-y-1">
								<div class="flex items-center justify-between">
									<span class="font-headline text-xs font-bold text-slate-800">
										{turn.speaker}
									</span>
									<button
										type="button"
										onclick={() => handleSpeak(turn.audioText || turn.hanzi)}
										class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
										aria-label="Listen to turn"
									>
										<Volume2 size={14} />
									</button>
								</div>

								<!-- Hanzi Text with tap-to-lookup -->
								<div class="text-base leading-snug font-bold text-slate-900">
									{#each turn.hanzi.split('') as char, charIdx (charIdx)}
										{#if /[\u4e00-\u9fa5]/.test(char)}
											<button
												type="button"
												onclick={() => openLookup({ hanzi: char, context: turn.hanzi })}
												class="cursor-pointer rounded-sm transition-colors hover:bg-indigo-100 hover:text-indigo-700"
											>
												{char}
											</button>
										{:else}
											<span>{char}</span>
										{/if}
									{/each}
								</div>

								{#if showPinyin}
									<p class="font-mono text-xs text-indigo-600">{turn.pinyin}</p>
								{/if}

								{#if showEnglish}
									<p class="text-xs text-slate-500">{turn.english}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Spotlight Vocabulary -->
			<section class="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center gap-2">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
					>
						3
					</span>
					<h2 class="font-headline text-base font-extrabold text-slate-900">
						Spotlight Vocabulary · 核心生词
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
					{#each unit.spotlightWords as word (word.hanzi)}
						<div
							class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5"
						>
							<div>
								<div class="flex items-center justify-between">
									<span class="font-headline text-lg font-black text-slate-900">
										{word.hanzi}
									</span>
									<button
										type="button"
										onclick={() => handleSpeakWord(word.hanzi)}
										class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-xs"
										aria-label="Speak word"
									>
										<Volume2 size={15} />
									</button>
								</div>
								<p class="font-mono text-xs font-semibold text-indigo-600">{word.pinyin}</p>
								<p class="mt-1 text-xs font-bold text-slate-800">{word.english}</p>
							</div>
							<p class="mt-2 border-t border-slate-200/50 pt-1.5 text-[11px] text-slate-500 italic">
								{word.mnemonic}
							</p>
						</div>
					{/each}
				</div>
			</section>

			<!-- Grammar Pattern Box -->
			<section class="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center gap-2">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
					>
						4
					</span>
					<h2 class="font-headline text-base font-extrabold text-slate-900">
						Pattern & Grammar · 句型结构
					</h2>
				</div>

				<div class="rounded-2xl border border-indigo-200/80 bg-indigo-50/80 p-4">
					<span class="text-[11px] font-bold tracking-wider text-indigo-700 uppercase"
						>Sentence Formula</span
					>
					<div class="mt-1 font-headline font-mono text-sm font-extrabold text-indigo-950">
						{unit.patternBox.formula}
					</div>
				</div>

				<div class="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
					{#each unit.patternBox.slots as slot, slotIdx (slotIdx)}
						<div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
							<span class="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
								{slot.label}
							</span>
							<p class="mt-1 font-headline text-xs font-extrabold text-slate-800">
								{slot.example}
							</p>
							{#if slot.pinyin}
								<p class="font-mono text-[11px] text-indigo-600">{slot.pinyin}</p>
							{/if}
						</div>
					{/each}
				</div>

				<p class="pt-1 text-xs leading-relaxed text-slate-600">
					{unit.patternBox.notes}
				</p>

				{#if unit.patternBox.contrasts}
					<div class="mt-3 space-y-2 border-t border-slate-200/80 pt-3">
						<span class="text-xs font-bold text-slate-700">Contrast Analysis:</span>
						{#each unit.patternBox.contrasts as contrast (contrast.label)}
							<div
								class="space-y-1 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3 text-xs"
							>
								<span class="font-bold text-amber-900">{contrast.label}</span>
								<p class="text-amber-800/90">{contrast.explanation}</p>
								<div class="mt-1 font-medium text-slate-800">
									{contrast.exampleHanzi} ·
									<span class="font-mono text-indigo-600">{contrast.examplePinyin}</span>
								</div>
								<p class="text-[11px] text-slate-500">{contrast.exampleEnglish}</p>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Pragmatics & Cultural Insight -->
			<section class="space-y-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center gap-2">
					<span
						class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
					>
						5
					</span>
					<h2 class="font-headline text-base font-extrabold text-slate-900">
						Cultural & Pragmatic Guide · 文化与语用
					</h2>
				</div>

				<div class="space-y-2 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
					<h3 class="font-headline text-xs font-extrabold text-slate-800">
						{unit.pragmaticTip.title}
					</h3>
					<p class="text-xs leading-relaxed text-slate-600">
						{unit.pragmaticTip.tip}
					</p>

					<div class="mt-2 rounded-xl border border-slate-200/80 bg-white p-3">
						<span class="text-[10px] font-bold tracking-wide text-indigo-600 uppercase"
							>Native Example</span
						>
						<p class="mt-0.5 font-headline text-xs font-extrabold text-slate-900">
							{unit.pragmaticTip.naturalExample.hanzi}
						</p>
						<p class="font-mono text-[11px] text-indigo-600">
							{unit.pragmaticTip.naturalExample.pinyin}
						</p>
						<p class="text-[11px] text-slate-500">
							{unit.pragmaticTip.naturalExample.english}
						</p>
					</div>
				</div>
			</section>

			<!-- Interactive Knowledge Checks (XP Reward) -->
			<section class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600"
						>
							6
						</span>
						<h2 class="font-headline text-base font-extrabold text-slate-900">
							Unit Knowledge Check · 实战通关
						</h2>
					</div>
					<span class="text-xs font-bold text-amber-600">
						+{unit.xpReward} XP Reward
					</span>
				</div>

				<!-- Check 1: Comprehension Check -->
				<div class="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-bold tracking-wide text-indigo-600 uppercase">
							Check 1 · Comprehension
						</span>
						{#if comprehensionStatus === 'correct'}
							<span class="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
								<CheckCircle2 size={13} /> Correct
							</span>
						{/if}
					</div>

					<p class="font-headline text-xs font-bold text-slate-900">
						{unit.miniCheck.comprehension.question}
					</p>

					<div class="space-y-1.5 pt-1">
						{#each unit.miniCheck.comprehension.options as opt, idx (idx)}
							{@const isSelected = selectedOptionIndex === idx}
							{@const isRight = idx === unit.miniCheck.comprehension.correctIndex}
							<button
								type="button"
								onclick={() => handleSelectComprehension(idx)}
								class="w-full cursor-pointer rounded-xl border p-3 text-left text-xs font-semibold transition-all {isSelected
									? isRight
										? 'border-emerald-400 bg-emerald-50 text-emerald-900'
										: 'border-rose-300 bg-rose-50 text-rose-900'
									: 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}"
							>
								{opt}
							</button>
						{/each}
					</div>

					{#if comprehensionStatus === 'correct'}
						<p
							class="rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-2.5 text-[11px] text-emerald-700"
						>
							✓ {unit.miniCheck.comprehension.explanation}
						</p>
					{:else if comprehensionStatus === 'wrong'}
						<p class="rounded-xl bg-rose-50 p-2.5 text-[11px] text-rose-600">
							Not quite! Read carefully and try selecting another option.
						</p>
					{/if}
				</div>

				<!-- Check 2: Word Reordering Puzzle -->
				<div class="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-bold tracking-wide text-indigo-600 uppercase">
							Check 2 · Sentence Construction
						</span>
						{#if reorderStatus === 'correct'}
							<span class="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
								<CheckCircle2 size={13} /> Correct
							</span>
						{/if}
					</div>

					<p class="text-xs text-slate-600">Tap words to assemble the target sentence:</p>
					<div
						class="rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800"
					>
						Target: “{unit.miniCheck.wordReorder.sentenceEnglish}”
					</div>

					<!-- Constructed slots -->
					<div
						class="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-white p-2"
					>
						{#if currentReorderedWords.length === 0}
							<span class="text-xs text-slate-400 italic">Tap words below to place here...</span>
						{:else}
							{#each currentReorderedWords as w, idx (idx)}
								<button
									type="button"
									onclick={() => handleRemoveReorderWord(idx)}
									class="cursor-pointer rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
								>
									{w} ×
								</button>
							{/each}
						{/if}
					</div>

					<!-- Available word tokens -->
					<div class="flex flex-wrap gap-2 pt-1">
						{#each unit.miniCheck.wordReorder.shuffledWords as word, wordIdx (wordIdx)}
							<button
								type="button"
								onclick={() => handleTapReorderWord(word)}
								class="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs hover:border-indigo-400 hover:text-indigo-600 active:scale-95"
							>
								{word}
							</button>
						{/each}
					</div>

					<div class="flex items-center justify-between pt-1">
						<button
							type="button"
							onclick={() => {
								currentReorderedWords = [];
								reorderStatus = 'idle';
							}}
							class="flex cursor-pointer items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
						>
							<RotateCcw size={13} /> Reset
						</button>

						<button
							type="button"
							onclick={handleVerifyReorder}
							class="cursor-pointer rounded-xl bg-indigo-600 px-4 py-1.5 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
						>
							Check Answer
						</button>
					</div>

					{#if reorderStatus === 'correct'}
						<p
							class="rounded-xl border border-emerald-200/60 bg-emerald-50 p-2.5 text-[11px] text-emerald-700"
						>
							✓ Exactly right! {unit.miniCheck.wordReorder.sentenceHanzi} ({unit.miniCheck
								.wordReorder.sentencePinyin}).
						</p>
					{:else if reorderStatus === 'wrong'}
						<p class="rounded-xl bg-rose-50 p-2.5 text-[11px] text-rose-600">
							Word order is not quite right. Tap words to remove or reset!
						</p>
					{/if}
				</div>

				<!-- Check 3: Roleplay Check (if present) -->
				{#if unit.miniCheck.roleplayCheck}
					<div class="space-y-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-bold tracking-wide text-indigo-600 uppercase">
								Check 3 · Situational Response
							</span>
							{#if roleplayStatus === 'correct'}
								<span class="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
									<CheckCircle2 size={13} /> Correct
								</span>
							{/if}
						</div>

						<p class="text-xs text-slate-600">
							<strong>Situation:</strong>
							{unit.miniCheck.roleplayCheck.situation}
						</p>
						<p class="font-headline text-xs font-bold text-slate-900">
							{unit.miniCheck.roleplayCheck.prompt}
						</p>

						<div class="space-y-1.5 pt-1">
							{#each unit.miniCheck.roleplayCheck.options as opt, idx (idx)}
								{@const isSelected = selectedRoleplayIndex === idx}
								<button
									type="button"
									onclick={() => handleSelectRoleplay(idx)}
									class="w-full cursor-pointer rounded-xl border p-3 text-left text-xs transition-all {isSelected
										? opt.isCorrect
											? 'border-emerald-400 bg-emerald-50 font-bold text-emerald-900'
											: 'border-rose-300 bg-rose-50 text-rose-900'
										: 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}"
								>
									<span class="font-bold">{opt.hanzi}</span>
									<span class="block font-mono text-[11px] text-indigo-600">{opt.pinyin}</span>
									<span class="block text-[11px] text-slate-500">{opt.english}</span>
								</button>
							{/each}
						</div>

						{#if selectedRoleplayIndex !== null && unit.miniCheck.roleplayCheck.options[selectedRoleplayIndex]}
							{@const opt = unit.miniCheck.roleplayCheck.options[selectedRoleplayIndex]}
							<p
								class="rounded-xl border p-2.5 text-[11px] {opt.isCorrect
									? 'border-emerald-200 bg-emerald-50 text-emerald-800'
									: 'border-rose-200 bg-rose-50 text-rose-700'}"
							>
								{opt.feedback}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Celebration Banner upon passing -->
				{#if isCompleted}
					<div
						class="space-y-2 rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-500 to-teal-600 p-4 text-center text-white shadow-md"
					>
						<div class="flex items-center justify-center gap-1.5 font-headline text-sm font-black">
							<Award size={18} />
							<span>Unit {unit.unitNumber} Completed!</span>
						</div>
						<p class="text-xs text-emerald-100">
							Congratulations! You mastered the communicative goals of {unit.chineseTitle} ({unit.title}).
						</p>
						{#if justCompletedNow}
							<div
								class="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white"
							>
								<Zap size={14} class="fill-amber-300 text-amber-300" />
								Awarded +{awardedXP} XP to your daily ledger!
							</div>
						{/if}
					</div>
				{/if}
			</section>

			<!-- Navigation Bar (Prev / Next Unit) -->
			<nav class="flex items-center justify-between gap-3 pt-2">
				{#if adjacent.prev}
					<a
						href={resolve(`/textbook/${adjacent.prev.id}`)}
						class="flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs hover:border-indigo-300 hover:shadow-md active:scale-[0.98]"
					>
						<ArrowLeft size={16} class="shrink-0 text-slate-400" />
						<div class="overflow-hidden text-left">
							<span class="block text-[10px] font-bold text-slate-400 uppercase"
								>Unit {adjacent.prev.unitNumber}</span
							>
							<span class="block truncate text-xs font-extrabold text-slate-900"
								>{adjacent.prev.chineseTitle}</span
							>
						</div>
					</a>
				{:else}
					<div class="flex-1"></div>
				{/if}

				{#if adjacent.next}
					<a
						href={resolve(`/textbook/${adjacent.next.id}`)}
						class="flex flex-1 cursor-pointer items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-right shadow-xs hover:border-indigo-300 hover:shadow-md active:scale-[0.98]"
					>
						<div class="overflow-hidden">
							<span class="block text-[10px] font-bold text-indigo-600 uppercase"
								>Next · Unit {adjacent.next.unitNumber}</span
							>
							<span class="block truncate text-xs font-extrabold text-slate-900"
								>{adjacent.next.chineseTitle}</span
							>
						</div>
						<ArrowRight size={16} class="shrink-0 text-indigo-600" />
					</a>
				{:else}
					<a
						href={resolve('/textbook')}
						class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 p-3 font-headline text-xs font-bold text-white shadow-md hover:bg-indigo-700"
					>
						<Award size={15} /> Course Finished
					</a>
				{/if}
			</nav>
		</main>

		<!-- Word Lookup Modal -->
		{#if selectedLookupWord}
			<WordLookupModal word={selectedLookupWord} onClose={() => (selectedLookupWord = null)} />
		{/if}
	</div>
{/if}
