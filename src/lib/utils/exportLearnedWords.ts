import {
	getAllProgress,
	getWordProgress,
	getBuiltinPacks,
	getAllCustomDecks
} from '$lib/utils/storage';
import { isCardMastered, isCardLearning } from '$lib/utils/srs';

export async function exportLearnedWordsCsv(): Promise<{ count: number; filename: string }> {
	const progress = await getAllProgress();
	const chPacks = await getBuiltinPacks('chinese');
	const frPacks = await getBuiltinPacks('french');
	const customDecks = await getAllCustomDecks();

	const allActivePacks = [
		...chPacks.map((p) => ({
			id: p.id,
			title: p.title,
			words: p.words,
			lang: 'chinese' as const
		})),
		...frPacks.map((p) => ({
			id: p.id,
			title: p.title,
			words: p.words,
			lang: 'french' as const
		})),
		...customDecks.map((d) => ({
			id: d.id,
			title: d.name,
			words: d.words,
			lang: (d.language || 'chinese') as 'chinese' | 'french'
		}))
	];

	const headers = [
		'Language',
		'Deck / Pack',
		'Word #',
		'Target Word',
		'Pinyin / Phonetic',
		'Part of Speech',
		'English Meaning',
		'Mastery Stage',
		'Correct Reviews',
		'Incorrect Reviews',
		'Accuracy (%)',
		'Interval (Days)',
		'Repetitions',
		'Last Reviewed',
		'Example'
	];

	const rows: string[][] = [headers];
	let exportCount = 0;

	for (const pack of allActivePacks) {
		for (const word of pack.words) {
			const p = getWordProgress(progress, pack.id, word.No, pack.lang);
			if (
				p &&
				(isCardMastered(p) ||
					isCardLearning(p) ||
					(p.correct || 0) + (p.wrong || 0) > 0 ||
					(p.reps || 0) > 0)
			) {
				exportCount++;
				const stage = isCardMastered(p) ? 'Mastered' : 'Learning';
				const attempts = (p.correct || 0) + (p.wrong || 0);
				const acc = attempts > 0 ? `${Math.round(((p.correct || 0) / attempts) * 100)}%` : '0%';
				const targetWord = word['Chinese Word'] || word['French Word'] || '';
				const pinyin = word.Pinyin || '';
				const pos = word['Part of Speech'] || '';
				const meaning = word['English Meaning'] || '';
				const lastReviewed = p.lastReviewed
					? new Date(p.lastReviewed).toISOString().replace('T', ' ').substring(0, 19)
					: '';
				const example = word['Example (Chinese + Pinyin)'] || word['Example (French)'] || '';

				rows.push([
					pack.lang === 'chinese' ? 'Chinese' : 'French',
					pack.title,
					String(word.No),
					targetWord,
					pinyin,
					pos,
					meaning,
					stage,
					String(p.correct || 0),
					String(p.wrong || 0),
					acc,
					String(p.interval || 0),
					String(p.reps || 0),
					lastReviewed,
					example
				]);
			}
		}
	}

	if (exportCount === 0) {
		return { count: 0, filename: '' };
	}

	const csvContent = rows
		.map((row) =>
			row
				.map((cell) => {
					const str = cell ?? '';
					if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
						return `"${str.replace(/"/g, '""')}"`;
					}
					return str;
				})
				.join(',')
		)
		.join('\r\n');

	const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
	const filename = `flashcards-learned-words-${new Date().toISOString().split('T')[0]}.csv`;

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();

	setTimeout(() => {
		if (document.body.contains(a)) {
			document.body.removeChild(a);
		}
		URL.revokeObjectURL(url);
	}, 1500);

	return { count: exportCount, filename };
}
