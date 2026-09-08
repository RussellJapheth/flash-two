<script lang="ts">
	import type { CustomDeck, WordRecord } from '$lib/types';
	import {
		X,
		Plus,
		Trash2,
		Copy,
		Sparkles,
		ClipboardPaste,
		Rows3,
		Check,
		AlertCircle
	} from 'lucide-svelte';

	interface SpreadsheetRow {
		id: string;
		targetWord: string;
		phonetic: string;
		meaning: string;
		partOfSpeech: string;
		example: string;
	}

	let {
		isOpen = false,
		deckToEdit = null,
		initialLanguage = 'chinese',
		onClose,
		onSave
	} = $props<{
		isOpen: boolean;
		deckToEdit?: CustomDeck | null;
		initialLanguage?: 'chinese' | 'french';
		onClose: () => void;
		onSave: (deck: CustomDeck) => void | Promise<void>;
	}>();

	let deckName = $state('');
	let deckLang = $state<'chinese' | 'french'>('chinese');
	let rows = $state<SpreadsheetRow[]>([]);
	let isSaving = $state(false);
	let errorMessage = $state('');
	let showPasteModal = $state(false);
	let pasteRawText = $state('');

	// Generate default blank rows
	function createBlankRow(): SpreadsheetRow {
		return {
			id: `row-${Math.random().toString(36).slice(2, 9)}`,
			targetWord: '',
			phonetic: '',
			meaning: '',
			partOfSpeech: 'noun',
			example: ''
		};
	}

	$effect(() => {
		if (isOpen) {
			errorMessage = '';
			if (deckToEdit) {
				deckName = deckToEdit.name;
				deckLang = deckToEdit.language || 'chinese';
				rows = deckToEdit.words.map((w: WordRecord) => ({
					id: `row-${w.No}-${Math.random().toString(36).slice(2, 6)}`,
					targetWord:
						(deckToEdit.language === 'french' ? w['French Word'] : w['Chinese Word']) ||
						w['Chinese Word'] ||
						w['French Word'] ||
						'',
					phonetic: w.Pinyin || '',
					meaning: w['English Meaning'] || '',
					partOfSpeech: w['Part of Speech'] || 'noun',
					example:
						(deckToEdit.language === 'french'
							? w['Example (French)']
							: w['Example (Chinese + Pinyin)']) ||
						w['Example (Chinese + Pinyin)'] ||
						w['Example (French)'] ||
						''
				}));
				if (rows.length === 0) {
					rows = [createBlankRow(), createBlankRow(), createBlankRow()];
				}
			} else {
				deckName = '';
				deckLang = initialLanguage;
				rows = [
					createBlankRow(),
					createBlankRow(),
					createBlankRow(),
					createBlankRow(),
					createBlankRow()
				];
			}
		}
	});

	let validRowCount = $derived(
		rows.filter((r) => r.targetWord.trim().length > 0 && r.meaning.trim().length > 0).length
	);

	function addRow() {
		rows = [...rows, createBlankRow()];
	}

	function addMultipleRows(count: number = 5) {
		const newRows: SpreadsheetRow[] = [];
		for (let i = 0; i < count; i++) {
			newRows.push(createBlankRow());
		}
		rows = [...rows, ...newRows];
	}

	function duplicateRow(index: number) {
		const source = rows[index];
		if (!source) return;
		const clone: SpreadsheetRow = {
			...source,
			id: `row-${Math.random().toString(36).slice(2, 9)}`
		};
		const updated = [...rows];
		updated.splice(index + 1, 0, clone);
		rows = updated;
	}

	function removeRow(index: number) {
		if (rows.length <= 1) {
			rows = [createBlankRow()];
			return;
		}
		rows = rows.filter((_, i) => i !== index);
	}

	function clearEmptyRows() {
		const filtered = rows.filter(
			(r) =>
				r.targetWord.trim() ||
				r.phonetic.trim() ||
				r.meaning.trim() ||
				r.example.trim()
		);
		rows = filtered.length > 0 ? filtered : [createBlankRow()];
	}

	// Spreadsheet keyboard navigation & auto-row addition
	function handleCellKeydown(
		e: KeyboardEvent,
		rowIndex: number,
		colName: keyof SpreadsheetRow
	) {
		const colNames: (keyof SpreadsheetRow)[] = [
			'targetWord',
			'phonetic',
			'meaning',
			'partOfSpeech',
			'example'
		];
		const colIndex = colNames.indexOf(colName);

		if (e.key === 'Enter') {
			e.preventDefault();
			if (rowIndex === rows.length - 1) {
				// Append new row and focus next row same column
				addRow();
			}
			setTimeout(() => {
				const nextInput = document.querySelector<HTMLInputElement | HTMLSelectElement>(
					`[data-row="${rowIndex + 1}"][data-col="${colName}"]`
				);
				nextInput?.focus();
			}, 30);
		} else if (e.key === 'ArrowDown') {
			if (rowIndex < rows.length - 1) {
				e.preventDefault();
				const nextInput = document.querySelector<HTMLInputElement | HTMLSelectElement>(
					`[data-row="${rowIndex + 1}"][data-col="${colName}"]`
				);
				nextInput?.focus();
			}
		} else if (e.key === 'ArrowUp') {
			if (rowIndex > 0) {
				e.preventDefault();
				const prevInput = document.querySelector<HTMLInputElement | HTMLSelectElement>(
					`[data-row="${rowIndex - 1}"][data-col="${colName}"]`
				);
				prevInput?.focus();
			}
		} else if (e.key === 'Tab' && !e.shiftKey && colIndex === colNames.length - 1) {
			if (rowIndex === rows.length - 1) {
				e.preventDefault();
				addRow();
				setTimeout(() => {
					const firstInput = document.querySelector<HTMLInputElement>(
						`[data-row="${rowIndex + 1}"][data-col="targetWord"]`
					);
					firstInput?.focus();
				}, 30);
			}
		}
	}

	// Spreadsheet Paste Parsing (TSV / CSV / Tab-separated Excel / Google Sheets)
	function handleCellPaste(e: ClipboardEvent, startRowIndex: number) {
		const text = e.clipboardData?.getData('text');
		if (!text) return;

		// Check if multi-line or tab-separated content
		if (text.includes('\n') || text.includes('\t')) {
			e.preventDefault();
			parseAndApplySpreadsheetData(text, startRowIndex);
		}
	}

	function parseAndApplySpreadsheetData(text: string, startRowIndex: number = 0) {
		const lines = text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter((l) => l.length > 0);

		if (lines.length === 0) return;

		const parsedRows: SpreadsheetRow[] = [];

		for (const line of lines) {
			// Tab-delimited (Google Sheets / Excel) or Comma-delimited (CSV)
			let tokens: string[] = [];
			if (line.includes('\t')) {
				tokens = line.split('\t').map((t) => t.trim());
			} else {
				// Basic CSV parsing
				tokens = line.split(',').map((t) => t.trim());
			}

			if (tokens.length === 0) continue;

			// Mapping heuristics:
			// If 2 columns: [Word, Meaning]
			// If 3 columns: [Word, Phonetic/Pinyin, Meaning] (or [Word, Meaning, Example])
			// If 4 columns: [Word, Phonetic, Meaning, PartOfSpeech]
			// If 5+ columns: [Word, Phonetic, Meaning, PartOfSpeech, Example]
			let targetWord = tokens[0] || '';
			let phonetic = '';
			let meaning = '';
			let partOfSpeech = 'noun';
			let example = '';

			if (tokens.length === 2) {
				meaning = tokens[1] || '';
			} else if (tokens.length === 3) {
				phonetic = tokens[1] || '';
				meaning = tokens[2] || '';
			} else if (tokens.length === 4) {
				phonetic = tokens[1] || '';
				meaning = tokens[2] || '';
				partOfSpeech = tokens[3] || 'noun';
			} else {
				phonetic = tokens[1] || '';
				meaning = tokens[2] || '';
				partOfSpeech = tokens[3] || 'noun';
				example = tokens.slice(4).join(' ') || '';
			}

			parsedRows.push({
				id: `row-${Math.random().toString(36).slice(2, 9)}`,
				targetWord,
				phonetic,
				meaning,
				partOfSpeech,
				example
			});
		}

		if (parsedRows.length > 0) {
			const updated = [...rows];
			// Overwrite starting from startRowIndex
			for (let i = 0; i < parsedRows.length; i++) {
				const targetIndex = startRowIndex + i;
				if (targetIndex < updated.length) {
					updated[targetIndex] = parsedRows[i];
				} else {
					updated.push(parsedRows[i]);
				}
			}
			rows = updated;
		}
	}

	function handlePasteModalSubmit() {
		if (!pasteRawText.trim()) return;
		parseAndApplySpreadsheetData(pasteRawText.trim(), rows.length > 0 && rows[0].targetWord === '' ? 0 : rows.length);
		pasteRawText = '';
		showPasteModal = false;
	}

	async function handleSave() {
		errorMessage = '';
		if (!deckName.trim()) {
			errorMessage = 'Please provide a deck title.';
			return;
		}

		const validRows = rows.filter(
			(r) => r.targetWord.trim().length > 0 && r.meaning.trim().length > 0
		);

		if (validRows.length === 0) {
			errorMessage = 'Please add at least 1 card with both a Word and Meaning.';
			return;
		}

		const words: WordRecord[] = validRows.map((r, idx) => ({
			No: idx + 1,
			'Chinese Word': deckLang === 'chinese' ? r.targetWord.trim() : undefined,
			'French Word': deckLang === 'french' ? r.targetWord.trim() : undefined,
			Pinyin: r.phonetic.trim() || undefined,
			'Part of Speech': r.partOfSpeech.trim() || 'noun',
			'English Meaning': r.meaning.trim(),
			'Example (Chinese + Pinyin)':
				deckLang === 'chinese' ? r.example.trim() || undefined : undefined,
			'Example (French)':
				deckLang === 'french' ? r.example.trim() || undefined : undefined
		}));

		const customDeck: CustomDeck = {
			id: deckToEdit ? deckToEdit.id : `custom-${Date.now()}`,
			name: deckName.trim(),
			language: deckLang,
			words,
			createdAt: deckToEdit?.createdAt || Date.now()
		};

		isSaving = true;
		try {
			await onSave(customDeck);
			onClose();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to save deck.';
		} finally {
			isSaving = false;
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200"
	>
		<div
			class="shadow-sheet flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
				<div class="flex items-center gap-2.5">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 font-bold"
					>
						<Sparkles size={18} strokeWidth={2.25} />
					</div>
					<div>
						<h3 class="font-headline text-base sm:text-lg font-extrabold text-slate-900">
							{deckToEdit ? 'Edit Custom Deck' : 'Create Custom Deck (Spreadsheet UI)'}
						</h3>
						<p class="font-sans text-xs text-slate-500">
							Add or paste words quickly with fast keyboard navigation (Enter, Tab, Arrows).
						</p>
					</div>
				</div>

				<button
					type="button"
					onclick={onClose}
					aria-label="Close modal"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
				>
					<X size={18} strokeWidth={2} />
				</button>
			</div>

			<!-- Main Content / Controls -->
			<div class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
				<!-- Deck Metadata Form Row -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div class="sm:col-span-2">
						<label for="deck-title-input" class="block font-headline text-xs font-bold text-slate-900">
							Deck Title *
						</label>
						<input
							id="deck-title-input"
							type="text"
							placeholder="e.g. Daily Chinese Sentences / Travel French"
							bind:value={deckName}
							class="mt-1 w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 font-headline text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
						/>
					</div>

					<div>
						<span class="block font-headline text-xs font-bold text-slate-900">Target Language</span>
						<div class="mt-1 flex gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 p-1">
							<button
								type="button"
								onclick={() => (deckLang = 'chinese')}
								class="flex-1 cursor-pointer rounded-xl py-1.5 font-headline text-xs font-bold transition-all {deckLang ===
								'chinese'
									? 'bg-indigo-600 text-white shadow-xs'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								Chinese (ZH)
							</button>
							<button
								type="button"
								onclick={() => (deckLang = 'french')}
								class="flex-1 cursor-pointer rounded-xl py-1.5 font-headline text-xs font-bold transition-all {deckLang ===
								'french'
									? 'bg-indigo-600 text-white shadow-xs'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								French (FR)
							</button>
						</div>
					</div>
				</div>

				<!-- Toolbar / Spreadsheet Actions -->
				<div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={addRow}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
						>
							<Plus size={14} strokeWidth={2.5} />
							<span>+1 Row</span>
						</button>

						<button
							type="button"
							onclick={() => addMultipleRows(5)}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
						>
							<Rows3 size={14} strokeWidth={2} />
							<span>+5 Rows</span>
						</button>

						<button
							type="button"
							onclick={() => (showPasteModal = true)}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 font-headline text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 active:scale-95"
						>
							<ClipboardPaste size={14} strokeWidth={2.25} />
							<span>Paste Sheets / CSV</span>
						</button>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={clearEmptyRows}
							class="cursor-pointer font-headline text-[11px] font-bold text-slate-500 hover:text-slate-800"
						>
							Clean Blank Rows
						</button>

						<span
							class="rounded-full bg-slate-100 px-2.5 py-0.5 font-headline text-[11px] font-bold text-slate-700"
						>
							{validRowCount} valid {validRowCount === 1 ? 'card' : 'cards'} ({rows.length} rows)
						</span>
					</div>
				</div>

				<!-- Spreadsheet Grid Table -->
				<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
					<div class="max-h-[42vh] overflow-x-auto overflow-y-auto">
						<table class="w-full min-w-[700px] border-collapse text-left font-sans text-xs">
							<thead class="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 font-headline text-[11px] font-bold text-slate-600 uppercase">
								<tr>
									<th class="w-10 border-r border-slate-200 bg-slate-100/70 py-2.5 text-center text-slate-400">#</th>
									<th class="w-36 border-r border-slate-200 px-3 py-2.5">
										{deckLang === 'chinese' ? 'Word (Hanzi) *' : 'French Word *'}
									</th>
									<th class="w-32 border-r border-slate-200 px-3 py-2.5">
										{deckLang === 'chinese' ? 'Pinyin' : 'Phonetic'}
									</th>
									<th class="w-44 border-r border-slate-200 px-3 py-2.5">
										English Meaning *
									</th>
									<th class="w-28 border-r border-slate-200 px-3 py-2.5">
										POS
									</th>
									<th class="border-r border-slate-200 px-3 py-2.5">
										Example Sentence
									</th>
									<th class="w-18 px-2 py-2.5 text-center">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each rows as row, idx (row.id)}
									<tr class="group transition-colors hover:bg-slate-50/60">
										<!-- Row Number -->
										<td class="border-r border-slate-100 bg-slate-50/50 text-center font-headline text-xs font-semibold text-slate-400">
											{idx + 1}
										</td>

										<!-- Target Word -->
										<td class="border-r border-slate-100 p-0">
											<input
												type="text"
												data-row={idx}
												data-col="targetWord"
												placeholder={deckLang === 'chinese' ? '汉字' : 'Mot français'}
												bind:value={row.targetWord}
												onkeydown={(e) => handleCellKeydown(e, idx, 'targetWord')}
												onpaste={(e) => handleCellPaste(e, idx)}
												class="w-full bg-transparent px-3 py-2 font-headline font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:bg-indigo-50/40 focus:outline-none focus:ring-1 focus:ring-indigo-600 {deckLang === 'chinese' ? 'font-hanzi text-sm' : ''}"
											/>
										</td>

										<!-- Phonetic / Pinyin -->
										<td class="border-r border-slate-100 p-0">
											<input
												type="text"
												data-row={idx}
												data-col="phonetic"
												placeholder={deckLang === 'chinese' ? 'pīnyīn' : 'prononciation'}
												bind:value={row.phonetic}
												onkeydown={(e) => handleCellKeydown(e, idx, 'phonetic')}
												onpaste={(e) => handleCellPaste(e, idx)}
												class="w-full bg-transparent px-3 py-2 font-headline text-xs text-indigo-700 placeholder:text-slate-300 focus:bg-indigo-50/40 focus:outline-none focus:ring-1 focus:ring-indigo-600"
											/>
										</td>

										<!-- English Meaning -->
										<td class="border-r border-slate-100 p-0">
											<input
												type="text"
												data-row={idx}
												data-col="meaning"
												placeholder="Definition / meaning"
												bind:value={row.meaning}
												onkeydown={(e) => handleCellKeydown(e, idx, 'meaning')}
												onpaste={(e) => handleCellPaste(e, idx)}
												class="w-full bg-transparent px-3 py-2 font-sans text-xs text-slate-800 placeholder:text-slate-300 focus:bg-indigo-50/40 focus:outline-none focus:ring-1 focus:ring-indigo-600"
											/>
										</td>

										<!-- Part of Speech -->
										<td class="border-r border-slate-100 p-0">
											<select
												data-row={idx}
												data-col="partOfSpeech"
												bind:value={row.partOfSpeech}
												onkeydown={(e) => handleCellKeydown(e, idx, 'partOfSpeech')}
												class="w-full cursor-pointer bg-transparent px-2 py-2 font-headline text-[11px] font-bold text-slate-600 focus:bg-indigo-50/40 focus:outline-none focus:ring-1 focus:ring-indigo-600 uppercase"
											>
												<option value="noun">noun</option>
												<option value="verb">verb</option>
												<option value="adjective">adj</option>
												<option value="adverb">adv</option>
												<option value="pronoun">pron</option>
												<option value="preposition">prep</option>
												<option value="conjunction">conj</option>
												<option value="phrase">phrase</option>
												<option value="idiom">idiom</option>
											</select>
										</td>

										<!-- Example Sentence -->
										<td class="border-r border-slate-100 p-0">
											<input
												type="text"
												data-row={idx}
												data-col="example"
												placeholder="Optional example sentence..."
												bind:value={row.example}
												onkeydown={(e) => handleCellKeydown(e, idx, 'example')}
												onpaste={(e) => handleCellPaste(e, idx)}
												class="w-full bg-transparent px-3 py-2 font-sans text-xs text-slate-600 placeholder:text-slate-300 focus:bg-indigo-50/40 focus:outline-none focus:ring-1 focus:ring-indigo-600"
											/>
										</td>

										<!-- Row Action Buttons -->
										<td class="px-2 py-1 text-center">
											<div class="flex items-center justify-center gap-1">
												<button
													type="button"
													onclick={() => duplicateRow(idx)}
													title="Duplicate row"
													aria-label="Duplicate row {idx + 1}"
													class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95"
												>
													<Copy size={12} strokeWidth={2} />
												</button>

												<button
													type="button"
													onclick={() => removeRow(idx)}
													title="Delete row"
													aria-label="Delete row {idx + 1}"
													class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
												>
													<Trash2 size={12} strokeWidth={2} />
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				{#if errorMessage}
					<div
						class="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 font-headline text-xs font-bold text-rose-700"
					>
						<AlertCircle size={16} strokeWidth={2.25} />
						<span>{errorMessage}</span>
					</div>
				{/if}
			</div>

			<!-- Footer CTAs -->
			<div class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
				<button
					type="button"
					onclick={onClose}
					class="cursor-pointer rounded-2xl bg-slate-100 px-4 py-2.5 font-headline text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
				>
					Cancel
				</button>

				<button
					type="button"
					onclick={handleSave}
					disabled={isSaving}
					class="flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 font-headline text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
				>
					{#if isSaving}
						<span>Saving...</span>
					{:else}
						<Check size={16} strokeWidth={2.5} />
						<span>{deckToEdit ? 'Save Changes' : `Create Deck (${validRowCount} cards)`}</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- PASTE DATA MODAL -->
{#if showPasteModal}
	<div
		class="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
	>
		<div
			class="shadow-sheet w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 animate-in zoom-in-95 duration-150"
		>
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<h4 class="font-headline text-sm font-bold text-slate-900">
					Paste Spreadsheet Data (Excel, Google Sheets, CSV)
				</h4>
				<button
					type="button"
					onclick={() => (showPasteModal = false)}
					aria-label="Close"
					class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
				>
					<X size={16} strokeWidth={2} />
				</button>
			</div>

			<div class="space-y-2 py-3">
				<p class="font-sans text-xs text-slate-500">
					Paste rows copied directly from Google Sheets / Excel (tab-separated) or CSV.
				</p>
				<p class="font-mono text-[11px] text-slate-400">
					Format: Word [tab] Pinyin [tab] English Meaning [tab] POS [tab] Example
				</p>

				<textarea
					rows="6"
					bind:value={pasteRawText}
					placeholder="你好	nǐ hǎo	Hello	noun	你好世界&#10;谢谢	xiè xie	Thank you	verb	非常感谢"
					class="w-full rounded-2xl border border-slate-200/90 p-3 font-mono text-xs text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none"
				></textarea>
			</div>

			<div class="flex gap-2 pt-2">
				<button
					type="button"
					onclick={() => (showPasteModal = false)}
					class="flex-1 cursor-pointer rounded-2xl bg-slate-100 py-2.5 font-headline text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handlePasteModalSubmit}
					class="flex-1 cursor-pointer rounded-2xl bg-indigo-600 py-2.5 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95"
				>
					Apply to Grid
				</button>
			</div>
		</div>
	</div>
{/if}
