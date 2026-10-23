<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getAllSavedLinks,
		saveSavedLink,
		deleteSavedLink,
		togglePinLink,
		toggleArchiveLink,
		extractDomain,
		extractYouTubeInfo,
		detectCategory
	} from '$lib/utils/linkStorage';
	import type { SavedLink, SavedLinkCategory } from '$lib/types';
	import {
		Plus,
		Search,
		X,
		ExternalLink,
		Copy,
		Check,
		Pin,
		Archive,
		Trash2,
		Edit3,
		Play,
		Tag,
		Share2,
		Film,
		FileText,
		Headphones,
		BookOpen,
		Wrench,
		Globe,
		RotateCcw
	} from 'lucide-svelte';

	interface Props {
		initialShare?: { url: string; title: string; notes?: string } | null;
	}

	let { initialShare = null }: Props = $props();

	let links = $state<SavedLink[]>([]);
	let searchQuery = $state('');
	let selectedCategory = $state<'all' | SavedLinkCategory | 'pinned' | 'archived'>('all');
	let selectedTag = $state<string | null>(null);
	let sortBy = $state<'newest' | 'oldest' | 'title'>('newest');

	// Active Video Player Modal
	let activeVideoModal = $state<SavedLink | null>(null);

	// Add / Edit Modal State
	let isModalOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formUrl = $state('');
	let formTitle = $state('');
	let formCategory = $state<SavedLinkCategory>('other');
	let formTags = $state('');
	let formNotes = $state('');
	let formIsPinned = $state(false);
	let formError = $state('');
	let copiedLinkId = $state<string | null>(null);
	let toastMessage = $state<string | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	function showToast(msg: string) {
		if (toastTimeout) clearTimeout(toastTimeout);
		toastMessage = msg;
		toastTimeout = setTimeout(() => {
			toastMessage = null;
		}, 3000);
	}

	function refreshList() {
		links = getAllSavedLinks();
	}

	let previewDomain = $derived(formUrl ? extractDomain(formUrl) : '');
	let previewYouTube = $derived(formUrl ? extractYouTubeInfo(formUrl) : undefined);

	let tagCounts = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const l of links) {
			if (l.isArchived) continue;
			for (const t of l.tags) {
				map[t] = (map[t] || 0) + 1;
			}
		}
		return map;
	});

	let allTags = $derived(Object.keys(tagCounts).sort());

	let filteredLinks = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();

		return links
			.filter((item) => {
				if (selectedCategory === 'pinned') {
					if (!item.isPinned || item.isArchived) return false;
				} else if (selectedCategory === 'archived') {
					if (!item.isArchived) return false;
				} else {
					if (item.isArchived) return false;
					if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
				}

				if (selectedTag && !item.tags.includes(selectedTag)) {
					return false;
				}

				if (q) {
					const inTitle = item.title.toLowerCase().includes(q);
					const inDomain = item.domain.toLowerCase().includes(q);
					const inUrl = item.url.toLowerCase().includes(q);
					const inNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
					const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
					if (!inTitle && !inDomain && !inUrl && !inNotes && !inTags) return false;
				}

				return true;
			})
			.sort((a, b) => {
				if (selectedCategory !== 'archived') {
					if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
				}

				if (sortBy === 'oldest') {
					return (a.createdAt || 0) - (b.createdAt || 0);
				}
				if (sortBy === 'title') {
					return a.title.localeCompare(b.title);
				}
				return (b.createdAt || 0) - (a.createdAt || 0);
			});
	});

	let activeLinksCount = $derived(links.filter((l) => !l.isArchived).length);
	let videoLinksCount = $derived(
		links.filter((l) => !l.isArchived && l.category === 'video').length
	);
	let pinnedCount = $derived(links.filter((l) => !l.isArchived && l.isPinned).length);

	onMount(() => {
		refreshList();
		if (initialShare) {
			openAddModal(initialShare);
			showToast('Shared link ready to save!');
		}
	});

	function openAddModal(prefill?: { url?: string; title?: string; notes?: string }) {
		editingId = null;
		formUrl = prefill?.url || '';
		formTitle = prefill?.title || '';
		formNotes = prefill?.notes || '';
		formTags = '';
		formIsPinned = false;
		formError = '';

		if (formUrl) {
			const yt = extractYouTubeInfo(formUrl);
			formCategory = yt ? 'video' : detectCategory(formUrl);
			if (!formTitle) {
				formTitle = yt ? 'YouTube Video' : `Saved Link (${extractDomain(formUrl)})`;
			}
		} else {
			formCategory = 'other';
		}

		isModalOpen = true;
	}

	function openEditModal(link: SavedLink) {
		editingId = link.id;
		formUrl = link.url;
		formTitle = link.title;
		formCategory = link.category;
		formTags = link.tags.join(', ');
		formNotes = link.notes || '';
		formIsPinned = link.isPinned;
		formError = '';
		isModalOpen = true;
	}

	function handleUrlChange() {
		if (!formUrl.trim()) return;
		const yt = extractYouTubeInfo(formUrl);
		formCategory = yt ? 'video' : detectCategory(formUrl);

		if (!formTitle.trim()) {
			const dom = extractDomain(formUrl);
			formTitle = yt ? 'YouTube Video' : `Link from ${dom}`;
		}
	}

	async function pasteFromClipboard() {
		try {
			if (navigator.clipboard && navigator.clipboard.readText) {
				const text = await navigator.clipboard.readText();
				if (text) {
					formUrl = text.trim();
					handleUrlChange();
				}
			}
		} catch {
			showToast('Please paste the URL manually');
		}
	}

	function handleSaveLink() {
		if (!formUrl.trim()) {
			formError = 'Please enter a valid URL';
			return;
		}

		let finalUrl = formUrl.trim();
		if (!/^https?:\/\//i.test(finalUrl)) {
			finalUrl = `https://${finalUrl}`;
		}

		const tagList = formTags
			.split(',')
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean);

		saveSavedLink({
			id: editingId || undefined,
			url: finalUrl,
			title: formTitle.trim(),
			category: formCategory,
			notes: formNotes.trim() || undefined,
			tags: tagList,
			isPinned: formIsPinned
		});

		refreshList();
		isModalOpen = false;
		showToast(editingId ? 'Link updated!' : 'Link saved to vault!');
	}

	function handleDelete(id: string) {
		deleteSavedLink(id);
		refreshList();
		showToast('Link removed');
	}

	function handleTogglePin(id: string) {
		const pinned = togglePinLink(id);
		refreshList();
		showToast(pinned ? 'Pinned to top ⭐' : 'Unpinned');
	}

	function handleToggleArchive(id: string) {
		const archived = toggleArchiveLink(id);
		refreshList();
		showToast(archived ? 'Archived link 📦' : 'Restored from archive');
	}

	async function handleCopy(url: string, id: string) {
		try {
			await navigator.clipboard.writeText(url);
			copiedLinkId = id;
			setTimeout(() => {
				copiedLinkId = null;
			}, 2000);
			showToast('URL copied to clipboard!');
		} catch {
			showToast('Failed to copy');
		}
	}

	async function handleShare(link: SavedLink) {
		if (navigator.share) {
			try {
				await navigator.share({
					title: link.title,
					url: link.url
				});
			} catch {
				// User cancelled
			}
		} else {
			handleCopy(link.url, link.id);
		}
	}

	function getCategoryBadge(cat: SavedLinkCategory) {
		switch (cat) {
			case 'video':
				return { label: 'Video', icon: Film, color: 'bg-rose-50 text-rose-700 border-rose-200/80' };
			case 'article':
				return {
					label: 'Article',
					icon: FileText,
					color: 'bg-blue-50 text-blue-700 border-blue-200/80'
				};
			case 'audio':
				return {
					label: 'Audio',
					icon: Headphones,
					color: 'bg-purple-50 text-purple-700 border-purple-200/80'
				};
			case 'reference':
				return {
					label: 'Reference',
					icon: BookOpen,
					color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
				};
			case 'tool':
				return {
					label: 'Tool',
					icon: Wrench,
					color: 'bg-amber-50 text-amber-700 border-amber-200/80'
				};
			default:
				return {
					label: 'Web',
					icon: Globe,
					color: 'bg-slate-100 text-slate-700 border-slate-200/80'
				};
		}
	}
