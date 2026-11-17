/**
 * Generates CSV template content for importing flashcards.
 * Prefixes with UTF-8 BOM (\uFEFF) to ensure non-ASCII characters (Hanzi, Pinyin tones, French accents)
 * render properly across Microsoft Excel, Apple Numbers, Google Sheets, iOS, and Android.
 */
export function generateCsvTemplate(language: 'chinese' | 'french' = 'chinese'): string {
	const bom = '\uFEFF';
	const header = 'Word,Phonetic,English Meaning,Part of Speech,Example';

	if (language === 'chinese') {
		const sampleRows = [
			'你好,nǐ hǎo,Hello,noun,你好世界',
			'谢谢,xiè xie,Thank you,verb,非常感谢',
			'再见,zài jiàn,Goodbye,noun,明天见'
		];
		return `${bom}${header}\n${sampleRows.join('\n')}\n`;
	} else {
		const sampleRows = [
			'Bonjour,,Hello,noun,Bonjour le monde',
			'Merci,,Thank you,verb,Merci beaucoup',
			'Au revoir,,Goodbye,noun,À demain'
		];
		return `${bom}${header}\n${sampleRows.join('\n')}\n`;
	}
}

/**
 * Triggers a cross-device browser file download of the CSV template.
 * Works seamlessly across Desktop, iOS Safari, Android Chrome, and WebViews.
 */
export function downloadCsvTemplate(
	language: 'chinese' | 'french' = 'chinese',
	filename?: string
): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;

	const content = generateCsvTemplate(language);
	const targetFilename = filename || `flashcards_template_${language}.csv`;
	const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', targetFilename);
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();

	setTimeout(() => {
		if (document.body.contains(link)) {
			document.body.removeChild(link);
		}
		URL.revokeObjectURL(url);
	}, 1000);
}
