<script lang="ts">
	import { playSound } from '$lib/utils/audio';
	import { onMount } from 'svelte';
	import { Zap, CheckCircle2, XCircle } from 'lucide-svelte';

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
			class="shadow-sheet animate-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center duration-200"
		>
			<!-- Ambient glow background circles -->
			<div
				class="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-indigo-100/60 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-amber-100/60 blur-3xl"
			></div>

			<!-- Mascot Container -->
			<div class="relative mx-auto my-2 flex h-36 w-36 items-center justify-center">
				<div
					class="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-indigo-500/20 via-indigo-100/40 to-amber-100/30 blur-xl"
				></div>
				<img
					src={mascot}
					alt="Mascot milestone celebration"
					class="relative z-10 h-32 w-32 object-contain drop-shadow-md transition-transform duration-300 select-none hover:scale-105"
				/>
			</div>

			<!-- Milestone Tag -->
			<div class="relative z-10 mt-2 flex flex-col items-center">
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 font-headline text-xs font-bold text-indigo-700 shadow-xs"
				>
					<Zap size={13} strokeWidth={2.25} />
					<span>{badgeText}</span>
				</div>

				<h2 class="mt-2 font-headline text-2xl font-extrabold tracking-tight text-slate-900">
					{title}
				</h2>

				<p class="font-body mt-1 text-xs leading-relaxed text-slate-500">
					{subtitle}
				</p>
			</div>

			<!-- Stats Card -->
			<div
				class="my-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-left"
			>
				<div class="mb-2 flex items-center justify-between text-xs font-bold text-slate-900">
					<span>Session Progress</span>
					<span class="font-headline text-indigo-600">{stats.reviewed} / {stats.total} cards</span>
				</div>

				<div class="grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-2 text-xs">
					<div class="flex items-center gap-1.5 font-headline font-bold text-emerald-600">
						<CheckCircle2 size={15} strokeWidth={2} />
						<span>{stats.correct} Correct</span>
					</div>
					<div class="flex items-center gap-1.5 font-headline font-bold text-rose-600">
						<XCircle size={15} strokeWidth={2} />
						<span>{stats.wrong} Again</span>
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-2">
				<button
					type="button"
					onclick={onPrimaryAction}
					class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					{primaryActionText}
				</button>

				<button
					type="button"
					onclick={onSecondaryAction}
					class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-100 font-headline text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
				>
					{secondaryActionText}
				</button>
			</div>
		</div>
	</div>
{/if}
