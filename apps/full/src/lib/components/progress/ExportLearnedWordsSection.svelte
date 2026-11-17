<script lang="ts">
	import { FileSpreadsheet, Check, Download } from 'lucide-svelte';
	import { exportLearnedWordsCsv } from '$lib/utils/exportLearnedWords';

	interface Props {
		totalLearnedWords: number;
	}

	let { totalLearnedWords }: Props = $props();

	let isExporting = $state(false);
	let exportMessage = $state('');

	async function handleExport() {
		if (isExporting) return;
		isExporting = true;
		exportMessage = '';

		try {
			const res = await exportLearnedWordsCsv();
			if (res.count === 0) {
				exportMessage = 'No learned words yet to export.';
			} else {
				exportMessage = `Exported ${res.count} learned words!`;
			}
			setTimeout(() => {
				exportMessage = '';
			}, 3500);
		} catch (e) {
			console.error('Failed to export learned words CSV:', e);
			exportMessage = 'Export failed. Please try again.';
			setTimeout(() => {
				exportMessage = '';
			}, 3500);
		} finally {
			isExporting = false;
		}
	}
</script>

<section class="shadow-card space-y-3.5 rounded-3xl border border-slate-200/80 bg-white p-5">
	<div class="flex items-start justify-between gap-3">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600"
			>
				<FileSpreadsheet size={20} strokeWidth={2} />
			</div>
			<div>
				<h3 class="font-headline text-sm font-bold text-slate-900">Export Learned Words</h3>
				<p class="font-sans text-xs text-slate-500">
					{totalLearnedWords}
					{totalLearnedWords === 1 ? 'word' : 'words'} with study progress
				</p>
			</div>
		</div>

		{#if exportMessage}
			<span
				class="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-headline text-[11px] font-bold text-emerald-700"
			>
				<Check size={13} strokeWidth={2.5} />
				{exportMessage}
			</span>
		{/if}
	</div>

	<button
		type="button"
		id="export-learned-words-btn"
		onclick={handleExport}
		disabled={isExporting || totalLearnedWords === 0}
		class="shadow-primary-glow/20 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
	>
		<Download size={17} strokeWidth={2.25} />
		{isExporting ? 'Generating CSV…' : 'Download Learned Words (CSV)'}
	</button>
</section>
