import type { AppBackup, WordProgress, WordRecord, StreakStats } from '@flash/shared';
import { MY_WORDS_DECK_ID, computeStreakStats } from '@flash/shared';
import { API_BASE_URL } from './apiBase';
import { sortWeekLabels, migrateWeekCategory } from './weeks';

export const ADMIN_PASSWORD = 'sangisha';
export const ADMIN_STORAGE_KEY = 'flashcards_lite_admin_unlocked';

let memoryUnlocked = false;

export function checkAdminPassword(pass: string): boolean {
	return pass.trim() === ADMIN_PASSWORD;
}

export function isAdminUnlocked(): boolean {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return memoryUnlocked;
	}
	try {
		return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
	} catch {
		return memoryUnlocked;
	}
}

export function setAdminUnlocked(unlocked: boolean): void {
	memoryUnlocked = unlocked;
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return;
	}
	try {
		if (unlocked) {
			sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
		} else {
			sessionStorage.removeItem(ADMIN_STORAGE_KEY);
		}
	} catch {
		// Ignore storage quota/availability issues
	}
}

export interface WordPracticeDetail {
	word: WordRecord;
	practiceCount: number;
	correctCount: number;
	wrongCount: number;
	accuracyPercent: number;
	lastReviewed?: number;
	reps: number;
	status: 'unpracticed' | 'learning' | 'mastered' | 'struggling';
}

export interface StudentWeekBreakdown {
	week: string;
	words: WordPracticeDetail[];
	totalPractices: number;
	masteredCount: number;
	avgAccuracy: number;
}

export interface StudentProfile {
	username: string;
	totalWords: number;
	totalPractices: number;
	overallAccuracy: number;
	lastActive?: number;
	currentStreak: number;
	streakStats: StreakStats;
	weeks: StudentWeekBreakdown[];
	rawBackup: AppBackup;
}

export interface MasterWordRecord {
	hanzi: string;
	pinyin: string;
	english: string;
	partOfSpeech: string;
	example?: string;
	weeks: string[];
	students: string[];
	totalPractices: number;
	totalCorrect: number;
	totalWrong: number;
	accuracyPercent: number;
	studentPracticeMap: Record<string, number>;
}

export function normalizeHanzi(hanzi?: string): string {
	return (hanzi || '').trim();
}

export async function fetchUserList(): Promise<string[]> {
	if (typeof window === 'undefined') return [];
	const res = await fetch(`${API_BASE_URL}/users`, {
		headers: { Accept: 'application/json' }
	});
	if (!res.ok) {
		throw new Error(`Failed to load users: HTTP ${res.status}`);
	}
	const data = await res.json();
	if (!Array.isArray(data)) return [];
	return data.map((u) => String(u).trim().toLowerCase()).filter(Boolean);
}

