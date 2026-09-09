<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { onMount } from 'svelte';
	import {
		getSavedUsername,
		setSavedUsername,
		isValidUsername,
		getSavedLanguage,
		setSavedLanguage,
		isLeaderboardDisabled,
		setLeaderboardDisabled,
		getAllProgress,
		getAllCustomDecks,
		getAllSavedWords,
		saveBulkProgress,
		saveCustomDeck,
		computeStreakStats,
		clearOfflineCache
	} from '$lib/utils/storage';
	import { pullAndMerge, pushData, subscribeSyncStatus } from '$lib/utils/cloud';
	import { syncXPLeaderboard } from '$lib/utils/xp';
	import { syncPendingGameScores } from '$lib/utils/gameStorage';
	import { speakWord } from '$lib/utils/audio';
	import type { SyncStatus, AppBackup, StreakStats } from '$lib/types';
	import {
		Globe,
		Bell,
		CloudCog,
		Trophy,
		Download,
		Upload,
		Trash2,
		HelpCircle,
		Info,
		BookOpen,
		ChevronRight
	} from 'lucide-svelte';

	let username = $state('');
	let activeLanguage = $state<'chinese' | 'french'>('chinese');
	let syncStatus = $state<SyncStatus>('idle');
	let syncMessage = $state('');
	let isClearingCache = $state(false);
	let cacheMessage = $state('');
	let leaderboardDisabled = $state(true);

	let streakStats = $state<StreakStats>({
		currentStreak: 0,
		longestStreak: 0,
		freezeCount: 2,
		tierName: 'Novice Explorer',
		totalReviews: 0,
		activeDates: []
	});

	// Modal / expansion states
	let isEditingUsername = $state(false);
	let newUsernameInput = $state('');
	let usernameError = $state('');
	let isLanguageExpanded = $state(false);
	let isSyncExpanded = $state(false);

	async function loadSettings() {
		username = getSavedUsername();
		newUsernameInput = username;
		activeLanguage = getSavedLanguage();
		leaderboardDisabled = isLeaderboardDisabled();
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);
	}

	async function handleToggleLeaderboard() {
		const next = !leaderboardDisabled;
		leaderboardDisabled = next;
		setLeaderboardDisabled(next);
		if (navigator.onLine) {
			syncXPLeaderboard().catch((e) => console.warn('Sync XP on toggle error:', e));
			syncPendingGameScores().catch((e) => console.warn('Sync games on toggle error:', e));
		}
	}

	function handleLanguageChange(lang: 'chinese' | 'french') {
		activeLanguage = lang;
		setSavedLanguage(lang);
	}

	async function handleSaveUsername() {
		const clean = newUsernameInput.trim().toLowerCase();
		if (clean) {
			if (!isValidUsername(clean)) {
				usernameError = 'Lowercase letters, numbers, and hyphens only.';
				return;
			}
			username = clean;
			setSavedUsername(clean);
			isEditingUsername = false;
			usernameError = '';
			await pullAndMerge(clean);
		} else {
			setSavedUsername('');
			username = '';
			isEditingUsername = false;
			usernameError = '';
		}
	}

	async function handleManualPush() {
		if (!username) {
			syncMessage = 'Please enter a username above to sync with cloud.';
			setTimeout(() => (syncMessage = ''), 4000);
			return;
		}
		syncMessage = 'Pushing to cloud…';
		const success = await pushData(username);
		syncMessage = success ? 'Pushed successfully!' : 'Push failed. Check your connection.';
		setTimeout(() => (syncMessage = ''), 4000);
	}

	async function handleManualPull() {
		if (!username) {
			syncMessage = 'Please enter a username above to sync with cloud.';
			setTimeout(() => (syncMessage = ''), 4000);
			return;
		}
		syncMessage = 'Pulling from cloud…';
		const success = await pullAndMerge(username);
		syncMessage = success ? 'Data merged!' : 'Pull failed. User may not exist in cloud.';
		setTimeout(() => (syncMessage = ''), 4000);
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);
	}

	async function handleExportBackup() {
		const progress = await getAllProgress();
		const customDecks = await getAllCustomDecks();
		const savedWords = await getAllSavedWords();
		const language = getSavedLanguage();

		const backup: AppBackup = {
			version: 1,
			exportedAt: Date.now(),
			progress,
			customDecks,
			savedWords,
			language,
			username: username || undefined
		};

		const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const nameTag = username || 'local';
		a.download = `flashcards-backup-${nameTag}-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImportFile(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const file = target.files[0];
		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const content = e.target?.result as string;
				const parsed: AppBackup = JSON.parse(content);
				if (parsed.progress) await saveBulkProgress(parsed.progress);
				if (Array.isArray(parsed.customDecks)) {
					for (const d of parsed.customDecks) await saveCustomDeck(d);
				}
				if (parsed.username) {
					setSavedUsername(parsed.username);
					username = parsed.username;
				}
				if (parsed.language) {
					setSavedLanguage(parsed.language);
					activeLanguage = parsed.language;
				}
				alert('Backup imported successfully!');
				await pushData();
				await loadSettings();
			} catch {
				alert('Invalid backup JSON file.');
			}
		};
		reader.readAsText(file);
	}

	async function handleClearCache() {
		isClearingCache = true;
		try {
			await clearOfflineCache();
			cacheMessage = 'Offline cache cleared!';
		} catch {
			cacheMessage = 'Error clearing cache';
		} finally {
			isClearingCache = false;
			setTimeout(() => {
				cacheMessage = '';
			}, 3500);
		}
	}

	function handleTestTTS() {
		if (activeLanguage === 'chinese') {
			speakWord('你好，欢迎学习中文！', 'chinese');
		} else {
			speakWord('Bonjour, bienvenue pour apprendre le français !', 'french');
		}
	}

	let syncStatusLabel = $derived(
		syncStatus === 'ok'
			? 'Synced'
			: syncStatus === 'syncing'
				? 'Syncing…'
				: syncStatus === 'error'
					? 'Error'
					: syncStatus === 'pending'
						? 'Pending'
						: 'Idle'
	);

	let languageLabel = $derived(activeLanguage === 'chinese' ? 'Chinese' : 'French');

	onMount(() => {
		loadSettings();
		const unsub = subscribeSyncStatus((s) => (syncStatus = s));
		return unsub;
	});
</script>

<svelte:head>
	<title>Settings — FlashCards</title>
</svelte:head>

<TopHeader title="Settings" streak={streakStats.currentStreak} />

<main class="flex-1 space-y-5 px-4 pt-4 pb-8">
	<!-- ── Profile Card ── -->
	<section
		class="shadow-card relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3.5">
				<!-- Avatar -->
				<div
					class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 font-headline text-xl font-extrabold text-indigo-600 uppercase shadow-xs"
				>
					{username ? username[0] : '👤'}
				</div>
				<div>
					{#if isEditingUsername}
						<form
							onsubmit={(e) => {
								e.preventDefault();
								handleSaveUsername();
							}}
							class="space-y-1.5"
						>
							<div class="flex items-center gap-2">
								<input
									type="text"
									id="username-input"
									bind:value={newUsernameInput}
									oninput={() => {
										usernameError = '';
									}}
									placeholder="e.g. user-123"
									autocapitalize="none"
									autocomplete="username"
									spellcheck="false"
									class="w-36 rounded-xl border {usernameError
										? 'border-rose-300 focus:border-rose-500'
										: 'border-slate-200 focus:border-indigo-600'} bg-white px-2.5 py-1.5 font-headline text-sm font-semibold text-slate-900 focus:outline-none"
								/>
								<button
									type="submit"
									id="save-username-btn"
									class="rounded-xl bg-indigo-600 px-3 py-1.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
								>
									Save
								</button>
								<button
									type="button"
									onclick={() => {
										isEditingUsername = false;
										usernameError = '';
									}}
									class="rounded-xl bg-slate-100 px-3 py-1.5 font-headline text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95"
								>
									Cancel
								</button>
							</div>
							{#if usernameError}
								<p class="font-headline text-[11px] font-semibold text-rose-500">
									{usernameError}
								</p>
							{/if}
						</form>
					{:else}
						<p class="font-headline text-base font-bold text-slate-900">
							{username || 'Guest Learner'}
						</p>
						<p class="font-body mt-0.5 text-xs text-slate-500">
							{username ? 'Cloud profile active' : 'Local data mode • Tap to set cloud profile'}
						</p>
					{/if}
				</div>
			</div>

			{#if !isEditingUsername}
				<button
					type="button"
					onclick={() => {
						newUsernameInput = username;
						usernameError = '';
						isEditingUsername = true;
					}}
					aria-label={username ? 'Edit username' : 'Set username'}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
				>
					<ChevronRight size={18} strokeWidth={2} class="text-slate-500" />
				</button>
			{/if}
		</div>
	</section>

	<!-- ── Settings List ── -->
	<section
		class="shadow-card divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80 bg-white"
	>
		<!-- Language -->
		<button
			type="button"
			id="settings-language-toggle"
			onclick={() => (isLanguageExpanded = !isLanguageExpanded)}
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600"
				>
					<Globe size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Active Language</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="font-headline text-xs font-semibold text-slate-500">{languageLabel}</span>
				<ChevronRight
					size={18}
					strokeWidth={2}
					class="text-slate-400 transition-transform duration-200 {isLanguageExpanded
						? 'rotate-90'
						: ''}"
				/>
			</div>
		</button>

		{#if isLanguageExpanded}
			<div class="flex gap-2 bg-slate-50 p-3">
				<button
					type="button"
					onclick={() => handleLanguageChange('chinese')}
					class="flex-1 rounded-xl py-2 font-headline text-xs font-bold transition-all {activeLanguage ===
					'chinese'
						? 'bg-indigo-600 text-white shadow-xs'
						: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}"
				>
					Chinese
				</button>
				<button
					type="button"
					onclick={() => handleLanguageChange('french')}
					class="flex-1 rounded-xl py-2 font-headline text-xs font-bold transition-all {activeLanguage ===
					'french'
						? 'bg-indigo-600 text-white shadow-xs'
						: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}"
				>
					French
				</button>
			</div>
		{/if}

		<!-- Notification (TTS test) -->
		<button
			type="button"
			id="settings-tts-test"
			onclick={handleTestTTS}
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600"
				>
					<Bell size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Pronunciation Audio Test</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="font-headline text-xs font-semibold text-slate-400">Play sample</span>
				<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
			</div>
		</button>

		<!-- Disable Leaderboards Toggle -->
		<div
			class="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50/60"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/80 bg-amber-50 text-amber-600"
				>
					<Trophy size={18} strokeWidth={2} />
				</div>
				<div class="text-left">
					<span class="block font-headline text-sm font-bold text-slate-900"
						>Disable Leaderboards</span
					>
					<span class="block font-sans text-xs text-slate-500"
						>Hide rankings and keep scores private</span
					>
				</div>
			</div>
			<button
				type="button"
				id="settings-leaderboard-toggle"
				role="switch"
				aria-checked={leaderboardDisabled}
				aria-label="Disable Leaderboards"
				onclick={handleToggleLeaderboard}
				class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none {leaderboardDisabled
					? 'bg-indigo-600'
					: 'bg-slate-200'}"
			>
				<span
					class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {leaderboardDisabled
						? 'translate-x-5'
						: 'translate-x-0'}"
				></span>
			</button>
		</div>

		<!-- Cloud Sync toggle row -->
		<button
			type="button"
			id="settings-sync-toggle"
			onclick={() => (isSyncExpanded = !isSyncExpanded)}
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600"
				>
					<CloudCog size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Cloud Sync & Storage</span>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="font-headline text-xs font-bold {syncStatus === 'ok'
						? 'text-emerald-600'
						: syncStatus === 'error'
							? 'text-rose-600'
							: 'text-slate-500'}"
				>
					{syncStatusLabel}
				</span>
				<ChevronRight
					size={18}
					strokeWidth={2}
					class="text-slate-400 transition-transform duration-200 {isSyncExpanded
						? 'rotate-90'
						: ''}"
				/>
			</div>
		</button>

		{#if isSyncExpanded}
			<div class="space-y-2.5 bg-slate-50 p-4">
				{#if syncMessage}
					<p class="font-headline text-xs font-bold text-indigo-600">{syncMessage}</p>
				{/if}
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={handleManualPush}
						class="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 font-headline text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95"
					>
						<Upload size={15} strokeWidth={2.25} />
						Push to Cloud
					</button>
					<button
						type="button"
						onclick={handleManualPull}
						class="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white font-headline text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-100 active:scale-95"
					>
						<Download size={15} strokeWidth={2.25} />
						Pull & Merge
					</button>
				</div>
			</div>
		{/if}

		<!-- Export Backup -->
		<button
			type="button"
			id="settings-export-backup"
			onclick={handleExportBackup}
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600"
				>
					<Download size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Export Backup File</span>
			</div>
			<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
		</button>

		<!-- Import / Restore -->
		<label
			id="settings-import-backup"
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600"
				>
					<Upload size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Restore from File</span>
			</div>
			<input type="file" accept=".json" onchange={handleImportFile} class="hidden" />
			<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
		</label>

		<!-- Clear Offline Cache -->
		<button
			type="button"
			id="settings-clear-cache"
			onclick={handleClearCache}
			disabled={isClearingCache}
			class="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50 disabled:opacity-50"
		>
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600"
				>
					<Trash2 size={18} strokeWidth={2} />
				</div>
				<div class="text-left">
					<span class="block font-headline text-sm font-bold text-slate-900"
						>Clear Offline Cache</span
					>
					<span class="block font-sans text-xs text-slate-500"
						>Purge cached packs & temporary storage</span
					>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if cacheMessage}
					<span class="font-headline text-xs font-bold text-emerald-600">{cacheMessage}</span>
				{/if}
				<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
			</div>
		</button>

		<!-- Help & Support -->
		<div class="flex items-center justify-between px-5 py-4">
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600"
				>
					<HelpCircle size={18} strokeWidth={2} />
				</div>
				<span class="font-headline text-sm font-bold text-slate-900">Help & Shortcuts</span>
			</div>
			<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
		</div>

		<!-- About -->
		<div class="flex items-center justify-between px-5 py-4">
			<div class="flex items-center gap-3.5">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600"
				>
					<Info size={18} strokeWidth={2} />
				</div>
				<div>
					<span class="font-headline text-sm font-bold text-slate-900">About FlashCards</span>
				</div>
			</div>
			<ChevronRight size={18} strokeWidth={2} class="text-slate-400" />
		</div>
	</section>

	<!-- ── Motivational Footer Card ── -->
	<section
		class="shadow-card space-y-2 rounded-3xl border border-slate-200/80 bg-white px-5 py-6 text-center"
	>
		<div
			class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600"
		>
			<BookOpen size={24} strokeWidth={2} />
		</div>
		<p class="font-headline text-base font-extrabold text-slate-900">Better Every Day</p>
		<p class="font-body text-xs text-slate-500">Your future self will thank you.</p>

		<!-- App version -->
		<p class="pt-2 font-headline text-[11px] font-semibold text-slate-400">
			FlashCards v1.0 • PWA • SM-2 SRS • 100% Offline
		</p>
	</section>
</main>
