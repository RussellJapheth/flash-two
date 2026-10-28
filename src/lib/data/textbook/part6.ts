import type { TextbookUnitData } from './types';

export const PART_6_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-29',
		unitNumber: 29,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'News, Society and Current Affairs',
		chineseTitle: '新闻与时事',
		subtitle: 'Reporting facts, citing sources with 据报道, and social developments',
		milestoneGoal:
			'Summarize a current news article, cite media sources with 据报道 / 根据, and distinguish objective events from subjective commentary.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'Entering the final tier of fluency! In Part VI, you transition from personal anecdotes to discussing macro issues, current news, technology, and culture with native sophistication.'
		},
		pronunciationLab: {
			title: 'Formal Reporting Connectors: 据 (jù) & 根据 (gēnjù)',
			explanation: 'Formal media language uses succinct classical morphemes:',
			items: [
				{
					pinyin: '据报道 (jù bàodào)',
					hanzi: '据官方媒体报道',
					tone: 'According to reports',
					audioText: '据报道 新能源汽车销量大增',
					tip: '据 = 根据 (according to). Very common headline and broadcast opener.'
				},
				{
					pinyin: '一方面……另一方面……',
					hanzi: '一方面促进了经济，另一方面也带来了挑战',
					tone: 'On one hand... on the other hand...',
					audioText: '一方面发展科技 另一方面保护环境',
					tip: 'Classic balanced analytical structure.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '大卫，今天早间新闻报道了中国新能源汽车出口创历史新高的消息，你关注了吗？',
				pinyin:
					'Dàwèi, jīntiān zǎojiān xīnwén bàodào le zhōngguó xīnnéngyuán qìchē chūkǒu chuàng lìshǐ xīngāo de xiāoxi, nǐ guānzhù le ma?',
				english:
					'David, this morning’s news reported that Chinese new-energy vehicle exports hit an all-time record high; did you catch that?',
				audioText: '大卫，今天早间新闻报道了中国新能源汽车出口创历史新高的消息，你关注了吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'看到了！据相关数据统计，绿色出行正在成为全球共识。这不仅带动了产业链升级，还创造了大量就业岗位。',
				pinyin:
					'Kàndào le! Jù xiāngguān shùjù tǒngjì, lǜsè chūxíng zhèngzài chéngwéi quánqiú gòngshí. Zhè bùjǐn dàidòng le chǎnyèliàn shēngjí, hái chuàngzào le dàliàng jiùyè gǎngwèi.',
				english:
					'I saw it! According to relevant statistics, green transport is becoming a global consensus. This not only drove industrial chain upgrades, but also created numerous employment positions.',
				audioText:
					'看到了！据相关数据统计，绿色出行正在成为全球共识。这不仅带动了产业链升级，还创造了大量就业岗位。'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '分析得很到位！不过从另一方面来看，充电桩等基础设施建设也面临着区域平衡的现实挑战。',
				pinyin:
					'Fēnxī de hěn dàowèi! Búguò cóng lìng yì fāngmiàn lái kàn, chōngdiànzhuāng děng jīchǔ shèshī jiànshè yě miànlínzhe qūyù pínghéng de xiànshí tiǎozhàn.',
				english:
					'Very astute analysis! But looking from another perspective, charging pile infrastructure construction also faces real challenges of regional balance.',
				audioText:
					'分析得很到位！不过从另一方面来看，充电桩等基础设施建设也面临着区域平衡的现实挑战。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '确实如此。科技发展与社会配套必须齐头并进。',
				pinyin: 'Quèshí rúcǐ. Kējì fāzhǎn yǔ shèhuì pèitào bìxū qítóubìngjìn.',
				english:
					'Indeed so. Technological growth and societal infrastructure must advance hand in hand.',
				audioText: '确实如此。科技发展与社会配套必须齐头并进。'
			}
		],
		spotlightWords: [
			{
				hanzi: '据报道',
				pinyin: 'jù bàodào',
				english: 'according to reports',
				mnemonic: 'Based on (据) reported words (报道).',
				toneNumber: 4
			},
			{
				hanzi: '共识',
				pinyin: 'gòngshí',
				english: 'consensus / common understanding',
				mnemonic: 'Shared (共) recognition/knowledge (识).',
				toneNumber: 4
			},
			{
				hanzi: '不仅……还……',
				pinyin: 'bùjǐn... hái...',
				english: 'not only... but furthermore...',
				mnemonic: 'Not merely (不仅) also adds (还).',
				toneNumber: 4
			},
			{
				hanzi: '面临',
				pinyin: 'miànlín',
				english: 'to face / be confronted with (challenges/tasks)',
				mnemonic: 'Face (面) approaching upon (临).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Formal Source Attribution: 据 + [Source] + 报道 / 统计',
			formula: '据 + [Source Entity] + （报道 / 统计 / 调查） ， [Fact Statement]',
			slots: [
				{
					label: 'Attribution',
					example: '据官方统计 (According to official statistics)',
					pinyin: 'jù guānfāng tǒngjì'
				},
				{
					label: 'Reported finding',
					example: '经济正在稳步复苏 (the economy is steadily recovering)',
					pinyin: 'jīngjì zhèngzài wěnbù fùsū'
				}
			],
			notes:
				'据 (jù) is the literary shorthand for 根据 (gēnjù), standard in formal news and presentations.'
		},
		pragmaticTip: {
			title: 'Formal Conversational Agreement: "确实如此"',
			tip: 'In intellectual, business, or academic conversations, replace casual 对啊 with 确实如此 (Quèshí rúcǐ = Indeed that is the case). It projects erudition and elegance.',
			naturalExample: {
				hanzi: '确实如此，我们必须重视这个问题。',
				pinyin: 'Quèshí rúcǐ, wǒmen bìxū zhòngshì zhè ge wènshuí.',
				english: 'Indeed so, we must attach high importance to this issue.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "According to official reports" in professional journalistic Chinese?',
				options: [
					'据官方报道 (Jù guānfāng bàodào)',
					'说官方 (Shuō guānfāng)',
					'因为新闻 (Yīnwèi xīnwén)',
					'有官方 (Yǒu guānfāng)'
				],
				correctIndex: 0,
				explanation:
					'据 (jù) followed by the source (官方) and 报道 (reports) is the formal journalistic standard.'
			},
			wordReorder: {
				sentenceHanzi: '科技发展与社会配套齐头并进',
				sentencePinyin: 'Kējì fāzhǎn yǔ shèhuì pèitào qítóubìngjìn',
				sentenceEnglish: 'Tech development and social facilities advance hand in hand',
				shuffledWords: ['齐头并进', '与社会配套', '科技发展'],
				wordPinyinMap: {
					科技发展: 'kējì fāzhǎn',
					与社会配套: 'yǔ shèhuì pèitào',
					齐头并进: 'qítóubìngjìn'
				}
			},
			roleplayCheck: {
				situation: 'You are summarizing a tech news item during a presentation.',
				prompt: 'What is the professional introductory sentence?',
				options: [
					{
						hanzi: '据最新行业报告统计，全球人工智能用户规模正在快速增长。',
						pinyin:
							'Jù zuìxīn hángyè bàogào tǒngjì, quánqiú réngōngzhìnéng yònghù guīmó zhèngzài kuàisù zēngzhǎng.',
						english:
							'According to the latest industry reports, the global scale of AI users is rapidly growing.',
						isCorrect: true,
						feedback: 'Authoritative, formal, and articulate.'
					},
					{
						hanzi: '老板，便宜点呗！',
						pinyin: 'Lǎobǎn, piányi diǎn bei!',
						english: 'Boss, give me a discount!',
						isCorrect: false,
						feedback: 'Market bargaining phrase, wildly inappropriate.'
					},
					{
						hanzi: '今天星期几？',
						pinyin: 'Jīntiān xīngqī jǐ?',
						english: 'What day of the week is it?',
						isCorrect: false,
						feedback: 'Irrelevant.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-30',
		unitNumber: 30,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Technology and Modern Life',
		chineseTitle: '科技与数字生活',
		subtitle: 'Artificial Intelligence, smartphones, algorithms, and digital privacy',
		milestoneGoal:
			'Debate the benefits and concerns of AI and algorithms, discuss data privacy, and explain technological trends in fluent Mandarin.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'China has transformed into a cashless, AI-driven society. Let’s explore algorithms, generative artificial intelligence, and the ethical balance of data privacy.'
		},
		pronunciationLab: {
			title: 'Tech Terminology: 人工智能 (AI) & 算法 (Algorithm)',
			explanation: 'Pronounce modern technological compounds with clarity:',
			items: [
				{
					pinyin: 'rén’gōng zhìnéng (人工智能)',
					hanzi: '人工智能 (AI)',
					tone: '2+1 + 4+2',
					audioText: '人工智能 大语言模型',
					tip: 'Commonly abbreviated in daily speech as AI.'
				},
				{
					pinyin: 'suànfǎ (算法) / yǐnsī (隐私)',
					hanzi: '算法推荐 / 数据隐私',
					tone: 'Algorithm (4+3) / Privacy (3+1)',
					audioText: '算法推荐 数据隐私',
					tip: 'Essential vocabulary for discussing modern apps and social media.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '王林，你平时在科研中用生成式人工智能工具多吗？',
				pinyin:
					'Wáng Lín, nǐ píngshí zài kěyán zhōng yòng shēngchéngshì réngōngzhìnéng gōngjù duō ma?',
				english: 'Wang Lin, do you use generative AI tools much in your scientific research?',
				audioText: '王林，你平时在科研中用生成式人工智能工具多吗？'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi:
					'非常频繁！它在文献检索和代码排错方面的效率极高。但不可否认的是，它也存在事实捏造的风险。',
				pinyin:
					'Fēicháng pínfán! Tā zài wénxiàn jiǎnsuǒ hé dàimǎ páicuò fāngmiàn de xiàolǜ jí gāo. Dàn bùkěfǒurèn de shì, tā yě cúnzài shìshí niēzào de fēngxiǎn.',
				english:
					'Very frequently! Its efficiency in literature retrieval and code debugging is extremely high. But undeniably, it also carries risks of factual hallucinations.',
				audioText:
					'非常频繁！它在文献检索和代码排错方面的效率极高。但不可否认的是，它也存在事实捏造的风险。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'确实。科技是一把双刃剑，它极大地解放了生产力，同时也对个人隐私和版权保护提出了新课题。',
				pinyin:
					'Quèshí. Kējì shì yì bǎ shuāngrènjiàn, tā jídà de jiěfàng le shēngchǎnlì, tóngshí yě duì gèrén yǐnsī hé bǎnquán bǎohù tíchū le xīn kètí.',
				english:
					'Indeed. Technology is a double-edged sword; it immensely liberated productivity, while simultaneously raising new challenges for personal privacy and copyright protection.',
				audioText:
					'确实。科技是一把双刃剑，它极大地解放了生产力，同时也对个人隐私和版权保护提出了新课题。'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '说得太深刻了。关键不在于工具本身，而在于人类如何规范和善用它。',
				pinyin:
					'Shuō de tài shēnkè le. Guānjiàn bú zàiyú gōngjù běnshēn, ér zàiyú rénlèi rúhé guīfàn hé shànyòng tā.',
				english:
					'Very profound point. The key lies not in the tool itself, but in how humanity regulates and employs it wisely.',
				audioText: '说得太深刻了。关键不在于工具本身，而在于人类如何规范和善用它。'
			}
		],
		spotlightWords: [
			{
				hanzi: '双刃剑',
				pinyin: 'shuāngrènjiàn',
				english: 'double-edged sword (idiom)',
				mnemonic: 'Double (双) blade edge (刃) sword (剑).',
				toneNumber: 1
			},
			{
				hanzi: '不可否认',
				pinyin: 'bùkěfǒurèn',
				english: 'undeniably / indisputably',
				mnemonic: 'Cannot (不可) deny or negate (否认).',
				toneNumber: 4
			},
			{
				hanzi: '不在于……而在于……',
				pinyin: 'bú zàiyú... ér zàiyú...',
				english: 'lies not in... but rather in...',
				mnemonic: 'Negates false locus (不在于) and directs to true locus (而在于).',
				toneNumber: 2
			},
			{
				hanzi: '隐私',
				pinyin: 'yǐnsī',
				english: 'privacy / private affairs',
				mnemonic: 'Concealed (隐) personal matters (私).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'The Real Root Cause: 不在于 A ， 而在于 B',
			formula: '问题的关键 + 不在于 A ， 而在于 B',
			slots: [
				{
					label: 'False Location',
					example: '不在于工具的强大 (lies not in the tool’s power)',
					pinyin: 'bú zàiyú gōngjù de qiángdà'
				},
				{
					label: 'True Pivot',
					example: '而在于人类的自律 (but rather in human self-discipline)',
					pinyin: 'ér zàiyú rénlèi de zìlǜ'
				}
			],
			notes: 'A powerhouse pattern for formal philosophical debates, leadership talks, and essays.'
		},
		pragmaticTip: {
			title: 'Metaphorical Mastery: "一把双刃剑"',
			tip: 'When addressing controversial technological or social shifts (AI, globalization, social media), calling it 一把双刃剑 (a double-edged sword) instantly establishes you as an analytical, balanced thinker.',
			naturalExample: {
				hanzi: '社交媒体是一把双刃剑。',
				pinyin: 'Shèjiāo méitǐ shì yì bǎ shuāngrènjiàn.',
				english: 'Social media is a double-edged sword.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the classic Chinese philosophical pattern to say "The essence lies not in X, but rather in Y"?',
				options: [
					'不在于……而在于…… (Bú zàiyú... ér zàiyú...)',
					'因为……所以…… (Yīnwèi... suǒyǐ...)',
					'虽然……但是…… (Suīrán... dànshì...)',
					'如果不……就…… (Rúguǒ bù... jiù...)'
				],
				correctIndex: 0,
				explanation: '不在于 A，而在于 B isolates the true determining factor in a debate.'
			},
			wordReorder: {
				sentenceHanzi: '科技发展是一把双刃剑',
				sentencePinyin: 'Kējì fāzhǎn shì yì bǎ shuāngrènjiàn',
				sentenceEnglish: 'Technological development is a double-edged sword',
				shuffledWords: ['是一把双刃剑', '科技发展'],
				wordPinyinMap: { 科技发展: 'kējì fāzhǎn', 是一把双刃剑: 'shì yì bǎ shuāngrènjiàn' }
			},
			roleplayCheck: {
				situation: 'You are discussing AI ethics at a tech meetup.',
				prompt: 'How do you say "Technology is a double-edged sword; we must regulate it wisely"?',
				options: [
					{
						hanzi: '人工智能是一把双刃剑，我们必须建立健全的法规去引导它。',
						pinyin:
							'Réngōngzhìnéng shì yì bǎ shuāngrènjiàn, wǒmen bìxū jiànlì jiànquán de fǎguī qù yǐndǎo tā.',
						english:
							'Artificial intelligence is a double-edged sword; we must establish sound regulations to guide it.',
						isCorrect: true,
						feedback: 'Sophisticated, articulate, native-level rhetoric.'
					},
					{
						hanzi: '我不喜欢吃苹果。',
						pinyin: 'Wǒ bù xǐhuan chī píngguǒ.',
						english: 'I do not like eating apples.',
						isCorrect: false,
						feedback: 'Irrelevant.'
					},
					{
						hanzi: '多少钱一个？',
						pinyin: 'Duōshao qián yí ge?',
						english: 'How much for one?',
						isCorrect: false,
						feedback: 'Shopping phrase.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-31',
		unitNumber: 31,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Culture, Values and Traditions',
		chineseTitle: '文化与传统',
		subtitle: 'Spring Festival, traditional philosophy, family values, and intercultural dialog',
		milestoneGoal:
			'Explain the cultural philosophy behind Chinese festivals (Spring Festival, Mid-Autumn), compare Western and Eastern values, and discuss filial piety (孝道) with nuance.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'To truly speak Chinese is to comprehend Chinese thought: harmony (和), family reunion (团圆), and ancestral respect. Let’s explore the profound cultural roots of the Chinese world.'
		},
		pronunciationLab: {
			title: 'Cultural Philosophy: 团圆 (tuányuán) & 和为贵 (hé wéi guì)',
			explanation: 'Core cultural catchphrases:',
			items: [
				{
					pinyin: '团圆 (tuányuán)',
					hanzi: '阖家团圆',
					tone: 'Reunion of the whole family',
					audioText: '中秋节阖家团圆 春节吃年夜饭',
					tip: 'The emotional pinnacle of Chinese holidays: gathering together in a complete circle.'
				},
				{
					pinyin: '和为贵 (hé wéi guì)',
					hanzi: '以和为贵',
					tone: 'Harmony is most precious',
					audioText: '以和为贵 礼之用和为贵',
					tip: 'Ancient Confucian core value from the Analects.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '小明，今年春节你回家过年吗？听说“春运”是人类历史上规模最大的人口流动。',
				pinyin:
					'Xiǎomíng, jīnnián chūnjié nǐ huíjiā guònián ma? Tīngshuō “chūnyùn” shì rénlèi lìshǐ shang guīmó zuì dà de rénkǒu liúdòng.',
				english:
					'Xiao Ming, are you returning home for Spring Festival this year? I heard “Chunyun” is the largest population migration in human history.',
				audioText: '小明，今年春节你回家过年吗？听说“春运”是人类历史上规模最大的人口流动。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi:
					'那必须回！不管路途多遥远、车票多难抢，除夕夜都必须赶回家吃年夜饭。对中国人来说，“团圆”是刻在骨子里的情结。',
				pinyin:
					'Nà bìxū huí! Bùguǎn lùtú duō yáoyuǎn, chēpiào duō nán qiǎng, chúxī yè dōu bìxū gǎn huíjiā chī niányèfàn. Duì zhōngguó rén lái shuō, “tuányuán” shì kè zài gǔzi lǐ de qíngjié.',
				english:
					'I absolutely must return! No matter how distant the journey or how hard tickets are to grab, on New Year’s Eve one must rush home for the reunion dinner. For Chinese people, “reunion” is a devotion etched into our bones.',
				audioText:
					'那必须回！不管路途多遥远、车票多难抢，除夕夜都必须赶回家吃年夜饭。对中国人来说，“团圆”是刻在骨子里的情结。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '这让我想起了西方人过圣诞节。虽然形式不同，但对家庭团聚的渴望是完全相通的。',
				pinyin:
					'Zhè ràng wǒ xiǎngqǐ le xīfāng rén guò shèngdànjié. Suīrán xíngshì bùtóng, dàn duì jiātíng tuánjù de kěwàng shì wánquán xiāngtōng de.',
				english:
					'This reminds me of Westerners celebrating Christmas. Although the customs differ, the yearning for family togetherness is entirely shared.',
				audioText: '这让我想起了西方人过圣诞节。虽然形式不同，但对家庭团聚的渴望是完全相通的。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '没错！这就是文化共鸣。除夕那天来我家包饺子吧，体验一把地道的年味！',
				pinyin:
					'Méi cuò! Zhè jiù shì wénhuà gòngmíng. Chúxī nà tiān lái wǒ jiā bāo jiǎozi ba, tǐyàn yì bǎ dìdao de niánwèi!',
				english:
					'Exactly! This is cultural resonance. Come to my home on New Year’s Eve to wrap dumplings and experience an authentic holiday flavor!',
				audioText: '没错！这就是文化共鸣。除夕那天来我家包饺子吧，体验一把地道的年味！'
			}
		],
		spotlightWords: [
			{
				hanzi: '团圆',
				pinyin: 'tuányuán',
				english: 'reunion (of family members)',
				mnemonic: 'Forming a group (团) round circle (圆).',
				toneNumber: 2
			},
			{
				hanzi: '不管……都……',
				pinyin: 'bùguǎn... dōu...',
				english: 'no matter (how/what)... still...',
				mnemonic: 'Regardless of obstacle (不管) outcome always holds (都).',
				toneNumber: 3
			},
			{
				hanzi: '相通',
				pinyin: 'xiāngtōng',
				english: 'interconnected / mutually resonant',
				mnemonic: 'Mutually (相) open and connected (通).',
				toneNumber: 1
			},
			{
				hanzi: '年味',
				pinyin: 'niánwèi',
				english: 'festive atmosphere / flavor of New Year',
				mnemonic: 'Year (年) flavor/feeling (味).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Unconditional Invariance: 不管 / 无论……都……',
			formula: '不管 / 无论 + [Variable Condition] ， Subject + 都 + [Action]',
			slots: [
				{
					label: 'Condition',
					example: '不管路途多遥远 (No matter how distant the journey)',
					pinyin: 'bùguǎn lùtú duō yáoyuǎn'
				},
				{
					label: 'Invariable Action',
					example: '他都要回家 (he will still return home)',
					pinyin: 'tā dōu yào huíjiā'
				}
			],
			notes:
				'Pair 不管 or 无论 with 都 to demonstrate unshakable resolve or an invariant universal truth.'
		},
		pragmaticTip: {
			title: 'Inviting to Family Festivities: "来体验一把年味！"',
			tip: 'Inviting an international friend to celebrate 春节 and 包饺子 (wrap dumplings) is the ultimate gesture of Chinese hospitality. Experiencing 年味 (New Year atmosphere) builds lifelong friendships.',
			naturalExample: {
				hanzi: '走，去我家吃年夜饭，感受一下年味！',
				pinyin: 'Zǒu, qù wǒ jiā chī niányèfàn, gǎnshòu yíxià niánwèi!',
				english: 'Come, head to my home for New Year dinner, soak up the holiday spirit!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the core emotional concept of Chinese Spring Festival and Mid-Autumn Festival representing family wholeness?',
				options: ['团圆 (tuányuán)', '上班 (shàngbān)', '买单 (mǎidān)', '打折 (dǎzhé)'],
				correctIndex: 0,
				explanation:
					'团圆 (tuányuán = family reunion/wholeness) is the central cultural heartbeat of both festivals.'
			},
			wordReorder: {
				sentenceHanzi: '不管多难都要赶回家吃年夜饭',
				sentencePinyin: 'Bùguǎn duō nán dōu yào gǎn huíjiā chī niányèfàn',
				sentenceEnglish: 'No matter how difficult one must rush home for New Year dinner',
				shuffledWords: ['都要赶回家', '不管多难', '吃年夜饭'],
				wordPinyinMap: {
					不管多难: 'bùguǎn duō nán',
					都要赶回家: 'dōu yào gǎn huíjiā',
					吃年夜饭: 'chī niányèfàn'
				}
			},
			roleplayCheck: {
				situation: 'A Chinese colleague invites you to join their family on Lunar New Year’s Eve.',
				prompt: 'How do you accept with heartfelt cultural appreciation?',
				options: [
					{
						hanzi: '太荣幸了！非常感谢您的盛情邀请，我一定带上礼物准时到！',
						pinyin:
							'Tài róngxìng le! Fēicháng gǎnxiè nín de shèngqíng yāoqǐng, wǒ yídìng dài shàng lǐwù zhǔnshí dào!',
						english:
							'Such an honor! Thank you so much for your warm hospitality, I will definitely bring a gift and arrive on time!',
						isCorrect: true,
						feedback: 'Gracious, respectful, and culturally exquisite.'
					},
					{
						hanzi: '我不喜欢吃饺子，退钱。',
						pinyin: 'Wǒ bù xǐhuan chī jiǎozi, tuì qián.',
						english: 'I do not like dumplings, refund.',
						isCorrect: false,
						feedback: 'Offensive and rude.'
					},
					{
						hanzi: '你是哪国人？',
						pinyin: 'Nǐ shì nǎ guó rén?',
						english: 'What nationality are you?',
						isCorrect: false,
						feedback: 'Incoherent.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-32',
		unitNumber: 32,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Education, Work and the Future',
		chineseTitle: '职场与未来',
		subtitle: 'Career paths, professional competition, lifelong learning, and ambitions',
		milestoneGoal:
			'Articulate multi-year career plans, discuss workplace dynamics and lifelong self-improvement, and weigh ambition against work-life balance.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'Modern career development demands adaptability and strategic foresight. In this unit, we discuss workplace evolution, career goals, and lifelong learning.'
		},
		pronunciationLab: {
			title: 'Workplace Buzzwords: 内卷 (nèijuǎn) & 终身学习',
			explanation: 'Modern sociological expressions in corporate China:',
			items: [
				{
					pinyin: '内卷 (nèijuǎn)',
					hanzi: '告别无序内卷',
					tone: 'Involution / Hyper-competition',
					audioText: '告别内卷 追求核心竞争力',
					tip: 'Describes intense, zero-sum competition; ubiquitous buzzword in Chinese society.'
				},
				{
					pinyin: '终身学习 (zhōngshēn xuéxí)',
					hanzi: '践行终身学习理念',
					tone: 'Lifelong learning',
					audioText: '终身学习 持续自我提升',
					tip: 'Formal professional value statement.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi:
					'大卫，在当前的职场环境下，很多人都在焦虑所谓的“内卷”，你对自己的未来职业规划是怎么看的？',
				pinyin:
					'Dàwèi, zài dāngqián de zhíchǎng huánjìng xià, hěn duō rén dōu zài jiāolǜ suǒwèi de “nèijuǎn”, nǐ duì zìjǐ de wèilái zhíyè guīhuà shì zěnme kàn de?',
				english:
					'David, in today’s workplace environment, many people are anxious about hyper-competition; what is your perspective on your future career plan?',
				audioText:
					'大卫，在当前的职场环境下，很多人都在焦虑所谓的“内卷”，你对自己的未来职业规划是怎么看的？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'我认为与其在低水平上盲目内耗，不如打造自己的不可替代性。我打算在深化技术的同时，把跨文化商务沟通作为核心优势。',
				pinyin:
					'Wǒ rènwéi yǔqí zài dī shuǐpíng shang mángmù nèihào, bùrú dǎzào zìjǐ de bùkě tìdàixìng. Wǒ dǎsuàn zài shēnhuà jìshù de tóngshí, bǎ kuà wénhuà shāngwù gōutōng zuòwéi héxīn yōushì.',
				english:
					'I think rather than blindly exhausting oneself in low-level churn, it is better to forge one’s own irreplaceability. I plan to deepen my technical expertise while establishing cross-cultural business communication as my core edge.',
				audioText:
					'我认为与其在低水平上盲目内耗，不如打造自己的不可替代性。我打算在深化技术的同时，把跨文化商务沟通作为核心优势。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi:
					'这个思路非常有远见！随着跨国合作越来越深入，既懂前沿科技又精通国际商务的复合型人才最受青睐。',
				pinyin:
					'Zhè ge sīlù fēicháng yǒu yuǎnjiàn! Suízhe kuàguó hézuò yuè lái yuè shēnrù, jì dǒng qiányán kējì yòu jīngtōng guójì shāngwù de fùhéxíng réncái zuì shòu qīnglài.',
				english:
					'This line of thinking has extraordinary foresight! As multinational collaboration deepens, hybrid talents who understand frontier tech and excel in international commerce are most sought after.',
				audioText:
					'这个思路非常有远见！随着跨国合作越来越深入，既懂前沿科技又精通国际商务的复合型人才最受青睐。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '借你吉言！终身学习，保持成长型思维，才是应对未来不确定性的最好方式。',
				pinyin:
					'Jiè nǐ jíyán! Zhōngshēn xuéxí, bǎochí chéngzhǎngxíng sīwéi, cái shì yìngduì wèilái bù quèdìngxìng de zuì hǎo fāngshì.',
				english:
					'From your mouth to God’s ear! Lifelong learning and maintaining a growth mindset is the finest way to navigate future uncertainties.',
				audioText: '借你吉言！终身学习，保持成长型思维，才是应对未来不确定性的最好方式。'
			}
		],
		spotlightWords: [
			{
				hanzi: '与其……不如……',
				pinyin: 'yǔqí... bùrú...',
				english: 'rather than X, it is better to Y',
				mnemonic: 'Evaluating two choices and selecting the wiser path.',
				toneNumber: 3
			},
			{
				hanzi: '不可替代',
				pinyin: 'bùkě tìdài',
				english: 'irreplaceable',
				mnemonic: 'Cannot (不可) be substituted (替代).',
				toneNumber: 4
			},
			{
				hanzi: '远见',
				pinyin: 'yuǎnjiàn',
				english: 'foresight / vision',
				mnemonic: 'Seeing far (远) ahead (见).',
				toneNumber: 3
			},
			{
				hanzi: '复合型人才',
				pinyin: 'fùhéxíng réncái',
				english: 'interdisciplinary / versatile talent',
				mnemonic: 'Compound (复合) type (型) talent (人才).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Strategic Choice: 与其 A ， 不如 B',
			formula: '与其 + [Suboptimal Choice A] ， 不如 + [Superior Choice B]',
			slots: [
				{
					label: 'Unwise alternative',
					example: '与其盲目加班 (Rather than blindly working overtime)',
					pinyin: 'yǔqí mángmù jiābān'
				},
				{
					label: 'Wiser solution',
					example: '不如提高工作效率 (it is better to boost work efficiency)',
					pinyin: 'bùrú tígāo gōngzuò xiàolǜ'
				}
			],
			notes:
				'A sharp linguistic tool for demonstrating leadership, strategy, and analytical conviction in interviews.'
		},
		pragmaticTip: {
			title: 'Receiving Good Wishes: "借你吉言！"',
			tip: 'When a partner, mentor, or friend predicts great success for you (e.g. You will definitely become a director!), answer gracefully: 借你吉言！(Jiè nǐ jíyán! = May your auspicious words come true!).',
			naturalExample: {
				hanzi: '借您吉言，我一定全力以赴！',
				pinyin: 'Jiè nín jíyán, wǒ yídìng quánlìyǐfù!',
				english: 'May your auspicious words come true, I will definitely give it my all!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "Rather than complain, it is better to take action" using Chinese paired comparative connectors?',
				options: [
					'与其抱怨，不如行动。',
					'因为抱怨，所以行动。',
					'虽然抱怨，如果行动。',
					'只有抱怨，才没有行动。'
				],
				correctIndex: 0,
				explanation: '与其 A，不如 B expresses "Rather than A, it is better to do B."'
			},
			wordReorder: {
				sentenceHanzi: '与其盲目内耗不如打造核心优势',
				sentencePinyin: 'Yǔqí mángmù nèihào bùrú dǎzào héxīn yōushì',
				sentenceEnglish: 'Rather than blindly churn it is better to forge a core edge',
				shuffledWords: ['不如打造核心优势', '与其盲目内耗'],
				wordPinyinMap: {
					与其盲目内耗: 'yǔqí mángmù nèihào',
					不如打造核心优势: 'bùrú dǎzào héxīn yōushì'
				}
			},
			roleplayCheck: {
				situation: 'During an executive job interview, you are asked about career adaptability.',
				prompt: 'How do you formulate a compelling response?',
				options: [
					{
						hanzi: '在快速变化的市场中，我认为最重要的竞争力是终身学习和跨领域整合能力。',
						pinyin:
							'Zài kuàisù biànhuà de shìchǎng zhōng, wǒ rènwéi zuì zhòngyào de jìngzhēnglì shì zhōngshēn xuéxí hé kuà lǐngyù zhěnghé nénglì.',
						english:
							'In a rapidly changing market, I believe the most crucial competitiveness is lifelong learning and cross-domain integration capability.',
						isCorrect: true,
						feedback: 'Executive-level professionalism and depth.'
					},
					{
						hanzi: '我不喜欢加班，快买单！',
						pinyin: 'Wǒ bù xǐhuan jiābān, kuài mǎidān!',
						english: 'I do not like overtime, hurry pay check!',
						isCorrect: false,
						feedback: 'Disastrous interview response.'
					},
					{
						hanzi: '请问洗手间在哪里？',
						pinyin: 'Qǐngwèn xǐshǒujiān zài nǎlǐ?',
						english: 'Where is the restroom?',
						isCorrect: false,
						feedback: 'Non-responsive.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-33',
		unitNumber: 33,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Abstract Ideas and Complex Opinions',
		chineseTitle: '深层观点',
		subtitle: 'Hypothetical situations (要是……), assumptions, and nuanced philosophical arguments',
		milestoneGoal:
			'Debate hypothetical scenarios using 要是 / 假使, weigh trade-offs (权衡利弊), and construct complex philosophical perspectives without script reliance.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'True conversational mastery means discussing what might be, what could have been, and weighing abstract concepts. Let’s tackle hypothetical scenarios and philosophical trade-offs.'
		},
		pronunciationLab: {
			title: 'Hypotheticals: 要是 (yàoshi) & 假使 (jiǎshǐ)',
			explanation: 'Spoken vs formal hypotheticals:',
			items: [
				{
					pinyin: '要是……就…… (yàoshi... jiù...)',
					hanzi: '要是没有现代医学，人类寿命会短很多',
					tone: 'Casual / Natural Hypothetical',
					audioText: '要是当初没来中国 我就不会认识你们',
					tip: 'Most common colloquial term for "if / supposing that".'
				},
				{
					pinyin: '权衡利弊 (quánhéng lìbì)',
					hanzi: '我们需要全面权衡利弊',
					tone: 'Weigh advantages and disadvantages',
					audioText: '权衡利弊 做出理性抉择',
					tip: 'Formal four-character idiom essential for decision making.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '大卫，要是给你一个机会重新选择大学专业，你还会选择计算机吗？',
				pinyin:
					'Dàwèi, yàoshi gěi nǐ yí ge jīhuì chóngxīn xuǎnzé dàxué zhuānyè, nǐ hái huì xuǎnzé jìsuànjī ma?',
				english:
					'David, if you were given an opportunity to choose your college major anew, would you still choose computer science?',
				audioText: '大卫，要是给你一个机会重新选择大学专业，你还会选择计算机吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'要是在五年前，我可能会犹豫；但站在今天全面权衡利弊之后，我依然会选择它。因为编程训练了我严谨的逻辑框架。',
				pinyin:
					'Yàoshi zài wǔ nián qián, wǒ kěnéng huì yóuyù; dàn zhàn zài jīntiān quánmiàn quánhéng lìbì zhīhòu, wǒ yīrán huì xuǎnzé tā. Yīnwèi biānchéng xùnliàn le wǒ yánjǐn de luóji kuàngjià.',
				english:
					'If it were five years ago, I might have hesitated; but standing today after comprehensively weighing advantages and disadvantages, I would still choose it. Because programming trained my rigorous logical framework.',
				audioText:
					'要是在五年前，我可能会犹豫；但站在今天全面权衡利弊之后，我依然会选择它。因为编程训练了我严谨的逻辑框架。'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '说得好。抽象的逻辑思维无论应用到哪个领域，都是强大的底层支柱。',
				pinyin:
					'Shuō de hǎo. Chōuxiàng de luóji sīwéi wúlùn yìngyòng dào nǎ ge lǐngyù, dōu shì qiángdà de dǐcéng zhīzhù.',
				english:
					'Well said. Abstract logical thinking, no matter which domain it is applied to, is a potent underlying pillar.',
				audioText: '说得好。抽象的逻辑思维无论应用到哪个领域，都是强大的底层支柱。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '正是如此。技术只是手段，思维方式才是终身受用的财富。',
				pinyin:
					'Zhèng shì rúcǐ. Jìshù zhǐ shì shǒuduàn, sīwéi fāngshì cái shì zhōngshēn shòuyòng de cáifù.',
				english:
					'Precisely so. Technology is merely a means; the way of thinking is the wealth that serves a lifetime.',
				audioText: '正是如此。技术只是手段，思维方式才是终身受用的财富。'
			}
		],
		spotlightWords: [
			{
				hanzi: '要是',
				pinyin: 'yàoshi',
				english: 'if / supposing (colloquial conditional)',
				mnemonic: 'Demand (要) it to be so (是).',
				toneNumber: 4
			},
			{
				hanzi: '权衡利弊',
				pinyin: 'quánhéng lìbì',
				english: 'to weigh pros and cons (idiom)',
				mnemonic: 'Balance scales (权衡) profits and damages (利弊).',
				toneNumber: 2
			},
			{
				hanzi: '底层',
				pinyin: 'dǐcéng',
				english: 'underlying / foundational layer',
				mnemonic: 'Bottom floor (底) tier (层).',
				toneNumber: 3
			},
			{
				hanzi: '正是如此',
				pinyin: 'zhèng shì rúcǐ',
				english: 'precisely so / exact agreement',
				mnemonic: 'Exact (正) is (是) like this (如此).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Hypothetical Conditional: 要是 + [Condition] ， 就 + [Hypothetical Result]',
			formula: '要是 + Clause 1 ， Subject + 就 / 早就 + Clause 2',
			slots: [
				{
					label: 'Hypothetical premise',
					example: '要是当初我知道 (If I had known back then)',
					pinyin: 'yàoshi dāngchū wǒ zhīdào'
				},
				{
					label: 'Hypothetical outcome',
					example: '我就不会做出那个决定 (I wouldn’t have made that choice)',
					pinyin: 'wǒ jiù bú huì zuòchū nà ge juédìng'
				}
			],
			notes: 'In speech, 要是 is warmer and more conversational than 如果.'
		},
		pragmaticTip: {
			title: 'Asserting Conviction: "正是如此"',
			tip: 'Use 正是如此 (Zhèng shì rúcǐ = Precisely so / Exactly that) to validate deep insights from your conversation partner. It immediately elevates the intellectual caliber of the dialogue.',
			naturalExample: {
				hanzi: '正是如此，这正是我们需要突破的瓶颈。',
				pinyin: 'Zhèng shì rúcǐ, zhè zhèng shì wǒmen xūyào tūpò de píngjǐng.',
				english: 'Precisely so; this is exactly the bottleneck we need to break through.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which four-character idiom means "to systematically weigh advantages and disadvantages"?',
				options: [
					'权衡利弊 (quánhéng lìbì)',
					'走马观花 (zǒumǎguānhuā)',
					'井底之蛙 (jǐngdǐzhīwā)',
					'不可思议 (bùkěsīyì)'
				],
				correctIndex: 0,
				explanation:
					'权衡利弊 literally means weighing advantages (利) and disadvantages (弊) on a scale.'
			},
			wordReorder: {
				sentenceHanzi: '技术只是手段思维方式才是财富',
				sentencePinyin: 'Jìshù zhǐ shì shǒuduàn sīwéi fāngshì cái shì cáifù',
				sentenceEnglish: 'Tech is merely a means; mindset is the true wealth',
				shuffledWords: ['思维方式才是财富', '技术只是手段'],
				wordPinyinMap: {
					技术只是手段: 'jìshù zhǐ shì shǒuduàn',
					思维方式才是财富: 'sīwéi fāngshì cái shì cáifù'
				}
			},
			roleplayCheck: {
				situation: 'Asked in a panel discussion how to make major life choices.',
				prompt: 'How do you formulate an analytical response?',
				options: [
					{
						hanzi: '面对人生的重大抉择，我们需要跳出情绪，理性地权衡利弊。',
						pinyin:
							'Miànduì rénshēng de zhòngdà juézé, wǒmen xūyào tiàochū qíngxù, lǐxìng de quánhéng lìbì.',
						english:
							'Facing major life choices, we need to step outside emotions and rationally weigh the pros and cons.',
						isCorrect: true,
						feedback: 'Profound, articulate, beautifully structured.'
					},
					{
						hanzi: '我要买两杯可乐。',
						pinyin: 'Wǒ yào mǎi liǎng bēi kělè.',
						english: 'I want to buy two colas.',
						isCorrect: false,
						feedback: 'Unrelated.'
					},
					{
						hanzi: '太贵了！',
						pinyin: 'Tài guì le!',
						english: 'Too expensive!',
						isCorrect: false,
						feedback: 'Off context.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-34',
		unitNumber: 34,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Debate and Persuasion',
		chineseTitle: '论证与说服',
		subtitle: 'Structuring arguments, addressing counterpoints, and respectful refutation',
		milestoneGoal:
			'Structure a persuasive argument using chronological discourse markers (首先, 其次, 总而言之), respectfully challenge counterclaims, and convince an audience.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Persuasion is the pinnacle of language power. Master the rhetorical architecture of Chinese discourse: stating claims, providing evidence, handling objections, and delivering a commanding synthesis.'
		},
		pronunciationLab: {
			title: 'Discourse Signposts: 首先 (shǒuxiān), 其次 (qícì), 总而言之',
			explanation: 'Rhetorical organizers that guide an audience effortlessly:',
			items: [
				{
					pinyin: '首先 (shǒuxiān) / 其次 (qícì)',
					hanzi: '首先……其次……再者……',
					tone: 'First of all... secondly... furthermore...',
					audioText: '首先明确目标 其次制定计划',
					tip: 'Gives your speech an instant feeling of order and logic.'
				},
				{
					pinyin: '总而言之 (zǒng’éryánzhī)',
					hanzi: '总而言之，势在必行',
					tone: 'In summary / All in all',
					audioText: '总而言之 合作共赢是唯一的出路',
					tip: 'Standard concluding signpost in debates and essays.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '在今天的讨论会上，针对是否应当全面推行居家远程办公，我想听听你的论证。',
				pinyin:
					'Zài jīntiān de tǎolùnhuì shang, zhēnduì shìfǒu yīngdāng quánmiàn tuīxíng jūjiā yuǎnchéng bàngōng, wǒ xiǎng tīngting nǐ de lùnzhèng.',
				english:
					'In today’s symposium, regarding whether work-from-home remote work should be comprehensively promoted, I’d like to hear your arguments.',
				audioText: '在今天的讨论会上，针对是否应当全面推行居家远程办公，我想听听你的论证。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'我认为应当采取混合弹性办公模式。首先，远程办公能大幅节省员工的通勤时间和企业的场地租金；其次，它给予员工更高的自主权。',
				pinyin:
					'Wǒ rènwéi yīngdāng cǎiqǔ hùnhé tánxìng bàngōng móshì. Shǒuxiān, yuǎnchéng bàngōng néng dàfú jièshěng yuángōng de tōngqín shíjiān hé qǐyè de chǎngdì zūjīn; qícì, tā jǐyǔ yuángōng gèng gāo de zìzhǔquán.',
				english:
					'I believe we should adopt a hybrid flexible office model. Firstly, remote work dramatically saves employees’ commuting time and corporate premises rent; secondly, it grants employees greater autonomy.',
				audioText:
					'我认为应当采取混合弹性办公模式。首先，远程办公能大幅节省员工的通勤时间和企业的场地租金；其次，它给予员工更高的自主权。'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '那如何解决团队沟通弱化和归属感降低的问题呢？',
				pinyin: 'Nà rúhé jiějué tuánduì gōutōng ruòhuà hé guīshǔgǎn jiàngdī de wèntí ne?',
				english:
					'Then how do you resolve the issues of weakened team communication and diminished sense of belonging?',
				audioText: '那如何解决团队沟通弱化和归属感降低的问题呢？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'这正是混合办公的精髓所在。每周固定两天在公司面对面协作，其余时间远程。总而言之，在效率与归属感之间找到动态平衡，才是最佳策略。',
				pinyin:
					'Zhè zhèng shì hùnhé bàngōng de jīngsuǐ suǒzài. Měi zhōu gùdìng liǎng tiān zài gōngsī miànduìmiàn xiézuò, qíyú shíjiān yuǎnchéng. Zǒng’éryánzhī, zài xiàolǜ yǔ guīshǔgǎn zhījiān zhǎodào dòngtài pínghéng, cái shì zuì jiā cèlüè.',
				english:
					'This is precisely where the essence of hybrid office lies. Fix two days a week in the office for face-to-face collaboration, and work remotely the remainder. In summary, finding a dynamic balance between efficiency and belonging is the premier strategy.',
				audioText:
					'这正是混合办公的精髓所在。每周固定两天在公司面对面协作，其余时间远程。总而言之，在效率与归属感之间找到动态平衡，才是最佳策略。'
			}
		],
		spotlightWords: [
			{
				hanzi: '首先……其次……',
				pinyin: 'shǒuxiān... qícì...',
				english: 'first of all... secondly...',
				mnemonic: 'Head first (首先) and next in order (其次).',
				toneNumber: 3
			},
			{
				hanzi: '总而言之',
				pinyin: 'zǒng’éryánzhī',
				english: 'in a nutshell / all in all / to sum up',
				mnemonic: 'Summarize (总) and say (言) it (之).',
				toneNumber: 3
			},
			{
				hanzi: '自主权',
				pinyin: 'zìzhǔquán',
				english: 'autonomy / right of self-determination',
				mnemonic: 'Self-mastery (自主) right (权).',
				toneNumber: 4
			},
			{
				hanzi: '动态平衡',
				pinyin: 'dòngtài pínghéng',
				english: 'dynamic equilibrium / balance',
				mnemonic: 'Moving state (动态) balance (平衡).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Three-Part Persuasive Structure',
			formula: '首先 + [Point 1] + ； 其次 + [Point 2] + ； 总而言之 + [Synthesis]',
			slots: [
				{
					label: 'Primary Claim',
					example: '首先，降低生产成本 (First, lower production costs)',
					pinyin: 'shǒuxiān, jiàngdī shēngchǎn chéngběn'
				},
				{
					label: 'Supporting Claim',
					example: '其次，提高用户满意度 (Second, raise customer satisfaction)',
					pinyin: 'qícì, tígāo yònghù mǎnyìdù'
				},
				{
					label: 'Closing Synthesis',
					example: '总而言之，这是双赢方案 (In sum, this is a win-win)',
					pinyin: 'zǒng’éryánzhī, zhè shì shuāngyíng fāng’àn'
				}
			],
			notes:
				'This rhetorical triad provides ironclad cohesion during presentations, negotiations, or debate panels.'
		},
		pragmaticTip: {
			title: 'Rebuttal Softener: "不可否认的是……不过……"',
			tip: 'When addressing counterarguments in a debate, validate their concern before countering: 不可否认的是，这个方案确实有成本；不过长远来看收益更大。(Undeniably this has costs; but long-term gains are far greater).',
			naturalExample: {
				hanzi: '不可否认存在困难，但办法总比困难多。',
				pinyin: 'Bùkěfǒurèn cúnzài kùnnan, dàn bànfǎ zǒng bǐ kùnnan duō.',
				english: 'Undeniably difficulties exist, but solutions always outnumber problems.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which connector signpost is universally used to summarize and deliver the conclusion of an argument?',
				options: ['总而言之 (zǒng’éryánzhī)', '比如 (bǐrú)', '虽然 (suīrán)', '因为 (yīnwèi)'],
				correctIndex: 0,
				explanation:
					'总而言之 (Zǒng’éryánzhī = In summary / In a nutshell) signals the definitive conclusion.'
			},
			wordReorder: {
				sentenceHanzi: '总而言之找到平衡才是最佳策略',
				sentencePinyin: 'Zǒng’éryánzhī zhǎodào pínghéng cái shì zuì jiā cèlüè',
				sentenceEnglish: 'In sum finding balance is the best strategy',
				shuffledWords: ['才是最佳策略', '总而言之', '找到平衡'],
				wordPinyinMap: {
					总而言之: 'zǒng’éryánzhī',
					找到平衡: 'zhǎodào pínghéng',
					才是最佳策略: 'cái shì zuì jiā cèlüè'
				}
			},
			roleplayCheck: {
				situation: 'You are concluding a proposal pitch to investors.',
				prompt: 'What is your commanding closing line?',
				options: [
					{
						hanzi: '总而言之，这个项目兼具社会价值与商业回报，期待与各位携手合作！',
						pinyin:
							'Zǒng’éryánzhī, zhège xiàngmù jiānjù shèhuì jiàzhí yǔ shāngyè huíbào, qīdài yǔ gèwèi xiéshǒu hézuò!',
						english:
							'In summary, this project combines societal value with commercial returns; looking forward to partnering with you all hand in hand!',
						isCorrect: true,
						feedback: 'Inspiring, authoritative, and persuasive.'
					},
					{
						hanzi: '你贵姓？',
						pinyin: 'Nǐ guì xìng?',
						english: 'What is your honorable surname?',
						isCorrect: false,
						feedback: 'Beginner introduction phrase.'
					},
					{
						hanzi: '退货买单！',
						pinyin: 'Tuìhuò mǎidān!',
						english: 'Return goods pay bill!',
						isCorrect: false,
						feedback: 'Nonsensical.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-35',
		unitNumber: 35,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Extended Conversation and Storytelling',
		chineseTitle: '长篇叙述',
		subtitle: 'Long-form narrative cohesion, thematic progression, and multi-topic discussions',
		milestoneGoal:
			'Deliver a sustained 5–10 minute narrative or keynote summary in Mandarin without hesitation, weaving multiple themes seamlessly with cohesive devices.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'David & Xiao Ming (大卫 & 小明)',
			avatarEmoji: '👱',
			intro:
				'In Unit 35, we train long-form stamina. Move beyond conversational ping-pong into delivering keynotes, sharing profound biographical journeys, and holding the floor with poise.'
		},
		pronunciationLab: {
			title: 'Discourse Cohesion Across Paragraphs',
			explanation: 'Bridge paragraphs using transition sentences:',
			items: [
				{
					pinyin: '话虽如此 (huà suī rúcǐ)',
					hanzi: '话虽如此，挑战依旧存在',
					tone: 'That being said / Be that as it may',
					audioText: '话虽如此 我们仍需保持警惕',
					tip: 'Acknowledges previous paragraph before pivoting to new dimension.'
				},
				{
					pinyin: '回过头来看 (huí guò tóu lái kàn)',
					hanzi: '回过头来看，这一切都是最好的安排',
					tone: 'Looking back with hindsight',
					audioText: '回过头来看 所有的付出都是值得的',
					tip: 'Classic reflective opener for philosophical summaries.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '大卫，今天是你来中国学习一周年纪念日。回顾这一年，你最大的收获是什么？',
				pinyin:
					'Dàwèi, jīntiān shì nǐ lái zhōngguó xuéxí yì zhōunián jīniànrì. Huígù zhè yì nián, nǐ zuì dà de shōuhuò shì shénme?',
				english:
					'David, today is the one-year anniversary of your arrival to study in China. Looking back on this year, what was your greatest takeaway?',
				audioText: '大卫，今天是你来中国学习一周年纪念日。回顾这一年，你最大的收获是什么？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'回过头来看，最初刚下飞机时，我甚至连“请问洗手间在哪里”都要在心里默背三遍。在这一年里，我从结结巴巴的生存对话，走到了今天能和大家探讨人工智能与中国哲学。',
				pinyin:
					'Huí guò tóu lái kàn, zuìchū gāng xià fēijī shí, wǒ shènzhì lián “qǐngwèn xǐshǒujiān zài nǎlǐ” dōu yào zài xīnlǐ mòbèi sān biàn. Zài zhè yì nián lǐ, wǒ cóng jiējiēbābā de shēngcún duìhuà, zǒudào le jīntiān néng hé dàjiā tǎolùn réngōngzhìnéng yǔ zhōngguó zhéxué.',
				english:
					'Looking back in hindsight, when I first stepped off the plane, I even had to silently rehearse “Where is the restroom” three times in my head. In this year, I progressed from stammering survival exchanges to discussing artificial intelligence and Chinese philosophy with all of you today.',
				audioText:
					'回过头来看，最初刚下飞机时，我甚至连“请问洗手间在哪里”都要在心里默背三遍。在这一年里，我从结结巴巴的生存对话，走到了今天能和大家探讨人工智能与中国哲学。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'语言不仅是一门工具，更是一扇通向不同思维维度的窗户。我不仅学会了汉语，更结识了像你这样一生的挚友。',
				pinyin:
					'Yǔyán bùjǐn shì yì mén gōngjù, gèng shì yí shàn tōngxiàng bùtóng sīwéi wéidù de chuānghu. Wǒ bùjǐn xuéhuì le hànyǔ, gèng jiéshí le xiàng nǐ zhèyàng yìshēng de zhìyǒu.',
				english:
					'Language is not only a tool, but even more a window opening onto different dimensions of thinking. I not only mastered Chinese, but also became acquainted with lifelong friends like you.',
				audioText:
					'语言不仅是一门工具，更是一扇通向不同思维维度的窗户。我不仅学会了汉语，更结识了像你这样一生的挚友。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '听得我心潮澎湃！大卫，你的中文不仅流利，更充满了真诚与温度。为你干杯！',
				pinyin:
					'Tīng de wǒ xīncháopéngpài! Dàwèi, nǐ de zhōngwén bùjǐn liúlì, gèng chōngmǎn le zhēnchéng yǔ wēndù. Wèi nǐ gānbēi!',
				english:
					'Hearing this makes my heart surge with emotion! David, your Chinese is not only fluent, but filled with sincerity and warmth. Cheers to you!',
				audioText: '听得我心潮澎湃！大卫，你的中文不仅流利，更充满了真诚与温度。为你干杯！'
			}
		],
		spotlightWords: [
			{
				hanzi: '回过头来看',
				pinyin: 'huí guò tóu lái kàn',
				english: 'looking back in hindsight',
				mnemonic: 'Turn head around (回头) to view (看).',
				toneNumber: 2
			},
			{
				hanzi: '结结巴巴',
				pinyin: 'jiējiēbābā',
				english: 'stammering / halting speech',
				mnemonic: 'Stuttering repeated syllables.',
				toneNumber: 1
			},
			{
				hanzi: '挚友',
				pinyin: 'zhìyǒu',
				english: 'bosom friend / intimate lifelong friend',
				mnemonic: 'Sincere (挚) friend (友).',
				toneNumber: 4
			},
			{
				hanzi: '干杯',
				pinyin: 'gānbēi',
				english: 'cheers! (literally: dry the cup)',
				mnemonic: 'Dry (干) cup (杯).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Long-Form Retrospective Arc: 从……走到了……',
			formula: '回过头来看 ， 我从 + [Humble Origin A] + 走到了 + [Triumphant Achievement B]',
			slots: [
				{
					label: 'Retrospective opener',
					example: '回过头来看 (Looking back)',
					pinyin: 'huí guò tóu lái kàn'
				},
				{
					label: 'Humble beginning',
					example: '从一句中文都不会 (from not knowing a single sentence)',
					pinyin: 'cóng yí jù zhōngwén dōu bú huì'
				},
				{
					label: 'Milestone reached',
					example: '走到了今天能自由交流 (reached today’s free communication)',
					pinyin: 'zǒudào le jīntiān néng zìyóu jiāoliú'
				}
			],
			notes:
				'A moving storytelling framework for anniversary speeches, memoirs, and farewell presentations.'
		},
		pragmaticTip: {
			title: 'Toasting Etiquette: "为你干杯！"',
			tip: 'When clinking glasses in China, if you wish to show deference or deep respect to an elder, mentor, or honored host, gently touch the rim of your glass slightly lower than theirs. It is a subtle sign of deep modesty.',
			naturalExample: {
				hanzi: '为我们的友谊干杯！',
				pinyin: 'Wèi wǒmen de yǒuyì gānbēi!',
				english: 'Cheers to our friendship!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "Looking back in hindsight, all efforts were worthwhile" in idiomatic Mandarin?',
				options: [
					'回过头来看，所有的付出都是值得的。',
					'前面看，付出买单。',
					'因为看头，所以值钱。',
					'要是回头，就不好。'
				],
				correctIndex: 0,
				explanation:
					'回过头来看 (Looking back in hindsight) introduces personal reflections beautifully.'
			},
			wordReorder: {
				sentenceHanzi: '语言是通向不同思维维度的窗户',
				sentencePinyin: 'Yǔyán shì tōngxiàng bùtóng sīwéi wéidù de chuānghu',
				sentenceEnglish: 'Language is a window opening onto different dimensions of thinking',
				shuffledWords: ['的窗户', '通向不同思维维度', '语言是'],
				wordPinyinMap: {
					语言是: 'yǔyán shì',
					通向不同思维维度: 'tōngxiàng bùtóng sīwéi wéidù',
					的窗户: 'de chuānghu'
				}
			},
			roleplayCheck: {
				situation: 'You are giving a farewell toast to Chinese colleagues after a year together.',
				prompt: 'How do you deliver an unforgettable toast?',
				options: [
					{
						hanzi:
							'感谢大家这一年来的包容与支持，在你们身上我看到了最美好的中国温度。为我们的友谊干杯！',
						pinyin:
							'Gǎnxiè dàjiā zhè yì nián lái de bāoróng yǔ zhīchí, zài nǐmen shēnshang wǒ kàndào le zuì měihǎo de zhōngguó wēndù. Wèi wǒmen de yǒuyì gānbēi!',
						english:
							'Thank you all for your tolerance and support over this past year; in you I witnessed the finest warmth of China. Cheers to our friendship!',
						isCorrect: true,
						feedback: 'Emotional, sincere, culturally resonant, and majestic.'
					},
					{
						hanzi: '请问多少钱？',
						pinyin: 'Qǐngwèn duōshao qián?',
						english: 'How much money please?',
						isCorrect: false,
						feedback: 'Completely inappropriate.'
					},
					{
						hanzi: '太辣了我不吃。',
						pinyin: 'Tài là le wǒ bù chī.',
						english: 'Too spicy I do not eat.',
						isCorrect: false,
						feedback: 'Off context.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-36',
		unitNumber: 36,
		partNumber: 6,
		partTitle: 'Part VI: Independent Conversation',
		stage: 'Upper Intermediate',
		title: 'Independent Mandarin',
		chineseTitle: '自主精进',
		subtitle: 'Native media, independent acquisition, dialectal awareness, and lifelong fluency',
		milestoneGoal:
			'Formulate an autonomous lifelong fluency roadmap, learn independently from Chinese TV shows, podcasts, and novels, and self-correct with native awareness.',
		estimatedMinutes: 18,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'Congratulations on reaching Unit 36: The Grand Finale of The Ideal Mandarin Textbook! You now possess the phonetic, grammatical, and conversational foundation of conversational fluency. The textbook ends here, but your journey into the vast Chinese-speaking world begins now.'
		},
		pronunciationLab: {
			title: 'The Capstone Creed: 学无止境 (Learning Knows No Bounds)',
			explanation: 'Autonomous mastery habits:',
			items: [
				{
					pinyin: '学无止境 (xué wú zhǐjìng)',
					hanzi: '学海无涯，学无止境',
					tone: 'Learning has no boundary',
					audioText: '学海无涯 循序渐进 日就月将',
					tip: 'Cherished Chinese proverb on the endless beauty of knowledge.'
				},
				{
					pinyin: '脱颖而出 (tuōyǐng’érchū)',
					hanzi: '在实践中脱颖而出',
					tone: 'Stand out with distinction',
					audioText: '学以致用 知行合一',
					tip: '知行合一 (Unity of knowledge and action) — Wang Yangming’s philosophy.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi:
					'大卫，恭喜你完整学完了三十六单元的全部课程！回顾从拼音字母到今天的独立表达，你有什么感悟？',
				pinyin:
					'Dàwèi, gōngxǐ nǐ wánzhěng xuéwán le sānshíliù dānyuán de quánbù kèchéng! Huígù cóng pīnyīn zìmǔ dào jīntiān de dúlì biǎodá, nǐ yǒu shénme gǎnwù?',
				english:
					'David, congratulations on completing all thirty-six units of the entire course! Looking back from pinyin letters to today’s independent expression, what is your reflection?',
				audioText:
					'大卫，恭喜你完整学完了三十六单元的全部课程！回顾从拼音字母到今天的独立表达，你有什么感悟？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'李老师，我最大的体会是：教材为我打下了坚实的地基，但真正的语言生命力存在于真实的生活与交流之中。',
				pinyin:
					'Lǐ lǎoshī, wǒ zuì dà de tǐhuì shì: jiàocái wèi wǒ dǎxià le jiānshí de dìjī, dàn zhēnzhèng de yǔyán shēngmìnglì cúnzài yú zhēnshí de shēnghuó yǔ jiāoliú zhīzhōng.',
				english:
					'Teacher Li, my greatest realization is: the textbook laid a solid bedrock for me, but true linguistic vitality lives in authentic life and human interaction.',
				audioText:
					'李老师，我最大的体会是：教材为我打下了坚实的地基，但真正的语言生命力存在于真实的生活与交流之中。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'我现在每天听中文播客、看中国纪录片，遇到生词也能自如地用已知词汇去向朋友请教。我感觉自己已经真正获得了“自主学习能力”。',
				pinyin:
					'Wǒ xiànzài měitiān tīng zhōngwén bōkè, kàn zhōngguó jìlùpiàn, yùdào shēngcí yě néng zìrú de yòng yǐzhī cíhuì qù xiàng péngyou qǐngjiào. Wǒ gǎnjué zìjǐ yǐjīng zhēnzhèng huòdé le “zìzhǔ xuéxí nénglì”.',
				english:
					'I now listen to Chinese podcasts and watch Chinese documentaries every day; when encountering unfamiliar words, I can naturally use known vocabulary to ask friends for clarification. I feel I have genuinely gained “independent learning ability”.',
				audioText:
					'我现在每天听中文播客、看中国纪录片，遇到生词也能自如地用已知词汇去向朋友请教。我感觉自己已经真正获得了“自主学习能力”。'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi:
					'“授人以鱼不如授人以渔”。你已经掌握了这把钥匙。愿中文成为你探索更广阔世界的翅膀，海阔凭鱼跃，天高任鸟飞！',
				pinyin:
					'“Shòurényǐyú bùrú shòurényǐyú”. Nǐ yǐjīng zhǎngwò le zhè bǎ yàoshi. Yuàn zhōngwén chéngwéi nǐ tànsuǒ gèng guǎngkuò shìjiè de chìbǎng, hǎikuò píng yú yuè, tiāngāo rèn niǎo fēi!',
				english:
					'“Giving a man a fish is not as good as teaching him to fish.” You have already mastered this key. May Chinese become wings for you to explore a wider world: the ocean is wide for fish to leap, the sky is high for birds to soar!',
				audioText:
					'“授人以鱼不如授人以渔”。你已经掌握了这把钥匙。愿中文成为你探索更广阔世界的翅膀，海阔凭鱼跃，天高任鸟飞！'
			}
		],
		spotlightWords: [
			{
				hanzi: '学无止境',
				pinyin: 'xué wú zhǐjìng',
				english: 'learning knows no bounds (idiom)',
				mnemonic: 'Study (学) has no (无) end boundary (止境).',
				toneNumber: 2
			},
			{
				hanzi: '知行合一',
				pinyin: 'zhī xíng hé yī',
				english: 'unity of knowledge and action (philosophy)',
				mnemonic: 'Knowledge (知) and deeds (行) unite as one (合一).',
				toneNumber: 1
			},
			{
				hanzi: '自主',
				pinyin: 'zìzhǔ',
				english: 'independent / autonomous',
				mnemonic: 'Self (自) master (主).',
				toneNumber: 4
			},
			{
				hanzi: '地基',
				pinyin: 'dìjī',
				english: 'bedrock / foundation of a building',
				mnemonic: 'Earth (地) base foundation (基).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'The Milestone Graduation Proverb',
			formula: '授人以鱼不如授人以渔',
			slots: [
				{
					label: 'Proverb',
					example: '授人以鱼不如授人以渔',
					pinyin: 'Shòurényǐyú bùrú shòurényǐyú'
				},
				{
					label: 'Translation',
					example: 'Teach a man to fish rather than give him a fish',
					pinyin: 'Empowering independent fluency'
				}
			],
			notes:
				'Completing all 36 units means you no longer depend on drills; you possess the tools to learn directly from the Chinese-speaking world.'
		},
		pragmaticTip: {
			title: 'The Lifelong Fluency Ritual: Daily Exposure',
			tip: 'Keep your Mandarin alive with 15 minutes of authentic daily exposure: listen to a Chinese podcast (如《声东击西》或《忽左忽右》), chat with Chinese language partners, or read articles on WeChat/Xiaohongshu. Language is a muscle that flourishes with everyday life.',
			naturalExample: {
				hanzi: '路虽远，行则将至；事虽难，做则必成。',
				pinyin: 'Lù suī yuǎn, xíng zé jiāng zhì; shì suī nán, zuò zé bì chéng.',
				english:
					'Though the journey is long, keep walking and you will arrive; though the task is arduous, keep doing and it will succeed.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'What is the core principle of Unit 36 regarding long-term fluency?',
				options: [
					'A textbook is the foundation, but genuine fluency comes from authentic independent engagement with the living language.',
					'Once 36 units are finished, a learner never needs to practice again.',
					'Handwriting thousands of characters is required before speaking.',
					'Fluency means translating every word word-for-word from English.'
				],
				correctIndex: 0,
				explanation:
					'Autonomous immersion, active listening, and spontaneous communication in real life solidify permanent fluency.'
			},
			wordReorder: {
				sentenceHanzi: '学无止境愿中文成为你探索世界的翅膀',
				sentencePinyin: 'Xué wú zhǐjìng yuàn zhōngwén chéngwéi nǐ tànsuǒ shìjiè de chìbǎng',
				sentenceEnglish: 'Learning has no bounds; may Chinese become wings to explore the world',
				shuffledWords: ['愿中文成为你', '探索世界的翅膀', '学无止境'],
				wordPinyinMap: {
					学无止境: 'xué wú zhǐjìng',
					愿中文成为你: 'yuàn zhōngwén chéngwéi nǐ',
					探索世界的翅膀: 'tànsuǒ shìjiè de chìbǎng'
				}
			},
			roleplayCheck: {
				situation: 'You are celebrating graduation from the 36-unit Mandarin course.',
				prompt: 'How do you express gratitude to your teachers and peers?',
				options: [
					{
						hanzi:
							'衷心感谢老师和朋友们的一路陪伴！三十六单元只是起点，我会带着对中文的热爱继续前行。',
						pinyin:
							'Zhōngxīn gǎnxiè lǎoshī hé péngyoumen de yílù péibàn! Sānshíliù dānyuán zhǐ shì qǐdiǎn, wǒ huì dàizhe duì zhōngwén de rè’ài jìxù qiánxíng.',
						english:
							'Heartfelt thanks to teachers and friends for accompanying me all the way! 36 units is merely the starting line; I will continue forward carrying my love for Chinese.',
						isCorrect: true,
						feedback: 'Inspiring, poetic, and commemorative graduation speech.'
					},
					{
						hanzi: '买单！多少钱？',
						pinyin: 'Mǎidān! Duōshao qián?',
						english: 'Check! How much money?',
						isCorrect: false,
						feedback: 'Completely out of place.'
					},
					{
						hanzi: '我头很疼。',
						pinyin: 'Wǒ tóu hěn téng.',
						english: 'My head hurts.',
						isCorrect: false,
						feedback: 'Irrelevant.'
					}
				]
			}
		},
		xpReward: 15
	}
];
