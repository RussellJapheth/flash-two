import { describe, it, expect } from 'vitest';
import {
	numberToChinese,
	generateDistractors,
	generateNumberRushQuestion
} from './utils/chineseNumbers';
import {
	deduplicateUserLeaderboard,
	mergeLeaderboardScores,
	migrateGuestGameScores,
	syncRemoteScoresToLocal,
	type GameScoreRecord
} from './utils/gameStorage';

describe('Chinese Number Converter (Number Rush)', () => {
	it('converts single digits 0-9 accurately', () => {
		expect(numberToChinese(0)).toEqual({ value: 0, hanzi: '零', pinyin: 'líng' });
		expect(numberToChinese(1)).toEqual({ value: 1, hanzi: '一', pinyin: 'yī' });
		expect(numberToChinese(4)).toEqual({ value: 4, hanzi: '四', pinyin: 'sì' });
		expect(numberToChinese(8)).toEqual({ value: 8, hanzi: '八', pinyin: 'bā' });
	});

	it('converts teens 10-19 accurately', () => {
		expect(numberToChinese(10)).toEqual({ value: 10, hanzi: '十', pinyin: 'shí' });
		expect(numberToChinese(11)).toEqual({ value: 11, hanzi: '十一', pinyin: 'shí yī' });
		expect(numberToChinese(14)).toEqual({ value: 14, hanzi: '十四', pinyin: 'shí sì' });
		expect(numberToChinese(19)).toEqual({ value: 19, hanzi: '十九', pinyin: 'shí jiǔ' });
	});

	it('converts 20-99 accurately', () => {
		expect(numberToChinese(20)).toEqual({ value: 20, hanzi: '二十', pinyin: 'èr shí' });
		expect(numberToChinese(35)).toEqual({ value: 35, hanzi: '三十五', pinyin: 'sān shí wǔ' });
		expect(numberToChinese(40)).toEqual({ value: 40, hanzi: '四十', pinyin: 'sì shí' });
		expect(numberToChinese(99)).toEqual({ value: 99, hanzi: '九十九', pinyin: 'jiǔ shí jiǔ' });
	});

	it('converts 100-999 accurately', () => {
		expect(numberToChinese(100)).toEqual({ value: 100, hanzi: '一百', pinyin: 'yī bǎi' });
		expect(numberToChinese(105)).toEqual({
			value: 105,
			hanzi: '一百零五',
			pinyin: 'yī bǎi líng wǔ'
		});
		expect(numberToChinese(120)).toEqual({
			value: 120,
			hanzi: '一百二十',
			pinyin: 'yī bǎi èr shí'
		});
		expect(numberToChinese(350)).toEqual({
			value: 350,
			hanzi: '三百五十',
			pinyin: 'sān bǎi wǔ shí'
		});
		expect(numberToChinese(999)).toEqual({
			value: 999,
			hanzi: '九百九十九',
			pinyin: 'jiǔ bǎi jiǔ shí jiǔ'
		});
	});

	it('generates 3 distinct valid distractors for any number', () => {
		for (const target of [0, 5, 14, 35, 80, 99]) {
			const distractors = generateDistractors(target, 99);
			expect(distractors).toHaveLength(3);
			expect(distractors).not.toContain(target);
			const unique = new Set(distractors);
			expect(unique.size).toBe(3);
			distractors.forEach((d) => {
				expect(d).toBeGreaterThanOrEqual(0);
				expect(d).toBeLessThanOrEqual(99);
			});
		}
	});

	it('generates a full 4-option question containing the correct answer', () => {
		const q = generateNumberRushQuestion(99);
		expect(q.options).toHaveLength(4);
		expect(q.options).toContain(q.correctValue);
		expect(new Set(q.options).size).toBe(4);
		expect(q.hanzi).toBeTruthy();
		expect(q.pinyin).toBeTruthy();
	});

	it('never repeats the same number during a round when using usedNumbers tracking', () => {
		const used = new Set<number>();
		const totalQuestions = 50;
		for (let i = 0; i < totalQuestions; i++) {
			const q = generateNumberRushQuestion(99, used);
			expect(used.has(q.correctValue)).toBe(true);
		}
		// All 50 questions must have unique numbers
		expect(used.size).toBe(50);
	});

	it('deduplicates leaderboard so each user has one entry per mode (visual vs audio)', () => {
		const rawRecords: GameScoreRecord[] = [
			{
				id: '1',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 500,
				correct: 5,
				wrong: 0,
				accuracy: 100,
				maxCombo: 5,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: '2',
				username: 'bob',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 800,
				correct: 8,
				wrong: 0,
				accuracy: 100,
				maxCombo: 8,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: '3',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1200,
				correct: 12,
				wrong: 1,
				accuracy: 92,
				maxCombo: 10,
				mode: 'visual',
				playedAt: 2000
			},
			{
				id: '4',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 950,
				correct: 10,
				wrong: 0,
				accuracy: 100,
				maxCombo: 10,
				mode: 'audio',
				playedAt: 2500
			},
			{
				id: '5',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 600,
				correct: 6,
				wrong: 2,
				accuracy: 75,
				maxCombo: 4,
				mode: 'audio',
				playedAt: 1500
			}
		];

		const deduplicated = deduplicateUserLeaderboard(rawRecords);
		// Alice has 1 visual (1200) and 1 audio (950), Bob has 1 visual (800) -> total 3 entries
		expect(deduplicated).toHaveLength(3);
		expect(deduplicated[0].username).toBe('alice');
		expect(deduplicated[0].mode).toBe('visual');
		expect(deduplicated[0].score).toBe(1200);

		expect(deduplicated[1].username).toBe('alice');
		expect(deduplicated[1].mode).toBe('audio');
		expect(deduplicated[1].score).toBe(950);

		expect(deduplicated[2].username).toBe('bob');
		expect(deduplicated[2].mode).toBe('visual');
		expect(deduplicated[2].score).toBe(800);
	});

	it('preserves unsynced local high score when merging with remote records', () => {
		// Remote only had Alice's old run (600)
		const remoteRecords: GameScoreRecord[] = [
			{
				id: 'remote-1',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 600,
				correct: 6,
				wrong: 0,
				accuracy: 100,
				maxCombo: 6,
				mode: 'visual',
				playedAt: 1000
			}
		];

		// Local storage has run 1 (unsynced best: 1500) and run 2 (recent lower score: 800)
		const localHistory: GameScoreRecord[] = [
			{
				id: 'local-2',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 800,
				correct: 8,
				wrong: 1,
				accuracy: 88,
				maxCombo: 8,
				mode: 'visual',
				playedAt: 3000
			},
			{
				id: 'local-1',
				username: 'alice',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1500,
				correct: 15,
				wrong: 0,
				accuracy: 100,
				maxCombo: 15,
				mode: 'visual',
				playedAt: 2000
			}
		];

		const combined = [...localHistory, ...remoteRecords];
		const result = deduplicateUserLeaderboard(combined);

		expect(result).toHaveLength(1);
		expect(result[0].username).toBe('alice');
		expect(result[0].score).toBe(1500);
		expect(result[0].id).toBe('local-1');
	});

	it('ensures devices only send highest scores to leaderboard and merges offline data seamlessly', () => {
		// Device accumulated multiple offline scores across games and modes
		const deviceOfflineScores: GameScoreRecord[] = [
			{
				id: 'local-attempt-1',
				username: 'charlie',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 300,
				correct: 3,
				wrong: 2,
				accuracy: 60,
				maxCombo: 2,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: 'local-attempt-2',
				username: 'charlie',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1800, // charlie's visual best
				correct: 18,
				wrong: 0,
				accuracy: 100,
				maxCombo: 18,
				mode: 'visual',
				playedAt: 2000
			},
			{
				id: 'local-attempt-3',
				username: 'charlie',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1100,
				correct: 11,
				wrong: 1,
				accuracy: 91,
				maxCombo: 10,
				mode: 'visual',
				playedAt: 3000
			},
			{
				id: 'local-attempt-audio-1',
				username: 'charlie',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 950, // charlie's audio best
				correct: 9,
				wrong: 0,
				accuracy: 100,
				maxCombo: 9,
				mode: 'audio',
				playedAt: 4000
			}
		];

		// Remote already had Diana with 1500 and Charlie with an older 500
		const existingRemoteLeaderboard: GameScoreRecord[] = [
			{
				id: 'remote-diana',
				username: 'diana',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1500,
				correct: 15,
				wrong: 0,
				accuracy: 100,
				maxCombo: 15,
				mode: 'visual',
				playedAt: 500
			},
			{
				id: 'remote-charlie-old',
				username: 'charlie',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 500,
				correct: 5,
				wrong: 1,
				accuracy: 83,
				maxCombo: 4,
				mode: 'visual',
				playedAt: 400
			}
		];

		const merged = mergeLeaderboardScores(deviceOfflineScores, existingRemoteLeaderboard);

		// Charlie's visual score updated to 1800 (best of offline runs)
		// Charlie's audio score added as 950
		// Diana's visual score preserved as 1500
		// Exactly 3 entries total (1 per user per mode)
		expect(merged).toHaveLength(3);

		const visualScores = merged.filter((m) => m.mode === 'visual');
		expect(visualScores).toHaveLength(2);
		expect(visualScores[0].username).toBe('charlie');
		expect(visualScores[0].score).toBe(1800);
		expect(visualScores[0].id).toBe('local-attempt-2');

		expect(visualScores[1].username).toBe('diana');
		expect(visualScores[1].score).toBe(1500);

		const audioScores = merged.filter((m) => m.mode === 'audio');
		expect(audioScores).toHaveLength(1);
		expect(audioScores[0].username).toBe('charlie');
		expect(audioScores[0].score).toBe(950);
	});

	it('retains remote high score if device offline score is lower', () => {
		const deviceOfflineScores: GameScoreRecord[] = [
			{
				id: 'local-low',
				username: 'elena',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 700,
				correct: 7,
				wrong: 2,
				accuracy: 77,
				maxCombo: 5,
				mode: 'visual',
				playedAt: 5000
			}
		];

		const remoteLeaderboard: GameScoreRecord[] = [
			{
				id: 'remote-high',
				username: 'elena',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 2100,
				correct: 21,
				wrong: 0,
				accuracy: 100,
				maxCombo: 21,
				mode: 'visual',
				playedAt: 2000
			}
		];

		const merged = mergeLeaderboardScores(deviceOfflineScores, remoteLeaderboard);
		expect(merged).toHaveLength(1);
		expect(merged[0].username).toBe('elena');
		expect(merged[0].score).toBe(2100);
		expect(merged[0].id).toBe('remote-high');
	});

	it('discards "guest" records from leaderboard and purges existing remote "Guest" entries', () => {
		const deviceScoresWithGuest: GameScoreRecord[] = [
			{
				id: 'local-guest-1',
				username: 'Guest',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1200,
				correct: 12,
				wrong: 0,
				accuracy: 100,
				maxCombo: 12,
				mode: 'visual',
				playedAt: 1000
			},
			{
				id: 'local-user-1',
				username: 'frank',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1600,
				correct: 16,
				wrong: 0,
				accuracy: 100,
				maxCombo: 16,
				mode: 'visual',
				playedAt: 2000
			}
		];

		const remoteLeaderboardWithGuest: GameScoreRecord[] = [
			{
				id: 'remote-guest-old',
				username: 'guest',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 900,
				correct: 9,
				wrong: 1,
				accuracy: 90,
				maxCombo: 8,
				mode: 'visual',
				playedAt: 500
			},
			{
				id: 'remote-grace',
				username: 'grace',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 1400,
				correct: 14,
				wrong: 0,
				accuracy: 100,
				maxCombo: 14,
				mode: 'visual',
				playedAt: 1500
			}
		];

		// deduplicateUserLeaderboard excludes any 'guest' / 'Guest'
		const deduplicated = deduplicateUserLeaderboard(deviceScoresWithGuest);
		expect(deduplicated).toHaveLength(1);
		expect(deduplicated[0].username).toBe('frank');

		// mergeLeaderboardScores purges remote guest records
		const merged = mergeLeaderboardScores(deviceScoresWithGuest, remoteLeaderboardWithGuest);
		expect(merged).toHaveLength(2);
		expect(merged.some((r) => r.username.toLowerCase() === 'guest')).toBe(false);
		expect(merged[0].username).toBe('frank');
		expect(merged[1].username).toBe('grace');
	});

	it('migrates local guest game scores when cloud username is assigned', () => {
		const mockStorage: Record<string, string> = {
			flashcards_game_scores: JSON.stringify([
				{
					id: 'g-1',
					username: 'Guest',
					gameId: 'number-rush',
					gameName: 'Number Rush',
					score: 1200,
					correct: 12,
					wrong: 0,
					accuracy: 100,
					maxCombo: 12,
					mode: 'visual',
					playedAt: 1000
				},
				{
					id: 'u-1',
					username: 'alice',
					gameId: 'number-rush',
					gameName: 'Number Rush',
					score: 1500,
					correct: 15,
					wrong: 0,
					accuracy: 100,
					maxCombo: 15,
					mode: 'visual',
					playedAt: 2000
				}
			])
		};

		const origLocalStorage = globalThis.localStorage;
		globalThis.localStorage = {
			getItem: (key: string) => mockStorage[key] || null,
			setItem: (key: string, val: string) => {
				mockStorage[key] = val;
			},
			removeItem: (key: string) => {
				delete mockStorage[key];
			},
			clear: () => {
				for (const k in mockStorage) delete mockStorage[k];
			},
			key: () => null,
			length: 0
		} as unknown as Storage;

		try {
			const count = migrateGuestGameScores('bob');
			expect(count).toBe(1);
			const updated = JSON.parse(mockStorage.flashcards_game_scores);
			expect(updated[0].username).toBe('bob');
			expect(updated[1].username).toBe('alice');
		} finally {
			globalThis.localStorage = origLocalStorage;
		}
	});

	it('syncs remote leaderboard scores to local storage when remote score is higher', () => {
		const mockStorage: Record<string, string> = {
			flashcards_game_scores: JSON.stringify([
				{
					id: 'local-1',
					username: 'russell',
					gameId: 'number-rush',
					gameName: 'Number Rush',
					score: 400,
					correct: 4,
					wrong: 0,
					accuracy: 100,
					maxCombo: 4,
					mode: 'visual',
					playedAt: 1000
				}
			])
		};

		const origLocalStorage = globalThis.localStorage;
		globalThis.localStorage = {
			getItem: (key: string) => mockStorage[key] || null,
			setItem: (key: string, val: string) => {
				mockStorage[key] = val;
			},
			removeItem: (key: string) => {
				delete mockStorage[key];
			},
			clear: () => {
				for (const k in mockStorage) delete mockStorage[k];
			},
			key: () => null,
			length: 0
		} as unknown as Storage;

		const remoteRecords: GameScoreRecord[] = [
			{
				id: 'remote-1',
				username: 'russell',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 2400,
				correct: 24,
				wrong: 0,
				accuracy: 100,
				maxCombo: 24,
				mode: 'visual',
				playedAt: 5000
			},
			{
				id: 'remote-2',
				username: 'otheruser',
				gameId: 'number-rush',
				gameName: 'Number Rush',
				score: 3000,
				correct: 30,
				wrong: 0,
				accuracy: 100,
				maxCombo: 30,
				mode: 'visual',
				playedAt: 6000
			}
		];

		try {
			const updated = syncRemoteScoresToLocal(remoteRecords, 'russell');
			expect(updated).toBe(true);
			const saved = JSON.parse(mockStorage.flashcards_game_scores);
			expect(saved[0].score).toBe(2400);
			expect(saved[0].username).toBe('russell');
			// Did not import otheruser
			expect(saved.some((r: GameScoreRecord) => r.username === 'otheruser')).toBe(false);
		} finally {
			globalThis.localStorage = origLocalStorage;
		}
	});
});
