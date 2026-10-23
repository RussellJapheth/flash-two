import { describe, it, expect, beforeEach } from 'vitest';
import {
	extractYouTubeInfo,
	extractDomain,
	detectCategory,
	parseIncomingShare,
	getAllSavedLinks,
	saveSavedLink,
	deleteSavedLink,
	togglePinLink,
	toggleArchiveLink,
	exportLinksAsJson,
	importLinksFromJson
} from './linkStorage';

class LocalStorageMock {
	private store: Record<string, string> = {};
	getItem(key: string): string | null {
		return this.store[key] ?? null;
	}
	setItem(key: string, value: string): void {
		this.store[key] = String(value);
	}
	removeItem(key: string): void {
		delete this.store[key];
	}
	clear(): void {
		this.store = {};
	}
}

describe('linkStorage utility', () => {
	beforeEach(() => {
		if (
			typeof globalThis.localStorage === 'undefined' ||
			!(globalThis.localStorage instanceof LocalStorageMock)
		) {
			Object.defineProperty(globalThis, 'localStorage', {
				value: new LocalStorageMock(),
				writable: true
			});
		}
		localStorage.clear();
	});

	describe('extractYouTubeInfo', () => {
		it('extracts video ID from standard watch URL', () => {
			const info = extractYouTubeInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
			expect(info).toBeDefined();
			expect(info?.videoId).toBe('dQw4w9WgXcQ');
			expect(info?.thumbnailUrl).toContain('dQw4w9WgXcQ');
			expect(info?.isShort).toBe(false);
		});

		it('extracts video ID from youtu.be shortlink with params', () => {
			const info = extractYouTubeInfo('https://youtu.be/dQw4w9WgXcQ?t=42');
			expect(info).toBeDefined();
			expect(info?.videoId).toBe('dQw4w9WgXcQ');
			expect(info?.isShort).toBe(false);
		});

		it('extracts video ID from youtube shorts', () => {
			const info = extractYouTubeInfo('https://www.youtube.com/shorts/abcdefghijk');
			expect(info).toBeDefined();
			expect(info?.videoId).toBe('abcdefghijk');
			expect(info?.isShort).toBe(true);
		});

		it('extracts video ID from embed URL', () => {
			const info = extractYouTubeInfo('https://www.youtube.com/embed/dQw4w9WgXcQ');
			expect(info).toBeDefined();
			expect(info?.videoId).toBe('dQw4w9WgXcQ');
		});

		it('returns undefined for non-YouTube URLs', () => {
			expect(extractYouTubeInfo('https://wikipedia.org/wiki/Svelte')).toBeUndefined();
			expect(extractYouTubeInfo('')).toBeUndefined();
		});
	});

	describe('extractDomain', () => {
		it('extracts clean domain without www', () => {
			expect(extractDomain('https://www.youtube.com/watch?v=123')).toBe('youtube.com');
			expect(extractDomain('https://github.com/sveltejs/svelte')).toBe('github.com');
			expect(extractDomain('sub.example.org/path')).toBe('sub.example.org');
		});
	});

	describe('detectCategory', () => {
		it('categorizes video platforms', () => {
			expect(detectCategory('https://youtu.be/xyz')).toBe('video');
			expect(detectCategory('https://bilibili.com/video/123')).toBe('video');
		});

		it('categorizes reference and dictionary platforms', () => {
			expect(detectCategory('https://en.wiktionary.org/wiki/test')).toBe('reference');
			expect(detectCategory('https://pleco.com')).toBe('reference');
		});

		it('categorizes developer tools', () => {
			expect(detectCategory('https://github.com/sveltejs/kit')).toBe('tool');
		});

		it('categorizes audio streaming', () => {
			expect(detectCategory('https://open.spotify.com/episode/123')).toBe('audio');
		});

		it('falls back to other for unknown sites', () => {
			expect(detectCategory('https://random-blog.xyz')).toBe('other');
		});
	});

	describe('parseIncomingShare', () => {
		it('parses standard url and title', () => {
			const result = parseIncomingShare({
				url: 'https://youtu.be/dQw4w9WgXcQ',
				title: 'Cool Song'
			});
			expect(result).not.toBeNull();
			expect(result?.url).toBe('https://youtu.be/dQw4w9WgXcQ');
			expect(result?.title).toBe('Cool Song');
		});

		it('parses mobile share where URL is in text string', () => {
			const result = parseIncomingShare({
				text: 'Look at this Mandarin lesson: https://www.youtube.com/watch?v=dQw4w9WgXcQ check it out!'
			});
			expect(result).not.toBeNull();
			expect(result?.url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
			expect(result?.title).toBe('Look at this Mandarin lesson:  check it out!');
		});

		it('returns null if no valid url found', () => {
			const result = parseIncomingShare({
				title: 'Just some text',
				text: 'Nothing here'
			});
			expect(result).toBeNull();
		});
	});

	describe('CRUD operations and persistence', () => {
		it('saves and retrieves links', () => {
			expect(getAllSavedLinks()).toEqual([]);

			const link = saveSavedLink({
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				title: 'Rick Astley',
				tags: ['music', 'retro']
			});

			expect(link.id).toBeDefined();
			expect(link.category).toBe('video');
			expect(link.youtube?.videoId).toBe('dQw4w9WgXcQ');

			const all = getAllSavedLinks();
			expect(all.length).toBe(1);
			expect(all[0].title).toBe('Rick Astley');
			expect(all[0].tags).toEqual(['music', 'retro']);
		});

		it('toggles pin and archive states', () => {
			const link = saveSavedLink({
				url: 'https://example.com',
				title: 'Example'
			});

			expect(togglePinLink(link.id)).toBe(true);
			let list = getAllSavedLinks();
			expect(list[0].isPinned).toBe(true);

			expect(toggleArchiveLink(link.id)).toBe(true);
			list = getAllSavedLinks();
			expect(list[0].isArchived).toBe(true);
		});

		it('deletes link by ID', () => {
			const link = saveSavedLink({
				url: 'https://example.com'
			});
			expect(getAllSavedLinks().length).toBe(1);

			deleteSavedLink(link.id);
			expect(getAllSavedLinks().length).toBe(0);
		});

		it('exports and imports JSON correctly', () => {
			saveSavedLink({
				url: 'https://youtu.be/dQw4w9WgXcQ',
				title: 'Video 1'
			});
			saveSavedLink({
				url: 'https://svelte.dev',
				title: 'Svelte'
			});

			const json = exportLinksAsJson();
			expect(json).toContain('Video 1');

			localStorage.clear();
			expect(getAllSavedLinks().length).toBe(0);

			const result = importLinksFromJson(json);
			expect(result.imported).toBe(2);
			expect(getAllSavedLinks().length).toBe(2);
		});
	});
});
