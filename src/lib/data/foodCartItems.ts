/**
 * Food items configuration for Street Food Cart 3D game.
 * Uses Kenney Food Kit CC0 3D models.
 */

export interface FoodItem {
	id: string;
	hanzi: string;
	pinyin: string;
	english: string;
	modelPath: string;
	scale: number;
	offsetY?: number;
	emoji: string;
	category: 'dimsum' | 'dish' | 'drink' | 'fruit' | 'dessert';
	color: string;
	description: string;
	sizeTier: 'large' | 'compact';
}

export const FOOD_ITEMS: FoodItem[] = [
	{
		id: 'baozi',
		hanzi: '包子',
		pinyin: 'bāozi',
		english: 'Steamed Bun',
		modelPath: '/models/food-cart/steamer.glb',
		scale: 1.05,
		offsetY: 0,
		emoji: '🥟',
		category: 'dimsum',
		color: 'from-amber-400 to-orange-500',
		description: 'Fluffy warm bamboo steamer filled with fresh pork or veg buns',
		sizeTier: 'large'
	},
	{
		id: 'cha',
		hanzi: '茶',
		pinyin: 'chá',
		english: 'Tea',
		modelPath: '/models/food-cart/cup-tea.glb',
		scale: 0.95,
		offsetY: 0,
		emoji: '🍵',
		category: 'drink',
		color: 'from-emerald-400 to-teal-500',
		description: 'Freshly brewed fragrant green jasmine tea in porcelain cup',
		sizeTier: 'large'
	},
	{
		id: 'mifan',
		hanzi: '米饭',
		pinyin: 'mǐfàn',
		english: 'Rice',
		modelPath: '/models/food-cart/rice-ball.glb',
		scale: 1.15,
		offsetY: 0,
		emoji: '🍚',
		category: 'dish',
		color: 'from-slate-200 to-slate-400',
		description: 'Steaming hot bowl of jasmine white rice',
		sizeTier: 'compact'
	},
	{
		id: 'tang',
		hanzi: '汤',
		pinyin: 'tāng',
		english: 'Soup',
		modelPath: '/models/food-cart/bowl-soup.glb',
		scale: 0.95,
		offsetY: 0,
		emoji: '🥣',
		category: 'dish',
		color: 'from-orange-400 to-red-500',
		description: 'Simmering hot savory broth filled with scallions and tofu',
		sizeTier: 'large'
	},
	{
		id: 'yu',
		hanzi: '鱼',
		pinyin: 'yú',
		english: 'Fish',
		modelPath: '/models/food-cart/fish.glb',
		scale: 0.85,
		offsetY: 0.05,
		emoji: '🐟',
		category: 'dish',
		color: 'from-sky-400 to-blue-500',
		description: 'Freshly steamed whole fish seasoned with ginger and soy',
		sizeTier: 'compact'
	},
	{
		id: 'rou',
		hanzi: '肉',
		pinyin: 'ròu',
		english: 'Meat',
		modelPath: '/models/food-cart/meat-cooked.glb',
		scale: 0.9,
		offsetY: 0,
		emoji: '🥩',
		category: 'dish',
		color: 'from-rose-400 to-red-600',
		description: 'Tender braised pork belly steak caramelized in sweet glaze',
		sizeTier: 'large'
	},
	{
		id: 'jidan',
		hanzi: '鸡蛋',
		pinyin: 'jīdàn',
		english: 'Egg',
		modelPath: '/models/food-cart/egg.glb',
		scale: 1.2,
		offsetY: 0,
		emoji: '🥚',
		category: 'dish',
		color: 'from-amber-300 to-yellow-500',
		description: 'Golden hard-boiled tea egg steeped in star anise broth',
		sizeTier: 'compact'
	},
	{
		id: 'pingguo',
		hanzi: '苹果',
		pinyin: 'píngguǒ',
		english: 'Apple',
		modelPath: '/models/food-cart/apple.glb',
		scale: 0.9,
		offsetY: 0,
		emoji: '🍎',
		category: 'fruit',
		color: 'from-red-400 to-rose-600',
		description: 'Crisp sweet red Fuji apple freshly picked from orchard',
		sizeTier: 'compact'
	},
	{
		id: 'xiangjiao',
		hanzi: '香蕉',
		pinyin: 'xiāngjiāo',
		english: 'Banana',
		modelPath: '/models/food-cart/banana.glb',
		scale: 0.85,
		offsetY: 0.05,
		emoji: '🍌',
		category: 'fruit',
		color: 'from-yellow-300 to-amber-400',
		description: 'Sweet ripe yellow banana bursting with potassium',
		sizeTier: 'compact'
	},
	{
		id: 'xigua',
		hanzi: '西瓜',
		pinyin: 'xīguā',
		english: 'Watermelon',
		modelPath: '/models/food-cart/watermelon.glb',
		scale: 0.7,
		offsetY: 0.05,
		emoji: '🍉',
		category: 'fruit',
		color: 'from-emerald-400 to-rose-500',
		description: 'Chilled refreshing slice of sweet summer watermelon',
		sizeTier: 'compact'
	},
	{
		id: 'mianbao',
		hanzi: '面包',
		pinyin: 'miànbāo',
		english: 'Bread',
		modelPath: '/models/food-cart/bread.glb',
		scale: 0.85,
		offsetY: 0,
		emoji: '🍞',
		category: 'dessert',
		color: 'from-amber-200 to-amber-500',
		description: 'Golden baked sweet milk loaf fresh from the oven',
		sizeTier: 'compact'
	},
	{
		id: 'dangao',
		hanzi: '蛋糕',
		pinyin: 'dàngāo',
		english: 'Cake',
		modelPath: '/models/food-cart/cake.glb',
		scale: 0.7,
		offsetY: 0,
		emoji: '🍰',
		category: 'dessert',
		color: 'from-pink-400 to-rose-500',
		description: 'Layered strawberry sponge cake topped with fresh cream',
		sizeTier: 'large'
	},
	{
		id: 'miantiao',
		hanzi: '面条',
		pinyin: 'miàntiáo',
		english: 'Noodles',
		modelPath: '/models/food-cart/chinese.glb',
		scale: 0.65,
		offsetY: 0,
		emoji: '🥡',
		category: 'dish',
		color: 'from-amber-500 to-red-500',
		description: 'Hand-pulled street noodles tossed with scallions and chili oil',
		sizeTier: 'large'
	}
];

