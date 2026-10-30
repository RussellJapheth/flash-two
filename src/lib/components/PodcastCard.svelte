<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PodcastEpisode, PodcastProgress } from '$lib/types';
	import { Clock, CheckCircle2, Play, Sparkles } from 'lucide-svelte';

	let { episode, progress = null } = $props<{
		episode: PodcastEpisode;
		progress?: PodcastProgress | null;
	}>();

	let levelBadge = $derived(() => {
		switch (episode.level) {
			case 'beginner':
				return {
					label: 'Beginner',
					hsk: 'HSK 1–2',
					style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
				};
			case 'intermediate':
				return {
					label: 'Intermediate',
					hsk: 'HSK 3–4',
					style: 'bg-amber-50 text-amber-700 border-amber-200/80'
				};
			case 'advanced':
				return {
					label: 'Advanced',
					hsk: 'HSK 5+',
					style: 'bg-rose-50 text-rose-700 border-rose-200/80'
				};
			default:
				return {
					label: episode.level,
					hsk: '',
					style: 'bg-slate-100 text-slate-700 border-slate-200'
				};
		}
	});

	function formatDuration(sec: number): string {
		const m = Math.floor(sec / 64);
		const s = Math.floor(sec % 60);
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}

	function formatFileSize(bytes: number): string {
		return `${Math.round(bytes / 1024)} KB`;
	}

	let isCompleted = $derived(progress?.completed || false);
	let percentListened = $derived(
		progress?.lastPositionSec && episode.duration > 0
			? Math.min(100, Math.round((progress.lastPositionSec / episode.duration) * 100))
			: 0
	);
</script>

<div
	class="group shadow-card hover:shadow-card-hover relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4.5 transition-all duration-200 hover:border-indigo-200"
>
	<div>
		<!-- Top Badges -->
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-1.5">
				<span
					class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-headline text-[11px] font-bold tracking-wide {levelBadge()
						.style}"
				>
					{levelBadge().label}
					{#if levelBadge().hsk}
						<span class="opacity-60">• {levelBadge().hsk}</span>
					{/if}
				</span>

				<span
					class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
				>
					<Clock class="h-3 w-3" />
					{formatDuration(episode.duration)}
				</span>
			</div>

			<div class="flex items-center gap-1.5">
				<span
					class="rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-600"
				>
					{formatFileSize(episode.fileSizeBytes)}
				</span>
				<span
					class="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 font-headline text-[11px] font-bold text-amber-700"
				>
					<Sparkles class="h-3 w-3 text-amber-500" />
					+{episode.xpReward} XP
				</span>
			</div>
		</div>

		<!-- Title and Chinese Header -->
		<div class="mb-2">
			<h3
				class="font-headline text-lg font-black text-slate-900 transition-colors group-hover:text-indigo-600"
			>
				{episode.title}
			</h3>
			{#if episode.titlePinyin}
				<p class="font-mono text-xs font-medium text-indigo-600/90">{episode.titlePinyin}</p>
			{/if}
		</div>

		<!-- Description -->
		<p class="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
			{episode.description}
		</p>

		<!-- Speakers Shelf -->
		<div class="mb-3 flex items-center gap-2">
			<span class="text-[11px] font-semibold text-slate-400">Speakers:</span>
			<div class="flex flex-wrap items-center gap-1.5">
				{#each episode.speakers as speaker (speaker.id)}
					<span
						class="inline-flex items-center gap-1 rounded-lg border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
					>
						<span>{speaker.avatarEmoji || '👤'}</span>
						<span>{speaker.name}</span>
					</span>
				{/each}
			</div>
		</div>

		<!-- Key Vocabulary Pills -->
		{#if episode.keyVocabulary && episode.keyVocabulary.length > 0}
			<div class="mb-4">
				<div class="flex flex-wrap items-center gap-1">
					{#each episode.keyVocabulary.slice(0, 4) as item (item.word)}
						<span
							class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
						>
							<span class="font-semibold text-slate-800">{item.word}</span>
							<span class="text-slate-400">({item.pinyin})</span>
						</span>
					{/each}
					{#if episode.keyVocabulary.length > 4}
						<span class="text-[10px] text-slate-400">+{episode.keyVocabulary.length - 4} more</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Action Footer -->
	<div class="border-t border-slate-100 pt-3">
		{#if isCompleted}
			<div class="mb-2 flex items-center justify-between text-xs">
				<span class="inline-flex items-center gap-1 font-headline font-bold text-emerald-600">
					<CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
					Completed
				</span>
				<span class="text-[11px] text-slate-400">Listen again</span>
			</div>
		{:else if percentListened > 0}
			<div class="mb-2">
				<div class="mb-1 flex justify-between text-[11px] text-slate-500">
					<span>In progress</span>
					<span>{percentListened}%</span>
				</div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
					<div
						class="h-full rounded-full bg-indigo-600 transition-all duration-300"
						style="width: {percentListened}%"
					></div>
				</div>
			</div>
		{/if}

		<a
			href={resolve(`/podcasts/${episode.id}`)}
			class="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.98]"
		>
			<Play class="h-4 w-4 fill-white text-white" />
			<span
				>{isCompleted
					? 'Listen Again'
					: percentListened > 0
						? 'Resume Episode'
						: 'Start Listening'}</span
			>
		</a>
	</div>
</div>
