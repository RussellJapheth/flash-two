<script lang="ts">
	import { parseInlineMarkdown } from '$lib/utils/fieldGuideParser';

	let { text = '', onSelectWord } = $props<{
		text: string;
		onSelectWord?: (item: {
			hanzi: string;
			pinyin?: string;
			english?: string;
			context?: string;
		}) => void;
	}>();

	let segments = $derived(parseInlineMarkdown(text));
</script>

{#each segments as seg, sIdx (sIdx)}
	{#if seg.code}
		<code
			class="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800"
		>
			{#each seg.tokens as token, tIdx (tIdx)}
				{#if token.isHanzi && onSelectWord}
					<button
						type="button"
						onclick={() => onSelectWord({ hanzi: token.text, context: text })}
						class="cursor-pointer font-bold text-indigo-700 underline decoration-indigo-300 decoration-1 underline-offset-2 transition hover:text-indigo-900 hover:decoration-indigo-600"
					>
						{token.text}
					</button>
				{:else}
					<span>{token.text}</span>
				{/if}
			{/each}
		</code>
	{:else if seg.bold}
		<strong class="font-bold text-slate-900">
			{#each seg.tokens as token, tIdx (tIdx)}
				{#if token.isHanzi && onSelectWord}
					<button
						type="button"
						onclick={() => onSelectWord({ hanzi: token.text, context: text })}
						class="cursor-pointer font-bold text-indigo-700 underline decoration-indigo-300 decoration-1 underline-offset-2 transition hover:text-indigo-900 hover:decoration-indigo-600"
					>
						{token.text}
					</button>
				{:else}
					<span>{token.text}</span>
				{/if}
			{/each}
		</strong>
	{:else if seg.italic}
		<em class="font-mono text-xs font-semibold text-cyan-700 not-italic">
			{#each seg.tokens as token, tIdx (tIdx)}
				{#if token.isHanzi && onSelectWord}
					<button
						type="button"
						onclick={() => onSelectWord({ hanzi: token.text, context: text })}
						class="cursor-pointer font-bold text-indigo-700 underline decoration-indigo-300 decoration-1 underline-offset-2 transition hover:text-indigo-900 hover:decoration-indigo-600"
					>
						{token.text}
					</button>
				{:else}
					<span>{token.text}</span>
				{/if}
			{/each}
		</em>
	{:else}
		{#each seg.tokens as token, tIdx (tIdx)}
			{#if token.isHanzi && onSelectWord}
				<button
					type="button"
					onclick={() => onSelectWord({ hanzi: token.text, context: text })}
					class="cursor-pointer font-headline font-bold text-indigo-700 underline decoration-indigo-300 decoration-1 underline-offset-2 transition hover:text-indigo-900 hover:decoration-indigo-600"
				>
					{token.text}
				</button>
			{:else}
				<span>{token.text}</span>
			{/if}
		{/each}
	{/if}
{/each}
