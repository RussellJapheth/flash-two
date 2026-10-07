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
