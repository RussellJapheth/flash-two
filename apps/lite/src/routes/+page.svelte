<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import MyWordsHome from '$lib/components/MyWordsHome.svelte';

	let category = $derived(page.url.searchParams.get('category')?.trim() || '');
</script>

<svelte:head>
	<title>FlashCards Lite — {category || 'All Weeks'}</title>
</svelte:head>

<TopHeader
	title={category || 'All Weeks'}
	showBack={Boolean(category)}
	onBack={() => goto(resolve('/'))}
/>

<main class="flex-1 space-y-4 px-4 pt-3 pb-8">
	<MyWordsHome {category} />
</main>
