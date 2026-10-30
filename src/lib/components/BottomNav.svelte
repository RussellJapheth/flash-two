<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Home,
		Layers,
		GraduationCap,
		Bookmark,
		MoreHorizontal,
		BarChart3,
		Gamepad2,
		Settings,
		Headphones,
		X
	} from 'lucide-svelte';

	let isMoreOpen = $state(false);

	const mainNavItems = [
		{ href: '/', icon: Home, label: 'Home' },
		{ href: '/textbook', icon: GraduationCap, label: 'Textbook' },
		{ href: '/decks', icon: Layers, label: 'Decks' },
		{ href: '/notebook', icon: Bookmark, label: 'Notebook' }
	] as const;

	const moreMenuItems = [
		{ href: '/podcasts', icon: Headphones, label: 'Podcasts', desc: 'Graded native audio' },
		{ href: '/progress', icon: BarChart3, label: 'Progress', desc: 'Stats, streaks & XP' },
		{ href: '/games', icon: Gamepad2, label: 'Games', desc: 'Tone pairs & arcade' },
		{ href: '/settings', icon: Settings, label: 'Settings', desc: 'Preferences & backup' }
	] as const;

	function isItemActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}
		return page.url.pathname.startsWith(href);
	}

	let isMoreActive = $derived(
		moreMenuItems.some((item) => page.url.pathname.startsWith(item.href))
	);

	function closeMenu() {
		isMoreOpen = false;
	}

	function toggleMore() {
		isMoreOpen = !isMoreOpen;
	}
</script>

<nav
	aria-label="Main Navigation"
	class="fixed right-0 bottom-0 left-0 z-40 mx-auto w-full border-t border-slate-200/80 bg-white/95 pt-1.5 pb-[env(safe-area-inset-bottom,0.5rem)] shadow-lg shadow-slate-900/5 backdrop-blur-lg sm:max-w-md"
>
	<!-- Floating More Menu Modal -->
	{#if isMoreOpen}
		<!-- Backdrop for dismissing -->
		<button
			type="button"
			aria-label="Close menu backdrop"
			onclick={closeMenu}
			class="backdrop-blur-2xs fixed inset-0 z-35 cursor-default bg-slate-900/20"
		></button>

		<!-- Popup Menu Card -->
		<div
			class="absolute right-3 bottom-full z-40 mb-2 w-56 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10"
		>
			<div class="flex items-center justify-between border-b border-slate-100 px-3 py-2">
				<span class="font-headline text-[10px] font-black tracking-wider text-slate-400 uppercase">
					More Menu
				</span>
				<button
					type="button"
					onclick={closeMenu}
					class="cursor-pointer p-0.5 text-slate-400 transition-colors hover:text-slate-600"
					aria-label="Close menu"
				>
					<X size={14} />
				</button>
			</div>

			<div class="space-y-1 py-1">
				{#each moreMenuItems as item (item.href)}
					{@const active = isItemActive(item.href)}
					{@const Icon = item.icon}
					<a
						href={resolve(item.href as '/')}
						onclick={closeMenu}
						class="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors {active
							? 'bg-indigo-50 text-indigo-700'
							: 'text-slate-700 hover:bg-slate-50'}"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl {active
								? 'bg-indigo-600 text-white shadow-xs'
								: 'bg-slate-100 text-slate-600'}"
						>
							<Icon size={16} strokeWidth={2.25} />
						</div>
						<div class="overflow-hidden text-left">
							<span class="block font-headline text-xs leading-tight font-bold">{item.label}</span>
							<span class="block truncate text-[10px] text-slate-400">{item.desc}</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 5-item Bottom Bar -->
	<div class="flex items-center justify-around px-3">
		{#each mainNavItems as item (item.href)}
			{@const active = isItemActive(item.href)}
			{@const Icon = item.icon}
			<a
				href={resolve(item.href as '/')}
				onclick={closeMenu}
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

		<!-- More Button Trigger -->
		<button
			type="button"
			onclick={toggleMore}
			class="group relative flex flex-1 cursor-pointer flex-col items-center gap-1 py-1 transition-all {isMoreActive ||
			isMoreOpen
				? 'text-indigo-600'
				: 'text-slate-400 hover:text-slate-600 active:scale-95'}"
			aria-expanded={isMoreOpen}
			aria-haspopup="true"
		>
			<div
				class="flex h-7 w-12 items-center justify-center rounded-full transition-colors {isMoreActive ||
				isMoreOpen
					? 'bg-indigo-50 text-indigo-600'
					: 'text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'}"
			>
				<MoreHorizontal size={20} strokeWidth={isMoreActive || isMoreOpen ? 2.5 : 1.75} />
			</div>
			<span
				class="font-headline text-[11px] {isMoreActive || isMoreOpen
					? 'font-bold text-indigo-600'
					: 'font-medium text-slate-500 group-hover:text-slate-700'}"
			>
				More
			</span>
		</button>
	</div>
</nav>
