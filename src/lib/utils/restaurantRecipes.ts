/**
 * Pure rules for the Restaurant game (Kitchen Line).
 *
 * One diner, one order, no modes: every item shows its hanzi + pinyin and the
 * player picks the matching English word before the timer runs out. Three
 * wrong picks or timeouts and the shift ends.
 *
 * All vocabulary comes from `data/restaurantDishes.ts`, which resolves real
 * words out of the bundled Chinese packs.
 */
import type { DishComponent, MenuItem, StationId } from '$lib/data/restaurantDishes';

/** Courses an order cycles through, in the order they are served. */
export const ORDER_STATIONS: readonly StationId[] = ['main', 'dish', 'produce', 'drink', 'pantry'];

/** Items in one diner order: the courses above, served that many times. */
export const ORDER_SIZE = 10;

/** Milliseconds the player has to answer one item. */
export const ITEM_TIME_MS = 7000;

/** Wrong answers and timeouts allowed before the shift ends. */
export const MAX_LIVES = 3;

/** English choices offered per item: the right one plus same-course distractors. */
export const OPTION_COUNT = 3;

/** Deterministic PRNG so tests and seeds can reproduce a round. */
export function createRng(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

export function pickRandom<T>(rng: () => number, items: readonly T[]): T {
	if (items.length === 0) throw new Error('Cannot pick from an empty list');
	return items[Math.floor(rng() * items.length) % items.length];
}

export function shuffle<T>(rng: () => number, items: readonly T[]): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1)) % (i + 1);
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export interface DishRequirement {
	station: StationId;
	componentId: string;
}

export interface DishSpec {
	components: MenuItem[];
	requirements: DishRequirement[];
}

/**
 * Picks the artwork for this round. Each word has several baked sprites, so the
 * same menu item never looks identical twice and the whole pack gets used.
 */
export function resolveServiceMenu(
	rng: () => number,
	byStation: Record<StationId, DishComponent[]>
): Record<StationId, MenuItem[]> {
	const service: Record<StationId, MenuItem[]> = {
		main: [],
		dish: [],
		produce: [],
		drink: [],
		pantry: []
	};

	for (const station of ORDER_STATIONS) {
		service[station] = byStation[station].map((component) => ({
			...component,
			sprite: pickRandom(rng, component.sprites)
		}));
	}

	return service;
}

/** Every item on tonight's menu, flattened for lookups. */
export function flattenServiceMenu(service: Record<StationId, MenuItem[]>): MenuItem[] {
	return ORDER_STATIONS.flatMap((station) => service[station]);
}

/**
 * Builds a diner order of `size` items by cycling the courses, starting at a
 * random course so back-to-back orders feel different. `previousComponentIds`
 * keeps a fresh order from repeating the items the diner just ate.
 */
export function buildOrder(
	rng: () => number,
	service: Record<StationId, MenuItem[]>,
	stations: readonly StationId[] = ORDER_STATIONS,
	previousComponentIds: readonly string[] = [],
	size = ORDER_SIZE
): DishSpec {
	if (stations.length === 0) throw new Error('An order needs at least one course');
	if (!Number.isInteger(size) || size < 1) throw new Error('An order needs at least one item');

	const start = Math.floor(rng() * stations.length) % stations.length;
	const chosen: MenuItem[] = [];
	const usedIds = new Set<string>();

	for (let slot = 0; slot < size; slot += 1) {
		const station = stations[(start + slot) % stations.length];
		const pool = service[station];
		if (!pool || pool.length === 0)
			throw new Error(`No menu items available for course: ${station}`);

		const unused = pool.filter((component) => !usedIds.has(component.id));
		const fresh = unused.filter((component) => !previousComponentIds.includes(component.id));
		const component = pickRandom(rng, fresh.length > 0 ? fresh : unused.length > 0 ? unused : pool);
		usedIds.add(component.id);
		chosen.push(component);
	}

	return {
		components: chosen,
		requirements: chosen.map((component) => ({
			station: component.station,
			componentId: component.id
		}))
	};
}

/**
 * English answer choices for one item: the correct component plus distractors
 * from the same course, so every tap is a real meaning decision.
 */
export function buildItemOptions(
	rng: () => number,
	stationPool: readonly MenuItem[],
	requiredComponentId: string,
	optionCount = OPTION_COUNT
): MenuItem[] {
	const required = stationPool.find((component) => component.id === requiredComponentId);
	if (!required) {
		throw new Error(`Unknown menu item: ${requiredComponentId}`);
	}
	if (optionCount < 1) throw new Error('An item needs at least one answer choice');

	const distractors = shuffle(
		rng,
		stationPool.filter((component) => component.id !== requiredComponentId)
	).slice(0, optionCount - 1);

	return shuffle(rng, [required, ...distractors]);
}

/** Points for one plated item, following the combo curve used across the games. */
export function itemPoints(combo: number, completesOrder: boolean): number {
	const basePoints = 100 + Math.min(150, Math.max(0, combo - 1) * 25);
	return basePoints + (completesOrder ? 200 : 0);
}

/** Reward for answering quickly. Full budget = 100 points, linear decay to 0. */
export function speedBonus(elapsedMs: number, budgetMs: number): number {
	if (budgetMs <= 0) return 0;
	const ratio = Math.min(1, Math.max(0, elapsedMs / budgetMs));
	return Math.round(100 * (1 - ratio));
}
