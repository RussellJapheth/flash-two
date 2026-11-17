<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	onMount(() => {
		const search = page.url.search;
		const query = search ? `${search}&tab=links` : '?tab=links';
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query string navigation on resolved route
		goto(`${resolve('/notebook')}${query}`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Saved Links — FlashCards</title>
</svelte:head>

<div class="flex min-h-[40vh] items-center justify-center p-8 text-center text-slate-400">
	<p class="font-headline text-xs font-semibold">Redirecting to Notebook...</p>
</div>
