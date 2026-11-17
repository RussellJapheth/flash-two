<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(resolve(`/deck/${page.params.id}/preview`), { replaceState: true });
	});
</script>

<div class="flex min-h-screen items-center justify-center p-6 text-slate-500">
	<p class="font-headline text-sm font-semibold">Loading deck...</p>
</div>
