<script lang="ts">
	import { parseFieldGuideMarkdown, tokenizeTextWithHanzi } from '$lib/utils/fieldGuideParser';
	import { speakWord } from '$lib/utils/audio';
	import { resolve } from '$app/paths';
	import { Volume2, Layers, ArrowRight, Lightbulb } from 'lucide-svelte';

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
		speakWord(text, 'chinese');
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
						{block.text}
					</h2>
				</div>
			{:else if block.level === 3}
				<h3 class="pt-2 font-headline text-sm font-bold tracking-tight text-slate-800">
					{block.text}
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
									<th class="p-3 whitespace-nowrap">{header}</th>
								{/each}
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 font-sans">
							{#each block.rows as row, rIdx (rIdx)}
								<tr class="transition-colors hover:bg-slate-50/70">
									{#each row as cell, cIdx (cIdx)}
										<td class="p-3 {cIdx === 0 ? 'font-bold text-slate-900' : 'text-slate-600'}">
											{#if /[\u4e00-\u9fff]/.test(cell)}
												<div class="flex items-center gap-1.5">
													<div class="inline-flex flex-wrap items-baseline gap-1">
														{#each tokenizeTextWithHanzi(cell) as token, tIdx (tIdx)}
															{#if token.isHanzi}
																<button
																	type="button"
																	onclick={() =>
																		onSelectWord({
																			hanzi: token.text,
																			english: row[row.length - 1]
																		})}
																	class="cursor-pointer font-headline text-sm font-bold text-indigo-700 underline decoration-indigo-300 decoration-1 underline-offset-2 transition hover:text-indigo-900 hover:decoration-indigo-600"
																>
																	{token.text}
																</button>
															{:else}
																<span>{token.text}</span>
															{/if}
														{/each}
													</div>
													<button
														type="button"
														onclick={() => playAudio(cell.replace(/[^\u4e00-\u9fff]/g, ''))}
														class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
														aria-label="Listen"
													>
														<Volume2 size={12} />
													</button>
												</div>
											{:else}
												<span>{cell}</span>
											{/if}
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
				<div class="flex items-start justify-between gap-2">
					<div class="space-y-1">
						{#if block.label}
							<div
								class="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase"
							>
								{block.label}
							</div>
						{/if}

						{#if block.hanzi}
							<div class="flex items-center gap-2 pt-0.5">
								<button
									type="button"
									onclick={() =>
										onSelectWord({
											hanzi: block.hanzi!,
											pinyin: block.pinyin,
											english: block.english
										})}
									class="cursor-pointer font-headline text-base font-bold text-slate-900 transition hover:text-indigo-600"
								>
									{block.hanzi}
								</button>
								<button
									type="button"
									onclick={() => playAudio(block.hanzi!)}
									class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
									aria-label="Play pronunciation"
								>
									<Volume2 size={13} />
								</button>
							</div>
						{/if}

						{#if block.pinyin}
							<div class="font-mono text-xs font-semibold text-cyan-700">
								{block.pinyin}
							</div>
						{/if}

						{#if block.english}
							<div class="font-sans text-xs leading-relaxed text-slate-600">
								{block.english}
							</div>
						{/if}

						{#if !block.hanzi}
							<div class="font-sans text-xs leading-relaxed text-slate-700">
								{#each tokenizeTextWithHanzi(block.text) as token, tIdx (tIdx)}
									{#if token.isHanzi}
										<button
											type="button"
											onclick={() => onSelectWord({ hanzi: token.text })}
											class="cursor-pointer font-bold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
										>
											{token.text}
										</button>
									{:else}
										<span>{token.text}</span>
									{/if}
								{/each}
							</div>
						{/if}
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
					{#each tokenizeTextWithHanzi(block.text) as token, tIdx (tIdx)}
						{#if token.isHanzi}
							<button
								type="button"
								onclick={() => onSelectWord({ hanzi: token.text })}
								class="cursor-pointer font-bold text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-700"
							>
								{token.text}
							</button>
						{:else}
							<span>{token.text}</span>
						{/if}
					{/each}
				</div>
			</div>
		{:else if block.type === 'paragraph'}
			<!-- Paragraph with inline clickable Hanzi -->
			<p class="font-sans text-xs leading-relaxed text-slate-600">
				{#each tokenizeTextWithHanzi(block.text) as token, tIdx (tIdx)}
					{#if token.isHanzi}
						<button
							type="button"
							onclick={() => onSelectWord({ hanzi: token.text })}
							class="cursor-pointer font-bold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
						>
							{token.text}
						</button>
					{:else}
						<span>{token.text}</span>
					{/if}
				{/each}
			</p>
		{:else if block.type === 'diagram'}
			<!-- Structured Sequence Flow Diagram -->
			<div
				class="overflow-x-auto rounded-2xl border border-slate-200/90 bg-slate-900 p-4 font-mono text-xs text-slate-200 shadow-xs"
			>
				<div class="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
					Visual Process Flow
				</div>
				<pre class="whitespace-pre-wrap">{block.content}</pre>
			</div>
		{/if}
	{/each}
</div>
