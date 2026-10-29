import type { TextbookUnitData } from './types';

export const PART_2_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-05',
		unitNumber: 5,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Numbers, Dates and Time',
		chineseTitle: '数字与时间',
		subtitle: 'Clock time, calendar dates, schedules, and everyday numbers',
		milestoneGoal:
			'Tell time, schedule appointments by weekday and hour, state prices, and share dates fluently.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'Dates and time in Mandarin follow a clean logical rule: always broad-to-narrow (Year → Month → Day → Hour → Minute)!'
		},
		pronunciationLab: {
			title: 'Numbers 0 to 10 and Number Tone Combos',
			explanation: 'Number tones are essential for prices, phone numbers, and train times.',
			items: [
				{
					pinyin: 'líng, yī, èr, sān, sì',
					hanzi: '零 一 二 三 四',
					tone: 'Numbers 0–4',
					audioText: '零 一 二 三 四',
					tip: '0(2nd), 1(1st), 2(4th), 3(1st), 4(4th)'
				},
				{
					pinyin: 'wǔ, liù, qī, bā, jiǔ, shí',
					hanzi: '五 六 七 八 九 十',
					tone: 'Numbers 5–10',
					audioText: '五 六 七 八 九 十',
					tip: '5(3rd), 6(4th), 7(1st), 8(1st), 9(3rd), 10(2nd)'
				},
				{
					pinyin: '两 (liǎng) vs 二 (èr)',
					hanzi: '两个 (liǎng ge) vs 二十 (èrshí)',
					tone: 'Counting vs Quantity',
					audioText: '两个 两个小时 二号',
					tip: 'Use 两 before measure words for "two items" (两个, 两点); use 二 for counting (1, 2, 3) and digits (二十, 二号).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '请问，现在几点了？',
				pinyin: 'Qǐngwèn, xiànzài jǐ diǎn le?',
				english: 'Excuse me, what time is it now?',
				audioText: '请问，现在几点了？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '现在下午两点半。',
				pinyin: 'Xiànzài xiàwǔ liǎng diǎn bàn.',
				english: 'It is half past two in the afternoon right now.',
				audioText: '现在下午两点半。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '我们几点开会？是星期三吗？',
				pinyin: 'Wǒmen jǐ diǎn kāihuì? Shì xīngqīsān ma?',
				english: 'What time is our meeting? Is it Wednesday?',
				audioText: '我们几点开会？是星期三吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '对，星期三下午三点。',
				pinyin: 'Duì, xīngqīsān xiàwǔ sān diǎn.',
				english: 'Yes, Wednesday at 3:00 PM.',
				audioText: '对，星期三下午三点。'
			}
		],
		spotlightWords: [
			{
				hanzi: '现在',
				pinyin: 'xiànzài',
				english: 'now / currently',
				mnemonic: 'Present (现) presence (在).',
				toneNumber: 4
			},
			{
				hanzi: '几点',
				pinyin: 'jǐ diǎn',
				english: 'what time (o’clock)',
				mnemonic: 'How many (几) points on clock face (点).',
				toneNumber: 3
			},
			{
				hanzi: '半',
				pinyin: 'bàn',
				english: 'half / half past',
				mnemonic: 'Dividing something in half.',
				toneNumber: 4
			},
			{
				hanzi: '星期三',
				pinyin: 'xīngqīsān',
				english: 'Wednesday',
				mnemonic: 'Star period (星期) number 3.',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Time Formulation: Broad to Narrow',
			formula: 'Year + Month + Day + (Morning/Afternoon) + Hour + Minute',
			slots: [
				{
					label: 'Day / Date',
					example: '明天 (míngtiān) / 星期五 (xīngqīwǔ)',
					pinyin: 'tomorrow / Friday'
				},
				{
					label: 'Time of Day',
					example: '上午 (shàngwǔ) / 下午 (xiàwǔ)',
					pinyin: 'morning / afternoon'
				},
				{
					label: 'Exact Hour',
					example: '九点 (jiǔ diǎn) / 两点半 (liǎng diǎn bàn)',
					pinyin: '9:00 / 2:30'
				}
			],
			notes:
				'In Chinese time expressions, the larger unit always precedes the smaller: 明天下午三点 (Tomorrow afternoon 3:00).'
		},
		pragmaticTip: {
			title: 'Asking "几" vs "多少"',
			tip: 'Use 几 (jǐ) for small numbers under 10 or clock hours (几点, 几个人). Use 多少 (duōshao) for prices, phone numbers, or quantities over 10 (多少钱, 多少人).',
			naturalExample: {
				hanzi: '你有几个朋友？这个多少钱？',
				pinyin: 'Nǐ yǒu jǐ ge péngyou? Zhège duōshao qián?',
				english: 'How many friends do you have? How much is this?'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "Tomorrow morning at 9:00" in natural Mandarin?',
				options: ['九点明天上午', '明天上午九点', '上午九点明天', '明天九点上午'],
				correctIndex: 1,
				explanation:
					'Chinese time orders from largest to smallest unit: 明天 (tomorrow) + 上午 (morning) + 九点 (9:00).'
			},
			wordReorder: {
				sentenceHanzi: '现在下午两点半',
				sentencePinyin: 'Xiànzài xiàwǔ liǎng diǎn bàn',
				sentenceEnglish: 'Now is 2:30 PM',
				shuffledWords: ['两点半', '下午', '现在'],
				wordPinyinMap: { 现在: 'xiànzài', 下午: 'xiàwǔ', 两点半: 'liǎng diǎn bàn' }
			},
			roleplayCheck: {
				situation: 'A colleague asks what time the train arrives.',
				prompt: 'How do you answer "Tonight at 8:00"?',
				options: [
					{
						hanzi: '今天晚上八点。',
						pinyin: 'Jīntiān wǎnshang bā diǎn.',
						english: 'Tonight at 8:00.',
						isCorrect: true,
						feedback: 'Accurate! Broad (今天) -> Mid (晚上) -> Narrow (八点).'
					},
					{
						hanzi: '八点今天晚上。',
						pinyin: 'Bā diǎn jīntiān wǎnshang.',
						english: '8:00 tonight today.',
						isCorrect: false,
						feedback: 'English word order, incorrect in Mandarin.'
					},
					{
						hanzi: '二点晚上。',
						pinyin: 'Èr diǎn wǎnshang.',
						english: '2:00 evening.',
						isCorrect: false,
						feedback: 'Two errors: 2:00 uses 两点, and 8:00 is 八点.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-06',
		unitNumber: 6,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Family and Relationships',
		chineseTitle: '家庭与关系',
		subtitle: 'Possessive 的, 有 and 没有, family members, and personal details',
		milestoneGoal:
			'Describe your family, state who you live with, express possession using 有/没有, and use the associative particle 的.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'In China, family kinship terms are precise and warm. Let’s learn how to introduce family members and use the most frequent particle in Chinese: 的 (de)!'
		},
		pronunciationLab: {
			title: 'Reduplicated Family Words & Neutral Tone',
			explanation: 'Family kinship words reduplicate with the second syllable in neutral tone.',
			items: [
				{
					pinyin: 'bàba / māma',
					hanzi: '爸爸 / 妈妈',
					tone: 'Dad / Mom',
					audioText: '爸爸 妈妈',
					tip: 'First syllable holds clear lexical tone; second syllable is feather-light.'
				},
				{
					pinyin: 'gēge / dìdi',
					hanzi: '哥哥 / 弟弟',
					tone: 'Older Brother / Younger Brother',
					audioText: '哥哥 弟弟',
					tip: 'Mandarin explicitly distinguishes older vs younger siblings!'
				},
				{
					pinyin: 'jiějie / mèimei',
					hanzi: '姐姐 / 妹妹',
					tone: 'Older Sister / Younger Sister',
					audioText: '姐姐 妹妹',
					tip: 'jiě (3rd) + jie (neutral); mèi (4th) + mei (neutral).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '小明，你家有几口人？',
				pinyin: 'Xiǎomíng, nǐ jiā yǒu jǐ kǒu rén?',
				english: 'Xiao Ming, how many people are in your family?',
				audioText: '小明，你家有几口人？'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '我家有四口人：爸爸、妈妈、一个妹妹和我。你呢？',
				pinyin: 'Wǒ jiā yǒu sì kǒu rén: bàba, māma, yí ge mèimei hé wǒ. Nǐ ne?',
				english: 'My family has four people: dad, mom, a younger sister, and me. And you?',
				audioText: '我家有四口人：爸爸、妈妈、一个妹妹和我。你呢？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我没有兄弟姐妹，我是独生子。',
				pinyin: 'Wǒ méiyǒu xiōngdì jiěmèi, wǒ shì dúshēngzǐ.',
				english: 'I do not have brothers or sisters; I am an only child.',
				audioText: '我没有兄弟姐妹，我是独生子。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '你爸爸妈妈现在在伦敦吗？',
				pinyin: 'Nǐ bàba māma xiànzài zài Lúndūn ma?',
				english: 'Are your parents in London right now?',
				audioText: '你爸爸妈妈现在在伦敦吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '对，他们都在伦敦工作。',
				pinyin: 'Duì, tāmen dōu zài Lúndūn gōngzuò.',
				english: 'Yes, they both work in London.',
				audioText: '对，他们都在伦敦工作。'
			}
		],
		spotlightWords: [
			{
				hanzi: '家',
				pinyin: 'jiā',
				english: 'family / home',
				mnemonic: 'Roof radical (宀) over a pig (豕) representing shelter.',
				toneNumber: 1
			},
			{
				hanzi: '有',
				pinyin: 'yǒu',
				english: 'to have / there is',
				mnemonic: 'Hand holding meat: having possessions.',
				toneNumber: 3
			},
			{
				hanzi: '没有',
				pinyin: 'méiyǒu',
				english: 'not have / there is not',
				mnemonic: 'Never say 不有! Negation of 有 is always 没有.',
				toneNumber: 2
			},
			{
				hanzi: '都',
				pinyin: 'dōu',
				english: 'all / both',
				mnemonic: 'Places/people together in consensus.',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Possession & Existence with 有 / 没有',
			formula: 'Subject + 有 / 没有 + Noun',
			slots: [
				{ label: 'Subject', example: '我 / 他 / 我们', pinyin: 'wǒ / tā / wǒmen' },
				{ label: 'Verb', example: '有 (have) / 没有 (do not have)', pinyin: 'yǒu / méiyǒu' },
				{ label: 'Item', example: '一个妹妹 (a younger sister)', pinyin: 'yí ge mèimei' }
			],
			notes:
				'To ask a question: 你有妹妹吗？Or A-not-A question: 你有没有妹妹？Note: omit 的 with close family (我妈妈, not 我 的妈妈).'
		},
		pragmaticTip: {
			title: 'Omitting 的 with Close Relationships',
			tip: 'When speaking of family, close friends, or schools/country, native speakers drop 的: 我爸爸, 我家, 我们学校. Adding 的 (我的爸爸) sounds distant or clinical.',
			naturalExample: {
				hanzi: '这是我朋友，也是我同学。',
				pinyin: 'Zhè shì wǒ péngyou, yě shì wǒ tóngxué.',
				english: 'This is my friend, and also my classmate.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you correctly say "I do not have an older brother"?',
				options: ['我不有哥哥。', '我没有哥哥。', '我是不哥哥。', '我没哥哥是。'],
				correctIndex: 1,
				explanation:
					'The verb 有 is always negated with 没 (méiyǒu). 不有 does not exist in Mandarin.'
			},
			wordReorder: {
				sentenceHanzi: '我家有四口人',
				sentencePinyin: 'Wǒ jiā yǒu sì kǒu rén',
				sentenceEnglish: 'My family has four members',
				shuffledWords: ['四口人', '我家', '有'],
				wordPinyinMap: { 我家: 'wǒ jiā', 有: 'yǒu', 四口人: 'sì kǒu rén' }
			},
			roleplayCheck: {
				situation: 'Someone asks if you have children or siblings.',
				prompt: 'How do you say "I have two younger sisters"?',
				options: [
					{
						hanzi: '我有两个妹妹。',
						pinyin: 'Wǒ yǒu liǎng ge mèimei.',
						english: 'I have two younger sisters.',
						isCorrect: true,
						feedback: 'Excellent! You used 两 before the measure word 个, not 二.'
					},
					{
						hanzi: '我有二个妹妹。',
						pinyin: 'Wǒ yǒu èr ge mèimei.',
						english: 'I have two younger sisters.',
						isCorrect: false,
						feedback: 'Grammar warning: quantity before measure words uses 两, not 二.'
					},
					{
						hanzi: '我两妹妹。',
						pinyin: 'Wǒ liǎng mèimei.',
						english: 'I two younger sisters.',
						isCorrect: false,
						feedback: 'Missing the verb 有 and measure word 个.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-07',
		unitNumber: 7,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Food and Ordering',
		chineseTitle: '美食与点餐',
		subtitle: 'Menus, restaurant interactions, dietary restrictions, and measure words',
		milestoneGoal:
			'Call a server politely, order food from a menu, state dietary restrictions (no spicy, vegetarian), and ask for the bill.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'Food is the heart of Chinese culture! In this unit you will command a restaurant table in Beijing or Chengdu with confidence.'
		},
		pronunciationLab: {
			title: 'Calling Service Politely and Decisively',
			explanation: 'In China, calling the server out loud is standard practice, not rude.',
			items: [
				{
					pinyin: '服务员！(Fúwùyuán!)',
					hanzi: '服务员！',
					tone: '2nd + 4th + 2nd',
					audioText: '服务员！',
					tip: 'Call clearly and warmly with moderate volume: "Server!"'
				},
				{
					pinyin: '买单！(Mǎidān!)',
					hanzi: '买单！',
					tone: '3rd + 1st',
					audioText: '买单！',
					tip: 'Common phrase across China to request the bill.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '服务员，请给我们菜单！',
				pinyin: 'Fúwùyuán, qǐng gěi wǒmen càidān!',
				english: 'Server, please bring us the menu!',
				audioText: '服务员，请给我们菜单！'
			},
			{
				speaker: 'Server',
				avatarEmoji: '👨‍🍳',
				hanzi: '好的，请问两位想喝什么？',
				pinyin: 'Hǎo de, qǐngwèn liǎng wèi xiǎng hē shénme?',
				english: 'Certainly, what would the two of you like to drink?',
				audioText: '好的，请问两位想喝什么？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我要一杯冰水，还有一壶茉莉花茶。',
				pinyin: 'Wǒ yào yì bēi bīngshuǐ, hái yǒu yì hú mòlìhuā chá.',
				english: 'I would like a glass of iced water, and a pot of jasmine tea.',
				audioText: '我要一杯冰水，还有一壶茉莉花茶。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我们点一个宫保鸡丁和一个麻婆豆腐。不要太辣，谢谢！',
				pinyin: 'Wǒmen diǎn yí ge gōngbǎo jīdīng hé yí ge mápó dòufu. Bú yào tài là, xièxie!',
				english: 'We will order Kung Pao chicken and Mapo tofu. Not too spicy, thanks!',
				audioText: '我们点一个宫保鸡丁和一个麻婆豆腐。不要太辣，谢谢！'
			},
			{
				speaker: 'Server',
				avatarEmoji: '👨‍🍳',
				hanzi: '没问题，稍等马上来！',
				pinyin: 'Méi wèntí, shāoděng mǎshàng lái!',
				english: 'No problem, one moment and it will be right up!',
				audioText: '没问题，稍等马上来！'
			}
		],
		spotlightWords: [
			{
				hanzi: '服务员',
				pinyin: 'fúwùyuán',
				english: 'waiter / waitress / server',
				mnemonic: 'Service (服务) personnel (员).',
				toneNumber: 2
			},
			{
				hanzi: '点菜',
				pinyin: 'diǎncài',
				english: 'to order food',
				mnemonic: 'Select/point (点) dishes (菜).',
				toneNumber: 3
			},
			{
				hanzi: '想 / 要',
				pinyin: 'xiǎng / yào',
				english: 'would like / want',
				mnemonic: '想 is wishful/polite ("would like"); 要 is immediate action ("want").',
				toneNumber: 3
			},
			{
				hanzi: '买单',
				pinyin: 'mǎidān',
				english: 'to pay the bill',
				mnemonic: 'Buy (买) receipt list (单).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Ordering Formula: 来 + Number + Measure Word + Dish',
			formula: '来 / 要 + [Number + MW] + [Dish / Drink]',
			slots: [
				{ label: 'Verb', example: '来 (bring us) / 要 (I want)', pinyin: 'lái / yào' },
				{
					label: 'Quantity + MW',
					example: '一个 (yí ge) / 一杯 (yì bēi) / 一份 (yí fèn)',
					pinyin: 'measure words'
				},
				{ label: 'Item', example: '米饭 / 茶 / 烤鸭', pinyin: 'rice / tea / roast duck' }
			],
			notes: 'In casual dining, say 来一个…… (Bring us a...); it sounds natural and friendly!'
		},
		pragmaticTip: {
			title: 'Stating Dietary Restrictions',
			tip: 'Use 不要 (bú yào) + ingredient: 不要香菜 (no cilantro), 不要放糖 (no sugar), 我吃素 (I am vegetarian). Chinese kitchen cooks are very responsive when told up front.',
			naturalExample: {
				hanzi: '我不吃辣，请不要放辣椒。',
				pinyin: 'Wǒ bù chī là, qǐng bú yào fàng làjiāo.',
				english: 'I do not eat spicy food, please do not add chili.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'What is the natural and common way to ask for the bill in Chinese restaurants?',
				options: ['买单！(Mǎidān!)', '给钱！(Gěi qián!)', '再见！(Zàijiàn!)', '多少。(Duōshao.)'],
				correctIndex: 0,
				explanation:
					'买单 (Mǎidān) or 结账 (Jiézhàng) are the two universally accepted terms for getting the check.'
			},
			wordReorder: {
				sentenceHanzi: '我们点一个宫保鸡丁',
				sentencePinyin: 'Wǒmen diǎn yí ge gōngbǎo jīdīng',
				sentenceEnglish: 'We will order one Kung Pao chicken',
				shuffledWords: ['宫保鸡丁', '我们点', '一个'],
				wordPinyinMap: { 我们点: 'wǒmen diǎn', 一个: 'yí ge', 宫保鸡丁: 'gōngbǎo jīdīng' }
			},
			roleplayCheck: {
				situation: 'You are allergic to peanuts and ordering at a noodle shop.',
				prompt: 'How do you instruct the chef?',
				options: [
					{
						hanzi: '请不要放花生，我过敏。',
						pinyin: 'Qǐng bú yào fàng huāshēng, wǒ guòmǐn.',
						english: 'Please do not put peanuts, I am allergic.',
						isCorrect: true,
						feedback: 'Crucial life skill! Clear, polite, and unambiguous.'
					},
					{
						hanzi: '服务员，多放花生！',
						pinyin: 'Fúwùyuán, duō fàng huāshēng!',
						english: 'Server, put extra peanuts!',
						isCorrect: false,
						feedback: 'Danger: 多放 means put extra.'
					},
					{
						hanzi: '没有花生好不好？',
						pinyin: 'Méiyǒu huāshēng hǎobùhǎo?',
						english: 'No peanuts is good or not?',
						isCorrect: false,
						feedback: 'Awkward phrasing; use 请不要放.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-08',
		unitNumber: 8,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Shopping and Money',
		chineseTitle: '购物与消费',
		subtitle: 'Prices, bargaining, mobile payment (微信/支付宝), and exchanges',
		milestoneGoal:
			'Inquire prices, bargain tactfully in markets, inquire about mobile payment QR codes, and ask for colors/sizes.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'From Beijing Silk Market to high-tech mobile payments: learn how to ask prices, negotiate tactfully, and scan WeChat / Alipay with ease!'
		},
		pronunciationLab: {
			title: 'Money Units: Spoken vs Written',
			explanation: 'Mandarin has formal written currency terms and casual spoken equivalents.',
			items: [
				{
					pinyin: '块 (kuài) vs 元 (yuán)',
					hanzi: '五块钱 / 五元',
					tone: 'Spoken (块) vs Written (元)',
					audioText: '五块钱 五元',
					tip: 'In speech always say 块 (kuài); 元 is seen on price tags and receipts.'
				},
				{
					pinyin: '毛 (máo) vs 角 (jiǎo)',
					hanzi: '五毛 / 五角',
					tone: 'Dimes: 1/10th of a yuan',
					audioText: '五毛 五角',
					tip: 'Speech uses 毛 (máo); signs write 角 (jiǎo).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '老板，这件衣服多少钱？',
				pinyin: 'Lǎobǎn, zhè jiàn yīfu duōshao qián?',
				english: 'Boss, how much is this jacket?',
				audioText: '老板，这件衣服多少钱？'
			},
			{
				speaker: 'Shopkeeper',
				avatarEmoji: '🧔',
				hanzi: '这件质量特别好，两百八十块。',
				pinyin: 'Zhè jiàn zhìliàng tèbié hǎo, liǎng bǎi bāshí kuài.',
				english: 'The quality of this one is exceptional: 280 yuan.',
				audioText: '这件质量特别好，两百八十块。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '太贵了！便宜一点儿可以吗？两百块行不行？',
				pinyin: 'Tài guì le! Piányi yìdiǎnr kěyǐ ma? Liǎng bǎi kuài xíng bu xíng?',
				english: 'Too expensive! Could it be a little cheaper? Does 200 yuan work?',
				audioText: '太贵了！便宜一点儿可以吗？两百块行不行？'
			},
			{
				speaker: 'Shopkeeper',
				avatarEmoji: '🧔',
				hanzi: '哎呀，看你这么诚心，两百二给你拿走！',
				pinyin: 'Àiyā, kàn nǐ zhème chéngxīn, liǎng bǎi èr gěi nǐ ná zǒu!',
				english: 'Aiya, seeing your sincerity, take it for 220!',
				audioText: '哎呀，看你这么诚心，两百二给你拿走！'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '成交！可以微信扫码吗？',
				pinyin: 'Chéngjiāo! Kěyǐ wēixìn sǎomǎ ma?',
				english: 'Deal! Can I scan a WeChat code?',
				audioText: '成交！可以微信扫码吗？'
			}
		],
		spotlightWords: [
			{
				hanzi: '多少钱',
				pinyin: 'duōshao qián',
				english: 'how much money',
				mnemonic: 'Many (多) few (少) money (钱) — the universal shopping inquiry.',
				toneNumber: 1
			},
			{
				hanzi: '太……了',
				pinyin: 'tài... le',
				english: 'too / excessively',
				mnemonic: '太贵了 (too expensive), 太好了 (too good / fantastic).',
				toneNumber: 4
			},
			{
				hanzi: '便宜',
				pinyin: 'piányi',
				english: 'cheap / inexpensive',
				mnemonic: 'Convenient (便) fitting (宜).',
				toneNumber: 2
			},
			{
				hanzi: '扫码',
				pinyin: 'sǎomǎ',
				english: 'to scan a QR code',
				mnemonic: 'Sweep/scan (扫) code (码) — ubiquitous in China.',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Softening Requests: Adjective + 一点儿 (yìdiǎnr)',
			formula: 'Adjective + 一点儿 + 可以吗？',
			slots: [
				{
					label: 'Desired change',
					example: '便宜 (cheaper) / 大 (bigger) / 小 (smaller)',
					pinyin: 'piányi / dà / xiǎo'
				},
				{ label: 'Degree', example: '一点儿 (a little bit)', pinyin: 'yìdiǎnr' },
				{ label: 'Polite inquiry', example: '可以吗 / 行不行', pinyin: 'kěyǐ ma / xíng bu xíng' }
			],
			notes:
				'一点儿 placed after an adjective indicates "a little more of this quality" (e.g. 便宜一点儿 = a little cheaper).'
		},
		pragmaticTip: {
			title: 'Calling the Shopkeeper: 老板 (Lǎobǎn)',
			tip: 'Address small business shop owners, market vendors, and taxi drivers politely as 老板 (Lǎobǎn = Boss). It shows respect, friendliness, and immediately softens pricing negotiation.',
			naturalExample: {
				hanzi: '老板，算便宜点呗！',
				pinyin: 'Lǎobǎn, suàn piányi diǎn bei!',
				english: 'Boss, give me a little discount, come on!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'In spoken Mandarin, which word is used for "yuan" when asking or stating a price?',
				options: ['元 (yuán)', '块 (kuài)', '点 (diǎn)', '分 (fēn)'],
				correctIndex: 1,
				explanation:
					'In spoken Mandarin, 块 (kuài) is the universal word for the basic monetary unit.'
			},
			wordReorder: {
				sentenceHanzi: '便宜一点儿可以吗',
				sentencePinyin: 'Piányi yìdiǎnr kěyǐ ma',
				sentenceEnglish: 'Can it be a little cheaper?',
				shuffledWords: ['可以吗', '一点儿', '便宜'],
				wordPinyinMap: { 便宜: 'piányi', 一点儿: 'yìdiǎnr', 可以吗: 'kěyǐ ma' }
			},
			roleplayCheck: {
				situation: 'You want to pay with your mobile phone at a fruit stand.',
				prompt: 'What do you say?',
				options: [
					{
						hanzi: '老板，可以扫码支付吗？',
						pinyin: 'Lǎobǎn, kěyǐ sǎomǎ zhīfù ma?',
						english: 'Boss, can I pay by scanning a code?',
						isCorrect: true,
						feedback: 'Flawless! Modern, practical, native phrasing.'
					},
					{
						hanzi: '太贵了，不给钱！',
						pinyin: 'Tài guì le, bù gěi qián!',
						english: 'Too expensive, not giving money!',
						isCorrect: false,
						feedback: 'Rude and confrontational.'
					},
					{
						hanzi: '你家有几口人？',
						pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
						english: 'How many people in your family?',
						isCorrect: false,
						feedback: 'Completely irrelevant to paying.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-09',
		unitNumber: 9,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Places and Directions',
		chineseTitle: '地点与方向',
		subtitle: 'Locations, position words, 在, transport, and asking 怎么走',
		milestoneGoal:
			'Ask how to get to landmarks, comprehend directional responses (turn left, go straight, cross street), and locate items using 在.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Navigating Chinese cities is easy once you know the core directional compass: 前后左右 (front, back, left, right) and 往 (towards)!'
		},
		pronunciationLab: {
			title: 'Locative Suffixes: -边 (-biān) and -面 (-miàn)',
			explanation: 'Combine directions with 边 or 面 to form position nouns.',
			items: [
				{
					pinyin: '左边 (zuǒbiān) / 右边 (yòubiān)',
					hanzi: '左边 / 右边',
					tone: 'Left side / Right side',
					audioText: '左边 右边',
					tip: '左 (3rd tone dipping) / 右 (4th tone falling).'
				},
				{
					pinyin: '前边 (qiánbiān) / 后边 (hòubiān)',
					hanzi: '前边 / 后边',
					tone: 'Front / Behind',
					audioText: '前边 后边',
					tip: '前 (2nd tone rising) / 后 (4th tone falling).'
				},
				{
					pinyin: '往……走 (wǎng... zǒu)',
					hanzi: '往前走 / 往右拐',
					tone: 'Direction + Action',
					audioText: '往前走 往右拐',
					tip: '往 (towards) indicates heading vector.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '打扰一下，请问地铁站在哪里？',
				pinyin: 'Dǎrǎo yíxià, qǐngwèn dìtiězhàn zài nǎlǐ?',
				english: 'Excuse me, may I ask where the subway station is?',
				audioText: '打扰一下，请问地铁站在哪里？'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '从这里一直往前走，到红绿灯往右拐。',
				pinyin: 'Cóng zhèlǐ yìzhí wǎng qián zǒu, dào hónglǜdēng wǎng yòu guǎi.',
				english: 'From here go straight ahead; turn right at the traffic lights.',
				audioText: '从这里一直往前走，到红绿灯往右拐。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '离这里远不远？需要坐公交车吗？',
				pinyin: 'Lí zhèlǐ yuǎn bu yuǎn? Xūyào zuò gōngjiāochē ma?',
				english: 'Is it far from here? Do I need to take a bus?',
				audioText: '离这里远不远？需要坐公交车吗？'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '不远，走路五分钟就到了。就在银行对面。',
				pinyin: 'Bù yuǎn, zǒulù wǔ fēnzhōng jiù dào le. Jiù zài yínháng duìmiàn.',
				english: 'Not far, just a 5-minute walk. It is right across from the bank.',
				audioText: '不远，走路五分钟就到了。就在银行对面。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '明白了，非常感谢您！',
				pinyin: 'Míngbai le, fēicháng gǎnxiè nín!',
				english: 'Understood, thank you very much!',
				audioText: '明白了，非常感谢您！'
			}
		],
		spotlightWords: [
			{
				hanzi: '在哪里',
				pinyin: 'zài nǎlǐ',
				english: 'where is located',
				mnemonic: 'At (在) which place (哪里).',
				toneNumber: 4
			},
			{
				hanzi: '一直',
				pinyin: 'yìzhí',
				english: 'straight / continuously',
				mnemonic: 'One straight line (直) without turning.',
				toneNumber: 2
			},
			{
				hanzi: '往',
				pinyin: 'wǎng',
				english: 'towards / headed to',
				mnemonic: 'Footsteps pointing toward target.',
				toneNumber: 3
			},
			{
				hanzi: '拐 / 转',
				pinyin: 'guǎi / zhuǎn',
				english: 'to turn',
				mnemonic: 'Hand turning corner.',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Locative Sentence: Item + 在 + Location + Position',
			formula: 'Noun + 在 + Reference Place + Position Word',
			slots: [
				{ label: 'Target', example: '地铁站 (subway station)', pinyin: 'dìtiězhàn' },
				{ label: 'Verb', example: '在 (is located at)', pinyin: 'zài' },
				{
					label: 'Reference + Direction',
					example: '银行 (bank) + 对面 (opposite)',
					pinyin: 'yínháng duìmiàn'
				}
			],
			notes:
				'In Mandarin, the position word (对面, 旁边, 里面) comes AFTER the reference place: 银行对面 (opposite the bank), 学校里面 (inside the school).'
		},
		pragmaticTip: {
			title: 'Polite Openers When Asking Strangers',
			tip: 'Before asking directions, begin with 打扰一下 (Dǎrǎo yíxià = Sorry to trouble you) or 师傅，请问…… (Master/Sir, may I ask...). People will gladly stop and assist.',
			naturalExample: {
				hanzi: '打扰一下，请问去高铁站怎么走？',
				pinyin: 'Dǎrǎo yíxià, qǐngwèn qù gāotiězhàn zěnme zǒu?',
				english: 'Excuse me, how do I get to the high-speed rail station?'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "It is right opposite the bank" in Chinese?',
				options: ['就在对面银行。', '就在银行对面。', '在银行左转。', '银行往前走。'],
				correctIndex: 1,
				explanation:
					'The location noun comes first, followed by the relative position word: 银行 (bank) + 对面 (opposite).'
			},
			wordReorder: {
				sentenceHanzi: '一直往前走往右拐',
				sentencePinyin: 'Yìzhí wǎng qián zǒu wǎng yòu guǎi',
				sentenceEnglish: 'Go straight ahead then turn right',
				shuffledWords: ['往右拐', '往前走', '一直'],
				wordPinyinMap: { 一直: 'yìzhí', 往前走: 'wǎng qián zǒu', 往右拐: 'wǎng yòu guǎi' }
			},
			roleplayCheck: {
				situation: 'You are lost in Shanghai and need the subway.',
				prompt: 'What is the most courteous question?',
				options: [
					{
						hanzi: '您好，打扰一下，请问地铁站在哪里？',
						pinyin: 'Nín hǎo, dǎrǎo yíxià, qǐngwèn dìtiězhàn zài nǎlǐ?',
						english: 'Hello, excuse me, where is the subway station?',
						isCorrect: true,
						feedback: 'Superb! Politeness prefix + clear question.'
					},
					{
						hanzi: '地铁站去不去？',
						pinyin: 'Dìtiězhàn qù bu qù?',
						english: 'Go or not go to subway station?',
						isCorrect: false,
						feedback: 'This asks if the stranger is going to the subway, not where it is.'
					},
					{
						hanzi: '你现在几点？',
						pinyin: 'Nǐ xiànzài jǐ diǎn?',
						english: 'What time are you now?',
						isCorrect: false,
						feedback: 'Completely unrelated to finding directions.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-10',
		unitNumber: 10,
		partNumber: 2,
		partTitle: 'Part II: Survival Mandarin',
		stage: 'Beginner',
		title: 'Daily Needs and Social Encounters',
		chineseTitle: '日常需求',
		subtitle: 'Common requests, permissions (可以/能), apologies, and polite refusals',
		milestoneGoal:
			'Handle daily interactions, ask for permission with 可以, accept or decline invitations politely, and apologize appropriately.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'Milestone Unit 10! You have mastered Survival Mandarin. Now let’s weave invitations, polite permission, and social etiquette into seamless conversation.'
		},
		pronunciationLab: {
			title: 'Permission & Capability: 可以 (kěyǐ) vs 能 (néng) vs 会 (huì)',
			explanation:
				'These three modal verbs all mean "can" in English, but reflect different realities:',
			items: [
				{
					pinyin: '会 (huì)',
					hanzi: '我会说汉语',
					tone: 'Learned Skill',
					audioText: '我会说汉语 我会游泳',
					tip: 'Ability acquired through study/training (languages, driving, cooking).'
				},
				{
					pinyin: '能 (néng)',
					hanzi: '我现在能来',
					tone: 'Physical / Situational Possibility',
					audioText: '我现在能来 我不能喝酒',
					tip: 'Physical capability or circumstantial feasibility (time, health, rules).'
				},
				{
					pinyin: '可以 (kěyǐ)',
					hanzi: '这里可以拍照吗？',
					tone: 'Permission / Permission granted',
					audioText: '这里可以拍照吗？ 可以！',
					tip: 'Polite permission: "May I...?" / "Is it allowed?"'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '大卫，明天晚上有空吗？我们一起去吃火锅，怎么样？',
				pinyin: 'Dàwèi, míngtiān wǎnshang yǒu kòng ma? Wǒmen yìqǐ qù chī huǒguō, zěnmeyàng?',
				english: 'David, are you free tomorrow evening? How about we go eat hotpot together?',
				audioText: '大卫，明天晚上有空吗？我们一起去吃火锅，怎么样？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '太好了！我特别想去。几点见？',
				pinyin: 'Tài hǎo le! Wǒ tèbié xiǎng qù. Jǐ diǎn jiàn?',
				english: 'Awesome! I would love to go. What time shall we meet?',
				audioText: '太好了！我特别想去。几点见？'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '明晚六点半，在校门口见，行吗？',
				pinyin: 'Míngwǎn liù diǎn bàn, zài xiào ménkǒu jiàn, xíng ma?',
				english: 'Tomorrow at 6:30 PM, meet at the campus gate, works for you?',
				audioText: '明晚六点半，在校门口见，行吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '没问题，不见不散！',
				pinyin: 'Méi wèntí, bú jiàn bú sàn!',
				english: 'No problem, be there or be square!',
				audioText: '没问题，不见不散！'
			}
		],
		spotlightWords: [
			{
				hanzi: '有空',
				pinyin: 'yǒu kòng',
				english: 'to have free time',
				mnemonic: 'Have (有) open space/leisure (空).',
				toneNumber: 3
			},
			{
				hanzi: '一起',
				pinyin: 'yìqǐ',
				english: 'together',
				mnemonic: 'One (一) rising (起) in shared action.',
				toneNumber: 2
			},
			{
				hanzi: '怎么样',
				pinyin: 'zěnmeyàng',
				english: 'how about it? / what do you think?',
				mnemonic: 'How (怎样) shape/condition (样) — classic suggestion tag.',
				toneNumber: 3
			},
			{
				hanzi: '不见不散',
				pinyin: 'bú jiàn bú sàn',
				english: "don't leave until we meet / be there!",
				mnemonic: 'Not seeing (不见) not dispersing (不散).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Making Suggestions: [Proposal] + 怎么样 / 好吗？',
			formula: 'Activity + 怎么样 (zěnmeyàng) / 好吗 (hǎo ma)？',
			slots: [
				{
					label: 'Proposed Action',
					example: '我们去喝咖啡 (We go drink coffee)',
					pinyin: 'wǒmen qù hē kāfēi'
				},
				{ label: 'Suggestion Tag', example: '怎么样？ / 行吗？', pinyin: 'zěnmeyàng / xíng ma' }
			],
			notes:
				'Placing 怎么样 at the end of any statement immediately turns it into a friendly, collaborative invitation.'
		},
		pragmaticTip: {
			title: 'Softening a Refusal Tactfully',
			tip: 'Chinese people rarely say a blunt "不" (No). When you cannot attend, say: 不好意思，我明天有点事，下次一定！(Sorry, I have some errands tomorrow, definitely next time!). This preserves friendship and face.',
			naturalExample: {
				hanzi: '不好意思，我明天有点事。',
				pinyin: 'Bù hǎoyìsi, wǒ míngtiān yǒudiǎn shì.',
				english: 'Sorry, I have something going on tomorrow.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which word denotes ability learned through education or practice (e.g. speaking a language)?',
				options: ['会 (huì)', '可以 (kěyǐ)', '要 (yào)', '想 (xiǎng)'],
				correctIndex: 0,
				explanation: '会 (huì) expresses acquired skills learned through study or practice.'
			},
			wordReorder: {
				sentenceHanzi: '我们一起去吃火锅怎么样',
				sentencePinyin: 'Wǒmen yìqǐ qù chī huǒguō zěnmeyàng',
				sentenceEnglish: 'How about we go eat hotpot together?',
				shuffledWords: ['去吃火锅', '怎么样', '我们一起'],
				wordPinyinMap: { 我们一起: 'wǒmen yìqǐ', 去吃火锅: 'qù chī huǒguō', 怎么样: 'zěnmeyàng' }
			},
			roleplayCheck: {
				situation: 'A classmate invites you to dinner, but you have a test to study for.',
				prompt: 'How do you decline politely and warmly?',
				options: [
					{
						hanzi: '不好意思，我今晚要复习考试，改天我请你！',
						pinyin: 'Bù hǎoyìsi, wǒ jīnwǎn yào fùxí kǎoshì, gǎitiān wǒ qǐng nǐ!',
						english: 'Sorry, I need to study for an exam tonight, another day my treat!',
						isCorrect: true,
						feedback: 'Golden response: gentle apology + real reason + future invitation.'
					},
					{
						hanzi: '我不去，太难吃了！',
						pinyin: 'Wǒ bú qù, tài nánchī le!',
						english: 'I am not going, tastes too bad!',
						isCorrect: false,
						feedback: 'Excessively harsh and damaging to relations.'
					},
					{
						hanzi: '你是哪国人？',
						pinyin: 'Nǐ shì nǎ guó rén?',
						english: 'What nationality are you?',
						isCorrect: false,
						feedback: 'Non sequitur response.'
					}
				]
			}
		},
		xpReward: 15
	}
];
