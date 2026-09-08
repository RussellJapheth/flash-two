<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', icon: 'home', label: 'Home' },
		{ href: '/decks', icon: 'style', label: 'Decks' },
		{ href: '/progress', icon: 'insights', label: 'Progress' },
		{ href: '/settings', icon: 'settings', label: 'Settings' }
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
					<span
						class="material-symbols-outlined text-[22px]"
						style={active ? "font-variation-settings: 'FILL' 1;" : ''}
					>
						{item.icon}
					</span>
				</div>
				<span class="font-headline text-[11px] font-semibold tracking-tight">
					{item.label}
				</span>
			</a>
		{/each}
	</div>
</nav>
