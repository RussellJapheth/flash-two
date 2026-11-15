<script lang="ts">
	import { resolve } from '$app/paths';
	import { setLiteMode } from '$lib/utils/liteMode';
	import { Sparkles, ArrowLeft } from 'lucide-svelte';

	function handleEnableFullMode() {
		setLiteMode(false);
	}
</script>

<div
	role="region"
	aria-label="Full mode required"
	class="border-b border-indigo-200/90 bg-indigo-50/95 px-4 py-3 backdrop-blur-xs"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex items-start gap-2.5">
			<div
				class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs"
			>
				<Sparkles size={15} strokeWidth={2.25} />
			</div>
			<div>
				<h4 class="font-headline text-xs font-extrabold text-indigo-950">Full Mode Feature</h4>
				<p class="font-sans text-[11px] leading-tight text-indigo-700">
					You are in Lite Mode (flashcards only). Enable Full Mode to unlock textbooks, podcasts,
					arcade games, stories, and sentence drills.
				</p>
			</div>
		</div>
	</div>

	<div class="mt-2.5 flex items-center gap-2 pl-9">
		<button
			type="button"
			onclick={handleEnableFullMode}
			class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
		>
			<Sparkles size={13} strokeWidth={2.5} />
			<span>Enable Full Mode</span>
		</button>

		<a
			href={resolve('/decks')}
			class="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-headline text-xs font-bold text-indigo-800 transition-colors hover:bg-indigo-100/70 hover:text-indigo-950 active:scale-95"
		>
			<ArrowLeft size={13} strokeWidth={2.5} />
			<span>Back to Decks</span>
		</a>
	</div>
</div>

