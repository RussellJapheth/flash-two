<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { Gamepad2, Trophy, Sparkles, Swords, Clock } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Games & Leaderboard — FlashCards</title>
</svelte:head>

<TopHeader title="Games" />

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<!-- Hero Header Banner -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<div class="flex items-center gap-3.5">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs"
			>
				<Gamepad2 size={24} strokeWidth={2.25} />
			</div>
			<div>
				<h2 class="font-headline text-lg font-extrabold text-slate-900">Arcade & Challenges</h2>
				<p class="font-sans text-xs text-slate-500">
					Test your vocabulary speed and compete on the global board
				</p>
			</div>
		</div>
	</section>

	<!-- Available Games Section -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Swords size={18} strokeWidth={2} class="text-indigo-600" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Game Modes</h3>
			</div>
			<span
				class="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-indigo-700"
			>
				0 Available
			</span>
		</div>

		<!-- Empty Games List State -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"
		>
			<div
				class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-xs"
			>
				<Gamepad2 size={22} strokeWidth={1.75} />
			</div>
			<h4 class="font-headline text-sm font-bold text-slate-800">No Games Available Yet</h4>
			<p class="mt-1 max-w-xs font-sans text-xs text-slate-500">
				Interactive vocabulary speed drills and timed challenges are in development.
			</p>
			<div
				class="mt-3 flex items-center gap-1.5 font-headline text-[11px] font-semibold text-slate-400"
			>
				<Clock size={13} strokeWidth={2} />
				<span>Coming Soon</span>
			</div>
		</div>
	</section>

	<!-- Leaderboard Section -->
	<section class="shadow-card space-y-3 rounded-3xl border border-slate-200/80 bg-white p-5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Trophy size={18} strokeWidth={2} class="text-amber-600" />
				<h3 class="font-headline text-sm font-bold text-slate-900">Global Leaderboard</h3>
			</div>
			<span
				class="rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-amber-800"
			>
				Season 1
			</span>
		</div>

		<!-- Blank Leaderboard State -->
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center"
		>
			<div
				class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600 shadow-xs"
			>
				<Trophy size={22} strokeWidth={1.75} />
			</div>
			<h4 class="font-headline text-sm font-bold text-slate-800">Leaderboard Blank</h4>
			<p class="mt-1 max-w-xs font-sans text-xs text-slate-500">
				Rankings and competitive scoring will unlock when game matches begin.
			</p>
			<div
				class="mt-3 flex items-center gap-1.5 font-headline text-[11px] font-semibold text-amber-700"
			>
				<Sparkles size={13} strokeWidth={2} />
				<span>Awaiting First Match</span>
			</div>
		</div>
	</section>
</main>
