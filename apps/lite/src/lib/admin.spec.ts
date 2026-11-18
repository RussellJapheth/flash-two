import { describe, it, expect, beforeEach } from 'vitest';
import {
	ADMIN_PASSWORD,
	checkAdminPassword,
	isAdminUnlocked,
	setAdminUnlocked,
	normalizeHanzi,
	processStudentProfile,
	buildMasterCurriculum,
	filterMasterWordsByWeek,
	exportMasterToTSV
} from './admin';
import { formatWeekSundayLabel, addWeeks } from './weeks';
import type { AppBackup, WordRecord } from '@flash/shared';

describe('Admin Service', () => {
	beforeEach(() => {
		setAdminUnlocked(false);
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.clear();
		}
	});

	it('validates admin password correctly', () => {
		expect(ADMIN_PASSWORD).toBe('sangisha');
		expect(checkAdminPassword('sangisha')).toBe(true);
		expect(checkAdminPassword('  sangisha  ')).toBe(true);
		expect(checkAdminPassword('wrong')).toBe(false);
		expect(checkAdminPassword('')).toBe(false);
	});

	it('manages admin unlocked state in session storage', () => {
		expect(isAdminUnlocked()).toBe(false);
		setAdminUnlocked(true);
		expect(isAdminUnlocked()).toBe(true);
		setAdminUnlocked(false);
		expect(isAdminUnlocked()).toBe(false);
	});

	it('normalizes Hanzi text', () => {
		expect(normalizeHanzi(' 你好 ')).toBe('你好');
		expect(normalizeHanzi('')).toBe('');
		expect(normalizeHanzi(undefined)).toBe('');
	});

	it('processes student profile and computes week practice counts', () => {
		const words: WordRecord[] = [
			{
				No: 1,
				'Chinese Word': '你好',
				Pinyin: 'nǐ hǎo',
				'Part of Speech': 'Interjection',
				'English Meaning': 'hello',
				category: 'Week 1'
			},
			{
				No: 2,
				'Chinese Word': '谢谢',
				Pinyin: 'xièxie',
				'Part of Speech': 'Verb',
				'English Meaning': 'thanks',
				category: 'Week 1'
			},
			{
				No: 3,
				'Chinese Word': '再见',
				Pinyin: 'zàijiàn',
				'Part of Speech': 'Interjection',
				'English Meaning': 'goodbye',
				category: 'Week 2'
			}
		];

		const backup: AppBackup = {
			version: 1,
			exportedAt: 1700000000,
			customDecks: [
				{
					id: 'custom-my-words',
					name: 'My Words',
					words
				}
			],
			progress: {
				'custom-my-words:1': {
					weekId: 'custom-my-words',
					wordNo: 1,
					correct: 8,
					wrong: 2,
					lastReviewed: 1700000500,
					reps: 4,
					easeFactor: 2.5
				},
				'custom-my-words:2': {
					weekId: 'custom-my-words',
					wordNo: 2,
					correct: 1,
					wrong: 4,
					lastReviewed: 1700000100,
					reps: 0,
					easeFactor: 1.8
				}
			}
		};

		const profile = processStudentProfile('alice', backup);
		expect(profile.username).toBe('alice');
		expect(profile.totalWords).toBe(3);
		expect(profile.totalPractices).toBe(15); // 8+2 + 1+4 = 15
		expect(profile.overallAccuracy).toBe(60); // 9 / 15 = 60%
		expect(profile.weeks.length).toBe(2);
		expect(typeof profile.currentStreak).toBe('number');
		expect(profile.streakStats).toBeDefined();

		const expectedWeek1 = formatWeekSundayLabel(new Date());
		const expectedWeek2 = formatWeekSundayLabel(addWeeks(new Date(), 1));

		const week1 = profile.weeks.find((w) => w.week === expectedWeek1);
		expect(week1).toBeDefined();
		expect(week1?.words.length).toBe(2);
		expect(week1?.totalPractices).toBe(15);
		expect(week1?.words[0].word['Chinese Word']).toBe('你好');
		expect(week1?.words[0].practiceCount).toBe(10);
		expect(week1?.words[0].status).toBe('mastered');
		expect(week1?.words[1].word['Chinese Word']).toBe('谢谢');
		expect(week1?.words[1].practiceCount).toBe(5);
		expect(week1?.words[1].status).toBe('struggling');

		const week2 = profile.weeks.find((w) => w.week === expectedWeek2);
		expect(week2).toBeDefined();
		expect(week2?.words.length).toBe(1);
		expect(week2?.words[0].practiceCount).toBe(0);
		expect(week2?.words[0].status).toBe('unpracticed');
	});

	it('computes student streak stats including dailyXP and freeze data', () => {
		const todayIso = new Date().toISOString().split('T')[0];
		const yesterdayIso = new Date(Date.now() - 86400000).toISOString().split('T')[0];

		const backup: AppBackup = {
			version: 1,
			exportedAt: Date.now(),
			customDecks: [
				{
					id: 'custom-my-words',
					name: 'My Words',
					words: [
						{
							No: 1,
							'Chinese Word': '测试',
							Pinyin: 'cèshì',
							'Part of Speech': 'Noun',
							'English Meaning': 'test',
							category: 'Week 1'
						}
					]
				}
			],
			progress: {
				'custom-history-1': {
					weekId: 'custom-my-words',
					wordNo: 1,
					lastReviewed: new Date(todayIso).getTime() + 1000,
					correct: 5,
					wrong: 0,
					reps: 1
				}
			},
			xpData: {
				totalXP: 100,
				lastUpdated: Date.now(),
				dailyXP: {
					[todayIso]: 50,
					[yesterdayIso]: 50
				}
			}
		};

		const profile = processStudentProfile('bob', backup);
		expect(profile.currentStreak).toBeGreaterThanOrEqual(2);
		expect(profile.streakStats.tierName).toBeDefined();
	});

	it('builds deduplicated master curriculum by Hanzi alone', () => {
		const student1 = processStudentProfile('alice', {
			version: 1,
			customDecks: [
				{
					id: 'custom-my-words',
					name: 'My Words',
					words: [
						{
							No: 1,
							'Chinese Word': '你好',
							Pinyin: 'nǐ hǎo',
							'Part of Speech': 'Interjection',
							'English Meaning': 'hello',
							category: 'Week 1'
						},
						{
							No: 2,
							'Chinese Word': '水',
							Pinyin: 'shuǐ',
							'Part of Speech': 'Noun',
							'English Meaning': 'water',
							category: 'Week 2'
						}
					]
				}
			],
			progress: {
				'custom-my-words:1': {
					weekId: 'custom-my-words',
					wordNo: 1,
					correct: 5,
					wrong: 1,
					lastReviewed: 1000
				}
			}
		});

		const student2 = processStudentProfile('bob', {
			version: 1,
			customDecks: [
				{
					id: 'custom-my-words',
					name: 'My Words',
					words: [
						{
							No: 1,
							'Chinese Word': '你好',
							Pinyin: 'nǐ hǎo',
							'Part of Speech': 'Interjection',
							'English Meaning': 'hello',
							category: 'Week 1'
						},
						{
							No: 2,
							'Chinese Word': '火',
							Pinyin: 'huǒ',
							'Part of Speech': 'Noun',
							'English Meaning': 'fire',
							category: 'Week 3'
						}
					]
				}
			],
			progress: {
				'custom-my-words:1': {
					weekId: 'custom-my-words',
					wordNo: 1,
					correct: 3,
					wrong: 1,
					lastReviewed: 1000
				}
			}
		});

		const master = buildMasterCurriculum([student1, student2]);
		const expectedWeek1 = formatWeekSundayLabel(new Date());
		// Should have 3 unique words: 你好, 水, 火
		expect(master.length).toBe(3);

		const nihao = master.find((w) => w.hanzi === '你好');
		expect(nihao).toBeDefined();
		expect(nihao?.students).toEqual(['alice', 'bob']);
		expect(nihao?.totalPractices).toBe(10); // (5+1) + (3+1)
		expect(nihao?.totalCorrect).toBe(8);
		expect(nihao?.accuracyPercent).toBe(80); // 8/10
		expect(nihao?.studentPracticeMap).toEqual({ alice: 6, bob: 4 });

		const filteredWeek1 = filterMasterWordsByWeek(master, expectedWeek1);
		expect(filteredWeek1.length).toBe(1);
		expect(filteredWeek1[0].hanzi).toBe('你好');

		const tsv = exportMasterToTSV(master);
		expect(tsv).toContain('Chinese Word\tPinyin\tPart of Speech');
		expect(tsv).toContain(
			`你好\tnǐ hǎo\tInterjection\thello\t${expectedWeek1}\t2\talice, bob\t10\t80%`
		);
	});
});
