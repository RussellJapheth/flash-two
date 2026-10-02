import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	DINER_PROFILES,
	STATION_LABELS,
	buildRestaurantMenu,
	type RestaurantMenu,
	type StationId
} from '$lib/data/restaurantDishes';
import {
	ITEM_TIME_MS,
	MAX_LIVES,
	ORDER_SIZE,
	ORDER_STATIONS,
	OPTION_COUNT,
	buildItemOptions,
	buildOrder,
	buildShuffledOrder,
	createRng,
	flattenServiceMenu,
	itemPoints,
	pickRandom,
	resolveServiceMenu,
	shuffle,
	speedBonus
} from '$lib/utils/restaurantRecipes';
import { calculateGameXP } from '$lib/utils/xp';

const menu = buildRestaurantMenu();
const SPRITE_DIR = join(process.cwd(), 'static/images/restaurant/sprites/food');

function requireMenu(): RestaurantMenu {
	if (!menu.ok) {
		throw new Error(`Restaurant menu failed to resolve: ${menu.error}`);
	}
	return menu;
}

function serviceFor(seed = 1) {
	const resolved = requireMenu();
	return resolveServiceMenu(createRng(seed), resolved.byStation);
}

describe('Restaurant menu data', () => {
	it('resolves every component from the bundled vocabulary packs', () => {
		const resolved = requireMenu();
		expect(resolved.components.length).toBeGreaterThanOrEqual(19);

		for (const component of resolved.components) {
			expect(component.hanzi.trim().length).toBeGreaterThan(0);
			expect(component.pinyin.trim().length).toBeGreaterThan(0);
			expect(component.english.trim().length).toBeGreaterThan(0);
			expect(component.sprites.length).toBeGreaterThan(0);
			for (const sprite of component.sprites) {
				expect(sprite).toMatch(/^\/images\/restaurant\/sprites\/food\/[a-z-]+\.png$/);
			}
		}
	});

	it('only uses words that exist in the Chinese curriculum packs', () => {
		const resolved = requireMenu();
		const expected = [
			'米饭',
			'面条',
			'包子',
			'肉',
			'牛肉',
			'鸡肉',
			'鱼',
			'鸡蛋',
			'汤',
			'菜',
			'水果',
			'苹果',
			'茶',
			'咖啡',
			'牛奶',
			'水',
			'盐',
			'糖',
			'酱油'
		];
		expect(resolved.components.map((component) => component.hanzi).sort()).toEqual(
			[...expected].sort()
		);
	});

	it('keeps every course stocked with at least three items', () => {
		const resolved = requireMenu();
		const ids = resolved.components.map((component) => component.id);
		expect(new Set(ids).size).toBe(ids.length);

		for (const station of ORDER_STATIONS) {
			expect(resolved.byStation[station].length).toBeGreaterThanOrEqual(3);
			expect(STATION_LABELS[station]).toBeTruthy();
		}
	});

	it('uses a lot of the food pack across the menu', () => {
		const resolved = requireMenu();
		const used = new Set(resolved.components.flatMap((component) => component.sprites));
		expect(used.size).toBeGreaterThanOrEqual(30);

		const baked = readdirSync(SPRITE_DIR).filter((file) => file.endsWith('.png'));
		expect(baked.length).toBeGreaterThanOrEqual(50);
	});

	it('points every sprite at a file that was actually baked', () => {
		const resolved = requireMenu();
		for (const component of resolved.components) {
			for (const sprite of component.sprites) {
				const file = join(SPRITE_DIR, sprite.split('/').pop() ?? '');
				expect(existsSync(file), `${sprite} is missing`).toBe(true);
			}
		}
	});

	it('gives every item a distinct English meaning to choose from', () => {
		const resolved = requireMenu();
		const meanings = resolved.components.map((component) => component.english.toLowerCase());
		expect(new Set(meanings).size).toBe(meanings.length);
	});

	it('has diner profiles with avatar art and dialogue', () => {
		expect(DINER_PROFILES.length).toBeGreaterThanOrEqual(4);
		expect(DINER_PROFILES.map((diner) => diner.id)).not.toContain('zack');
		for (const diner of DINER_PROFILES) {
			expect(diner.name).toBeTruthy();
			expect(diner.greeting).toBeTruthy();
			expect(diner.avatarImg).toMatch(/^\/images\/restaurant\/avatars\/[a-z-]+\.png$/);
		}
	});
});

describe('Random helpers', () => {
	it('is deterministic for a given seed', () => {
		const first = Array.from({ length: 5 }, createRng(42));
		const second = Array.from({ length: 5 }, createRng(42));
		expect(first).toEqual(second);
		expect(createRng(1)()).not.toBe(createRng(2)());
	});

	it('keeps every item when shuffling', () => {
		const source = ['a', 'b', 'c', 'd'];
		const result = shuffle(createRng(3), source);
		expect(result).toHaveLength(source.length);
		expect([...result].sort()).toEqual([...source].sort());
		expect(source).toEqual(['a', 'b', 'c', 'd']);
	});

	it('refuses to pick from an empty list', () => {
		expect(() => pickRandom(createRng(1), [])).toThrow();
	});
});

