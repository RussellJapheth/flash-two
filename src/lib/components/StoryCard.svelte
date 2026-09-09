<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Story, StoryCompletionRecord } from '$lib/types';
	import { Mic, MicOff, Clock, Sparkles, Star, ChevronRight, Play } from 'lucide-svelte';

	let {
		story,
		progress = null,
		speechSupported = true
	} = $props<{
		story: Story;
		progress?: StoryCompletionRecord | null;
		speechSupported?: boolean;
	}>();

	let difficultyStyles = $derived(() => {
		switch (story.difficulty) {
			case 'Beginner':
				return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
			case 'Intermediate':
				return 'bg-amber-50 text-amber-700 border-amber-200/80';
			case 'Advanced':
				return 'bg-rose-50 text-rose-700 border-rose-200/80';
			default:
				return 'bg-slate-100 text-slate-700 border-slate-200';
		}
	});

	let stars = $derived(progress?.stars || 0);
	let timesPlayed = $derived(progress?.timesPlayed || 0);
	let isCompleted = $derived(timesPlayed > 0);
</script>

<div
	class="group shadow-card hover:shadow-card-hover relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:border-indigo-200"
>
	<!-- Card Header with Cover Backdrop Preview -->
	<div class="relative h-28 w-full overflow-hidden rounded-2xl bg-slate-900">
		<img
			src={story.coverImageUrl}
			alt={story.title}
			class="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
		/>
		<div
			class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"
		></div>

		<!-- Top Badges -->
		<div class="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between">
			<!-- Language Pill -->
			<span
				class="rounded-full px-2.5 py-0.5 font-headline text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-md {story.language ===
				'chinese'
					? 'border border-indigo-200/60 bg-indigo-600/90 text-white'
					: 'border border-amber-200/60 bg-amber-600/90 text-white'}"
			>
				{story.language === 'chinese' ? '🇨🇳 Chinese' : '🇫🇷 French'}
			</span>

			<!-- Difficulty Badge -->
			<span
				class="rounded-full border px-2.5 py-0.5 font-headline text-[10px] font-extrabold backdrop-blur-md {difficultyStyles()}"
			>
				{story.difficulty}
			</span>
		</div>

		<!-- Bottom Over-Image Info -->
		<div class="absolute right-3 bottom-2.5 left-3 flex items-center justify-between">
			<div class="flex items-center gap-1.5 text-xs font-semibold text-white/90">
				<Clock size={13} strokeWidth={2.5} class="text-white/80" />
				<span>~{story.durationMinutes} min</span>
			</div>

			<div
				class="inline-flex items-center gap-1 rounded-full bg-indigo-500/80 px-2 py-0.5 font-headline text-[10px] font-extrabold text-white backdrop-blur-xs"
			>
				<Sparkles size={11} />
				<span>+{story.baseXP} XP</span>
			</div>
		</div>
	</div>

	<!-- Content Body -->
	<div class="pt-3.5 pb-1">
		<div class="flex items-start justify-between gap-2">
			<div>
				<h3 class="font-headline text-base font-extrabold text-slate-900 transition-colors">
					{story.title}
				</h3>
				<p class="mt-0.5 font-sans text-xs leading-relaxed text-slate-500">
					{story.subtitle}
				</p>
			</div>
		</div>

		<!-- Meta Pills (Voice mode + Star rating) -->
		<div
			class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3"
		>
			<div class="flex items-center gap-1.5">
				{#if speechSupported}
					<span
						class="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-1 font-headline text-[10px] font-bold text-indigo-700"
					>
						<Mic size={12} strokeWidth={2.5} class="text-indigo-600" />
						<span>Voice Checkpoints</span>
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 font-headline text-[10px] font-bold text-slate-600"
					>
						<MicOff size={12} strokeWidth={2} class="text-slate-400" />
						<span>Tap Mode</span>
					</span>
				{/if}

				{#if isCompleted}
					<div class="flex items-center gap-0.5 pl-1">
						{#each [1, 2, 3] as s (s)}
							<Star
								size={13}
								class={s <= stars
									? 'fill-amber-400 text-amber-400'
									: 'fill-slate-200 text-slate-200'}
							/>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Action CTA -->
			<a
				href={resolve(`/story/${story.id}`)}
				class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-indigo-600 px-3.5 py-1.5 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
			>
				{#if isCompleted}
					<span>Replay</span>
					<ChevronRight size={14} strokeWidth={2.5} />
				{:else}
					<Play size={12} class="fill-white" />
					<span>Start</span>
				{/if}
			</a>
		</div>
	</div>
</div>
