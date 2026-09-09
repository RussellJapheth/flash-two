<script lang="ts">
	interface Props {
		id: string;
		type: 'term' | 'meaning';
		text: string;
		subtext?: string;
		isFlipped: boolean;
		isMatched: boolean;
		isMismatch: boolean;
		isHinted: boolean;
		isAudioBlind?: boolean;
		disabled?: boolean;
		onSelect: (id: string, event: MouseEvent | KeyboardEvent) => void;
	}

	let {
		id,
		type,
		text,
		subtext = '',
		isFlipped,
		isMatched,
		isMismatch,
		isHinted,
		isAudioBlind = false,
		disabled = false,
		onSelect
	}: Props = $props();

	function handleClick(e: MouseEvent) {
		if (disabled || isMatched) return;
		onSelect(id, e);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled || isMatched) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(id, e);
		}
	}
</script>

<div
	class="perspective-container relative h-24 w-full select-none sm:h-28"
	class:opacity-0={isMatched}
	class:pointer-events-none={isMatched}
>
	<button
		type="button"
		class="card-3d transform-style-3d relative h-full w-full cursor-pointer rounded-2xl transition-all duration-300 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-indigo-500"
		class:is-flipped={isFlipped || isMatched}
		class:animate-shake={isMismatch}
		class:animate-pulse-hint={isHinted && !isFlipped && !isMatched}
		class:scale-95={isMismatch}
		aria-label="{type === 'term' ? 'Term tile' : 'Definition tile'}: {isFlipped
			? text
			: 'Hidden card'}"
		tabindex={isMatched ? -1 : 0}
		onclick={handleClick}
		onkeydown={handleKeyDown}
	>
		<!-- Card Back Face (Hidden Face before flip) -->
		<div
			class="card-face card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200/85 bg-linear-to-b from-white via-slate-50 to-indigo-50/35 p-3 shadow-xs transition-all duration-200 backface-hidden hover:border-indigo-300 hover:shadow-md active:scale-97"
		>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100/80 bg-linear-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-2xs"
			>
				<span class="font-mono text-sm font-black tracking-widest text-indigo-500">?</span>
			</div>
		</div>

		<!-- Card Front Face (Revealed Face after flip) -->
		<div
			class="card-face card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 p-3 shadow-sm backface-hidden {isMatched
				? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 shadow-emerald-100'
				: isMismatch
					? 'border-rose-300 bg-rose-50/90 text-rose-900 shadow-rose-100'
					: isFlipped
						? type === 'term'
							? 'border-indigo-300 bg-linear-to-b from-white via-indigo-50/50 to-purple-50/30'
							: 'border-teal-300 bg-linear-to-b from-white via-teal-50/50 to-sky-50/30'
						: 'border-slate-200 bg-white'}"
		>
			<!-- Specular lighting foil shine -->
			<div
				class="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-tr from-white/60 via-transparent to-white/30 opacity-70"
			></div>

			{#if isAudioBlind && type === 'term' && !isFlipped}
				<div class="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
					<span>🔊 Listen</span>
				</div>
			{:else}
				<span
					class="line-clamp-2 text-center leading-tight font-extrabold tracking-tight text-slate-900 {type ===
					'term'
						? 'font-serif text-xl text-slate-900 sm:text-2xl'
						: 'font-sans text-xs text-slate-800 sm:text-sm'}"
				>
					{text}
				</span>
				{#if subtext}
					<span class="mt-1 line-clamp-1 text-[11px] font-bold text-indigo-600">
						{subtext}
					</span>
				{/if}
			{/if}
		</div>
	</button>
</div>

<style>
	.perspective-container {
		perspective: 1000px;
		transition:
			opacity 0.35s ease-out,
			transform 0.35s ease-out;
	}

	.transform-style-3d {
		transform-style: preserve-3d;
	}

	.backface-hidden {
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.card-3d {
		transform: rotateY(0deg);
		will-change: transform;
	}

	.card-3d.is-flipped {
		transform: rotateY(180deg);
	}

	.card-back {
		transform: rotateY(0deg);
	}

	.card-front {
		transform: rotateY(180deg);
	}

	@keyframes shake {
		0%,
		100% {
			transform: rotateY(180deg) translateX(0);
		}
		20%,
		60% {
			transform: rotateY(180deg) translateX(-5px);
		}
		40%,
		80% {
			transform: rotateY(180deg) translateX(5px);
		}
	}

	@keyframes pulseHint {
		0%,
		100% {
			transform: rotateY(0deg) scale(1);
			box-shadow: 0 0 0 rgba(79, 70, 229, 0);
		}
		50% {
			transform: rotateY(10deg) scale(1.03);
			box-shadow: 0 0 16px rgba(79, 70, 229, 0.4);
		}
	}

	.animate-shake {
		animation: shake 0.35s ease-in-out;
	}

	.animate-pulse-hint {
		animation: pulseHint 1.2s ease-in-out infinite;
	}
</style>