describe('Service menu', () => {
	it('resolves one sprite per item from that word pool', () => {
		const resolved = requireMenu();
		const service = resolveServiceMenu(createRng(9), resolved.byStation);

		for (const station of ORDER_STATIONS) {
			expect(service[station]).toHaveLength(resolved.byStation[station].length);
			for (const item of service[station]) {
				expect(item.sprites).toContain(item.sprite);
			}
		}
	});

	it('varies the artwork for the same word across rounds', () => {
		const resolved = requireMenu();
		const seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const caiSprites = new Set(
			seeds.map((seed) => {
				const service = resolveServiceMenu(createRng(seed), resolved.byStation);
				return service.produce.find((item) => item.id === 'cai')?.sprite;
			})
		);
		expect(caiSprites.size).toBeGreaterThan(1);
	});

	it('flattens to the full menu', () => {
		const resolved = requireMenu();
		const flat = flattenServiceMenu(serviceFor(2));
		expect(flat).toHaveLength(resolved.components.length);
	});
});

describe('Order building', () => {
	it('serves ten items cycling the courses in order', () => {
		const order = buildOrder(createRng(7), serviceFor(7));

		expect(order.requirements).toHaveLength(ORDER_SIZE);
		expect(order.components).toHaveLength(ORDER_SIZE);

		const stations = order.requirements.map((requirement) => requirement.station);
		for (let slot = 1; slot < stations.length; slot += 1) {
			const expected =
				ORDER_STATIONS[
					(ORDER_STATIONS.indexOf(stations[slot - 1] as StationId) + 1) % ORDER_STATIONS.length
				];
			expect(stations[slot]).toBe(expected);
		}
	});

	it('covers every course twice in a ten item order', () => {
		const order = buildOrder(createRng(13), serviceFor(13));
		const counts = new Map<StationId, number>();
		for (const requirement of order.requirements) {
			counts.set(requirement.station, (counts.get(requirement.station) ?? 0) + 1);
		}
		expect(counts.size).toBe(ORDER_STATIONS.length);
		for (const station of ORDER_STATIONS) {
			expect(counts.get(station)).toBe(2);
		}
	});

	it('never serves the same item twice in one order', () => {
		const ids = buildOrder(createRng(3), serviceFor(3)).requirements.map((r) => r.componentId);
		expect(new Set(ids).size).toBe(ORDER_SIZE);
	});

	it('honours an explicit order size', () => {
		const service = serviceFor(4);
		expect(buildOrder(createRng(4), service, ORDER_STATIONS, [], 1).requirements).toHaveLength(1);
		expect(buildOrder(createRng(4), service, ORDER_STATIONS, [], 25).requirements).toHaveLength(25);
	});

	it('avoids repeating the previous order when alternatives exist', () => {
		const service = serviceFor(11);
		const rng = createRng(11);

		let previous: string[] = [];
		for (let round = 0; round < 20; round += 1) {
			const order = buildOrder(rng, service, ORDER_STATIONS, previous);
			const ids = order.requirements.map((requirement) => requirement.componentId);
			expect(ids).not.toEqual(previous);
			previous = ids;
		}
	});

	it('reports an empty course instead of inventing an item', () => {
		const service = serviceFor(1);
		expect(() => buildOrder(createRng(1), { ...service, pantry: [] })).toThrow(/pantry/);
	});

	it('rejects empty course lists and impossible sizes', () => {
		const service = serviceFor(1);
		expect(() => buildOrder(createRng(1), service, [])).toThrow();
		expect(() => buildOrder(createRng(1), service, ORDER_STATIONS, [], 0)).toThrow();
	});
});

describe('Answer choices', () => {
	it('offers the right item plus same-course distractors', () => {
		const service = serviceFor(5);
		const options = buildItemOptions(createRng(5), service.main, 'mifan');

		expect(options).toHaveLength(OPTION_COUNT);
		expect(options.filter((option) => option.id === 'mifan')).toHaveLength(1);
		for (const option of options) {
			expect(option.station).toBe('main');
		}
	});

	it('never repeats an English meaning between options', () => {
		const service = serviceFor(6);
		for (const station of ORDER_STATIONS) {
			for (let attempt = 0; attempt < 10; attempt += 1) {
				const options = buildItemOptions(
					createRng(attempt),
					service[station],
					service[station][0].id
				);
				const meanings = options.map((option) => option.english);
				expect(new Set(meanings).size).toBe(meanings.length);
			}
		}
	});

	it('can offer more choices than the old fixed three', () => {
		const service = serviceFor(8);
		expect(buildItemOptions(createRng(8), service.dish, 'yu', 4)).toHaveLength(4);
		expect(buildItemOptions(createRng(8), service.drink, 'cha', 4)).toHaveLength(4);
	});

	it('refuses unknown items and empty option counts', () => {
		const service = serviceFor(1);
		expect(() => buildItemOptions(createRng(1), service.pantry, 'not-a-dish')).toThrow();
		expect(() => buildItemOptions(createRng(1), service.pantry, 'yan', 0)).toThrow();
	});

	it('shrinks to fewer choices when a course is small', () => {
		const service = serviceFor(2);
		expect(buildItemOptions(createRng(2), service.main, 'mifan', 9)).toHaveLength(
			service.main.length
		);
	});
});

