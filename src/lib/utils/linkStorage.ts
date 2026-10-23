import type { SavedLink, SavedLinkCategory, SavedLinkYouTube } from '$lib/types';

export const SAVED_LINKS_STORAGE_KEY = 'flashcards_saved_links';

/**
 * Extracts YouTube Video ID and thumbnail if the URL belongs to YouTube.
 * Supports watch URLs, youtu.be shortlinks, shorts, live, and embed URLs.
 */
export function extractYouTubeInfo(rawUrl: string): SavedLinkYouTube | undefined {
	if (!rawUrl) return undefined;
	const trimmed = rawUrl.trim();

	// Match youtu.be/ID
	const youtuBeMatch = trimmed.match(
		/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S*)?/i
	);
	if (youtuBeMatch && youtuBeMatch[1]) {
		const videoId = youtuBeMatch[1];
		return {
			videoId,
			thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
			isShort: false
		};
	}

	// Match youtube.com/shorts/ID
	const shortsMatch = trimmed.match(
		/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i
	);
	if (shortsMatch && shortsMatch[1]) {
		const videoId = shortsMatch[1];
		return {
			videoId,
			thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
			isShort: true
		};
	}

	// Match youtube.com watch, embed, live
	const standardMatch = trimmed.match(
		/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|v\/)([a-zA-Z0-9_-]{11})/i
	);
	if (standardMatch && standardMatch[1]) {
		const videoId = standardMatch[1];
		return {
			videoId,
			thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
			isShort: false
		};
	}

	return undefined;
}

/**
 * Extracts clean domain name from URL (removes protocol, port, and leading 'www.').
 */
export function extractDomain(rawUrl: string): string {
	try {
		const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
		return parsed.hostname.replace(/^www\./i, '').toLowerCase();
	} catch {
		const cleaned = rawUrl.replace(/^https?:\/\//i, '').split('/')[0] || '';
		return cleaned.replace(/^www\./i, '').toLowerCase() || 'link';
	}
}

/**
 * Determines a reasonable category based on URL and domain rules.
 */
export function detectCategory(rawUrl: string): SavedLinkCategory {
	const domain = extractDomain(rawUrl);

	if (
		domain.includes('youtube.com') ||
		domain.includes('youtu.be') ||
		domain.includes('vimeo.com') ||
		domain.includes('bilibili.com') ||
		domain.includes('tiktok.com') ||
		domain.includes('dailymotion.com') ||
		domain.includes('twitch.tv') ||
		domain.includes('youku.com')
	) {
		return 'video';
	}

	if (
		domain.includes('spotify.com') ||
		domain.includes('soundcloud.com') ||
		domain.includes('podcasts.apple.com') ||
		domain.includes('ximalaya.com')
	) {
		return 'audio';
	}

	if (
		domain.includes('wiktionary.org') ||
		domain.includes('wikipedia.org') ||
		domain.includes('pleco.com') ||
		domain.includes('mdbg.net') ||
		domain.includes('archchinese.com') ||
		domain.includes('wordreference.com') ||
		domain.includes('dictionary.cambridge.org') ||
		domain.includes('hanzicraft.com')
	) {
		return 'reference';
	}

	if (
		domain.includes('github.com') ||
		domain.includes('gitlab.com') ||
		domain.includes('translate.google.com') ||
		domain.includes('deepl.com') ||
		domain.includes('replit.com') ||
		domain.includes('stackblitz.com') ||
		domain.includes('codepen.io')
	) {
		return 'tool';
	}

	if (
		domain.includes('medium.com') ||
		domain.includes('substack.com') ||
		domain.includes('dev.to') ||
		domain.includes('thechinaproject.com') ||
		domain.includes('sixthtone.com') ||
		domain.includes('nytimes.com') ||
		domain.includes('bbc.com') ||
		domain.includes('theguardian.com')
	) {
		return 'article';
	}

	return 'other';
}

/**
 * Parses incoming share payload from PWA Web Share Target.
 * When apps (like YouTube, Chrome, Twitter) share, the URL might be in `url` or embedded in `text`.
 */
export function parseIncomingShare(params: {
	url?: string | null;
	text?: string | null;
	title?: string | null;
}): { url: string; title: string; notes?: string } | null {
	const rawUrl = (params.url || '').trim();
	const rawText = (params.text || '').trim();
	const rawTitle = (params.title || '').trim();

	const urlRegex = /(https?:\/\/[^\s]+)/i;

	let targetUrl = '';
	let remainingText = '';

	if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
		targetUrl = rawUrl;
		remainingText = rawText;
	} else {
		// Look inside text
		const textMatch = rawText.match(urlRegex);
		if (textMatch && textMatch[1]) {
			targetUrl = textMatch[1];
			remainingText = rawText.replace(textMatch[1], '').trim();
		} else {
			// Look inside title
			const titleMatch = rawTitle.match(urlRegex);
			if (titleMatch && titleMatch[1]) {
				targetUrl = titleMatch[1];
			}
		}
	}

	if (!targetUrl) return null;

	// Remove trailing brackets/punctuation attached to URL
	targetUrl = targetUrl.replace(/[),.;]+$/, '');

	// Build clean title
	let finalTitle = rawTitle;
	if (!finalTitle || finalTitle === targetUrl) {
		if (remainingText) {
			finalTitle = remainingText;
			remainingText = '';
		} else {
			const domain = extractDomain(targetUrl);
			finalTitle = `Link from ${domain}`;
		}
	}

	return {
		url: targetUrl,
		title: finalTitle,
		notes: remainingText || undefined
	};
}

/**
 * Reads all saved links from local storage, sorted pinned first then by creation time desc.
 */
