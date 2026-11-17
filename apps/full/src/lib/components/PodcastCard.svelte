<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PodcastEpisode, PodcastProgress } from '$lib/types';
	import { Clock, Play, RotateCcw, Sparkles, Leaf, Volume2 } from 'lucide-svelte';
	import TextbookAvatar from '$lib/components/TextbookAvatar.svelte';
	import { speakWord } from '$lib/utils/audio';

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

	let displayTitle = $derived(episode.titleEn || episode.title);
	let episodeHref = $derived(resolve(`/podcasts/${episode.id}`));

	let levelBadge = $derived(
		episode.level === 'beginner'
			? {
					label: 'Beginner',
					hsk: 'HSK 1–2',
					style: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
					hskStyle: 'text-emerald-500',
					icon: 'fill-emerald-500 text-emerald-600'
				}
			: episode.level === 'intermediate'
				? {
						label: 'Intermediate',
						hsk: 'HSK 3–4',
						style: 'border-amber-200/80 bg-amber-50 text-amber-700',
						hskStyle: 'text-amber-500',
						icon: 'fill-amber-500 text-amber-600'
					}
				: {
						label: 'Advanced',
						hsk: 'HSK 5+',
						style: 'border-rose-200/80 bg-rose-50 text-rose-700',
						hskStyle: 'text-rose-500',
						icon: 'fill-rose-500 text-rose-600'
					}
	);

	function formatDuration(sec: number): string {
		const totalSec = Math.round(sec);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}

	function handleSpeakerAudio(e: MouseEvent, speakerName: string) {
		e.preventDefault();
		e.stopPropagation();
		speakWord(speakerName, 'chinese');
	}
</script>

<article
	class="group shadow-card @container relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
>
	<!-- Soft decorative glows -->
	<div
		class="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-indigo-100/50 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-10 -bottom-20 h-56 w-56 rounded-full bg-sky-100/50 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative @xl:p-3">
		<!-- Header: level badge (left) + stats (right) -->
		<div class="flex flex-wrap items-center justify-between gap-2">
			<span
				class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-headline text-xs font-bold whitespace-nowrap shadow-xs @xl:gap-1.5 @xl:px-3 @xl:py-1 @xl:text-sm {levelBadge.style}"
			>
				<Leaf class="h-3 w-3 @xl:h-4 @xl:w-4 {levelBadge.icon}" />
				<span>{levelBadge.label}</span>
				<span class={levelBadge.hskStyle}>• {levelBadge.hsk}</span>
			</span>

			<div class="flex items-center gap-1 @xl:gap-2">
				<span
					class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 @xl:px-3 @xl:py-1 @xl:text-sm"
				>
					<Clock class="h-3 w-3 text-slate-500 @xl:h-4 @xl:w-4" />
					<span>{formatDuration(episode.duration)}</span>
				</span>

				<span
					class="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 font-headline text-xs font-bold text-amber-700 @xl:px-3 @xl:py-1 @xl:text-sm"
				>
					<Sparkles class="h-3 w-3 fill-amber-400 text-amber-500 @xl:h-4 @xl:w-4" />
					<span>+{episode.xpReward} XP</span>
				</span>
			</div>
		</div>

		<!-- Body: info (left) + cover (right) -->
		<div class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 @xl:mt-5 @xl:gap-8">
			<div class="flex min-w-0 flex-col justify-between gap-3 self-stretch @xl:gap-8">
				<a href={episodeHref} class="group/title block">
					<h2
						class="font-headline text-xl leading-tight font-extrabold tracking-tight text-slate-900 transition-colors group-hover/title:text-indigo-600 @xl:text-3xl"
					>
						{displayTitle}
					</h2>
					{#if episode.titlePinyin}
						<p class="mt-1 text-xs font-semibold text-slate-500 @xl:mt-2 @xl:text-lg">
							{episode.titlePinyin}
						</p>
					{/if}
				</a>

				{#if episode.speakers.length > 0}
					<div class="flex flex-wrap items-center gap-1.5 @xl:gap-2.5">
						<span
							class="sr-only font-headline font-bold text-slate-500 @xl:not-sr-only @xl:text-sm"
						>
							Speakers:
						</span>
						{#each episode.speakers as speaker (speaker.id)}
							<button
								type="button"
								onclick={(e) => handleSpeakerAudio(e, speaker.name)}
								class="relative inline-flex h-7 items-center gap-1 rounded-full border border-slate-200/90 bg-white/90 pr-2 pl-1 shadow-xs transition-all after:absolute after:inset-x-0 after:-inset-y-2 hover:border-indigo-300 hover:bg-indigo-50 active:scale-95 @xl:h-9 @xl:gap-1.5 @xl:pr-3"
								aria-label="Listen to {speaker.name}"
							>
								<TextbookAvatar
									name={speaker.name}
									role={speaker.role}
									size="xs"
									className="rounded-full! border-0!"
								/>
								<span class="font-hanzi text-xs font-semibold text-slate-800 @xl:text-sm">
									{speaker.name}
								</span>
								<Volume2 class="h-3 w-3 text-indigo-500 @xl:h-3.5 @xl:w-3.5" />
							</button>
						{/each}
					</div>
				{/if}

				{#if !isCompleted && percentListened > 0}
					<div>
						<div class="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
							<span>Progress</span>
							<span>{percentListened}%</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
							<div
								class="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
								style="width: {percentListened}%"
							></div>
						</div>
					</div>
				{/if}
			</div>

			<a
				href={episodeHref}
				class="group/thumb relative block aspect-square w-32 overflow-hidden rounded-2xl bg-indigo-50 shadow-md @md:w-40 @xl:w-72 @xl:rounded-3xl @3xl:w-80"
				aria-label="{isCompleted ? 'Replay' : 'Play'} {displayTitle}"
			>
				{#if episode.coverImage}
					<img
						src={episode.coverImage}
						alt=""
						loading="lazy"
						class="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
					/>
				{/if}

				<div
					class="absolute inset-0 flex items-center justify-center bg-slate-900/10 transition-colors group-hover/thumb:bg-slate-900/20"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-slate-900/40 text-white shadow-xl backdrop-blur-md transition-all duration-200 group-hover/thumb:scale-110 group-hover/thumb:bg-indigo-600/90 @xl:h-20 @xl:w-20"
					>
						{#if isCompleted}
							<RotateCcw class="h-5 w-5 stroke-[2.5] text-white @xl:h-8 @xl:w-8" />
						{:else}
							<Play class="h-5 w-5 translate-x-0.5 fill-white text-white @xl:h-8 @xl:w-8" />
						{/if}
					</div>
				</div>
			</a>
		</div>
	</div>
</article>
