/**
 * Restaurant game configuration.
 *
 * Every dish component is a real vocabulary entry resolved from the bundled
 * Chinese packs in `data/chinese/*.json` — no hardcoded pinyin or glosses.
 * Artwork is baked from the CC0 Kenney Food Kit / Furniture Kit GLB models
 * into `static/images/restaurant/sprites` (see `scripts/bake-sprites.mjs`).
 */
import type { WordRecord } from '$lib/types';

/** Courses an order cycles through. */
export type StationId = 'main' | 'dish' | 'produce' | 'drink' | 'pantry';

/** English label for each course, shown as the distractor group name. */
export const STATION_LABELS: Record<StationId, string> = {
	main: 'Main course',
	dish: 'Dish',
	produce: 'Produce',
	drink: 'Drink',
	pantry: 'Pantry'
};

/** A menu entry straight from the vocabulary packs, with every sprite that fits it. */
export interface DishComponent {
	id: string;
	station: StationId;
	hanzi: string;
	pinyin: string;
	english: string;
	/** Baked sprites illustrating this word; one is picked per round for variety. */
	sprites: string[];
}

/** A DishComponent with the sprite chosen for the current round. */
export interface MenuItem extends DishComponent {
	sprite: string;
}

export interface RestaurantMenu {
	ok: true;
	components: DishComponent[];
	byStation: Record<StationId, DishComponent[]>;
}

export interface RestaurantMenuFailure {
	ok: false;
	error: string;
	missingHanzi: string[];
}

const packModules = import.meta.glob<{ words?: WordRecord[] }>('./chinese/*.json', {
	eager: true,
	import: 'default'
});

/**
 * Component seeds: vocabulary lookup key plus every baked sprite that honestly
 * illustrates it. A word with no matching art is simply not served — nothing is
 * invented to fill a gap.
 */
const COMPONENT_SEEDS: ReadonlyArray<{
	id: string;
	station: StationId;
	hanzi: string;
	sprites: readonly string[];
}> = [
	{ id: 'mifan', station: 'main', hanzi: '米饭', sprites: ['bowl', 'rice-ball'] },
	{ id: 'miantiao', station: 'main', hanzi: '面条', sprites: ['chinese'] },
	{ id: 'baozi', station: 'main', hanzi: '包子', sprites: ['steamer', 'dim-sum'] },
	{
		id: 'rou',
		station: 'dish',
		hanzi: '肉',
		sprites: ['meat-cooked', 'meat-ribs', 'bacon', 'sausage', 'whole-ham']
	},
	{ id: 'niurou', station: 'dish', hanzi: '牛肉', sprites: ['burger', 'meat-patty'] },
	{ id: 'jirou', station: 'dish', hanzi: '鸡肉', sprites: ['turkey'] },
	{ id: 'yu', station: 'dish', hanzi: '鱼', sprites: ['fish'] },
	{ id: 'jidan', station: 'dish', hanzi: '鸡蛋', sprites: ['egg-cooked', 'egg', 'egg-half'] },
	{ id: 'tang', station: 'dish', hanzi: '汤', sprites: ['bowl-soup', 'bowl-broth', 'pot-stew'] },
	{
		id: 'cai',
		station: 'produce',
		hanzi: '菜',
		sprites: [
			'broccoli',
			'cabbage',
			'carrot',
			'corn',
			'cauliflower',
			'eggplant',
			'leek',
			'mushroom',
			'onion',
			'pepper',
			'tomato',
			'salad'
		]
	},
	{
		id: 'shuiguo',
		station: 'produce',
		hanzi: '水果',
		sprites: [
			'grapes',
			'watermelon',
			'orange',
			'strawberry',
			'banana',
			'pear',
			'cherries',
			'pineapple'
		]
	},
	{ id: 'pingguo', station: 'produce', hanzi: '苹果', sprites: ['apple', 'apple-half'] },
	{ id: 'cha', station: 'drink', hanzi: '茶', sprites: ['cup-tea'] },
	{ id: 'kafei', station: 'drink', hanzi: '咖啡', sprites: ['cup-coffee'] },
	{ id: 'niunai', station: 'drink', hanzi: '牛奶', sprites: ['mug', 'carton', 'carton-small'] },
	{ id: 'shui', station: 'drink', hanzi: '水', sprites: ['glass', 'soda-glass'] },
	{ id: 'yan', station: 'pantry', hanzi: '盐', sprites: ['shaker-salt'] },
	{
		id: 'sugar',
		station: 'pantry',
		hanzi: '糖',
		sprites: ['candy-bar', 'lollypop', 'chocolate', 'popsicle']
	},
	{ id: 'jiangyou', station: 'pantry', hanzi: '酱油', sprites: ['soy'] }
];

