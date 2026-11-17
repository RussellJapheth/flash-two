<script lang="ts">
	import TopHeader from '$lib/components/TopHeader.svelte';
	import { exportLiteBackup, importLiteBackup, getMyWordsDeck } from '$lib/storage';
	import { Download, Upload, CheckCircle2 } from 'lucide-svelte';

	let wordCount = $state(0);
	let message = $state('');
	let isError = $state(false);

	async function updateStats() {
		const deck = await getMyWordsDeck();
		wordCount = deck.words?.length ?? 0;
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
			message = 'Backup downloaded successfully';
			isError = false;
		} catch (e: unknown) {
			message = e instanceof Error ? e.message : 'Export failed';
			isError = true;
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
			message = `Imported ${res.wordsCount} words successfully`;
			isError = false;
		} catch (e: unknown) {
			message = e instanceof Error ? e.message : 'Import failed';
			isError = true;
		} finally {
			target.value = '';
		}
	}

	$effect(() => {
		updateStats();
	});
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
			<CheckCircle2 size={16} />
			<span>{message}</span>
		</div>
	{/if}

	<!-- Stats Card -->
	<section class="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
		<h2 class="font-headline text-sm font-bold text-slate-500 uppercase">Your Library</h2>
		<p class="mt-2 font-headline text-3xl font-black text-slate-900">{wordCount}</p>
		<p class="font-sans text-xs text-slate-500">Custom vocabulary words in My Words</p>
	</section>

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
</main>
