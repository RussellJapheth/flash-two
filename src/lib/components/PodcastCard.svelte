<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PodcastEpisode, PodcastProgress } from '$lib/types';
	import { Clock, Play, Sparkles, RotateCcw } from 'lucide-svelte';
	import TextbookAvatar from '$lib/components/TextbookAvatar.svelte';

	let { episode, progress = null } = $props<{
		episode: PodcastEpisode;
		progress?: PodcastProgress | null;
	}>();

	let isCompleted = $derived(progress?.completed || false);
	let percentListened = $derived(
		progress?.lastPositionSec && episode.duration > 0
			? Math.min(100, Math.round((progress.lastPositionSec / episode.duration) * 100))
			: 0
	);

	let levelBadge = $derived(
		episode.level === 'beginner'
			? {
					label: 'Beginner',
					hsk: 'HSK 1–2',
					style: 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
				}
			: episode.level === 'intermediate'
				? {
						label: 'Intermediate',
						hsk: 'HSK 3–4',
						style: 'border-amber-200/80 bg-amber-50 text-amber-700'
					}
				: episode.level === 'advanced'
					? {
							label: 'Advanced',
							hsk: 'HSK 5+',
							style: 'border-rose-200/80 bg-rose-50 text-rose-700'
						}
					: {
							label: episode.level,
							hsk: '',
							style: 'border-slate-200/80 bg-slate-100 text-slate-700'
						}
	);

	function formatDuration(sec: number): string {
		const totalSec = Math.round(sec);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}
</script>

<a
	href={resolve(`/podcasts/${episode.id}`)}
	class="group shadow-card relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-md focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
>
	<div>
		<!-- Top Meta Row: Grade, Duration, XP -->
		<div class="mb-3.5 flex items-center justify-between gap-2">
			<span
				class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-headline text-xs font-bold {levelBadge.style}"
			>
				{levelBadge.label}
				{#if levelBadge.hsk}
					<span class="opacity-60">• {levelBadge.hsk}</span>
				{/if}
			</span>

			<div class="flex items-center gap-2">
				<span
					class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-sans text-xs font-medium text-slate-600"
				>
					<Clock class="h-3 w-3 text-slate-400" />
					{formatDuration(episode.duration)}
				</span>

				<span
					class="inline-flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 font-headline text-xs font-bold text-amber-700"
				>
					<Sparkles class="h-3 w-3 fill-amber-400 text-amber-500" />
					+{episode.xpReward} XP
				</span>
			</div>
		</div>

		<!-- Title & Subtitle -->
		<div>
			<h3
				class="font-headline text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600"
			>
				{episode.title}
			</h3>
			{#if episode.titlePinyin}
				<p class="mt-0.5 font-sans text-xs font-medium text-slate-400">
					{episode.titlePinyin}
				</p>
			{/if}
		</div>

		<!-- Speakers Shelf with Proper Avatars -->
		{#if episode.speakers && episode.speakers.length > 0}
			<div class="mt-3.5 flex items-center gap-2">
				<span class="font-sans text-xs font-medium text-slate-400">Speakers:</span>
				<div class="flex flex-wrap items-center gap-1.5">
					{#each episode.speakers as speaker (speaker.id)}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-xs"
						>
							<TextbookAvatar
								name={speaker.name}
								role={speaker.role}
								size="xs"
								className="h-5 w-5 rounded-full border border-white shadow-xs"
							/>
							<span class="font-headline font-semibold text-slate-800">{speaker.name}</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- In-Progress Listening Bar -->
		{#if !isCompleted && percentListened > 0}
			<div class="mt-3">
				<div class="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-400">
					<span>Listened</span>
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
	</div>

	<!-- Action Footer / Listen Button -->
	<div class="mt-4">
		<div
			class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 group-hover:bg-indigo-700 group-active:scale-[0.98]"
		>
			{#if isCompleted}
				<RotateCcw class="h-4 w-4" />
				<span>Listen Again</span>
			{:else if percentListened > 0}
				<Play class="h-4 w-4 fill-white text-white" />
				<span>Resume</span>
			{:else}
				<Play class="h-4 w-4 fill-white text-white" />
				<span>Listen</span>
			{/if}
		</div>
	</div>
</a>
