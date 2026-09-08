<script lang="ts">
	let {
		value = 0,
		max = 100,
		variant = 'primary',
		height = 'h-2.5',
		showLabel = false
	} = $props<{
		value?: number;
		max?: number;
		variant?: 'primary' | 'secondary' | 'tertiary' | 'emerald';
		height?: string;
		showLabel?: boolean;
	}>();

	let percentage = $derived(max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0);

	let colorClasses = $derived(() => {
		switch (variant) {
			case 'secondary':
				return 'bg-secondary';
			case 'tertiary':
			case 'emerald':
				return 'bg-tertiary-container';
			case 'primary':
			default:
				return 'bg-primary-container';
		}
	});
</script>

<div class="w-full">
	{#if showLabel}
		<div class="mb-1 flex justify-between text-xs font-semibold text-on-surface-variant">
			<span>{value} / {max}</span>
			<span>{percentage}%</span>
		</div>
	{/if}
	<div class="w-full overflow-hidden rounded-full bg-surface-container-highest/60 {height}">
		<div
			class="{colorClasses()} h-full rounded-full transition-all duration-300 ease-out"
			style="width: {percentage}%"
		></div>
	</div>
</div>
