<script lang="ts">
	import { onMount } from 'svelte';
	import { Workflow, Network, CheckCircle2 } from 'lucide-svelte';

	let { content = '', title = 'Visual Process Flow' } = $props<{
		content: string;
		title?: string;
	}>();

	let svgHtml = $state<string>('');
	let renderError = $state<string | null>(null);
	let loading = $state(true);

	const isMermaid = $derived(
		/^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|quadrantChart|gitGraph)\b/m.test(
			content.trim()
		)
	);

	onMount(async () => {
		if (!isMermaid) {
			loading = false;
			return;
		}

		try {
			const mermaidModule = await import('mermaid');
			const mermaid = mermaidModule.default;

			mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				themeVariables: {
					primaryColor: '#EEF2FF', // indigo-50
					primaryTextColor: '#1E1B4B', // indigo-950
					primaryBorderColor: '#6366F1', // indigo-500
					lineColor: '#6366F1',
					secondaryColor: '#F8FAFC',
					secondaryBorderColor: '#E2E8F0',
					tertiaryColor: '#FFFFFF',
					noteBkgColor: '#FEF3C7',
					noteTextColor: '#78350F',
					noteBorderColor: '#F59E0B',
					actorBkg: '#EEF2FF',
					actorBorder: '#6366F1',
					actorTextColor: '#1E1B4B',
					actorLineColor: '#818CF8',
					signalColor: '#4F46E5',
					signalTextColor: '#1E1B4B',
					fontFamily: "'Plus Jakarta Sans', 'Inter', 'PingFang SC', sans-serif",
					fontSize: '12px'
				},
				securityLevel: 'loose'
			});

			const uniqueId = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
			const result = await mermaid.render(uniqueId, content.trim());
			svgHtml = result.svg;
			loading = false;
		} catch (err: unknown) {
			console.warn('Failed to render Mermaid diagram:', err);
			renderError = err instanceof Error ? err.message : String(err);
			loading = false;
		}
	});
</script>

<div class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs">
	<!-- Diagram Header -->
	<div class="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
		<div class="flex items-center gap-2">
			<div class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
				{#if isMermaid}
					<Workflow size={15} />
				{:else}
					<Network size={15} />
				{/if}
			</div>
			<div>
				<div class="font-headline text-xs font-bold tracking-tight text-slate-900">
					{title}
				</div>
				<div class="text-[10px] font-medium text-slate-400">
					{isMermaid ? 'Interactive Step Flow' : 'Visual Timeline Architecture'}
				</div>
			</div>
		</div>

		<span
			class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
		>
			<CheckCircle2 size={11} class="text-indigo-600" />
			<span>{isMermaid ? 'Process Flow' : 'Timeline'}</span>
		</span>
	</div>

	<!-- Diagram Body -->
	{#if isMermaid}
		{#if loading}
			<div class="flex items-center justify-center py-8 text-xs text-slate-400">
				<div class="flex items-center gap-2">
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
					></div>
					<span>Rendering process flow...</span>
				</div>
			</div>
		{/if}
		{#if svgHtml}
			<div
				class="overflow-x-auto py-2 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:min-w-[280px]"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html svgHtml}
			</div>
		{/if}
		{#if renderError}
			<div
				class="rounded-2xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-200"
			>
				<pre class="overflow-x-auto whitespace-pre-wrap">{content}</pre>
			</div>
		{/if}
	{:else}
		<!-- Formatted Non-Mermaid ASCII Flow -->
		<div
			class="overflow-x-auto rounded-2xl border border-indigo-100 bg-linear-to-b from-indigo-50/50 to-white p-3.5 font-mono text-xs text-slate-800"
		>
			<pre class="overflow-x-auto leading-relaxed whitespace-pre">{content}</pre>
		</div>
	{/if}
</div>
