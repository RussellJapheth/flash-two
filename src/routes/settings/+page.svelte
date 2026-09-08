<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getSavedUsername,
		setSavedUsername,
		getSavedLanguage,
		setSavedLanguage,
		getAllProgress,
		getAllCustomDecks,
		getAllSavedWords,
		saveBulkProgress,
		saveCustomDeck,
		computeStreakStats
	} from '$lib/utils/storage';
	import {
		pullAndMerge,
		pushData,
		subscribeSyncStatus
	} from '$lib/utils/cloud';
	import { speakWord } from '$lib/utils/audio';
	import type { SyncStatus, AppBackup, StreakStats } from '$lib/types';
	import { Globe, Bell, CloudCog, Download, Upload, HelpCircle, Info, BookOpen, ChevronRight } from 'lucide-svelte';

	let username = $state('russell');
	let activeLanguage = $state<'chinese' | 'french'>('chinese');
	let syncStatus = $state<SyncStatus>('idle');
	let syncMessage = $state('');

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
	let isLanguageExpanded = $state(false);
	let isSyncExpanded = $state(false);

	async function loadSettings() {
		username = getSavedUsername();
		newUsernameInput = username;
		activeLanguage = getSavedLanguage();
		const progress = await getAllProgress();
		streakStats = computeStreakStats(progress);
	}

	function handleLanguageChange(lang: 'chinese' | 'french') {
		activeLanguage = lang;
		setSavedLanguage(lang);
	}

	async function handleSaveUsername() {
		if (newUsernameInput.trim()) {
			const clean = newUsernameInput.trim().toLowerCase();
			username = clean;
			setSavedUsername(clean);
			isEditingUsername = false;
			await pullAndMerge(clean);
		}
	}

	async function handleManualPush() {
		syncMessage = 'Pushing to cloud…';
		const success = await pushData(username);
		syncMessage = success ? 'Pushed successfully!' : 'Push failed. Check your connection.';
		setTimeout(() => (syncMessage = ''), 4000);
	}

	async function handleManualPull() {
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
			username
		};

		const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `flashcards-backup-${username}-${new Date().toISOString().split('T')[0]}.json`;
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

