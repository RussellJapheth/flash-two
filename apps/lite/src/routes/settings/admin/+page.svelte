<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { speakWord } from '$lib/audio';
	import { addMyWord } from '$lib/storage';
	import { sortWeekLabels, getCurrentWeekLabel } from '$lib/weeks';
	import {
		checkAdminPassword,
		isAdminUnlocked,
		setAdminUnlocked,
		fetchAllStudents,
		buildMasterCurriculum,
		exportMasterToTSV,
		exportMasterToJSON,
		type StudentProfile,
		type MasterWordRecord
	} from '$lib/admin';
	import {
		Shield,
		Lock,
		Users,
		BookOpen,
		RefreshCw,
		Copy,
		Download,
		Check,
		Search,
		Volume2,
		Plus,
		AlertCircle,
		LogOut,
		Clock,
		ArrowUpDown,
		ChevronDown,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	// Auth state
	let isUnlocked = $state(false);
	let passwordInput = $state('');
	let authError = $state('');

	// Data state
	let isLoading = $state(false);
	let loadError = $state('');
	let students = $state<StudentProfile[]>([]);
	let masterWords = $state<MasterWordRecord[]>([]);

	// View controls
	let activeTab = $state<'students' | 'curriculum'>('students');
	let selectedStudentUsername = $state('');
	let studentWeekFilter = $state('all');
	let studentSearchQuery = $state('');
	let studentSortBy = $state<'name' | 'practices' | 'words' | 'active' | 'accuracy'>('name');
	let isMobileRosterOpen = $state(false);

	// Master curriculum controls
	let curriculumWeekFilter = $state('all');
	let curriculumSearchQuery = $state('');
	let curriculumSortBy = $state<'hanzi' | 'practices' | 'students' | 'accuracy'>('practices');

	// Notification toasts
	let toastMessage = $state('');
	let addedWordKey = $state('');

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			if (toastMessage === msg) {
				toastMessage = '';
			}
		}, 3500);
	}

	onMount(() => {
		isUnlocked = isAdminUnlocked();
		if (isUnlocked) {
			loadData();
		}
	});

	function handleUnlock(e: SubmitEvent) {
		e.preventDefault();
		authError = '';
		if (checkAdminPassword(passwordInput)) {
			setAdminUnlocked(true);
			isUnlocked = true;
			passwordInput = '';
			loadData();
		} else {
			authError = 'Incorrect password. Please try again.';
		}
	}

	function handleLock() {
		setAdminUnlocked(false);
		isUnlocked = false;
		students = [];
		masterWords = [];
	}

	async function loadData() {
		isLoading = true;
		loadError = '';
		try {
			const loadedStudents = await fetchAllStudents();
			students = loadedStudents;
			masterWords = buildMasterCurriculum(loadedStudents);
			if (loadedStudents.length > 0 && !selectedStudentUsername) {
				selectedStudentUsername = loadedStudents[0].username;
			}
		} catch (err) {
			console.error('Admin load error:', err);
			loadError = err instanceof Error ? err.message : 'Failed to load classroom data.';
		} finally {
			isLoading = false;
		}
	}

	// Derived student data with sorting
	let sortedFilteredStudents = $derived.by(() => {
		let list = students;
		const q = studentSearchQuery.trim().toLowerCase();
		if (q) {
			list = list.filter((s) => s.username.toLowerCase().includes(q));
		}
		const sorted = [...list];
		if (studentSortBy === 'practices') {
			sorted.sort(
				(a, b) => b.totalPractices - a.totalPractices || a.username.localeCompare(b.username)
			);
		} else if (studentSortBy === 'words') {
			sorted.sort((a, b) => b.totalWords - a.totalWords || a.username.localeCompare(b.username));
		} else if (studentSortBy === 'active') {
			sorted.sort(
				(a, b) => (b.lastActive || 0) - (a.lastActive || 0) || a.username.localeCompare(b.username)
			);
		} else if (studentSortBy === 'accuracy') {
			sorted.sort(
				(a, b) => a.overallAccuracy - b.overallAccuracy || b.totalPractices - a.totalPractices
			);
		} else {
			sorted.sort((a, b) => a.username.localeCompare(b.username));
		}
		return sorted;
	});

	let selectedStudent = $derived(
		students.find((s) => s.username === selectedStudentUsername) ||
			sortedFilteredStudents[0] ||
			students[0]
	);

	function selectStudent(username: string) {
		selectedStudentUsername = username;
		studentWeekFilter = 'all';
		isMobileRosterOpen = false;
	}

	function stepStudent(delta: number) {
		if (sortedFilteredStudents.length === 0) return;
		const currentIdx = sortedFilteredStudents.findIndex(
			(s) => s.username === selectedStudent?.username
		);
		let nextIdx = currentIdx + delta;
		if (nextIdx < 0) nextIdx = sortedFilteredStudents.length - 1;
		if (nextIdx >= sortedFilteredStudents.length) nextIdx = 0;
		selectStudent(sortedFilteredStudents[nextIdx].username);
	}

	let studentWeeksList = $derived(
		selectedStudent ? ['all', ...selectedStudent.weeks.map((w) => w.week)] : ['all']
	);

	let displayedStudentWeeks = $derived(
		selectedStudent
			? studentWeekFilter === 'all'
				? selectedStudent.weeks
				: selectedStudent.weeks.filter((w) => w.week === studentWeekFilter)
			: []
	);

	// Derived curriculum data
	let allCurriculumWeeks = $derived.by(() => {
		const weekSet = new SvelteSet<string>();
		for (const w of masterWords) {
			for (const wk of w.weeks) {
				weekSet.add(wk);
			}
		}
		const sorted = sortWeekLabels(Array.from(weekSet));
		return ['all', ...sorted];
	});

	let filteredMasterWords = $derived.by(() => {
		let list = masterWords;

		// Filter by week
		if (curriculumWeekFilter !== 'all') {
			list = list.filter((w) => w.weeks.includes(curriculumWeekFilter));
		}

		// Filter by search query
		const q = curriculumSearchQuery.trim().toLowerCase();
		if (q) {
			list = list.filter(
				(w) =>
					w.hanzi.toLowerCase().includes(q) ||
					w.pinyin.toLowerCase().includes(q) ||
					w.english.toLowerCase().includes(q)
			);
		}

		// Sort
		const sorted = [...list];
		if (curriculumSortBy === 'practices') {
			sorted.sort((a, b) => b.totalPractices - a.totalPractices || a.hanzi.localeCompare(b.hanzi));
		} else if (curriculumSortBy === 'students') {
			sorted.sort(
				(a, b) => b.students.length - a.students.length || a.hanzi.localeCompare(b.hanzi)
			);
		} else if (curriculumSortBy === 'accuracy') {
			sorted.sort(
				(a, b) => a.accuracyPercent - b.accuracyPercent || b.totalPractices - a.totalPractices
			);
		} else {
			sorted.sort((a, b) => a.hanzi.localeCompare(b.hanzi));
		}

		return sorted;
	});

	async function handleCopyTSV() {
		try {
			const tsv = exportMasterToTSV(filteredMasterWords);
			await navigator.clipboard.writeText(tsv);
			showToast(`Copied ${filteredMasterWords.length} words as TSV to clipboard!`);
		} catch {
			showToast('Failed to copy TSV to clipboard.');
		}
	}

	function handleDownloadJSON() {
		try {
			const json = exportMasterToJSON(filteredMasterWords);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `curriculum-${curriculumWeekFilter}-${Date.now()}.json`;
			a.click();
			URL.revokeObjectURL(url);
			showToast('Downloaded curriculum JSON.');
		} catch {
			showToast('Failed to download JSON.');
		}
	}

	async function handleAddWordToLocal(word: MasterWordRecord) {
		try {
			await addMyWord({
				word: word.hanzi,
				pinyin: word.pinyin,
				meaning: word.english,
				example: word.example || '',
				category: word.weeks[0] || getCurrentWeekLabel()
			});
			addedWordKey = word.hanzi;
			showToast(`Added "${word.hanzi}" to your local My Words deck!`);
			setTimeout(() => {
				if (addedWordKey === word.hanzi) addedWordKey = '';
			}, 2000);
		} catch (e) {
			console.error('Failed to add word:', e);
			showToast('Failed to add word to local deck.');
		}
	}

	function formatTimestamp(ts?: number): string {
		if (!ts) return 'Never';
		const date = new Date(ts);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>admin — FlashCards Lite</title>
</svelte:head>

<TopHeader title="admin" showBack={true} onBack={() => goto(resolve('/settings' as const))} />

{#if !isUnlocked}
	<!-- Password Gate -->
	<main class="flex flex-1 flex-col items-center justify-center p-6 text-center">
		<div class="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs">
			<div
				class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
			>
				<Shield size={28} />
			</div>

			<h1 class="mt-4 font-headline text-xl font-extrabold text-slate-900">Classroom Admin</h1>
			<p class="mt-1 font-sans text-xs text-slate-500">
				Please enter the administrator password to view student records and curriculum.
			</p>

			<form onsubmit={handleUnlock} class="mt-6 space-y-4 text-left">
				<div>
					<label for="admin-pass" class="block font-sans text-xs font-semibold text-slate-700">
						Password
					</label>
					<div class="relative mt-1.5">
						<input
							type="password"
							id="admin-pass"
							bind:value={passwordInput}
							placeholder="Enter password"
							autocomplete="current-password"
							required
							class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 font-sans text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
						/>
					</div>
				</div>

				{#if authError}
					<div class="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
						<AlertCircle size={15} class="shrink-0" />
						<span>{authError}</span>
					</div>
				{/if}

				<button
					type="submit"
					class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 font-headline text-sm font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-98"
				>
					<Lock size={16} />
					<span>Unlock Dashboard</span>
				</button>

				<a
					href={resolve('/settings' as const)}
					class="block text-center font-sans text-xs font-semibold text-slate-500 hover:text-slate-800"
				>
					Return to Settings
				</a>
			</form>
		</div>
	</main>
{:else}
	<!-- Admin Dashboard -->
	<main class="flex-1 space-y-5 p-4 sm:p-6">
		<!-- Toast Alert -->
		{#if toastMessage}
			<div
				class="fixed top-16 right-4 left-4 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-lg sm:right-6 sm:left-auto"
			>
				<Check size={16} class="text-emerald-400" />
				<span>{toastMessage}</span>
			</div>
		{/if}

		<!-- Top Dashboard Bar -->
		<div
			class="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 font-sans text-[11px] font-semibold text-emerald-700"
					>
						Admin Authenticated
					</span>
					<span class="font-sans text-xs text-slate-500">
						{students.length}
						{students.length === 1 ? 'Student' : 'Students'}
					</span>
					<span class="text-slate-300">•</span>
					<span class="font-sans text-xs text-slate-500">
						{masterWords.length} Master Words
					</span>
				</div>
				<h2 class="mt-1 font-headline text-lg font-black text-slate-900">Teacher Overview</h2>
			</div>

			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={loadData}
					disabled={isLoading}
					class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 disabled:opacity-50"
				>
					<RefreshCw size={13} class={isLoading ? 'animate-spin text-indigo-600' : ''} />
					<span>Sync Data</span>
				</button>

				<button
					type="button"
					onclick={handleLock}
					class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-headline text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95"
					title="Lock Admin Mode"
				>
					<LogOut size={13} />
					<span>Lock</span>
				</button>
			</div>
		</div>

		<!-- View Switcher Tabs -->
		<div
			class="flex rounded-2xl border border-slate-200/80 bg-slate-100 p-1 font-headline text-xs font-bold"
		>
			<button
				type="button"
				onclick={() => (activeTab = 'students')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2 transition {activeTab ===
				'students'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<Users size={16} />
				<span>Student Progress ({students.length})</span>
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'curriculum')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2 transition {activeTab ===
				'curriculum'
					? 'bg-white text-indigo-600 shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<BookOpen size={16} />
				<span>Master Curriculum ({masterWords.length})</span>
			</button>
		</div>

		{#if isLoading && students.length === 0}
			<!-- Loading State -->
			<div
				class="flex flex-col items-center justify-center rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xs"
			>
				<RefreshCw size={28} class="animate-spin text-indigo-600" />
				<p class="mt-3 font-headline text-sm font-bold text-slate-800">
					Loading student rosters &amp; progress...
				</p>
				<p class="font-sans text-xs text-slate-500">Querying cloud sync backups</p>
			</div>
		{:else if loadError && students.length === 0}
			<!-- Error State -->
			<div class="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center">
				<AlertCircle size={28} class="mx-auto text-rose-600" />
				<h3 class="mt-2 font-headline text-sm font-bold text-rose-900">Failed to load classroom</h3>
				<p class="mt-1 font-sans text-xs text-rose-700">{loadError}</p>
				<button
					type="button"
					onclick={loadData}
					class="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs hover:bg-rose-700"
				>
					<RefreshCw size={14} />
					<span>Try Again</span>
				</button>
			</div>
		{:else if activeTab === 'students'}
			<!-- Tab 1: Student Progress -->
			<div class="lg:grid lg:grid-cols-12 lg:items-start lg:gap-5">
				<!-- Left Column: Student Roster -->
				<aside class="mb-4 space-y-3 lg:col-span-4 lg:mb-0 xl:col-span-3">
					<!-- Mobile Roster Header / Switcher Bar -->
					<div
						class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs lg:hidden"
					>
						<div class="flex min-w-0 items-center gap-2.5">
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-headline text-xs font-black text-white"
							>
								{selectedStudent ? selectedStudent.username.slice(0, 1).toUpperCase() : '?'}
							</div>
							<div class="truncate">
								<span class="block truncate font-headline text-xs font-bold text-slate-900">
									{selectedStudent ? selectedStudent.username : 'No student selected'}
								</span>
								{#if selectedStudent}
									<span class="block font-sans text-[10px] text-slate-500">
										{selectedStudent.totalWords} words • {selectedStudent.totalPractices} reps
									</span>
								{/if}
							</div>
						</div>

						<div class="flex shrink-0 items-center gap-1.5">
							<button
								type="button"
								onclick={() => stepStudent(-1)}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
								title="Previous student"
							>
								<ChevronLeft size={16} />
							</button>
							<button
								type="button"
								onclick={() => stepStudent(1)}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
								title="Next student"
							>
								<ChevronRight size={16} />
							</button>
							<button
								type="button"
								onclick={() => (isMobileRosterOpen = !isMobileRosterOpen)}
								class="flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 font-headline text-xs font-bold text-indigo-700 hover:bg-indigo-100 active:scale-95"
							>
								<span>Roster ({students.length})</span>
								<ChevronDown
									size={14}
									class="transition-transform {isMobileRosterOpen ? 'rotate-180' : ''}"
								/>
							</button>
						</div>
					</div>

					<!-- Roster Directory Card (always on desktop, collapsible on mobile) -->
					<div
						class="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs lg:sticky lg:top-20 {isMobileRosterOpen
							? 'block'
							: 'hidden lg:block'}"
					>
						<div class="flex items-center justify-between border-b border-slate-100 pb-3">
							<div>
								<h3 class="font-headline text-sm font-bold text-slate-900">Class Roster</h3>
								<p class="font-sans text-[11px] text-slate-500">
									Showing {sortedFilteredStudents.length} of {students.length}
								</p>
							</div>

							<!-- Sort Dropdown -->
							<select
								bind:value={studentSortBy}
								class="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 font-headline text-[11px] font-bold text-slate-700 focus:outline-none"
							>
								<option value="name">A–Z</option>
								<option value="practices">Most Practices</option>
								<option value="words">Most Words</option>
								<option value="active">Recently Active</option>
								<option value="accuracy">Lowest Accuracy</option>
							</select>
						</div>

						<!-- Search Filter -->
						<div class="relative mt-3">
							<Search size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={studentSearchQuery}
								placeholder="Filter students..."
								class="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pr-3 pl-8 font-sans text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
							/>
						</div>

						<!-- Scrollable Student List -->
						<div class="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1 lg:max-h-[calc(100vh-17rem)]">
							{#each sortedFilteredStudents as student (student.username)}
								{@const isSelected = student.username === selectedStudent?.username}
								<button
									type="button"
									onclick={() => selectStudent(student.username)}
									class="flex w-full cursor-pointer items-center justify-between rounded-xl border p-2 text-left transition {isSelected
										? 'border-indigo-600 bg-indigo-50/90 font-semibold text-indigo-950 shadow-2xs'
										: 'border-transparent text-slate-700 hover:bg-slate-50'}"
								>
									<div class="flex min-w-0 items-center gap-2">
										<div
											class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-headline text-[10px] font-black {isSelected
												? 'bg-indigo-600 text-white'
												: 'bg-slate-200 text-slate-700'}"
										>
											{student.username.slice(0, 1).toUpperCase()}
										</div>
										<div class="truncate">
											<span class="block truncate font-headline text-xs leading-tight font-bold">
												{student.username}
											</span>
											<span class="block font-sans text-[10px] text-slate-500">
												{student.totalWords} words • {student.totalPractices} reps
											</span>
										</div>
									</div>

									<span
										class="shrink-0 rounded-md px-1.5 py-0.5 font-headline text-[10px] font-bold {student.overallAccuracy >=
										80
											? 'bg-emerald-100 text-emerald-800'
											: student.overallAccuracy >= 60
												? 'bg-indigo-100 text-indigo-800'
												: student.totalPractices === 0
													? 'bg-slate-100 text-slate-500'
													: 'bg-amber-100 text-amber-800'}"
									>
										{student.overallAccuracy}%
									</span>
								</button>
							{/each}

							{#if sortedFilteredStudents.length === 0}
								<p class="py-6 text-center font-sans text-xs text-slate-400">
									No students match "{studentSearchQuery}".
								</p>
							{/if}
						</div>
					</div>
				</aside>

				<!-- Right Column: Student Details -->
				<div class="space-y-4 lg:col-span-8 xl:col-span-9">
					{#if selectedStudent}
						<!-- Selected Student Stats Header -->
						<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
							<div
								class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<div class="flex items-center gap-2">
										<h3 class="font-headline text-xl font-black text-slate-900">
											{selectedStudent.username}
										</h3>
										<span
											class="rounded-md bg-slate-100 px-2 py-0.5 font-sans text-[11px] font-semibold text-slate-600"
										>
											{selectedStudent.weeks.length} active {selectedStudent.weeks.length === 1
												? 'week'
												: 'weeks'}
										</span>
									</div>
									<p class="mt-0.5 flex items-center gap-1 font-sans text-xs text-slate-500">
										<Clock size={12} />
										<span>Last active: {formatTimestamp(selectedStudent.lastActive)}</span>
									</p>
								</div>

								<!-- Summary KPIs -->
								<div class="flex items-center gap-3">
									<div
										class="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-center"
									>
										<span class="block font-headline text-lg font-black text-slate-900">
											{selectedStudent.totalWords}
										</span>
										<span
											class="block font-sans text-[10px] font-semibold text-slate-500 uppercase"
										>
											Words
										</span>
									</div>
									<div
										class="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-center"
									>
										<span class="block font-headline text-lg font-black text-indigo-600">
											{selectedStudent.totalPractices}
										</span>
										<span
											class="block font-sans text-[10px] font-semibold text-slate-500 uppercase"
										>
											Practices
										</span>
									</div>
									<div
										class="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-center"
									>
										<span class="block font-headline text-lg font-black text-emerald-600">
											{selectedStudent.overallAccuracy}%
										</span>
										<span
											class="block font-sans text-[10px] font-semibold text-slate-500 uppercase"
										>
											Accuracy
										</span>
									</div>
								</div>
							</div>

							<!-- Student Week Filter Pills -->
							<div class="mt-4 flex flex-wrap items-center gap-1.5">
								<span class="mr-1 font-sans text-xs font-bold text-slate-400">Filter Week:</span>
								{#each studentWeeksList as wk (wk)}
									<button
										type="button"
										onclick={() => (studentWeekFilter = wk)}
										class="cursor-pointer rounded-xl px-3 py-1 font-headline text-xs font-bold transition {studentWeekFilter ===
										wk
											? 'bg-indigo-600 text-white shadow-xs'
											: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
									>
										{wk === 'all' ? 'All Weeks' : wk}
									</button>
								{/each}
							</div>
						</section>

						<!-- Week-by-Week Word Tables -->
						{#each displayedStudentWeeks as weekData (weekData.week)}
							<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
								<div
									class="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="flex items-center gap-2">
										<h4 class="font-headline text-base font-extrabold text-slate-900">
											{weekData.week}
										</h4>
										<span
											class="rounded-full bg-slate-100 px-2 py-0.5 font-sans text-xs text-slate-600"
										>
											{weekData.words.length}
											{weekData.words.length === 1 ? 'word' : 'words'}
										</span>
									</div>
									<div class="flex items-center gap-3 font-sans text-xs text-slate-500">
										<span
											>Total Practices: <strong class="font-bold text-slate-800"
												>{weekData.totalPractices}</strong
											></span
										>
										<span>•</span>
										<span
											>Mastered: <strong class="font-bold text-emerald-600"
												>{weekData.masteredCount}</strong
											></span
										>
										<span>•</span>
										<span
											>Avg Accuracy: <strong class="font-bold text-slate-800"
												>{weekData.avgAccuracy}%</strong
											></span
										>
									</div>
								</div>

								<!-- Word Table / Cards -->
								<div class="mt-3 divide-y divide-slate-100">
									{#each weekData.words as item (item.word.No)}
										<div
											class="flex flex-col gap-2 rounded-xl px-2 py-3 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
										>
											<!-- Word Details -->
											<div class="flex items-start gap-3">
												<button
													type="button"
													onclick={() => speakWord(item.word['Chinese Word'] || '', 'chinese')}
													class="mt-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
													title="Listen"
												>
													<Volume2 size={15} />
												</button>
												<div>
													<div class="flex items-baseline gap-2">
														<span class="font-headline text-base font-bold text-slate-900">
															{item.word['Chinese Word']}
														</span>
														{#if item.word.Pinyin}
															<span class="font-sans text-xs text-indigo-600">
																{item.word.Pinyin}
															</span>
														{/if}
														{#if item.word['Part of Speech']}
															<span
																class="py-0.2 rounded bg-slate-100 px-1.5 font-sans text-[10px] text-slate-500"
															>
																{item.word['Part of Speech']}
															</span>
														{/if}
													</div>
													<p class="font-sans text-xs text-slate-600">
														{item.word['English Meaning']}
													</p>
												</div>
											</div>

											<!-- Practice Stats Badges -->
											<div class="flex items-center gap-3 self-end sm:self-center">
												<!-- Mastery Status -->
												{#if item.status === 'mastered'}
													<span
														class="rounded-lg bg-emerald-50 px-2 py-1 font-sans text-xs font-bold text-emerald-700"
													>
														Mastered
													</span>
												{:else if item.status === 'struggling'}
													<span
														class="rounded-lg bg-amber-50 px-2 py-1 font-sans text-xs font-bold text-amber-700"
													>
														Needs Review
													</span>
												{:else if item.status === 'learning'}
													<span
														class="rounded-lg bg-indigo-50 px-2 py-1 font-sans text-xs font-bold text-indigo-700"
													>
														Learning
													</span>
												{:else}
													<span
														class="rounded-lg bg-slate-100 px-2 py-1 font-sans text-xs font-medium text-slate-500"
													>
														Unpracticed
													</span>
												{/if}

												<!-- Practice Count Pill -->
												<div
													class="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-right"
												>
													<span class="block font-headline text-xs font-black text-slate-900">
														{item.practiceCount}
														{item.practiceCount === 1 ? 'practice' : 'practices'}
													</span>
													<span class="block font-sans text-[10px] text-slate-500">
														{item.correctCount} correct / {item.wrongCount} wrong ({item.accuracyPercent}%)
													</span>
												</div>
											</div>
										</div>
									{/each}
								</div>
							</section>
						{/each}
					{:else}
						<div
							class="flex flex-col items-center justify-center rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-xs"
						>
							<Users size={32} class="text-slate-400" />
							<p class="mt-3 font-headline text-base font-bold text-slate-800">
								No student selected
							</p>
							<p class="font-sans text-xs text-slate-500">
								Choose a student from the roster to view their weekly progress.
							</p>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Tab 2: Master Curriculum (Deduplicated List) -->
			<div class="space-y-4">
				<!-- Header & Actions -->
				<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
					<div
						class="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div>
							<h3 class="font-headline text-lg font-black text-slate-900">
								Master Vocabulary Catalog
							</h3>
							<p class="font-sans text-xs text-slate-500">
								Deduplicated by Chinese Hanzi across all student decks.
							</p>
						</div>

						<!-- Export buttons -->
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={handleCopyTSV}
								class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
								title="Copy TSV for Google Sheets / Excel"
							>
								<Copy size={14} class="text-indigo-600" />
								<span>Copy TSV</span>
							</button>

							<button
								type="button"
								onclick={handleDownloadJSON}
								class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
								title="Download JSON Curriculum"
							>
								<Download size={14} class="text-emerald-600" />
								<span>Export JSON</span>
							</button>
						</div>
					</div>

					<!-- Filter & Sort Strip -->
					<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<!-- Week Selector Tabs -->
						<div class="flex flex-wrap items-center gap-1.5">
							{#each allCurriculumWeeks as wk (wk)}
								<button
									type="button"
									onclick={() => (curriculumWeekFilter = wk)}
									class="cursor-pointer rounded-xl px-3 py-1 font-headline text-xs font-bold transition {curriculumWeekFilter ===
									wk
										? 'bg-indigo-600 text-white shadow-xs'
										: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
								>
									{wk === 'all' ? 'All Weeks' : wk}
								</button>
							{/each}
						</div>

						<!-- Search & Sort Controls -->
						<div class="flex items-center gap-2">
							<div class="relative w-full sm:w-52">
								<Search size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									bind:value={curriculumSearchQuery}
									placeholder="Search Hanzi, pinyin..."
									class="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pr-3 pl-8 font-sans text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
								/>
							</div>

							<div class="flex items-center gap-1 text-xs text-slate-500">
								<ArrowUpDown size={13} class="shrink-0 text-slate-400" />
								<select
									bind:value={curriculumSortBy}
									class="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 font-headline text-xs font-bold text-slate-700 focus:outline-none"
								>
									<option value="practices">Most Practiced</option>
									<option value="students">Most Students</option>
									<option value="accuracy">Needs Help (Low Accuracy)</option>
									<option value="hanzi">Hanzi Alphabetical</option>
								</select>
							</div>
						</div>
					</div>
				</section>

				<!-- Master Word Table / Cards -->
				<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
					<div class="flex items-center justify-between border-b border-slate-100 pb-3">
						<span class="font-headline text-xs font-bold text-slate-500 uppercase">
							Showing {filteredMasterWords.length} Unique Words
						</span>
						<span class="font-sans text-xs text-slate-400">
							{curriculumWeekFilter === 'all' ? 'All Weeks Combined' : curriculumWeekFilter}
						</span>
					</div>

					<div class="mt-3 divide-y divide-slate-100">
						{#each filteredMasterWords as word (word.hanzi)}
							<div
								class="flex flex-col gap-2 rounded-2xl px-3 py-3.5 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
							>
								<!-- Word Left Column -->
								<div class="flex items-start gap-3">
									<button
										type="button"
										onclick={() => speakWord(word.hanzi, 'chinese')}
										class="mt-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
										title="Listen"
									>
										<Volume2 size={15} />
									</button>

									<div>
										<div class="flex items-baseline gap-2">
											<span class="font-headline text-lg font-black text-slate-900">
												{word.hanzi}
											</span>
											{#if word.pinyin}
												<span class="font-sans text-xs font-medium text-indigo-600">
													{word.pinyin}
												</span>
											{/if}
											{#if word.partOfSpeech}
												<span
													class="py-0.2 rounded bg-slate-100 px-1.5 font-sans text-[10px] text-slate-500"
												>
													{word.partOfSpeech}
												</span>
											{/if}
										</div>

										<p class="font-sans text-xs text-slate-600">
											{word.english}
										</p>

										<!-- Week Tags & Student Tags -->
										<div class="mt-1.5 flex flex-wrap items-center gap-1">
											{#each word.weeks as wk (wk)}
												<span
													class="rounded-md bg-indigo-50 px-1.5 py-0.5 font-headline text-[10px] font-bold text-indigo-700"
												>
													{wk}
												</span>
											{/each}

											<span class="text-slate-300">•</span>

											<span class="font-sans text-[10px] text-slate-500"> Students: </span>
											{#each word.students.slice(0, 4) as student (student)}
												<span
													class="rounded-md bg-slate-100 px-1.5 py-0.5 font-sans text-[10px] text-slate-700"
													title="{student} practiced {word.studentPracticeMap[student] || 0} times"
												>
													{student} ({word.studentPracticeMap[student] || 0}×)
												</span>
											{/each}
											{#if word.students.length > 4}
												<span
													class="rounded-md bg-slate-200/80 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-600"
													title={word.students
														.slice(4)
														.map((s) => `${s} (${word.studentPracticeMap[s] || 0}×)`)
														.join(', ')}
												>
													+{word.students.length - 4} more
												</span>
											{/if}
										</div>
									</div>
								</div>

								<!-- Word Right Column: Practice Stats & Actions -->
								<div class="flex items-center gap-2.5 self-end sm:self-center">
									<!-- Class Practice Stats Pill -->
									<div class="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-right">
										<span class="block font-headline text-xs font-black text-slate-900">
											{word.totalPractices} class practices
										</span>
										<span class="block font-sans text-[10px] text-slate-500">
											{word.totalCorrect} correct / {word.totalWrong} wrong ({word.accuracyPercent}%)
										</span>
									</div>

									<!-- Add to Teacher's Deck Button -->
									<button
										type="button"
										onclick={() => handleAddWordToLocal(word)}
										class="flex h-9 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 font-headline text-xs font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
										title="Add to your personal My Words deck"
									>
										{#if addedWordKey === word.hanzi}
											<Check size={14} class="text-emerald-600" />
											<span class="text-emerald-600">Added</span>
										{:else}
											<Plus size={14} />
											<span class="hidden sm:inline">Add</span>
										{/if}
									</button>
								</div>
							</div>
						{/each}

						{#if filteredMasterWords.length === 0}
							<div class="py-8 text-center">
								<p class="font-headline text-sm font-bold text-slate-700">No words found</p>
								<p class="font-sans text-xs text-slate-500">
									Try adjusting your week filter or search terms.
								</p>
							</div>
						{/if}
					</div>
				</section>
			</div>
		{/if}
	</main>
{/if}
