import { describe, it, expect, beforeEach } from 'vitest';
import {
	getAllNotebookNotes,
	saveNotebookNote,
	deleteNotebookNote,
	togglePinNotebookNote,
	generatePinyin,
	exportNotesAsMarkdown,
	saveBulkNotebookNotes
} from './notebookStorage';

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

describe('notebookStorage', () => {
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

	it('returns empty array when no notes exist', () => {
		const notes = getAllNotebookNotes();
		expect(notes).toEqual([]);
	});

	it('creates and retrieves a new note', () => {
		const created = saveNotebookNote({
			title: '去超市买东西',
			content: 'Buying groceries at the supermarket.\n- 苹果 (apples)\n- 牛奶 (milk)',
			language: 'chinese',
			tags: ['shopping', 'daily'],
			pinyin: 'qù chāo shì mǎi dōng xī'
		});

		expect(created.id).toBeDefined();
		expect(created.title).toBe('去超市买东西');
		expect(created.language).toBe('chinese');
		expect(created.tags).toEqual(['shopping', 'daily']);
		expect(created.isPinned).toBe(false);

		const notes = getAllNotebookNotes();
		expect(notes.length).toBe(1);
		expect(notes[0].id).toBe(created.id);
	});

	it('updates existing note by ID', () => {
		const created = saveNotebookNote({
			title: 'Initial Title',
			content: 'Initial content',
			language: 'french'
		});

		const updated = saveNotebookNote({
			id: created.id,
			title: 'Updated Title',
			content: 'Updated content',
			language: 'french'
		});

		expect(updated.id).toBe(created.id);
		expect(updated.title).toBe('Updated Title');
		expect(updated.createdAt).toBe(created.createdAt);
		expect(updated.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);

		const notes = getAllNotebookNotes();
		expect(notes.length).toBe(1);
		expect(notes[0].title).toBe('Updated Title');
	});

	it('toggles pinned status and sorts pinned notes first', () => {
		const note1 = saveNotebookNote({
			title: 'Note 1',
			content: 'Content 1'
		});
		const note2 = saveNotebookNote({
			title: 'Note 2',
			content: 'Content 2'
		});

		// By default, note2 is newer, so it should be first
		let notes = getAllNotebookNotes();
		expect(notes[0].id).toBe(note2.id);

		// Pin note 1
		const toggleResult = togglePinNotebookNote(note1.id);
		expect(toggleResult).toBe(true);

		notes = getAllNotebookNotes();
		expect(notes[0].id).toBe(note1.id);
		expect(notes[0].isPinned).toBe(true);
		expect(notes[1].isPinned).toBe(false);
	});

	it('deletes note by ID', () => {
		const note = saveNotebookNote({
			title: 'To delete',
			content: 'Bye'
		});

		expect(getAllNotebookNotes().length).toBe(1);
		const removed = deleteNotebookNote(note.id);
		expect(removed).toBe(true);
		expect(getAllNotebookNotes().length).toBe(0);

		// Deleting non-existent note returns false
		expect(deleteNotebookNote('non-existent-id')).toBe(false);
	});

	it('generates accurate Pinyin for Chinese text', () => {
		const result = generatePinyin('去超市买东西');
		expect(result).toBe('qù chāo shì mǎi dōng xī');

		expect(generatePinyin('')).toBe('');
		expect(generatePinyin('   ')).toBe('');
	});

	it('exports notes as markdown string', () => {
		const note = saveNotebookNote({
			title: 'Bonjour le monde',
			content: 'Common French greeting.',
			language: 'french',
			tags: ['basics', 'greeting']
		});

		const md = exportNotesAsMarkdown([note]);
		expect(md).toContain('# FlashCards Language Notebook');
		expect(md).toContain('## Bonjour le monde');
		expect(md).toContain('**Language:** French');
		expect(md).toContain('**Tags:** #basics #greeting');
		expect(md).toContain('Common French greeting.');
	});

	it('merges bulk notes without overwriting newer edits', () => {
		saveNotebookNote({
			id: 'n-1',
			title: 'Local version',
			content: 'Local text'
		});

		saveBulkNotebookNotes([
			{
				id: 'n-1',
				title: 'Cloud older version',
				content: 'Cloud text',
				language: 'chinese',
				tags: [],
				isPinned: false,
				createdAt: 1000,
				updatedAt: 1000
			},
			{
				id: 'n-2',
				title: 'Cloud new note',
				content: 'New note text',
				language: 'chinese',
				tags: ['cloud'],
				isPinned: true,
				createdAt: 2000,
				updatedAt: 2000
			}
		]);

		const notes = getAllNotebookNotes();
		expect(notes.length).toBe(2);
		const n1 = notes.find((n) => n.id === 'n-1');
		expect(n1?.title).toBe('Local version'); // kept because local updatedAt is newer
		const n2 = notes.find((n) => n.id === 'n-2');
		expect(n2?.title).toBe('Cloud new note');
	});
});
