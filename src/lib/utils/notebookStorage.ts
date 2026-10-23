/**
 * Storage and helpers for freeform Notebook notes and phrases.
 * Persists to localStorage with offline readiness, tag filtering,
 * auto-Pinyin generation, and markdown export.
 */
import type { NotebookNote } from '$lib/types';
import { pinyin } from 'pinyin-pro';

export const NOTEBOOK_STORAGE_KEY = 'flashcards_notebook_notes';

/**
 * Returns all saved notebook notes, sorted with pinned notes first, then most recently updated.
 */
export function getAllNotebookNotes(): NotebookNote[] {
	if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
		return [];
	}
	try {
		const raw = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.sort((a, b) => {
				if (a.isPinned !== b.isPinned) {
					return a.isPinned ? -1 : 1;
				}
				return (b.updatedAt || 0) - (a.updatedAt || 0);
			});
		}
		return [];
	} catch (e) {
		console.error('Failed to read notebook notes:', e);
		return [];
	}
}

/**
 * Gets a single note by its ID.
 */
export function getNotebookNoteById(id: string): NotebookNote | null {
	const all = getAllNotebookNotes();
	return all.find((n) => n.id === id) || null;
}

/**
 * Creates or updates a notebook note.
 */
export function saveNotebookNote(input: {
	id?: string;
	title: string;
	content: string;
	language?: 'chinese' | 'french';
	pinyin?: string;
	tags?: string[];
	isPinned?: boolean;
}): NotebookNote {
	const all = getAllNotebookNotes();
	const now = Date.now();
	const noteId = input.id || `note-${now}-${Math.random().toString(36).slice(2, 7)}`;
	const existingIndex = all.findIndex((n) => n.id === noteId);

	const noteToSave: NotebookNote = {
		id: noteId,
		title: input.title.trim(),
		content: input.content.trim(),
		language: input.language || 'chinese',
		pinyin: input.pinyin?.trim() || undefined,
		tags: (input.tags || []).map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0),
		isPinned: input.isPinned ?? (existingIndex >= 0 ? all[existingIndex].isPinned : false),
		createdAt: existingIndex >= 0 ? all[existingIndex].createdAt : now,
		updatedAt: now
	};

	if (existingIndex >= 0) {
		all[existingIndex] = noteToSave;
	} else {
		all.unshift(noteToSave);
	}

	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(all));
	}

	return noteToSave;
}

/**
 * Saves multiple notebook notes (e.g. during backup restore or cloud pull).
 */
export function saveBulkNotebookNotes(notes: NotebookNote[]): void {
	if (!Array.isArray(notes)) return;
	const existing = getAllNotebookNotes();
	const noteMap = new Map<string, NotebookNote>();

	for (const note of existing) {
		noteMap.set(note.id, note);
	}
	for (const note of notes) {
		const prev = noteMap.get(note.id);
		if (!prev || (note.updatedAt || 0) >= (prev.updatedAt || 0)) {
			noteMap.set(note.id, note);
		}
	}

	const merged = Array.from(noteMap.values());
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(merged));
	}
}

/**
 * Deletes a note by ID. Returns true if removed, false otherwise.
 */
export function deleteNotebookNote(id: string): boolean {
	const all = getAllNotebookNotes();
	const filtered = all.filter((n) => n.id !== id);
	if (filtered.length === all.length) return false;

	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(filtered));
	}
	return true;
}

/**
 * Toggles the pinned status of a note.
 */
export function togglePinNotebookNote(id: string): boolean {
	const all = getAllNotebookNotes();
	const note = all.find((n) => n.id === id);
	if (!note) return false;

	note.isPinned = !note.isPinned;
	note.updatedAt = Date.now();

	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(all));
	}
	return true;
}

/**
 * Generates accurate tone-marked Pinyin for Chinese text using pinyin-pro.
 */
export function generatePinyin(chineseText: string): string {
	if (!chineseText || !chineseText.trim()) return '';
	try {
		return pinyin(chineseText.trim(), { toneType: 'symbol' });
	} catch {
		return '';
	}
}

/**
 * Formats a list of notebook notes into clean Markdown for exporting/downloading.
 */