describe('Scoring', () => {
	it('grows with the combo and pays a completion bonus', () => {
		expect(itemPoints(1, false)).toBe(100);
		expect(itemPoints(3, false)).toBe(150);
		expect(itemPoints(2, true)).toBe(325);
		expect(itemPoints(20, false)).toBe(250);
	});

	it('decays the speed bonus to zero at the time budget', () => {
		expect(speedBonus(0, ITEM_TIME_MS)).toBe(100);
		expect(speedBonus(ITEM_TIME_MS / 2, ITEM_TIME_MS)).toBe(50);
		expect(speedBonus(ITEM_TIME_MS, ITEM_TIME_MS)).toBe(0);
		expect(speedBonus(ITEM_TIME_MS * 2, ITEM_TIME_MS)).toBe(0);
		expect(speedBonus(10, 0)).toBe(0);
	});
});

describe('Round limits', () => {
	it('gives three lives over a ten item order', () => {
		expect(MAX_LIVES).toBe(3);
		expect(ORDER_SIZE).toBe(10);
		expect(ITEM_TIME_MS).toBeGreaterThan(2000);
		expect(OPTION_COUNT).toBeGreaterThanOrEqual(2);
	});
});

describe('Restaurant XP rewards', () => {
	it('strictly adheres to calculateGameXP', () => {
		expect(calculateGameXP(0, 0, 0)).toBe(0);
		expect(calculateGameXP(4, 100, 4)).toBe(7);
		expect(calculateGameXP(2, 60, 1)).toBe(3);
		expect(calculateGameXP(1, 40, 0)).toBe(1);
	});
});

describe('Shuffled order building', () => {
	it('serves ten unique items without duplicates in one order', () => {
		const order = buildShuffledOrder(createRng(42), serviceFor(42));
		expect(order.requirements).toHaveLength(ORDER_SIZE);
		expect(order.components).toHaveLength(ORDER_SIZE);
		const ids = order.requirements.map((r) => r.componentId);
		expect(new Set(ids).size).toBe(ORDER_SIZE);
	});

	it('covers every station present on the menu', () => {
		const order = buildShuffledOrder(createRng(99), serviceFor(99));
		const stations = new Set(order.requirements.map((r) => r.station));
		for (const station of ORDER_STATIONS) {
			expect(stations.has(station)).toBe(true);
		}
	});

	it('shuffles the questions so they do not follow a fixed repeating cycle', () => {
		// Over 10 different seeds, at least some orders will not start with 'main' or follow strict cyclic order
		let hasNonCyclicStationOrder = false;
		for (let seed = 1; seed <= 15; seed += 1) {
			const order = buildShuffledOrder(createRng(seed), serviceFor(seed));
			const stations = order.requirements.map((r) => r.station);
			// Check if any adjacent stations do not follow the strict ORDER_STATIONS cycle
			for (let i = 1; i < stations.length; i += 1) {
				const prevStation = stations[i - 1];
				const expectedNext =
					ORDER_STATIONS[(ORDER_STATIONS.indexOf(prevStation) + 1) % ORDER_STATIONS.length];
				if (stations[i] !== expectedNext) {
					hasNonCyclicStationOrder = true;
					break;
				}
			}
			if (hasNonCyclicStationOrder) break;
		}
		expect(hasNonCyclicStationOrder).toBe(true);
	});

	it('prioritizes unserved items across consecutive rounds (draw without replacement)', () => {
		const rng = createRng(100);
		const service = serviceFor(100);

		// Round 1
		const round1 = buildShuffledOrder(rng, service, []);
		const round1Ids = round1.requirements.map((r) => r.componentId);
		expect(round1Ids).toHaveLength(ORDER_SIZE);

		// Round 2 receives Round 1's IDs as previousComponentIds
		const round2 = buildShuffledOrder(rng, service, round1Ids);
		const round2Ids = round2.requirements.map((r) => r.componentId);
		expect(round2Ids).toHaveLength(ORDER_SIZE);

		// From 19 total items, 10 served in round 1 leaves 9 fresh items.
		// Round 2 MUST contain all 9 fresh items!
		const combined = new Set([...round1Ids, ...round2Ids]);
		expect(combined.size).toBe(19);

		// Exactly 1 item should overlap between round 1 and round 2 (10 + 10 - 19 = 1)
		const overlap = round1Ids.filter((id) => round2Ids.includes(id));
		expect(overlap).toHaveLength(1);
	});

	it('throws for invalid sizes or empty menu', () => {
		const service = serviceFor(1);
		expect(() => buildShuffledOrder(createRng(1), service, [], 0)).toThrow();
		expect(() => buildShuffledOrder(createRng(1), service, [], -1)).toThrow();
		expect(() =>
			buildShuffledOrder(createRng(1), {
				main: [],
				dish: [],
				produce: [],
				drink: [],
				pantry: []
			})
		).toThrow(/No menu items/);
	});
});
