<script lang="ts">
	import { Play, Pause, RotateCcw, FastForward, Gauge } from 'lucide-svelte';

	let {
		currentTime = 0,
		duration = 0,
		isPlaying = false,
		playbackRate = 1.0,
		onTogglePlay,
		onSeek,
		onChangeRate,
		onSkip
	} = $props<{
		currentTime: number;
		duration: number;
		isPlaying: boolean;
		playbackRate: number;
		onTogglePlay: () => void;
		onSeek: (time: number) => void;
		onChangeRate: (rate: number) => void;
		onSkip: (deltaSeconds: number) => void;
	}>();

	const SPEED_OPTIONS = [0.8, 1.0, 1.25, 1.5];

	function formatTime(sec: number): string {
		if (!Number.isFinite(sec) || sec < 0) return '0:00';
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	}

	function handleSliderInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const val = parseFloat(target.value);
		if (Number.isFinite(val)) {
			onSeek(val);
		}
	}

	function cycleSpeed() {
		const idx = SPEED_OPTIONS.indexOf(playbackRate);
		const nextIdx = (idx + 1) % SPEED_OPTIONS.length;
		onChangeRate(SPEED_OPTIONS[nextIdx]);
	}
</script>

<div
	class="fixed right-0 bottom-0 left-0 z-30 mx-auto w-full border-t border-slate-200/90 bg-white/95 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-xl backdrop-blur-md sm:max-w-md"
>
	<!-- Scrubber Bar -->
	<div class="mb-3 flex items-center gap-2">
		<span class="w-10 text-right font-mono text-[11px] font-semibold text-slate-500">
			{formatTime(currentTime)}
		</span>

		<div class="relative flex flex-1 items-center">
			<input
				type="range"
				min="0"
				max={duration || 100}
				step="0.1"
				value={currentTime}
				oninput={handleSliderInput}
				aria-label="Audio scrubber"
				class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 focus:outline-none"
			/>
		</div>

		<span class="w-10 text-left font-mono text-[11px] font-semibold text-slate-400">
			{formatTime(duration)}
		</span>
	</div>

	<!-- Playback Buttons Row -->
	<div class="flex items-center justify-between">
		<!-- Speed Selector -->
		<button
			type="button"
			onclick={cycleSpeed}
			class="flex h-10 items-center gap-1 rounded-xl bg-slate-100 px-3 font-headline text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
			title="Playback speed"
			aria-label="Change playback speed"
		>
			<Gauge class="h-3.5 w-3.5 text-slate-500" />
			<span>{playbackRate}x</span>
		</button>

		<!-- Main Transport Controls -->
		<div class="flex items-center gap-3">
			<!-- Rewind 5s -->
			<button
				type="button"
				onclick={() => onSkip(-5)}
				class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90"
				title="Rewind 5 seconds"
				aria-label="Rewind 5 seconds"
			>
				<RotateCcw class="h-5 w-5" />
			</button>

			<!-- Play / Pause Button -->
			<button
				type="button"
				onclick={onTogglePlay}
				class="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-transform hover:bg-indigo-700 active:scale-95"
				title={isPlaying ? 'Pause' : 'Play'}
				aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
			>
				{#if isPlaying}
					<Pause class="h-6 w-6 fill-white" />
				{:else}
					<Play class="h-6 w-6 translate-x-0.5 fill-white" />
				{/if}
			</button>

			<!-- Forward 10s -->
			<button
				type="button"
				onclick={() => onSkip(10)}
				class="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90"
				title="Forward 10 seconds"
				aria-label="Forward 10 seconds"
			>
				<FastForward class="h-5 w-5" />
			</button>
		</div>

		<!-- Spacer placeholder for visual balance -->
		<div class="w-14"></div>
	</div>
</div>