export function exportNotesAsMarkdown(notes: NotebookNote[]): string {
	const dateStr = new Date().toISOString().split('T')[0];
	const lines: string[] = [
		'# FlashCards Language Notebook',
		'',
		`*Exported on ${dateStr} · ${notes.length} ${notes.length === 1 ? 'entry' : 'entries'}*`,
		'',
		'---',
		''
	];

	for (const note of notes) {
		lines.push(`## ${note.title}`);
		if (note.pinyin) {
			lines.push(`**Pinyin:** ${note.pinyin}`);
		}
		if (note.language) {
			lines.push(`**Language:** ${note.language === 'chinese' ? 'Chinese' : 'French'}`);
		}
		if (note.tags && note.tags.length > 0) {
			lines.push(`**Tags:** ${note.tags.map((t) => `#${t}`).join(' ')}`);
		}
		lines.push('');
		lines.push(note.content);
		lines.push('', '---', '');
	}

	return lines.join('\n');
}

export interface ParsedIncomingNoteShare {
	title: string;
	content: string;
	language: 'chinese' | 'french';
	pinyin?: string;
	tags: string[];
}

/**
 * Parses incoming share payload (via PWA Web Share Target) when text is shared.
 * Intelligently separates phrase/title from explanations/translations, auto-detects
 * Chinese vs French, generates tone-marked Pinyin for Chinese phrases, and adds a '#shared' tag.
 */
export function parseIncomingNoteShare(params: {
	text?: string | null;
	title?: string | null;
	fallbackLanguage?: 'chinese' | 'french';
}): ParsedIncomingNoteShare | null {
	const rawText = (params.text || '').trim();
	const rawTitle = (params.title || '').trim();

	if (!rawText && !rawTitle) {
		return null;
	}

	let titleCandidate: string;
	let contentCandidate: string;

	if (rawTitle && rawText && rawTitle === rawText) {
		titleCandidate = rawText;
		contentCandidate = '';
	} else if (rawTitle && rawText) {
		const textHasChinese = /[\u4e00-\u9fa5]/.test(rawText);
		const titleHasChinese = /[\u4e00-\u9fa5]/.test(rawTitle);

		if (textHasChinese && !titleHasChinese) {
			const lines = rawText
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean);
			titleCandidate = lines[0] || rawText;
			const remaining = lines.slice(1).join('\n');
			const isGenericTitle = /^(note|shared|share|pleco|chrome|safari|firefox|browser)$/i.test(
				rawTitle
			);
			contentCandidate = remaining
				? isGenericTitle
					? remaining
					: `${remaining}\n\nSource: ${rawTitle}`
				: isGenericTitle
					? ''
					: `Source: ${rawTitle}`;
		} else if (titleHasChinese && !textHasChinese) {
			titleCandidate = rawTitle;
			contentCandidate = rawText;
		} else {
			if (rawTitle.length <= 80 && !rawTitle.includes('\n')) {
				titleCandidate = rawTitle;
				contentCandidate = rawText;
			} else {
				const lines = (rawText || rawTitle)
					.split('\n')
					.map((l) => l.trim())
					.filter(Boolean);
				titleCandidate = lines[0] || rawTitle.slice(0, 60);
				contentCandidate = lines.slice(1).join('\n') || (rawText !== titleCandidate ? rawText : '');
			}
		}
	} else {
		const single = rawText || rawTitle;

		if (single.includes('\n')) {
			const lines = single
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean);
			titleCandidate = lines[0] || '';
			contentCandidate = lines.slice(1).join('\n');
		} else {
			const sepMatch = single.match(/^(.+?)\s*(?:[-—–]|\s[:：]\s|:\s)\s*(.+)$/);
			if (sepMatch && sepMatch[1] && sepMatch[2]) {
				const part1 = sepMatch[1].trim();
				const part2 = sepMatch[2].trim();
				const p1Zh = /[\u4e00-\u9fa5]/.test(part1);
				const p2Zh = /[\u4e00-\u9fa5]/.test(part2);

				if (p2Zh && !p1Zh) {
					titleCandidate = part2;
					contentCandidate = part1;
				} else {
					titleCandidate = part1;
					contentCandidate = part2;
				}
			} else if (single.length > 80) {
				const firstSentence = single.match(/^([^。！？!?.\n]+[。！？!?.])/);
				if (firstSentence && firstSentence[1] && firstSentence[1].length <= 80) {
					titleCandidate = firstSentence[1].trim();
					contentCandidate = single.slice(titleCandidate.length).trim() || single;
				} else {
					titleCandidate = single.slice(0, 60).trim() + '...';
					contentCandidate = single;
				}
			} else {
				titleCandidate = single;
				contentCandidate = '';
			}
		}
	}

	titleCandidate = titleCandidate.trim();
	contentCandidate = contentCandidate.trim();

	if (!titleCandidate && contentCandidate) {
		titleCandidate = contentCandidate.slice(0, 60);
	}

	const combined = `${titleCandidate} ${contentCandidate}`;
	const hasChinese = /[\u4e00-\u9fa5]/.test(combined);
	let language: 'chinese' | 'french';

	if (hasChinese) {
		language = 'chinese';
	} else {
		const hasFrenchAccents = /[éèêëàâçîïôûùœæ]/i.test(combined);
		if (hasFrenchAccents) {
			language = 'french';
		} else {
			language = params.fallbackLanguage || 'chinese';
		}
	}

	let pinyinStr: string | undefined;
	if (language === 'chinese' && titleCandidate) {
		const auto = generatePinyin(titleCandidate);
		if (auto && auto.trim()) {
			pinyinStr = auto.trim();
		}
	}

	return {
		title: titleCandidate,
		content: contentCandidate,
		language,
		pinyin: pinyinStr,
		tags: ['shared']
	};
}
