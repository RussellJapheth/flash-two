import type { TextbookUnitData } from './types';

export const PART_1_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-01',
		unitNumber: 1,
		partNumber: 1,
		partTitle: 'Part I: Foundations',
		stage: 'Absolute Beginner',
		title: 'Discovering Mandarin',
		chineseTitle: '发现汉语',
		subtitle: 'Pinyin, characters, and the four tones of Simplified Mandarin',
		milestoneGoal:
			'Understand the architecture of Standard Mandarin (普通话), read basic Pinyin with tone contours, and greet someone naturally.',
		estimatedMinutes: 12,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'欢迎！Welcome to Mandarin Chinese. Mandarin is phonetic in speech (Pinyin) and semantic in writing (Simplified Characters). Every syllable carries meaning and a distinctive pitch contour!'
		},
		pronunciationLab: {
			title: 'The Four Lexical Tones + Neutral Tone',
			explanation:
				'Mandarin is tonal: the same syllable spoken with different pitches means entirely different words.',
			items: [
				{
					pinyin: 'mā',
					hanzi: '妈',
					tone: '1st Tone (High Level · 55)',
					audioText: '妈',
					tip: 'Keep high, even, and singing like a flat note: "mother"'
				},
				{
					pinyin: 'má',
					hanzi: '麻',
					tone: '2nd Tone (Rising · 35)',
					audioText: '麻',
					tip: 'Like asking "What?": rises steadily: "hemp"'
				},
				{
					pinyin: 'mǎ',
					hanzi: '马',
					tone: '3rd Tone (Dipping · 214)',
					audioText: '马',
					tip: 'Dips down low in the throat before rising: "horse"'
				},
				{
					pinyin: 'mà',
					hanzi: '骂',
					tone: '4th Tone (Sharp Falling · 51)',
					audioText: '骂',
					tip: 'Decisive command like "Stop!": drops sharply: "scold"'
				},
				{
					pinyin: 'ma',
					hanzi: '吗',
					tone: 'Neutral Tone (Light & Short)',
					audioText: '吗',
					tip: 'Whisper-soft, takes pitch from syllable before it: question particle'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '你好！欢迎来到中文世界。',
				pinyin: 'Nǐ hǎo! Huānyíng lái dào zhōngwén shìjiè.',
				english: 'Hello! Welcome to the world of Chinese.',
				audioText: '你好！欢迎来到中文世界。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '李老师好！中文难不难？',
				pinyin: 'Lǐ lǎoshī hǎo! Zhōngwén nán bu nán?',
				english: 'Hello Teacher Li! Is Chinese difficult?',
				audioText: '李老师好！中文难不难？'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '汉字很有趣，声调需要多听、多练。',
				pinyin: 'Hànzì hěn yǒuqù, shēngdiào xūyào duō tīng, duō liàn.',
				english: 'Characters are fascinating; tones simply need plenty of listening and practice.',
				audioText: '汉字很有趣，声调需要多听、多练。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '好！我准备好了。',
				pinyin: 'Hǎo! Wǒ zhǔnbèi hǎo le.',
				english: 'Great! I am ready.',
				audioText: '好！我准备好了。'
			}
		],
		spotlightWords: [
			{
				hanzi: '汉语',
				pinyin: 'Hànyǔ',
				english: 'Mandarin Chinese language',
				mnemonic: 'Han people (汉) + spoken tongue (语).',
				toneNumber: 4
			},
			{
				hanzi: '拼音',
				pinyin: 'pīnyīn',
				english: 'Pinyin (romanized phonetic system)',
				mnemonic: 'Piecing together (拼) sounds (音).',
				toneNumber: 1
			},
			{
				hanzi: '声调',
				pinyin: 'shēngdiào',
				english: 'tone (of Chinese syllable)',
				mnemonic: 'Sound (声) melody/tune (调).',
				toneNumber: 1
			},
			{
				hanzi: '你好',
				pinyin: 'nǐ hǎo',
				english: 'hello (literally: you good)',
				mnemonic: 'You (你) + Good (好).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Core Mandarin Sentence Order (S + V + O)',
			formula: 'Subject + Verb + Object',
			slots: [
				{ label: 'Subject', example: '我 (wǒ)', pinyin: 'wǒ (I / me)' },
				{ label: 'Verb', example: '学 (xué)', pinyin: 'xué (study)' },
				{ label: 'Object', example: '汉语 (Hànyǔ)', pinyin: 'Hànyǔ (Chinese)' }
			],
			notes:
				'Mandarin basic sentence structure mirrors English S-V-O. There are no verb conjugations, no grammatical genders, and no plural noun declensions!'
		},
		pragmaticTip: {
			title: 'Tone Stability over Volume',
			tip: 'Beginners often speak louder when attempting the 4th falling tone. In Mandarin, pitch height is pitch frequency, not shouting! Keep your volume steady and drop pitch sharply.',
			naturalExample: {
				hanzi: '李老师好！',
				pinyin: 'Lǐ lǎoshī hǎo!',
				english: 'Hello Teacher Li! (Polite title + 好 greeting)'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'Which of the following is true regarding Mandarin grammar?',
				options: [
					'Verbs change endings based on past, present, or future tense.',
					'There are no verb conjugations or grammatical gender forms.',
					'Adjectives always come after verbs.',
					'The neutral tone is the loudest tone in Mandarin.'
				],
				correctIndex: 1,
				explanation:
					'Mandarin has no verb conjugations or grammatical gender. Tense is communicated through context and aspect markers.'
			},
			wordReorder: {
				sentenceHanzi: '我学汉语',
				sentencePinyin: 'Wǒ xué Hànyǔ',
				sentenceEnglish: 'I study Chinese',
				shuffledWords: ['汉语', '我', '学'],
				wordPinyinMap: { 我: 'wǒ', 学: 'xué', 汉语: 'Hànyǔ' }
			},
			roleplayCheck: {
				situation: 'You meet your Mandarin teacher in the morning.',
				prompt: 'What is the most respectful and natural greeting?',
				options: [
					{
						hanzi: '老师好！',
						pinyin: 'Lǎoshī hǎo!',
						english: 'Hello, Teacher!',
						isCorrect: true,
						feedback: 'Exact! Title + 好 is the standard respectful greeting in Chinese culture.'
					},
					{
						hanzi: '你骂谁？',
						pinyin: 'Nǐ mà shéi?',
						english: 'Who are you scolding?',
						isCorrect: false,
						feedback: 'Caution! 骂 (4th tone) means to scold.'
					},
					{
						hanzi: '再见！',
						pinyin: 'Zàijiàn!',
						english: 'Goodbye!',
						isCorrect: false,
						feedback: '再见 means goodbye, not hello.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-02',
		unitNumber: 2,
		partNumber: 1,
		partTitle: 'Part I: Foundations',
		stage: 'Absolute Beginner',
		title: 'The Sound System',
		chineseTitle: '发音体系',
		subtitle: 'Initials, finals, tricky consonants (j/q/x vs zh/ch/sh), and aspiration',
		milestoneGoal:
			'Distinguish aspirated vs unaspirated initials, master palatals (j/q/x) vs retroflexes (zh/ch/sh/r), and pronounce common courtesy phrases.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Pronunciation clarity unlocks native comprehension. Mandarin distinguishes sounds by breath puff (aspiration) rather than vocal chord buzzing.'
		},
		pronunciationLab: {
			title: 'Aspirated vs Unaspirated Pairs',
			explanation:
				'Hold a thin sheet of paper in front of your mouth: aspirated sounds blow the paper outwards!',
			items: [
				{
					pinyin: 'b / p',
					hanzi: '八 / 怕',
					tone: 'b (unaspirated) vs p (puff of air)',
					audioText: '八 怕',
					tip: 'b is like "sp" in spy (no air puff); p puffs strong burst of air.'
				},
				{
					pinyin: 'd / t',
					hanzi: '大 / 他',
					tone: 'd (unaspirated) vs t (aspirated)',
					audioText: '大 他',
					tip: 't releases noticeable burst of air; d is clean and tight.'
				},
				{
					pinyin: 'j / q / x',
					hanzi: '机 / 七 / 西',
					tone: 'Palatals (tongue flat against lower teeth)',
					audioText: '机 七 西',
					tip: 'Keep tongue tip resting behind lower front teeth, smile slightly!'
				},
				{
					pinyin: 'zh / ch / sh / r',
					hanzi: '知 / 吃 / 诗 / 日',
					tone: 'Retroflex (tongue curled back to hard palate)',
					audioText: '知 吃 诗 日',
					tip: 'Curl the tip of the tongue gently toward the roof of your mouth.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '请问，洗手间在哪里？',
				pinyin: 'Qǐngwèn, xǐshǒujiān zài nǎlǐ?',
				english: 'Excuse me, where is the restroom?',
				audioText: '请问，洗手间在哪里？'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '在前面右边。',
				pinyin: 'Zài qiánmiàn yòubiān.',
				english: 'It is ahead on the right.',
				audioText: '在前面右边。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '非常感谢！',
				pinyin: 'Fēicháng gǎnxiè!',
				english: 'Thank you very much!',
				audioText: '非常感谢！'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '不客气！慢走。',
				pinyin: 'Bú kèqi! Màn zǒu.',
				english: 'You are welcome! Take care.',
				audioText: '不客气！慢走。'
			}
		],
		spotlightWords: [
			{
				hanzi: '请问',
				pinyin: 'qǐngwèn',
				english: 'excuse me / may I ask',
				mnemonic: 'Please (请) ask (问) — essential polite opener.',
				toneNumber: 3
			},
			{
				hanzi: '谢谢',
				pinyin: 'xièxie',
				english: 'thank you',
				mnemonic: 'Repetition of 谢 (thanks) with second syllable neutral.',
				toneNumber: 4
			},
			{
				hanzi: '不客气',
				pinyin: 'bú kèqi',
				english: "you're welcome / don't be formal",
				mnemonic: 'Not (不) guest/formal demeanor (客气).',
				toneNumber: 2
			},
			{
				hanzi: '对不起',
				pinyin: 'duìbuqǐ',
				english: 'sorry / excuse me',
				mnemonic: 'Cannot face (对) up to (起) someone.',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Polite Openers with 请 (qǐng)',
			formula: '请 + Verb',
			slots: [
				{ label: 'Prefix', example: '请 (qǐng)', pinyin: 'qǐng (please)' },
				{ label: 'Action', example: '问 / 进 / 坐 / 喝茶', pinyin: 'wèn / jìn / zuò / hēchá' }
			],
			notes:
				'Add 请 before verbs to transform commands into courteous requests: 请坐 (Please sit), 请进 (Please enter).'
		},
		pragmaticTip: {
			title: 'Responding to Courtesy',
			tip: 'When someone says 谢谢 (xièxie), natives rarely stay silent. Reply instantly with 不客气 (bú kèqi) or 不用谢 (bú yòng xiè).',
			naturalExample: {
				hanzi: '不用谢！',
				pinyin: 'Bú yòng xiè!',
				english: 'No need for thanks! / Any time!'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'What distinguishes the initials p, t, k, q, ch from b, d, g, j, zh?',
				options: [
					'They are always pronounced with nasal resonance.',
					'They are pronounced with a strong puff of air (aspiration).',
					'They can only be paired with the 1st tone.',
					'They are voiced in the throat like English b and d.'
				],
				correctIndex: 1,
				explanation:
					'Mandarin pairs like b/p, d/t, and j/q are distinguished primarily by aspiration (the release of a puff of air).'
			},
			wordReorder: {
				sentenceHanzi: '请问洗手间在哪里',
				sentencePinyin: 'Qǐngwèn xǐshǒujiān zài nǎlǐ',
				sentenceEnglish: 'Excuse me, where is the restroom?',
				shuffledWords: ['在哪里', '请问', '洗手间'],
				wordPinyinMap: { 请问: 'qǐngwèn', 洗手间: 'xǐshǒujiān', 在哪里: 'zài nǎlǐ' }
			},
			roleplayCheck: {
				situation: 'Someone holds the elevator door open for you.',
				prompt: 'What should you say as you step in?',
				options: [
					{
						hanzi: '谢谢您！',
						pinyin: 'Xièxie nín!',
						english: 'Thank you (polite)!',
						isCorrect: true,
						feedback: 'Spot on! Using 您 adds polite respect.'
					},
					{
						hanzi: '慢走！',
						pinyin: 'Màn zǒu!',
						english: 'Take care / walk slowly!',
						isCorrect: false,
						feedback: '慢走 is said when seeing guests off, not when stepping into an elevator.'
					},
					{
						hanzi: '对不起！',
						pinyin: 'Duìbuqǐ!',
						english: "I'm sorry!",
						isCorrect: false,
						feedback: 'You did nothing wrong; 谢谢 is appropriate.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-03',
		unitNumber: 3,
		partNumber: 1,
		partTitle: 'Part I: Foundations',
		stage: 'Absolute Beginner',
		title: 'Tones and Listening',
		chineseTitle: '声调与听力',
		subtitle: 'Third-tone sandhi, 不 & 一 phonetic shifts, and tone-pair perception',
		milestoneGoal:
			'Master tone changes automatically in continuous speech: two 3rd tones turning into 2nd+3rd, and tone shifts for 不 and 一.',
		estimatedMinutes: 13,
		characterHost: {
			name: 'Xiao Meng (小萌)',
			avatarEmoji: '👧',
			intro:
				'In real speech, tones flow into each other! Learning the three golden tone sandhi rules will make your speech sound fluid and effortless.'
		},
		pronunciationLab: {
			title: 'The 3 Golden Tone Sandhi Rules',
			explanation: 'Tone sandhi changes how words sound in sequence without changing spelling.',
			items: [
				{
					pinyin: '3rd + 3rd → 2nd + 3rd',
					hanzi: '你好 (nǐ + hǎo → ní hǎo)',
					tone: 'Third-Tone Sandhi',
					audioText: '你好 可以 手表',
					tip: 'When two 3rd tones touch, the first becomes a rising 2nd tone: nǐ hǎo sounds like ní hǎo!'
				},
				{
					pinyin: '不 (bù) + 4th tone → bú',
					hanzi: '不是 (bú shì) / 不要 (bú yào)',
					tone: '不 Sandhi',
					audioText: '不是 不要 对不起',
					tip: 'Before any 4th falling tone, 不 flips up into a 2nd rising tone: bú shì.'
				},
				{
					pinyin: '一 (yī) + 4th → yí; 一 + 1/2/3 → yì',
					hanzi: '一个 (yí ge) / 一天 (yì tiān)',
					tone: '一 Sandhi',
					audioText: '一个 一天 一起 一样',
					tip: 'Alone or counting it is yī; before 4th tone it is yí; before 1st/2nd/3rd it is yì.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '你好！这个多少钱？',
				pinyin: 'Nǐ hǎo! Zhège duōshao qián?',
				english: 'Hello! How much is this one?',
				audioText: '你好！这个多少钱？'
			},
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '你好！一个十块钱，不贵。',
				pinyin: 'Nǐ hǎo! Yí ge shí kuài qián, bú guì.',
				english: 'Hello! One piece is ten yuan, not expensive.',
				audioText: '你好！一个十块钱，不贵。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '太好了，我要一个！',
				pinyin: 'Tài hǎo le, wǒ yào yí ge!',
				english: 'Great! I want one.',
				audioText: '太好了，我要一个！'
			},
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '好的一共十块，给你发票。',
				pinyin: 'Hǎo de, yígòng shí kuài, gěi nǐ fāpiào.',
				english: 'All right, ten yuan in total, here is your receipt.',
				audioText: '好的，一共十块，给你发票。'
			}
		],
		spotlightWords: [
			{
				hanzi: '不',
				pinyin: 'bù / bú',
				english: 'no / not',
				mnemonic: 'A bird flying upwards refusing to perch.',
				toneNumber: 4
			},
			{
				hanzi: '一',
				pinyin: 'yī / yí / yì',
				english: 'one / single',
				mnemonic: 'One horizontal brushstroke.',
				toneNumber: 1
			},
			{
				hanzi: '一共',
				pinyin: 'yígòng',
				english: 'in total / altogether',
				mnemonic: 'One unified (一) shared total (共).',
				toneNumber: 2
			},
			{
				hanzi: '很好',
				pinyin: 'hěn hǎo',
				english: 'very good',
				mnemonic: 'Pronounced hén hǎo due to third-tone sandhi.',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Degree Adverb + Adjective',
			formula: '很 / 太 / 不 + Adjective',
			slots: [
				{ label: 'Modifier', example: '很 (hěn) / 太 (tài) / 不 (bù)', pinyin: 'hěn / tài / bù' },
				{ label: 'Adjective', example: '好 (good) / 贵 (expensive)', pinyin: 'hǎo / guì' }
			],
			notes:
				'In Mandarin, simple descriptive sentences need 很 (hěn) rather than 是 (shì). Say 我很好 (I am good), not 我是好!'
		},
		pragmaticTip: {
			title: 'Why 很 does not always mean "Very"',
			tip: 'In sentences like 我很好 or 他很高, 很 is often just a structural glue balancing the syllable, meaning "I am fine / He is tall", not necessarily "extremely".',
			naturalExample: {
				hanzi: '今天挺好。',
				pinyin: 'Jīntiān tǐng hǎo.',
				english: 'Today is pretty good.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How is the phrase 你好 (nǐ + hǎo) actually pronounced in speech?',
				options: [
					'With two flat high tones (nī hāo)',
					'As ní hǎo (rising 2nd tone + dipping 3rd tone)',
					'As nì hào (sharp falling tones)',
					'With both syllables in neutral tone'
				],
				correctIndex: 1,
				explanation:
					'Third-tone sandhi rule: when two 3rd-tone syllables meet, the first syllable shifts to 2nd tone (ní hǎo).'
			},
			wordReorder: {
				sentenceHanzi: '这个一个十块',
				sentencePinyin: 'Zhège yí ge shí kuài',
				sentenceEnglish: 'This one is ten yuan apiece',
				shuffledWords: ['十块', '这个', '一个'],
				wordPinyinMap: { 这个: 'zhège', 一个: 'yí ge', 十块: 'shí kuài' }
			},
			roleplayCheck: {
				situation: 'A vendor asks if you think an item is expensive.',
				prompt: 'How do you say "Not expensive, very good!"?',
				options: [
					{
						hanzi: '不贵，很好！',
						pinyin: 'Bú guì, hěn hǎo!',
						english: 'Not expensive, very good!',
						isCorrect: true,
						feedback: 'Perfect! Notice 不 changes to bú before 4th tone 贵.'
					},
					{
						hanzi: '不是，很高！',
						pinyin: 'Bú shì, hěn gāo!',
						english: 'Not be, very tall!',
						isCorrect: false,
						feedback: '高 means tall, not good.'
					},
					{
						hanzi: '太贵，不要！',
						pinyin: 'Tài guì, bú yào!',
						english: 'Too expensive, do not want!',
						isCorrect: false,
						feedback: 'This means too expensive, the opposite of the prompt.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-04',
		unitNumber: 4,
		partNumber: 1,
		partTitle: 'Part I: Foundations',
		stage: 'Absolute Beginner',
		title: 'Your First Conversations',
		chineseTitle: '初次对话',
		subtitle: 'Personal pronouns, 是, 吗 questions, negation with 不, and origin',
		milestoneGoal:
			'Introduce yourself, state your nationality and occupation, ask counterpart origin, and sustain a natural 5-step conversational loop without a script.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				"Ni hao! I'm Xiao Ming from Peking University. In this milestone unit, you will hold your first authentic back-and-forth exchange in Mandarin!"
		},
		pronunciationLab: {
			title: 'Rising Question Intonation with 吗 (ma)',
			explanation:
				'吗 turns any statement into a yes/no question. Keep 吗 light, neutral, and level.',
			items: [
				{
					pinyin: '你是学生吗？',
					hanzi: '你是学生吗？',
					tone: 'Statement + 吗 = Question',
					audioText: '你是学生吗？',
					tip: 'Do not raise your pitch dramatically at the end; let 吗 float neutrally.'
				},
				{
					pinyin: '你是哪国人？',
					hanzi: '你是哪国人？',
					tone: 'Question Word Question (no 吗!)',
					audioText: '你是哪国人？',
					tip: 'Never add 吗 when a question word like 哪 (which) or 什么 (what) is already present.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '你好！请问你叫什么名字？',
				pinyin: 'Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?',
				english: 'Hello! May I ask what your name is?',
				audioText: '你好！请问你叫什么名字？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '你好！我叫大卫。你是哪国人？',
				pinyin: 'Nǐ hǎo! Wǒ jiào Dàwèi. Nǐ shì nǎ guó rén?',
				english: 'Hello! I am David. What nationality are you?',
				audioText: '你好！我叫大卫。你是哪国人？'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '我是中国人，来自北京。你呢？',
				pinyin: 'Wǒ shì zhōngguó rén, láizì Běijīng. Nǐ ne?',
				english: 'I am Chinese, from Beijing. And you?',
				audioText: '我是中国人，来自北京。你呢？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我是英国人。很高兴认识你！',
				pinyin: 'Wǒ shì yīngguó rén. Hěn gāoxìng rènshi nǐ!',
				english: 'I am British. Very glad to meet you!',
				audioText: '我是英国人。很高兴认识你！'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '我也很高兴认识你！',
				pinyin: 'Wǒ yě hěn gāoxìng rènshi nǐ!',
				english: 'Nice to meet you too!',
				audioText: '我也很高兴认识你！'
			}
		],
		spotlightWords: [
			{
				hanzi: '叫',
				pinyin: 'jiào',
				english: 'to be called / name is',
				mnemonic: 'Mouth radical (口) shouting a name.',
				toneNumber: 4
			},
			{
				hanzi: '是',
				pinyin: 'shì',
				english: 'to be (am / is / are)',
				mnemonic: 'Sun (日) shining truth below: identity copula.',
				toneNumber: 4
			},
			{
				hanzi: '哪国人',
				pinyin: 'nǎ guó rén',
				english: 'which nationality person',
				mnemonic: 'Which (哪) + Country (国) + Person (人).',
				toneNumber: 3
			},
			{
				hanzi: '很高兴',
				pinyin: 'hěn gāoxìng',
				english: 'very pleased / glad',
				mnemonic: 'High (高) spirits (兴).',
				toneNumber: 1
			},
			{
				hanzi: '认识',
				pinyin: 'rènshi',
				english: 'to know / recognize a person',
				mnemonic: 'Speech radical (讠) knowing someone through words.',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Identity & Origin: S + 是 + Country + 人',
			formula: 'Subject + 是 + Country + 人',
			slots: [
				{ label: 'Subject', example: '我 / 他 / 她', pinyin: 'wǒ / tā / tā' },
				{ label: 'Copula', example: '是 (shì)', pinyin: 'shì (to be)' },
				{
					label: 'Origin',
					example: '中国 / 英国 / 美国 + 人',
					pinyin: 'Zhōngguó / Yīngguó / Měiguó rén'
				}
			],
			notes:
				'Negate with 不是 (bú shì). Question with 吗: 你是美国人吗？Or question word: 你是哪国人？',
			contrasts: [
				{
					label: '是 vs 叫',
					explanation: 'Use 叫 for names (我叫大卫), use 是 for nouns/roles (我是学生).',
					exampleHanzi: '我叫大卫，我是英国人。',
					examplePinyin: 'Wǒ jiào Dàwèi, wǒ shì yīngguó rén.',
					exampleEnglish: 'I am called David; I am British.'
				}
			]
		},
		pragmaticTip: {
			title: 'The "你呢？" Bounce-Back Strategy',
			tip: 'Never let a conversation die after answering! Always append "你呢？" (And you?) to return ownership of the interaction and keep your partner engaged.',
			naturalExample: {
				hanzi: '我是大学生，你呢？',
				pinyin: 'Wǒ shì dàxuéshēng, nǐ ne?',
				english: 'I am a university student, and you?'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "Are you Chinese?" correctly?',
				options: ['你是中国人吗？', '你是哪国人吗？', '你叫中国吗？', '你不中国人吗？'],
				correctIndex: 0,
				explanation:
					'Statement (你是中国人) + 吗 creates the yes/no question. Never put 吗 with 哪 (which).'
			},
			wordReorder: {
				sentenceHanzi: '很高兴认识你',
				sentencePinyin: 'Hěn gāoxìng rènshi nǐ',
				sentenceEnglish: 'Very pleased to meet you',
				shuffledWords: ['认识你', '很高兴'],
				wordPinyinMap: { 很高兴: 'hěn gāoxìng', 认识你: 'rènshi nǐ' }
			},
			roleplayCheck: {
				situation: 'Someone says "我是中国人，来自上海。你呢？"',
				prompt: 'How do you respond if you are from Canada?',
				options: [
					{
						hanzi: '我是加拿大人。很高兴认识你！',
						pinyin: 'Wǒ shì jiānádà rén. Hěn gāoxìng rènshi nǐ!',
						english: 'I am Canadian. Very glad to meet you!',
						isCorrect: true,
						feedback: 'Spot on! Answered with country + 人, and added polite closure.'
					},
					{
						hanzi: '我是不上海人。',
						pinyin: 'Wǒ shì bù shànghǎi rén.',
						english: 'I am not Shanghai person.',
						isCorrect: false,
						feedback: 'Grammar error: negation is 不是, not 是不.'
					},
					{
						hanzi: '对不起，再见！',
						pinyin: 'Duìbuqǐ, zàijiàn!',
						english: 'Sorry, goodbye!',
						isCorrect: false,
						feedback: 'Too abrupt and inappropriate for friendly introductions.'
					}
				]
			}
		},
		xpReward: 15
	}
];