function buildVocabularyIndex(): Map<string, WordRecord> {
	const index = new Map<string, WordRecord>();
	const packs = Object.entries(packModules).sort(([a], [b]) => {
		const packNumber = (path: string) => Number(path.split('/').pop()?.replace('.json', '') ?? 0);
		return packNumber(a) - packNumber(b);
	});

	for (const [, pack] of packs) {
		for (const word of pack?.words ?? []) {
			const hanzi = word['Chinese Word'];
			if (!hanzi || index.has(hanzi)) continue;
			if (!word.Pinyin || !word['English Meaning']) continue;
			index.set(hanzi, word);
		}
	}
	return index;
}

/**
 * Resolves every component against the bundled vocabulary packs.
 * Missing vocabulary is reported instead of being replaced with placeholder data.
 */
export function buildRestaurantMenu(): RestaurantMenu | RestaurantMenuFailure {
	const vocabulary = buildVocabularyIndex();
	const missingHanzi: string[] = [];
	const components: DishComponent[] = [];

	for (const seed of COMPONENT_SEEDS) {
		const word = vocabulary.get(seed.hanzi);
		if (!word) {
			missingHanzi.push(seed.hanzi);
			continue;
		}
		components.push({
			id: seed.id,
			station: seed.station,
			hanzi: seed.hanzi,
			pinyin: word.Pinyin ?? '',
			english: word['English Meaning'],
			sprites: seed.sprites.map((sprite) => `/images/restaurant/sprites/food/${sprite}.png`)
		});
	}

	if (missingHanzi.length > 0) {
		return {
			ok: false,
			missingHanzi,
			error: `Vocabulary packs are missing required words: ${missingHanzi.join(', ')}`
		};
	}

	const byStation: Record<StationId, DishComponent[]> = {
		main: [],
		dish: [],
		produce: [],
		drink: [],
		pantry: []
	};
	for (const component of components) {
		byStation[component.station].push(component);
	}

	return { ok: true, components, byStation };
}

export interface DinerProfile {
	id: string;
	name: string;
	avatar: string;
	avatarImg: string;
	role: string;
	greeting: string;
	happySound: string;
}

export const DINER_PROFILES: DinerProfile[] = [
	{
		id: 'lin',
		name: 'Lin',
		avatar: '👩',
		avatarImg: '/images/restaurant/avatars/female-person.png',
		role: 'Office Worker',
		greeting: 'Ni hao! What is cooking today?',
		happySound: '太好吃了！ (So delicious!)'
	},
	{
		id: 'wei',
		name: 'Wei',
		avatar: '👨',
		avatarImg: '/images/restaurant/avatars/male-person.png',
		role: 'Foodie',
		greeting: 'Order for one, whatever you recommend!',
		happySound: '妙极了！ (Splendid!)'
	},
	{
		id: 'xiaomei',
		name: 'Xiao Mei',
		avatar: '👧',
		avatarImg: '/images/restaurant/avatars/female-adventurer.png',
		role: 'City Explorer',
		greeting: 'Something warm please, it is a cold day!',
		happySound: '太棒了！ (Super!)'
	},
	{
		id: 'chen',
		name: 'Captain Chen',
		avatar: '🧭',
		avatarImg: '/images/restaurant/avatars/male-adventurer.png',
		role: 'Backpacker',
		greeting: 'Quick chef, I have a train to catch!',
		happySound: '赞！ (Awesome!)'
	},
	{
		id: 'bolt',
		name: 'Bot-88',
		avatar: '🤖',
		avatarImg: '/images/restaurant/avatars/robot.png',
		role: 'Cyber Scout',
		greeting: 'BEEP! Scanning menu for optimal nutrition!',
		happySound: '高能美味！ (High Energy!)'
	}
];
