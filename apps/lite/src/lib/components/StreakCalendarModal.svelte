<script lang="ts">
	import { Flame, Snowflake, ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	interface Props {
		isOpen?: boolean;
		streak?: number;
		longestStreak?: number;
		freezeCount?: number;
		activeDates?: string[];
		freezeDates?: string[];
		onClose?: () => void;
	}

	let {
		isOpen = false,
		streak = 0,
		longestStreak = 0,
		freezeCount = 0,
		activeDates = [],
		freezeDates = [],
		onClose = () => {}
	}: Props = $props();

	const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

	const today = new Date();
	const todayYear = today.getFullYear();
	const todayMonth = today.getMonth();
	const todayIso = today.toISOString().split('T')[0];

	let currentYear = $state(todayYear);
	let currentMonth = $state(todayMonth);

	function prevMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear -= 1;
		} else {
			currentMonth -= 1;
		}
	}

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear += 1;
		} else {
			currentMonth += 1;
		}
	}

	function resetToToday() {
		currentYear = todayYear;
		currentMonth = todayMonth;
	}

	let isCurrentMonth = $derived(currentYear === todayYear && currentMonth === todayMonth);

	let monthLabel = $derived(
		new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
			new Date(currentYear, currentMonth, 1)
		)
	);

	interface CalendarCell {
		day: number | null;
		dateStr: string;
		isActive: boolean;
		isFrozen: boolean;
		isToday: boolean;
	}

	let calendarCells = $derived((): CalendarCell[] => {
		const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const cells: CalendarCell[] = [];

		for (let i = 0; i < firstDayIndex; i++) {
			cells.push({ day: null, dateStr: '', isActive: false, isFrozen: false, isToday: false });
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const mStr = String(currentMonth + 1).padStart(2, '0');
			const dStr = String(day).padStart(2, '0');
			const dateStr = `${currentYear}-${mStr}-${dStr}`;
			const isActive = activeDates.includes(dateStr);
			const isFrozen = !isActive && freezeDates.includes(dateStr);
			const isToday = dateStr === todayIso;
			cells.push({ day, dateStr, isActive, isFrozen, isToday });
		}

		return cells;
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (isOpen && e.key === 'Escape') onClose();
	}}
/>

{#if isOpen}
	<div
		role="presentation"
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-xs transition-opacity sm:items-center sm:p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Streak Calendar"
			class="relative flex w-full max-w-sm flex-col rounded-t-3xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-3xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div>
					<h3 class="font-headline text-lg font-bold text-slate-900">Streak Calendar</h3>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<span class="font-semibold text-slate-700">{monthLabel}</span>
						{#if !isCurrentMonth}
							<button
								type="button"
								onclick={resetToToday}
								class="cursor-pointer font-medium text-indigo-600 hover:underline"
							>
								Today
							</button>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={prevMonth}
						aria-label="Previous month"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						type="button"
						onclick={nextMonth}
						aria-label="Next month"
						class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
					>
						<ChevronRight size={18} />
					</button>
					<button
						type="button"
						onclick={onClose}
						aria-label="Close streak calendar"
						class="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
					>
						<X size={18} />
					</button>
				</div>
			</div>

			<!-- Quick Metric Strip -->
			<div class="mt-3.5 grid grid-cols-3 gap-2 text-center">
				<div class="rounded-xl border border-amber-200/70 bg-amber-50/60 p-2">
					<div class="flex items-center justify-center gap-1 text-amber-700">
						<Flame size={14} class="fill-amber-500 text-amber-500" />
						<span class="font-headline text-sm font-extrabold">{streak}d</span>
					</div>
					<p class="font-sans text-[10px] font-semibold text-amber-800">Current</p>
				</div>
				<div class="rounded-xl border border-slate-200/80 bg-slate-50 p-2">
					<p class="font-headline text-sm font-extrabold text-slate-900">{longestStreak}d</p>
					<p class="font-sans text-[10px] font-semibold text-slate-500">Longest</p>
				</div>
				<div class="rounded-xl border border-sky-200/70 bg-sky-50/60 p-2">
					<div class="flex items-center justify-center gap-1 text-sky-700">
						<Snowflake size={14} class="text-sky-600" />
						<span class="font-headline text-sm font-extrabold">{freezeCount}/3</span>
					</div>
					<p class="font-sans text-[10px] font-semibold text-sky-800">Shields</p>
				</div>
			</div>

			<!-- Day Header -->
			<div
				class="mt-3.5 grid grid-cols-7 gap-1 text-center font-headline text-xs font-bold text-slate-400"
			>
				{#each dayNames as day, i (i)}
					<div class="py-1">{day}</div>
				{/each}
			</div>

			<!-- Calendar Matrix -->
			<div class="mt-1 grid grid-cols-7 gap-1 text-center">
				{#each calendarCells() as cell, idx (cell.dateStr || idx)}
					{#if cell.day === null}
						<div class="h-8"></div>
					{:else}
						<div
							class="flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all {cell.isActive
								? 'bg-amber-500 text-white shadow-xs'
								: cell.isFrozen
									? 'bg-sky-500 text-white shadow-xs'
									: 'bg-slate-50 text-slate-600'} {cell.isToday && !cell.isActive && !cell.isFrozen
								? 'font-bold text-indigo-700 ring-2 ring-indigo-500'
								: ''}"
							title={`${cell.dateStr}${cell.isActive ? ' (Studied)' : cell.isFrozen ? ' (Streak freeze)' : ''}`}
						>
							<span>{cell.day}</span>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Minimal Legend & Shield Info -->
			<div
				class="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500"
			>
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1">
						<span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
						<span>Studied</span>
					</div>
					<div class="flex items-center gap-1">
						<span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
						<span>Freeze</span>
					</div>
				</div>
				<span class="font-medium text-slate-400">1 shield / 5 streak days</span>
			</div>
		</div>
	</div>
{/if}
