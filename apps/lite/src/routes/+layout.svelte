<script lang="ts">
	import './layout.css';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') || page.url.pathname === '/review'
	);
</script>

<div
	class="flex min-h-screen flex-col items-center bg-white font-sans text-slate-900 sm:bg-slate-100"
>
	<div
		class="relative flex min-h-screen w-full flex-col bg-white pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] sm:max-w-md sm:border-x sm:border-slate-200/60 sm:shadow-sm"
	>
		{@render children()}
	</div>

	{#if !isStudySession}
		<BottomNav />
	{/if}
</div>
