<script lang="ts">
	interface ActivityItem {
		day: string;
		count: number;
		isToday: boolean;
	}

	interface Props {
		weeklyActivity: ActivityItem[];
	}

	let { weeklyActivity }: Props = $props();

	let maxActivityCount = $derived(Math.max(1, ...weeklyActivity.map((a) => a.count)));
</script>

<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
	<div class="flex items-center justify-between">
		<h3 class="font-headline text-sm font-bold text-slate-900">7-Day Study Activity</h3>
		<span class="font-headline text-xs font-semibold text-slate-500">Cards per day</span>
	</div>

	<div class="flex h-36 items-end justify-between gap-2 pt-4">
		{#each weeklyActivity as item (item.day)}
			{@const barHeight = Math.max(8, Math.round((item.count / maxActivityCount) * 100))}
			<div class="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
				<span class="font-headline text-[10px] font-bold text-slate-600">{item.count}</span>
				<div
					class="flex h-24 w-full max-w-[28px] items-end overflow-hidden rounded-t-xl bg-slate-100"
				>
					<div
						class="w-full rounded-t-xl transition-all duration-300 {item.isToday
							? 'bg-indigo-600'
							: 'bg-indigo-200'}"
						style="height: {barHeight}%"
					></div>
				</div>
				<span
					class="font-headline text-[11px] font-bold {item.isToday
						? 'text-indigo-600'
						: 'text-slate-500'}"
				>
					{item.day}
				</span>
			</div>
		{/each}
	</div>
</section>
