<script lang="ts">
	import { Zap } from 'lucide-svelte';

	let {
		show = false,
		title = "You're Crushing It!",
		subtitle = 'Halfway through the deck • Keep the momentum going!',
		mascot = '/mascots/owl.png'
	} = $props<{
		show?: boolean;
		title?: string;
		subtitle?: string;
		mascot?: string;
	}>();
</script>

{#if show}
	<div
		class="pointer-events-none fixed top-16 left-1/2 z-40 w-full max-w-sm -translate-x-1/2 px-4 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
	>
		<div
			class="flex items-center gap-3 rounded-2xl border border-indigo-200/90 bg-white/95 p-3.5 shadow-lg shadow-indigo-600/10 backdrop-blur-md"
		>
			<div
				class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/15 via-indigo-500/15 to-indigo-600/20"
			>
				<img
					src={mascot}
					alt="Celebration mascot"
					class="h-9 w-9 select-none object-contain drop-shadow-xs"
				/>
			</div>

			<div class="min-w-0 flex-1">
				<div
					class="flex items-center gap-1 font-headline text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase"
				>
					<Zap size={11} strokeWidth={2.5} class="fill-indigo-600 text-indigo-600" />
					<span>Halfway Milestone</span>
				</div>
				<p class="font-headline text-sm font-extrabold leading-snug text-slate-900">
					{title}
				</p>
				<p class="font-sans truncate text-xs text-slate-500">
					{subtitle}
				</p>
			</div>
		</div>
	</div>
{/if}
