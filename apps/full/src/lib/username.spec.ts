import { describe, it, expect } from 'vitest';
import { isValidUsername } from './utils/storage';

describe('Username validation', () => {
	it('accepts valid usernames with lowercase letters, numbers, and hyphens', () => {
		expect(isValidUsername('user')).toBe(true);
		expect(isValidUsername('user-123')).toBe(true);
		expect(isValidUsername('123-456')).toBe(true);
		expect(isValidUsername('alpha-beta-gamma-99')).toBe(true);
		expect(isValidUsername('a')).toBe(true);
		expect(isValidUsername('0')).toBe(true);
		expect(isValidUsername('-')).toBe(true);
	});

	it('rejects uppercase letters', () => {
		expect(isValidUsername('User')).toBe(false);
		expect(isValidUsername('USER-123')).toBe(false);
		expect(isValidUsername('user-Name')).toBe(false);
	});

	it('rejects spaces', () => {
		expect(isValidUsername('user name')).toBe(false);
		expect(isValidUsername(' user')).toBe(false);
		expect(isValidUsername('user ')).toBe(false);
		expect(isValidUsername(' ')).toBe(false);
	});

	it('rejects special characters other than hyphens', () => {
		expect(isValidUsername('user_name')).toBe(false);
		expect(isValidUsername('user.name')).toBe(false);
		expect(isValidUsername('user@domain')).toBe(false);
		expect(isValidUsername('user#1')).toBe(false);
		expect(isValidUsername('user$')).toBe(false);
		expect(isValidUsername('user+test')).toBe(false);
		expect(isValidUsername('user!123')).toBe(false);
	});

	it('rejects empty string as valid username format', () => {
		expect(isValidUsername('')).toBe(false);
	});
});
