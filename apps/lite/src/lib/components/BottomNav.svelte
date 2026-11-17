<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Layers, RotateCw, Settings } from 'lucide-svelte';

	const navItems = [
		{ href: '/', icon: Layers, label: 'All Weeks' },
		{ href: '/review', icon: RotateCw, label: 'Review' },
		{ href: '/settings', icon: Settings, label: 'Settings' }
	] as const;

	function isItemActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	aria-label="Main Navigation"
	class="fixed right-0 bottom-0 left-0 z-40 mx-auto w-full border-t border-slate-200/80 bg-white/95 pt-1.5 pb-[env(safe-area-inset-bottom,0.5rem)] shadow-lg shadow-slate-900/5 backdrop-blur-lg sm:max-w-md"
>
	<div class="flex items-center justify-around px-6">
		{#each navItems as item (item.href)}
			{@const active = isItemActive(item.href)}
			{@const Icon = item.icon}
			<a
				href={resolve(item.href as '/')}
				aria-current={active ? 'page' : undefined}
				class="group relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-1 transition-all {active
					? 'text-indigo-600'
					: 'text-slate-600 hover:text-slate-900 active:scale-95'}"
			>
				<div
					class="flex h-8 w-16 items-center justify-center rounded-full transition-colors {active
						? 'bg-indigo-50 text-indigo-600'
						: 'text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-900'}"
				>
					<Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
				</div>
				<span
					class="font-headline text-xs {active
						? 'font-bold text-indigo-600'
						: 'font-semibold text-slate-600 group-hover:text-slate-900'}"
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
