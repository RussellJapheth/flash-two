<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import TextbookAvatar from '$lib/components/TextbookAvatar.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		TEXTBOOK_PARTS,
		getAllTextbookCourseUnits,
		searchAllTextbookUnits,
		TEXTBOOK_GRAMMAR_CURRICULUM,
		TONE_GUIDE_ITEMS,
		SANDHI_RULES,
		CONVERSATION_STRATEGIES
	} from '$lib/data/textbook';
	import { getCompletedTextbookUnits, getTextbookStats } from '$lib/utils/textbookStorage';
	import { speakText } from '$lib/utils/audio';
	import {
		BookOpen,
		CheckCircle2,
		Search,
		ArrowRight,
		Clock,
		Zap,
		GraduationCap,
		Sparkles,
		Volume2,
		Library,
		MessageSquare,
		Mic
	} from 'lucide-svelte';

	type ActiveTab = 'units' | 'grammar' | 'pronunciation' | 'conversation';

	let activeTab = $state<ActiveTab>('units');
	let searchQuery = $state('');
	let selectedPart = $state<number | 'all'>('all');
	let completedUnitIds = $state<string[]>([]);
	let stats = $state({
		totalUnits: 36,
		completedCount: 0,
		percentage: 0,
		totalEarnedXP: 0
	});

	function refreshData() {
		completedUnitIds = getCompletedTextbookUnits();
		stats = getTextbookStats();
	}

	onMount(() => {
		refreshData();
	});

	let displayedUnits = $derived.by(() => {
		let units = searchQuery.trim()
			? searchAllTextbookUnits(searchQuery)
			: getAllTextbookCourseUnits();

		if (selectedPart !== 'all') {
			units = units.filter((u) => u.partNumber === selectedPart);
		}

		return units;
	});

	// Find the next unit to study
	let nextUnit = $derived.by(() => {
		const all = getAllTextbookCourseUnits();
		const uncompleted = all.find((u) => !completedUnitIds.includes(u.id));
		return uncompleted || all[0];
	});

	function handleSpeak(text: string) {
		speakText(text, 'chinese').catch(() => {});
	}
</script>