<div class="flex min-h-screen flex-col bg-[#F4F5FF]">
	<!-- Page Header -->
	<header class="bg-white px-4 pt-5 pb-4">
		<h1 class="font-sans text-2xl font-bold text-gray-900">Settings</h1>
	</header>

	<main class="flex-1 px-4 pb-10 space-y-4 pt-4">
		<!-- ── Profile Card ── -->
		<section class="rounded-3xl bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3.5">
					<!-- Avatar -->
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl uppercase shadow-inner"
					>
						{username ? username[0] : 'U'}
					</div>
					<div>
						{#if isEditingUsername}
							<div class="flex items-center gap-2">
								<input
									type="text"
									id="username-input"
									bind:value={newUsernameInput}
									class="w-32 rounded-xl border border-gray-200 px-2.5 py-1.5 text-sm font-semibold text-gray-900 focus:border-indigo-500 focus:outline-none"
								/>
								<button
									type="button"
									onclick={handleSaveUsername}
									class="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white active:scale-95"
								>
									Save
								</button>
								<button
									type="button"
									onclick={() => (isEditingUsername = false)}
									class="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600"
								>
									Cancel
								</button>
							</div>
						{:else}
							<p class="text-base font-bold text-gray-900 capitalize">{username}</p>
							<p class="text-xs text-gray-400 mt-0.5">Go further, one card at a time.</p>
						{/if}
					</div>
				</div>

				{#if !isEditingUsername}
					<button
						type="button"
						onclick={() => (isEditingUsername = true)}
						aria-label="Edit username"
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95 transition-colors"
					>
						<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
					</button>
				{/if}
			</div>
		</section>

		<!-- ── Settings Rows ── -->
		<section class="rounded-3xl bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
			<!-- Language -->
			<button
				type="button"
				id="settings-language-toggle"
				onclick={() => (isLanguageExpanded = !isLanguageExpanded)}
				class="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center gap-3.5">
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-500">
						<Globe size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Language</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-400">{languageLabel}</span>
					<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300 transition-transform duration-200 {isLanguageExpanded ? 'rotate-90' : ''}" />
				</div>
			</button>

			{#if isLanguageExpanded}
				<div class="px-5 py-3 bg-gray-50 flex gap-2">
					<button
						type="button"
						onclick={() => handleLanguageChange('chinese')}
						class="flex-1 rounded-full py-2 text-sm font-bold transition-all {activeLanguage ===
						'chinese'
							? 'bg-indigo-600 text-white shadow-sm'
							: 'bg-white text-gray-500 border border-gray-200'}"
					>
						Chinese
					</button>
					<button
						type="button"
						onclick={() => handleLanguageChange('french')}
						class="flex-1 rounded-full py-2 text-sm font-bold transition-all {activeLanguage ===
						'french'
							? 'bg-indigo-600 text-white shadow-sm'
							: 'bg-white text-gray-500 border border-gray-200'}"
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
				class="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-500"
					>
						<Bell size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Pronunciation Test</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-gray-400">Test voice</span>
					<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
				</div>
			</button>

			<!-- Cloud Sync toggle row -->
			<button
				type="button"
				id="settings-sync-toggle"
				onclick={() => (isSyncExpanded = !isSyncExpanded)}
				class="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500"
					>
						<CloudCog size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Cloud Sync</span>
				</div>
				<div class="flex items-center gap-2">
					<span
						class="text-sm {syncStatus === 'ok'
							? 'text-green-500'
							: syncStatus === 'error'
								? 'text-red-400'
								: 'text-gray-400'}"
					>
						{syncStatusLabel}
					</span>
					<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300 transition-transform duration-200 {isSyncExpanded ? 'rotate-90' : ''}" />
				</div>
			</button>

			{#if isSyncExpanded}
				<div class="px-5 py-3 bg-gray-50 space-y-2">
					{#if syncMessage}
						<p class="text-xs font-semibold text-indigo-600 pb-1">{syncMessage}</p>
					{/if}
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={handleManualPush}
							class="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 font-sans text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
						>
							<Upload size={14} strokeWidth={2} />
							Push
						</button>
						<button
							type="button"
							onclick={handleManualPull}
							class="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-white border border-gray-200 font-sans text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
						>
							<Download size={14} strokeWidth={2} />
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
				class="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-600"
					>
						<Download size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Export Backup</span>
				</div>
				<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
			</button>

			<!-- Import / Restore -->
			<label
				id="settings-import-backup"
				class="flex w-full cursor-pointer items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600"
					>
						<Upload size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Restore from File</span>
				</div>
				<input type="file" accept=".json" onchange={handleImportFile} class="hidden" />
				<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
			</label>

			<!-- Help & Support -->
			<div class="flex items-center justify-between px-5 py-4">
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-500"
					>
						<HelpCircle size={18} strokeWidth={1.75} />
					</div>
					<span class="text-sm font-semibold text-gray-800">Help & Support</span>
				</div>
				<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
			</div>

			<!-- About -->
			<div class="flex items-center justify-between px-5 py-4">
				<div class="flex items-center gap-3.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
					>
						<Info size={18} strokeWidth={1.75} />
					</div>
					<div>
						<span class="text-sm font-semibold text-gray-800">About FlashCards</span>
					</div>
				</div>
				<ChevronRight size={18} strokeWidth={1.75} class="text-gray-300" />
			</div>
		</section>

		<!-- ── Motivational Footer Card ── -->
		<section class="rounded-3xl bg-white px-5 py-6 shadow-sm text-center space-y-2">
			<div
				class="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
			>
				<BookOpen size={30} strokeWidth={1.5} />
			</div>
			<p class="font-bold text-gray-900 text-base">Better every day</p>
			<p class="text-xs text-gray-400 leading-relaxed">Your future self will thank you.</p>

			<!-- App version -->
			<p class="text-[11px] text-gray-300 pt-2 font-medium">
				FlashCards v1.0 · PWA · SM-2 SRS · Offline
			</p>
		</section>
	</main>
</div>
