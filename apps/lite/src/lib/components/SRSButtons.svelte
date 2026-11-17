<script lang="ts">
	import type { StudyRating } from '@flash/shared';

	let { onRate = () => {}, disabled = false } = $props<{
		onRate?: (rating: StudyRating) => void;
		disabled?: boolean;
	}>();

	function handleSelect(rating: StudyRating) {
		if (disabled) return;
		onRate(rating);
	}
</script>

<div class="w-full">
	<div class="grid grid-cols-2 gap-3">
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('again')}
			class="flex h-14 cursor-pointer items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 font-headline text-base font-bold text-rose-600 transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-50"
		>
			Wrong
		</button>

		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('good')}
			class="flex h-14 cursor-pointer items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 font-headline text-base font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
		>
			Correct
		</button>
	</div>
</div>