<svelte:head>
	<title>Mandarin Textbook | 36 Units Illustrated Picturebook Course</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50">
	<TopHeader title="Mandarin Textbook" />

	<main class="mx-auto w-full max-w-lg px-4 pt-4 pb-24">
		<!-- Picturebook Hero Course Banner -->
		<section
			class="shadow-card relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-linear-to-br from-indigo-800 via-indigo-700 to-violet-800 p-5 text-white shadow-indigo-950/20"
		>
			<!-- Background cover picturebook art -->
			<div class="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay">
				<img
					src="/images/textbook/part1-foundations.jpg"
					alt="Textbook Cover Art"
					class="h-full w-full object-cover"
				/>
			</div>

			<div class="relative z-10">
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-wider text-white uppercase backdrop-blur-md"
					>
						<GraduationCap size={13} />
						Illustrated Edition · CEFR B2
					</span>
					<span
						class="inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md"
					>
						<Zap size={12} class="fill-amber-300" />
						{stats.totalEarnedXP} XP Earned
					</span>
				</div>

				<div class="mt-3.5 flex items-center gap-3">
					<div class="flex-1">
						<h1 class="font-headline text-2xl font-black tracking-tight text-white sm:text-3xl">
							从零到流利
						</h1>
						<p class="font-headline text-xs font-bold text-indigo-200">
							Zero to Fluency · 36 Picturebook Units
						</p>
					</div>
					<TextbookAvatar
						name="Teacher Li"
						role="Course Guide"
						size="lg"
						className="ring-2 ring-white/30 shadow-md"
					/>
				</div>

				<p class="mt-2 text-xs leading-relaxed text-indigo-100/90 sm:text-sm">
					A systematic, communicative course taking you from Pinyin foundations to independent
					conversational fluency with authentic illustrated scenes.
				</p>

				<!-- Progress Bar -->
				<div class="mt-4 rounded-2xl bg-black/25 p-3.5 backdrop-blur-md">
					<div class="flex items-center justify-between text-xs font-semibold">
						<span class="text-indigo-200">Textbook Progress</span>
						<span class="font-headline font-bold text-white">
							{stats.completedCount} / {stats.totalUnits} Units ({stats.percentage}%)
						</span>
					</div>
					<div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
						<div
							class="h-full rounded-full bg-emerald-400 transition-all duration-500 ease-out"
							style="width: {stats.percentage}%"
						></div>
					</div>
				</div>

				<!-- Continue Action Button -->
				{#if nextUnit}
					<a
						href={resolve(`/textbook/${nextUnit.id}`)}
						class="mt-4 flex h-13 w-full cursor-pointer items-center justify-between rounded-2xl bg-white px-4 font-headline text-xs font-black text-indigo-700 shadow-md transition-transform hover:bg-slate-50 active:scale-[0.98]"
					>
						<div class="flex items-center gap-2.5 overflow-hidden text-left">
							<span
								class="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black tracking-wider text-indigo-700 uppercase"
							>
								Unit {nextUnit.unitNumber}
							</span>
							<span class="truncate font-bold text-slate-900">
								Continue: {nextUnit.chineseTitle} ({nextUnit.title})
							</span>
						</div>
						<div class="flex items-center gap-1 text-indigo-600">
							<span class="text-[11px] font-black">Open</span>
							<ArrowRight size={15} />
						</div>
					</a>
				{/if}
			</div>
		</section>

		<!-- 4 Picturebook Learning Hub Tabs -->
		<nav
			class="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xs"
		>
			<button
				type="button"
				onclick={() => (activeTab = 'units')}
				class="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold transition-all {activeTab ===
				'units'
					? 'bg-indigo-600 text-white shadow-xs'
					: 'text-slate-600 hover:bg-slate-100'}"
			>
				<BookOpen size={16} />
				<span>36 Units</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'grammar')}
				class="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold transition-all {activeTab ===
				'grammar'
					? 'bg-indigo-600 text-white shadow-xs'
					: 'text-slate-600 hover:bg-slate-100'}"
			>
				<Library size={16} />
				<span>Grammar</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'pronunciation')}
				class="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold transition-all {activeTab ===
				'pronunciation'
					? 'bg-indigo-600 text-white shadow-xs'
					: 'text-slate-600 hover:bg-slate-100'}"
			>
				<Mic size={16} />
				<span>Sound Lab</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'conversation')}
				class="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold transition-all {activeTab ===
				'conversation'
					? 'bg-indigo-600 text-white shadow-xs'
					: 'text-slate-600 hover:bg-slate-100'}"
			>
				<MessageSquare size={16} />
				<span>Pragmatics</span>
			</button>
		</nav>

		<!-- TAB 1: 36 UNITS (MAIN COURSE) -->
		{#if activeTab === 'units'}
			<!-- Search Bar -->
			<div class="relative mt-4">
				<Search
					size={16}
					class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search 36 units, grammar formulas, Hanzi or Pinyin..."
					class="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-4 pl-10 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
				/>
			</div>

			<!-- Part Filter Pills -->
			<div class="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
				<button
					type="button"
					onclick={() => (selectedPart = 'all')}
					class="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all {selectedPart ===
					'all'
						? 'bg-indigo-600 text-white shadow-xs'
						: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}"
				>
					All Parts (36)
				</button>
				{#each TEXTBOOK_PARTS as part (part.partNumber)}
					<button
						type="button"
						onclick={() => (selectedPart = part.partNumber)}
						class="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all {selectedPart ===
						part.partNumber
							? 'bg-indigo-600 text-white shadow-xs'
							: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}"
					>
						Part {part.partNumber}: {part.chineseTitle}
					</button>
				{/each}
			</div>

			<!-- Units List Grouped by Parts with Picturebook Scenes -->
			<div class="mt-4 space-y-7">
				{#each TEXTBOOK_PARTS as part (part.partNumber)}
					{@const partUnits = displayedUnits.filter((u) => u.partNumber === part.partNumber)}
					{#if partUnits.length > 0}
						<section class="space-y-3">
							<!-- Part Section Header with Picturebook Scene Artwork -->
							<div
								class="shadow-card overflow-hidden rounded-3xl border border-slate-200/90 bg-white transition-colors"
							>
								<div class="relative h-32 w-full overflow-hidden">
									<img
										src={part.illustrationUrl}
										alt={part.title}
										class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
									/>
									<div
										class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"
									></div>
									<div class="absolute top-3 left-3 flex items-center gap-2">
										<span
											class="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-indigo-900 uppercase backdrop-blur-md"
										>
											{part.unitsRange}
										</span>
										<span
											class="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md"
										>
											{part.stage}
										</span>
									</div>
									<div class="absolute right-3.5 bottom-2.5 left-3.5 text-white">
										<h2 class="font-headline text-base font-black tracking-tight">
											{part.title} · {part.chineseTitle}
										</h2>
									</div>
								</div>

								<div class="p-3.5">
									<p class="text-xs leading-relaxed text-slate-600">
										{part.goal}
									</p>
									<div
										class="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold text-slate-400"
									>
										<span>Course Milestones</span>
										<span class="text-indigo-600">
											{partUnits.filter((u) => completedUnitIds.includes(u.id)).length} / {partUnits.length}
											Units Mastered
										</span>
									</div>
								</div>
							</div>

							<!-- Unit Rows -->
							<div class="space-y-2">
								{#each partUnits as unit (unit.id)}
									{@const isCompleted = completedUnitIds.includes(unit.id)}
									<a
										href={resolve(`/textbook/${unit.id}`)}
										class="group hover:shadow-card relative flex cursor-pointer items-start justify-between rounded-2xl border bg-white p-3.5 shadow-2xs transition-all hover:border-indigo-300 active:scale-[0.99] {isCompleted
											? 'border-emerald-200/90 bg-emerald-50/20'
											: 'border-slate-200/90'}"
									>
										<div class="flex items-start gap-3">
											<!-- Illustrated Avatar -->
											<TextbookAvatar
												name={unit.characterHost.name}
												role={unit.characterHost.role}
												avatarEmoji={unit.characterHost.avatarEmoji}
												avatarUrl={unit.characterHost.avatarUrl}
												size="md"
												className="shadow-2xs"
											/>

											<div class="space-y-1">
												<div class="flex items-center gap-2">
													<span class="font-headline text-sm font-black text-slate-900">
														{unit.unitNumber}. {unit.chineseTitle}
													</span>
													<span class="text-xs font-semibold text-slate-500">
														{unit.title}
													</span>
												</div>

												<p class="line-clamp-1 text-xs text-slate-600">
													{unit.subtitle}
												</p>

												<div
													class="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400"
												>
													<span class="font-medium text-indigo-700">
														{unit.characterHost.name}
													</span>
													<span>•</span>
													<span class="flex items-center gap-1">
														<Clock size={11} />
														{unit.estimatedMinutes} min
													</span>
													<span>•</span>
													{#if isCompleted}
														<span class="flex items-center gap-1 font-bold text-emerald-600">
															<CheckCircle2 size={12} />
															Passed
														</span>
													{:else}
														<span class="font-bold text-amber-600">
															+{unit.xpReward} XP
														</span>
													{/if}
												</div>
											</div>
										</div>

										<ArrowRight
											size={16}
											class="mt-2 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600"
										/>
									</a>
								{/each}
							</div>
						</section>
					{/if}
				{/each}

				{#if displayedUnits.length === 0}
					<div class="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
						<BookOpen size={32} class="mx-auto text-slate-300" />
						<h3 class="mt-2 font-headline text-sm font-bold text-slate-800">No units matched</h3>
						<p class="mt-1 text-xs text-slate-500">
							Try searching with different terms or reset your filter.
						</p>
						<button
							type="button"
							onclick={() => {
								searchQuery = '';
								selectedPart = 'all';
							}}
							class="mt-3 cursor-pointer rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
						>
							Clear Filter
						</button>
					</div>
				{/if}
			</div>

			<!-- TAB 2: GRAMMAR REFERENCE (SECTION 4 OF SYLLABUS) -->
		{:else if activeTab === 'grammar'}
			<section class="mt-4 space-y-4">
				<div
					class="shadow-card rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-amber-50/40 p-4"
				>
					<div class="flex items-center gap-2">
						<Sparkles size={16} class="text-indigo-600" />
						<h2 class="font-headline text-sm font-black text-slate-900">
							Indexed Grammar Curriculum · 语法宝典
						</h2>
					</div>
					<p class="mt-1 text-xs leading-relaxed text-slate-600">
						The complete structural framework of Mandarin: word order, aspect markers (了/过/着),
						complements, comparisons, 把/被, and modal particles.
					</p>
				</div>

				<div class="space-y-4">
					{#each TEXTBOOK_GRAMMAR_CURRICULUM as item (item.id)}
						<article
							class="shadow-card space-y-3 rounded-3xl border border-slate-200/90 bg-white p-4"
						>
							<div>
								<span class="text-[10px] font-black tracking-wider text-indigo-600 uppercase">
									{item.category}
								</span>
								<h3 class="mt-0.5 font-headline text-base font-black text-slate-900">
									{item.chineseTitle}
								</h3>
								<p class="text-xs font-semibold text-slate-500">{item.title}</p>
							</div>

							<!-- Formula Box -->
							<div class="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-3">
								<span class="text-[10px] font-black tracking-wider text-indigo-700 uppercase"
									>Sentence Formula</span
								>
								<div class="mt-0.5 font-mono text-xs font-extrabold text-indigo-950">
									{item.formula}
								</div>
							</div>

							<p class="text-xs leading-relaxed text-slate-600">
								{item.explanation}
							</p>

							<!-- Examples with Audio -->
							<div class="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
								<span class="text-[10px] font-black tracking-wider text-slate-500 uppercase">
									Natural Native Examples
								</span>
								{#each item.examples as ex (ex.hanzi)}
									<div
										class="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5 last:border-none last:pb-0"
									>
										<div class="space-y-0.5">
											<p class="font-headline text-xs font-black text-slate-900">{ex.hanzi}</p>
											<p class="font-mono text-[11px] text-indigo-600">{ex.pinyin}</p>
											<p class="text-[11px] text-slate-500">{ex.english}</p>
										</div>
										<button
											type="button"
											onclick={() => handleSpeak(ex.hanzi)}
											class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-indigo-600 shadow-2xs hover:bg-indigo-600 hover:text-white"
											aria-label="Speak example"
										>
											<Volume2 size={13} />
										</button>
									</div>
								{/each}
							</div>

							<!-- Contrast Pitfall Note -->
							{#if item.contrasts && item.contrasts.length > 0}
								{#each item.contrasts as c (c.label)}
									<div
										class="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-3 text-xs shadow-2xs"
									>
										<span class="font-black text-amber-950">{c.label}</span>
										<p class="mt-0.5 text-amber-900/90">{c.explanation}</p>
										<div class="mt-1 rounded-xl bg-white/90 p-2 font-medium text-slate-900">
											{c.rightHanzi} ·
											<span class="font-mono text-indigo-600">{c.rightPinyin}</span>
										</div>
										<p class="mt-1 text-[11px] text-amber-950/80">💡 {c.tip}</p>
									</div>
								{/each}
							{/if}
						</article>
					{/each}
				</div>
			</section>

			<!-- TAB 3: PRONUNCIATION REFERENCE (SECTION 3 & 7) -->
		{:else if activeTab === 'pronunciation'}
			<section class="mt-4 space-y-4">
				<div
					class="shadow-card rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-amber-50/40 p-4"
				>
					<div class="flex items-center gap-2">
						<Mic size={16} class="text-indigo-600" />
						<h2 class="font-headline text-sm font-black text-slate-900">
							Pronunciation & Tone Laboratory · 语音工坊
						</h2>
					</div>
					<p class="mt-1 text-xs leading-relaxed text-slate-600">
						Pitch contours for the four lexical tones + neutral tone, plus third-tone sandhi and “不
						/ 一” tone variation rules.
					</p>
				</div>

				<!-- 4 Tones Guide -->
				<div class="space-y-3">
					<h3 class="font-headline text-xs font-black tracking-wider text-slate-500 uppercase">
						The Four Lexical Tones + Neutral Tone
					</h3>
					{#each TONE_GUIDE_ITEMS as t (t.toneNumber)}
						<div class="shadow-card rounded-3xl border border-slate-200/90 bg-white p-4">
							<div class="flex items-start justify-between">
								<div class="space-y-0.5">
									<div class="flex items-baseline gap-2">
										<span class="font-headline text-base font-black text-slate-900">
											{t.name}
										</span>
										<span
											class="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-black text-indigo-700"
										>
											Pitch {t.pitchContour}
										</span>
									</div>
									<p class="text-xs text-slate-600">{t.description}</p>
								</div>
								<button
									type="button"
									onclick={() => handleSpeak(t.audioText)}
									class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-2xs hover:bg-indigo-600 hover:text-white"
									aria-label="Play tone examples"
								>
									<Volume2 size={16} />
								</button>
							</div>

							<div
								class="mt-3 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3"
							>
								<div>
									<span class="text-[10px] font-black text-indigo-700 uppercase"
										>Sound Examples</span
									>
									<p class="font-headline text-sm font-black text-slate-900">{t.exampleHanzi}</p>
									<p class="font-mono text-xs font-semibold text-indigo-600">{t.examplePinyin}</p>
								</div>
								<div class="text-right">
									<span class="text-[10px] font-bold text-slate-400">Mark</span>
									<span class="block font-mono text-sm font-black text-indigo-900">{t.mark}</span>
								</div>
							</div>

							<p class="mt-2 text-[11px] text-slate-500 italic">
								🎵 {t.mnemonic}
							</p>
						</div>
					{/each}
				</div>

				<!-- Tone Sandhi Rules -->
				<div class="space-y-3 pt-2">
					<h3 class="font-headline text-xs font-black tracking-wider text-slate-500 uppercase">
						Essential Tone Sandhi Rules · 变调规律
					</h3>
					{#each SANDHI_RULES as rule (rule.ruleName)}
						<div class="shadow-card rounded-3xl border border-amber-200/90 bg-white p-4">
							<div class="flex items-center gap-2">
								<span
									class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase"
								>
									Sandhi
								</span>
								<h4 class="font-headline text-sm font-black text-slate-900">
									{rule.chineseName} ({rule.ruleName})
								</h4>
							</div>

							<div
								class="mt-2 rounded-2xl bg-amber-50/60 p-2.5 font-mono text-xs font-bold text-amber-950"
							>
								{rule.formula}
							</div>

							<p class="mt-2 text-xs leading-relaxed text-slate-600">
								{rule.explanation}
							</p>

							<div class="mt-3 space-y-2 border-t border-slate-100 pt-2.5">
								{#each rule.examples as ex (ex.hanzi)}
									<div class="flex items-center justify-between text-xs">
										<div>
											<span class="font-headline font-black text-slate-900">{ex.hanzi}</span>
											<span class="ml-1 text-slate-400"
												>({ex.original} ➔
												<strong class="text-indigo-600">{ex.spokenAs}</strong>)</span
											>
										</div>
										<button
											type="button"
											onclick={() => handleSpeak(ex.hanzi)}
											class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
											aria-label="Play sandhi audio"
										>
											<Volume2 size={13} />
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- TAB 4: CONVERSATIONAL PRAGMATICS (SECTION 8 OF SYLLABUS) -->
		{:else if activeTab === 'conversation'}
			<section class="mt-4 space-y-4">
				<div
					class="shadow-card rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-amber-50/40 p-4"
				>
					<div class="flex items-center gap-2">
						<MessageSquare size={16} class="text-indigo-600" />
						<h2 class="font-headline text-sm font-black text-slate-900">
							Natural Conversation Skills · 地道会话策略
						</h2>
					</div>
					<p class="mt-1 text-xs leading-relaxed text-slate-600">
						Move beyond rigid textbook answers. Learn conversational turn-taking, indirect refusals,
						softening with 要不, and repair strategies.
					</p>
				</div>

				<div class="space-y-4">
					{#each CONVERSATION_STRATEGIES as strat (strat.id)}
						<article
							class="shadow-card space-y-3 rounded-3xl border border-slate-200/90 bg-white p-4"
						>
							<div>
								<span class="text-[10px] font-black tracking-wider text-indigo-600 uppercase">
									Communicative Strategy
								</span>
								<h3 class="mt-0.5 font-headline text-base font-black text-slate-900">
									{strat.chineseName}
								</h3>
								<p class="text-xs font-semibold text-slate-500">{strat.functionName}</p>
							</div>

							<div class="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
								<strong class="font-bold text-slate-900">Context:</strong>
								{strat.situation}
							</div>

							<!-- Key Reusable Phrases -->
							<div class="space-y-2">
								<span class="text-[10px] font-black tracking-wider text-slate-500 uppercase">
									Key Native Reusable Phrases
								</span>
								{#each strat.keyPhrases as phrase (phrase.hanzi)}
									<div
										class="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/40 p-2.5"
									>
										<div>
											<p class="font-headline text-xs font-black text-slate-900">{phrase.hanzi}</p>
											<p class="font-mono text-[11px] text-indigo-600">{phrase.pinyin}</p>
											<p class="text-[11px] text-slate-500">{phrase.english}</p>
										</div>
										<button
											type="button"
											onclick={() => handleSpeak(phrase.hanzi)}
											class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-indigo-600 shadow-2xs hover:bg-indigo-600 hover:text-white"
											aria-label="Speak phrase"
										>
											<Volume2 size={14} />
										</button>
									</div>
								{/each}
							</div>

							<!-- Example Exchange Walkthrough -->
							<div class="space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3.5">
								<span class="text-[10px] font-black tracking-wider text-amber-900 uppercase">
									Real-World Exchange Example
								</span>
								<div class="space-y-1.5 text-xs">
									<div class="rounded-xl border border-amber-100 bg-white/80 p-2">
										<span class="font-bold text-indigo-700"
											>{strat.exampleExchange.speakerA}:
										</span>
										<span class="font-headline font-bold text-slate-900"
											>{strat.exampleExchange.hanziA}</span
										>
										<p class="font-mono text-[11px] text-slate-500">
											{strat.exampleExchange.pinyinA}
										</p>
									</div>
									<div class="rounded-xl border border-amber-100 bg-white/80 p-2">
										<span class="font-bold text-indigo-700"
											>{strat.exampleExchange.speakerB}:
										</span>
										<span class="font-headline font-bold text-slate-900"
											>{strat.exampleExchange.hanziB}</span
										>
										<p class="font-mono text-[11px] text-slate-500">
											{strat.exampleExchange.pinyinB}
										</p>
									</div>
								</div>
								<p class="pt-1 text-[11px] leading-relaxed text-amber-950/80 italic">
									💡 {strat.exampleExchange.comment}
								</p>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/if}
	</main>
</div>
