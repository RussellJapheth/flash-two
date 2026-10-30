<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { BUILTIN_PODCASTS } from '$lib/data/podcasts';
	import type { PodcastEpisode, PodcastProgress } from '$lib/types';
	import {
		getPodcastProgress,
		updatePodcastPlaybackPosition,
		savePodcastCompletion
	} from '$lib/utils/podcastStorage';
	import { playSound } from '$lib/utils/audio';
	import { triggerAutoStartStudyTimer, triggerAutoStopStudyTimer } from '$lib/utils/studyTimer';
	import AudioPlayerBar from '$lib/components/podcast/AudioPlayerBar.svelte';
	import TranscriptView from '$lib/components/podcast/TranscriptView.svelte';
	import WordLookupModal from '$lib/components/WordLookupModal.svelte';
	import { ArrowLeft, Languages, Type, Sparkles, CheckCircle2, RotateCcw } from 'lucide-svelte';

	let episodeId = $derived(page.params.id);
	let episode = $derived<PodcastEpisode | undefined>(
		BUILTIN_PODCASTS.find((p) => p.id === episodeId)
	);

	let audioEl = $state<HTMLAudioElement | null>(null);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let playbackRate = $state(1.0);
	let duration = $state(0);

	let showPinyin = $state(true);
	let showTranslation = $state(true);

	// Word Lookup State
	let selectedWord = $state<{
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	} | null>(null);

	// Completion Modal State
	let showCompletionModal = $state(false);
	let earnedXP = $state(0);
	let hasAwardedThisSession = $state(false);

	let progressRecord = $state<PodcastProgress | null>(null);

	onMount(() => {
		if (episode) {
			duration = episode.duration;
			progressRecord = getPodcastProgress(episode.id);
			if (progressRecord && progressRecord.lastPositionSec > 0 && !progressRecord.completed) {
				currentTime = progressRecord.lastPositionSec;
				if (audioEl) {
					audioEl.currentTime = progressRecord.lastPositionSec;
				}
			}
		}
	});

	onDestroy(() => {
		triggerAutoStopStudyTimer();
		if (episode && currentTime > 0) {
			updatePodcastPlaybackPosition(episode.id, currentTime);
		}
	});

	function handleTimeUpdate() {
		if (!audioEl) return;
		currentTime = audioEl.currentTime;

		// Save position periodically (every ~3s)
		if (episode && Math.floor(currentTime) % 3 === 0) {
			updatePodcastPlaybackPosition(episode.id, currentTime);
		}

		// Trigger completion when audio reaches 95%
		if (episode && duration > 0 && currentTime >= duration * 0.95 && !hasAwardedThisSession) {
			completeEpisode();
		}
	}

	function handlePlay() {
		isPlaying = true;
		triggerAutoStartStudyTimer();
	}

	function handlePause() {
		isPlaying = false;
		triggerAutoStopStudyTimer();
		if (episode) {
			updatePodcastPlaybackPosition(episode.id, currentTime);
		}
	}

	function handleEnded() {
		isPlaying = false;
		triggerAutoStopStudyTimer();
		if (episode && !hasAwardedThisSession) {
			completeEpisode();
		}
	}

	function completeEpisode() {
		if (!episode) return;
		hasAwardedThisSession = true;
		const result = savePodcastCompletion(episode.id, episode.xpReward);
		earnedXP = result.xpAwarded;
		progressRecord = result.progress;
		playSound('milestone');
		showCompletionModal = true;
	}

	function togglePlay() {
		if (!audioEl) return;
		if (isPlaying) {
			audioEl.pause();
		} else {
			audioEl.play().catch((err) => {
				console.error('Audio playback failed:', err);
			});
		}
	}

	function handleSeek(targetSec: number, autoPlay: boolean = true) {
		if (!audioEl) return;
		const clamped = Math.max(0, Math.min(duration || 1000, targetSec));
		audioEl.currentTime = clamped;
		currentTime = clamped;
		if (autoPlay) {
			audioEl.play().catch((err) => {
				console.error('Audio playback failed:', err);
			});
		}
	}

	function handleSkip(delta: number) {
		if (!audioEl) return;
		handleSeek(audioEl.currentTime + delta, isPlaying);
	}

	function handleChangeRate(newRate: number) {
		playbackRate = newRate;
		if (audioEl) {
			audioEl.playbackRate = newRate;
		}
	}

	function handleSelectWord(word: {
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	}) {
		selectedWord = word;
	}
</script>

