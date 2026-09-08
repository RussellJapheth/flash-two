<script lang="ts">
	import type { StudyRating, WordProgress } from '$lib/types';
	import { calculateNextReview } from '$lib/utils/srs';
	import { playSound } from '$lib/utils/audio';

	let {
		onRate = () => {},
		disabled = false,
		progress = undefined
	} = $props<{
		onRate?: (rating: StudyRating) => void;
		disabled?: boolean;
		progress?: WordProgress;
	}>();

	function handleSelect(rating: StudyRating) {
		if (disabled) return;
		if (rating === 'again') {
			playSound('wrong');
		} else {
			playSound('correct');
		}
		onRate(rating);
	}

	let hardDays = $derived(calculateNextReview(progress, 'hard').interval ?? 1);
	let goodDays = $derived(calculateNextReview(progress, 'good').interval ?? 1);
	let easyDays = $derived(calculateNextReview(progress, 'easy').interval ?? 3);
</script>

<div class="w-full">
	<div class="grid grid-cols-4 gap-2">
		<!-- Again (<10m) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('again')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Again</span>
			<span class="text-[10px] font-medium text-red-500/80">&lt; 10m</span>
		</button>

		<!-- Hard (days) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('hard')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-all hover:bg-amber-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Hard</span>
			<span class="text-[10px] font-medium text-amber-600/80">{hardDays}d</span>
		</button>

		<!-- Good (days) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('good')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-xs transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Good</span>
			<span class="text-[10px] font-medium text-indigo-500/80">{goodDays}d</span>
		</button>

		<!-- Easy (days) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('easy')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Easy</span>
			<span class="text-[10px] font-medium text-emerald-600/80">{easyDays}d</span>
		</button>
	</div>
</div>
