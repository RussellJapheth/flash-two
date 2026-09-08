<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
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
		subscribeSyncStatus,
		getSyncStatus
	} from '$lib/utils/cloud';
	import { speakWord } from '$lib/utils/audio';
	import type { SyncStatus, AppBackup, StreakStats } from '$lib/types';

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

	let isEditingUsername = $state(false);
	let newUsernameInput = $state('');

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
		syncMessage = 'Pushing local data to JSON Drive...';
		const success = await pushData(username);
		syncMessage = success
			? 'Successfully pushed to JSON Drive!'
			: 'Failed to push to cloud. Check internet connection.';
		setTimeout(() => (syncMessage = ''), 4000);
	}

	async function handleManualPull() {
		syncMessage = 'Pulling latest backup from JSON Drive...';
		const success = await pullAndMerge(username);
		syncMessage = success
			? 'Successfully merged remote data!'
			: 'Failed to pull. Ensure user exists on cloud.';
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

		const jsonStr = JSON.stringify(backup, null, 2);
		const blob = new Blob([jsonStr], { type: 'application/json' });
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
				if (parsed.progress) {
					await saveBulkProgress(parsed.progress);
				}
				if (Array.isArray(parsed.customDecks)) {
					for (const d of parsed.customDecks) {
						await saveCustomDeck(d);
					}
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
			} catch (err) {
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

<main class="flex-1 px-4 pt-3 pb-8 space-y-4">
	<!-- User Profile Card -->
	<section
		class="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-card space-y-3"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-headline text-lg font-bold uppercase shadow-sm"
				>
					{username ? username[0] : 'U'}
				</div>
				<div>
					{#if isEditingUsername}
						<div class="flex items-center gap-2">
							<input
								type="text"
								bind:value={newUsernameInput}
								class="rounded-xl border border-surface-container px-2 py-1 text-xs font-bold text-on-surface focus:border-primary focus:outline-none"
							/>
							<button
								type="button"
								onclick={handleSaveUsername}
								class="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white"
							>
								Save
							</button>
						</div>
					{:else}
						<h2 class="font-headline text-lg font-bold text-on-surface capitalize">
							{username}
						</h2>
						<p class="font-body text-xs text-on-surface-variant">
							JSON Drive Key: <code>users/{username}</code>
						</p>
					{/if}
				</div>
			</div>

			{#if !isEditingUsername}
				<button
					type="button"
					onclick={() => (isEditingUsername = true)}
					class="rounded-full bg-surface-container px-3 py-1 font-headline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
				>
					Edit
				</button>
			{/if}
		</div>
	</section>

	<!-- Cloud Synchronization Section (JSON Drive) -->
	<section
		class="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-card space-y-3"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="material-symbols-outlined text-[20px] text-primary">cloud_sync</span>
				<h3 class="font-headline text-sm font-bold text-on-surface">JSON Drive Cloud Sync</h3>
			</div>

			<span
				class="rounded-full px-2.5 py-0.5 font-headline text-[11px] font-bold capitalize {syncStatus ===
				'ok'
					? 'bg-emerald-50 text-emerald-700'
					: syncStatus === 'syncing'
						? 'bg-primary-fixed text-primary animate-pulse'
						: syncStatus === 'error'
							? 'bg-rose-50 text-rose-700'
							: 'bg-surface-container text-on-surface-variant'}"
			>
				{syncStatus}
			</span>
		</div>

		<p class="font-body text-xs text-on-surface-variant leading-relaxed">
			Endpoint: <code>https://json-drive.thespot.workers.dev/api/flashcards/</code>
		</p>

		{#if syncMessage}
			<p class="text-xs font-semibold text-primary">{syncMessage}</p>
		{/if}

		<div class="grid grid-cols-2 gap-2 pt-2">
			<button
				type="button"
				onclick={handleManualPush}
				class="flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary-container font-headline text-xs font-bold text-white shadow-sm hover:bg-primary active:scale-95"
			>
				<span class="material-symbols-outlined text-[18px]">cloud_upload</span>
				<span>Push to Cloud</span>
			</button>

			<button
				type="button"
				onclick={handleManualPull}
				class="flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface-container font-headline text-xs font-bold text-on-surface hover:bg-surface-container-high active:scale-95"
			>
				<span class="material-symbols-outlined text-[18px]">cloud_download</span>
				<span>Pull & Merge</span>
			</button>
		</div>
	</section>

	<!-- Learning Preferences -->
	<section
		class="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-card space-y-4"
	>
		<h3 class="font-headline text-sm font-bold text-on-surface">Preferences</h3>

		<!-- Default Language Selection -->
		<div class="flex items-center justify-between">
			<div>
				<p class="font-headline text-xs font-bold text-on-surface">Active Language</p>
				<p class="text-[11px] text-on-surface-variant">Switch default dashboard packs</p>
			</div>

			<div class="flex rounded-full bg-surface-container p-0.5 border border-surface-container-high">
				<button
					type="button"
					onclick={() => handleLanguageChange('chinese')}
					class="rounded-full px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'chinese'
						? 'bg-primary-container text-white shadow-sm'
						: 'text-on-surface-variant'}"
				>
					Chinese
				</button>
				<button
					type="button"
					onclick={() => handleLanguageChange('french')}
					class="rounded-full px-3 py-1 font-headline text-xs font-bold transition-all {activeLanguage ===
					'french'
						? 'bg-primary-container text-white shadow-sm'
						: 'text-on-surface-variant'}"
				>
					French
				</button>
			</div>
		</div>

		<!-- Audio Speech Pronunciation Test -->
		<div class="flex items-center justify-between pt-2 border-t border-surface-container">
			<div>
				<p class="font-headline text-xs font-bold text-on-surface">Speech Pronunciation</p>
				<p class="text-[11px] text-on-surface-variant">Web Speech Synthesis API</p>
			</div>

			<button
				type="button"
				onclick={handleTestTTS}
				class="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 font-headline text-xs font-bold text-primary hover:bg-surface-container-high"
			>
				<span class="material-symbols-outlined text-[16px]">volume_up</span>
				<span>Test Voice</span>
			</button>
		</div>
	</section>

	<!-- Backup & Local Data Management -->
	<section
		class="rounded-3xl border border-surface-container bg-surface-container-lowest p-5 shadow-card space-y-3"
	>
		<h3 class="font-headline text-sm font-bold text-on-surface">Data Backup & Restore</h3>

		<div class="space-y-2">
			<button
				type="button"
				onclick={handleExportBackup}
				class="flex h-11 w-full items-center justify-between rounded-2xl bg-surface-container-low px-4 font-headline text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
			>
				<span class="flex items-center gap-2">
					<span class="material-symbols-outlined text-[18px] text-primary">download</span>
					<span>Export Full JSON Backup</span>
				</span>
				<span class="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
			</button>

			<label
				class="flex h-11 w-full cursor-pointer items-center justify-between rounded-2xl bg-surface-container-low px-4 font-headline text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
			>
				<span class="flex items-center gap-2">
					<span class="material-symbols-outlined text-[18px] text-primary">upload</span>
					<span>Restore from JSON File</span>
				</span>
				<input type="file" accept=".json" onchange={handleImportFile} class="hidden" />
				<span class="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
			</label>
		</div>
	</section>

	<!-- App & PWA Status Info -->
	<section class="rounded-3xl bg-surface-container-low p-4 text-center text-xs text-on-surface-variant">
		<p class="font-headline font-bold text-on-surface">FlashCards App v1.0</p>
		<p class="text-[11px] mt-0.5">PWA Ready • 100% Offline Capable • SM-2 SRS Engine</p>
	</section>
</main>
