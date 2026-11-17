<script lang="ts">
	import { Cloud, Loader2, UserCheck, AlertCircle } from 'lucide-svelte';
	import { isValidUsername, setSavedUsername } from '$lib/storage';
	import { checkRemoteUser, pullAndMerge, pushData, type RemoteUserSummary } from '$lib/cloud';

	interface Props {
		isOpen: boolean;
		onSuccess?: (username: string) => void;
	}

	let { isOpen, onSuccess }: Props = $props();

	let usernameInput = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let mode = $state<'input' | 'confirm_collision'>('input');
	let collisionSummary = $state<RemoteUserSummary | null>(null);

	function formatUsername(val: string): string {
		return val.toLowerCase().replace(/[^a-z0-9-]/g, '');
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		usernameInput = formatUsername(target.value);
		errorMessage = '';
	}

	async function handleSubmit(e?: Event) {
		if (e) e.preventDefault();
		const clean = usernameInput.trim().toLowerCase();

		if (!isValidUsername(clean)) {
			errorMessage = 'Use 2–30 characters: lowercase letters, numbers, hyphens.';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const check = await checkRemoteUser(clean);
			if (check.exists) {
				collisionSummary = check;
				mode = 'confirm_collision';
				isSubmitting = false;
				return;
			}

			// Brand new username -> save and push initial local data
			setSavedUsername(clean);
			await pushData(clean);
			isSubmitting = false;
			onSuccess?.(clean);
		} catch (err) {
			console.error('Error setting username:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to connect. Please try again.';
			isSubmitting = false;
		}
	}

	async function handleConfirmExisting() {
		const clean = usernameInput.trim().toLowerCase();
		isSubmitting = true;
		errorMessage = '';

		try {
			setSavedUsername(clean);
			await pullAndMerge(clean);
			isSubmitting = false;
			onSuccess?.(clean);
		} catch (err) {
			console.error('Error syncing existing user:', err);
			errorMessage = 'Failed to sync existing account. Check connection.';
			isSubmitting = false;
		}
	}

	function handleRejectExisting() {
		mode = 'input';
		collisionSummary = null;
		errorMessage = 'Please choose a different username.';
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
		aria-labelledby="username-modal-title"
	>
		<div
			class="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-7"
		>
			{#if mode === 'input'}
				<div class="mb-5 flex items-center gap-3">
					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
					>
						<Cloud size={22} strokeWidth={2.25} />
					</div>
					<div>
						<h2
							id="username-modal-title"
							class="font-headline text-lg font-extrabold tracking-tight text-slate-900"
						>
							Choose Your Username
						</h2>
						<p class="font-sans text-xs text-slate-500">
							Sync words and study reviews across devices
						</p>
					</div>
				</div>

				<form onsubmit={handleSubmit} class="space-y-4">
					<div>
						<label
							for="username-input"
							class="mb-1.5 block font-headline text-xs font-bold tracking-wider text-slate-500 uppercase"
						>
							Username
						</label>
						<input
							id="username-input"
							type="text"
							value={usernameInput}
							oninput={handleInput}
							placeholder="e.g. learner-101"
							maxlength={30}
							autocomplete="off"
							autocapitalize="none"
							spellcheck="false"
							required
							disabled={isSubmitting}
							class="w-full rounded-2xl border border-slate-200 px-4 py-3 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden disabled:bg-slate-50"
						/>
						<p class="mt-1.5 font-sans text-xs text-slate-400">
							2–30 characters. Lowercase letters, numbers, and hyphens.
						</p>
					</div>

					{#if errorMessage}
						<div
							class="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 font-sans text-xs font-medium text-rose-700"
						>
							<AlertCircle size={15} class="mt-0.5 shrink-0" />
							<span>{errorMessage}</span>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting || !usernameInput.trim()}
						class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<Loader2 size={18} class="animate-spin" />
							<span>Checking…</span>
						{:else}
							<span>Save &amp; Continue</span>
						{/if}
					</button>
				</form>
			{:else}
				<!-- Account Collision Confirmation Mode -->
				<div class="mb-5 flex items-center gap-3">
					<div
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
					>
						<UserCheck size={22} strokeWidth={2.25} />
					</div>
					<div>
						<h2
							id="username-modal-title"
							class="font-headline text-lg font-extrabold tracking-tight text-slate-900"
						>
							Account Exists
						</h2>
						<p class="font-sans text-xs text-slate-500">Cloud profile found</p>
					</div>
				</div>

				<div
					class="mb-5 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 font-sans text-xs text-slate-700"
				>
					<p class="font-semibold text-slate-900">
						An account named <span class="font-bold text-indigo-600">"{usernameInput}"</span> already
						exists in the cloud.
					</p>
					{#if collisionSummary?.wordCount}
						<p class="mt-1 text-slate-600">
							Contains {collisionSummary.wordCount} words.
						</p>
					{/if}
					<p class="mt-2 font-medium">Is this your account?</p>
				</div>

				{#if errorMessage}
					<div
						class="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 font-sans text-xs font-medium text-rose-700"
					>
						<AlertCircle size={15} class="mt-0.5 shrink-0" />
						<span>{errorMessage}</span>
					</div>
				{/if}

				<div class="space-y-2.5">
					<button
						type="button"
						onclick={handleConfirmExisting}
						disabled={isSubmitting}
						class="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<Loader2 size={18} class="animate-spin" />
							<span>Syncing…</span>
						{:else}
							<span>Yes, sync my data</span>
						{/if}
					</button>

					<button
						type="button"
						onclick={handleRejectExisting}
						disabled={isSubmitting}
						class="flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white font-headline text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
					>
						No, choose another name
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