<div class="min-h-screen bg-slate-50 text-slate-900">
	<div class="mx-auto flex min-h-screen flex-col sm:max-w-md sm:bg-white sm:shadow-lg">
		{#if !episode}
			<div class="p-8 text-center">
				<p class="font-headline text-lg font-bold text-slate-800">Episode not found</p>
				<button
					type="button"
					onclick={() => goto(resolve('/podcasts'))}
					class="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
				>
					Return to Podcasts
				</button>
			</div>
		{:else}
			<!-- Hidden Audio Element -->
			<audio
				bind:this={audioEl}
				src={episode.audioUrl}
				preload="metadata"
				ontimeupdate={handleTimeUpdate}
				onplay={handlePlay}
				onpause={handlePause}
				onended={handleEnded}
			></audio>

			<!-- Sticky Top Header -->
			<header
				class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md"
			>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => history.back()}
						class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:scale-95"
						title="Go back"
						aria-label="Go back"
					>
						<ArrowLeft class="h-5 w-5" />
					</button>

					<div class="max-w-[170px] truncate">
						<h1 class="truncate font-headline text-sm font-black text-slate-900">
							{episode.title}
						</h1>
						<p class="truncate font-mono text-[10px] font-medium text-indigo-600">
							{episode.titlePinyin}
						</p>
					</div>
				</div>

				<!-- Quick Display Toggles -->
				<div class="flex items-center gap-1.5">
					<!-- Pinyin Toggle -->
					<button
						type="button"
						onclick={() => (showPinyin = !showPinyin)}
						class="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold transition-all {showPinyin
							? 'bg-indigo-100 text-indigo-700'
							: 'bg-slate-100 text-slate-400'}"
						title={showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
						aria-label="Toggle Pinyin"
					>
						<Type class="h-3.5 w-3.5" />
						<span class="font-mono text-[11px]">拼</span>
					</button>

					<!-- Translation Toggle -->
					<button
						type="button"
						onclick={() => (showTranslation = !showTranslation)}
						class="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-bold transition-all {showTranslation
							? 'bg-indigo-100 text-indigo-700'
							: 'bg-slate-100 text-slate-400'}"
						title={showTranslation ? 'Hide English' : 'Show English'}
						aria-label="Toggle English Translation"
					>
						<Languages class="h-3.5 w-3.5" />
						<span>EN</span>
					</button>
				</div>
			</header>

			<!-- Main Transcript Immersion Area -->
			<main class="flex-1 px-4 py-3">
				<!-- Episode Intro Pill Row -->
				<div
					class="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2"
				>
					<div class="flex items-center gap-1.5">
						{#each episode.speakers as speaker (speaker.id)}
							<span
								class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
							>
								<span>{speaker.avatarEmoji || '👤'}</span>
								<span>{speaker.name}</span>
							</span>
						{/each}
					</div>

					<span class="flex items-center gap-1 font-headline text-[11px] font-bold text-amber-700">
						<Sparkles class="h-3.5 w-3.5 text-amber-500" />
						+{episode.xpReward} XP
					</span>
				</div>

				<!-- Live Synchronized Transcript -->
				<TranscriptView
					segments={episode.segments}
					{currentTime}
					{showPinyin}
					{showTranslation}
					onSeek={(t) => handleSeek(t, true)}
					onSelectWord={handleSelectWord}
				/>
			</main>

			<!-- Docked Floating Audio Player Bar -->
			<AudioPlayerBar
				{currentTime}
				duration={episode.duration}
				{isPlaying}
				{playbackRate}
				onTogglePlay={togglePlay}
				onSeek={(t) => handleSeek(t, isPlaying)}
				onChangeRate={handleChangeRate}
				onSkip={handleSkip}
			/>
		{/if}

		<!-- Word Lookup Drawer / Modal -->
		{#if selectedWord}
			<WordLookupModal word={selectedWord} onClose={() => (selectedWord = null)} />
		{/if}

		<!-- Episode Completion Celebration Modal -->
		{#if showCompletionModal}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
			>
				<div
					class="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl duration-200"
				>
					<div
						class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner"
					>
						<CheckCircle2 class="h-9 w-9 text-emerald-500" />
					</div>

					<h2 class="font-headline text-xl font-black text-slate-900">Episode Completed!</h2>
					<p class="mt-1 text-xs text-slate-500">
						Great listening workout! Your comprehension is growing.
					</p>

					<!-- XP Award Pill -->
					<div
						class="mx-auto my-4 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 font-headline text-base font-black text-amber-800 shadow-sm"
					>
						<Sparkles class="h-5 w-5 text-amber-500" />
						<span>+{earnedXP} XP Earned</span>
					</div>

					<div class="mt-5 flex flex-col gap-2">
						<button
							type="button"
							onclick={() => {
								showCompletionModal = false;
								handleSeek(0);
							}}
							class="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 font-headline text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
						>
							<RotateCcw class="h-4 w-4" />
							<span>Listen Again</span>
						</button>

						<button
							type="button"
							onclick={() => goto(resolve('/podcasts'))}
							class="flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-600 font-headline text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95"
						>
							Back to All Episodes
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
