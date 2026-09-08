<script lang="ts">
	interface FloatItem {
		id: number;
		text: string;
		subtext?: string;
		type: 'correct' | 'wrong' | 'combo';
		x: number;
		y: number;
	}

	let items = $state<FloatItem[]>([]);
	let nextId = 0;

	export function spawn(
		text: string,
		subtext?: string,
		type: 'correct' | 'wrong' | 'combo' = 'correct',
		x: number = 50,
		y: number = 40
	) {
		const id = nextId++;
		items.push({ id, text, subtext, type, x, y });

		setTimeout(() => {
			items = items.filter((item) => item.id !== id);
		}, 800);
	}
</script>

<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
	{#each items as item (item.id)}
		<div
			style="left: {item.x}%; top: {item.y}%;"
			class="animate-float-up absolute -translate-x-1/2 -translate-y-1/2 text-center select-none"
		>
			<div
				class="inline-flex flex-col items-center rounded-2xl px-3 py-1 font-headline font-black shadow-lg backdrop-blur-md {item.type ===
				'combo'
					? 'border border-amber-300 bg-linear-to-r from-amber-500 to-rose-500 text-white shadow-amber-500/30'
					: item.type === 'wrong'
						? 'border border-rose-300 bg-rose-600 text-white shadow-rose-500/30'
						: 'border border-emerald-300 bg-emerald-600 text-white shadow-emerald-500/30'}"
			>
				<span class="text-base tracking-wider drop-shadow-sm">{item.text}</span>
				{#if item.subtext}
					<span class="text-[10px] tracking-widest text-white/90 uppercase drop-shadow-xs"
						>{item.subtext}</span
					>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes floatUp {
		0% {
			opacity: 0;
			transform: translate(-50%, 0) scale(0.6);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -10px) scale(1.15);
		}
		70% {
			opacity: 1;
			transform: translate(-50%, -35px) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -55px) scale(0.9);
		}
	}

	.animate-float-up {
		animation: floatUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
</style>
