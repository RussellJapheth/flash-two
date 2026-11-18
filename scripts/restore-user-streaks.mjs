import fs from 'node:fs';

const API_BASE_URL = 'https://json-drive.thespot.workers.dev/api/flashcards';
const HEADERS = {
	'User-Agent': 'Mozilla/5.0 (FlashCards-Streak-Restorer)',
	'Content-Type': 'application/json',
	Accept: 'application/json'
};

const MONTH_NAMES = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getCalendarSunday(date) {
	const d = new Date(date.getTime());
	const day = d.getUTCDay();
	const diff = day === 0 ? 0 : 7 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

function addWeeks(date, count) {
	const d = new Date(date.getTime());
	d.setUTCDate(d.getUTCDate() + count * 7);
	return d;
}

function formatWeekSundayLabel(date) {
	const sunday = getCalendarSunday(date);
	const day = sunday.getUTCDate();
	const month = MONTH_NAMES[sunday.getUTCMonth()];
	const year = sunday.getUTCFullYear();
	return `Sun ${day}, ${month} ${year}`;
}

function migrateCategory(category, baseSunday = getCalendarSunday(new Date())) {
	if (!category) return category;
	const trimmed = category.trim();
	if (!trimmed || trimmed.toLowerCase() === 'unassigned') return category;
	const match = trimmed.match(/^Week\s+(\d+)$/i);
	if (match) {
		const num = parseInt(match[1], 10);
		const targetSunday = addWeeks(baseSunday, Math.max(0, num - 1));
		return formatWeekSundayLabel(targetSunday);
	}
	return category;
}

async function main() {
	console.log('Reading backups...');
	const jBackup = JSON.parse(fs.readFileSync('backups/users/jeornee-2026-11-17T17-04-33-744Z.json', 'utf8'));
	const rOld = JSON.parse(fs.readFileSync('backups/russell-backup-before-backfill-2026-10-29.json', 'utf8'));
	const rNov = JSON.parse(fs.readFileSync('backups/users/russell-2026-11-17T17-04-33-744Z.json', 'utf8'));

	// 1. Reconstruct Jeornee
	const jWords = (jBackup.customDecks?.[0]?.words || []).map((w) => ({
		...w,
		category: migrateCategory(w.category)
	}));

	const jMergedProgress = { ...jBackup.progress };
	const jMergedDailyXP = { ...(jBackup.xpData?.dailyXP || {}) };

	// Ensure every practice date has a custom-history progress entry so it survives any key filtering
	const jPracticeDates = new Set();
	for (const p of Object.values(jBackup.progress || {})) {
		if (p.lastReviewed) jPracticeDates.add(new Date(p.lastReviewed).toISOString().split('T')[0]);
	}
	for (const d of Object.keys(jBackup.xpData?.dailyXP || {})) {
		jPracticeDates.add(d);
	}
	for (const d of jPracticeDates) {
		jMergedProgress[`custom-history-${d}`] = {
			weekId: 'custom',
			wordNo: 1,
			correct: 1,
			wrong: 0,
			lastReviewed: new Date(`${d}T12:00:00.000Z`).getTime()
		};
	}

	// Freeze dates covering gap to reach 71-day streak through Nov 17
	const jFreezeDates = [
		...new Set([
			...(jBackup.streakFreezeData?.usedDates || []),
			'2026-11-17'
		])
	].sort();

	const jeorneePayload = {
		version: 1,
		exportedAt: Date.now() + 500000,
		customDecks: [
			{
				id: 'custom-my-words',
				name: 'My Words',
				words: jWords,
				language: 'chinese',
				createdAt: Date.now() + 500000
			}
		],
		progress: jMergedProgress,
		streakFreezeData: { usedDates: jFreezeDates },
		xpData: {
			totalXP: jBackup.xpData?.totalXP || 2400,
			dailyXP: jMergedDailyXP,
			lastUpdated: Date.now(),
			migratedFromProgress: true,
			xpVersion: 1
		},
		language: 'chinese',
		username: 'jeornee'
	};

	// 2. Reconstruct Russell
	const rWords = (rNov.customDecks?.[0]?.words || rOld.customDecks?.[0]?.words || []).map((w) => ({
		...w,
		category: migrateCategory(w.category)
	}));

	const rMergedProgress = { ...rOld.progress, ...rNov.progress };
	const rMergedDailyXP = { ...(rOld.xpData?.dailyXP || {}) };
	for (const p of Object.values(rNov.progress || {})) {
		if (p.lastReviewed) {
			const iso = new Date(p.lastReviewed).toISOString().split('T')[0];
			rMergedDailyXP[iso] = (rMergedDailyXP[iso] || 0) + 10;
		}
	}

	// Ensure every practice date has a custom-history progress entry so it survives any key filtering
	const rPracticeDates = new Set();
	for (const p of Object.values(rOld.progress || {})) {
		if (p.lastReviewed) rPracticeDates.add(new Date(p.lastReviewed).toISOString().split('T')[0]);
	}
	for (const p of Object.values(rNov.progress || {})) {
		if (p.lastReviewed) rPracticeDates.add(new Date(p.lastReviewed).toISOString().split('T')[0]);
	}
	for (const d of Object.keys(rOld.xpData?.dailyXP || {})) {
		rPracticeDates.add(d);
	}
	for (const d of rPracticeDates) {
		rMergedProgress[`custom-history-${d}`] = {
			weekId: 'custom',
			wordNo: 1,
			correct: 1,
			wrong: 0,
			lastReviewed: new Date(`${d}T12:00:00.000Z`).getTime()
		};
	}

	const rFreezeDates = [
		...new Set([
			...(rOld.streakFreezeData?.usedDates || []),
			'2026-10-30',
			'2026-11-01',
			'2026-11-04',
			'2026-11-09',
			'2026-11-11',
			'2026-11-14',
			'2026-11-15'
		])
	].sort();

	const russellPayload = {
		version: 1,
		exportedAt: Date.now() + 500000,
		customDecks: [
			{
				id: 'custom-my-words',
				name: 'My Words',
				words: rWords,
				language: 'chinese',
				createdAt: Date.now() + 500000
			}
		],
		progress: rMergedProgress,
		streakFreezeData: { usedDates: rFreezeDates },
		xpData: {
			totalXP: Math.max(rOld.xpData?.totalXP || 0, 2500),
			dailyXP: rMergedDailyXP,
			lastUpdated: Date.now(),
			migratedFromProgress: true,
			xpVersion: 1
		},
		language: 'chinese',
		username: 'russell'
	};

	console.log('Uploading jeornee payload to remote JSON drive...');
	const jRes = await fetch(`${API_BASE_URL}/users/jeornee`, {
		method: 'PUT',
		headers: HEADERS,
		body: JSON.stringify(jeorneePayload)
	});
	console.log(`PUT /users/jeornee status: ${jRes.status}`);

	console.log('Uploading russell payload to remote JSON drive...');
	const rRes = await fetch(`${API_BASE_URL}/users/russell`, {
		method: 'PUT',
		headers: HEADERS,
		body: JSON.stringify(russellPayload)
	});
	console.log(`PUT /users/russell status: ${rRes.status}`);

	// Update user list
	const usersRes = await fetch(`${API_BASE_URL}/users`);
	let usersList = [];
	if (usersRes.ok) {
		usersList = await usersRes.json();
	}
	if (!Array.isArray(usersList)) usersList = [];
	for (const u of ['russell', 'jeornee']) {
		if (!usersList.includes(u)) usersList.push(u);
	}
	await fetch(`${API_BASE_URL}/users`, {
		method: 'PUT',
		headers: HEADERS,
		body: JSON.stringify(usersList)
	});
	console.log('Updated remote users list:', usersList);

	console.log('Streak restoration complete!');
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
