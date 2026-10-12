<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import { AlertCircle } from 'lucide-svelte';

	let {
		active,
		title = 'Leave this session?',
		message = 'Your progress on the cards you already reviewed is saved.',
		confirmLabel = 'Leave session',
		stayLabel = 'Keep going'
	} = $props<{
		active: boolean | (() => boolean);
		title?: string;
		message?: string;
		confirmLabel?: string;
		stayLabel?: string;
	}>();

	let isConfirming = $state(false);
	let pendingExit: (() => void) | null = null;
	let allowNavigation = false;

	const isActive = () => (typeof active === 'function' ? active() : active);

	beforeNavigate(({ cancel, to, type, delta }) => {
		if (allowNavigation) return;
		if (!isActive()) return;
		if (!to) return;
		if (to.url.pathname === page.url.pathname && to.url.search === page.url.search) return;

		cancel();

		if (type === 'popstate') {
			pendingExit = () => history.go(delta);
		} else {
			const target = (to.url.pathname + to.url.search + to.url.hash) as ResolvedPathname;
			pendingExit = () => goto(target);
		}

		isConfirming = true;
	});

	export function requestExit(proceed: () => void) {
		if (!isActive()) {
			proceed();
			return;
		}
		pendingExit = proceed;
		isConfirming = true;
	}

	function confirmExit() {
		isConfirming = false;
		allowNavigation = true;
		const exit = pendingExit;
		pendingExit = null;
		exit?.();
		setTimeout(() => {
			allowNavigation = false;
		}, 200);
	}

	function stayInSession() {
		isConfirming = false;
		pendingExit = null;
	}
</script>

{#if isConfirming}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="session-exit-title"
	>
		<button
			type="button"
			class="absolute inset-0 cursor-default border-0 bg-transparent"
			onclick={stayInSession}
			aria-label="Cancel and stay in session"
		></button>

		<div
			class="shadow-sheet relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6"
		>
			<div
				class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600"
			>
				<AlertCircle size={24} strokeWidth={2.25} />
			</div>

			<h2
				id="session-exit-title"
				class="text-center font-headline text-lg font-extrabold text-slate-900"
			>
				{title}
			</h2>
			<p class="mt-1.5 text-center font-sans text-xs leading-relaxed text-slate-500">{message}</p>

			<div class="mt-5 flex flex-col gap-2">
				<button
					type="button"
					onclick={confirmExit}
					class="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					{confirmLabel}
				</button>
				<button
					type="button"
					onclick={stayInSession}
					class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-100 font-headline text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
				>
					{stayLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
