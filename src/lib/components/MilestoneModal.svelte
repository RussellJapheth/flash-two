<script lang="ts">
	import { playSound } from '$lib/utils/audio';
	import { onMount } from 'svelte';

	let {
		isOpen = false,
		title = "You're Crushing It!",
		subtitle = 'Halfway through your daily cards with great focus.',
		badgeText = 'HALFWAY MILESTONE',
		mascot = '/mascots/owl.png',
		stats = { reviewed: 10, total: 20, accuracy: 90, correct: 9, wrong: 1 },
		primaryActionText = 'Keep Going',
		secondaryActionText = 'Take a Break',
		onPrimaryAction = () => {},
		onSecondaryAction = () => {}
	} = $props<{
		isOpen?: boolean;
		title?: string;
		subtitle?: string;
		badgeText?: string;
		mascot?: string;
		stats?: { reviewed: number; total: number; accuracy: number; correct: number; wrong: number };
		primaryActionText?: string;
		secondaryActionText?: string;
		onPrimaryAction?: () => void;
		onSecondaryAction?: () => void;
	}>();

	onMount(() => {
		if (isOpen) playSound('milestone');
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-md transition-opacity"
	>
		<div
			class="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-surface-container bg-surface-container-lowest p-6 text-center shadow-2xl"
		>
			<!-- Ambient glow background circles -->
			<div
				class="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary-fixed/40 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-secondary-fixed/30 blur-3xl"
			></div>

			<!-- Mascot Container -->
			<div class="relative mx-auto my-2 flex h-36 w-36 items-center justify-center">
				<div
					class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-primary/20 via-primary-fixed/30 to-secondary-fixed/20 blur-xl"
				></div>
				<img
					src={mascot}
					alt="Mascot milestone celebration"
					class="relative z-10 h-32 w-32 object-contain select-none drop-shadow-md transition-transform hover:scale-105 duration-300"
				/>
			</div>

			<!-- Milestone Tag -->
			<div class="relative z-10 mt-2 flex flex-col items-center">
				<div
					class="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 font-headline text-xs font-bold text-primary shadow-sm"
				>
					<span class="material-symbols-outlined text-[14px]">bolt</span>
					<span>{badgeText}</span>
				</div>

				<h2 class="mt-2 font-headline text-2xl font-extrabold tracking-tight text-on-surface">
					{title}
				</h2>

				<p class="mt-1 font-body text-xs text-on-surface-variant leading-relaxed">
					{subtitle}
				</p>
			</div>

			<!-- Stats Card -->
			<div
				class="my-4 rounded-2xl border border-surface-container bg-surface-container-low p-3.5 text-left"
			>
				<div class="flex items-center justify-between text-xs font-bold text-on-surface mb-2">
					<span>Session Progress</span>
					<span class="text-primary">{stats.reviewed} / {stats.total} cards</span>
				</div>

				<div class="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-high text-xs">
					<div class="flex items-center gap-1.5 text-emerald-600 font-semibold">
						<span class="material-symbols-outlined text-[16px]">check_circle</span>
						<span>{stats.correct} Correct</span>
					</div>
					<div class="flex items-center gap-1.5 text-rose-600 font-semibold">
						<span class="material-symbols-outlined text-[16px]">cancel</span>
						<span>{stats.wrong} Again</span>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-2">
				<button
					type="button"
					onclick={onPrimaryAction}
					class="flex h-12 w-full items-center justify-center rounded-full bg-primary-container font-headline text-sm font-bold text-white shadow-md transition-all hover:bg-primary active:scale-95"
				>
					{primaryActionText}
				</button>

				<button
					type="button"
					onclick={onSecondaryAction}
					class="flex h-11 w-full items-center justify-center rounded-full bg-surface-container font-headline text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high active:scale-95"
				>
					{secondaryActionText}
				</button>
			</div>
		</div>
	</div>
{/if}
