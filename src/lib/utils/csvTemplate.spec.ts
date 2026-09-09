import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCsvTemplate, downloadCsvTemplate } from './csvTemplate';

describe('CSV Template Generator & Downloader', () => {
	it('generates valid Chinese CSV template with BOM and headers', () => {
		const csv = generateCsvTemplate('chinese');
		expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
		expect(csv).toContain('Word,Phonetic,English Meaning,Part of Speech,Example');
		expect(csv).toContain('你好,nǐ hǎo,Hello,noun,你好世界');
		expect(csv).toContain('谢谢,xiè xie,Thank you,verb,非常感谢');
	});

	it('generates valid French CSV template with BOM and headers', () => {
		const csv = generateCsvTemplate('french');
		expect(csv.charCodeAt(0)).toBe(0xfeff);
		expect(csv).toContain('Word,Phonetic,English Meaning,Part of Speech,Example');
		expect(csv).toContain('Bonjour,,Hello,noun,Bonjour le monde');
		expect(csv).toContain('Merci,,Thank you,verb,Merci beaucoup');
	});

	describe('Browser environment download', () => {
		let originalWindow: unknown;
		let originalDocument: unknown;

		beforeEach(() => {
			originalWindow = globalThis.window;
			originalDocument = globalThis.document;
		});

		afterEach(() => {
			globalThis.window = originalWindow as Window & typeof globalThis;
			globalThis.document = originalDocument as Document;
			vi.restoreAllMocks();
		});

		it('gracefully does nothing in SSR / non-browser environment', () => {
			// @ts-expect-error simulating SSR
			delete globalThis.window;
			// @ts-expect-error simulating SSR
			delete globalThis.document;

			expect(() => downloadCsvTemplate('chinese')).not.toThrow();
		});

		it('triggers cross-device download via blob and anchor click when window & document are present', () => {
			const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url');
			const revokeObjectURLSpy = vi.fn();
			globalThis.URL.createObjectURL = createObjectURLSpy;
			globalThis.URL.revokeObjectURL = revokeObjectURLSpy;

			const clickSpy = vi.fn();
			const mockAnchor = {
				href: '',
				style: { display: '' },
				setAttribute: vi.fn(),
				click: clickSpy
			};

			const mockBody = {
				appendChild: vi.fn(),
				removeChild: vi.fn(),
				contains: vi.fn().mockReturnValue(true)
			};

			const mockDoc = {
				createElement: vi.fn().mockImplementation((tag: string) => {
					if (tag === 'a') return mockAnchor;
					return {};
				}),
				body: mockBody
			};

			globalThis.window = {} as Window & typeof globalThis;
			globalThis.document = mockDoc as unknown as Document;

			downloadCsvTemplate('chinese', 'test.csv');

			expect(mockDoc.createElement).toHaveBeenCalledWith('a');
			expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', 'test.csv');
			expect(mockBody.appendChild).toHaveBeenCalledWith(mockAnchor);
			expect(clickSpy).toHaveBeenCalled();
			expect(createObjectURLSpy).toHaveBeenCalled();
		});
	});
});
