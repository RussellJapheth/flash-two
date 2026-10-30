<script lang="ts">
	import type { PodcastSegment, PodcastWord } from '$lib/types';
	import { Play } from 'lucide-svelte';

	let {
		segments = [],
		currentTime = 0,
		showPinyin = true,
		showTranslation = true,
		onSeek,
		onSelectWord
	} = $props<{
		segments: PodcastSegment[];
		currentTime: number;
		showPinyin: boolean;
		showTranslation: boolean;
		onSeek: (time: number) => void;
		onSelectWord: (word: {
			hanzi: string;
			pinyin?: string;
			english?: string;
			context?: string;
		}) => void;
	}>();

	let containerEl = $state<HTMLDivElement | null>(null);
	// 180ms perceptual lead time aligns highlight with sound onset rather than trailing behind
	const SYNC_LEAD_SEC = 0.18;
	let syncTime = $derived(currentTime + SYNC_LEAD_SEC);
	let activeIndex = $derived(
		segments.findIndex((s: PodcastSegment) => syncTime >= s.start && syncTime < s.end)
	);

	let lastScrolledIndex = -1;

	$effect(() => {
		if (activeIndex >= 0 && activeIndex !== lastScrolledIndex && containerEl) {
			lastScrolledIndex = activeIndex;
			const targetEl = containerEl.querySelector(`[data-segment-index="${activeIndex}"]`);
			if (targetEl) {
				targetEl.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				});
			}
		}
	});

	function handleWordClick(e: MouseEvent, word: PodcastWord, context: string) {
		e.stopPropagation();
		onSeek(word.start);
		onSelectWord({
			hanzi: word.word,
			pinyin: word.pinyin,
			english: word.en,
			context
		});
	}
</script>

<div
	bind:this={containerEl}
	class="flex flex-col gap-3.5 px-1 pt-2 pb-36"
	aria-label="Podcast live transcript"
>
	{#each segments as segment, idx (segment.id)}
		{@const isActive = idx === activeIndex}

		<div
			data-segment-index={idx}
			class="relative cursor-pointer rounded-2xl p-4 transition-all duration-300 {isActive
				? 'border-2 border-indigo-400/90 bg-indigo-50/90 shadow-md ring-4 ring-indigo-50/50'
				: 'shadow-card border border-slate-200/80 bg-white hover:border-indigo-200 hover:bg-slate-50/50'}"
			onclick={() => onSeek(segment.start)}
			onkeydown={(e) => e.key === 'Enter' && onSeek(segment.start)}
			role="button"
			tabindex="0"
			aria-label={`Jump to ${segment.speakerName} dialogue at ${segment.start}s`}
		>
			<!-- Speaker Header -->
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full text-sm {isActive
							? 'bg-indigo-600 text-white shadow-sm'
							: 'bg-slate-100 text-slate-700'}"
					>
						{segment.speakerAvatar || '👤'}
					</span>
					<span
						class="font-headline text-xs font-bold {isActive
							? 'font-extrabold text-indigo-900'
							: 'text-slate-800'}"
					>
						{segment.speakerName}
					</span>
				</div>

				<div class="flex items-center gap-2">
					{#if isActive}
						<span
							class="inline-flex animate-pulse items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase"
						>
							Speaking
						</span>
					{/if}
					<span class="font-mono text-[11px] font-medium text-slate-400">
						{Math.floor(segment.start / 60)}:{Math.floor(segment.start % 60) < 10
							? '0'
							: ''}{Math.floor(segment.start % 60)}
					</span>
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							onSeek(segment.start);
						}}
						class="flex h-6 w-6 items-center justify-center rounded-full text-indigo-600 transition hover:bg-indigo-100 active:scale-90"
						title="Play from this turn"
						aria-label="Play from this turn"
					>
						<Play class="h-3 w-3 translate-x-0.25 fill-indigo-600 text-indigo-600" />
					</button>
				</div>
			</div>

			<!-- Chinese Text Content & Word Highlights -->
			<div class="mb-1 text-left leading-relaxed">
				{#if segment.words && segment.words.length > 0}
					<div class="flex flex-wrap items-baseline gap-x-1 gap-y-2">
						{#each segment.words as word (word.word + word.start)}
							{@const isWordActive = isActive && syncTime >= word.start && syncTime < word.end}
							{@const isPunct = /^[，。！？、,.!?…—\s]+$/.test(word.word)}

							{#if isPunct}
								<span class="self-end pb-1 text-base font-bold text-slate-400 select-none">
									{word.word}
								</span>
							{:else}
								<button
									type="button"
									onclick={(e) => handleWordClick(e, word, segment.text)}
									class="group/word inline-flex flex-col items-center rounded-lg px-1.5 py-0.5 text-left transition-all active:scale-95 {isWordActive
										? 'bg-indigo-600 text-white shadow-sm'
										: 'hover:bg-indigo-100/70 hover:text-indigo-900'}"
									title={`Lookup: ${word.word}`}
									aria-label={`Lookup word ${word.word}`}
								>
									{#if showPinyin && word.pinyin}
										<span
											class="font-mono text-[11px] font-medium transition-colors {isWordActive
												? 'text-indigo-100'
												: 'text-indigo-600/80'}"
										>
											{word.pinyin}
										</span>
									{/if}
									<span
										class="text-base font-bold transition-colors {isWordActive
											? 'text-white'
											: isActive
												? 'text-slate-900'
												: 'text-slate-800'}"
									>
										{word.word}
									</span>
								</button>
							{/if}
						{/each}
					</div>
				{:else}
					<!-- Fallback full sentence text -->
					<div>
						{#if showPinyin && segment.pinyin}
							<p class="mb-0.5 font-mono text-xs font-medium text-indigo-600/80">
								{segment.pinyin}
							</p>
						{/if}
						<p class="text-base font-bold text-slate-900">{segment.text}</p>
					</div>
				{/if}
			</div>

			<!-- English Translation -->
			{#if showTranslation && segment.en}
				<p
					class="mt-2 border-t border-slate-100/80 pt-1.5 text-xs leading-normal font-normal text-slate-500"
				>
					{segment.en}
				</p>
			{/if}
		</div>
	{/each}
</div>
