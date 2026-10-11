<script lang="ts">
	import { resolve } from '$app/paths';
	import { Flame, Bookmark, ChevronRight } from 'lucide-svelte';
	import type { StreakStats } from '$lib/types';

	interface Props {
		streakStats: StreakStats;
	}

	let { streakStats }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-3">
	<a
		href={resolve('/streak')}
		class="shadow-card flex items-center justify-between rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 transition-colors hover:bg-amber-50"
	>
		<div class="flex items-center gap-2.5">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
				<Flame size={18} strokeWidth={2.25} />
			</div>
			<div>
				<span class="block font-headline text-xs font-bold text-slate-900">Streak Tier</span>
				<span class="font-sans text-[10px] text-slate-500">{streakStats.tierName}</span>
			</div>
		</div>
		<ChevronRight size={16} strokeWidth={2} class="text-slate-400" />
	</a>

	<a
		href={resolve('/saved')}
		class="shadow-card flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-slate-50"
	>
		<div class="flex items-center gap-2.5">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
				<Bookmark size={18} strokeWidth={2.25} />
			</div>
			<div>
				<span class="block font-headline text-xs font-bold text-slate-900">Saved Words</span>
				<span class="font-sans text-[10px] text-slate-500">Bookmarked terms</span>
			</div>
		</div>
		<ChevronRight size={16} strokeWidth={2} class="text-slate-400" />
	</a>
</div>
