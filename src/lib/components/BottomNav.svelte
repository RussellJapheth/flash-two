<script lang="ts">
	import { page } from '$app/state';
	import { Home, BookOpen, BarChart2, Settings } from 'lucide-svelte';

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/decks', icon: BookOpen, label: 'Decks' },
		{ href: '/progress', icon: BarChart2, label: 'Progress' },
		{ href: '/settings', icon: Settings, label: 'Settings' }
	];

	function isActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<nav
	class="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-surface-container-high bg-surface-container-lowest/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom,0.5rem)] pt-1"
>
	<div class="flex items-center justify-around px-2 py-1">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-all {active
					? 'text-primary'
					: 'text-on-surface-variant hover:text-on-surface'}"
			>
				<div
					class="flex h-7 w-12 items-center justify-center rounded-full transition-colors {active
						? 'bg-primary-fixed text-primary'
						: 'bg-transparent'}"
				>
					<Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
				</div>
				<span class="font-headline text-[11px] font-semibold tracking-tight">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
