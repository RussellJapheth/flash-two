<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Home, Layers, BarChart3, Settings } from 'lucide-svelte';

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/decks', icon: Layers, label: 'Decks' },
		{ href: '/progress', icon: BarChart3, label: 'Progress' },
		{ href: '/settings', icon: Settings, label: 'Settings' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	aria-label="Main Navigation"
	class="fixed right-0 bottom-0 left-0 z-40 mx-auto max-w-md border-t border-slate-200/80 bg-white/95 pt-1.5 pb-[env(safe-area-inset-bottom,0.5rem)] shadow-lg shadow-slate-900/5 backdrop-blur-lg"
>
	<div class="flex items-center justify-around px-3">
		{#each navItems as item (item.href)}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a
				href={resolve(item.href)}
				class="group relative flex flex-1 flex-col items-center gap-1 py-1 transition-all {active
					? 'text-indigo-600'
					: 'text-slate-400 hover:text-slate-600 active:scale-95'}"
			>
				<div
					class="flex h-7 w-12 items-center justify-center rounded-full transition-colors {active
						? 'bg-indigo-50 text-indigo-600'
						: 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'}"
				>
					<Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
				</div>
				<span
					class="font-headline text-[11px] {active
						? 'font-bold text-indigo-600'
						: 'font-medium text-slate-500 group-hover:text-slate-700'}"
				>
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
