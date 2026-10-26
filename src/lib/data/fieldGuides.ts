/**
 * Field Guides Catalog & Interactive Reader Data
 *
 * Distilled from the 15 SayMei Mandarin Beginner Field Guides & Practice Books.
 * Directly links each guide with its corresponding in-app SRS flashcard pack.
 */

export interface FieldGuideVocab {
	hanzi: string;
	pinyin: string;
	english: string;
	context?: string;
}

export interface FieldGuide {
	id: string;
	number: number;
	title: string;
	subtitle: string;
	category: 'conversation' | 'survival' | 'pronunciation' | 'grammar';
	packId: string;
	packTitle: string;
	durationMinutes: number;
	accentGradient: string;
	badgeBg: string;
	badgeText: string;
	summary: string;
	keyVocab: FieldGuideVocab[];
	markdownContent: string;
}

// Eager load all markdown field guides using Vite glob
const RAW_GUIDES = import.meta.glob<string>('./guides/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

function getMarkdown(filename: string): string {
	return RAW_GUIDES[`./guides/${filename}`] || '';
}

export const FIELD_GUIDES: FieldGuide[] = [
	{
		id: '01-meet-people',
		number: 1,
		title: 'Meet People & Introductions',
		subtitle: 'The 5-step collaborative introduction loop & polite topic deflection',
		category: 'conversation',
		packId: 'chinese-24',
		packTitle: 'Pack 24: Self-Introductions & Social Connections',
		durationMinutes: 5,
		accentGradient: 'from-blue-600 via-indigo-600 to-violet-600',
		badgeBg: 'bg-indigo-50 border border-indigo-200/80',
		badgeText: 'text-indigo-700',
		summary:
			'Master two-way introductions. Never deliver a frozen monologue: greet, share one detail, ask the other person, return the topic with 你呢, and close politely.',
		keyVocab: [
			{ hanzi: '来自', pinyin: 'láizì', english: 'to come from', context: '我来自伦敦。' },
			{
				hanzi: '哪国人',
				pinyin: 'nǎ guó rén',
				english: 'which nationality',
				context: '你是哪国人？'
			},
			{
				hanzi: '大学生',
				pinyin: 'dàxuéshēng',
				english: 'university student',
				context: '我是大学生。'
			},
			{ hanzi: '公司', pinyin: 'gōngsī', english: 'company / firm', context: '在一家公司工作。' },
			{
				hanzi: '不太想说',
				pinyin: 'bú tài xiǎng shuō',
				english: 'rather not say',
				context: '这个我不太想说。'
			},
			{
				hanzi: '聊点别的',
				pinyin: 'liáo diǎnr bié de',
				english: 'talk about something else',
				context: '我们聊点别的吧。'
			}
		],
		markdownContent: getMarkdown('01-meet-people.md')
	},
	{
		id: '02-order-food-and-drinks',
		number: 2,
		title: 'Order Food & Drinks',
		subtitle: 'The 4-step ordering frame, measure words, and custom modifications',
		category: 'survival',
		packId: 'chinese-25',
		packTitle: 'Pack 25: Ordering Food & Dining Out',
		durationMinutes: 6,
		accentGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
		badgeBg: 'bg-emerald-50 border border-emerald-200/80',
		badgeText: 'text-emerald-700',
		summary:
			'Order with confidence like a local: call the server, state quantities with measure words (碗, 份, 杯), customize spice and ice, and request the bill.',
		keyVocab: [
			{
				hanzi: '服务员',
				pinyin: 'fúwùyuán',
				english: 'server / waiter',
				context: '服务员，点单！'
			},
			{
				hanzi: '招牌菜',
				pinyin: 'zhāopáicài',
				english: 'signature specialty dish',
				context: '有什么招牌菜？'
			},
			{ hanzi: '微辣', pinyin: 'wēi là', english: 'mildly spicy', context: '请做微辣。' },
			{ hanzi: '少冰', pinyin: 'shǎo bīng', english: 'less ice', context: '一杯奶茶，少冰。' },
			{
				hanzi: '打包',
				pinyin: 'dǎbāo',
				english: 'takeout / doggy bag',
				context: '吃不完，请打包。'
			},
			{ hanzi: '买单', pinyin: 'mǎidān', english: 'pay the bill', context: '服务员，买单！' }
		],
		markdownContent: getMarkdown('02-order-food-and-drinks.md')
	},
	{
		id: '03-clothes-shopping',
		number: 3,
		title: 'Shop for Clothes & Sizing',
		subtitle: 'Garments, trying on, sizing charts (S/M/L/XL), and checkout',
		category: 'survival',
		packId: 'chinese-26',
		packTitle: 'Pack 26: Sizing & Clothes Shopping',
		durationMinutes: 5,
		accentGradient: 'from-rose-500 via-pink-600 to-purple-600',
		badgeBg: 'bg-rose-50 border border-rose-200/80',
		badgeText: 'text-rose-700',
		summary:
			'Navigate clothing stores effortlessly: ask for fitting rooms, request different sizes and colors, check discounts, and handle receipts.',
		keyVocab: [
			{
				hanzi: '试衣间',
				pinyin: 'shìyījiān',
				english: 'fitting room',
				context: '请问试衣间在哪里？'
			},
			{
				hanzi: '大一号',
				pinyin: 'dà yí hào',
				english: 'one size bigger',
				context: '有大一号的吗？'
			},
			{
				hanzi: '小一号',
				pinyin: 'xiǎo yí hào',
				english: 'one size smaller',
				context: '这件有点大，有小一号的吗？'
			},
			{
				hanzi: '合适',
				pinyin: 'héshì',
				english: 'suitable / fits well',
				context: '这件衣服很合适。'
			},
			{ hanzi: '打折', pinyin: 'dǎzhé', english: 'give discount', context: '今天打折吗？' },
			{
				hanzi: '小票',
				pinyin: 'xiǎopiào',
				english: 'receipt / sales slip',
				context: '请给我小票。'
			}
		],
		markdownContent: getMarkdown('03-clothes-shopping.md')
	},
	{
		id: '04-conversation-particles',
		number: 4,
		title: 'Conversation Particles',
		subtitle: 'The 5 core spoken particles (吧, 呢, 吗, 了, 啊) & emotional nuances',
		category: 'grammar',
		packId: 'chinese-27',
		packTitle: 'Pack 27: Spoken Conversational Particles',
		durationMinutes: 5,
		accentGradient: 'from-amber-500 via-orange-600 to-red-500',
		badgeBg: 'bg-amber-50 border border-amber-200/80',
		badgeText: 'text-amber-700',
		summary:
			'Particles give spoken Mandarin warmth and natural rhythm. Master the nuance differences between suggestions (吧), bounce-backs (呢), questions (吗), change of state (了), and exclamations (啊).',
		keyVocab: [
			{
				hanzi: '走吧',
				pinyin: 'zǒu ba',
				english: "let's go (suggestion)",
				context: '时间不早了，走吧。'
			},
			{
				hanzi: '好啊',
				pinyin: 'hǎo a',
				english: 'great / sure! (enthusiasm)',
				context: '太好了，好啊！'
			},
			{
				hanzi: '下雨了',
				pinyin: 'xiàyǔ le',
				english: 'it started raining (change of state)',
				context: '外面下雨了。'
			},
			{
				hanzi: '你呢',
				pinyin: 'nǐ ne',
				english: 'what about you? (bounce back)',
				context: '我很好，你呢？'
			}
		],
		markdownContent: getMarkdown('04-conversation-particles.md')
	},
	{
		id: '05-conversation-rescue-cards',
		number: 5,
		title: 'Conversation Rescue & Repair',
		subtitle: 'The 3-move rescue loop (Signal, Ask, Confirm) to recover gracefully',
		category: 'conversation',
		packId: 'chinese-28',
		packTitle: 'Pack 28: Conversation Rescue & Repair Loops',
		durationMinutes: 4,
		accentGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
		badgeBg: 'bg-cyan-50 border border-cyan-200/80',
		badgeText: 'text-cyan-700',
		summary:
			'Never freeze in conversation. Deploy the 3-step repair loop: signal comprehension difficulty, request specific adjustments (slow down, repeat, write), and confirm mutual understanding.',
		keyVocab: [
			{
				hanzi: '慢一点',
				pinyin: 'màn yìdiǎnr',
				english: 'a little slower',
				context: '请说慢一点。'
			},
			{
				hanzi: '再说一遍',
				pinyin: 'zài shuō yí biàn',
				english: 'say it once again',
				context: '麻烦再说一遍。'
			},
			{
				hanzi: '什么意思',
				pinyin: 'shénme yìsi',
				english: 'what does it mean',
				context: '这句话是什么意思？'
			},
			{
				hanzi: '写下来',
				pinyin: 'xiě xiàlái',
				english: 'write it down',
				context: '您可以帮我写下来吗？'
			},
			{
				hanzi: '懂了',
				pinyin: 'dǒng le',
				english: 'understood / got it',
				context: '我懂了，谢谢！'
			}
		],
		markdownContent: getMarkdown('05-conversation-rescue-cards.md')
	},
	{
		id: '06-numbers-prices-dates-time',
		number: 6,
		title: 'Numbers, Prices & Practical Math',
		subtitle: 'Place-value 零, currency (块/毛), mobile pay, and discount math (打折)',
		category: 'survival',
		packId: 'chinese-29',
		packTitle: 'Pack 29: Numbers, Prices & Practical Math',
		durationMinutes: 5,
		accentGradient: 'from-teal-600 via-emerald-600 to-green-600',
		badgeBg: 'bg-teal-50 border border-teal-200/80',
		badgeText: 'text-teal-700',
		summary:
			'Tackle real-world numbers without hesitation: master the single zero rule for 105 vs 1005, spoken currency (块/毛), QR code mobile payment, and discount calculation.',
		keyVocab: [
			{
				hanzi: '一百零五',
				pinyin: 'yì bǎi líng wǔ',
				english: '105 (one zero rule)',
				context: '一共一百零五块。'
			},
			{
				hanzi: '五块钱',
				pinyin: 'wǔ kuài qián',
				english: '5 yuan (spoken)',
				context: '只要五块钱。'
			},
			{ hanzi: '扫码', pinyin: 'sǎomǎ', english: 'scan QR code', context: '请扫码付款。' },
			{
				hanzi: '打八折',
				pinyin: 'dǎ bā zhé',
				english: '20% off (pay 80%)',
				context: '全场打八折。'
			},
			{ hanzi: '半价', pinyin: 'bànjià', english: 'half price', context: '第二杯半价。' }
		],
		markdownContent: getMarkdown('06-numbers-prices-dates-time.md')
	},
	{
		id: '07-relative-time-and-plans',
		number: 7,
		title: 'Relative Time & Weekly Planning',
		subtitle: 'Today/tomorrow, this/next week, scheduling appointments, and time placement',
		category: 'grammar',
		packId: 'chinese-30',
		packTitle: 'Pack 30: Relative Time & Weekly Planning',
		durationMinutes: 5,
		accentGradient: 'from-purple-600 via-violet-600 to-indigo-600',
		badgeBg: 'bg-purple-50 border border-purple-200/80',
		badgeText: 'text-purple-700',
		summary:
			'Master Mandarin temporal logic: place time expressions BEFORE the verb, navigate past/future days (前天, 昨天, 今天, 明天, 后天), and arrange meetings effortlessly.',
		keyVocab: [
			{ hanzi: '今天', pinyin: 'jīntiān', english: 'today', context: '今天天气真好。' },
			{ hanzi: '明天', pinyin: 'míngtiān', english: 'tomorrow', context: '明天下午见。' },
			{
				hanzi: '下个星期',
				pinyin: 'xià ge xīngqī',
				english: 'next week',
				context: '下个星期一有空吗？'
			},
			{
				hanzi: '什么时候',
				pinyin: 'shénme shíhou',
				english: 'what time / when',
				context: '你什么时候出发？'
			},
			{ hanzi: '见面', pinyin: 'jiànmiàn', english: 'meet up', context: '我们在门口见面。' }
		],
		markdownContent: getMarkdown('07-relative-time-and-plans.md')
	},
	{
		id: '08-mandarin-at-home',
		number: 8,
		title: 'Everyday Home & Living Spaces',
		subtitle: 'Floor plan rooms, daily sequence verbs, household chores, and appliances',
		category: 'survival',
		packId: 'chinese-31',
		packTitle: 'Pack 31: Everyday Home & Living Spaces',
		durationMinutes: 4,
		accentGradient: 'from-amber-600 via-orange-600 to-yellow-600',
		badgeBg: 'bg-amber-50 border border-amber-200/80',
		badgeText: 'text-amber-700',
		summary:
			'Navigate daily domestic life: rooms (客厅, 卧室, 厨房, 卫生间), morning and evening routines, and practical chores.',
		keyVocab: [
			{ hanzi: '客厅', pinyin: 'kètīng', english: 'living room', context: '在客厅看电视。' },
			{ hanzi: '卧室', pinyin: 'wòshì', english: 'bedroom', context: '在卧室休息。' },
			{ hanzi: '厨房', pinyin: 'chúfáng', english: 'kitchen', context: '厨房里有冰箱。' },
			{ hanzi: '起床', pinyin: 'qǐchuáng', english: 'get out of bed', context: '早上七点起床。' },
			{
				hanzi: '关灯',
				pinyin: 'guān dēng',
				english: 'turn off lights',
				context: '出门前记得关灯。'
			}
		],
		markdownContent: getMarkdown('08-mandarin-at-home.md')
	},
	{
		id: '09-polite-phrases-reactions',
		number: 9,
		title: 'Polite Courtesies & Reactions',
		subtitle: 'Apology tiers (对不起 vs 不好意思), table etiquette, and instant reactions',
		category: 'conversation',
		packId: 'chinese-32',
		packTitle: 'Pack 32: Polite Courtesies & Reactions',
		durationMinutes: 4,
		accentGradient: 'from-blue-500 via-indigo-600 to-cyan-600',
		badgeBg: 'bg-blue-50 border border-blue-200/80',
		badgeText: 'text-blue-700',
		summary:
			'Speak with polite cultural intelligence: choose between severe apologies (对不起) vs everyday excuses (不好意思), and react spontaneously like a native speaker.',
		keyVocab: [
			{
				hanzi: '不好意思',
				pinyin: 'bù hǎoyìsi',
				english: 'excuse me / mild apology',
				context: '不好意思，借过一下。'
			},
			{
				hanzi: '麻烦你',
				pinyin: 'máfan nǐ',
				english: 'sorry to trouble you',
				context: '麻烦你帮我看一下。'
			},
			{
				hanzi: '真棒',
				pinyin: 'zhēn bàng',
				english: 'awesome / great job',
				context: '你中文说得真棒！'
			},
			{
				hanzi: '没事',
				pinyin: 'méi shì',
				english: 'no problem / it is fine',
				context: '没事，别担心。'
			}
		],
		markdownContent: getMarkdown('09-polite-phrases-reactions.md')
	},
	{
		id: '10-travel-refresher',
		number: 10,
		title: '7-Day Travel Survival Refresher',
		subtitle: 'Taxi navigation, hotel check-in, wayfinding, high-speed rail, and transit',
		category: 'survival',
		packId: 'chinese-33',
		packTitle: 'Pack 33: 7-Day Travel Survival Refresher',
		durationMinutes: 5,
		accentGradient: 'from-sky-600 via-blue-600 to-indigo-600',
		badgeBg: 'bg-sky-50 border border-sky-200/80',
		badgeText: 'text-sky-700',
		summary:
			'Essential travel phrases for smooth trips: instruct taxi drivers, check into hotels with booking numbers, navigate stations, and handle unexpected detours.',
		keyVocab: [
			{
				hanzi: '靠边停车',
				pinyin: 'kàobiān tíngchē',
				english: 'pull over on the side',
				context: '前面路口靠边停车。'
			},
			{
				hanzi: '办理入住',
				pinyin: 'bànlǐ rùzhù',
				english: 'check in (hotel)',
				context: '我预订了房间，办理入住。'
			},
			{
				hanzi: '高铁站',
				pinyin: 'gāotiězhàn',
				english: 'high-speed rail station',
				context: '去高铁站需要多久？'
			},
			{ hanzi: '洗手间', pinyin: 'xǐshǒujiān', english: 'restroom', context: '请问洗手间在哪里？' }
		],
		markdownContent: getMarkdown('10-travel-refresher.md')
	},
	{
		id: '11-tone-pairs-lab',
		number: 11,
		title: 'Tone Pairs Lab (16 Pitches)',
		subtitle: 'Master all 16 two-syllable pitch combinations (1-1 to 4-4) & pitch contours',
		category: 'pronunciation',
		packId: 'chinese-34',
		packTitle: 'Pack 34: Tone Pairs & Real-World Sandhi',
		durationMinutes: 6,
		accentGradient: 'from-fuchsia-600 via-purple-600 to-pink-600',
		badgeBg: 'bg-fuchsia-50 border border-fuchsia-200/80',
		badgeText: 'text-fuchsia-700',
		summary:
			'Mandarin is spoken in chunks, not isolated syllables. Practice all 16 two-syllable pitch contours (Chao 5-point scale) to achieve natural spoken prosody.',
		keyVocab: [
			{ hanzi: '飞机', pinyin: 'fēijī', english: 'airplane (Tone 1-1)', context: '坐飞机去上海。' },
			{ hanzi: '苹果', pinyin: 'píngguǒ', english: 'apple (Tone 2-3)', context: '吃一个红苹果。' },
			{ hanzi: '面包', pinyin: 'miànbāo', english: 'bread (Tone 4-1)', context: '新鲜烤的面包。' },
			{ hanzi: '现在', pinyin: 'xiànzài', english: 'now (Tone 4-4)', context: '我们现在出发。' }
		],
		markdownContent: getMarkdown('11-tone-pairs-lab.md')
	},
	{
		id: '12-tone-sandhi-rules',
		number: 12,
		title: 'Real-World Tone Sandhi Rules',
		subtitle: '3rd tone sandhi (3+3 -> 2+3), dynamic shifts for 一 (yī/yí/yì) and 不 (bù/bú)',
		category: 'pronunciation',
		packId: 'chinese-34',
		packTitle: 'Pack 34: Tone Pairs & Real-World Sandhi',
		durationMinutes: 5,
		accentGradient: 'from-indigo-600 via-blue-600 to-violet-600',
		badgeBg: 'bg-indigo-50 border border-indigo-200/80',
		badgeText: 'text-indigo-700',
		summary:
			'Unlock fluid native pronunciation: understand why 你好 sounds like ní hǎo, why 不是 shifts to bú shì, and how 一 dynamically adapts to its following syllable.',
		keyVocab: [
			{
				hanzi: '你好',
				pinyin: 'nǐ hǎo (realized: ní hǎo)',
				english: 'hello (3+3 -> 2+3)',
				context: '你好，很高兴认识你。'
			},
			{
				hanzi: '不是',
				pinyin: 'bú shì',
				english: 'is not (不 before 4th tone)',
				context: '这不是我的。'
			},
			{
				hanzi: '一样',
				pinyin: 'yí yàng',
				english: 'same (一 before 4th tone)',
				context: '质量完全一样。'
			},
			{
				hanzi: '一起',
				pinyin: 'yìqǐ',
				english: 'together (一 before 3rd tone)',
				context: '大家一起去。'
			}
		],
		markdownContent: getMarkdown('12-tone-sandhi-rules.md')
	},
	{
		id: '13-typing-and-spelling-guide',
		number: 13,
		title: 'Pinyin Typing & IME Mechanics',
		subtitle: 'Whole-word typing, candidate navigation, ü typing (v key), and apostrophes',
		category: 'pronunciation',
		packId: 'chinese-35',
		packTitle: 'Pack 35: Typing, Spelling & Real-World IME',
		durationMinutes: 4,
		accentGradient: 'from-emerald-600 via-cyan-600 to-blue-600',
		badgeBg: 'bg-cyan-50 border border-cyan-200/80',
		badgeText: 'text-cyan-700',
		summary:
			'Type Chinese like a native: type whole words instead of single characters, type "v" for "ü" (lv -> 绿), and use apostrophes to separate ambiguous syllable boundaries (xi\'an vs xian).',
		keyVocab: [
			{
				hanzi: '绿茶',
				pinyin: 'lǜchá (type: lvcha)',
				english: 'green tea',
				context: '我要一杯冰绿茶。'
			},
			{
				hanzi: '西安',
				pinyin: "Xī'ān (type: xi'an)",
				english: 'Xi’an city',
				context: '西安是一座历史名城。'
			},
			{
				hanzi: '输入法',
				pinyin: 'shūrùfǎ',
				english: 'input method / IME',
				context: '使用拼音输入法。'
			},
			{ hanzi: '拼音', pinyin: 'pīnyīn', english: 'Pinyin', context: '用拼音打字很快。' }
		],
		markdownContent: getMarkdown('13-typing-and-spelling-guide.md')
	}
];

export function getFieldGuideById(id: string): FieldGuide | undefined {
	const normalized = id.trim().toLowerCase();
	return FIELD_GUIDES.find(
		(g) =>
			g.id === normalized ||
			g.id.replace(/-/g, '') === normalized.replace(/-/g, '') ||
			(normalized.startsWith('02-order-food') && g.id === '02-order-food-and-drinks') ||
			(normalized.startsWith('05-conversation-rescue') && g.id === '05-conversation-rescue-cards')
	);
}

export function getFieldGuidesByCategory(category: string): FieldGuide[] {
	if (category === 'all') return FIELD_GUIDES;
	return FIELD_GUIDES.filter((g) => g.category === category);
}

export function searchFieldGuides(query: string, category: string = 'all'): FieldGuide[] {
	const trimmed = query.trim().toLowerCase();
	const list = getFieldGuidesByCategory(category);
	if (!trimmed) return list;

	return list.filter((g) => {
		return (
			g.title.toLowerCase().includes(trimmed) ||
			g.subtitle.toLowerCase().includes(trimmed) ||
			g.summary.toLowerCase().includes(trimmed) ||
			g.packTitle.toLowerCase().includes(trimmed) ||
			g.keyVocab.some(
				(v) =>
					v.hanzi.includes(trimmed) ||
					v.pinyin.toLowerCase().includes(trimmed) ||
					v.english.toLowerCase().includes(trimmed)
			)
		);
	});
}
