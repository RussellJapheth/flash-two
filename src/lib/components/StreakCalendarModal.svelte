<script lang="ts">
	let {
		isOpen = false,
		streak = 0,
		activeDates = [] as string[],
		onClose = () => {}
	} = $props<{
		isOpen?: boolean;
		streak?: number;
		activeDates?: string[];
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
			cells.push({ day: null, dateStr: '', isActive: false, isToday: false });
		}

		// Days of month
		const todayIso = new Date().toISOString().split('T')[0];
		for (let day = 1; day <= daysInMonth; day++) {
			const mStr = String(currentMonth + 1).padStart(2, '0');
			const dStr = String(day).padStart(2, '0');
			const dateStr = `${currentYear}-${mStr}-${dStr}`;
			const isActive = activeDates.includes(dateStr);
			const isToday = dateStr === todayIso;
			cells.push({ day, dateStr, isActive, isToday });
		}

		return cells;
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/45 p-0 sm:p-4 backdrop-blur-sm transition-opacity"
	>
		<div
			class="relative w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border border-surface-container bg-surface-container-lowest p-6 shadow-sheet animate-in slide-in-from-bottom duration-300"
		>
			<!-- iOS Drag Pill Handle -->
			<div class="mx-auto mb-4 h-1.5 w-9 rounded-full bg-outline-variant"></div>

			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="font-headline text-xl font-bold text-on-surface">Streak Calendar</h3>
					<p class="text-xs text-on-surface-variant font-medium">{monthName}</p>
				</div>

				<div
					class="flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 font-headline text-xs font-bold text-on-secondary-fixed shadow-sm"
				>
					<span
						class="material-symbols-outlined text-[16px] text-secondary"
						style="font-variation-settings: 'FILL' 1;">local_fire_department</span
					>
					<span>{streak} Days Active</span>
				</div>
			</div>

			<!-- Days of Week -->
			<div class="mt-5 grid grid-cols-7 gap-1 text-center font-headline text-xs font-bold text-on-surface-variant">
				{#each dayNames as day}
					<div class="py-1">{day}</div>
				{/each}
			</div>

			<!-- Calendar Matrix -->
			<div class="mt-2 grid grid-cols-7 gap-1.5 text-center">
				{#each calendarCells() as cell}
					{#if cell.day === null}
						<div class="h-9"></div>
					{:else}
						<div
							class="relative flex h-9 w-full items-center justify-center rounded-2xl text-xs font-bold transition-transform {cell.isActive
								? 'bg-secondary text-white shadow-streak-glow scale-105'
								: 'bg-surface-container-low text-on-surface-variant'} {cell.isToday
								? 'ring-2 ring-primary ring-offset-1'
								: ''}"
						>
							{#if cell.isActive}
								<span
									class="absolute -top-1 -right-1 material-symbols-outlined text-[12px] text-amber-300"
									style="font-variation-settings: 'FILL' 1;">local_fire_department</span
								>
							{/if}
							<span>{cell.day}</span>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Streak Freeze Status -->
			<div
				class="mt-5 flex items-center justify-between rounded-2xl bg-surface-container-low p-3.5 border border-surface-container"
			>
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"
					>
						<span class="material-symbols-outlined text-[18px]">ac_unit</span>
					</div>
					<div>
						<p class="font-headline text-xs font-bold text-on-surface">Streak Freeze Protected</p>
						<p class="text-[11px] text-on-surface-variant">2 Freezes remaining this month</p>
					</div>
				</div>
				<span class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
					Active
				</span>
			</div>

			<!-- Close Action -->
			<button
				type="button"
				onclick={onClose}
				class="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-white shadow-md transition-all hover:bg-primary active:scale-95"
			>
				Close
			</button>
		</div>
	</div>
{/if}
