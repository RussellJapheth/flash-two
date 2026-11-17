import type { TextbookUnitData } from './types';

export const PART_5_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-23',
		unitNumber: 23,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'How Native Speakers Really Talk',
		chineseTitle: '地道口语',
		subtitle: 'Contractions, dropped subjects, informal phrasing (啥/咋), and natural rhythm',
		milestoneGoal:
			'Decipher reduced speech and natural contractions (啥 for 什么, 咋 for 怎么, 不用 for 不用), and omit redundant grammatical pronouns like native speakers do.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'Textbook Chinese is often stiff and robotic. In real life, native speakers drop subjects, contract words, and use punchy colloquial shortcuts!'
		},
		pronunciationLab: {
			title: 'Everyday Spoken Reductions: 啥 (shá) & 咋 (zǎ)',
			explanation: 'In casual conversation across Northern and Central China:',
			items: [
				{
					pinyin: '啥 (shá) = 什么 (shénme)',
					hanzi: '干啥呢？ / 吃啥？',
					tone: 'What? / Doing what?',
					audioText: '干啥呢？ 你说什么呢？',
					tip: '干啥 (gàn shá) = What are you doing? Much punchier than 你在做什么.'
				},
				{
					pinyin: '咋 (zǎ) = 怎么 (zěnme)',
					hanzi: '咋办？ / 咋样？',
					tone: 'How? / What to do?',
					audioText: '咋办？ 咋样？',
					tip: '咋办 (zǎ bàn) = What should we do now? Essential colloquial reflex.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '大卫！干啥去啊？走这么急？',
				pinyin: 'Dàwèi! Gàn shá qù a? Zǒu zhème jí?',
				english: 'David! What are you off to do? Walking so fast?',
				audioText: '大卫！干啥去啊？走这么急？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '去食堂吃饭！刚才下课晚了，饿扁了都。',
				pinyin: 'Qù shítáng chīfàn! Gāngcái xiàkè wǎn le, è biǎn le dōu.',
				english:
					'Heading to the cafeteria to eat! Class let out late just now; I’m totally starved.',
				audioText: '去食堂吃饭！刚才下课晚了，饿扁了都。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '正好我也没吃呢，一块儿呗！今儿想吃点啥？',
				pinyin: 'Zhènghǎo wǒ yě méi chī ne, yíkuàir bei! Jīnr xiǎng chī diǎn shá?',
				english:
					'Convenient timing, I haven’t eaten either, let’s go together! What do you feel like having today?',
				audioText: '正好我也没吃呢，一块儿呗！今儿想吃点啥？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '二楼那个瓦罐汤咋样？听说特别鲜。',
				pinyin: 'Èr lóu nà ge wǎguàntāng zǎyàng? Tīngshuō tèbié xiān.',
				english: 'How about that clay pot soup on the second floor? Heard it is super savory.',
				audioText: '二楼那个瓦罐汤咋样？听说特别鲜。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '行啊，走起！',
				pinyin: 'Xíng a, zǒu qǐ!',
				english: 'Sounds good, let’s roll!',
				audioText: '行啊，走起！'
			}
		],
		spotlightWords: [
			{
				hanzi: '干啥',
				pinyin: 'gàn shá',
				english: 'doing what? (casual for 做什么)',
				mnemonic: 'Do (干) what (啥).',
				toneNumber: 4
			},
			{
				hanzi: '咋办',
				pinyin: 'zǎ bàn',
				english: 'what should we do? / what now?',
				mnemonic: 'How (咋) handle/manage (办).',
				toneNumber: 3
			},
			{
				hanzi: '走起',
				pinyin: 'zǒu qǐ',
				english: 'let’s go! / let’s roll!',
				mnemonic: 'Walk (走) rise into action (起).',
				toneNumber: 3
			},
			{
				hanzi: '一块儿',
				pinyin: 'yíkuàir',
				english: 'together (with Beijing erhua r-sound)',
				mnemonic: 'One piece/block (块) together with retroflex r.',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Subject Dropping & Inversion in Fast Speech',
			formula: '[Omitted Subject] + Action / Inverted Order',
			slots: [
				{
					label: 'Formal Textbook',
					example: '我要去食堂吃饭 (I want to go eat)',
					pinyin: 'wǒ yào qù shítáng chīfàn'
				},
				{
					label: 'Native Spoken Reality',
					example: '去食堂！ / 饿死了都！',
					pinyin: 'qù shítáng! / è sǐ le dōu!'
				}
			],
			notes:
				'In real conversation, when context is shared, pronouns (我, 你, 他) are regularly dropped for speed and natural rhythm.'
		},
		pragmaticTip: {
			title: 'Using "走起！" & "妥了！"',
			tip: 'Younger native speakers seal informal agreements with snappy idioms: 走起！(Zǒu qǐ! = Let’s move!) or 妥了！(Tuǒ le! = All set / Good to go!). Using these shows cultural immersion.',
			naturalExample: {
				hanzi: '搞定，妥了！',
				pinyin: 'Gǎodìng, tuǒ le!',
				english: 'Done deal, all sorted out!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'In casual conversational Mandarin, what does the word "啥" (shá) substitute for?',
				options: ['什么 (shénme)', '为什么 (wèishénme)', '什么时候 (shénme shíhou)', '哪里 (nǎlǐ)'],
				correctIndex: 0,
				explanation: '啥 (shá) is the widespread casual spoken equivalent of 什么 (what).'
			},
			wordReorder: {
				sentenceHanzi: '二楼那个瓦罐汤咋样',
				sentencePinyin: 'Èr lóu nà ge wǎguàntāng zǎyàng',
				sentenceEnglish: 'How about that clay pot soup on the second floor?',
				shuffledWords: ['咋样', '二楼那个', '瓦罐汤'],
				wordPinyinMap: { 二楼那个: 'èr lóu nà ge', 瓦罐汤: 'wǎguàntāng', 咋样: 'zǎyàng' }
			},
			roleplayCheck: {
				situation: 'Your roommate walks in looking flustered.',
				prompt: 'How do you ask "What happened?" in punchy, casual Chinese?',
				options: [
					{
						hanzi: '咋了？发生啥事儿了？',
						pinyin: 'Zǎ le? Fāshēng shá shìr le?',
						english: 'What’s up? What happened?',
						isCorrect: true,
						feedback: '100% authentic native casual phrasing.'
					},
					{
						hanzi: '您好，请问您是谁？',
						pinyin: 'Nín hǎo, qǐngwèn nín shì shéi?',
						english: 'Hello, may I ask who you are?',
						isCorrect: false,
						feedback: 'Bizarrely formal and distant to ask a roommate.'
					},
					{
						hanzi: '我不吃辣。',
						pinyin: 'Wǒ bù chī là.',
						english: 'I do not eat spicy.',
						isCorrect: false,
						feedback: 'Non sequitur.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-24',
		unitNumber: 24,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'Particles and Subtle Meaning',
		chineseTitle: '语气助词',
		subtitle: 'Mastering 了, 呢, 吧, 啊, 嘛, 呗, and subtle emotional nuance',
		milestoneGoal:
			'Deploy conversational modal particles (嘛, 呗, 啊, 吧) to convey nuance: obviousness (嘛), resigned acceptance (呗), warmth, or casual agreement.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Modal particles (语气助词) are the emotional soul of Mandarin. A single syllable at the end of a sentence completely alters your tone from authoritative to warm or witty!'
		},
		pronunciationLab: {
			title: 'The Spectrum of Sentence-Final Particles',
			explanation: 'Notice how tone of voice changes with each particle:',
			items: [
				{
					pinyin: '嘛 (ma) — Obvious / "As you know"',
					hanzi: '大家都是朋友嘛！',
					tone: 'Common Sense / Obvious Truth',
					audioText: '大家都是朋友嘛 慢慢来嘛',
					tip: 'Implies "Come on, this is obvious / why worry?".'
				},
				{
					pinyin: '呗 (bei) — Resigned Acceptance / "Might as well"',
					hanzi: '那就这样呗！',
					tone: 'Nonchalant / Willing Acceptance',
					audioText: '那就这样呗 想去就去呗',
					tip: 'Signals "Whatever works / if that is the case, so be it".'
				},
				{
					pinyin: '啊 (a) — Emotion / Enthusiasm / Softener',
					hanzi: '好啊！ / 真漂亮啊！',
					tone: 'Vocal Exclamation & Warmth',
					audioText: '好啊 真漂亮啊 是啊',
					tip: 'Blends into preceding vowels: 好啊 (hǎo wa), 对啊 (duì ya).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '王林，周末的户外徒步活动，好像要下小雨，我们还去不去？',
				pinyin:
					'Wáng Lín, zhōumò de hùwài túbù huódòng, hǎoxiàng yào xià xiǎoyǔ, wǒmen hái qù bu qù?',
				english:
					'Wang Lin, regarding this weekend’s outdoor hiking event, it seems it might drizzle; are we still going?',
				audioText: '王林，周末的户外徒步活动，好像要下小雨，我们还去不去？'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '去呗！带把伞就行了嘛。小雨里爬山别有一番风景呢！',
				pinyin: 'Qù bei! Dài bǎ sǎn jiù xíng le ma. Xiǎoyǔ lǐ páshān bié yǒu yì fān fēngjǐng ne!',
				english:
					'Sure, let’s go! Just bring an umbrella and it will be totally fine. Hiking in light rain has its own unique charm, you know!',
				audioText: '去呗！带把伞就行了嘛。小雨里爬山别有一番风景呢！'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '哈哈，也是啊！既然大家都这么积极，那我可不能拖后腿。',
				pinyin: 'Hāhā, yě shì a! Jìrán dàjiā dōu zhème jījí, nà wǒ kě bù néng tuō hòutuǐ.',
				english:
					'Haha, true indeed! Since everyone is so enthusiastic, I certainly can’t drag my feet.',
				audioText: '哈哈，也是啊！既然大家都这么积极，那我可不能拖后腿。'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '这就对啦！明天早上八点地铁站集合哦。',
				pinyin: 'Zhè jiù duì la! Míngtiān zǎoshang bā diǎn dìtiězhàn jíhé o.',
				english: 'That’s the spirit! Meet at 8:00 AM at the subway station, don’t forget!',
				audioText: '这就对啦！明天早上八点地铁站集合哦。'
			}
		],
		spotlightWords: [
			{
				hanzi: '嘛',
				pinyin: 'ma',
				english: 'particle: "of course / as is obvious"',
				mnemonic: 'Mouth radical (口) stating the clear common truth.',
				toneNumber: 5
			},
			{
				hanzi: '呗',
				pinyin: 'bei',
				english: 'particle: "might as well / so be it"',
				mnemonic: 'Mouth radical (口) yielding casually to situation.',
				toneNumber: 5
			},
			{
				hanzi: '哦',
				pinyin: 'o',
				english: 'particle: friendly reminder / realization',
				mnemonic: 'Soft friendly reminder at clause end.',
				toneNumber: 5
			},
			{
				hanzi: '别有一番',
				pinyin: 'bié yǒu yì fān',
				english: 'to possess a distinctive / unique flavor',
				mnemonic: 'Differently (别) have (有) one special kind (一番).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Particle Nuance Comparison',
			formula: 'Statement + [Particle Choice]',
			slots: [
				{ label: '去吧 (qù ba)', example: 'Go ahead! / Let’s go.', pinyin: 'Friendly suggestion' },
				{
					label: '去呗 (qù bei)',
					example: 'Might as well go, why not?',
					pinyin: 'Casual acquiescence'
				},
				{
					label: '去嘛 (qù ma)',
					example: 'Come on, obviously you should go!',
					pinyin: 'Persuasive / Obviousness'
				},
				{
					label: '去啊 (qù a)',
					example: 'Definitely go! / Why wouldn’t you?',
					pinyin: 'Enthusiastic agreement'
				}
			],
			notes:
				'Mastering this subtle four-way contrast is what elevates speech from "grammatically correct" to "strikingly native".'
		},
		pragmaticTip: {
			title: 'Reassuring with 嘛: "大家都是自己人嘛"',
			tip: 'When someone feels shy, awkward, or guilty about a minor mistake, say: 没事，大家都是自己人嘛！(No worries, we’re all our own people / family here!). It instantly melts social tension.',
			naturalExample: {
				hanzi: '别客气嘛，都是朋友！',
				pinyin: 'Bié kèqi ma, dōu shì péngyou!',
				english: 'Come on, don’t be formal, we’re all friends!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which particle conveys that a statement is an obvious, self-evident truth or encourages the listener to see common sense?',
				options: ['嘛 (ma)', '吗 (ma)', '了 (le)', '过 (guo)'],
				correctIndex: 0,
				explanation:
					'The modal particle 嘛 (neutral tone) highlights that something is obvious or should be taken as common sense (e.g. 慢慢来嘛).'
			},
			wordReorder: {
				sentenceHanzi: '带把伞就行了嘛',
				sentencePinyin: 'Dài bǎ sǎn jiù xíng le ma',
				sentenceEnglish: 'Just bringing an umbrella will be totally fine',
				shuffledWords: ['就行了嘛', '带把伞'],
				wordPinyinMap: { 带把伞: 'dài bǎ sǎn', 就行了嘛: 'jiù xíng le ma' }
			},
			roleplayCheck: {
				situation: 'Your friend is debating whether to apply for a dream scholarship.',
				prompt: 'How do you encourage them casually: "Try applying, what’s there to lose?"',
				options: [
					{
						hanzi: '试一下呗！反正也没什么损失嘛。',
						pinyin: 'Shì yíxià bei! Fǎnzhèng yě méi shénme sǔnshī ma.',
						english: 'Give it a shot, why not! In any case, there’s nothing to lose.',
						isCorrect: true,
						feedback: 'Master-level colloquial pairing of 呗 and 嘛.'
					},
					{
						hanzi: '我不去吃火锅。',
						pinyin: 'Wǒ bú qù chī huǒguō.',
						english: 'I will not go eat hotpot.',
						isCorrect: false,
						feedback: 'Completely off topic.'
					},
					{
						hanzi: '你是哪国人？',
						pinyin: 'Nǐ shì nǎ guó rén?',
						english: 'What nationality are you?',
						isCorrect: false,
						feedback: 'Irrelevant.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-25',
		unitNumber: 25,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'Natural Vocabulary and Collocations',
		chineseTitle: '自然搭配',
		subtitle: 'Verb-object pairings, near-synonyms, and authentic colloquial combinations',
		milestoneGoal:
			'Use authentic idiomatic verb-object collocations (打交道, 抽时间, 帮个忙, 开玩笑) instead of awkward word-for-word translations from English.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'In Mandarin, words don’t live alone; they travel in fixed pairs (搭配). Using the natural partner verb transforms your Chinese from translation-ese into fluent speech.'
		},
		pronunciationLab: {
			title: 'Verb-Object Idiomatic Collocations (离合词 & 搭配)',
			explanation: 'Mandarin verbs lock with specific objects:',
			items: [
				{
					pinyin: '打交道 (dǎ jiāodào)',
					hanzi: '跟人打交道',
					tone: 'Interact / Deal with people',
					audioText: '我经常跟客户打交道',
					tip: 'Never say "和人做交易" for human interaction; use 跟……打交道.'
				},
				{
					pinyin: '抽时间 (chōu shíjiān)',
					hanzi: '抽时间出来聚聚',
					tone: 'Carve out time / Find time',
					audioText: '我抽时间去看看你',
					tip: '抽 literally means "to pull/extract" time from a packed schedule.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '大卫，听说你最近换了新的岗位，适应得怎么样？',
				pinyin: 'Dàwèi, tīngshuō nǐ zuìjìn huàn le xīn de gǎngwèi, shìyìng de zěnmeyàng?',
				english: 'David, I heard you recently changed to a new post; how are you adapting?',
				audioText: '大卫，听说你最近换了新的岗位，适应得怎么样？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'挺好的！以前光跟电脑打交道，现在需要经常跟不同部门的同事打交道，沟通能力提升了不少。',
				pinyin:
					'Tǐng hǎo de! Yǐqián guāng gēn diànnǎo dǎ jiāodào, xiànzài xūyào jīngcháng gēn bùtóng bùmén de tóngshì dǎ jiāodào, gōutōng nénglì tíshēng le bù shǎo.',
				english:
					'Pretty well! In the past I solely dealt with computers; now I often need to interact with colleagues from different departments, and my communication skills have improved a lot.',
				audioText:
					'挺好的！以前光跟电脑打交道，现在需要经常跟不同部门的同事打交道，沟通能力提升了不少。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '那太棒了！周末能抽时间出来一起喝杯茶吗？',
				pinyin: 'Nà tài bàng le! Zhōumò néng chōu shíjiān chūlai yìqǐ hē bēi chá ma?',
				english:
					'That’s fantastic! Can you carve out some time this weekend to have a cup of tea together?',
				audioText: '那太棒了！周末能抽时间出来一起喝杯茶吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '没问题，我随时奉陪！',
				pinyin: 'Méi wèntí, wǒ suíshí fèngpéi!',
				english: 'No problem at all, I’m at your service anytime!',
				audioText: '没问题，我随时奉陪！'
			}
		],
		spotlightWords: [
			{
				hanzi: '打交道',
				pinyin: 'dǎ jiāodào',
				english: 'to deal with / come into contact with',
				mnemonic: 'Strike (打) mutual paths (交道).',
				toneNumber: 3
			},
			{
				hanzi: '抽时间',
				pinyin: 'chōu shíjiān',
				english: 'to carve out / find time',
				mnemonic: 'Extract (抽) time (时间) from busy day.',
				toneNumber: 1
			},
			{
				hanzi: '随时奉陪',
				pinyin: 'suíshí fèngpéi',
				english: 'happy to accompany anytime (polite & friendly)',
				mnemonic: 'At any time (随时) offer company (奉陪).',
				toneNumber: 2
			},
			{
				hanzi: '开玩笑',
				pinyin: 'kāi wánxiào',
				english: 'to make a joke / tease',
				mnemonic: 'Open (开) playful laugh (玩笑).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Relational Interaction: 跟……打交道 (Interacting with X)',
			formula: 'Subject + 经常 / 很少 + 跟 + [Person / Group] + 打交道',
			slots: [
				{ label: 'Subject', example: '销售员 (Salespeople)', pinyin: 'xiàoshòuyuán' },
				{ label: 'Counterpart', example: '跟客户 (with clients)', pinyin: 'gēn kèhù' },
				{ label: 'Collocation', example: '打交道 (deal/interact with)', pinyin: 'dǎ jiāodào' }
			],
			notes:
				'This idiom applies to dealing with people, organizations, or even inanimate fields (跟数据打交道 = dealing with data).'
		},
		pragmaticTip: {
			title: 'The Warm Agreement: "随时奉陪！"',
			tip: 'When a friend or respected colleague invites you out to coffee or sports, replying 随时奉陪！(Suíshí fèngpéi! = I am gladly at your service anytime!) is witty, polite, and enthusiastically hospitable.',
			naturalExample: {
				hanzi: '只要你叫我，我随时奉陪！',
				pinyin: 'Zhǐyào nǐ jiào wǒ, wǒ suíshí fèngpéi!',
				english: 'Whenever you call, I’m game anytime!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "carve out time from a busy schedule" using the natural Mandarin collocation?',
				options: [
					'抽时间 (chōu shíjiān)',
					'做时间 (zuò shíjiān)',
					'拉时间 (lā shíjiān)',
					'买时间 (mǎi shíjiān)'
				],
				correctIndex: 0,
				explanation: 'The authentic collocation is 抽时间 (extract/find time from a schedule).'
			},
			wordReorder: {
				sentenceHanzi: '我经常跟不同的人打交道',
				sentencePinyin: 'Wǒ jīngcháng gēn bùtóng de rén dǎ jiāodào',
				sentenceEnglish: 'I frequently interact with different people',
				shuffledWords: ['打交道', '我经常', '跟不同的人'],
				wordPinyinMap: {
					我经常: 'wǒ jīngcháng',
					跟不同的人: 'gēn bùtóng de rén',
					打交道: 'dǎ jiāodào'
				}
			},
			roleplayCheck: {
				situation: 'A friend invites you to play ping-pong on Sunday.',
				prompt: 'How do you accept warmly and playfully?',
				options: [
					{
						hanzi: '周日我有空，随时奉陪！看谁打得过谁。',
						pinyin: 'Zhōurì wǒ yǒu kòng, suíshí fèngpéi! Kàn shéi dǎ de guò shéi.',
						english: 'I’m free on Sunday, game anytime! Let’s see who beats who.',
						isCorrect: true,
						feedback: 'Vibrant, natural, playful, and friendly.'
					},
					{
						hanzi: '对不起，我叫大卫。',
						pinyin: 'Duìbuqǐ, wǒ jiào Dàwèi.',
						english: 'Sorry, I am called David.',
						isCorrect: false,
						feedback: 'Inappropriate beginner phrase.'
					},
					{
						hanzi: '太贵了！',
						pinyin: 'Tài guì le!',
						english: 'Too expensive!',
						isCorrect: false,
						feedback: 'Nonsensical response.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-26',
		unitNumber: 26,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'Social and Cultural Communication',
		chineseTitle: '社交礼仪',
		subtitle: 'Face (面子), hospitality, indirect refusals, and humble responses (客气)',
		milestoneGoal:
			'Navigate Chinese social rituals: handle bill-fighting etiquette graciously, accept compliments with cultural modesty, and decline offers without causing loss of face.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'In Chinese culture, relationships (关系) and respect (面子) guide conversation. Learn the art of modesty, hospitality, and fighting for the check!'
		},
		pronunciationLab: {
			title: 'The Art of Modesty: 哪里哪里 (Nǎlǐ nǎlǐ)',
			explanation: 'When receiving praise, native speakers soften it with modest deflectors:',
			items: [
				{
					pinyin: '哪里哪里 (Nǎlǐ nǎlǐ)',
					hanzi: '哪里哪里，您过奖了',
					tone: 'Modest deflection of praise',
					audioText: '哪里哪里 您过奖了',
					tip: 'Literally "Where? Where?" — meaning "You flatter me, I still have much to learn".'
				},
				{
					pinyin: '我来！我来！ (Wǒ lái! Wǒ lái!)',
					hanzi: '这顿饭我来请！',
					tone: 'Insisting on treating friends',
					audioText: '今天我买单 谁也别跟我抢',
					tip: 'In China, fighting for the bill is a cherished demonstration of generous friendship.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '服务员，买单！今天这顿饭我来请，小明你千万别跟我争！',
				pinyin:
					'Fúwùyuán, mǎidān! Jīntiān zhè dùn fàn wǒ lái qǐng, Xiǎomíng nǐ qiānwàn bié gēn wǒ zhēng!',
				english:
					'Server, the bill! Today’s meal is my treat; Xiao Ming, you must not fight me for it!',
				audioText: '服务员，买单！今天这顿饭我来请，小明你千万别跟我争！'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '那怎么行！你是客人，来到北京哪有让你买单的道理？我来付！',
				pinyin:
					'Nà zěnme xíng! Nǐ shì kèrén, lái dào Běijīng nǎ yǒu ràng nǐ mǎidān de dàolǐ? Wǒ lái fù!',
				english:
					'How could that be! You are the guest; having come to Beijing, how could there be any reason to let you pay? I will pay!',
				audioText: '那怎么行！你是客人，来到北京哪有让你买单的道理？我来付！'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '上次是你请客，这次无论如何得轮到我了，要不然我真不好意思了。',
				pinyin:
					'Shàng cì shì nǐ qǐngkè, zhè cì wúlùnrúhé děi lúndào wǒ le, yàobùrán wǒ zhēn bù hǎoyìsi le.',
				english:
					'Last time was your treat; this time it is absolutely my turn, otherwise I will really feel uncomfortable.',
				audioText: '上次是你请客，这次无论如何得轮到我了，要不然我真不好意思了。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '哈哈！大卫你现在太懂中国规矩了。那行，今天算你的，下次去伦敦你可得请我吃大餐！',
				pinyin:
					'Hāhā! Dàwèi nǐ xiànzài tài dǒng zhōngguó guīju le. Nà xíng, jīntiān suàn nǐ de, xià cì qù Lúndūn nǐ kě děi qǐng wǒ chī dàcān!',
				english:
					'Haha! David, you understand Chinese customs so well now. All right, today is on you, but next time I go to London you must treat me to a feast!',
				audioText: '哈哈！大卫你现在太懂中国规矩了。那行，今天算你的，下次去伦敦你可得请我吃大餐！'
			}
		],
		spotlightWords: [
			{
				hanzi: '客气',
				pinyin: 'kèqi',
				english: 'polite / formal / courteous',
				mnemonic: 'Guest (客) demeanor (气).',
				toneNumber: 4
			},
			{
				hanzi: '过奖',
				pinyin: 'guòjiǎng',
				english: 'to overpraise / flatter (polite formula)',
				mnemonic: 'Excessive (过) praise (奖).',
				toneNumber: 4
			},
			{
				hanzi: '请客',
				pinyin: 'qǐngkè',
				english: 'to treat someone to a meal / be the host',
				mnemonic: 'Invite (请) guests (客).',
				toneNumber: 3
			},
			{
				hanzi: '无论如何',
				pinyin: 'wúlùnrúhé',
				english: 'no matter what / under any circumstance',
				mnemonic: 'No matter (无论) in what way (如何).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Reciprocal Courtesy: 轮到……了 (It is X’s turn)',
			formula: '这次无论如何得轮到 + Person + 了',
			slots: [
				{ label: 'Timing', example: '这次 (this time)', pinyin: 'zhè cì' },
				{ label: 'Necessity', example: '无论如何得 (must by all means)', pinyin: 'wúlùnrúhé děi' },
				{ label: 'Turn-taker', example: '轮到我了 (be my turn)', pinyin: 'lúndào wǒ le' }
			],
			notes:
				'Chinese hospitality is reciprocal. Keeping mental tabs on whose turn it is to treat builds enduring mutual trust and respect.'
		},
		pragmaticTip: {
			title: 'Receiving Gifts: Politely Declining Twice',
			tip: 'When someone gives you a gift or red envelope, the customary etiquette is to gently decline once or twice (哎呀，这太客气了，真不用！) before accepting with both hands and expressing sincere thanks. Accepting too eagerly is considered impolite.',
			naturalExample: {
				hanzi: '哎呀，您太客气了，非常感谢！',
				pinyin: 'Àiyā, nín tài kèqi le, fēicháng gǎnxiè!',
				english: 'Aiya, you are far too kind, thank you so much!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'When a Chinese native compliments your spoken Chinese with "你的中文真好！", what is the most culturally graceful response?',
				options: [
					'哪里哪里，您过奖了，还在努力学呢！',
					'对，我是世界上最好的。',
					'多少钱？',
					'买单吧！'
				],
				correctIndex: 0,
				explanation:
					'哪里哪里，您过奖了 (You flatter me, I am still working on it) embodies the classic Chinese virtue of modesty.'
			},
			wordReorder: {
				sentenceHanzi: '这次无论如何得轮到我了',
				sentencePinyin: 'Zhè cì wúlùnrúhé děi lúndào wǒ le',
				sentenceEnglish: 'This time it absolutely must be my turn',
				shuffledWords: ['得轮到我了', '这次无论如何'],
				wordPinyinMap: { 这次无论如何: 'zhè cì wúlùnrúhé', 得轮到我了: 'děi lúndào wǒ le' }
			},
			roleplayCheck: {
				situation: 'You are having lunch with a Chinese friend who tries to pay.',
				prompt: 'How do you insist on paying because they treated last time?',
				options: [
					{
						hanzi: '上次是你请的，今天一定得我来！别抢了。',
						pinyin: 'Shàng cì shì nǐ qǐng de, jīntiān yídìng děi wǒ lái! Bié qiǎng le.',
						english: 'Last time was your treat; today it definitely must be me! Don’t fight me.',
						isCorrect: true,
						feedback: 'Classic, warm Chinese dining etiquette.'
					},
					{
						hanzi: '我没钱，你付吧。',
						pinyin: 'Wǒ méi qián, nǐ fù ba.',
						english: 'I have no money, you pay.',
						isCorrect: false,
						feedback: 'Awkward and ungracious.'
					},
					{
						hanzi: '头很疼。',
						pinyin: 'Tóu hěn téng.',
						english: 'Headache.',
						isCorrect: false,
						feedback: 'Unrelated.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-27',
		unitNumber: 27,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'Following Real Conversations',
		chineseTitle: '听懂真实对话',
		subtitle: 'Multi-party conversations, interruptions, background noise, and implied meaning',
		milestoneGoal:
			'Follow an unscripted multi-party conversation, infer unstated implications (言外之意), and react appropriately to overlapping banter.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'In real life, people speak over each other, change topics mid-sentence, and imply meanings without saying them out loud. Let’s learn how to follow the flow!'
		},
		pronunciationLab: {
			title: 'Deciphering "Subtext" (言外之意)',
			explanation: 'Chinese communication is high-context; pay attention to particles and tone:',
			items: [
				{
					pinyin: '可能吧 (kěnéng ba) / 再看吧 (zài kàn ba)',
					hanzi: '再看吧 / 改天吧',
					tone: 'Polite / Gentle "Probably No"',
					audioText: '改天吧 到时候再看吧',
					tip: 'When invited and someone says 到时候再看吧 (We’ll see when the time comes), it usually means "unlikely / no".'
				},
				{
					pinyin: '难怪 (nánguài) / 原来如此 (yuánláirúcǐ)',
					hanzi: '难怪！原来是这样。',
					tone: 'Sudden Understanding',
					audioText: '难怪他没来 原来如此',
					tip: '难怪 = "No wonder!" Expresses sudden clarity connecting clues.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '你们听说了吗？隔壁部门的老张今天突然请假了。',
				pinyin: 'Nǐmen tīngshuō le ma? Gébì bùmén de Lǎo Zhāng jīntiān tūrán qǐngjià le.',
				english:
					'Have you all heard? Old Zhang from the next department suddenly took a day off today.',
				audioText: '你们听说了吗？隔壁部门的老张今天突然请假了。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '难怪！早上去茶水间没看见他泡普洱茶。听说他儿子今天高考出分呢。',
				pinyin:
					'Nánguài! Zǎoshang qù cháshuǐjiān méi kànjiàn tā pào pǔ’ěrchá. Tīngshuō tā érzi jīntiān gāokǎo chū fēn ne.',
				english:
					'No wonder! I didn’t see him brewing Pu’er tea in the pantry this morning. I heard his son gets his college entrance exam scores today.',
				audioText: '难怪！早上去茶水间没看见他泡普洱茶。听说他儿子今天高考出分呢。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '原来如此！难怪他昨天一整天都坐立不安的，高考可是全家的大事啊。',
				pinyin:
					'Yuánláirúcǐ! Nánguài tā zuótiān yì zhěng tiān dōu zuòlìbù’ān de, gāokǎo kě shì quánjiā de dàshì a.',
				english:
					'Oh, I see! No wonder he was restless on pins and needles all day yesterday; Gaokao is a momentous family event!',
				audioText: '原来如此！难怪他昨天一整天都坐立不安的，高考可是全家的大事啊。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '可不是嘛！希望他儿子能考上心仪的第一志愿大学。',
				pinyin: 'Kě bú shì ma! Xīwàng tā érzi néng kǎoshàng xīnyí de dì-yī zhìyuàn dàxué.',
				english: 'Isn’t that the truth! Hope his son gets into his dream top-choice university.',
				audioText: '可不是嘛！希望他儿子能考上心仪的第一志愿大学。'
			}
		],
		spotlightWords: [
			{
				hanzi: '难怪',
				pinyin: 'nánguài',
				english: 'no wonder / that explains it',
				mnemonic: 'Hard (难) to blame (怪) or wonder about.',
				toneNumber: 2
			},
			{
				hanzi: '原来如此',
				pinyin: 'yuánláirúcǐ',
				english: 'so that’s how it is! / oh, I see!',
				mnemonic: 'Original (原来) like this (如此).',
				toneNumber: 2
			},
			{
				hanzi: '可不是嘛',
				pinyin: 'kě bú shì ma',
				english: 'isn’t that so! / absolutely! (enthusiastic agreement)',
				mnemonic: 'Could it not be so indeed!',
				toneNumber: 3
			},
			{
				hanzi: '坐立不安',
				pinyin: 'zuòlìbù’ān',
				english: 'restless / on pins and needles',
				mnemonic: 'Sitting (坐) standing (立) not at peace (不安).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Sudden Realization: 难怪……原来……',
			formula: '难怪 + [Observed Oddity] ， 原来 + [Real Explanation]',
			slots: [
				{
					label: 'Observed Fact',
					example: '难怪他今天这么高兴 (No wonder he is so happy today)',
					pinyin: 'nánguài tā jīntiān zhème gāoxìng'
				},
				{
					label: 'Unveiled Reason',
					example: '原来他升职了 (turns out he got promoted)',
					pinyin: 'yuánlái tā shēngzhí le'
				}
			],
			notes:
				'Connect an observation you couldn’t explain before with newly discovered background context.'
		},
		pragmaticTip: {
			title: 'Agreement Tag: "可不是嘛！"',
			tip: 'When someone expresses an opinion you wholeheartedly resonate with, instead of saying 对 (boring), exclaim: 可不是嘛！(Kě bú shì ma! = Exactly! Isn’t that just the truth!). It sounds lively and completely fluent.',
			naturalExample: {
				hanzi: '今天的风太大了！— 可不是嘛，冻坏了。',
				pinyin: 'Jīntiān de fēng tài dà le! — Kě bú shì ma, dònghuài le.',
				english: 'The wind today is huge! — Tell me about it, freezing cold.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the natural Chinese expression for "No wonder!" when discovering the reason behind something unexpected?',
				options: ['难怪！(Nánguài!)', '没有！(Méiyǒu!)', '不可以！(Bù kěyǐ!)', '不好！(Bù hǎo!)'],
				correctIndex: 0,
				explanation: '难怪 (Nánguài) or 怪不得 (Guàibude) both translate to "No wonder!"'
			},
			wordReorder: {
				sentenceHanzi: '难怪他一整天都坐立不安',
				sentencePinyin: 'Nánguài tā yì zhěng tiān dōu zuòlìbù’ān',
				sentenceEnglish: 'No wonder he was restless all day long',
				shuffledWords: ['都坐立不安', '难怪他', '一整天'],
				wordPinyinMap: {
					难怪他: 'nánguài tā',
					一整天: 'yì zhěng tiān',
					都坐立不安: 'dōu zuòlìbù’ān'
				}
			},
			roleplayCheck: {
				situation:
					'Your coworker mentions that the metro line was halted due to signal repairs, explaining why everyone was late.',
				prompt: 'What is your spontaneous reaction?',
				options: [
					{
						hanzi: '难怪！原来是地铁信号坏了，我说今天怎么这么多人迟到。',
						pinyin:
							'Nánguài! Yuánlái shì dìtiě xìnhào huài le, wǒ shuō jīntiān zěnme zhème duō rén chídào.',
						english:
							'No wonder! Turns out the subway signals broke; I was wondering why so many people were late today.',
						isCorrect: true,
						feedback: 'Perfect native pairing of 难怪 and 原来是.'
					},
					{
						hanzi: '买两张发票！',
						pinyin: 'Mǎi liǎng zhāng fāpiào!',
						english: 'Buy two receipts!',
						isCorrect: false,
						feedback: 'Completely off point.'
					},
					{
						hanzi: '你好吗？',
						pinyin: 'Nǐ hǎo ma?',
						english: 'How are you?',
						isCorrect: false,
						feedback: 'Bizarre response.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-28',
		unitNumber: 28,
		partNumber: 5,
		partTitle: 'Part V: Natural Mandarin',
		stage: 'Intermediate',
		title: 'Real-World Communication',
		chineseTitle: '应对突发状况',
		subtitle: 'Resolving misunderstandings (误会), negotiations, and handling difficulties',
		milestoneGoal:
			'Resolve interpersonal misunderstandings using 误会 and 解释, negotiate practical solutions calmly, and de-escalate tension.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Milestone Unit 28! Life brings hitches, lost luggage, missed deliveries, and misunderstandings. In this unit, you will learn to negotiate solutions with confidence and poise.'
		},
		pronunciationLab: {
			title: 'De-escalation Vocabulary: 误会 (wùhuì) & 解释 (jiěshì)',
			explanation: 'Calm tones defuse tension immediately:',
			items: [
				{
					pinyin: '纯属误会 (chúnshǔ wùhuì)',
					hanzi: '这完全是一场误会',
					tone: 'It is purely a misunderstanding',
					audioText: '这完全是一场误会 让我解释一下',
					tip: '误 (mistaken) + 会 (understanding) = misunderstanding.'
				},
				{
					pinyin: '协商解决 (xiéshāng jiějué)',
					hanzi: '我们友好协商解决',
					tone: 'Negotiate a mutual solution',
					audioText: '我们友好协商解决 看看怎么补救',
					tip: 'Professional formula in commerce and dispute resolution.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Delivery Courier',
				avatarEmoji: '🛵',
				hanzi: '您好，您的生鲜快递我放到楼下快递柜了，麻烦您自己取一下。',
				pinyin:
					'Nín hǎo, nín de shēngxiān kuàidì wǒ fàng dào lóuxià kuàidìguì le, máfan nín zìjǐ qǔ yíxià.',
				english:
					'Hello, I placed your fresh produce delivery in the downstairs parcel locker; please pick it up yourself.',
				audioText: '您好，您的生鲜快递我放到楼下快递柜了，麻烦您自己取一下。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'师傅您好，我订单上特别备注了“送货上门”，因为里面有冷冻冰淇淋，天气这么热放柜子里会融化的。',
				pinyin:
					'Shīfu nín hǎo, wǒ dìngdān shang tèbié bèizhù le “sònghuò shàngmén”, yīnwèi lǐmiàn yǒu lěngdòng bīngqílín, tiānqì zhème rè fàng guìzi lǐ huì rónghuà de.',
				english:
					'Hello master courier, my order specifically noted “doorstep delivery”; because there is frozen ice cream inside, in such hot weather it will melt in the locker.',
				audioText:
					'师傅您好，我订单上特别备注了“送货上门”，因为里面有冷冻冰淇淋，天气这么热放柜子里会融化的。'
			},
			{
				speaker: 'Delivery Courier',
				avatarEmoji: '🛵',
				hanzi: '哎呀真不好意思！刚才送件太赶没看清备注。您稍等十分钟，我马上掉头给您送上楼！',
				pinyin:
					'Àiyā zhēn bù hǎoyìsi! Gāngcái sòngjiàn tài gǎn méi kànqīng bèizhù. Nín shāoděng shí fēnzhōng, wǒ mǎshàng diàotóu gěi nín sòng shàng lóu!',
				english:
					'Aiya, truly sorry! Just now I was in such a rush delivering that I didn’t see the note clearly. Please wait ten minutes; I will turn around right away and bring it upstairs for you!',
				audioText: '哎呀真不好意思！刚才送件太赶没看清备注。您稍等十分钟，我马上掉头给您送上楼！'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '没事没事，大热天您送货也辛苦了，多谢理解！',
				pinyin: 'Méi shì méi shì, dà rè tiān nín sònghuò yě xīnkǔ le, duōxiè lǐjiě!',
				english:
					'No problem at all, delivering in such hot weather is hard work for you too; thank you so much for understanding!',
				audioText: '没事没事，大热天您送货也辛苦了，多谢理解！'
			}
		],
		spotlightWords: [
			{
				hanzi: '误会',
				pinyin: 'wùhuì',
				english: 'misunderstanding / to misunderstand',
				mnemonic: 'Mistaken (误) meeting/cognition (会).',
				toneNumber: 4
			},
			{
				hanzi: '辛苦了',
				pinyin: 'xīnkǔ le',
				english: 'thank you for your hard work / you’ve worked hard',
				mnemonic: 'Bitter (辛) labor (苦) — universally appreciated courtesy in China.',
				toneNumber: 1
			},
			{
				hanzi: '协商',
				pinyin: 'xiéshāng',
				english: 'to negotiate / talk things over calmly',
				mnemonic: 'Harmonious (协) discussion (商).',
				toneNumber: 2
			},
			{
				hanzi: '备注',
				pinyin: 'bèizhù',
				english: 'special note / remark on an order',
				mnemonic: 'Prepare (备) notes (注).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Diplomatic Problem-Solving: Clear Reason + Empathetic Closure',
			formula: 'Clarify fact calmly + “……您看能帮忙处理一下吗？” + 辛苦您了',
			slots: [
				{
					label: 'Fact with calm tone',
					example: '我订单上备注了送货上门',
					pinyin: 'wǒ dìngdān shang bèizhù le sònghuò shàngmén'
				},
				{
					label: 'Reason for concern',
					example: '因为冰淇淋会融化',
					pinyin: 'yīnwèi bīngqílín huì rónghuà'
				},
				{
					label: 'Empathetic closure',
					example: '天气热您也辛苦了',
					pinyin: 'tiānqì rè nín yě xīnkǔ le'
				}
			],
			notes:
				'In Chinese service interactions, showing empathy for the worker’s hard work (您辛苦了) gets your problem solved ten times faster than shouting.'
		},
		pragmaticTip: {
			title: 'The Magic Phrase: "辛苦了" (Xīnkǔ le)',
			tip: 'Say 辛苦了！ to taxi drivers, delivery couriers, cleaners, and colleagues when receiving assistance. It acknowledges their labor and instantly wins goodwill.',
			naturalExample: {
				hanzi: '师傅，送到门口就行，您辛苦了！',
				pinyin: 'Shīfu, sòng dào ménkǒu jiù xíng, nín xīnkǔ le!',
				english: 'Master, right to the doorway is fine, thank you for your hard work!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the universally appreciated Chinese courtesy to thank someone for performing a service or strenuous task on your behalf?',
				options: [
					'辛苦了！(Xīnkǔ le!)',
					'慢走！(Màn zǒu!)',
					'别说了！(Bié shuō le!)',
					'不贵！(Bú guì!)'
				],
				correctIndex: 0,
				explanation:
					'辛苦了 (You worked hard / Thank you for your labor) is the classic respectful expression in China.'
			},
			wordReorder: {
				sentenceHanzi: '大热天送货您也辛苦了',
				sentencePinyin: 'Dà rè tiān sònghuò nín yě xīnkǔ le',
				sentenceEnglish: 'Delivering goods in hot weather is hard work for you too',
				shuffledWords: ['您也辛苦了', '大热天送货'],
				wordPinyinMap: { 大热天送货: 'dà rè tiān sònghuò', 您也辛苦了: 'nín yě xīnkǔ le' }
			},
			roleplayCheck: {
				situation: 'A flight is delayed due to weather and you need to rebook a connection.',
				prompt: 'How do you approach the counter calmly and politely?',
				options: [
					{
						hanzi:
							'您好，打扰一下，因为天气延误我可能赶不上下一趟联程，请问能帮忙改签吗？辛苦您了。',
						pinyin:
							'Nín hǎo, dǎrǎo yíxià, yīnwèi tiānqì yánwù wǒ kěnéng gǎn bu shàng xià yí tàng liánchéng, qǐngwèn néng bāngmáng gǎiqiān ma? Xīnkǔ nín le.',
						english:
							'Hello, excuse me, due to weather delays I might miss my next connecting flight, could you please help me rebook? Thank you for your hard work.',
						isCorrect: true,
						feedback: 'Diplomatic, calm, constructive, and respectful.'
					},
					{
						hanzi: '退钱！我不坐了！',
						pinyin: 'Tuì qián! Wǒ bú zuò le!',
						english: 'Refund money! I am not flying!',
						isCorrect: false,
						feedback: 'Unproductive aggression.'
					},
					{
						hanzi: '你吃早饭了吗？',
						pinyin: 'Nǐ chī zǎofàn le ma?',
						english: 'Did you eat breakfast?',
						isCorrect: false,
						feedback: 'Inappropriate small talk.'
					}
				]
			}
		},
		xpReward: 15
	}
];
