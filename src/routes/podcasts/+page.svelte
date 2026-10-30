<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import PodcastCard from '$lib/components/PodcastCard.svelte';
	import { BUILTIN_PODCASTS } from '$lib/data/podcasts';
	import { getAllPodcastProgress } from '$lib/utils/podcastStorage';
	import type { PodcastLevel, PodcastProgress } from '$lib/types';
	import { onMount } from 'svelte';
	import { Search, Headphones, Sparkles } from 'lucide-svelte';

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
			<!-- Hero Card -->
			<div
				class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-5 text-white shadow-md shadow-indigo-900/10"
			>
				<div class="flex items-start justify-between">
					<div>
						<span
							class="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 font-headline text-[10px] font-bold tracking-wider text-indigo-200 uppercase backdrop-blur-sm"
						>
							<Headphones class="h-3 w-3" />
							Audio Immersion
						</span>
						<h1 class="mt-2 font-headline text-xl font-black tracking-tight text-white">
							Graded Podcasts
						</h1>
						<p class="mt-1 text-xs leading-relaxed text-indigo-200/90">
							Pre-baked native conversations with live synchronized transcripts.
						</p>
					</div>

					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md"
					>
						<Headphones class="h-6 w-6 text-indigo-300" />
					</div>
				</div>

				<!-- Stats Ribbon -->
				<div
					class="mt-4 flex items-center gap-3 border-t border-white/10 pt-3 text-xs font-medium text-indigo-100"
				>
					<div class="flex items-center gap-1.5">
						<span class="font-bold text-white">{BUILTIN_PODCASTS.length}</span>
						<span class="text-indigo-300">Episodes</span>
					</div>
					<span class="text-indigo-400">•</span>
					<div class="flex items-center gap-1.5">
						<span class="font-bold text-white">{totalCompleted}</span>
						<span class="text-indigo-300">Completed</span>
					</div>
					<span class="text-indigo-400">•</span>
					<div class="flex items-center gap-1 text-amber-300">
						<Sparkles class="h-3.5 w-3.5" />
						<span>Earn XP</span>
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
