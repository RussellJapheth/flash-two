import type { TextbookUnitData } from './types';

export const PART_3_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-11',
		unitNumber: 11,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Home and Everyday Routines',
		chineseTitle: '居家与作息',
		subtitle: 'Daily schedules, ongoing actions with 正在, habits, and sequence',
		milestoneGoal:
			'Describe your typical morning and evening routine, sequence events with 先……然后……, and describe what people are doing right now with 正在.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'Connected conversation starts with describing your daily life. Let’s talk about morning coffee, commuting, habits, and what is happening right this second!'
		},
		pronunciationLab: {
			title: 'Aspect Marker: 正在 / 在 (Ongoing Action)',
			explanation:
				'Put 正在 or 在 before a verb to express "-ing" (ongoing action): 我在喝咖啡 (I am drinking coffee).',
			items: [
				{
					pinyin: '在 (zài) + Verb',
					hanzi: '在吃饭 / 在看书',
					tone: 'Ongoing action marker',
					audioText: '我在吃饭 他在看书',
					tip: 'Pronounce 在 with firm 4th falling tone.'
				},
				{
					pinyin: '正在 (zhèngzài) + Verb',
					hanzi: '我正在上课呢',
					tone: 'Emphasis: Right at this precise moment',
					audioText: '我正在上课呢',
					tip: 'Often pairs with particle 呢 at the end of the clause.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '大卫，你平时每天几点起床？',
				pinyin: 'Dàwèi, nǐ píngshí měitiān jǐ diǎn qǐchuáng?',
				english: 'David, what time do you usually get up every day?',
				audioText: '大卫，你平时每天几点起床？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我平时早上七点起床，先刷牙洗脸，然后吃早饭。你呢？',
				pinyin:
					'Wǒ píngshí zǎoshang qī diǎn qǐchuáng, xiān shuāyá xǐliǎn, ránhòu chī zǎofàn. Nǐ ne?',
				english:
					'I usually get up at 7:00 AM, brush teeth and wash up first, then eat breakfast. And you?',
				audioText: '我平时早上七点起床，先刷牙洗脸，然后吃早饭。你呢？'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '我起得比你早，我六点半就起来跑步了。你现在在做什么？',
				pinyin:
					'Wǒ qǐ de bǐ nǐ zǎo, wǒ liù diǎn bàn jiù qǐlai pǎobù le. Nǐ xiànzài zài zuò shénme?',
				english:
					'I get up earlier than you; I was already up running at 6:30. What are you doing right now?',
				audioText: '我起得比你早，我六点半就起来跑步了。你现在在做什么？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我正在复习中文生词呢！',
				pinyin: 'Wǒ zhèngzài fùxí zhōngwén shēngcí ne!',
				english: 'I am reviewing new Chinese vocabulary right now!',
				audioText: '我正在复习中文生词呢！'
			}
		],
		spotlightWords: [
			{
				hanzi: '起床',
				pinyin: 'qǐchuáng',
				english: 'to get out of bed / wake up',
				mnemonic: 'Rise up (起) from bed (床).',
				toneNumber: 3
			},
			{
				hanzi: '平时',
				pinyin: 'píngshí',
				english: 'usually / normally / in daily times',
				mnemonic: 'Even/level (平) times (时).',
				toneNumber: 2
			},
			{
				hanzi: '先……然后……',
				pinyin: 'xiān... ránhòu...',
				english: 'first... then afterwards...',
				mnemonic: 'First (先) and then subsequently (然后).',
				toneNumber: 1
			},
			{
				hanzi: '正在',
				pinyin: 'zhèngzài',
				english: 'in the middle of doing (progressive)',
				mnemonic: 'Precise (正) presence (在).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Sequencing Actions: 先……再 / 然后……',
			formula: '先 + Action 1 + 再 / 然后 + Action 2',
			slots: [
				{ label: 'First Action', example: '先洗澡 (First take a shower)', pinyin: 'xiān xǐzǎo' },
				{ label: 'Connector', example: '然后 / 再 (then / next)', pinyin: 'ránhòu / zài' },
				{ label: 'Second Action', example: '吃早饭 (eat breakfast)', pinyin: 'chī zǎofàn' }
			],
			notes:
				'Use 再 for planned future sequential actions (先做作业再玩). Use 然后 for general narrative order.'
		},
		pragmaticTip: {
			title: 'Answering Phone Inquiries: 我正在……呢',
			tip: 'When a friend calls and asks 你干嘛呢？(What are you up to?), natural response is always: 我在……呢 (e.g. 我在做饭呢). The 呢 softens the answer and invites them to speak.',
			naturalExample: {
				hanzi: '我在地铁上呢，马上到！',
				pinyin: 'Wǒ zài dìtiě shang ne, mǎshàng dào!',
				english: 'I am on the subway right now, arriving momentarily!'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "He is currently reading a book right now" using ongoing aspect?',
				options: ['他正在看书呢。', '他看了书。', '他想看书。', '他是看书人。'],
				correctIndex: 0,
				explanation:
					'正在 + Verb + 呢 indicates an activity actively in progress right at this moment.'
			},
			wordReorder: {
				sentenceHanzi: '先刷牙然后吃早饭',
				sentencePinyin: 'Xiān shuāyá ránhòu chī zǎofàn',
				sentenceEnglish: 'First brush teeth then eat breakfast',
				shuffledWords: ['然后吃早饭', '先刷牙'],
				wordPinyinMap: { 先刷牙: 'xiān shuāyá', 然后吃早饭: 'ránhòu chī zǎofàn' }
			},
			roleplayCheck: {
				situation: 'Your mother calls and asks what you are doing.',
				prompt: 'How do you say "I am cooking dinner right now"?',
				options: [
					{
						hanzi: '妈，我正在做晚饭呢！',
						pinyin: 'Mā, wǒ zhèngzài zuò wǎnfàn ne!',
						english: 'Mom, I am cooking dinner right now!',
						isCorrect: true,
						feedback: 'Warm, natural, grammatically flawless.'
					},
					{
						hanzi: '我做完了晚饭昨天。',
						pinyin: 'Wǒ zuòwán le wǎnfàn zuótiān.',
						english: 'I finished dinner yesterday.',
						isCorrect: false,
						feedback: 'Past action with wrong word order.'
					},
					{
						hanzi: '晚饭没有吃。',
						pinyin: 'Wǎnfàn méiyǒu chī.',
						english: 'Dinner was not eaten.',
						isCorrect: false,
						feedback: 'Does not state what you are doing now.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-12',
		unitNumber: 12,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Work, Study and Skills',
		chineseTitle: '工作与学习',
		subtitle: 'Careers, workplaces, acquired abilities (会), and professional routines',
		milestoneGoal:
			'Describe your job or major, discuss work tasks and schedule, and explain skills you have acquired using 会 and 可以.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'Discussing your career and field of study is central to adult conversation. Let’s talk professions, companies, responsibilities, and future goals!'
		},
		pronunciationLab: {
			title: 'Workplace Vocabulary Tones',
			explanation: 'Pronounce corporate and academic titles crisply.',
			items: [
				{
					pinyin: 'gōngsī (公司) / jīnglǐ (经理)',
					hanzi: '公司 / 经理',
					tone: 'Company (1+1) / Manager (1+3)',
					audioText: '公司 经理 办公室',
					tip: 'Keep 公司 level on high 1st tone.'
				},
				{
					pinyin: 'zhuānyè (专业) / bìyè (毕业)',
					hanzi: '专业 / 毕业',
					tone: 'Major (1+4) / Graduate (4+4)',
					audioText: '专业 毕业 同事',
					tip: 'Notice clear 4th tone drops in 业 (yè).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '大卫，你大学学的是什么专业？',
				pinyin: 'Dàwèi, nǐ dàxué xué de shì shénme zhuānyè?',
				english: 'David, what was your major in college?',
				audioText: '大卫，你大学学的是什么专业？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我学的是计算机科学。毕业后在一家科技公司做程序员。',
				pinyin: 'Wǒ xué de shì jìsuànjī kēxué. Bìyè hòu zài yì jiā kējì gōngsī zuò chéngxùyuán.',
				english:
					'I studied computer science. After graduating, I work as a software engineer at a tech company.',
				audioText: '我学的是计算机科学。毕业后在一家科技公司做程序员。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '很厉害！平时工作忙不忙？需要经常加班吗？',
				pinyin: 'Hěn lìhai! Píngshí gōngzuò máng bu máng? Xūyào jīngcháng jiābān ma?',
				english: 'Impressive! Is your daily work busy? Do you have to work overtime often?',
				audioText: '很厉害！平时工作忙不忙？需要经常加班吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '有时候挺忙的，不过我非常喜欢写代码，很有成就感。',
				pinyin: 'Yǒushíhou tǐng máng de, búguò wǒ fēicháng xǐhuan xiě dàimǎ, hěn yǒu chéngjiùgǎn.',
				english:
					'Sometimes it is quite busy, but I really enjoy writing code; it brings great fulfillment.',
				audioText: '有时候挺忙的，不过我非常喜欢写代码，很有成就感。'
			}
		],
		spotlightWords: [
			{
				hanzi: '工作',
				pinyin: 'gōngzuò',
				english: 'to work / job',
				mnemonic: 'Craftsman (工) making deeds (作).',
				toneNumber: 1
			},
			{
				hanzi: '专业',
				pinyin: 'zhuānyè',
				english: 'academic major / specialty',
				mnemonic: 'Dedicated (专) industry/studies (业).',
				toneNumber: 1
			},
			{
				hanzi: '经常',
				pinyin: 'jīngcháng',
				english: 'often / frequently',
				mnemonic: 'Constants of daily life.',
				toneNumber: 1
			},
			{
				hanzi: '加班',
				pinyin: 'jiābān',
				english: 'to work overtime',
				mnemonic: 'Add (加) shift/class (班).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Describing Your Role: 在 + Workplace + 做 / 当 + Profession',
			formula: 'Subject + 在 + [Company / Place] + 做 / 当 + [Job Title]',
			slots: [
				{ label: 'Subject', example: '我 (I)', pinyin: 'wǒ' },
				{
					label: 'Location',
					example: '在一家科技公司 (at a tech firm)',
					pinyin: 'zài yì jiā kējì gōngsī'
				},
				{
					label: 'Action & Role',
					example: '做工程师 (work as engineer)',
					pinyin: 'zuò gōngchéngshī'
				}
			],
			notes: 'In Mandarin, specify the place of action (在……) before the action verb itself!'
		},
		pragmaticTip: {
			title: 'Complimenting Skills: "很厉害！" (Hěn lìhai!)',
			tip: 'When someone shares an impressive skill or achievement, praise them with 很厉害！(Hěn lìhai = That is amazing!). The standard humble reply in Chinese culture is 哪里哪里 (Nǎlǐ nǎlǐ = You flatter me / I still have much to learn).',
			naturalExample: {
				hanzi: '你的中文真棒！— 哪里哪里，还在学呢。',
				pinyin: 'Nǐ de zhōngwén zhēn bàng! — Nǎlǐ nǎlǐ, hái zài xué ne.',
				english: 'Your Chinese is awesome! — You flatter me, still learning.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Where does the location phrase 在…… (at a place) go in a Chinese action sentence?',
				options: [
					'At the very end of the sentence like English ("I work at a company").',
					'Before the verb ("I at a company work").',
					'Between the verb and object.',
					'Only after the word 谢谢.'
				],
				correctIndex: 1,
				explanation:
					'Rule of Chinese word order: Subject + [Time] + [Place with 在] + Verb + Object.'
			},
			wordReorder: {
				sentenceHanzi: '他在科技公司做程序员',
				sentencePinyin: 'Tā zài kējì gōngsī zuò chéngxùyuán',
				sentenceEnglish: 'He works as a programmer at a tech company',
				shuffledWords: ['做程序员', '他在', '科技公司'],
				wordPinyinMap: { 他在: 'tā zài', 科技公司: 'kējì gōngsī', 做程序员: 'zuò chéngxùyuán' }
			},
			roleplayCheck: {
				situation: 'An interviewer asks what you do.',
				prompt: 'How do you say "I work as a designer at a hospital"?',
				options: [
					{
						hanzi: '我在一家医院做设计师。',
						pinyin: 'Wǒ zài yì jiā yīyuàn zuò shèjìshī.',
						english: 'I work as a designer at a hospital.',
						isCorrect: true,
						feedback: 'Grammar and vocabulary are spot on!'
					},
					{
						hanzi: '我做设计师在医院。',
						pinyin: 'Wǒ zuò shèjìshī zài yīyuàn.',
						english: 'I work designer at hospital.',
						isCorrect: false,
						feedback: 'English word order: put 在医院 before the verb 做.'
					},
					{
						hanzi: '医院是设计师。',
						pinyin: 'Yīyuàn shì shèjìshī.',
						english: 'The hospital is a designer.',
						isCorrect: false,
						feedback: 'Nonsensical statement.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-13',
		unitNumber: 13,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Hobbies and Free Time',
		chineseTitle: '爱好与休闲',
		subtitle: 'Interests, sports, entertainment, preferences, and comparisons with 跟……一样',
		milestoneGoal:
			'Talk about leisure activities, compare shared interests with 跟……一样 (same as), and invite someone to an activity.',
		estimatedMinutes: 14,
		characterHost: {
			name: 'Xiao Meng (小萌)',
			avatarEmoji: '👧',
			intro:
				'What do you do on weekends? Playing badminton, listening to music, or watching movies: let’s talk about hobbies and make weekend plans!'
		},
		pronunciationLab: {
			title: 'Verbs for Sports: 打 (dǎ) vs 踢 (tī)',
			explanation: 'Mandarin uses distinct verbs based on the limb involved in the sport.',
			items: [
				{
					pinyin: '打 (dǎ) + Hand sports',
					hanzi: '打篮球 / 打羽毛球 / 打网球',
					tone: 'Hit / strike with hands',
					audioText: '打篮球 打羽毛球 打网球',
					tip: 'Use 打 for basketball, badminton, tennis, ping-pong.'
				},
				{
					pinyin: '踢 (tī) + Foot sports',
					hanzi: '踢足球',
					tone: 'Kick with feet',
					audioText: '踢足球',
					tip: 'Use 踢 (kick) for soccer/football.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '大卫，你周末一般有什么爱好？',
				pinyin: 'Dàwèi, nǐ zhōumò yìbān yǒu shénme àihào?',
				english: 'David, what hobbies do you generally have on weekends?',
				audioText: '大卫，你周末一般有什么爱好？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我很喜欢运动，比如打羽毛球和游泳。你呢？',
				pinyin: 'Wǒ hěn xǐhuan yùndòng, bǐrú dǎ yǔmáoqiú hé yóuyǒng. Nǐ ne?',
				english: 'I really like sports, such as playing badminton and swimming. And you?',
				audioText: '我很喜欢运动，比如打羽毛球和游泳。你呢？'
			},
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '太巧了！我的爱好跟你一样，我也特别爱打羽毛球。',
				pinyin: 'Tài qiǎo le! Wǒ de àihào gēn nǐ yíyàng, wǒ yě tèbié ài dǎ yǔmáoqiú.',
				english:
					'What a coincidence! My hobby is the same as yours; I also love playing badminton.',
				audioText: '太巧了！我的爱好跟你一样，我也特别爱打羽毛球。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '那这个周六下午，我们一起去体育馆打球吧！',
				pinyin: 'Nà zhège zhōuliù xiàwǔ, wǒmen yìqǐ qù tǐyùguǎn dǎqiú ba!',
				english: 'Then this Saturday afternoon, let’s go play at the gymnasium together!',
				audioText: '那这个周六下午，我们一起去体育馆打球吧！'
			}
		],
		spotlightWords: [
			{
				hanzi: '爱好',
				pinyin: 'àihào',
				english: 'hobby / interest',
				mnemonic: 'Love (爱) and fond inclination (好).',
				toneNumber: 4
			},
			{
				hanzi: '比如',
				pinyin: 'bǐrú',
				english: 'for example / such as',
				mnemonic: 'Compare (比) like this (如).',
				toneNumber: 3
			},
			{
				hanzi: '跟……一样',
				pinyin: 'gēn... yíyàng',
				english: 'the same as...',
				mnemonic: 'With (跟) one identical pattern (一样).',
				toneNumber: 1
			},
			{
				hanzi: '羽毛球',
				pinyin: 'yǔmáoqiú',
				english: 'badminton',
				mnemonic: 'Feather (羽毛) ball (球).',
				toneNumber: 3
			}
		],
		patternBox: {
			title: 'Equivalence & Similarity: A + 跟 / 和 + B + 一样',
			formula: 'A + 跟 + B + 一样 (+ Adjective)',
			slots: [
				{ label: 'Item A', example: '我的爱好 (My hobby)', pinyin: 'wǒ de àihào' },
				{ label: 'Comparison', example: '跟你 (with you)', pinyin: 'gēn nǐ' },
				{ label: 'Predicate', example: '一样 (is the same)', pinyin: 'yíyàng' }
			],
			notes:
				'Negation is 不一样 (bù yíyàng). To add a specific quality: 他跟我一样高 (He is as tall as me).'
		},
		pragmaticTip: {
			title: 'Proposal Ending Particle: 吧 (ba)',
			tip: 'End invitations and friendly proposals with 吧: 我们走吧 (Let’s go), 一起喝咖啡吧 (Let’s have coffee). It changes a factual statement into a warm, inclusive invitation.',
			naturalExample: {
				hanzi: '周末一起看电影吧！',
				pinyin: 'Zhōumò yìqǐ kàn diànyǐng ba!',
				english: 'Let’s watch a movie together this weekend!'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "His opinion is the same as mine"?',
				options: [
					'他的想法跟我的一样。',
					'他的一样想法和我。',
					'他是我的一样想法。',
					'想法他和一样。'
				],
				correctIndex: 0,
				explanation: 'Formula: A (他的想法) + 跟 + B (我的) + 一样 (is the same).'
			},
			wordReorder: {
				sentenceHanzi: '我的爱好跟你一样',
				sentencePinyin: 'Wǒ de àihào gēn nǐ yíyàng',
				sentenceEnglish: 'My hobby is the same as yours',
				shuffledWords: ['跟你一样', '我的爱好'],
				wordPinyinMap: { 我的爱好: 'wǒ de àihào', 跟你一样: 'gēn nǐ yíyàng' }
			},
			roleplayCheck: {
				situation: 'You want to invite a friend to play basketball this afternoon.',
				prompt: 'What do you say with the suggestion particle 吧?',
				options: [
					{
						hanzi: '今天下午我们一起去打篮球吧！',
						pinyin: 'Jīntiān xiàwǔ wǒmen yìqǐ qù dǎ lánqiú ba!',
						english: 'Let’s go play basketball together this afternoon!',
						isCorrect: true,
						feedback: 'Friendly, warm, and idiomatic.'
					},
					{
						hanzi: '踢篮球！',
						pinyin: 'Tī lánqiú!',
						english: 'Kick basketball!',
						isCorrect: false,
						feedback: 'Basketball uses 打 (hands), never 踢 (feet).'
					},
					{
						hanzi: '你没有篮球吗？',
						pinyin: 'Nǐ méiyǒu lánqiú ma?',
						english: 'Do you not have a basketball?',
						isCorrect: false,
						feedback: 'Not an invitation.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-14',
		unitNumber: 14,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Health and Wellbeing',
		chineseTitle: '身体与健康',
		subtitle: 'Symptoms, illnesses, visiting a clinic (看病), and pharmacies',
		milestoneGoal:
			'Describe physical symptoms (fever, headache, cough), purchase medicine at a pharmacy, and ask for dosage instructions.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'Knowing how to articulate health issues in Chinese provides peace of mind. Let’s learn common symptoms, doctor visits, and pharmacy interactions.'
		},
		pronunciationLab: {
			title: 'Expressing Discomfort: 疼 (téng) vs 痛 (tòng)',
			explanation: 'Attach body parts before 疼 to indicate aching or pain.',
			items: [
				{
					pinyin: '头疼 (tóuténg) / 肚子疼 (dùzi téng)',
					hanzi: '头疼 / 肚子疼',
					tone: 'Headache / Stomachache',
					audioText: '头疼 肚子疼 嗓子疼',
					tip: '头 (head) + 疼 (ache); 嗓子疼 (sore throat).'
				},
				{
					pinyin: '感冒 (gǎnmào) / 发烧 (fāshāo)',
					hanzi: '感冒 / 发烧',
					tone: 'Catch cold / Have a fever',
					audioText: '我感冒了 我发烧了',
					tip: 'Use 了 to indicate change of state: 我感冒了 (I have caught a cold).'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '医生您好，我从昨天开始觉得很不舒服。',
				pinyin: 'Yīshēng nín hǎo, wǒ cóng zuótiān kāishǐ juéde hěn bù shūfu.',
				english: 'Hello doctor, since yesterday I have been feeling quite unwell.',
				audioText: '医生您好，我从昨天开始觉得很不舒服。'
			},
			{
				speaker: 'Doctor',
				avatarEmoji: '👨‍⚕️',
				hanzi: '哪里不舒服？发烧吗？量一下体温。',
				pinyin: 'Nǎlǐ bù shūfu? Fāshāo ma? Liáng yíxià tǐwēn.',
				english:
					'Where does it feel uncomfortable? Do you have a fever? Let’s take your temperature.',
				audioText: '哪里不舒服？发烧吗？量一下体温。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '头很疼，嗓子也痛，还一直咳嗽。',
				pinyin: 'Tóu hěn téng, sǎngzi yě tòng, hái yìzhí késou.',
				english: 'My head hurts, my throat is sore, and I have been coughing constantly.',
				audioText: '头很疼，嗓子也痛，还一直咳嗽。'
			},
			{
				speaker: 'Doctor',
				avatarEmoji: '👨‍⚕️',
				hanzi: '三十八度二，有点发烧。是重感冒，我给你开点感冒药。',
				pinyin: 'Sānshíbā dù èr, yǒudiǎn fāshāo. Shì zhòng gǎnmào, wǒ gěi nǐ kāi diǎn gǎnmàoyào.',
				english:
					'38.2 degrees, a mild fever. It is a bad cold; I will prescribe you some cold medication.',
				audioText: '三十八度二，有点发烧。是重感冒，我给你开点感冒药。'
			},
			{
				speaker: 'Doctor',
				avatarEmoji: '👨‍⚕️',
				hanzi: '这个药一天吃三次，一次吃两片，饭后吃，多喝热水好好休息。',
				pinyin:
					'Zhège yào yì tiān chī sān cì, yí cì chī liǎng piàn, fànhòu chī, duō hē rèshuǐ hǎohǎo xiūxi.',
				english:
					'Take this medicine 3 times a day, 2 tablets each time, after meals. Drink warm water and rest well.',
				audioText: '这个药一天吃三次，一次吃两片，饭后吃，多喝热水好好休息。'
			}
		],
		spotlightWords: [
			{
				hanzi: '不舒服',
				pinyin: 'bù shūfu',
				english: 'uncomfortable / unwell',
				mnemonic: 'Not (不) comfortable (舒服).',
				toneNumber: 4
			},
			{
				hanzi: '发烧',
				pinyin: 'fāshāo',
				english: 'to have a fever',
				mnemonic: 'Emit (发) burning heat (烧).',
				toneNumber: 1
			},
			{
				hanzi: '头疼',
				pinyin: 'tóuténg',
				english: 'headache',
				mnemonic: 'Head (头) ache (疼).',
				toneNumber: 2
			},
			{
				hanzi: '开药',
				pinyin: 'kāiyào',
				english: 'to prescribe medicine',
				mnemonic: 'Open/write (开) medicine (药).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Prescription Dosage: 一天 + [Times] + 次，一次 + [Pills] + 片',
			formula: 'Time Period + 吃 + [Number] + 次 (cì)',
			slots: [
				{ label: 'Frequency', example: '一天三次 (3 times a day)', pinyin: 'yì tiān sān cì' },
				{
					label: 'Dosage per intake',
					example: '一次两片 (2 tablets per time)',
					pinyin: 'yí cì liǎng piàn'
				},
				{ label: 'Instruction', example: '饭后吃 (take after meals)', pinyin: 'fànhòu chī' }
			],
			notes:
				'次 (cì) is the measure word for occurrences/times; 片 (piàn) is the measure word for tablets or slices.'
		},
		pragmaticTip: {
			title: 'The Famous "多喝热水" (Drink More Hot Water)',
			tip: 'In Chinese culture, warm boiled water (热水) is considered restorative for digestion and illness. When friends tell you 多喝热水, it is an expression of genuine warmth and concern!',
			naturalExample: {
				hanzi: '别着凉，多喝温水。',
				pinyin: 'Bié zháoliáng, duō hē wēnshuǐ.',
				english: 'Do not catch cold, drink plenty of warm water.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "Take 2 tablets, 3 times a day" based on Chinese medical prescription phrasing?',
				options: [
					'一天三次，一次两片。',
					'三次一天，两片一次。',
					'吃药三天天两片。',
					'片两吃一次三。'
				],
				correctIndex: 0,
				explanation: 'Formula: 一天三次 (3 times a day) + 一次两片 (2 pills per time).'
			},
			wordReorder: {
				sentenceHanzi: '头很疼嗓子也痛',
				sentencePinyin: 'Tóu hěn téng sǎngzi yě tòng',
				sentenceEnglish: 'Head hurts and throat is sore',
				shuffledWords: ['嗓子也痛', '头很疼'],
				wordPinyinMap: { 头很疼: 'tóu hěn téng', 嗓子也痛: 'sǎngzi yě tòng' }
			},
			roleplayCheck: {
				situation: 'You are at a pharmacy with a bad cough.',
				prompt: 'What should you say to the pharmacist?',
				options: [
					{
						hanzi: '请问有止咳药吗？我咳得很厉害。',
						pinyin: 'Qǐngwèn yǒu zhǐkéyào ma? Wǒ ké de hěn lìhai.',
						english: 'Excuse me, do you have cough medicine? I am coughing badly.',
						isCorrect: true,
						feedback: 'Precise, courteous, and directly describes your need.'
					},
					{
						hanzi: '我要买两张冰水！',
						pinyin: 'Wǒ yào mǎi liǎng zhāng bīngshuǐ!',
						english: 'I want to buy two sheets of iced water!',
						isCorrect: false,
						feedback: 'Wrong measure word and harmful if you have a cold.'
					},
					{
						hanzi: '我们一起打球吧！',
						pinyin: 'Wǒmen yìqǐ dǎqiú ba!',
						english: 'Let’s play ball together!',
						isCorrect: false,
						feedback: 'Inappropriate in a pharmacy.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-15',
		unitNumber: 15,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Travel and Experiences',
		chineseTitle: '旅行与经历',
		subtitle: 'Transport, itineraries, hotels, and past experience with 过 (guò)',
		milestoneGoal:
			'Share past travel experiences using the experiential aspect marker 过, book transport tickets, and check into a hotel.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'David & Xiao Ming (大卫 & 小明)',
			avatarEmoji: '👱',
			intro:
				'China has the world’s largest high-speed rail network. Let’s learn how to travel between cities, book hotels, and recount memorable journeys with 过!'
		},
		pronunciationLab: {
			title: 'Experiential Aspect Marker: 过 (guò)',
			explanation:
				'Place 过 immediately after a verb to mean "have ever had the experience of doing": 去过 (have been), 吃过 (have eaten).',
			items: [
				{
					pinyin: '去过 (qù guo)',
					hanzi: '我去过北京',
					tone: 'Verb + 过 (neutral tone)',
					audioText: '我去过北京 我没去过上海',
					tip: '过 is pronounced in neutral light tone in this pattern.'
				},
				{
					pinyin: '没……过 (méi... guo)',
					hanzi: '我没坐过高铁',
					tone: 'Negation of past experience',
					audioText: '我没坐过高铁 我没吃过烤鸭',
					tip: 'Negate with 没 (méi) or 没有, never with 不!'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '小明，你去过西安吗？',
				pinyin: 'Xiǎomíng, nǐ qù guo Xī’ān ma?',
				english: 'Xiao Ming, have you ever been to Xi’an?',
				audioText: '小明，你去过西安吗？'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '去过两次！那里的兵马俑特别壮观，肉夹馍也特别好吃。你打算去吗？',
				pinyin:
					'Qù guo liǎng cì! Nàlǐ de bīngmǎyǒng tèbié zhuàngguān, ròujiāmó yě tèbié hǎochī. Nǐ dǎsuàn qù ma?',
				english:
					'I have been twice! The Terracotta Warriors there are spectacular, and the Roujiamo is delicious. Are you planning to go?',
				audioText: '去过两次！那里的兵马俑特别壮观，肉夹馍也特别好吃。你打算去吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '对！我打算下周坐高铁去，请问坐高铁需要多长时间？',
				pinyin:
					'Duì! Wǒ dǎsuàn xià zhōu zuò gāotiě qù, qǐngwèn zuò gāotiě xūyào duō cháng shíjiān?',
				english:
					'Yes! I plan to take the high-speed train next week. How long does the high-speed train take?',
				audioText: '对！我打算下周坐高铁去，请问坐高铁需要多长时间？'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '从北京出发只要四个半小时，非常舒适方便！',
				pinyin: 'Cóng Běijīng chūfā zhǐ yào sì ge bàn xiǎoshí, fēicháng shūshì fāngbiàn!',
				english:
					'Departing from Beijing it only takes four and a half hours, very comfortable and convenient!',
				audioText: '从北京出发只要四个半小时，非常舒适方便！'
			}
		],
		spotlightWords: [
			{
				hanzi: '去过',
				pinyin: 'qù guo',
				english: 'have been to',
				mnemonic: 'Go (去) with experiential marker (过).',
				toneNumber: 4
			},
			{
				hanzi: '高铁',
				pinyin: 'gāotiě',
				english: 'high-speed rail',
				mnemonic: 'High (高) iron/rail (铁).',
				toneNumber: 1
			},
			{
				hanzi: '打算',
				pinyin: 'dǎsuàn',
				english: 'to plan / intend to',
				mnemonic: 'Strike (打) calculation (算).',
				toneNumber: 3
			},
			{
				hanzi: '多长时间',
				pinyin: 'duō cháng shíjiān',
				english: 'how long (duration)',
				mnemonic: 'How (多) long (长) time (时间).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Experiential Aspect: Verb + 过 vs 没 + Verb + 过',
			formula: 'Subject + (没) + Verb + 过 + Object',
			slots: [
				{
					label: 'Affirmative',
					example: '我看过那部电影 (I have seen that movie)',
					pinyin: 'wǒ kàn guo nà bù diànyǐng'
				},
				{
					label: 'Negative',
					example: '我没吃过臭豆腐 (I have never eaten stinky tofu)',
					pinyin: 'wǒ méi chī guo chòudòufu'
				},
				{
					label: 'Question',
					example: '你坐过飞机吗？ (Have you ever flown on a plane?)',
					pinyin: 'nǐ zuò guo fēijī ma'
				}
			],
			notes:
				'过 highlights past life experience, whereas 了 highlights a completed specific action event.'
		},
		pragmaticTip: {
			title: 'Inquiring Duration vs Point in Time',
			tip: 'Do not confuse 什么时候 (shénme shíhou = What time / when?) with 多长时间 (duō cháng shíjiān = How long of a duration?). Train arrival point = 什么时候到; Travel duration = 坐多长时间.',
			naturalExample: {
				hanzi: '你学中文学了多长时间了？',
				pinyin: 'Nǐ xué zhōngwén xué le duō cháng shíjiān le?',
				english: 'How long have you been studying Chinese?'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'How do you say "I have never eaten Beijing Roast Duck"?',
				options: [
					'我没吃过北京烤鸭。',
					'我不吃过北京烤鸭。',
					'我是不吃北京烤鸭。',
					'我没有吃北京烤鸭了。'
				],
				correctIndex: 0,
				explanation: 'Negation of past experience with 过 is always 没 + Verb + 过 (我没吃过).'
			},
			wordReorder: {
				sentenceHanzi: '坐高铁只要四个半小时',
				sentencePinyin: 'Zuò gāotiě zhǐ yào sì ge bàn xiǎoshí',
				sentenceEnglish: 'Taking high-speed rail only takes 4.5 hours',
				shuffledWords: ['只要四个半小时', '坐高铁'],
				wordPinyinMap: { 坐高铁: 'zuò gāotiě', 只要四个半小时: 'zhǐ yào sì ge bàn xiǎoshí' }
			},
			roleplayCheck: {
				situation: 'Checking into a hotel in Chengdu.',
				prompt: 'What do you say at the front desk?',
				options: [
					{
						hanzi: '您好，我预订了一间大床房，这是我的护照。',
						pinyin: 'Nín hǎo, wǒ yùdìng le yì jiān dàchuángfáng, zhè shì wǒ de hùzhào.',
						english: 'Hello, I booked a king-bed room, here is my passport.',
						isCorrect: true,
						feedback: 'Impeccable hotel check-in standard phrasing.'
					},
					{
						hanzi: '买单！多少钱？',
						pinyin: 'Mǎidān! Duōshao qián?',
						english: 'Check! How much money?',
						isCorrect: false,
						feedback: '买单 is for restaurants, not hotel check-in.'
					},
					{
						hanzi: '我头很疼。',
						pinyin: 'Wǒ tóu hěn téng.',
						english: 'My head hurts.',
						isCorrect: false,
						feedback: 'Medical complaint, not hotel check-in.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-16',
		unitNumber: 16,
		partNumber: 3,
		partTitle: 'Part III: Everyday Independence',
		stage: 'Elementary',
		title: 'Plans, Problems and Solutions',
		chineseTitle: '安排与解决',
		subtitle: 'Making arrangements, explaining hitches, conditional sentences (如果……就)',
		milestoneGoal:
			'Reschedule an appointment, explain an unexpected obstacle using 因为……所以……, and negotiate an alternative solution using 如果……就…….',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'Milestone Unit 16! Life does not always follow scripts. Learn to explain hitches, reschedule meetings, and propose flexible win-win alternatives.'
		},
		pronunciationLab: {
			title: 'Pairing Conjunctions: 因为 (yīnwèi) & 所以 (suǒyǐ)',
			explanation: 'Mandarin conjunctions frequently operate in paired brackets.',
			items: [
				{
					pinyin: '因为……所以…… (yīnwèi... suǒyǐ...)',
					hanzi: '因为下雨，所以我们不去了',
					tone: 'Cause & Effect Bracket',
					audioText: '因为下雨 所以我们不去了',
					tip: 'Unlike English where you never use "Because... so...", Mandarin encourages pairing both!'
				},
				{
					pinyin: '如果……就…… (rúguǒ... jiù...)',
					hanzi: '如果有时间，我们就去',
					tone: 'Condition & Consequence Bracket',
					audioText: '如果有时间 我们就去',
					tip: '如果 states the condition; 就 introduces the immediate outcome.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '琳娜，真不好意思！我今天下午可能去不了图书馆了。',
				pinyin: 'Línnà, zhēn bù hǎoyìsi! Wǒ jīntiān xiàwǔ kěnéng qù bù liǎo túshūguǎn le.',
				english:
					'Linna, I am really sorry! I might not be able to go to the library this afternoon.',
				audioText: '琳娜，真不好意思！我今天下午可能去不了图书馆了。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '怎么了？发生什么事了？',
				pinyin: 'Zěnme le? Fāshēng shénme shì le?',
				english: 'What happened? Did something come up?',
				audioText: '怎么了？发生什么事了？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '因为我的导师临时通知开会，所以下午两点我必须去学院。',
				pinyin:
					'Yīnwèi wǒ de dǎoshī línshí tōngzhī kāihuì, suǒyǐ xiàwǔ liǎng diǎn wǒ bìxū qù xuéyuàn.',
				english:
					'Because my advisor called an impromptu meeting, I must go to the department at 2:00 PM.',
				audioText: '因为我的导师临时通知开会，所以下午两点我必须去学院。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '没关系，学业要紧！如果我们改到明天下午三点，你方便吗？',
				pinyin:
					'Méi guānxi, xuéyè yàojǐn! Rúguǒ wǒmen gǎi dào míngtiān xiàwǔ sān diǎn, nǐ fāngbiàn ma?',
				english:
					'No problem, academic work comes first! If we change to tomorrow at 3:00 PM, is that convenient for you?',
				audioText: '没关系，学业要紧！如果我们改到明天下午三点，你方便吗？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '明天下午我完全有空，非常感谢你的理解！',
				pinyin: 'Míngtiān xiàwǔ wǒ wánquán yǒu kòng, fēicháng gǎnxiè nǐ de lǐjiě!',
				english:
					'Tomorrow afternoon I am completely free; thank you very much for your understanding!',
				audioText: '明天下午我完全有空，非常感谢你的理解！'
			}
		],
		spotlightWords: [
			{
				hanzi: '因为……所以……',
				pinyin: 'yīnwèi... suǒyǐ...',
				english: 'because... therefore...',
				mnemonic: 'Cause (因为) leads to therefore (所以).',
				toneNumber: 1
			},
			{
				hanzi: '如果……就……',
				pinyin: 'rúguǒ... jiù...',
				english: 'if... then...',
				mnemonic: 'If (如果) then promptly (就).',
				toneNumber: 2
			},
			{
				hanzi: '改',
				pinyin: 'gǎi',
				english: 'to change / reschedule / alter',
				mnemonic: 'Whip modifying course: changing schedule.',
				toneNumber: 3
			},
			{
				hanzi: '方便',
				pinyin: 'fāngbiàn',
				english: 'convenient / suitable',
				mnemonic: 'Direction (方) convenience (便).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Conditional Sentence: 如果 + Condition + (那 / 就) + Consequence',
			formula: '如果 (rúguǒ) + Clause 1 + 就 (jiù) + Clause 2',
			slots: [
				{
					label: 'Condition',
					example: '如果你有空 (If you have free time)',
					pinyin: 'rúguǒ nǐ yǒu kòng'
				},
				{
					label: 'Outcome',
					example: '我们就去喝咖啡 (then we will have coffee)',
					pinyin: 'wǒmen jiù qù hē kāfēi'
				}
			],
			notes:
				'In casual spoken Chinese, 如果 can also be replaced by 要是 (yàoshi): 要是下雨，我们就不去了 (If it rains, we won’t go).'
		},
		pragmaticTip: {
			title: 'Graceful Rescheduling Formula',
			tip: 'When rescheduling, follow the 3-step formula: 1) Apologize (真不好意思); 2) Give the genuine reason with 因为; 3) Propose an alternative time (如果我们改到……行吗？).',
			naturalExample: {
				hanzi: '实在抱歉，我们改天再聚！',
				pinyin: 'Shízài bàoqiàn, wǒmen gǎitiān zài jù!',
				english: 'Truly sorry, let’s get together another day!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'How do you say "Because it rained, therefore we did not go" in natural paired conjunctions?',
				options: [
					'因为下雨，所以我们没去。',
					'所以下雨，因为我们去。',
					'如果下雨，但是我们去。',
					'虽然下雨，就没去。'
				],
				correctIndex: 0,
				explanation: '因为 (yīnwèi) introduces the cause, and 所以 (suǒyǐ) introduces the result.'
			},
			wordReorder: {
				sentenceHanzi: '如果有空我们就去喝咖啡',
				sentencePinyin: 'Rúguǒ yǒu kòng wǒmen jiù qù hē kāfēi',
				sentenceEnglish: 'If free then we will go drink coffee',
				shuffledWords: ['我们就去喝咖啡', '如果有空'],
				wordPinyinMap: { 如果有空: 'rúguǒ yǒu kòng', 我们就去喝咖啡: 'wǒmen jiù qù hē kāfēi' }
			},
			roleplayCheck: {
				situation: 'You are stuck in traffic and will be 15 minutes late for lunch.',
				prompt: 'How do you text your waiting friend?',
				options: [
					{
						hanzi: '真不好意思，路上堵车，我大概迟到十五分钟，你先进去坐！',
						pinyin:
							'Zhēn bù hǎoyìsi, lùshang dǔchē, wǒ dàgài chídào shíwǔ fēnzhōng, nǐ xiān jìnqu zuò!',
						english:
							'Really sorry, traffic jam on the road, I will be about 15 minutes late, go ahead inside and sit!',
						isCorrect: true,
						feedback: 'Exemplary message: clear reason + precise delay + considerate instruction.'
					},
					{
						hanzi: '我不来了，买单吧！',
						pinyin: 'Wǒ bù lái le, mǎidān ba!',
						english: 'I am not coming, pay the bill!',
						isCorrect: false,
						feedback: 'Rude and inconsiderate.'
					},
					{
						hanzi: '你几岁？',
						pinyin: 'Nǐ jǐ suì?',
						english: 'How old are you?',
						isCorrect: false,
						feedback: 'Irrelevant.'
					}
				]
			}
		},
		xpReward: 15
	}
];
