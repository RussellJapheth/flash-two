<script lang="ts">
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { resolve } from '$app/paths';
	import type { XPStats } from '$lib/types';
	import { Sparkles, Trophy, ChevronRight } from 'lucide-svelte';

	interface Props {
		xpStats: XPStats;
		leaderboardsDisabled: boolean;
	}

	let { xpStats, leaderboardsDisabled }: Props = $props();
</script>

<section class="shadow-card space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border px-2.5 py-0.5 font-headline text-[11px] font-bold {xpStats.theme
					.badgeBg} {xpStats.theme.badgeText} {xpStats.theme.badgeBorder}"
			>
				LEVEL {xpStats.level}
			</span>
			<p class="font-headline text-xs font-bold text-slate-500">{xpStats.levelTitle}</p>
		</div>

		{#if !leaderboardsDisabled}
			<a
				href={resolve('/leaderboard')}
				class="flex items-center gap-1 rounded-2xl border border-amber-200/80 bg-amber-50 px-3 py-1.5 font-headline text-xs font-bold text-amber-900 shadow-xs transition-colors hover:bg-amber-100"
			>
				<Trophy size={14} strokeWidth={2.25} class="text-amber-600" />
				<span>Leaderboard</span>
				<ChevronRight size={13} strokeWidth={2.5} class="text-amber-700" />
			</a>
		{/if}
	</div>

	<div class="flex items-center gap-3">
		<div
			class="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-600"
		>
			<Sparkles size={22} strokeWidth={2} />
		</div>
		<div>
			<p class="font-headline text-2xl font-black text-slate-900">
				{xpStats.totalXP.toLocaleString()}
				<span class="text-sm font-bold text-slate-500">XP</span>
			</p>
		</div>
	</div>

	<div class="space-y-1.5">
		<div class="flex justify-between text-xs font-medium text-slate-500">
			<span>Progress to Level {xpStats.level + 1}</span>
			<span class="font-semibold text-slate-700">{xpStats.progressInLevelPercent}%</span>
		</div>
		<ProgressBar
			value={xpStats.totalXP - xpStats.currentLevelXP}
			max={xpStats.nextLevelXP - xpStats.currentLevelXP}
			variant="amber"
			height="h-2.5"
		/>
		<div class="flex justify-between text-[11px] text-slate-400">
			<span>{xpStats.currentLevelXP} XP</span>
			<span>{xpStats.nextLevelXP - xpStats.totalXP} XP needed</span>
			<span>{xpStats.nextLevelXP} XP</span>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3">
		<div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
			<p class="font-headline text-lg font-black text-indigo-600">
				{xpStats.weeklyXP.toLocaleString()}
			</p>
			<p class="text-[11px] font-bold text-slate-500">This Week's XP</p>
		</div>
		<div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
			<p class="font-headline text-lg font-black text-amber-600">
				{xpStats.monthlyXP.toLocaleString()}
			</p>
			<p class="text-[11px] font-bold text-slate-500">This Month's XP</p>
		</div>
	</div>
</section>
