<script lang="ts">
	let {
		value = 0,
		max = 100,
		variant = 'primary',
		height = 'h-2',
		showLabel = false
	} = $props<{
		value?: number;
		max?: number;
		variant?: 'primary' | 'secondary' | 'tertiary' | 'emerald' | 'amber';
		height?: string;
		showLabel?: boolean;
	}>();

	let percentage = $derived(
		max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0
	);

	let fillClass = $derived(() => {
		switch (variant) {
			case 'secondary':
			case 'amber':
				return 'bg-amber-500';
			case 'tertiary':
			case 'emerald':
				return 'bg-emerald-500';
			case 'primary':
			default:
				return 'bg-indigo-600';
		}
	});
</script>

<div class="w-full">
	{#if showLabel}
		<div class="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
			<span>{value} / {max}</span>
			<span class="font-bold text-slate-800">{percentage}%</span>
		</div>
	{/if}
	<div class="w-full overflow-hidden rounded-full bg-slate-100 {height}">
		<div
			class="{fillClass()} h-full rounded-full transition-all duration-500 ease-out"
			style="width: {percentage}%"
		></div>
	</div>
</div>