</script>

<!-- Toast Notification -->
{#if toastMessage}
	<aside
		aria-label="Notification"
		class="fixed top-16 left-1/2 z-50 -translate-x-1/2 transform rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl transition-all"
	>
		{toastMessage}
	</aside>
{/if}

<div class="space-y-4">
	<!-- Overview Card & Primary Actions -->
	<section
		class="shadow-card flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white p-4.5 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h3 class="font-headline text-base font-extrabold tracking-tight text-slate-900">
				Saved Study Links
			</h3>
			<p class="font-sans text-xs text-slate-500">
				{activeLinksCount} active links & videos · {videoLinksCount} video drills · {pinnedCount} pinned
			</p>
		</div>

		<div>
			<button
				type="button"
				onclick={() => openAddModal()}
				class="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 font-headline text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
			>
				<Plus size={15} strokeWidth={2.5} />
				<span>Save Link</span>
			</button>
		</div>
	</section>

	<!-- Search Bar -->
	<div class="relative">
		<Search
			size={16}
			class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
		/>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search title, YouTube, domain, or tags..."
			aria-label="Search saved links"
			class="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pr-9 pl-9.5 font-sans text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
		/>
		{#if searchQuery}
			<button
				type="button"
				onclick={() => (searchQuery = '')}
				aria-label="Clear search"
				class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
			>
				<X size={15} strokeWidth={2} />
			</button>
		{/if}
	</div>

	<!-- Category Filter Chips -->
	<div class="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
		{#each [{ id: 'all' as const, label: 'All Links', icon: Globe }, { id: 'video' as const, label: 'Videos', icon: Film }, { id: 'article' as const, label: 'Articles', icon: FileText }, { id: 'audio' as const, label: 'Audio', icon: Headphones }, { id: 'reference' as const, label: 'Reference', icon: BookOpen }, { id: 'tool' as const, label: 'Tools', icon: Wrench }, { id: 'pinned' as const, label: 'Pinned', icon: Pin }, { id: 'archived' as const, label: 'Archived', icon: Archive }] as cat (cat.id)}
			{@const active = selectedCategory === cat.id}
			{@const Icon = cat.icon}
			<button
				type="button"
				onclick={() => {
					selectedCategory = cat.id;
				}}
				class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 {active
					? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
					: 'border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
			>
				<Icon size={13} strokeWidth={2.25} />
				<span>{cat.label}</span>
			</button>
		{/each}
	</div>

	<!-- Tag Filter Bar -->
	{#if allTags.length > 0}
		<div class="flex flex-wrap items-center gap-1.5 pt-0.5">
			<span class="text-[11px] font-bold text-slate-400 uppercase">Tags:</span>
			{#each allTags as t (t)}
				{@const isSelected = selectedTag === t}
				<button
					type="button"
					onclick={() => {
						selectedTag = isSelected ? null : t;
					}}
					class="flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition-all {isSelected
						? 'border-indigo-600 bg-indigo-50 text-indigo-700'
						: 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300'}"
				>
					<Tag size={10} />
					<span>{t}</span>
					<span class="rounded-full bg-slate-100 px-1 text-[9px] font-bold text-slate-500">
						{tagCounts[t]}
					</span>
				</button>
			{/each}
			{#if selectedTag}
				<button
					type="button"
					onclick={() => (selectedTag = null)}
					class="text-[11px] font-bold text-indigo-600 hover:underline"
				>
					Clear tag
				</button>
			{/if}
		</div>
	{/if}

	<!-- Sort & Count -->
	<div class="flex items-center justify-between text-xs text-slate-500">
		<span class="font-semibold text-slate-700">
			{filteredLinks.length}
			{filteredLinks.length === 1 ? 'link' : 'links'}
		</span>

		<select
			bind:value={sortBy}
			class="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-hidden"
		>
			<option value="newest">Newest First</option>
			<option value="oldest">Oldest First</option>
			<option value="title">Title (A-Z)</option>
		</select>
	</div>

	<!-- Links List -->
	<div class="space-y-3">
		{#if filteredLinks.length === 0}
			<div class="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
				>
					<Globe size={24} />
				</div>
				<h4 class="font-headline text-sm font-bold text-slate-900">No saved links found</h4>
				<p class="mt-1 text-xs text-slate-500">
					{#if searchQuery || selectedTag || selectedCategory !== 'all'}
						Try clearing your search query or filters.
					{:else}
						Save videos, articles, and learning tools here. Share directly from any app using the
						PWA share sheet!
					{/if}
				</p>
				<div class="mt-4 flex justify-center gap-2">
					{#if searchQuery || selectedTag || selectedCategory !== 'all'}
						<button
							type="button"
							onclick={() => {
								searchQuery = '';
								selectedTag = null;
								selectedCategory = 'all';
							}}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-headline text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
						>
							<RotateCcw size={12} />
							<span>Reset Filters</span>
						</button>
					{:else}
						<button
							type="button"
							onclick={() => openAddModal()}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-headline text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
						>
							<Plus size={14} />
							<span>Save First Link</span>
						</button>
					{/if}
				</div>
			</div>
		{:else}
			{#each filteredLinks as link (link.id)}
				{@const badge = getCategoryBadge(link.category)}
				{@const BadgeIcon = badge.icon}

				<article
					class="shadow-card relative overflow-hidden rounded-3xl border bg-white p-4 transition-all hover:border-indigo-200 {link.isPinned
						? 'border-amber-200/90 bg-gradient-to-b from-amber-50/20 to-white'
						: 'border-slate-200/90'}"
				>
					<!-- YouTube Thumbnail -->
					{#if link.youtube}
						<div class="relative mb-3 overflow-hidden rounded-2xl bg-slate-900">
							<img
								src={link.youtube.thumbnailUrl}
								alt={link.title}
								loading="lazy"
								class="aspect-video w-full object-cover opacity-90 transition-transform duration-300 hover:scale-102"
							/>
							<button
								type="button"
								onclick={() => (activeVideoModal = link)}
								class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 transition-colors hover:bg-black/40"
								aria-label="Play YouTube video"
							>
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
								>
									<Play size={20} class="translate-x-0.5 fill-current" />
								</div>
							</button>

							{#if link.youtube.isShort}
								<span
									class="absolute top-2 right-2 rounded-md bg-rose-600/90 px-1.5 py-0.5 font-headline text-[10px] font-bold text-white uppercase backdrop-blur-xs"
								>
									Short
								</span>
							{/if}
						</div>
					{/if}

					<!-- Category Badge + Domain + Pin -->
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-1.5">
							<span
								class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold {badge.color}"
							>
								<BadgeIcon size={11} strokeWidth={2.25} />
								<span>{badge.label}</span>
							</span>

							<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
								{#if link.favicon}
									<img
										src={link.favicon}
										alt=""
										class="h-3.5 w-3.5 rounded-xs"
										onerror={(e) => ((e.currentTarget as HTMLElement).style.display = 'none')}
									/>
								{/if}
								{link.domain}
							</span>
						</div>

						<button
							type="button"
							onclick={() => handleTogglePin(link.id)}
							title={link.isPinned ? 'Unpin' : 'Pin to top'}
							aria-label={link.isPinned ? 'Unpin link' : 'Pin link to top'}
							class="cursor-pointer rounded-full p-1 transition-colors {link.isPinned
								? 'text-amber-500 hover:text-amber-600'
								: 'text-slate-300 hover:text-slate-500'}"
						>
							<Pin
								size={16}
								strokeWidth={2.25}
								class={link.isPinned ? 'fill-amber-500 text-amber-500' : ''}
							/>
						</button>
					</div>

					<!-- Title -->
					<h4 class="font-headline text-base font-bold tracking-tight text-slate-900">
						<a
							href={link.url}
							target="_blank"
							rel="external noopener noreferrer"
							class="hover:text-indigo-600 hover:underline"
						>
							{link.title}
						</a>
					</h4>

					<!-- Notes -->
					{#if link.notes}
						<p class="mt-1 line-clamp-2 text-xs text-slate-600">
							{link.notes}
						</p>
					{/if}

					<!-- Tags -->
					{#if link.tags.length > 0}
						<div class="mt-2.5 flex flex-wrap gap-1">
							{#each link.tags as t (t)}
								<span
									class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
								>
									#{t}
								</span>
							{/each}
						</div>
					{/if}

					<!-- Actions Row -->
					<div
						class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500"
					>
						<span class="text-[11px] text-slate-400">
							{new Date(link.createdAt).toLocaleDateString(undefined, {
								month: 'short',
								day: 'numeric'
							})}
						</span>

						<div class="flex items-center gap-1">
							{#if link.youtube}
								<button
									type="button"
									onclick={() => (activeVideoModal = link)}
									title="Watch inline"
									class="flex h-8 cursor-pointer items-center gap-1 rounded-xl bg-rose-50 px-2 font-headline text-xs font-bold text-rose-700 hover:bg-rose-100"
								>
									<Play size={12} class="fill-current" />
									<span>Watch</span>
								</button>
							{/if}

							<button
								type="button"
								onclick={() => handleCopy(link.url, link.id)}
								title="Copy link"
								aria-label="Copy link URL"
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								{#if copiedLinkId === link.id}
									<Check size={14} class="text-emerald-600" />
								{:else}
									<Copy size={14} />
								{/if}
							</button>

							<button
								type="button"
								onclick={() => handleShare(link)}
								title="Share link"
								aria-label="Share link"
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								<Share2 size={14} />
							</button>

							<a
								href={link.url}
								target="_blank"
								rel="external noopener noreferrer"
								title="Open in new tab"
								aria-label="Open in new tab"
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								<ExternalLink size={14} />
							</a>

							<button
								type="button"
								onclick={() => openEditModal(link)}
								title="Edit link details"
								aria-label="Edit link details"
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								<Edit3 size={14} />
							</button>

							<button
								type="button"
								onclick={() => handleToggleArchive(link.id)}
								title={link.isArchived ? 'Unarchive' : 'Archive'}
								aria-label={link.isArchived ? 'Unarchive link' : 'Archive link'}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								<Archive size={14} />
							</button>

							<button
								type="button"
								onclick={() => handleDelete(link.id)}
								title="Delete link"
								aria-label="Delete link"
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
							>
								<Trash2 size={14} />
							</button>
						</div>
					</div>
				</article>
			{/each}
		{/if}
	</div>
</div>

<!-- Add / Edit Modal -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs sm:items-center sm:p-4"
	>
		<div
			class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-3xl"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="font-headline text-lg font-extrabold text-slate-900">
					{editingId ? 'Edit Link' : 'Save New Link'}
				</h3>
				<button
					type="button"
					onclick={() => (isModalOpen = false)}
					class="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
					aria-label="Close modal"
				>
					<X size={20} />
				</button>
			</div>

			{#if formError}
				<div class="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
					{formError}
				</div>
			{/if}

			<div class="space-y-3.5">
				<div>
					<label for="link-url-input" class="mb-1 block text-xs font-bold text-slate-700">
						Link URL *
					</label>
					<div class="relative flex items-center">
						<input
							id="link-url-input"
							type="url"
							bind:value={formUrl}
							oninput={handleUrlChange}
							placeholder="https://youtube.com/watch?v=... or web link"
							class="w-full rounded-2xl border border-slate-200 py-2.5 pr-18 pl-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
						/>
						<button
							type="button"
							onclick={pasteFromClipboard}
							class="absolute right-2 cursor-pointer rounded-lg bg-indigo-50 px-2 py-1 font-headline text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
						>
							Paste
						</button>
					</div>
				</div>

				{#if previewDomain}
					<div
						class="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50 p-2 text-xs text-slate-600"
					>
						{#if previewYouTube}
							<Film size={14} class="text-rose-600" />
							<span class="font-bold text-rose-700">YouTube Video Detected</span>
							{#if previewYouTube.isShort}
								<span class="rounded-xs bg-rose-200 px-1 text-[9px] font-bold text-rose-800">
									Short
								</span>
							{/if}
						{:else}
							<Globe size={14} class="text-indigo-600" />
							<span>Domain: <strong>{previewDomain}</strong></span>
						{/if}
					</div>
				{/if}

				<div>
					<label for="link-title-input" class="mb-1 block text-xs font-bold text-slate-700">
						Title
					</label>
					<input
						id="link-title-input"
						type="text"
						bind:value={formTitle}
						placeholder="Descriptive title for easy retrieval"
						class="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
					/>
				</div>

				<div>
					<label for="link-category-input" class="mb-1 block text-xs font-bold text-slate-700">
						Category
					</label>
					<select
						id="link-category-input"
						bind:value={formCategory}
						class="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
					>
						<option value="video">Video (YouTube, Bilibili, etc.)</option>
						<option value="article">Article / Reading</option>
						<option value="audio">Audio / Podcast</option>
						<option value="reference">Reference / Dictionary</option>
						<option value="tool">Tool / App</option>
						<option value="other">Other</option>
					</select>
				</div>

				<div>
					<label for="link-tags-input" class="mb-1 block text-xs font-bold text-slate-700">
						Tags (comma-separated)
					</label>
					<input
						id="link-tags-input"
						type="text"
						bind:value={formTags}
						placeholder="chinese, hsk3, listening, grammar"
						class="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
					/>
				</div>

				<div>
					<label for="link-notes-input" class="mb-1 block text-xs font-bold text-slate-700">
						Study Notes / Key Takeaways
					</label>
					<textarea
						id="link-notes-input"
						bind:value={formNotes}
						rows="2"
						placeholder="Add notes, vocabulary learned, or timestamps..."
						class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
					></textarea>
				</div>

				<label class="flex cursor-pointer items-center gap-2 pt-1">
					<input
						type="checkbox"
						bind:checked={formIsPinned}
						class="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
					/>
					<span class="text-xs font-bold text-slate-700">Pin to top of vault ⭐</span>
				</label>

				<div class="pt-2">
					<button
						type="button"
						onclick={handleSaveLink}
						class="h-12 w-full cursor-pointer rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
					>
						{editingId ? 'Save Changes' : 'Save to Vault'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Inline YouTube Video Player Modal -->
{#if activeVideoModal && activeVideoModal.youtube}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
	>
		<div class="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
			<div class="flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
				<div class="flex items-center gap-2 truncate pr-2">
					<Film size={16} class="shrink-0 text-rose-500" />
					<h4 class="truncate font-headline text-xs font-bold">
						{activeVideoModal.title}
					</h4>
				</div>
				<button
					type="button"
					onclick={() => (activeVideoModal = null)}
					class="cursor-pointer rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
					aria-label="Close video player"
				>
					<X size={18} />
				</button>
			</div>

			<div class="relative aspect-video w-full bg-black">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtube.videoId}?autoplay=1&rel=0`}
					title={activeVideoModal.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
					class="absolute inset-0 h-full w-full border-0"
				></iframe>
			</div>

			<div class="flex items-center justify-between bg-slate-900 px-4 py-3 text-xs text-white/80">
				<span class="truncate pr-2 font-mono text-[11px] text-white/50">
					ID: {activeVideoModal.youtube.videoId}
				</span>
				<a
					href={activeVideoModal.url}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-headline text-xs font-bold text-white transition-colors hover:bg-white/20"
				>
					<span>Open in YouTube</span>
					<ExternalLink size={12} />
				</a>
			</div>
		</div>
	</div>
{/if}
