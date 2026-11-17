<script lang="ts">
	import { ArrowLeft, Layers, Settings } from 'lucide-svelte';
	import { resolve } from '$app/paths';

	let {
		title = 'FlashCards Lite',
		showBack = false,
		onBack = () => history.back()
	} = $props<{
		title?: string;
		showBack?: boolean;
		onBack?: () => void;
	}>();
</script>

<header
	class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur-md"
>
	<div class="flex items-center gap-2.5">
		{#if showBack}
			<button
				type="button"
				onclick={onBack}
				aria-label="Go Back"
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-transform hover:bg-slate-200 active:scale-95"
			>
				<ArrowLeft size={18} strokeWidth={2.25} />
			</button>
		{:else}
			<div
				class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs"
			>
				<Layers size={16} strokeWidth={2.25} />
			</div>
		{/if}
		<div>
			<h1 class="font-headline text-base font-bold tracking-tight text-slate-900">
				{title}
			</h1>
		</div>
	</div>

	<div class="flex items-center gap-2">
		<a
			href={resolve('/settings')}
			title="Settings"
			aria-label="Settings"
			class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 active:scale-95"
		>
			<Settings size={16} strokeWidth={2} />
		</a>
	</div>
</header>