export interface CustomerProfile {
	id: string;
	name: string;
	avatar: string;
	avatarImg: string;
	role: string;
	catchphrase: string;
	happySound: string;
	greeting: string;
}

export const CUSTOMER_PROFILES: CustomerProfile[] = [
	{
		id: 'lin',
		name: 'Lin',
		avatar: '👩',
		avatarImg: '/images/food-cart/avatars/female-person.png',
		role: 'Office Worker',
		catchphrase: 'Nothing beats hot street eats on my lunch break!',
		happySound: '太好吃了！ (So delicious!)',
		greeting: 'Ni hao! What smells so good today?'
	},
	{
		id: 'wei',
		name: 'Wei',
		avatar: '👨',
		avatarImg: '/images/food-cart/avatars/male-person.png',
		role: 'Street Foodie',
		catchphrase: 'I followed the aromatic steam across three alleys!',
		happySound: '妙极了！ (Splendid!)',
		greeting: 'Boss, give me your best specialties!'
	},
	{
		id: 'xiaomei',
		name: 'Xiao Mei',
		avatar: '👧',
		avatarImg: '/images/food-cart/avatars/female-adventurer.png',
		role: 'City Explorer',
		catchphrase: 'Save room for something sweet and delicious!',
		happySound: '太棒了！ (Super!)',
		greeting: 'Hello chef! What do you recommend?'
	},
	{
		id: 'chen',
		name: 'Captain Chen',
		avatar: '🧭',
		avatarImg: '/images/food-cart/avatars/male-adventurer.png',
		role: 'Backpacker',
		catchphrase: 'Good nourishment brings wisdom and endurance.',
		happySound: '赞！ (Awesome!)',
		greeting: 'Quick chef, I have a train to catch!'
	},
	{
		id: 'bolt',
		name: 'Bot-88',
		avatar: '🤖',
		avatarImg: '/images/food-cart/avatars/robot.png',
		role: 'Cyber Scout',
		catchphrase: 'Organic nutrition levels critically delicious!',
		happySound: '高能美味！ (High Energy!)',
		greeting: 'BEEP! Scanning street menu items...'
	},
	{
		id: 'zack',
		name: 'Zack',
		avatar: '🧟',
		avatarImg: '/images/food-cart/avatars/zombie.png',
		role: 'Night Crawler',
		catchphrase: 'Must... eat... dumplings...',
		happySound: '好吃...还要！ (Yummy... more!)',
		greeting: 'Braaains... wait no, hot food please!'
	}
];
