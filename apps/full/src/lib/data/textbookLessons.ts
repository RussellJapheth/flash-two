import type { TextbookLesson } from '$lib/types';

export const TEXTBOOK_LESSONS: TextbookLesson[] = [
	{
		id: '01-meet-people',
		guideId: '01-meet-people',
		title: 'Meet People & Introductions',
		subtitle: 'The 5-step collaborative introduction loop',
		unitBadge: 'Unit 1 · First Connections',
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				"Hi! I'm Xiao Ming. In this lesson, we learn how to greet new friends, share where we're from, and keep the conversation flowing smoothly!"
		},
		scene: {
			setting: 'Campus Bench at Peking University',
			dialogue: [
				{
					speaker: 'Xiao Ming',
					avatarEmoji: '👦',
					hanzi: '你好！你是哪国人？',
					pinyin: 'Nǐ hǎo! Nǐ shì nǎ guó rén?',
					english: 'Hello! What nationality are you?',
					audioText: '你好！你是哪国人？'
				},
				{
					speaker: 'David',
					avatarEmoji: '👱',
					hanzi: '你好！我是英国人，来自伦敦。你呢？',
					pinyin: 'Nǐ hǎo! Wǒ shì yīngguó rén, láizì Lúndūn. Nǐ ne?',
					english: 'Hello! I am British, from London. And you?',
					audioText: '你好！我是英国人，来自伦敦。你呢？'
				},
				{
					speaker: 'Xiao Ming',
					avatarEmoji: '👦',
					hanzi: '我是中国人，也是这里的大学生！',
					pinyin: 'Wǒ shì zhōngguó rén, yě shì zhèlǐ de dàxuéshēng!',
					english: 'I am Chinese, and also a college student here!',
					audioText: '我是中国人，也是这里的大学生！'
				},
				{
					speaker: 'David',
					avatarEmoji: '👱',
					hanzi: '很高兴认识你！',
					pinyin: 'Hěn gāoxìng rènshi nǐ!',
					english: 'Nice to meet you!',
					audioText: '很高兴认识你！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '来自',
				pinyin: 'láizì',
				english: 'to come from',
				mnemonic: 'Picture coming (来) self-directed (自) across borders.',
				toneNumber: 2
			},
			{
				hanzi: '哪国人',
				pinyin: 'nǎ guó rén',
				english: 'which nationality',
				mnemonic: 'Which (哪) + Country (国) + Person (人) = What country are you from?',
				toneNumber: 3
			},
			{
				hanzi: '大学生',
				pinyin: 'dàxuéshēng',
				english: 'university student',
				mnemonic: 'Big (大) Study (学) Life/Student (生).',
				toneNumber: 4
			},
			{
				hanzi: '公司',
				pinyin: 'gōngsī',
				english: 'company / firm',
				mnemonic: 'Public (公) Division (司) working together.',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'The Origin & Identity Formula',
			formula: '[Subject] + 是 (shì) + [Nationality] / 来自 (láizì) + [City]',
			slots: [
				{ label: 'Subject', example: '我', pinyin: 'wǒ' },
				{ label: 'Verb', example: '来自', pinyin: 'láizì' },
				{ label: 'City', example: '伦敦', pinyin: 'Lúndūn' }
			],
			notes: 'Never monologue alone! Always bounce the question back with 你呢 (nǐ ne - and you?).'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match the Hanzi word with the matching picture icon:',
				pictureMatch: {
					pairs: [
						{ hanzi: '大学生', pinyin: 'dàxuéshēng', english: 'Student', imageEmoji: '🎓' },
						{ hanzi: '公司', pinyin: 'gōngsī', english: 'Company', imageEmoji: '🏢' },
						{ hanzi: '来自', pinyin: 'láizì', english: 'Come from', imageEmoji: '✈️' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "I come from London."',
				wordReorder: {
					sentenceHanzi: '我 来自 伦敦',
					sentencePinyin: 'Wǒ láizì Lúndūn',
					sentenceEnglish: 'I come from London.',
					shuffledWords: ['伦敦', '我', '来自'],
					wordPinyinMap: {
						我: 'wǒ',
						来自: 'láizì',
						伦敦: 'Lúndūn'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '02-order-food-and-drinks',
		guideId: '02-order-food-and-drinks',
		title: 'Order Food & Drinks',
		subtitle: 'The 4-step ordering frame & custom toppings',
		unitBadge: 'Unit 2 · Street Eats',
		characterHost: {
			name: 'Chef Lao Wang (老王)',
			avatarEmoji: '👨‍🍳',
			intro:
				"Welcome to my noodle kitchen! Ordering food in China is quick, lively, and delicious. Let's learn how to order like a local!"
		},
		scene: {
			setting: 'Lively Noodle Counter in Shanghai',
			dialogue: [
				{
					speaker: 'Chef',
					avatarEmoji: '👨‍🍳',
					hanzi: '你好！几位？想吃点什么？',
					pinyin: 'Nǐ hǎo! Jǐ wèi? Xiǎng chī diǎn shénme?',
					english: 'Hello! How many people? What would you like to eat?',
					audioText: '你好！几位？想吃点什么？'
				},
				{
					speaker: 'Customer',
					avatarEmoji: '🎒',
					hanzi: '你好！我要一碗牛肉面，不要香菜。',
					pinyin: 'Nǐ hǎo! Wǒ yào yī wǎn niúròumiàn, bú yào xiāngcài.',
					english: 'Hello! I want a bowl of beef noodles, no cilantro.',
					audioText: '你好！我要一碗牛肉面，不要香菜。'
				},
				{
					speaker: 'Chef',
					avatarEmoji: '👨‍🍳',
					hanzi: '好的！要不要加一个煎蛋？',
					pinyin: 'Hǎo de! Yào bu yào jiā yí gè jiāndàn?',
					english: 'Alright! Do you want to add a fried egg?',
					audioText: '好的！要不要加一个煎蛋？'
				},
				{
					speaker: 'Customer',
					avatarEmoji: '🎒',
					hanzi: '要一个煎蛋，微辣，谢谢！',
					pinyin: 'Yào yí gè jiāndàn, wēilà, xièxie!',
					english: 'Yes one fried egg, mildly spicy, thank you!',
					audioText: '要一个煎蛋，微辣，谢谢！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '一碗',
				pinyin: 'yī wǎn',
				english: 'one bowl of',
				mnemonic: 'The measure word for noodles, soup, or rice served in a bowl.',
				toneNumber: 3
			},
			{
				hanzi: '牛肉面',
				pinyin: 'niúròu miàn',
				english: 'beef noodles',
				mnemonic: 'Cow (牛) + Meat (肉) + Noodles (面).',
				toneNumber: 2
			},
			{
				hanzi: '不要香菜',
				pinyin: 'bú yào xiāngcài',
				english: 'no cilantro / coriander',
				mnemonic: 'Fragrant (香) herb (菜) with negative command (不要).',
				toneNumber: 4
			},
			{
				hanzi: '买单',
				pinyin: 'mǎidān',
				english: 'pay the bill',
				mnemonic: 'Buy (买) + Bill/Receipt (单).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'The Ordering Frame',
			formula: '我要 (Wǒ yào) + [Number + Measure Word] + [Dish] + [Preference]',
			slots: [
				{ label: 'Demand', example: '我要', pinyin: 'wǒ yào' },
				{ label: 'Amount', example: '一碗', pinyin: 'yī wǎn' },
				{ label: 'Dish', example: '牛肉面', pinyin: 'niúròumiàn' },
				{ label: 'Adjustment', example: '不要香菜', pinyin: 'bú yào xiāngcài' }
			],
			notes: 'Use 要 (yào) for clear intent. Always prepend 不要 (bú yào) to exclude ingredients.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match food items with their picture:',
				pictureMatch: {
					pairs: [
						{ hanzi: '牛肉面', pinyin: 'niúròumiàn', english: 'Beef noodles', imageEmoji: '🍜' },
						{ hanzi: '买单', pinyin: 'mǎidān', english: 'Pay bill', imageEmoji: '🧾' },
						{ hanzi: '香菜', pinyin: 'xiāngcài', english: 'Cilantro', imageEmoji: '🌿' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "I want a bowl of beef noodles."',
				wordReorder: {
					sentenceHanzi: '我要 一碗 牛肉面',
					sentencePinyin: 'Wǒ yào yī wǎn niúròumiàn',
					sentenceEnglish: 'I want a bowl of beef noodles.',
					shuffledWords: ['牛肉面', '我要', '一碗'],
					wordPinyinMap: {
						我要: 'wǒ yào',
						一碗: 'yī wǎn',
						牛肉面: 'niúròumiàn'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '03-clothes-shopping',
		guideId: '03-clothes-shopping',
		title: 'Clothes Shopping & Sizing',
		subtitle: 'Asking sizes, colors, trial rooms, and polite discount asks',
		unitBadge: 'Unit 3 · Market & Mall',
		characterHost: {
			name: 'Lin Lin (琳琳)',
			avatarEmoji: '🛍️',
			intro:
				"Shopping for clothes is super fun in night markets and boutiques! Let's learn how to try on clothes and ask for your fit."
		},
		scene: {
			setting: 'Clothing Boutique in Chengdu',
			dialogue: [
				{
					speaker: 'Customer',
					avatarEmoji: '🛍️',
					hanzi: '请问这件衣服可以试一下吗？',
					pinyin: 'Qǐngwèn zhè jiàn yīfu kěyǐ shì yíxià ma?',
					english: 'Excuse me, may I try on this piece of clothing?',
					audioText: '请问这件衣服可以试一下吗？'
				},
				{
					speaker: 'Clerk',
					avatarEmoji: '💁‍♀️',
					hanzi: '当然可以！试衣间在里面。',
					pinyin: 'Dāngrán kěyǐ! Shìyījiān zài lǐmiàn.',
					english: 'Of course! The fitting room is inside.',
					audioText: '当然可以！试衣间在里面。'
				},
				{
					speaker: 'Customer',
					avatarEmoji: '🛍️',
					hanzi: '这件有点小，有没有大一号的？',
					pinyin: 'Zhè jiàn yǒudiǎnr xiǎo, yǒu méiyǒu dà yí hào de?',
					english: 'This is a bit small, do you have one size larger?',
					audioText: '这件有点小，有没有大一号的？'
				},
				{
					speaker: 'Clerk',
					avatarEmoji: '💁‍♀️',
					hanzi: '有的，这是L号，您试试看！',
					pinyin: 'Yǒu de, zhè shì L hào, nín shìshikàn!',
					english: 'Yes, here is Large, please try it!',
					audioText: '有的，这是L号，您试试看！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '试一下',
				pinyin: 'shì yíxià',
				english: 'try it on briefly',
				mnemonic: 'Test/Try (试) + a bit/once (一下) makes requests gentle.',
				toneNumber: 4
			},
			{
				hanzi: '试衣间',
				pinyin: 'shìyījiān',
				english: 'fitting room',
				mnemonic: 'Try (试) + Clothes (衣) + Room (间).',
				toneNumber: 4
			},
			{
				hanzi: '大一号',
				pinyin: 'dà yí hào',
				english: 'one size larger',
				mnemonic: 'Big (大) + One (一) + Size/Number (号).',
				toneNumber: 4
			},
			{
				hanzi: '有点小',
				pinyin: 'yǒudiǎnr xiǎo',
				english: 'a bit small (complaint)',
				mnemonic: '有点 (yǒudiǎnr) expresses mild dissatisfaction or friction.',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'The Trial Request Formula',
			formula: '可以 (Kěyǐ) + [Action] + 一下 (yíxià) + 吗 (ma)?',
			slots: [
				{ label: 'Permission', example: '可以', pinyin: 'kěyǐ' },
				{ label: 'Verb', example: '试', pinyin: 'shì' },
				{ label: 'Softener', example: '一下', pinyin: 'yíxià' },
				{ label: 'Question', example: '吗', pinyin: 'ma' }
			],
			notes: 'Adding 一下 (yíxià) turns a blunt command into a polite, natural request.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match shopping phrases with their icons:',
				pictureMatch: {
					pairs: [
						{ hanzi: '试衣间', pinyin: 'shìyījiān', english: 'Fitting room', imageEmoji: '🚪' },
						{ hanzi: '大一号', pinyin: 'dà yí hào', english: 'Bigger size', imageEmoji: '👕' },
						{ hanzi: '试一下', pinyin: 'shì yíxià', english: 'Try on', imageEmoji: '👗' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "May I try it on?"',
				wordReorder: {
					sentenceHanzi: '可以 试一下 吗',
					sentencePinyin: 'Kěyǐ shì yíxià ma',
					sentenceEnglish: 'May I try it on?',
					shuffledWords: ['吗', '可以', '试一下'],
					wordPinyinMap: {
						可以: 'kěyǐ',
						试一下: 'shì yíxià',
						吗: 'ma'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '04-conversation-particles',
		guideId: '04-conversation-particles',
		title: 'Conversation Particles',
		subtitle: 'Master the emotion and tone modifiers: 吧, 呢, 啊, 吗',
		unitBadge: 'Unit 4 · Speaking Flavor',
		characterHost: {
			name: 'Teacher Yu (于老师)',
			avatarEmoji: '👩‍🏫',
			intro:
				'Chinese sentence-final particles give your speech warmth, friendliness, and natural nuance! Let us master 吧, 呢, 啊, and 吗.'
		},
		scene: {
			setting: 'Sunny Afternoon at a Café Terrace',
			dialogue: [
				{
					speaker: 'Friend A',
					avatarEmoji: '👱',
					hanzi: '我们走吧？',
					pinyin: 'Wǒmen zǒu ba?',
					english: 'Shall we get going?',
					audioText: '我们走吧？'
				},
				{
					speaker: 'Friend B',
					avatarEmoji: '👧',
					hanzi: '好啊！你拿伞了吗？',
					pinyin: 'Hǎo a! Nǐ ná sǎn le ma?',
					english: 'Sure! Did you bring an umbrella?',
					audioText: '好啊！你拿伞了吗？'
				},
				{
					speaker: 'Friend A',
					avatarEmoji: '👱',
					hanzi: '拿了。你的包呢？',
					pinyin: 'Ná le. Nǐ de bāo ne?',
					english: 'I did. Where is your bag?',
					audioText: '拿了。你的包呢？'
				},
				{
					speaker: 'Friend B',
					avatarEmoji: '👧',
					hanzi: '在这儿呢，走吧！',
					pinyin: 'Zài zhèr ne, zǒu ba!',
					english: "It's right here, let's go!",
					audioText: '在这儿呢，走吧！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '吧',
				pinyin: 'ba',
				english: 'suggestion / confirmation',
				mnemonic: 'Suggestion particle: transforms statements into friendly proposals.',
				toneNumber: 5
			},
			{
				hanzi: '呢',
				pinyin: 'ne',
				english: 'bounce back / where is?',
				mnemonic: 'The bounce-back particle: "What about..." or "Where is...?"',
				toneNumber: 5
			},
			{
				hanzi: '啊',
				pinyin: 'a',
				english: 'enthusiasm / warmth',
				mnemonic: 'Vocal exclamation showing friendly agreement (好啊! Sure!).',
				toneNumber: 5
			},
			{
				hanzi: '吗',
				pinyin: 'ma',
				english: 'yes/no question maker',
				mnemonic: 'Turns any declarative fact into a yes-or-no question.',
				toneNumber: 5
			}
		],
		patternBox: {
			title: 'The Friendly Suggestion Formula',
			formula: '[Action] + 吧 (ba)!',
			slots: [
				{ label: 'Subject', example: '我们', pinyin: 'wǒmen' },
				{ label: 'Verb', example: '走', pinyin: 'zǒu' },
				{ label: 'Suggestion', example: '吧', pinyin: 'ba' }
			],
			notes: 'Adding 吧 softens orders into collaborative team proposals.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match particles with their function:',
				pictureMatch: {
					pairs: [
						{ hanzi: '走吧', pinyin: 'zǒu ba', english: "Let's go (suggestion)", imageEmoji: '🚶' },
						{ hanzi: '好啊', pinyin: 'hǎo a', english: 'Great! (enthusiasm)', imageEmoji: '✨' },
						{ hanzi: '你呢', pinyin: 'nǐ ne', english: 'And you? (bounce back)', imageEmoji: '🔄' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Let\'s go together!"',
				wordReorder: {
					sentenceHanzi: '我们 一起 走吧',
					sentencePinyin: 'Wǒmen yìqǐ zǒu ba',
					sentenceEnglish: "Let's go together!",
					shuffledWords: ['走吧', '一起', '我们'],
					wordPinyinMap: {
						我们: 'wǒmen',
						一起: 'yìqǐ',
						走吧: 'zǒu ba'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '05-conversation-rescue-cards',
		guideId: '05-conversation-rescue-cards',
		title: 'Conversation Rescue Cards',
		subtitle: 'Polite ways to pause, clarify, and slow down rapid Mandarin',
		unitBadge: 'Unit 5 · Survival Tools',
		characterHost: {
			name: 'Captain Chen (陈船长)',
			avatarEmoji: '🧭',
			intro:
				"When speakers talk too fast, don't panic! Pull out a conversational rescue card to regain control politely."
		},
		scene: {
			setting: 'Taxi Ride across Guangzhou',
			dialogue: [
				{
					speaker: 'Driver',
					avatarEmoji: '🚕',
					hanzi: '刚才那条路修路我们得从前面高架桥绕过去你明白吗？',
					pinyin:
						'Gāngcái nà tiáo lù xiūlù wǒmen děi cóng qiánmian gāojiàqiáo rào guòqu nǐ míngbai ma?',
					english:
						'The road earlier is under construction so we have to detour via the overpass do you understand?',
					audioText: '刚才那条路修路我们得从前面高架桥绕过去你明白吗？'
				},
				{
					speaker: 'Passenger',
					avatarEmoji: '🙋‍♂️',
					hanzi: '不好意思，请再说一遍？',
					pinyin: 'Bù hǎoyìsi, qǐng zài shuō yí biàn?',
					english: 'Excuse me, could you please say that once more?',
					audioText: '不好意思，请再说一遍？'
				},
				{
					speaker: 'Passenger',
					avatarEmoji: '🙋‍♂️',
					hanzi: '请说慢一点儿，谢谢。',
					pinyin: 'Qǐng shuō màn yìdiǎnr, xièxie.',
					english: 'Please speak a little slower, thank you.',
					audioText: '请说慢一点儿，谢谢。'
				},
				{
					speaker: 'Driver',
					avatarEmoji: '🚕',
					hanzi: '好的好的，前面修路，我们绕一下！',
					pinyin: 'Hǎo de hǎo de, qiánmian xiūlù, wǒmen rào yíxià!',
					english: 'Sure sure, construction ahead, we will take a small detour!',
					audioText: '好的好的，前面修路，我们绕一下！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '再说一遍',
				pinyin: 'zài shuō yí biàn',
				english: 'say it once again',
				mnemonic: 'Again (再) + Say (说) + One round (一遍).',
				toneNumber: 4
			},
			{
				hanzi: '说慢一点',
				pinyin: 'shuō màn yìdiǎnr',
				english: 'speak a little slower',
				mnemonic: 'Say (说) + Slow (慢) + A little (一点).',
				toneNumber: 4
			},
			{
				hanzi: '不好意思',
				pinyin: 'bù hǎoyìsi',
				english: 'excuse me / pardon',
				mnemonic: 'Universal polite buffer for interruptions and asking help.',
				toneNumber: 3
			},
			{
				hanzi: '什么意思',
				pinyin: 'shénme yìsi',
				english: 'what does this mean?',
				mnemonic: 'What (什么) + Meaning (意思).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'The Clarification Request Formula',
			formula: '请 (Qǐng) + [Verb] + [Adverb / Amount]',
			slots: [
				{ label: 'Polite buffer', example: '请', pinyin: 'qǐng' },
				{ label: 'Action', example: '说慢', pinyin: 'shuō màn' },
				{ label: 'Modifier', example: '一点儿', pinyin: 'yìdiǎnr' }
			],
			notes: 'Never stay silent in confusion. Native speakers are very happy to slow down if asked!'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match rescue phrases to situations:',
				pictureMatch: {
					pairs: [
						{
							hanzi: '再说一遍',
							pinyin: 'zài shuō yí biàn',
							english: 'Say again',
							imageEmoji: '🔁'
						},
						{
							hanzi: '说慢一点',
							pinyin: 'shuō màn yìdiǎnr',
							english: 'Speak slower',
							imageEmoji: '🐢'
						},
						{ hanzi: '什么意思', pinyin: 'shénme yìsi', english: 'What meaning', imageEmoji: '❓' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Please speak a little slower."',
				wordReorder: {
					sentenceHanzi: '请 说慢 一点儿',
					sentencePinyin: 'Qǐng shuō màn yìdiǎnr',
					sentenceEnglish: 'Please speak a little slower.',
					shuffledWords: ['一点儿', '请', '说慢'],
					wordPinyinMap: {
						请: 'qǐng',
						说慢: 'shuō màn',
						一点儿: 'yìdiǎnr'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '06-numbers-prices-dates-time',
		guideId: '06-numbers-prices-dates-time',
		title: 'Numbers, Prices & Time',
		subtitle: 'Decimal structures, 块 vs 元, and telling the hour',
		unitBadge: 'Unit 6 · Daily Math',
		characterHost: {
			name: 'Auntie Mei (梅阿姨)',
			avatarEmoji: '🧮',
			intro:
				"Numbers unlock prices, phone numbers, and train schedules! Let's conquer Chinese currency and clock times."
		},
		scene: {
			setting: 'Fruit Stand on a Beijing Alleyway',
			dialogue: [
				{
					speaker: 'Auntie Mei',
					avatarEmoji: '🧮',
					hanzi: '新鲜草莓，二十五块一盒！',
					pinyin: 'Xīnxiān cǎoméi, èrshíwǔ kuài yì hé!',
					english: 'Fresh strawberries, 25 kuai per box!',
					audioText: '新鲜草莓，二十五块一盒！'
				},
				{
					speaker: 'Buyer',
					avatarEmoji: '👦',
					hanzi: '现在几点了？我赶时间。',
					pinyin: 'Xiànzài jǐ diǎn le? Wǒ gǎn shíjiān.',
					english: 'What time is it now? I am in a hurry.',
					audioText: '现在几点了？我赶时间。'
				},
				{
					speaker: 'Auntie Mei',
					avatarEmoji: '🧮',
					hanzi: '现在下午三点半。',
					pinyin: 'Xiànzài xiàwǔ sān diǎn bàn.',
					english: "It's 3:30 in the afternoon right now.",
					audioText: '现在下午三点半。'
				},
				{
					speaker: 'Buyer',
					avatarEmoji: '👦',
					hanzi: '那我买一盒，扫码付二十五块！',
					pinyin: 'Nà wǒ mǎi yì hé, sǎomǎ fù èrshíwǔ kuài!',
					english: 'Then I will buy one box, scan QR to pay 25 kuai!',
					audioText: '那我买一盒，扫码付二十五块！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '块',
				pinyin: 'kuài',
				english: 'RMB Yuan (spoken unit)',
				mnemonic: 'Everyday spoken term for Chinese currency Yuan (元).',
				toneNumber: 4
			},
			{
				hanzi: '几点',
				pinyin: 'jǐ diǎn',
				english: 'what time / what hour',
				mnemonic: 'How many (几) + Dots/Hours on clock (点).',
				toneNumber: 3
			},
			{
				hanzi: '半',
				pinyin: 'bàn',
				english: 'half / half hour',
				mnemonic: 'Slices something cleanly in half.',
				toneNumber: 4
			},
			{
				hanzi: '多少钱',
				pinyin: 'duōshao qián',
				english: 'how much money?',
				mnemonic: 'Many/Few (多少) + Money (钱).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'The Price Inquiry Formula',
			formula: '[Item] + 多少钱 (duōshao qián)?',
			slots: [
				{ label: 'Item', example: '这个', pinyin: 'zhè ge' },
				{ label: 'Question', example: '多少钱', pinyin: 'duōshao qián' }
			],
			notes: 'To answer: number + 块 (kuài). E.g. 三块五 (3 kuai 5 mao = 3.50 RMB).'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match number terms to concepts:',
				pictureMatch: {
					pairs: [
						{ hanzi: '多少钱', pinyin: 'duōshao qián', english: 'Price ask', imageEmoji: '💰' },
						{ hanzi: '三点半', pinyin: 'sān diǎn bàn', english: '3:30 clock', imageEmoji: '🕒' },
						{ hanzi: '扫码', pinyin: 'sǎomǎ', english: 'Scan QR code', imageEmoji: '📱' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "What time is it right now?"',
				wordReorder: {
					sentenceHanzi: '现在 几点 了',
					sentencePinyin: 'Xiànzài jǐ diǎn le',
					sentenceEnglish: 'What time is it now?',
					shuffledWords: ['了', '现在', '几点'],
					wordPinyinMap: {
						现在: 'xiànzài',
						几点: 'jǐ diǎn',
						了: 'le'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '07-relative-time-and-plans',
		guideId: '07-relative-time-and-plans',
		title: 'Relative Time & Plans',
		subtitle: 'Yesterday, tomorrow, weekend planning, and scheduling',
		unitBadge: 'Unit 7 · Calendar Time',
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '📅',
			intro:
				'Making plans with friends is easy once you know how time markers sit before the action verb in Mandarin!'
		},
		scene: {
			setting: 'Library Entrance on Friday Evening',
			dialogue: [
				{
					speaker: 'Xiao Ming',
					avatarEmoji: '👦',
					hanzi: '周末你有什么打算？',
					pinyin: 'Zhōumò nǐ yǒu shénme dǎsuan?',
					english: 'What plans do you have for the weekend?',
					audioText: '周末你有什么打算？'
				},
				{
					speaker: 'Friend',
					avatarEmoji: '👧',
					hanzi: '明天下午我想去公园散步。你呢？',
					pinyin: 'Míngtiān xiàwǔ wǒ xiǎng qù gōngyuán sànbù. Nǐ ne?',
					english: 'Tomorrow afternoon I want to go to the park for a stroll. And you?',
					audioText: '明天下午我想去公园散步。你呢？'
				},
				{
					speaker: 'Xiao Ming',
					avatarEmoji: '👦',
					hanzi: '太好了！明天下午我们一起去吧！',
					pinyin: 'Tài hǎo le! Míngtiān xiàwǔ wǒmen yìqǐ qù ba!',
					english: 'Great! Tomorrow afternoon let us go together!',
					audioText: '太好了！明天下午我们一起去吧！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '打算',
				pinyin: 'dǎsuan',
				english: 'plans / intend to',
				mnemonic: 'Hit/Strike (打) + Calculate (算) = to plan out.',
				toneNumber: 3
			},
			{
				hanzi: '周末',
				pinyin: 'zhōumò',
				english: 'weekend',
				mnemonic: 'Week cycle (周) + End/Tip (末).',
				toneNumber: 1
			},
			{
				hanzi: '明天',
				pinyin: 'míngtiān',
				english: 'tomorrow',
				mnemonic: 'Bright sun and moon (明) + Day (天).',
				toneNumber: 2
			},
			{
				hanzi: '一起',
				pinyin: 'yìqǐ',
				english: 'together',
				mnemonic: 'One (一) + Rise together (起).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'The Time-Before-Action Rule',
			formula: '[Subject] + [Time Word] + [Location/Action]',
			slots: [
				{ label: 'Subject', example: '我们', pinyin: 'wǒmen' },
				{ label: 'Time', example: '明天下午', pinyin: 'míngtiān xiàwǔ' },
				{ label: 'Action', example: '去公园', pinyin: 'qù gōngyuán' }
			],
			notes: 'Mandarin ALWAYS puts time BEFORE the verb, never at the end of the sentence!'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match calendar and planning concepts:',
				pictureMatch: {
					pairs: [
						{ hanzi: '周末', pinyin: 'zhōumò', english: 'Weekend', imageEmoji: '🏖️' },
						{ hanzi: '明天', pinyin: 'míngtiān', english: 'Tomorrow', imageEmoji: '🌅' },
						{ hanzi: '一起', pinyin: 'yìqǐ', english: 'Together', imageEmoji: '🤝' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Tomorrow I want to go to the park."',
				wordReorder: {
					sentenceHanzi: '明天 我 想 去 公园',
					sentencePinyin: 'Míngtiān wǒ xiǎng qù gōngyuán',
					sentenceEnglish: 'Tomorrow I want to go to the park.',
					shuffledWords: ['公园', '明天', '想', '去', '我'],
					wordPinyinMap: {
						明天: 'míngtiān',
						我: 'wǒ',
						想: 'xiǎng',
						去: 'qù',
						公园: 'gōngyuán'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '08-mandarin-at-home',
		guideId: '08-mandarin-at-home',
		title: 'Mandarin at Home',
		subtitle: 'Rooms, daily appliances, chores, and household requests',
		unitBadge: 'Unit 8 · Home Sweet Home',
		characterHost: {
			name: 'Mommy Zhang (张妈妈)',
			avatarEmoji: '🏡',
			intro:
				'Welcome home! Speaking Chinese around the house turns everyday chores into relaxed, natural practice.'
		},
		scene: {
			setting: 'Apartment Living Room in Hangzhou',
			dialogue: [
				{
					speaker: 'Mommy Zhang',
					avatarEmoji: '🏡',
					hanzi: '洗手了吗？快来吃晚饭！',
					pinyin: 'Xǐ shǒu le ma? Kuài lái chī wǎnfàn!',
					english: 'Did you wash your hands? Come quickly to eat dinner!',
					audioText: '洗手了吗？快来吃晚饭！'
				},
				{
					speaker: 'Son',
					avatarEmoji: '👦',
					hanzi: '洗过了！今天空调开得有点冷。',
					pinyin: 'Xǐ guò le! Jīntiān kōngtiáo kāi de yǒudiǎnr lěng.',
					english: 'Washed already! The air conditioner is set a bit cold today.',
					audioText: '洗过了！今天空调开得有点冷。'
				},
				{
					speaker: 'Mommy Zhang',
					avatarEmoji: '🏡',
					hanzi: '把遥控器拿给我，我调高两度。',
					pinyin: 'Bǎ yáokòngqì ná gěi wǒ, wǒ tiáo gāo liǎng dù.',
					english: 'Hand me the remote, I will raise it by two degrees.',
					audioText: '把遥控器拿给我，我调高两度。'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '空调',
				pinyin: 'kōngtiáo',
				english: 'air conditioner',
				mnemonic: 'Air (空) + Regulator/Adjuster (调).',
				toneNumber: 1
			},
			{
				hanzi: '洗手',
				pinyin: 'xǐ shǒu',
				english: 'wash hands',
				mnemonic: 'Wash (洗) + Hands (手).',
				toneNumber: 3
			},
			{
				hanzi: '关灯',
				pinyin: 'guān dēng',
				english: 'turn off lights',
				mnemonic: 'Close/Shut (关) + Lamp/Light (灯).',
				toneNumber: 1
			},
			{
				hanzi: '晚饭',
				pinyin: 'wǎnfàn',
				english: 'dinner / evening meal',
				mnemonic: 'Evening (晚) + Cooked rice/meal (饭).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'The Completion Aspect Formula',
			formula: '[Verb] + 过了 (guò le) / [Verb] + 了 (le)',
			slots: [
				{ label: 'Action', example: '洗手', pinyin: 'xǐ shǒu' },
				{ label: 'Completion', example: '过了', pinyin: 'guò le' }
			],
			notes: 'Use 过了 to emphasize that you already carried out an action in the past.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match household items:',
				pictureMatch: {
					pairs: [
						{ hanzi: '空调', pinyin: 'kōngtiáo', english: 'AC unit', imageEmoji: '❄️' },
						{ hanzi: '洗手', pinyin: 'xǐ shǒu', english: 'Wash hands', imageEmoji: '🧼' },
						{ hanzi: '关灯', pinyin: 'guān dēng', english: 'Turn off light', imageEmoji: '💡' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Remember to turn off the lights."',
				wordReorder: {
					sentenceHanzi: '记得 关灯 谢谢',
					sentencePinyin: 'Jìde guān dēng xièxie',
					sentenceEnglish: 'Remember to turn off lights, thank you.',
					shuffledWords: ['关灯', '谢谢', '记得'],
					wordPinyinMap: {
						记得: 'jìde',
						关灯: 'guān dēng',
						谢谢: 'xièxie'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '09-polite-phrases-reactions',
		guideId: '09-polite-phrases-reactions',
		title: 'Polite Phrases & Reactions',
		subtitle: 'Expressing gratitude, apologies, humility, and encouragement',
		unitBadge: 'Unit 9 · Warm Manners',
		characterHost: {
			name: 'Xiao Xue (小雪)',
			avatarEmoji: '🌸',
			intro:
				"Polite reactions build instant warmth and goodwill! Let's learn authentic ways to respond like 哪里哪里 and 没关系."
		},
		scene: {
			setting: 'Teahouse Conversation in Suzhou',
			dialogue: [
				{
					speaker: 'Host',
					avatarEmoji: '🍵',
					hanzi: '你的普通话说得真流利！',
					pinyin: 'Nǐ de pǔtōnghuà shuō de zhēn liúlì!',
					english: 'Your Mandarin is spoken so fluently!',
					audioText: '你的普通话说得真流利！'
				},
				{
					speaker: 'Guest',
					avatarEmoji: '🌸',
					hanzi: '哪里哪里，还要继续多练习！',
					pinyin: 'Nǎlǐ nǎlǐ, hái yào jìxù duō liànxí!',
					english: 'You flatter me, I still need to practice much more!',
					audioText: '哪里哪里，还要继续多练习！'
				},
				{
					speaker: 'Host',
					avatarEmoji: '🍵',
					hanzi: '太谦虚了，请喝茶！',
					pinyin: 'Tài qiānxū le, qǐng hē chá!',
					english: 'You are too modest, please have some tea!',
					audioText: '太谦虚了，请喝茶！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '哪里哪里',
				pinyin: 'nǎlǐ nǎlǐ',
				english: 'you flatter me / not at all',
				mnemonic: 'The classic modest reaction to a compliment: "Where? Where?"',
				toneNumber: 3
			},
			{
				hanzi: '没关系',
				pinyin: 'méi guānxi',
				english: 'it does not matter / no worries',
				mnemonic: 'No (没) + Connection/Consequence (关系).',
				toneNumber: 2
			},
			{
				hanzi: '辛苦了',
				pinyin: 'xīnkǔ le',
				english: 'thank you for your hard work',
				mnemonic: 'Acknowledge someone who labored for you with warm appreciation.',
				toneNumber: 1
			},
			{
				hanzi: '不客气',
				pinyin: 'bú kèqi',
				english: 'you are welcome',
				mnemonic: 'Do not be (不) polite/ceremonious (客气).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'The Modest Compliment Deflection Formula',
			formula: '哪里哪里 (Nǎlǐ nǎlǐ) + [Modest continuation]',
			slots: [
				{ label: 'Reaction', example: '哪里哪里', pinyin: 'nǎlǐ nǎlǐ' },
				{ label: 'Followup', example: '还要多学', pinyin: 'hái yào duō xué' }
			],
			notes: 'Reflecting compliments with humility is highly appreciated across Chinese culture.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match social reactions to meaning:',
				pictureMatch: {
					pairs: [
						{
							hanzi: '哪里哪里',
							pinyin: 'nǎlǐ nǎlǐ',
							english: 'Modest deflection',
							imageEmoji: '🙇'
						},
						{
							hanzi: '辛苦了',
							pinyin: 'xīnkǔ le',
							english: 'Thank you for work',
							imageEmoji: '💪'
						},
						{ hanzi: '没关系', pinyin: 'méi guānxi', english: 'No problem', imageEmoji: '👌' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "You are welcome, no worries."',
				wordReorder: {
					sentenceHanzi: '不客气 没关系',
					sentencePinyin: 'Bú kèqi, méi guānxi',
					sentenceEnglish: 'You are welcome, no worries.',
					shuffledWords: ['没关系', '不客气'],
					wordPinyinMap: {
						不客气: 'bú kèqi',
						没关系: 'méi guānxi'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '10-travel-refresher',
		guideId: '10-travel-refresher',
		title: 'Travel & Transport Refresher',
		subtitle: 'Airports, high-speed rail, metro stations, and boarding gates',
		unitBadge: 'Unit 10 · High-Speed Rails',
		characterHost: {
			name: 'Officer Zhang (张警官)',
			avatarEmoji: '🚄',
			intro:
				"Traveling across China on high-speed rail (高铁) is an incredible adventure. Let's master transit signage and announcements!"
		},
		scene: {
			setting: 'Beijing South High-Speed Railway Station',
			dialogue: [
				{
					speaker: 'Traveler',
					avatarEmoji: '🧳',
					hanzi: '请问去上海的高铁在哪个检票口？',
					pinyin: 'Qǐngwèn qù Shànghǎi de gāotiě zài nǎge jiǎnpiàokǒu?',
					english: 'Excuse me, which ticket gate is the high-speed train to Shanghai?',
					audioText: '请问去上海的高铁在哪个检票口？'
				},
				{
					speaker: 'Station Officer',
					avatarEmoji: '👮‍♂️',
					hanzi: '在二楼12B检票口，现在正在候车。',
					pinyin: "Zài èr lóu shí'èr B jiǎnpiàokǒu, xiànzài zhèngzài hòuchē.",
					english: 'At ticket gate 12B on the 2nd floor, currently waiting to board.',
					audioText: '在二楼12B检票口，现在正在候车。'
				},
				{
					speaker: 'Traveler',
					avatarEmoji: '🧳',
					hanzi: '刷身份证还是护照进站？',
					pinyin: 'Shuā shēnfènzhèng háishi hùzhào jìnzhàn?',
					english: 'Do I scan my ID card or passport to enter the platform?',
					audioText: '刷身份证还是护照进站？'
				},
				{
					speaker: 'Station Officer',
					avatarEmoji: '👮‍♂️',
					hanzi: '走人工通道刷护照即可！',
					pinyin: 'Zǒu réngōng tōngdào shuā hùzhào jíkě!',
					english: 'Take the staffed manual lane and scan your passport!',
					audioText: '走人工通道刷护照即可！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '高铁',
				pinyin: 'gāotiě',
				english: 'high-speed rail (bullet train)',
				mnemonic: 'High (高) + Iron/Steel rails (铁).',
				toneNumber: 1
			},
			{
				hanzi: '检票口',
				pinyin: 'jiǎnpiàokǒu',
				english: 'ticket check gate',
				mnemonic: 'Inspect (检) + Ticket (票) + Mouth/Gate (口).',
				toneNumber: 3
			},
			{
				hanzi: '人工通道',
				pinyin: 'réngōng tōngdào',
				english: 'manual / staffed lane',
				mnemonic: 'Human work (人工) + Passage pathway (通道).',
				toneNumber: 2
			},
			{
				hanzi: '候车室',
				pinyin: 'hòuchēshì',
				english: 'waiting lounge / hall',
				mnemonic: 'Wait (候) + Vehicle/Train (车) + Room (室).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'The Location Finding Formula',
			formula: '[Destination] + 在哪个 (zài nǎge) + [Facility]?',
			slots: [
				{ label: 'Target', example: '高铁', pinyin: 'gāotiě' },
				{ label: 'Question', example: '在哪个', pinyin: 'zài nǎge' },
				{ label: 'Facility', example: '检票口', pinyin: 'jiǎnpiàokǒu' }
			],
			notes: 'Look for big LED boards showing 车次 (train number) and 检票口 (ticket check gate).'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match transit terms to signs:',
				pictureMatch: {
					pairs: [
						{ hanzi: '高铁', pinyin: 'gāotiě', english: 'High-speed train', imageEmoji: '🚄' },
						{ hanzi: '检票口', pinyin: 'jiǎnpiàokǒu', english: 'Ticket gate', imageEmoji: '🎫' },
						{
							hanzi: '人工通道',
							pinyin: 'réngōng tōngdào',
							english: 'Staffed lane',
							imageEmoji: '🛂'
						}
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Which ticket gate is it at?"',
				wordReorder: {
					sentenceHanzi: '在 哪个 检票口',
					sentencePinyin: 'Zài nǎge jiǎnpiàokǒu',
					sentenceEnglish: 'At which ticket gate?',
					shuffledWords: ['检票口', '在', '哪个'],
					wordPinyinMap: {
						在: 'zài',
						哪个: 'nǎge',
						检票口: 'jiǎnpiàokǒu'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '11-tone-pairs-lab',
		guideId: '11-tone-pairs-lab',
		title: 'Tone Pairs Laboratory',
		subtitle: 'The 20 two-syllable pitch trajectories that unlock natural speech',
		unitBadge: 'Unit 11 · Pitch Harmony',
		characterHost: {
			name: 'Dr. Yin (尹博士)',
			avatarEmoji: '🎵',
			intro:
				"In real Mandarin, words rarely occur in isolation. Over 80% of vocabulary consists of two-syllable tone pairs! Let's lock in the melody."
		},
		scene: {
			setting: 'Phonetics Sound Studio in Beijing',
			dialogue: [
				{
					speaker: 'Dr. Yin',
					avatarEmoji: '🎵',
					hanzi: '今天我们来练习第一声加第四声，比如“面包”。',
					pinyin: 'Jīntiān wǒmen lái liànxí dì-yī shēng jiā dì-sì shēng, bǐrú “miānbāo”.',
					english: 'Today let us practice 1st tone plus 4th tone, like "miànbāo" (bread).',
					audioText: '今天我们来练习第一声加第四声，比如面包。'
				},
				{
					speaker: 'Student',
					avatarEmoji: '🎧',
					hanzi: '高平音迅速落下来：面包！听起来顺畅多了！',
					pinyin: 'Gāo píng yīn xùnsù luò xiàlái: miànbāo! Tīng qǐlai shùnchàng duō le!',
					english: 'High flat tone drops sharply down: bread! Sounds much smoother!',
					audioText: '高平音迅速落下来：面包！听起来顺畅多了！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '面包',
				pinyin: 'miànbāo',
				english: 'bread (4th + 1st)',
				mnemonic: 'Drop sharply from 4th tone, then glide flat on 1st tone.',
				toneNumber: 4
			},
			{
				hanzi: '今天',
				pinyin: 'jīntiān',
				english: 'today (1st + 1st double high)',
				mnemonic: 'Keep both syllables high, bright, and sustained.',
				toneNumber: 1
			},
			{
				hanzi: '苹果',
				pinyin: 'píngguǒ',
				english: 'apple (2nd + 3rd rising into dip)',
				mnemonic: 'Rise like a question (píng), then gently dip low (guǒ).',
				toneNumber: 2
			},
			{
				hanzi: '时间',
				pinyin: 'shíjiān',
				english: 'time (2nd + 1st)',
				mnemonic: 'Rise smoothly from chest (shí) and level out on ceiling (jiān).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'The Tone Pair Melody Rule',
			formula: '[Pitch Syllable 1] ➔ [Pitch Syllable 2]',
			slots: [
				{ label: 'Syllable 1', example: '面 (miàn)', pinyin: 'high drop' },
				{ label: 'Syllable 2', example: '包 (bāo)', pinyin: 'high flat' }
			],
			notes: 'Never pause between syllables in a word: connect their pitch glide seamlessly.'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match two-syllable food pairs:',
				pictureMatch: {
					pairs: [
						{ hanzi: '面包', pinyin: 'miànbāo', english: 'Bread', imageEmoji: '🍞' },
						{ hanzi: '苹果', pinyin: 'píngguǒ', english: 'Apple', imageEmoji: '🍎' },
						{ hanzi: '绿茶', pinyin: 'lǜchá', english: 'Green tea', imageEmoji: '🍵' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "Today eat bread."',
				wordReorder: {
					sentenceHanzi: '今天 吃 面包',
					sentencePinyin: 'Jīntiān chī miànbāo',
					sentenceEnglish: 'Today eat bread.',
					shuffledWords: ['面包', '今天', '吃'],
					wordPinyinMap: {
						今天: 'jīntiān',
						吃: 'chī',
						面包: 'miànbāo'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '12-tone-sandhi-rules',
		guideId: '12-tone-sandhi-rules',
		title: 'Tone Sandhi Rules: 不, 一, and 3-3',
		subtitle: 'The 3 unconscious pitch shifts that make speech fluent',
		unitBadge: 'Unit 12 · Pitch Secrets',
		characterHost: {
			name: 'Master Liu (刘师傅)',
			avatarEmoji: '🥋',
			intro:
				"Tone Sandhi is like water flowing down stones: your mouth naturally bends tones so words don't clash! Let's conquer the 3 key rules."
		},
		scene: {
			setting: 'Martial Arts Academy in Dengfeng',
			dialogue: [
				{
					speaker: 'Master Liu',
					avatarEmoji: '🥋',
					hanzi: '两个第三声在一起，第一个变第二声！比如“你好”。',
					pinyin: 'Liǎng gè dì-sān shēng zài yìqǐ, dì-yī gè biàn dì-èr shēng! Bǐrú “nǐ hǎo”.',
					english:
						'When two 3rd tones meet, the first turns into 2nd tone! Like "nǐ hǎo" -> "ní hǎo".',
					audioText: '两个第三声在一起，第一个变第二声！比如你好。'
				},
				{
					speaker: 'Student',
					avatarEmoji: '🥋',
					hanzi: '原来如此！难怪读起来毫不费力！',
					pinyin: 'Yuánláirúcǐ! Nánguài dú qǐlai háo bù fèilì!',
					english: 'I see! No wonder it feels completely effortless to pronounce!',
					audioText: '原来如此！难怪读起来毫不费力！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '你好',
				pinyin: 'nǐ hǎo (sounds: ní hǎo)',
				english: 'hello (3+3 -> 2+3 rule)',
				mnemonic: 'Two dipping 3rd tones are exhausting; the first rebounds into 2nd tone.',
				toneNumber: 3
			},
			{
				hanzi: '不是',
				pinyin: 'bú shì (sounds: bú)',
				english: 'is not (不 before 4th tone)',
				mnemonic: '不 is normally 4th tone (bù). Before another 4th tone, it rises to 2nd (bú)!',
				toneNumber: 2
			},
			{
				hanzi: '一个',
				pinyin: 'yí gè (sounds: yí)',
				english: 'one (一 before 4th tone)',
				mnemonic: '一 is normally 1st tone (yī). Before a 4th tone, it rises to 2nd (yí)!',
				toneNumber: 2
			},
			{
				hanzi: '一起',
				pinyin: 'yìqǐ (sounds: yì)',
				english: 'together (一 before 1/2/3 tone)',
				mnemonic: 'Before 1st, 2nd, or 3rd tone, 一 drops into strong 4th tone (yì).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'The 3-3 Sandhi Shift Formula',
			formula: '3rd tone + 3rd tone ➔ 2nd tone + 3rd tone',
			slots: [
				{ label: 'Written', example: '你 (3) + 好 (3)', pinyin: 'nǐ + hǎo' },
				{ label: 'Spoken', example: 'ní + hǎo', pinyin: '2nd + 3rd' }
			],
			notes: 'Dictionaries write original tone, but native speakers always shift pitch seamlessly!'
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match sandhi phrases with their tone rules:',
				pictureMatch: {
					pairs: [
						{ hanzi: '你好', pinyin: 'ní hǎo', english: '3+3 shift', imageEmoji: '🤝' },
						{ hanzi: '不是', pinyin: 'bú shì', english: '不 before 4th tone', imageEmoji: '❌' },
						{ hanzi: '一起', pinyin: 'yìqǐ', english: '一 before 3rd tone', imageEmoji: '👫' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "I am not a student."',
				wordReorder: {
					sentenceHanzi: '我 不是 学生',
					sentencePinyin: 'Wǒ bú shì xuésheng',
					sentenceEnglish: 'I am not a student.',
					shuffledWords: ['学生', '我', '不是'],
					wordPinyinMap: {
						我: 'wǒ',
						不是: 'bú shì',
						学生: 'xuésheng'
					}
				}
			}
		],
		xpReward: 15
	},
	{
		id: '13-typing-and-spelling-guide',
		guideId: '13-typing-and-spelling-guide',
		title: 'Pinyin Typing & IME Mechanics',
		subtitle: 'Whole-word typing, candidate selection, and the secret "v" key for "ü"',
		unitBadge: 'Unit 13 · Digital Native',
		characterHost: {
			name: 'Techie Bo (小博)',
			avatarEmoji: '💻',
			intro:
				"Typing Chinese is faster than English once you type whole words! Let's discover how keyboards handle ü with the 'v' key."
		},
		scene: {
			setting: 'Coworking Space in Shenzhen',
			dialogue: [
				{
					speaker: 'Xiao Bo',
					avatarEmoji: '💻',
					hanzi: '打字的时候，千万不要一个字一个字打，要打整词！',
					pinyin: 'Dǎzì de shíhou, qiānwàn bú yào yí gè zì yí gè zì dǎ, yào dǎ zhěng cí!',
					english: 'When typing, never type character by character; type whole words!',
					audioText: '打字的时候，千万不要一个字一个字打，要打整词！'
				},
				{
					speaker: 'Learner',
					avatarEmoji: '⌨️',
					hanzi: '比如输入“lvcha”就能直接出现“绿茶”！',
					pinyin: 'Bǐrú shūrù “lvcha” jiù néng zhíjiē chūxiàn “lǜchá”!',
					english: 'For example typing "lvcha" immediately brings up "绿茶"!',
					audioText: '比如输入lvcha就能直接出现绿茶！'
				},
				{
					speaker: 'Xiao Bo',
					avatarEmoji: '💻',
					hanzi: '太对了！按空格键直接上屏，速度快十倍！',
					pinyin: 'Tài duì le! Àn kònggéjiàn zhíjiē shàngpíng, sùdù kuài shí bèi!',
					english: 'Exactly! Press spacebar to commit, 10x faster!',
					audioText: '太对了！按空格键直接上屏，速度快十倍！'
				}
			]
		},
		spotlightWords: [
			{
				hanzi: '绿茶',
				pinyin: 'lǜchá (type: lvcha)',
				english: 'green tea (type v for ü)',
				mnemonic: 'The keyboard does not have an umlaut; "v" is universally mapped to "ü".',
				toneNumber: 4
			},
			{
				hanzi: '输入法',
				pinyin: 'shūrùfǎ',
				english: 'input method / IME',
				mnemonic: 'Input (输入) + Method/Way (法).',
				toneNumber: 1
			},
			{
				hanzi: '打字',
				pinyin: 'dǎzì',
				english: 'to type characters',
				mnemonic: 'Hit/Strike (打) + Characters (字).',
				toneNumber: 3
			},
			{
				hanzi: '空格键',
				pinyin: 'kònggé jiàn',
				english: 'spacebar',
				mnemonic: 'Space/Empty (空格) + Key (键).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'The Whole-Word Typing Secret',
			formula: 'Type continuous pinyin letters ➔ Press [Spacebar] to select #1 candidate',
			slots: [
				{ label: 'Input', example: 'lvcha', pinyin: 'letters' },
				{ label: 'Output', example: '绿茶', pinyin: 'characters' }
			],
			notes: "Use apostrophe (') to separate ambiguous syllables, e.g. xi'an vs xian!"
		},
		miniCheck: [
			{
				type: 'picture-match',
				prompt: 'Match typing terms with keyboard concepts:',
				pictureMatch: {
					pairs: [
						{ hanzi: '打字', pinyin: 'dǎzì', english: 'Typing', imageEmoji: '⌨️' },
						{ hanzi: '绿茶', pinyin: 'lǜchá', english: 'Type: lvcha', imageEmoji: '🍵' },
						{ hanzi: '输入法', pinyin: 'shūrùfǎ', english: 'Input method', imageEmoji: '💻' }
					]
				}
			},
			{
				type: 'word-reorder',
				prompt: 'Tap words in order to say: "I want a cup of green tea."',
				wordReorder: {
					sentenceHanzi: '我要 一杯 绿茶',
					sentencePinyin: 'Wǒ yào yì bēi lǜchá',
					sentenceEnglish: 'I want a cup of green tea.',
					shuffledWords: ['绿茶', '我要', '一杯'],
					wordPinyinMap: {
						我要: 'wǒ yào',
						一杯: 'yì bēi',
						绿茶: 'lǜchá'
					}
				}
			}
		],
		xpReward: 15
	}
];

export function getTextbookLesson(guideId: string): TextbookLesson | undefined {
	const normalized = guideId.trim().toLowerCase();
	return TEXTBOOK_LESSONS.find(
		(l) =>
			l.id === normalized ||
			l.guideId === normalized ||
			l.id.replace(/-/g, '') === normalized.replace(/-/g, '')
	);
}

export function getAllTextbookLessons(): TextbookLesson[] {
	return TEXTBOOK_LESSONS;
}
