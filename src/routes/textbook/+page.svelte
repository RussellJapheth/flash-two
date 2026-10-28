<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		TEXTBOOK_PARTS,
		getAllTextbookCourseUnits,
		searchAllTextbookUnits
	} from '$lib/data/textbook';
	import { getCompletedTextbookUnits, getTextbookStats } from '$lib/utils/textbookStorage';
	import {
		BookOpen,
		CheckCircle2,
		Search,
		ArrowRight,
		Clock,
		Zap,
		GraduationCap
	} from 'lucide-svelte';

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
</script>

<svelte:head>
	<title>Mandarin Textbook | 36 Units from Zero to Fluency</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-50">
	<TopHeader title="Mandarin Textbook" />

	<main class="mx-auto w-full max-w-lg px-4 pt-4 pb-24">
		<!-- Hero Course Banner -->
		<section
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-900/15"
		>
			<div class="relative z-10">
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase backdrop-blur-xs"
					>
						<GraduationCap size={13} />
						Simplified Mandarin · 36 Units
					</span>
					<span
						class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-300"
					>
						<Zap size={12} class="fill-amber-300" />
						{stats.totalEarnedXP} XP Earned
					</span>
				</div>

				<h1 class="mt-3 font-headline text-xl font-extrabold tracking-tight sm:text-2xl">
					从零到流利 · Zero to Fluency
				</h1>
				<p class="mt-1 text-xs text-indigo-100/90 sm:text-sm">
					A systematic, communicative course taking you from Pinyin foundations to independent
					conversational fluency.
				</p>

				<!-- Progress Bar -->
				<div class="mt-4 rounded-2xl bg-white/10 p-3.5 backdrop-blur-xs">
					<div class="flex items-center justify-between text-xs font-semibold">
						<span class="text-indigo-100">Course Progress</span>
						<span class="font-headline text-white"
							>{stats.completedCount} / {stats.totalUnits} Units ({stats.percentage}%)</span
						>
					</div>
					<div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/20">
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
						class="mt-4 flex h-12 w-full cursor-pointer items-center justify-between rounded-2xl bg-white px-4 font-headline text-xs font-bold text-indigo-700 shadow-md transition-transform hover:bg-slate-50 active:scale-[0.98]"
					>
						<div class="flex items-center gap-2 overflow-hidden text-left">
							<span
								class="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black tracking-wider text-indigo-600 uppercase"
							>
								Unit {nextUnit.unitNumber}
							</span>
							<span class="truncate font-semibold text-slate-900">
								Continue: {nextUnit.chineseTitle} ({nextUnit.title})
							</span>
						</div>
						<div class="flex items-center gap-1 text-indigo-600">
							<span class="text-[11px] font-bold">Start</span>
							<ArrowRight size={15} />
						</div>
					</a>
				{/if}
			</div>

			<!-- Background decorative blobs -->
			<div
				class="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-indigo-900/30 blur-2xl"
			></div>
		</section>

		<!-- Search Bar -->
		<div class="relative mt-4">
			<Search
				size={16}
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
			/>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search 36 units, grammar, Chinese or Pinyin..."
				class="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-4 pl-10 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
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

		<!-- Units List Grouped by Parts -->
		<div class="mt-4 space-y-6">
			{#each TEXTBOOK_PARTS as part (part.partNumber)}
				{@const partUnits = displayedUnits.filter((u) => u.partNumber === part.partNumber)}
				{#if partUnits.length > 0}
					<section class="space-y-2.5">
						<!-- Part Section Header -->
						<div
							class="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-colors"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span
										class="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black tracking-wider text-indigo-700 uppercase"
									>
										{part.unitsRange}
									</span>
									<span
										class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
									>
										{part.stage}
									</span>
								</div>
								<span class="text-[11px] font-bold text-slate-400">
									{partUnits.filter((u) => completedUnitIds.includes(u.id)).length} / {partUnits.length}
									Passed
								</span>
							</div>

							<div class="mt-1.5 flex items-baseline gap-2">
								<h2 class="font-headline text-base font-extrabold text-slate-900">
									{part.title}
								</h2>
								<span class="text-xs font-medium text-slate-400">· {part.chineseTitle}</span>
							</div>
							<p class="mt-1 text-xs leading-relaxed text-slate-500">
								{part.goal}
							</p>
						</div>

						<!-- Unit Cards -->
						<div class="space-y-2">
							{#each partUnits as unit (unit.id)}
								{@const isCompleted = completedUnitIds.includes(unit.id)}
								<a
									href={resolve(`/textbook/${unit.id}`)}
									class="group relative flex cursor-pointer items-start justify-between rounded-2xl border bg-white p-3.5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md active:scale-[0.99] {isCompleted
										? 'border-emerald-200/90 bg-emerald-50/20'
										: 'border-slate-200/90'}"
								>
									<div class="flex items-start gap-3">
										<!-- Status Icon -->
										<div class="mt-0.5 shrink-0">
											{#if isCompleted}
												<div
													class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
												>
													<CheckCircle2 size={18} class="stroke-[2.5]" />
												</div>
											{:else}
												<div
													class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
												>
													<span class="font-headline text-xs font-bold">{unit.unitNumber}</span>
												</div>
											{/if}
										</div>

										<div class="space-y-1">
											<div class="flex items-center gap-2">
												<span class="font-headline text-sm font-extrabold text-slate-900">
													{unit.chineseTitle}
												</span>
												<span class="text-xs font-medium text-slate-500">
													{unit.title}
												</span>
											</div>

											<p class="line-clamp-1 text-xs text-slate-500">
												{unit.subtitle}
											</p>

											<div
												class="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400"
											>
												<span class="flex items-center gap-1 font-medium text-slate-600">
													<span>{unit.characterHost.avatarEmoji}</span>
													<span>{unit.characterHost.name}</span>
												</span>
												<span>•</span>
												<span class="flex items-center gap-1">
													<Clock size={12} />
													{unit.estimatedMinutes} min
												</span>
												<span>•</span>
												<span class="font-bold text-amber-600">
													+{unit.xpReward} XP
												</span>
											</div>
										</div>
									</div>

									<ArrowRight
										size={16}
										class="mt-1 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600"
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
	</main>
</div>
