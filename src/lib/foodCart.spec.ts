import { describe, it, expect } from 'vitest';
import { FOOD_ITEMS, CUSTOMER_PROFILES } from '$lib/data/foodCartItems';
import { calculateGameXP } from '$lib/utils/xp';

describe('Street Food Cart 3D Game Data & Logic', () => {
	it('has complete food items with valid pinyin, hanzi, and model paths', () => {
		expect(FOOD_ITEMS.length).toBeGreaterThanOrEqual(10);

		for (const item of FOOD_ITEMS) {
			expect(item.id).toBeTruthy();
			expect(item.hanzi.trim().length).toBeGreaterThan(0);
			expect(item.pinyin.trim().length).toBeGreaterThan(0);
			expect(item.english.trim().length).toBeGreaterThan(0);
			expect(item.modelPath.endsWith('.glb')).toBe(true);
			expect(item.scale).toBeGreaterThan(0);
			expect(item.emoji.trim().length).toBeGreaterThan(0);
		}
	});

	it('includes core beginner HSK food items', () => {
		const ids = FOOD_ITEMS.map((f) => f.id);
		expect(ids).toContain('baozi');
		expect(ids).toContain('cha');
		expect(ids).toContain('mifan');
		expect(ids).toContain('tang');
		expect(ids).toContain('yu');
		expect(ids).toContain('rou');
		expect(ids).toContain('jidan');
	});

	it('has distinct customer profiles with avatar and dialog', () => {
		expect(CUSTOMER_PROFILES.length).toBeGreaterThanOrEqual(4);
		for (const customer of CUSTOMER_PROFILES) {
			expect(customer.name).toBeTruthy();
			expect(customer.avatar).toBeTruthy();
			expect(customer.greeting).toBeTruthy();
			expect(customer.happySound).toBeTruthy();
		}
	});

	it('strictly adheres to calculateGameXP for XP rewards', () => {
		// Zero correct => 0 XP
		expect(calculateGameXP(0, 0, 0)).toBe(0);

		// Base formula: floor(correct * 0.5) + accuracyBonus + comboBonus
		// 10 correct, 80% accuracy, maxCombo 6
		// base = 5, accuracy bonus = 4, combo bonus = min(3, floor(6/3)) = 2 => 11 XP
		expect(calculateGameXP(10, 80, 6)).toBe(11);

		// 6 correct, 60% accuracy, maxCombo 3
		// base = 3, accuracy bonus = 2, combo bonus = 1 => 6 XP
		expect(calculateGameXP(6, 60, 3)).toBe(6);

		// Minimum 1 XP when correct > 0
		expect(calculateGameXP(1, 40, 0)).toBe(1);
	});
});