export async function fetchStudentBackup(username: string): Promise<AppBackup | null> {
	if (typeof window === 'undefined') return null;
	const clean = username.trim().toLowerCase();
	const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(clean)}`, {
		headers: { Accept: 'application/json' }
	});
	if (res.status === 404) return null;
	if (!res.ok) {
		throw new Error(`Failed to load data for ${clean}: HTTP ${res.status}`);
	}
	return (await res.json()) as AppBackup;
}

export async function fetchAllStudents(): Promise<StudentProfile[]> {
	const users = await fetchUserList();
	const results = await Promise.allSettled(
		users.map(async (user) => {
			const backup = await fetchStudentBackup(user);
			if (!backup) return null;
			return processStudentProfile(user, backup);
		})
	);

	const profiles: StudentProfile[] = [];
	for (const r of results) {
		if (r.status === 'fulfilled' && r.value) {
			profiles.push(r.value);
		}
	}

	return profiles.sort((a, b) => a.username.localeCompare(b.username));
}

export function processStudentProfile(username: string, backup: AppBackup): StudentProfile {
	const deck =
		backup.customDecks?.find((d) => d.id === MY_WORDS_DECK_ID) || backup.customDecks?.[0];
	const words: WordRecord[] = deck?.words ?? [];
	const progressMap: Record<string, WordProgress> = backup.progress ?? {};

	const weekMap = new Map<string, WordPracticeDetail[]>();
	let totalPractices = 0;
	let totalCorrect = 0;
	let lastActive: number | undefined = backup.exportedAt || backup.timestamp;

	for (const word of words) {
		const key = `custom-my-words:${word.No}`;
		let prog: WordProgress | undefined = progressMap[key];

		// Fallback check if keyed differently or missing prefix
		if (!prog) {
			for (const [pKey, pVal] of Object.entries(progressMap)) {
				if (pKey.endsWith(`:${word.No}`)) {
					prog = pVal;
					break;
				}
			}
		}

		const correct = prog?.correct || 0;
		const wrong = prog?.wrong || 0;
		const practices = correct + wrong;
		const reps = prog?.reps || 0;
		const accuracy = practices > 0 ? Math.round((correct / practices) * 100) : 0;
		const wordLastReviewed = prog?.lastReviewed;

		if (wordLastReviewed && (!lastActive || wordLastReviewed > lastActive)) {
			lastActive = wordLastReviewed;
		}

		totalPractices += practices;
		totalCorrect += correct;

		let status: WordPracticeDetail['status'];
		if (practices === 0) {
			status = 'unpracticed';
		} else if (wrong > correct && practices >= 2) {
			status = 'struggling';
		} else if (reps >= 3 && (prog?.easeFactor ?? 2.5) >= 2.2) {
			status = 'mastered';
		} else {
			status = 'learning';
		}

		const detail: WordPracticeDetail = {
			word,
			practiceCount: practices,
			correctCount: correct,
			wrongCount: wrong,
			accuracyPercent: accuracy,
			lastReviewed: wordLastReviewed,
			reps,
			status
		};

		const rawCat = (word.category || '').trim();
		const cat = migrateWeekCategory(rawCat);
		const weekLabel = cat || 'Unassigned';
		const list = weekMap.get(weekLabel) || [];
		list.push(detail);
		weekMap.set(weekLabel, list);
	}

	// Sort week labels: Sunday dates, then custom names, then Unassigned
	const sortedLabels = sortWeekLabels(Array.from(weekMap.keys()));

	const weeks: StudentWeekBreakdown[] = sortedLabels.map((week) => {
		const weekWords = weekMap.get(week) || [];
		const weekPractices = weekWords.reduce((sum, w) => sum + w.practiceCount, 0);
		const masteredCount = weekWords.filter((w) => w.status === 'mastered').length;
		const practicedWords = weekWords.filter((w) => w.practiceCount > 0);
		const avgAccuracy =
			practicedWords.length > 0
				? Math.round(
						practicedWords.reduce((sum, w) => sum + w.accuracyPercent, 0) / practicedWords.length
					)
				: 0;

		return {
			week,
			words: weekWords,
			totalPractices: weekPractices,
			masteredCount,
			avgAccuracy
		};
	});

	const overallAccuracy =
		totalPractices > 0 ? Math.round((totalCorrect / totalPractices) * 100) : 0;

	const streakStats = computeStreakStats(
		backup.progress ?? {},
		backup.streakFreezeData,
		backup.xpData?.dailyXP
	);

	return {
		username,
		totalWords: words.length,
		totalPractices,
		overallAccuracy,
		lastActive,
		currentStreak: streakStats.currentStreak,
		streakStats,
		weeks,
		rawBackup: backup
	};
}

export function buildMasterCurriculum(students: StudentProfile[]): MasterWordRecord[] {
	const masterMap = new Map<string, MasterWordRecord>();

	for (const student of students) {
		for (const week of student.weeks) {
			for (const item of week.words) {
				const hanzi = normalizeHanzi(item.word['Chinese Word']);
				if (!hanzi) continue;

				let record = masterMap.get(hanzi);
				if (!record) {
					record = {
						hanzi,
						pinyin: (item.word.Pinyin || '').trim(),
						english: (item.word['English Meaning'] || '').trim(),
						partOfSpeech: (item.word['Part of Speech'] || '').trim(),
						example: (item.word['Example (Chinese + Pinyin)'] || '').trim(),
						weeks: [],
						students: [],
						totalPractices: 0,
						totalCorrect: 0,
						totalWrong: 0,
						accuracyPercent: 0,
						studentPracticeMap: {}
					};
					masterMap.set(hanzi, record);
				}

				// Enhance missing/shorter fields
				if (!record.pinyin && item.word.Pinyin) {
					record.pinyin = item.word.Pinyin.trim();
				}
				if (!record.english && item.word['English Meaning']) {
					record.english = item.word['English Meaning'].trim();
				}
				if (!record.partOfSpeech && item.word['Part of Speech']) {
					record.partOfSpeech = item.word['Part of Speech'].trim();
				}
				if (!record.example && item.word['Example (Chinese + Pinyin)']) {
					record.example = item.word['Example (Chinese + Pinyin)'].trim();
				}

				// Track week category
				if (week.week && !record.weeks.includes(week.week)) {
					record.weeks.push(week.week);
				}

				// Track student
				if (!record.students.includes(student.username)) {
					record.students.push(student.username);
				}

				// Practice counts
				record.totalPractices += item.practiceCount;
				record.totalCorrect += item.correctCount;
				record.totalWrong += item.wrongCount;
				record.studentPracticeMap[student.username] =
					(record.studentPracticeMap[student.username] || 0) + item.practiceCount;
			}
		}
	}

	const list = Array.from(masterMap.values());
	for (const item of list) {
		item.accuracyPercent =
			item.totalPractices > 0 ? Math.round((item.totalCorrect / item.totalPractices) * 100) : 0;
		// Sort week names cleanly
		item.weeks = sortWeekLabels(item.weeks);
		item.students.sort();
	}

	return list.sort((a, b) => a.hanzi.localeCompare(b.hanzi));
}

export function filterMasterWordsByWeek(
	words: MasterWordRecord[],
	selectedWeek: string
): MasterWordRecord[] {
	if (!selectedWeek || selectedWeek === 'all') return words;
	return words.filter((w) => w.weeks.includes(selectedWeek));
}

export function exportMasterToTSV(words: MasterWordRecord[]): string {
	const header = [
		'Chinese Word',
		'Pinyin',
		'Part of Speech',
		'English Meaning',
		'Weeks',
		'Students Count',
		'Students',
		'Total Practices',
		'Accuracy (%)'
	].join('\t');

	const rows = words.map((w) =>
		[
			w.hanzi,
			w.pinyin,
			w.partOfSpeech,
			w.english,
			w.weeks.join(', '),
			String(w.students.length),
			w.students.join(', '),
			String(w.totalPractices),
			`${w.accuracyPercent}%`
		].join('\t')
	);

	return [header, ...rows].join('\n');
}

export function exportMasterToJSON(words: MasterWordRecord[]): string {
	return JSON.stringify(words, null, 2);
}
