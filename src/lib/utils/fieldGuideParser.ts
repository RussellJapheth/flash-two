/**
 * Field Guide Markdown Parser
 * Parses curated Markdown field guides into structured UI blocks
 * with high-yield Chinese phrase extraction and click-to-lookup tokens.
 */

export interface ParsedTable {
	type: 'table';
	headers: string[];
	rows: string[][];
}

export interface ParsedDialogue {
	type: 'dialogue';
	speaker: string;
	hanzi: string;
	pinyin?: string;
	english?: string;
	note?: string;
}

export interface ParsedListItem {
	type: 'listItem';
	label?: string;
	text: string;
	hanzi?: string;
	pinyin?: string;
	english?: string;
}

export interface ParsedHeading {
	type: 'heading';
	level: 1 | 2 | 3;
	text: string;
}

export interface ParsedCallout {
	type: 'callout';
	text: string;
}

export interface ParsedParagraph {
	type: 'paragraph';
	text: string;
}

export interface ParsedDeckLink {
	type: 'deckLink';
	packNum: number;
	packTitle: string;
}

export interface ParsedDiagram {
	type: 'diagram';
	content: string;
}

export type FieldGuideBlock =
	| ParsedHeading
	| ParsedDeckLink
	| ParsedTable
	| ParsedDialogue
	| ParsedListItem
	| ParsedCallout
	| ParsedParagraph
	| ParsedDiagram;

// Regex to extract Chinese characters
export const HANZI_REGEX = /[\u4e00-\u9fff]+/g;

/**
 * Parses raw field guide markdown into structured blocks
 */
export function parseFieldGuideMarkdown(markdown: string): FieldGuideBlock[] {
	if (!markdown) return [];

	const lines = markdown.split('\n');
	const blocks: FieldGuideBlock[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		// Empty line or horizontal rule
		if (!trimmed || trimmed === '---') {
			i++;
			continue;
		}

		// Mermaid / Code blocks
		if (trimmed.startsWith('```')) {
			const diagramLines: string[] = [];
			i++;
			while (i < lines.length && !lines[i].trim().startsWith('```')) {
				diagramLines.push(lines[i]);
				i++;
			}
			i++; // skip closing ```
			blocks.push({
				type: 'diagram',
				content: diagramLines.join('\n').trim()
			});
			continue;
		}

		// SRS Deck Link line: e.g. _Corresponding SRS Deck: Pack 24 (Field Guide: ...)_
		if (trimmed.includes('Corresponding SRS Deck:')) {
			const match = trimmed.match(/Pack\s+(\d+)\s*\(([^)]+)\)/i);
			if (match) {
				blocks.push({
					type: 'deckLink',
					packNum: parseInt(match[1], 10),
					packTitle: match[2].trim()
				});
				i++;
				continue;
			}
		}

		// Skip source attribution line
		if (trimmed.startsWith('_Source:')) {
			i++;
			continue;
		}

		// Headings
		if (trimmed.startsWith('### ')) {
			blocks.push({ type: 'heading', level: 3, text: trimmed.replace(/^###\s+/, '') });
			i++;
			continue;
		}
		if (trimmed.startsWith('## ')) {
			blocks.push({ type: 'heading', level: 2, text: trimmed.replace(/^##\s+/, '') });
			i++;
			continue;
		}
		if (trimmed.startsWith('# ')) {
			blocks.push({ type: 'heading', level: 1, text: trimmed.replace(/^#\s+/, '') });
			i++;
			continue;
		}

		// Markdown Table
		if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
			const tableLines: string[] = [];
			while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
				tableLines.push(lines[i].trim());
				i++;
			}

			if (tableLines.length >= 2) {
				const parseRow = (r: string) =>
					r
						.split('|')
						.slice(1, -1)
						.map((c) => c.trim().replace(/\*\*/g, ''));

				const headers = parseRow(tableLines[0]);
				const isSeparator = (r: string) => /^[|\s\-:]+$/.test(r);
				const dataRows = tableLines
					.slice(1)
					.filter((r) => !isSeparator(r))
					.map(parseRow);

				blocks.push({
					type: 'table',
					headers,
					rows: dataRows
				});
				continue;
			}
		}

		// Bullet Lists: - **Label**: Chinese (_pinyin_ — English)
		if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
			const itemText = trimmed.replace(/^[-*]\s+/, '');

			// Check for bold label: - **Prefer not to say**: `这个我不太想说` (_..._ — ...)
			const labelMatch = itemText.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);
			if (labelMatch) {
				const label = labelMatch[1].trim();
				const rest = labelMatch[2].trim();

				// Extract Chinese, Pinyin, English if available
				const hzMatch = rest.match(/[\u4e00-\u9fff]+/);
				const pyMatch = rest.match(/\(_([^_]+)_\)/) || rest.match(/\(([^)]+)\)/);
				const engMatch = rest.match(/[—-]\s*([^)]+)\)?$/);

				blocks.push({
					type: 'listItem',
					label,
					text: rest.replace(/[`*]/g, ''),
					hanzi: hzMatch ? hzMatch[0] : undefined,
					pinyin: pyMatch ? pyMatch[1] : undefined,
					english: engMatch ? engMatch[1].replace(/[()]/g, '').trim() : undefined
				});
			} else {
				const hzMatch = itemText.match(/[\u4e00-\u9fff]+/);
				const pyMatch = itemText.match(/\(_([^_]+)_\)/) || itemText.match(/\(([^)]+)\)/);
				const engMatch = itemText.match(/[—-]\s*([^)]+)\)?$/);

				blocks.push({
					type: 'listItem',
					text: itemText.replace(/[`*]/g, ''),
					hanzi: hzMatch ? hzMatch[0] : undefined,
					pinyin: pyMatch ? pyMatch[1] : undefined,
					english: engMatch ? engMatch[1].replace(/[()]/g, '').trim() : undefined
				});
			}
			i++;
			continue;
		}

		// Blockquotes / Tips
		if (trimmed.startsWith('>')) {
			blocks.push({
				type: 'callout',
				text: trimmed.replace(/^>\s*/, '')
			});
			i++;
			continue;
		}

		// Regular paragraph
		blocks.push({
			type: 'paragraph',
			text: trimmed
		});
		i++;
	}

	return blocks;
}

/**
 * Splits a text into clickable tokens of Hanzi and plain text
 */
export interface TextToken {
	text: string;
	isHanzi: boolean;
}

export function tokenizeTextWithHanzi(text: string): TextToken[] {
	if (!text) return [];

	const tokens: TextToken[] = [];
	const regex = /([\u4e00-\u9fff]+)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(text)) !== null) {
		if (match.index > lastIndex) {
			tokens.push({
				text: text.slice(lastIndex, match.index),
				isHanzi: false
			});
		}
		tokens.push({
			text: match[1],
			isHanzi: true
		});
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < text.length) {
		tokens.push({
			text: text.slice(lastIndex),
			isHanzi: false
		});
	}

	return tokens;
}
