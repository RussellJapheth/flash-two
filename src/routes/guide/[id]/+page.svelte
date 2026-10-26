<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getFieldGuideById } from '$lib/data/fieldGuides';
	import WordLookupModal from '$lib/components/WordLookupModal.svelte';
	import FieldGuideMarkdown from '$lib/components/FieldGuideMarkdown.svelte';
	import {
		ChevronLeft,
		BookOpen,
		Layers,
		Clock,
		Sparkles,
		ArrowRight,
		CheckCircle2
	} from 'lucide-svelte';

	let guideId = $derived(page.params.id || '');
	let guide = $derived(getFieldGuideById(guideId));

	let selectedWord = $state<{
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	} | null>(null);

	function openLookup(item: {
		hanzi: string;
		pinyin?: string;
		english?: string;
		context?: string;
	}) {
		selectedWord = item;
	}

	function closeLookup() {
		selectedWord = null;
	}
</script>

<svelte:head>
	<title>{guide ? guide.title : 'Field Guide'} | Mandarin Field Guides</title>
</svelte:head>

{#if !guide}
	<main
		class="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center p-6 text-center"
	>
		<h2 class="text-xl font-bold text-slate-800">Field Guide Not Found</h2>
		<p class="mt-2 text-sm text-slate-500">The requested field guide could not be located.</p>
		<button
			type="button"
			onclick={() => goto(resolve('/decks'))}
			class="mt-4 cursor-pointer rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
		>
			Back to Decks
		</button>
	</main>
{:else}
	<main class="mx-auto min-h-screen w-full max-w-lg bg-slate-50 pb-20 text-slate-800">
		<!-- Sticky Top Bar -->
		<header
			class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md"
		>
			<button
				type="button"
				onclick={() => history.back()}
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 active:scale-95"
				aria-label="Back"
			>
				<ChevronLeft size={18} />
			</button>

			<div class="flex items-center gap-1.5 font-headline text-xs font-bold text-slate-600">
				<BookOpen size={14} class="text-indigo-600" />
				<span>Field Guide #{guide.number}</span>
			</div>

			<a
				href={resolve(`/deck/${guide.packId}`)}
				class="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95"
			>
				<Layers size={12} />
				<span>SRS Deck</span>
			</a>
		</header>

		<div class="space-y-4 px-4 pt-4">
			<!-- Guide Hero Banner -->
			<section
				class="relative overflow-hidden rounded-3xl bg-linear-to-tr {guide.accentGradient} p-6 text-white shadow-lg"
			>
				<div
					class="flex items-center gap-2 text-xs font-bold tracking-wider text-white/80 uppercase"
				>
					<span class="rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-xs">
						{guide.category}
					</span>
					<span class="flex items-center gap-1">
						<Clock size={12} />
						{guide.durationMinutes} min read
					</span>
				</div>

				<h1 class="mt-3 font-headline text-2xl font-black tracking-tight text-white">
					{guide.title}
				</h1>
				<p class="mt-1 font-sans text-xs leading-relaxed text-white/85">
					{guide.subtitle}
				</p>

				<!-- Direct SRS Flashcards Link -->
				<div class="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
					<div class="text-[11px] font-medium text-white/80">Practice in Flashcard Decks:</div>
					<a
						href={resolve(`/deck/${guide.packId}`)}
						class="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-slate-900 shadow-xs transition hover:bg-white/90 active:scale-95"
					>
						<span>Study {guide.packTitle.split(':')[0]}</span>
						<ArrowRight size={13} />
					</a>
				</div>
			</section>

			<!-- Quick Vocabulary Chips (Click to Lookup / Save to Notes) -->
			{#if guide.keyVocab && guide.keyVocab.length > 0}
				<section class="space-y-2.5 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1.5 font-headline text-xs font-bold text-slate-900">
							<Sparkles size={14} class="text-amber-500" />
							<span>High-Yield Vocabulary</span>
						</div>
						<span class="text-[10px] font-semibold text-slate-400">
							Tap word to lookup or save
						</span>
					</div>

					<div class="flex flex-wrap gap-2">
						{#each guide.keyVocab as item (item.hanzi)}
							<button
								type="button"
								onclick={() => openLookup(item)}
								class="group flex cursor-pointer items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50 px-3 py-1.5 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-95"
							>
								<span
									class="font-headline text-sm font-bold text-slate-900 group-hover:text-indigo-600"
								>
									{item.hanzi}
								</span>
								<span class="font-mono text-xs text-slate-500">
									{item.pinyin}
								</span>
							</button>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Rich Markdown Content -->
			<section class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs">
				<FieldGuideMarkdown markdown={guide.markdownContent} onSelectWord={openLookup} />
			</section>

			<!-- Wrap-Up & Next Step SRS Deck Action -->
			<section
				class="rounded-3xl border border-slate-200/80 bg-linear-to-r from-indigo-50 to-purple-50 p-5 shadow-xs"
			>
				<div class="flex items-start gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs"
					>
						<CheckCircle2 size={20} />
					</div>
					<div class="space-y-1">
						<h4 class="font-headline text-sm font-black text-slate-900">
							Ready to test your memory?
						</h4>
						<p class="font-sans text-xs leading-relaxed text-slate-600">
							Lock this field guide's high-frequency vocabulary into long-term memory with SRS
							flashcards and cloze sentence practice.
						</p>
						<div class="pt-2">
							<a
								href={resolve(`/deck/${guide.packId}`)}
								class="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
							>
								<span>Start SRS Flashcards ({guide.packTitle.split(':')[0]})</span>
								<ArrowRight size={14} />
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	</main>
{/if}

<WordLookupModal word={selectedWord} onClose={closeLookup} />