export function getAllSavedLinks(): SavedLink[] {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return [];
	}
	try {
		const raw = localStorage.getItem(SAVED_LINKS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.sort((a, b) => {
				if (a.isPinned !== b.isPinned) {
					return a.isPinned ? -1 : 1;
				}
				return (b.createdAt || 0) - (a.createdAt || 0);
			});
		}
		return [];
	} catch (e) {
		console.error('Failed to read saved links:', e);
		return [];
	}
}

/**
 * Gets a saved link by ID.
 */
export function getSavedLinkById(id: string): SavedLink | null {
	const all = getAllSavedLinks();
	return all.find((link) => link.id === id) || null;
}

/**
 * Creates or updates a saved link.
 */
export function saveSavedLink(input: {
	id?: string;
	url: string;
	title?: string;
	category?: SavedLinkCategory;
	domain?: string;
	favicon?: string;
	description?: string;
	notes?: string;
	tags?: string[];
	isPinned?: boolean;
	isArchived?: boolean;
}): SavedLink {
	const all = getAllSavedLinks();
	const now = Date.now();
	const linkId = input.id || `link-${now}-${Math.random().toString(36).slice(2, 7)}`;
	const existingIndex = all.findIndex((l) => l.id === linkId);

	const cleanUrl = input.url.trim();
	const domain = input.domain || extractDomain(cleanUrl);
	const youtube = extractYouTubeInfo(cleanUrl);
	const category = input.category || (youtube ? 'video' : detectCategory(cleanUrl));
	const title = input.title?.trim() || (youtube ? 'YouTube Video' : `Saved Link (${domain})`);

	const record: SavedLink = {
		id: linkId,
		url: cleanUrl,
		title,
		domain,
		category,
		favicon:
			input.favicon ||
			`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
		description: input.description?.trim(),
		notes: input.notes?.trim(),
		tags: (input.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean),
		isPinned: input.isPinned ?? false,
		isArchived: input.isArchived ?? false,
		createdAt: existingIndex >= 0 ? all[existingIndex].createdAt : now,
		updatedAt: now,
		youtube
	};

	if (existingIndex >= 0) {
		all[existingIndex] = record;
	} else {
		all.unshift(record);
	}

	persistSavedLinks(all);
	return record;
}

/**
 * Deletes a saved link by ID.
 */
export function deleteSavedLink(id: string): void {
	const all = getAllSavedLinks().filter((l) => l.id !== id);
	persistSavedLinks(all);
}

/**
 * Toggles the pinned status of a link.
 */
export function togglePinLink(id: string): boolean {
	const all = getAllSavedLinks();
	const target = all.find((l) => l.id === id);
	if (!target) return false;
	target.isPinned = !target.isPinned;
	target.updatedAt = Date.now();
	persistSavedLinks(all);
	return target.isPinned;
}

/**
 * Toggles archive status of a link.
 */
export function toggleArchiveLink(id: string): boolean {
	const all = getAllSavedLinks();
	const target = all.find((l) => l.id === id);
	if (!target) return false;
	target.isArchived = !target.isArchived;
	target.updatedAt = Date.now();
	persistSavedLinks(all);
	return target.isArchived;
}

/**
 * Exports all saved links as a formatted JSON string.
 */
export function exportLinksAsJson(): string {
	const all = getAllSavedLinks();
	return JSON.stringify(
		{
			version: 1,
			exportedAt: Date.now(),
			count: all.length,
			links: all
		},
		null,
		2
	);
}

/**
 * Imports saved links from a JSON string, merging with existing links by URL or ID.
 */
export function importLinksFromJson(jsonStr: string): { imported: number; total: number } {
	try {
		const parsed = JSON.parse(jsonStr);
		const candidateLinks: SavedLink[] = Array.isArray(parsed)
			? parsed
			: Array.isArray(parsed?.links)
				? parsed.links
				: [];

		if (!candidateLinks.length) return { imported: 0, total: getAllSavedLinks().length };

		const existing = getAllSavedLinks();
		let importedCount = 0;

		for (const item of candidateLinks) {
			if (!item || !item.url) continue;
			const idx = existing.findIndex((l) => l.id === item.id || l.url === item.url);
			const cleanUrl = item.url.trim();
			const domain = item.domain || extractDomain(cleanUrl);
			const youtube = extractYouTubeInfo(cleanUrl);

			const validItem: SavedLink = {
				id: item.id || `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				url: cleanUrl,
				title: item.title || `Saved Link (${domain})`,
				domain,
				category: item.category || (youtube ? 'video' : detectCategory(cleanUrl)),
				favicon:
					item.favicon ||
					`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
				description: item.description,
				notes: item.notes,
				tags: Array.isArray(item.tags)
					? item.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
					: [],
				isPinned: Boolean(item.isPinned),
				isArchived: Boolean(item.isArchived),
				createdAt: Number(item.createdAt) || Date.now(),
				updatedAt: Number(item.updatedAt) || Date.now(),
				youtube: item.youtube || youtube
			};

			if (idx >= 0) {
				existing[idx] = validItem;
			} else {
				existing.push(validItem);
			}
			importedCount++;
		}

		persistSavedLinks(existing);
		return { imported: importedCount, total: existing.length };
	} catch (e) {
		console.error('Failed to import links:', e);
		return { imported: 0, total: getAllSavedLinks().length };
	}
}

function persistSavedLinks(links: SavedLink[]): void {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return;
	}
	try {
		localStorage.setItem(SAVED_LINKS_STORAGE_KEY, JSON.stringify(links));
	} catch (e) {
		console.error('Failed to persist saved links:', e);
	}
}
