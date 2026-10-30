<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import PodcastCard from '$lib/components/PodcastCard.svelte';
	import { BUILTIN_PODCASTS } from '$lib/data/podcasts';
	import { getAllPodcastProgress } from '$lib/utils/podcastStorage';
	import type { PodcastLevel, PodcastProgress } from '$lib/types';
	import { onMount } from 'svelte';
	import { Search, Headphones, Mic, Check } from 'lucide-svelte';

	let searchQuery = $state('');
	let selectedLevel = $state<PodcastLevel | 'all'>('all');
	let progressMap = $state<Record<string, PodcastProgress>>({});

	onMount(() => {
		progressMap = getAllPodcastProgress();
	});

	let filteredEpisodes = $derived(
		BUILTIN_PODCASTS.filter((ep) => {
			if (selectedLevel !== 'all' && ep.level !== selectedLevel) {
				return false;
			}
			if (!searchQuery.trim()) return true;
			const q = searchQuery.toLowerCase().trim();
			return (
				ep.title.toLowerCase().includes(q) ||
				(ep.titlePinyin && ep.titlePinyin.toLowerCase().includes(q)) ||
				ep.description.toLowerCase().includes(q) ||
				ep.speakers.some((s) => s.name.toLowerCase().includes(q)) ||
				ep.keyVocabulary.some((v) => v.word.includes(q) || v.pinyin.toLowerCase().includes(q))
			);
		})
	);

	let totalCompleted = $derived(Object.values(progressMap).filter((p) => p.completed).length);
</script>

<div class="min-h-screen bg-slate-50 pb-24 text-slate-900">
	<div class="mx-auto flex min-h-screen flex-col sm:max-w-md sm:bg-white sm:shadow-lg">
		<!-- Top App Header -->
		<TopHeader title="Podcasts" showBack={true} />

		<main class="flex-1 space-y-4 px-4 py-4">
			<!-- Hero Card with Scenic Mountain Backdrop matching Mockup -->
			<div
				class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6"
			>
				<!-- Background Landscape Image with Soft Light Gradient -->
				<img
					src="/images/podcast-hero.jpg"
					alt="Scenic Alpine Mountain Lake"
					class="absolute inset-0 h-full w-full object-cover object-[72%_center]"
				/>
				<div
					class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"
				></div>

				<!-- Content Layer -->
				<div class="relative z-10">
					<!-- Top Row: LEARN ANYWHERE Pill & Headphone Circle -->
					<div class="flex items-center justify-between">
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3.5 py-1 font-headline text-[10px] font-extrabold tracking-wider text-sky-600 uppercase shadow-xs backdrop-blur-md"
						>
							<Headphones class="h-3 w-3 text-sky-600" />
							LEARN ANYWHERE
						</span>

						<div
							class="flex h-13 w-13 items-center justify-center rounded-full border border-white/60 bg-indigo-400/25 text-white shadow-sm backdrop-blur-md"
						>
							<Headphones class="h-6 w-6 stroke-[2]" />
						</div>
					</div>

					<!-- Title -->
					<h1 class="mt-4 font-headline text-3xl font-black tracking-tight text-slate-900">
						Graded <span
							class="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent"
							>Podcasts</span
						>
					</h1>

					<!-- Description -->
					<p
						class="mt-2 max-w-[280px] font-sans text-xs leading-relaxed font-medium text-slate-600"
					>
						Listen to expert-led conversations and build your language skills, one episode at a
						time.
					</p>

					<!-- Stats Row -->
					<div class="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
						<!-- Episode count -->
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600"
							>
								<Mic class="h-3.5 w-3.5" />
							</div>
							<span class="font-headline font-bold text-slate-800"
								>{BUILTIN_PODCASTS.length} Episodes</span
							>
						</div>

						<div class="h-4 w-px bg-slate-300/80"></div>

						<!-- Completed count -->
						<div class="flex items-center gap-2">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xs"
							>
								<Check class="h-3.5 w-3.5 stroke-[3]" />
							</div>
							<span class="font-headline font-bold text-slate-800"
								>{totalCompleted > 0 ? `${totalCompleted} Completed` : 'Completed'}</span
							>
						</div>

						<div class="h-4 w-px bg-slate-300/80"></div>

						<!-- Earn XP -->
						<div class="flex items-center gap-1.5">
							<span class="text-base select-none">⭐</span>
							<span class="font-headline font-bold text-amber-500">Earn XP</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Search Bar -->
			<div class="relative">
				<Search class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<input
					type="search"
					placeholder="Search episodes, words, or speakers..."
					bind:value={searchQuery}
					class="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-4 pl-10 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none"
				/>
			</div>

			<!-- Difficulty Filter Pills -->
			<div class="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
				{#each [{ id: 'all' as const, label: 'All Levels' }, { id: 'beginner' as const, label: 'Beginner (HSK 1–2)' }, { id: 'intermediate' as const, label: 'Intermediate (HSK 3–4)' }, { id: 'advanced' as const, label: 'Advanced (HSK 5+)' }] as tab (tab.id)}
					<button
						type="button"
						onclick={() => (selectedLevel = tab.id)}
						class="shrink-0 rounded-xl px-3 py-1.5 font-headline text-xs font-bold transition-all {selectedLevel ===
						tab.id
							? 'bg-indigo-600 text-white shadow-sm'
							: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<!-- Episode List -->
			<div class="space-y-4 pt-1">
				{#if filteredEpisodes.length === 0}
					<div class="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
						<Headphones class="mx-auto mb-2 h-8 w-8 text-slate-300" />
						<p class="font-headline text-sm font-bold text-slate-700">No episodes found</p>
						<p class="mt-1 text-xs text-slate-500">Try another search keyword or clear filters.</p>
					</div>
				{:else}
					{#each filteredEpisodes as episode (episode.id)}
						<PodcastCard {episode} progress={progressMap[episode.id] || null} />
					{/each}
				{/if}
			</div>
		</main>
	</div>
</div>
