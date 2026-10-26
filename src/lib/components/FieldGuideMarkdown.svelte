<script lang="ts">
	import { parseFieldGuideMarkdown } from '$lib/utils/fieldGuideParser';
	import { speakWord } from '$lib/utils/audio';
	import { resolve } from '$app/paths';
	import { Volume2, Layers, ArrowRight, Lightbulb } from 'lucide-svelte';
	import MermaidDiagram from '$lib/components/MermaidDiagram.svelte';
	import FormattedText from '$lib/components/FormattedText.svelte';

	let { markdown = '', onSelectWord } = $props<{
		markdown: string;
		onSelectWord: (item: {
			hanzi: string;
			pinyin?: string;
			english?: string;
			context?: string;
		}) => void;
	}>();

	let blocks = $derived(parseFieldGuideMarkdown(markdown));

	function playAudio(text: string) {
		speakWord(text.replace(/[^\u4e00-\u9fff]/g, ''), 'chinese');
	}
</script>

<div class="space-y-4">
	{#each blocks as block, bIdx (bIdx)}
		{#if block.type === 'heading'}
			{#if block.level === 2}
				<div class="flex items-center gap-2 border-b border-slate-200/80 pt-2 pb-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 font-headline text-xs font-bold text-white"
					>
						#
					</div>
					<h2 class="font-headline text-lg font-black tracking-tight text-slate-900">
						<FormattedText text={block.text} {onSelectWord} />
					</h2>
				</div>
			{:else if block.level === 3}
				<h3 class="pt-2 font-headline text-sm font-bold tracking-tight text-slate-800">
					<FormattedText text={block.text} {onSelectWord} />
				</h3>
			{/if}
		{:else if block.type === 'deckLink'}
			<!-- Corresponding SRS Flashcard Deck Card -->
			<div
				class="relative overflow-hidden rounded-2xl border border-indigo-200/90 bg-linear-to-r from-indigo-50/90 via-violet-50/60 to-purple-50/40 p-4 shadow-xs"
			>
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs"
						>
							<Layers size={20} />
						</div>
						<div>
							<div class="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
								SRS Practice Companion
							</div>
							<div class="font-headline text-sm font-black text-slate-900">
								Pack {block.packNum}: {block.packTitle}
							</div>
						</div>
					</div>
					<a
						href={resolve(`/deck/chinese-${block.packNum}`)}
						class="flex shrink-0 items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
					>
						<span>Study Deck</span>
						<ArrowRight size={13} />
					</a>
				</div>
			</div>
		{:else if block.type === 'table'}
			<!-- Responsive Table Card -->
			<div class="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs">
						<thead>
							<tr
								class="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-bold text-slate-700"
							>
								{#each block.headers as header, hIdx (hIdx)}
									<th class="p-3 whitespace-nowrap">
										<FormattedText text={header} {onSelectWord} />
									</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 font-sans">
							{#each block.rows as row, rIdx (rIdx)}
								<tr class="transition-colors hover:bg-slate-50/70">
									{#each row as cell, cIdx (cIdx)}
										<td class="p-3 {cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-600'}">
											<div class="flex items-center justify-between gap-1.5">
												<div class="inline-flex flex-wrap items-baseline gap-1">
													<FormattedText text={cell} {onSelectWord} />
												</div>
												{#if /[\u4e00-\u9fff]/.test(cell)}
													<button
														type="button"
														onclick={() => playAudio(cell)}
														class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
														aria-label="Listen"
													>
														<Volume2 size={12} />
													</button>
												{/if}
											</div>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else if block.type === 'listItem'}
			<!-- High-Yield Spoken Phrase Card -->
			<div
				class="group rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition hover:border-indigo-300"
			>
				<div class="space-y-1.5">
					{#if block.label}
						<div class="flex items-center justify-between">
							<span
								class="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-headline text-[10px] font-bold tracking-wider text-slate-700 uppercase"
							>
								<FormattedText text={block.label} {onSelectWord} />
							</span>
							{#if block.hanzi}
								<button
									type="button"
									onclick={() => playAudio(block.hanzi!)}
									class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
									aria-label="Play pronunciation"
								>
									<Volume2 size={13} />
								</button>
							{/if}
						</div>
					{:else if block.hanzi}
						<div class="flex justify-end">
							<button
								type="button"
								onclick={() => playAudio(block.hanzi!)}
								class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
								aria-label="Play pronunciation"
							>
								<Volume2 size={13} />
							</button>
						</div>
					{/if}

					<div class="font-sans text-xs leading-relaxed text-slate-700">
						<FormattedText text={block.text} {onSelectWord} />
					</div>
				</div>
			</div>
		{:else if block.type === 'callout'}
			<!-- Callout Card -->
			<div
				class="flex items-start gap-2.5 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-3.5 text-xs text-amber-950 shadow-xs"
			>
				<Lightbulb size={16} class="mt-0.5 shrink-0 text-amber-600" />
				<div class="leading-relaxed">
					<FormattedText text={block.text} {onSelectWord} />
				</div>
			</div>
		{:else if block.type === 'paragraph'}
			<!-- Paragraph with formatted text and inline clickable Hanzi -->
			<p class="font-sans text-xs leading-relaxed text-slate-600">
				<FormattedText text={block.text} {onSelectWord} />
			</p>
		{:else if block.type === 'diagram'}
			<!-- Visual Process Flow Diagram -->
			<MermaidDiagram content={block.content} />
		{/if}
	{/each}
</div>
