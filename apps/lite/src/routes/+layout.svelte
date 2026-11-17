<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import UsernameModal from '$lib/components/UsernameModal.svelte';
	import { getSavedUsername } from '$lib/storage';
	import { pullAndMerge } from '$lib/cloud';
	import { pwa } from '$lib/pwa.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let showUsernameModal = $state(false);

	let isStudySession = $derived(
		page.url.pathname.startsWith('/study/') || page.url.pathname === '/review'
	);

	onMount(() => {
		pwa.init();
		const user = getSavedUsername();
		if (!user) {
			showUsernameModal = true;
		} else {
			pullAndMerge(user);
		}
	});

	function handleUsernameSuccess() {
		showUsernameModal = false;
	}
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
		<InstallPrompt />
		<BottomNav />
	{/if}

	<UsernameModal isOpen={showUsernameModal} onSuccess={handleUsernameSuccess} />
</div>
