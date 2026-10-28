import { addXP } from './xp';
import { ALL_TEXTBOOK_UNITS } from '$lib/data/textbook';

const TEXTBOOK_COMPLETED_KEY = 'flashcards_completed_textbook_units';
const TEXTBOOK_CURRENT_UNIT_KEY = 'flashcards_last_viewed_textbook_unit';

function isBrowser(): boolean {
	return typeof window !== 'undefined' || typeof localStorage !== 'undefined';
}

export function getCompletedTextbookUnits(): string[] {
	if (!isBrowser()) return [];
	try {
		const raw = localStorage.getItem(TEXTBOOK_COMPLETED_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function isTextbookUnitCompleted(unitId: string): boolean {
	const completed = getCompletedTextbookUnits();
	return completed.includes(unitId);
}

export function markTextbookUnitCompleted(unitId: string): {
	justCompleted: boolean;
	xpAwarded: number;
} {
	if (!isBrowser()) return { justCompleted: false, xpAwarded: 0 };

	const completed = getCompletedTextbookUnits();
	if (completed.includes(unitId)) {
		return { justCompleted: false, xpAwarded: 0 };
	}

	const updated = [...completed, unitId];
	try {
		localStorage.setItem(TEXTBOOK_COMPLETED_KEY, JSON.stringify(updated));
	} catch {
		// Ignore storage quota errors
	}

	// Find the unit to get its specified XP reward (default 15)
	const unit = ALL_TEXTBOOK_UNITS.find((u) => u.id === unitId);
	const xpAmount = unit?.xpReward ?? 15;

	// Centralized XP addition
	addXP(xpAmount);

	return {
		justCompleted: true,
		xpAwarded: xpAmount
	};
}

export function getLastViewedTextbookUnit(): string {
	if (!isBrowser()) return 'unit-01';
	try {
		return localStorage.getItem(TEXTBOOK_CURRENT_UNIT_KEY) || 'unit-01';
	} catch {
		return 'unit-01';
	}
}

export function setLastViewedTextbookUnit(unitId: string): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(TEXTBOOK_CURRENT_UNIT_KEY, unitId);
	} catch {
		// Ignore
	}
}

export function getTextbookStats(): {
	totalUnits: number;
	completedCount: number;
	percentage: number;
	totalEarnedXP: number;
} {
	const completed = getCompletedTextbookUnits();
	const totalUnits = ALL_TEXTBOOK_UNITS.length;
	const completedCount = completed.length;
	const percentage = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;
	const totalEarnedXP = completed.reduce((acc, id) => {
		const unit = ALL_TEXTBOOK_UNITS.find((u) => u.id === id);
		return acc + (unit?.xpReward ?? 15);
	}, 0);

	return {
		totalUnits,
		completedCount,
		percentage,
		totalEarnedXP
	};
}
