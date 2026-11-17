<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import {
		exportLiteBackup,
		importLiteBackup,
		getMyWordsDeck,
		getSavedUsername,
		isValidUsername
	} from '$lib/storage';
	import {
		pullAndMerge,
		pushData,
		renameUser,
		checkRemoteUser,
		subscribeSyncStatus,
		type RemoteUserSummary
	} from '$lib/cloud';
	import { pwa } from '$lib/pwa.svelte';
	import { resolve } from '$app/paths';
	import type { SyncStatus } from '@flash/shared';
	import {
		Download,
		Upload,
		CheckCircle2,
		Cloud,
		CloudCheck,
		CloudOff,
		RefreshCw,
		Pencil,
		AlertCircle,
		UserCheck,
		ShieldCheck
	} from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	let wordCount = $state(0);
	let message = $state('');
	let isError = $state(false);

	let username = $state('');
	let isEditingUsername = $state(false);
	let newUsernameInput = $state('');
	let isRenaming = $state(false);
	let renameError = $state('');

	// Collision confirmation state
	let showCollisionConfirm = $state(false);
	let collisionTargetSummary = $state<RemoteUserSummary | null>(null);

	let isSyncingManual = $state(false);
	let syncStatus = $state<SyncStatus>('idle');
	let unsubscribeStatus: (() => void) | null = null;

	async function updateStats() {
		const deck = await getMyWordsDeck();
		wordCount = deck.words?.length ?? 0;
	}

	function showToast(msg: string, error = false) {
		message = msg;
		isError = error;
		setTimeout(() => {
			if (message === msg) {
				message = '';
			}
		}, 4000);
	}

	onMount(() => {
		username = getSavedUsername();
		newUsernameInput = username;
		unsubscribeStatus = subscribeSyncStatus((s) => {
			syncStatus = s;
		});
		updateStats();
	});

	onDestroy(() => {
		unsubscribeStatus?.();
	});

	function handleStartRename() {
		newUsernameInput = username;
		renameError = '';
		showCollisionConfirm = false;
		isEditingUsername = true;
	}

	function handleCancelRename() {
		isEditingUsername = false;
		renameError = '';
		showCollisionConfirm = false;
		newUsernameInput = username;
	}

	async function handleSaveRename() {
		const clean = newUsernameInput.trim().toLowerCase();

		if (!clean) {
			renameError = 'Username cannot be empty.';
			return;
		}

		if (!isValidUsername(clean)) {
			renameError = 'Use 2–30 characters: lowercase letters, numbers, hyphens.';
			return;
		}

		if (clean === username) {
			isEditingUsername = false;
			return;
		}

		isRenaming = true;
		renameError = '';

		try {
			const check = await checkRemoteUser(clean);
			if (check.exists) {
				collisionTargetSummary = check;
				showCollisionConfirm = true;
				isRenaming = false;
				return;
			}

			const result = await renameUser(username, clean, false);
			if (result.success) {
				username = clean;
				isEditingUsername = false;
				showToast(`Account renamed to ${clean}. Data moved successfully.`);
			} else {
				renameError = result.error || 'Failed to rename account.';
			}
		} catch (err) {
			renameError = err instanceof Error ? err.message : 'Rename failed.';
		} finally {
			isRenaming = false;
		}
	}

	async function handleConfirmCollisionRename() {
		const clean = newUsernameInput.trim().toLowerCase();
		isRenaming = true;
		renameError = '';

		try {
			const result = await renameUser(username, clean, true);
			if (result.success) {
				username = clean;
				isEditingUsername = false;
				showCollisionConfirm = false;
				await updateStats();
				showToast(`Account synced with existing profile "${clean}".`);
			} else {
				renameError = result.error || 'Failed to merge account.';
			}
		} catch (err) {
			renameError = err instanceof Error ? err.message : 'Merge failed.';
		} finally {
			isRenaming = false;
		}
	}

	function handleRejectCollisionRename() {
		showCollisionConfirm = false;
		collisionTargetSummary = null;
		renameError = 'Please choose a different username.';
	}

	async function handleManualSync() {
		if (!username) {
			showToast('Please set a username to sync.', true);
			return;
		}
		isSyncingManual = true;
		try {
			const ok = await pullAndMerge(username);
			await updateStats();
			if (ok) {
				showToast('Cloud sync complete.');
			} else {
				showToast('Sync failed. Check your internet connection.', true);
			}
		} catch (err) {
			showToast(err instanceof Error ? err.message : 'Sync failed.', true);
		} finally {
			isSyncingManual = false;
		}
	}

	async function handleExport() {
		try {
			const json = await exportLiteBackup();
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `flashcards-lite-backup-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast('Backup downloaded successfully');
		} catch (e: unknown) {
			showToast(e instanceof Error ? e.message : 'Export failed', true);
		}
	}

	async function handleImport(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const res = await importLiteBackup(text);
			await updateStats();
			if (username) {
				pushData(username);
			}
			showToast(`Imported ${res.wordsCount} words successfully`);
		} catch (e: unknown) {
			showToast(e instanceof Error ? e.message : 'Import failed', true);
		} finally {
			target.value = '';
		}
	}
</script>

<svelte:head>
	<title>FlashCards Lite — Settings</title>
</svelte:head>

<TopHeader title="Settings" />

<main class="flex-1 space-y-6 px-4 pt-4 pb-8">
	<!-- Status Message Toast -->
	{#if message}
		<div
			class="flex items-center gap-2 rounded-2xl border p-3 font-sans text-xs font-semibold {isError
				? 'border-rose-200 bg-rose-50 text-rose-700'
				: 'border-emerald-200 bg-emerald-50 text-emerald-800'}"
		>
			<CheckCircle2 size={16} class="shrink-0" />
			<span>{message}</span>
		</div>
	{/if}

	<!-- Cloud Account & Sync Section -->
	<section class="space-y-3">
		<h2 class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
			Cloud Account &amp; Sync
		</h2>

		<div class="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
					>
						{#if syncStatus === 'ok'}
							<CloudCheck size={20} class="text-emerald-600" />
						{:else if syncStatus === 'error'}
							<CloudOff size={20} class="text-rose-600" />
						{:else}
							<Cloud size={20} />
						{/if}
					</div>
					<div>
						<span
							class="block font-headline text-xs font-bold tracking-wider text-slate-400 uppercase"
						>
							Active Profile
						</span>
						<span class="block font-headline text-base font-extrabold text-slate-900">
							{username || 'No user set'}
						</span>
					</div>
				</div>

				{#if !isEditingUsername}
					<button
						type="button"
						onclick={handleStartRename}
						class="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 font-headline text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
					>
						<Pencil size={13} />
						<span>Rename</span>
					</button>
				{/if}
			</div>

			<!-- Inline Rename Form -->
			{#if isEditingUsername}
				<div class="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
					{#if !showCollisionConfirm}
						<div>
							<label
								for="rename-input"
								class="mb-1 block font-headline text-xs font-bold tracking-wider text-slate-500 uppercase"
							>
								New Username
							</label>
							<input
								id="rename-input"
								type="text"
								bind:value={newUsernameInput}
								maxlength={30}
								placeholder="e.g. learner-99"
								class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
							/>
							<p class="mt-1 font-sans text-xs text-slate-400">
								2–30 chars: lowercase letters, numbers, and hyphens. Moving will transfer your data
								to the new name.
							</p>
						</div>

						{#if renameError}
							<div
								class="flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 font-sans text-xs font-medium text-rose-700"
							>
								<AlertCircle size={14} class="mt-0.5 shrink-0" />
								<span>{renameError}</span>
							</div>
						{/if}

						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={handleSaveRename}
								disabled={isRenaming || !newUsernameInput.trim()}
								class="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
							>
								{#if isRenaming}
									<span>Moving Data…</span>
								{:else}
									<span>Confirm Rename</span>
								{/if}
							</button>

							<button
								type="button"
								onclick={handleCancelRename}
								disabled={isRenaming}
								class="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 font-headline text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
							>
								Cancel
							</button>
						</div>
					{:else}
						<!-- Collision Confirmation within Settings -->
						<div class="space-y-3">
							<div class="flex items-center gap-2 font-headline text-xs font-bold text-amber-600">
								<UserCheck size={16} />
								<span>Account Already Exists</span>
							</div>
							<p class="font-sans text-xs text-slate-600">
								An account named <strong class="text-slate-900"
									>"{newUsernameInput.trim().toLowerCase()}"</strong
								>
								already exists in the cloud.
								{#if collisionTargetSummary?.wordCount}
									It has {collisionTargetSummary.wordCount} words.
								{/if}
								Is this your account? Syncing will merge your data.
							</p>

							{#if renameError}
								<div
									class="flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-2.5 font-sans text-xs font-medium text-rose-700"
								>
									<AlertCircle size={14} class="mt-0.5 shrink-0" />
									<span>{renameError}</span>
								</div>
							{/if}

							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={handleConfirmCollisionRename}
									disabled={isRenaming}
									class="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
								>
									{#if isRenaming}
										<span>Merging…</span>
									{:else}
										<span>Yes, merge with it</span>
									{/if}
								</button>

								<button
									type="button"
									onclick={handleRejectCollisionRename}
									disabled={isRenaming}
									class="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-3 font-headline text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95"
								>
									Choose another
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Manual Sync Trigger -->
			<div class="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
				<span class="font-sans text-slate-500">
					Status: <strong class="text-slate-700 capitalize">{syncStatus}</strong>
				</span>
				<button
					type="button"
					onclick={handleManualSync}
					disabled={isSyncingManual || !username}
					class="flex cursor-pointer items-center gap-1.5 font-headline font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
				>
					<RefreshCw size={13} class={isSyncingManual ? 'animate-spin' : ''} />
					<span>Sync Now</span>
				</button>
			</div>
		</div>
	</section>

	<!-- Stats Card -->
	<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
		<h2 class="font-headline text-sm font-bold text-slate-500 uppercase">Your Library</h2>
		<p class="mt-2 font-headline text-3xl font-black text-slate-900">{wordCount}</p>
		<p class="font-sans text-xs text-slate-500">Custom vocabulary words in My Words</p>
	</section>

	<!-- PWA Install Option if installable -->
	{#if pwa.isInstallable}
		<section class="space-y-3">
			<h2 class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
				Application
			</h2>
			<div class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
						>
							<Download size={20} />
						</div>
						<div>
							<span class="block font-headline text-sm font-bold text-slate-900">
								Install App
							</span>
							<span class="block font-sans text-xs text-slate-500">
								Add FlashCards Lite to your home screen
							</span>
						</div>
					</div>
					<button
						type="button"
						onclick={() => pwa.promptInstall()}
						class="flex h-9 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-3.5 font-headline text-xs font-bold text-white shadow-xs transition-transform hover:bg-indigo-700 active:scale-95"
					>
						Install
					</button>
				</div>
			</div>
		</section>
	{/if}

	<!-- Data Backup & Migration -->
	<section class="space-y-3">
		<h2 class="font-headline text-xs font-bold tracking-wider text-slate-400 uppercase">
			Backup &amp; Migration
		</h2>

		<div class="space-y-2">
			<!-- Export -->
			<button
				type="button"
				onclick={handleExport}
				class="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:bg-slate-50 active:scale-98"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
					>
						<Download size={20} />
					</div>
					<div class="text-left">
						<span class="block font-headline text-sm font-bold text-slate-900">Export Backup</span>
						<span class="block font-sans text-xs text-slate-500"
							>Download your words and review progress as JSON</span
						>
					</div>
				</div>
			</button>

			<!-- Import -->
			<label
				class="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:bg-slate-50 active:scale-98"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
					>
						<Upload size={20} />
					</div>
					<div class="text-left">
						<span class="block font-headline text-sm font-bold text-slate-900">Import Backup</span>
						<span class="block font-sans text-xs text-slate-500"
							>Restore or transfer words from Full app or JSON backup</span
						>
					</div>
				</div>
				<input type="file" accept=".json" onchange={handleImport} class="hidden" />
			</label>
		</div>
	</section>

	<!-- Discreet Admin Link -->
	<section class="pt-6 pb-4 text-center">
		<a
			href={resolve('/settings/admin' as const)}
			class="inline-flex cursor-pointer items-center gap-1.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 focus:underline focus:outline-none"
		>
			<ShieldCheck size={14} class="opacity-70" />
			<span>admin</span>
		</a>
	</section>
</main>
