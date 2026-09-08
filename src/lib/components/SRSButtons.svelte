<script lang="ts">
	import type { StudyRating } from '$lib/types';
	import { playSound } from '$lib/utils/audio';

	let { onRate = () => {}, disabled = false } = $props<{
		onRate?: (rating: StudyRating, customDays?: number) => void;
		disabled?: boolean;
	}>();

	let showCustomModal = $state(false);
	let customDays = $state(7);

	function handleSelect(rating: StudyRating, days?: number) {
		if (disabled) return;
		if (rating === 'again') {
			playSound('wrong');
		} else {
			playSound('correct');
		}
		onRate(rating, days);
	}

	function handleCustomSubmit() {
		if (customDays > 0) {
			handleSelect('custom', customDays);
			showCustomModal = false;
		}
	}
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

		<!-- Hard (1.2x) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('hard')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-all hover:bg-amber-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Hard</span>
			<span class="text-[10px] font-medium text-amber-600/80">1.2x</span>
		</button>

		<!-- Good (2.5x) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('good')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 disabled:opacity-50 shadow-sm"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Good</span>
			<span class="text-[10px] font-medium text-indigo-500/80">2.5x</span>
		</button>

		<!-- Easy (3.5x) -->
		<button
			type="button"
			{disabled}
			onclick={() => handleSelect('easy')}
			class="flex h-14 flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-50"
		>
			<span class="font-headline text-xs font-bold tracking-tight">Easy</span>
			<span class="text-[10px] font-medium text-emerald-600/80">3.5x</span>
		</button>
	</div>

	<!-- Custom interval trigger -->
	<div class="mt-2 flex justify-center">
		<button
			type="button"
			{disabled}
			onclick={() => (showCustomModal = true)}
			class="text-xs font-semibold text-outline hover:text-primary transition-colors"
		>
			Custom Interval (days)...
		</button>
	</div>

	<!-- Custom Interval Modal -->
	{#if showCustomModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
		>
			<div
				class="w-full max-w-xs rounded-3xl bg-surface-container-lowest p-6 shadow-xl border border-surface-container"
			>
				<h3 class="font-headline text-lg font-bold text-on-surface">Set Custom Interval</h3>
				<p class="mt-1 text-xs text-on-surface-variant">
					Choose how many days until this card is reviewed again:
				</p>

				<div class="my-4 grid grid-cols-4 gap-2">
					{#each [1, 3, 7, 14] as days}
						<button
							type="button"
							onclick={() => (customDays = days)}
							class="rounded-xl py-2 text-xs font-bold transition-all {customDays === days
								? 'bg-primary text-white'
								: 'bg-surface-container text-on-surface hover:bg-surface-container-high'}"
						>
							{days}d
						</button>
					{/each}
				</div>

				<div class="flex items-center gap-2">
					<input
						type="number"
						min="1"
						max="365"
						bind:value={customDays}
						class="w-full rounded-2xl border border-surface-container-highest px-3 py-2 text-center font-headline text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
					/>
					<span class="text-xs font-semibold text-on-surface-variant">days</span>
				</div>

				<div class="mt-5 flex gap-2">
					<button
						type="button"
						onclick={() => (showCustomModal = false)}
						class="flex-1 rounded-full bg-surface-container py-2.5 font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleCustomSubmit}
						class="flex-1 rounded-full bg-primary py-2.5 font-headline text-xs font-bold text-white hover:bg-primary-container"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
