<script lang="ts">
	import { Flame, Snowflake } from 'lucide-svelte';
	let {
		isOpen = false,
		streak = 0,
		freezeCount = 0,
		activeDates = [] as string[],
		freezeDates = [] as string[],
		onClose = () => {}
	} = $props<{
		isOpen?: boolean;
		streak?: number;
		freezeCount?: number;
		activeDates?: string[];
		freezeDates?: string[];
		onClose?: () => void;
	}>();

	const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	let now = new Date();
	let currentYear = now.getFullYear();
	let currentMonth = now.getMonth();

	let monthName = $derived(
		new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
			new Date(currentYear, currentMonth, 1)
		)
	);

	let calendarCells = $derived(() => {
		const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const cells = [];

		// Blank cells before first day
		for (let i = 0; i < firstDayIndex; i++) {
			cells.push({ day: null, dateStr: '', isActive: false, isFrozen: false, isToday: false });
		}

		// Days of month
		const todayIso = new Date().toISOString().split('T')[0];
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

	let dragOffsetY = $state(0);
	let isDragging = $state(false);
	let startY = 0;
	let hasMoved = false;

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		startY = e.clientY;
		dragOffsetY = 0;
		isDragging = true;
		hasMoved = false;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const delta = e.clientY - startY;
		if (delta > 5) hasMoved = true;
		dragOffsetY = Math.max(0, delta);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// ignore
		}

		if (!hasMoved || dragOffsetY < 8) {
			onClose();
		} else if (dragOffsetY > 60) {
			onClose();
		}
		dragOffsetY = 0;
	}

	function handlePointerCancel(e: PointerEvent) {
		isDragging = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// ignore
		}
		dragOffsetY = 0;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (isOpen && e.key === 'Escape') onClose();
	}}
/>

{#if isOpen}
	<div
		role="presentation"
		class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm transition-opacity sm:items-center sm:p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Streak Calendar"
			class="shadow-sheet animate-in slide-in-from-bottom relative w-full max-w-md rounded-t-[32px] border border-slate-200 bg-white p-6 duration-300 sm:rounded-[32px]"
			style="transform: translateY({dragOffsetY}px); transition: {isDragging
				? 'none'
				: 'transform 0.2s ease-out'};"
		>
			<!-- iOS Drag Pill Handle / Dismiss Trigger -->
			<div class="-mt-2 mb-3 flex items-center justify-center">
				<button
					type="button"
					aria-label="Dismiss streak calendar"
					class="group flex h-7 w-20 cursor-grab touch-none items-center justify-center rounded-full transition-transform select-none active:scale-95 active:cursor-grabbing"
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerCancel}
				>
					<span
						class="h-1.5 w-10 rounded-full bg-slate-200 transition-colors group-hover:bg-slate-300 group-active:bg-slate-400"
					></span>
				</button>
			</div>

			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="font-headline text-xl font-extrabold text-slate-900">Streak Calendar</h3>
					<p class="text-xs font-medium text-slate-500">{monthName}</p>
				</div>

				<div
					class="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 font-headline text-xs font-bold text-amber-900 shadow-xs"
				>
					<Flame size={15} strokeWidth={2.25} class="fill-amber-500/20 text-amber-500" />
					<span>{streak} Days Active</span>
				</div>
			</div>

			<!-- Days of Week -->
			<div
				class="mt-5 grid grid-cols-7 gap-1 text-center font-headline text-xs font-bold text-slate-400"
			>
				{#each dayNames as day, i (i)}
					<div class="py-1">{day}</div>
				{/each}
			</div>

			<!-- Calendar Matrix -->
			<div class="mt-2 grid grid-cols-7 gap-1.5 text-center">
				{#each calendarCells() as cell, idx (cell.dateStr || idx)}
					{#if cell.day === null}
						<div class="h-9"></div>
					{:else}
						<div
							class="relative flex h-9 w-full items-center justify-center rounded-2xl text-xs font-bold transition-transform {cell.isActive
								? 'shadow-streak-glow scale-105 bg-amber-500 text-white'
								: cell.isFrozen
									? 'scale-105 bg-blue-500 text-white shadow-sm'
									: 'bg-slate-100 text-slate-600'} {cell.isToday
								? 'ring-2 ring-indigo-600 ring-offset-1'
								: ''}"
						>
							{#if cell.isActive}
								<Flame
									size={11}
									strokeWidth={2.5}
									class="absolute -top-1 -right-1 text-amber-200"
								/>
							{:else if cell.isFrozen}
								<Snowflake
									size={11}
									strokeWidth={2.5}
									class="absolute -top-1 -right-1 text-blue-100"
								/>
							{/if}
							<span>{cell.day}</span>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Legend -->
			<div
				class="mt-4 flex items-center justify-center gap-5 font-headline text-xs font-bold text-slate-500"
			>
				<div class="flex items-center gap-1.5">
					<div class="h-3 w-3 rounded-full bg-amber-500"></div>
					<span>Practiced</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="h-3 w-3 rounded-full bg-blue-500"></div>
					<span>Freeze Used</span>
				</div>
			</div>

			<!-- Streak Freeze Status -->
			<div
				class="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5"
			>
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"
					>
						<Snowflake size={17} strokeWidth={2} />
					</div>
					<div>
						<p class="font-headline text-xs font-bold text-slate-900">Streak Freeze Shield</p>
						<p class="text-[11px] font-medium text-slate-500">
							{freezeCount} of 3 Freezes active (1 per 5-day streak)
						</p>
					</div>
				</div>
				{#if freezeCount > 0}
					<span
						class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-headline text-[11px] font-bold text-emerald-700"
					>
						Protected
					</span>
				{:else}
					<span
						class="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-headline text-[11px] font-bold text-slate-500"
					>
						0 Freezes
					</span>
				{/if}
			</div>

			<!-- Close Action -->
			<button
				type="button"
				onclick={onClose}
				class="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
			>
				Close
			</button>
		</div>
	</div>
{/if}
