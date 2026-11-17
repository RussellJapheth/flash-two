import fs from 'node:fs';
import path from 'node:path';

const API_BASE_URL = 'https://json-drive.thespot.workers.dev/api/flashcards';
const HEADERS = {
	'User-Agent': 'Mozilla/5.0 (FlashCards-Backup)',
	Accept: 'application/json'
};

async function main() {
	console.log('Fetching user list from JSON drive...');
	const usersRes = await fetch(`${API_BASE_URL}/users`, { headers: HEADERS });
	if (!usersRes.ok) {
		throw new Error(`Failed to fetch users: HTTP ${usersRes.status}`);
	}
	const users = await usersRes.json();
	console.log(`Discovered ${users.length} users:`, users);

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backupDir = path.resolve('backups');
	const usersBackupDir = path.join(backupDir, 'users');

	fs.mkdirSync(usersBackupDir, { recursive: true });

	const fullBackup = {
		backupTimestamp: Date.now(),
		backupIso: new Date().toISOString(),
		totalUsers: users.length,
		usersData: {}
	};

	for (const username of users) {
		console.log(`Backing up user: ${username}...`);
		const userRes = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
			headers: HEADERS
		});
		if (!userRes.ok) {
			console.warn(`Could not fetch data for ${username}: HTTP ${userRes.status}`);
			continue;
		}
		const userData = await userRes.json();
		fullBackup.usersData[username] = userData;

		const userFilePath = path.join(usersBackupDir, `${username}-${timestamp}.json`);
		fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2), 'utf-8');
		console.log(`Saved user backup: ${userFilePath} (${fs.statSync(userFilePath).size} bytes)`);
	}

	const consolidatedFilePath = path.join(backupDir, `json-drive-full-backup-${timestamp}.json`);
	fs.writeFileSync(consolidatedFilePath, JSON.stringify(fullBackup, null, 2), 'utf-8');
	console.log(
		`Saved consolidated backup: ${consolidatedFilePath} (${fs.statSync(consolidatedFilePath).size} bytes)`
	);

	// Verify all backups exist and are non-empty
	if (!fs.existsSync(consolidatedFilePath) || fs.statSync(consolidatedFilePath).size === 0) {
		throw new Error('Consolidated backup file verification failed!');
	}

	for (const username of Object.keys(fullBackup.usersData)) {
		const uPath = path.join(usersBackupDir, `${username}-${timestamp}.json`);
		if (!fs.existsSync(uPath) || fs.statSync(uPath).size === 0) {
			throw new Error(`User backup file verification failed for ${username}!`);
		}
	}

	console.log('Backup verification PASSED! All data preserved.');

	// Execute purge
	console.log('Initiating JSON drive purge...');
	for (const username of users) {
		console.log(`Deleting remote user: ${username}...`);
		const delRes = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
			method: 'DELETE',
			headers: HEADERS
		});
		console.log(`DELETE /users/${username} status: ${delRes.status}`);
	}

	console.log('Resetting /users index to empty list...');
	const resetRes = await fetch(`${API_BASE_URL}/users`, {
		method: 'PUT',
		headers: { ...HEADERS, 'Content-Type': 'application/json' },
		body: JSON.stringify([])
	});
	console.log(`PUT /users status: ${resetRes.status}`);

	// Verify purge
	console.log('Verifying purge on JSON drive...');
	const verifyUsersRes = await fetch(`${API_BASE_URL}/users`, { headers: HEADERS });
	const remainingUsers = await verifyUsersRes.json();
	console.log('Remaining users on JSON drive:', remainingUsers);

	if (Array.isArray(remainingUsers) && remainingUsers.length === 0) {
		console.log('JSON DRIVE PURGE VERIFIED: 0 users remaining.');
	} else {
		console.warn('Warning: Some users may still remain:', remainingUsers);
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
