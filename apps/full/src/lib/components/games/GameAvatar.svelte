<script lang="ts">
	import { Flame, AlertTriangle, Crown } from 'lucide-svelte';

	interface Props {
		state?: 'idle' | 'combo' | 'danger' | 'victory' | 'wrong';
		combo?: number;
		size?: 'sm' | 'md' | 'lg';
	}

	let { state = 'idle', combo = 0, size = 'md' }: Props = $props();

	const sizeClasses = {
		sm: 'w-10 h-10',
		md: 'w-14 h-14',
		lg: 'w-20 h-20'
	};
</script>

<div class="relative inline-flex items-center justify-center">
	<!-- Ambient Aura / Glow based on state -->
	{#if state === 'combo' || combo >= 3}
		<div
			class="absolute -inset-2 animate-pulse rounded-full bg-linear-to-r from-amber-400 via-rose-500 to-indigo-500 opacity-60 blur-md transition-all"
		></div>
	{:else if state === 'danger'}
		<div
			class="absolute -inset-2 animate-ping rounded-full bg-rose-500 opacity-40 blur-md duration-1000"
		></div>
	{:else if state === 'victory'}
		<div
			class="absolute -inset-3 animate-spin rounded-full bg-linear-to-tr from-amber-300 via-indigo-400 to-emerald-400 opacity-50 blur-lg duration-3000"
		></div>
	{/if}

	<!-- Avatar Container -->
	<div
		class="relative flex items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-300 {sizeClasses[
			size
		]} {state === 'combo'
			? 'border-amber-400 bg-linear-to-b from-amber-50 to-orange-100 shadow-md shadow-amber-500/20'
			: state === 'danger'
				? 'animate-bounce border-rose-400 bg-rose-50 shadow-md shadow-rose-500/20'
				: state === 'victory'
					? 'scale-105 border-indigo-400 bg-linear-to-b from-indigo-50 to-indigo-100 shadow-lg shadow-indigo-500/30'
					: state === 'wrong'
						? 'border-rose-300 bg-rose-50/80'
						: 'border-indigo-100 bg-linear-to-b from-indigo-50/90 to-white shadow-xs'}"
	>
		<!-- Avatar Graphic (Owl mascot with fallback / stylized gaming icon) -->
		<img
			src="/mascots/owl.png"
			alt="Companion Mascot"
			class="h-full w-full object-contain p-1 transition-transform duration-200 {state === 'combo'
				? 'scale-110'
				: state === 'wrong'
					? 'scale-90 opacity-70'
					: ''}"
			onerror={(e) => {
				// Fallback if image fails
				const target = e.currentTarget as HTMLImageElement;
				target.style.display = 'none';
			}}
		/>

		<!-- Floating Status Badges -->
		{#if state === 'combo' || combo >= 2}
			<div
				class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs"
			>
				<Flame size={12} strokeWidth={2.5} class="animate-bounce" />
			</div>
		{:else if state === 'danger'}
			<div
				class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs"
			>
				<AlertTriangle size={11} strokeWidth={2.5} />
			</div>
		{:else if state === 'victory'}
			<div
				class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md"
			>
				<Crown size={14} strokeWidth={2.5} />
			</div>
		{/if}
	</div>
</div>
