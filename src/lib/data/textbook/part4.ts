import type { TextbookUnitData } from './types';

export const PART_4_UNITS: TextbookUnitData[] = [
	{
		id: 'unit-17',
		unitNumber: 17,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Telling Stories',
		chineseTitle: '叙述故事',
		subtitle: 'Narrative chronology, background events with 着, and anecdotes',
		milestoneGoal:
			'Narrate a personal experience or funny mishap from start to finish using past aspect markers and temporal connectors (后来, 突然).',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Xiao Ming (小明)',
			avatarEmoji: '👦',
			intro:
				'Conversational fluency is the art of storytelling! Instead of single answers, learn how to paint a scene, build suspense, and share personal memories.'
		},
		pronunciationLab: {
			title: 'Static State Marker: 着 (zhe)',
			explanation:
				'Verb + 着 marks an ongoing posture or persistent background condition: 门开着 (The door is open), 他笑着说 (He said with a smile).',
			items: [
				{
					pinyin: 'Verb + 着 (zhe) in neutral tone',
					hanzi: '站着 / 坐着 / 拿着',
					tone: 'Persistent Physical State',
					audioText: '站着 坐着 拿着 穿这件衣服',
					tip: 'Pronounced zhe feather-light in neutral tone.'
				},
				{
					pinyin: '后来 (hòulái) vs 然后 (ránhòu)',
					hanzi: '后来 (later on) vs 然后 (then next)',
					tone: 'Narrative Connectors',
					audioText: '后来我们成了好朋友',
					tip: '后来 refers exclusively to past events that transpired later on; 然后 can be used for future or sequence.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '大卫，听说你上周末去长城迷路了？快给我讲讲怎么回事！',
				pinyin:
					'Dàwèi, tīngshuō nǐ shàng zhōumò qù chángchéng mílù le? Kuài gěi wǒ jiǎngjiang zěnme huí shì!',
				english:
					'David, I heard you got lost at the Great Wall last weekend? Quick, tell me what happened!',
				audioText: '大卫，听说你上周末去长城迷路了？快给我讲讲怎么回事！'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '别提了！那天天气特别好，我一个人拿着相机一边拍照一边往前走。',
				pinyin:
					'Bié tí le! Nà tiān tiānqì tèbié hǎo, wǒ yí ge rén názhe xiàngjī yìbiān pāizhào yìbiān wǎng qián zǒu.',
				english:
					'Don’t even bring it up! The weather was great, so I was walking forward holding my camera while taking photos.',
				audioText: '别提了！那天天气特别好，我一个人拿着相机一边拍照一边往前走。'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '然后呢？怎么会迷路呢？',
				pinyin: 'Ránhòu ne? Zěnme huì mílù ne?',
				english: 'And then? How did you manage to get lost?',
				audioText: '然后呢？怎么会迷路呢？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi:
					'后来天突然黑了，手机也没电了。幸好遇到两个热心的当地村民，他们骑着摩托车把我送到了公交站！',
				pinyin:
					'Hòulái tiān tūrán hēi le, shǒujī yě méi diàn le. Xìnghǎo yùdào liǎng ge rèxīn de dāngdì cūnmín, tāmen qízhe mótuōchē bǎ wǒ sòng dào le gōngjiāozhàn!',
				english:
					'Later it suddenly turned dark and my phone ran out of battery. Fortunately I ran into two warmhearted local villagers who gave me a ride on their motorcycle to the bus stop!',
				audioText:
					'后来天突然黑了，手机也没电了。幸好遇到两个热心的当地村民，他们骑着摩托车把我送到了公交站！'
			},
			{
				speaker: 'Xiao Ming',
				avatarEmoji: '👦',
				hanzi: '哈哈，太惊险了！这也算是一次难忘的冒险了。',
				pinyin: 'Hāhā, tài jīngxiǎn le! Zhè yě suàn shì yí cì nánwàng de màoxiǎn le.',
				english: 'Haha, how thrilling! That counts as an unforgettable adventure.',
				audioText: '哈哈，太惊险了！这也算是一次难忘的冒险了。'
			}
		],
		spotlightWords: [
			{
				hanzi: '后来',
				pinyin: 'hòulái',
				english: 'afterwards / later on (in past events)',
				mnemonic: 'Behind (后) came (来) the next chapter.',
				toneNumber: 4
			},
			{
				hanzi: '突然',
				pinyin: 'tūrán',
				english: 'suddenly / unexpectedly',
				mnemonic: 'Dog dashing out of cave suddenly (突).',
				toneNumber: 1
			},
			{
				hanzi: '幸好',
				pinyin: 'xìnghǎo',
				english: 'fortunately / luckily',
				mnemonic: 'Fortunate (幸) good fortune (好).',
				toneNumber: 4
			},
			{
				hanzi: '别提了',
				pinyin: 'bié tí le',
				english: "don't even mention it! (classic conversational opener)",
				mnemonic: 'Don’t (别) lift/bring up (提) it.',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Simultaneous Actions: 一边……一边…… (Doing X while doing Y)',
			formula: 'Subject + 一边 + Action 1 + 一边 + Action 2',
			slots: [
				{ label: 'Subject', example: '我 (I)', pinyin: 'wǒ' },
				{
					label: 'Action 1',
					example: '一边听音乐 (while listening to music)',
					pinyin: 'yìbiān tīng yīnyuè'
				},
				{ label: 'Action 2', example: '一边散步 (while taking a walk)', pinyin: 'yìbiān sànbù' }
			],
			notes: 'In casual speech, 一边 can be shortened to 边……边…… (我边喝咖啡边看书).'
		},
		pragmaticTip: {
			title: 'Storytelling Kick-off: "别提了！"',
			tip: 'When someone asks about an awkward situation or rough day, start with 别提了！(Bié tí le! = Oh, don’t even get me started!). It instantly sets an entertaining, dramatic tone.',
			naturalExample: {
				hanzi: '别提了，今天倒霉透了！',
				pinyin: 'Bié tí le, jīntiān dǎoméi tòu le!',
				english: 'Don’t even bring it up, today was totally unlucky!'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which word specifically means "later on" when narrating an event that occurred in the past?',
				options: ['后来 (hòulái)', '然后 (ránhòu)', '再 (zài)', '马上 (mǎshàng)'],
				correctIndex: 0,
				explanation:
					'后来 (hòulái) refers exclusively to events that happened later in a past narrative sequence.'
			},
			wordReorder: {
				sentenceHanzi: '他拿着相机一边拍照一边往前走',
				sentencePinyin: 'Tā názhe xiàngjī yìbiān pāizhào yìbiān wǎng qián zǒu',
				sentenceEnglish: 'He held a camera taking photos while walking forward',
				shuffledWords: ['一边往前走', '他拿着相机', '一边拍照'],
				wordPinyinMap: {
					他拿着相机: 'tā názhe xiàngjī',
					一边拍照: 'yìbiān pāizhào',
					一边往前走: 'yìbiān wǎng qián zǒu'
				}
			},
			roleplayCheck: {
				situation: 'A friend asks: 后来怎么样了？ (What happened afterwards?)',
				prompt: 'How do you answer "Later I found my keys"?',
				options: [
					{
						hanzi: '后来我在桌子底下找到了钥匙！',
						pinyin: 'Hòulái wǒ zài zhuōzi dǐxia zhǎodào le yàoshi!',
						english: 'Later on I found the keys under the table!',
						isCorrect: true,
						feedback: 'Accurate past narrative connector + resultative complement 找到.'
					},
					{
						hanzi: '不要钥匙。',
						pinyin: 'Bú yào yàoshi.',
						english: 'Do not want keys.',
						isCorrect: false,
						feedback: 'Does not answer the question.'
					},
					{
						hanzi: '钥匙在后面。',
						pinyin: 'Yàoshi zài hòumiàn.',
						english: 'The keys are in back.',
						isCorrect: false,
						feedback: 'Lacks narrative continuity.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-18',
		unitNumber: 18,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Explaining Why',
		chineseTitle: '原因与后果',
		subtitle: 'Causes, motives, purpose with 为了 (wèile), and 既然……就…… (since)',
		milestoneGoal:
			'Articulate complex motives, state purposes using 为了, and formulate deductive arguments with 既然……就…….',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'To sound fluent, you must explain your motivations and reasons clearly. In this unit, we master 为了 (for the purpose of) and 既然 (since it is already the case).'
		},
		pronunciationLab: {
			title: 'Tone Precision: 为了 (wèile) vs 因为 (yīnwèi)',
			explanation:
				'Notice that 为 in 为了 is 4th tone (wèi), whereas in 因为 it is also 4th tone (yīnwèi).',
			items: [
				{
					pinyin: '为了 (wèi le) + Goal',
					hanzi: '为了学好中文 / 为了健康',
					tone: 'Purpose / Motivation',
					audioText: '为了学好中文 我每天练习',
					tip: 'Put the purpose clause at the beginning of the sentence: 为了 A, Subject 做 B.'
				},
				{
					pinyin: '既然 (jìrán)……就 (jiù)……',
					hanzi: '既然来了，就多玩几天',
					tone: 'Premise & Conclusion',
					audioText: '既然来了 就多玩几天吧',
					tip: '既然 acknowledges an existing reality: "Since X is already true, then Y."'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '大卫，你为什么每天早起背两百个汉字？',
				pinyin: 'Dàwèi, nǐ wèishénme měitiān zǎoqǐ bèi liǎng bǎi ge hànzì?',
				english:
					'David, why do you wake up early every day to memorize two hundred Chinese characters?',
				audioText: '大卫，你为什么每天早起背两百个汉字？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '为了能看懂中国古籍和现代新闻，也为了以后能在中国直接工作。',
				pinyin:
					'Wèile néng kàndǒng zhōngguó gǔjí hé xiàndài xīnwén, yě wèile yǐhòu néng zài zhōngguó zhíjiē gōngzuò.',
				english:
					'In order to read ancient Chinese texts and modern news, and also to be able to work in China directly in the future.',
				audioText: '为了能看懂中国古籍和现代新闻，也为了以后能在中国直接工作。'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '真有毅力！既然你目标这么明确，就一定要坚持下去。',
				pinyin: 'Zhēn yǒu yìlì! Jìrán nǐ mùbiāo zhème míngquè, jiù yídìng yào jiānchí xiàqù.',
				english:
					'You really have perseverance! Since your goals are so clear, you must keep at it.',
				audioText: '真有毅力！既然你目标这么明确，就一定要坚持下去。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '谢谢鼓励！有志者事竟成嘛。',
				pinyin: 'Xièxie gǔlì! Yǒu zhì zhě shì jìng chéng ma.',
				english: 'Thanks for the encouragement! Where there is a will, there is a way.',
				audioText: '谢谢鼓励！有志者事竟成嘛。'
			}
		],
		spotlightWords: [
			{
				hanzi: '为了',
				pinyin: 'wèile',
				english: 'in order to / for the sake of',
				mnemonic: 'For (为) having achieved (了) the goal.',
				toneNumber: 4
			},
			{
				hanzi: '既然',
				pinyin: 'jìrán',
				english: 'since / now that / given that',
				mnemonic: 'Already established (既) so as it is (然).',
				toneNumber: 4
			},
			{
				hanzi: '目标',
				pinyin: 'mùbiāo',
				english: 'goal / objective',
				mnemonic: 'Eye (目) target marker (标).',
				toneNumber: 4
			},
			{
				hanzi: '坚持',
				pinyin: 'jiānchí',
				english: 'to persevere / uphold / keep going',
				mnemonic: 'Firm (坚) holding (持).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Expressing Purpose: 为了 + [Objective] ， [Action]',
			formula: '为了 + [Goal / Benefit] ， Subject + Verb + Object',
			slots: [
				{
					label: 'Purpose Clause',
					example: '为了身体健康 (For good health)',
					pinyin: 'wèile shēntǐ jiànkāng'
				},
				{
					label: 'Action Clause',
					example: '我每天去健身房 (I go to the gym daily)',
					pinyin: 'wǒ měitiān qù jiànshēnfáng'
				}
			],
			notes:
				'Contrast with 因为: 因为 explains cause in the past (Why did it happen?); 为了 explains intention towards the future (For what purpose?).'
		},
		pragmaticTip: {
			title: 'Proverb Usage: 有志者事竟成',
			tip: 'Dropping a well-timed four-character idiom (成语) like 有志者事竟成 (Where there is a will, there is a way) shows cultural appreciation and impresses native speakers deeply.',
			naturalExample: {
				hanzi: '千里之行，始于足下。',
				pinyin: 'Qiānlǐ zhī xíng, shǐ yú zú xià.',
				english: 'A journey of a thousand miles begins with a single step.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'What is the key difference between 因为 and 为了?',
				options: [
					'因为 explains past causes; 为了 expresses future goals and purposes.',
					'为了 is only used for food; 因为 is used for people.',
					'There is no difference in meaning or usage.',
					'因为 cannot be placed at the beginning of a sentence.'
				],
				correctIndex: 0,
				explanation:
					'因为 explains the cause of an event; 为了 states the intention or future goal motivating an action.'
			},
			wordReorder: {
				sentenceHanzi: '既然你喜欢就买吧',
				sentencePinyin: 'Jìrán nǐ xǐhuan jiù mǎi ba',
				sentenceEnglish: 'Since you like it then go ahead and buy it',
				shuffledWords: ['就买吧', '既然你喜欢'],
				wordPinyinMap: { 既然你喜欢: 'jìrán nǐ xǐhuan', 就买吧: 'jiù mǎi ba' }
			},
			roleplayCheck: {
				situation: 'Your friend asks why you wake up at 6:00 AM every day to run.',
				prompt: 'How do you say "In order to stay healthy, I run every day"?',
				options: [
					{
						hanzi: '为了身体健康，我每天跑步。',
						pinyin: 'Wèile shēntǐ jiànkāng, wǒ měitiān pǎobù.',
						english: 'In order to stay healthy, I run every day.',
						isCorrect: true,
						feedback: 'Precise use of 为了 + goal formulation.'
					},
					{
						hanzi: '因为跑步，所以没有身体。',
						pinyin: 'Yīnwèi pǎobù, suǒyǐ méiyǒu shēntǐ.',
						english: 'Because running, therefore have no body.',
						isCorrect: false,
						feedback: 'Illogical and incorrect.'
					},
					{
						hanzi: '如果跑步，就去医院。',
						pinyin: 'Rúguǒ pǎobù, jiù qù yīyuàn.',
						english: 'If running, then go to hospital.',
						isCorrect: false,
						feedback: 'Incorrect conditional.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-19',
		unitNumber: 19,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Opinions and Preferences',
		chineseTitle: '观点与偏好',
		subtitle: 'Expressing viewpoints: 觉得 vs 认为 vs 以为, and concession with 虽然……但是……',
		milestoneGoal:
			'State and justify subjective opinions, distinguish between 觉得 (feel), 认为 (deliberate view), and 以为 (mistaken assumption), and express concession with 虽然……但是…….',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Wang Lin (王林)',
			avatarEmoji: '👩‍🔬',
			intro:
				'In this unit, we unlock nuanced opinion verbs. Distinguishing 觉得, 认为, and 以为 prevents subtle misunderstandings in serious discussions!'
		},
		pronunciationLab: {
			title: 'The Trinity of "Thinking": 觉得 vs 认为 vs 以为',
			explanation: 'Mandarin does not lump all thinking into "think":',
			items: [
				{
					pinyin: '觉得 (juéde)',
					hanzi: '我觉得这道菜很好吃',
					tone: 'Personal Feeling / Impression',
					audioText: '我觉得很有意思 我觉得不太合适',
					tip: 'Use for personal, casual impressions or emotional reactions.'
				},
				{
					pinyin: '认为 (rènwéi)',
					hanzi: '我认为这是一个好机会',
					tone: 'Deliberate, Formal Judgment',
					audioText: '我认为这个方案更可行',
					tip: 'Formal, reasoned judgment based on facts or evaluation.'
				},
				{
					pinyin: '以为 (yǐwéi)',
					hanzi: '我以为他今天不来呢',
					tone: 'Mistaken Assumption (Reality is opposite!)',
					audioText: '我以为你走了 原来你在这里',
					tip: 'Crucial: 以为 always implies "I thought so, but it turned out I was WRONG!"'
				}
			]
		},
		dialogue: [
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '大卫，你看完那部新中国电影了吗？你觉得怎么样？',
				pinyin: 'Dàwèi, nǐ kànwán nà bù xīn zhōngguó diànyǐng le ma? Nǐ juéde zěnmeyàng?',
				english: 'David, did you finish watching that new Chinese film? What did you think?',
				audioText: '大卫，你看完那部新中国电影了吗？你觉得怎么样？'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '我本来以为是一部普通的喜剧，看完了才发现特别感人！',
				pinyin: 'Wǒ běnlái yǐwéi shì yí bù pǔtōng de xǐjù, kànwán le cái fāxiàn tèbié gǎnrén!',
				english:
					'I originally thought it was just an ordinary comedy, but only after watching did I discover it was deeply moving!',
				audioText: '我本来以为是一部普通的喜剧，看完了才发现特别感人！'
			},
			{
				speaker: 'Wang Lin',
				avatarEmoji: '👩‍🔬',
				hanzi: '我也这么认为！虽然剧情节奏有点慢，但是人物刻画非常真实。',
				pinyin:
					'Wǒ yě zhème rènwéi! Suīrán jùqíng jiézòu yǒudiǎn màn, dànshì rénwù kèhuà fēicháng zhēnshí.',
				english:
					'I consider so too! Although the plot pacing was a bit slow, the character development was remarkably authentic.',
				audioText: '我也这么认为！虽然剧情节奏有点慢，但是人物刻画非常真实。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '没错，对学习汉语日常口语也很有帮助。',
				pinyin: 'Méi cuò, duì xuéxí hànyǔ rìcháng kǒuyǔ yě hěn yǒu bāngzhù.',
				english: 'Exactly, it is also very helpful for learning everyday spoken Chinese.',
				audioText: '没错，对学习汉语日常口语也很有帮助。'
			}
		],
		spotlightWords: [
			{
				hanzi: '觉得',
				pinyin: 'juéde',
				english: 'to feel / think (personal impression)',
				mnemonic: 'Perceive (觉) and obtain (得).',
				toneNumber: 2
			},
			{
				hanzi: '认为',
				pinyin: 'rènwéi',
				english: 'to consider / hold reasoned opinion',
				mnemonic: 'Recognize (认) as acting truth (为).',
				toneNumber: 4
			},
			{
				hanzi: '以为',
				pinyin: 'yǐwéi',
				english: 'mistakenly assume / thought (wrongly)',
				mnemonic: 'Presumed (以) to be so (为) — but reality proved otherwise.',
				toneNumber: 3
			},
			{
				hanzi: '虽然……但是……',
				pinyin: 'suīrán... dànshì...',
				english: 'although... nevertheless...',
				mnemonic: 'Even though (虽然) yet (但是).',
				toneNumber: 1
			}
		],
		patternBox: {
			title: 'Concession: 虽然 + [Fact A] ， 但是 + [Counter-Point B]',
			formula: '虽然 + Clause 1 ， 但是 / 可是 + Clause 2',
			slots: [
				{
					label: 'Concession',
					example: '虽然中文声调很难 (Although Chinese tones are difficult)',
					pinyin: 'suīrán zhōngwén shēngdiào hěn nán'
				},
				{
					label: 'Counter-weight',
					example: '但是非常有趣 (nevertheless it is very interesting)',
					pinyin: 'dànshì fēicháng yǒuqù'
				}
			],
			notes: 'In spoken Chinese, 虽然 can sometimes be omitted, but 但是 or 不过 is retained.'
		},
		pragmaticTip: {
			title: 'Politely Softening Disagreement',
			tip: 'To disagree without creating tension, start with: 我觉得你说得有道理，不过…… (I think you have a point, but however...). This validates the speaker before offering an alternative.',
			naturalExample: {
				hanzi: '你说的有道理，不过从另一个角度看……',
				pinyin: 'Nǐ shuō de yǒu dàolǐ, búguò cóng lìng yí ge jiǎodù kàn...',
				english: 'You make a good point, but looking at it from another angle...'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'Which word implies that the speaker held an assumption that turned out to be incorrect?',
				options: ['以为 (yǐwéi)', '觉得 (juéde)', '认为 (rènwéi)', '决定 (juédìng)'],
				correctIndex: 0,
				explanation:
					'以为 (yǐwéi) explicitly indicates a mistaken belief or assumption that was proven false.'
			},
			wordReorder: {
				sentenceHanzi: '虽然很难但是非常有趣',
				sentencePinyin: 'Suīrán hěn nán dànshì fēicháng yǒuqù',
				sentenceEnglish: 'Although difficult nevertheless very interesting',
				shuffledWords: ['但是非常有趣', '虽然很难'],
				wordPinyinMap: { 虽然很难: 'suīrán hěn nán', 但是非常有趣: 'dànshì fēicháng yǒuqù' }
			},
			roleplayCheck: {
				situation:
					'You thought your friend went to Shanghai, but you suddenly bump into him in Beijing.',
				prompt: 'What do you exclaim?',
				options: [
					{
						hanzi: '哎呀！我以为你已经去上海了呢！',
						pinyin: 'Àiyā! Wǒ yǐwéi nǐ yǐjīng qù Shànghǎi le ne!',
						english: 'Aiya! I thought you had already gone to Shanghai!',
						isCorrect: true,
						feedback: 'Spot-on: 以为 perfectly captures the mistaken assumption.'
					},
					{
						hanzi: '我认为你很上海。',
						pinyin: 'Wǒ rènwéi nǐ hěn Shànghǎi.',
						english: 'I consider you very Shanghai.',
						isCorrect: false,
						feedback: 'Grammatically ungrammatical.'
					},
					{
						hanzi: '不要去上海。',
						pinyin: 'Bú yào qù Shànghǎi.',
						english: 'Do not go to Shanghai.',
						isCorrect: false,
						feedback: 'Irrelevant command.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-20',
		unitNumber: 20,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Comparisons and Decisions',
		chineseTitle: '比较与权衡',
		subtitle: 'Weighing choices with 比 and 没有, 越来越……, and decision-making',
		milestoneGoal:
			'Compare two products, cities, or options using 比 and 没有, express progressive change with 越来越, and explain a reasoned decision.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Linna (琳娜)',
			avatarEmoji: '👩‍💼',
			intro:
				'Choosing an apartment, buying a phone, or deciding travel routes: comparative structures (比 and 没有) are essential tools for real-life decisions.'
		},
		pronunciationLab: {
			title: 'The Comparative Duo: A 比 B vs A 没有 B',
			explanation: 'Mandarin uses two parallel patterns to compare degree:',
			items: [
				{
					pinyin: 'A 比 B + Adjective',
					hanzi: '高铁比飞机更准时',
					tone: 'A is more [adj] than B',
					audioText: '高铁比飞机更准时 这个比那个贵',
					tip: 'Never add 很 in 比 sentences! Say 他比我高, NOT 他比我很宽.'
				},
				{
					pinyin: 'A 没有 B + (那么) + Adjective',
					hanzi: '坐火车没有坐高铁那么快',
					tone: 'A is not as [adj] as B',
					audioText: '坐火车没有坐高铁那么快',
					tip: 'This is the standard negative comparison in Mandarin.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '琳娜，你觉得北京和上海哪座城市更适合生活？',
				pinyin: 'Línnà, nǐ juéde Běijīng hé Shànghǎi nǎ zuò chéngshì gèng shìhé shēnghuó?',
				english: 'Linna, which city do you think is more suitable for living, Beijing or Shanghai?',
				audioText: '琳娜，你觉得北京和上海哪座城市更适合生活？'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '各有特色。北京的历史文化比上海深厚很多，但上海的商业环境越来越国际化。',
				pinyin:
					'Gè yǒu tèsè. Běijīng de lìshǐ wénhuà bǐ Shànghǎi shēnhòu hěn duō, dàn Shànghǎi de shāngyè huánjìng yuè lái yuè guójìhuà.',
				english:
					'Each has its charms. Beijing’s history and culture are much deeper than Shanghai’s, but Shanghai’s commercial environment is getting more and more international.',
				audioText: '各有特色。北京的历史文化比上海深厚很多，但上海的商业环境越来越国际化。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '消费方面呢？北京没有上海那么贵吧？',
				pinyin: 'Xiāofèi fāngmiàn ne? Běijīng méiyǒu Shànghǎi nàme guì ba?',
				english: 'What about living expenses? Beijing isn’t as expensive as Shanghai, is it?',
				audioText: '消费方面呢？北京没有上海那么贵吧？'
			},
			{
				speaker: 'Linna',
				avatarEmoji: '👩‍💼',
				hanzi: '其实房租都差不多。如果喜欢传统人文，选北京；如果喜欢现代节奏，选上海。',
				pinyin:
					'Qíshí fángzū dōu chàbuduō. Rúguǒ xǐhuan chuántǒng rénwén, xuǎn Běijīng; rúguǒ xǐhuan xiàndài jiézòu, xuǎn Shànghǎi.',
				english:
					'Actually rent is about the same. If you love traditional humanities, choose Beijing; if you prefer modern tempo, choose Shanghai.',
				audioText: '其实房租都差不多。如果喜欢传统人文，选北京；如果喜欢现代节奏，选上海。'
			}
		],
		spotlightWords: [
			{
				hanzi: '比',
				pinyin: 'bǐ',
				english: 'compare / than',
				mnemonic: 'Two people standing side-by-side comparing height.',
				toneNumber: 3
			},
			{
				hanzi: '越来越……',
				pinyin: 'yuè lái yuè...',
				english: 'more and more...',
				mnemonic: 'The more it comes the more it intensifies.',
				toneNumber: 4
			},
			{
				hanzi: '差不多',
				pinyin: 'chàbuduō',
				english: 'almost the same / about equal',
				mnemonic: 'Difference (差) not (不) much (多).',
				toneNumber: 4
			},
			{
				hanzi: '更',
				pinyin: 'gèng',
				english: 'even more / further',
				mnemonic: 'Step forward in intensity.',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Progressive Increments: 越来越 + Adjective',
			formula: 'Subject + 越来越 + Adjective',
			slots: [
				{ label: 'Subject', example: '天气 (Weather)', pinyin: 'tiānqì' },
				{ label: 'Progression', example: '越来越 (more and more)', pinyin: 'yuè lái yuè' },
				{ label: 'Property', example: '暖和 (warm)', pinyin: 'nuǎnhuo' }
			],
			notes: 'Never insert 很 after 越来越! Say 天气越来越好, NOT 天气越来越很好.'
		},
		pragmaticTip: {
			title: 'The Balanced Evaluation: "各有特色"',
			tip: 'When asked to pick between two good choices (e.g., iPhone vs Android, Beijing vs Shanghai), Chinese professionals often initiate with 各有特色 (Gè yǒu tèsè = Each has its unique strengths). It sounds diplomatic, mature, and thoughtful.',
			naturalExample: {
				hanzi: '两个方案各有特色，我们可以结合一下。',
				pinyin: 'Liǎng ge fāng’àn gè yǒu tèsè, wǒmen kěyǐ jiéhé yíxià.',
				english: 'Both proposals have their strengths; we could combine them.'
			}
		},
		miniCheck: {
			comprehension: {
				question: 'Which of the following sentences has INCORRECT grammar for comparison?',
				options: ['他比我很高。', '他比我高。', '他比我更高。', '他没有我高。'],
				correctIndex: 0,
				explanation:
					'In a 比 sentence, you cannot use 很. Use 更 (even more) or a specific difference (高五厘米), but never 很.'
			},
			wordReorder: {
				sentenceHanzi: '我的汉语越来越流利了',
				sentencePinyin: 'Wǒ de hànyǔ yuè lái yuè liúlì le',
				sentenceEnglish: 'My Chinese is getting more and more fluent',
				shuffledWords: ['越来越流利了', '我的汉语'],
				wordPinyinMap: { 我的汉语: 'wǒ de hànyǔ', 越来越流利了: 'yuè lái yuè liúlì le' }
			},
			roleplayCheck: {
				situation: 'You are shopping for a laptop and comparing Model A and Model B.',
				prompt: 'How do you say "Model A is cheaper than Model B, but Model B is faster"?',
				options: [
					{
						hanzi: 'A款比B款便宜，但是B款速度更快。',
						pinyin: 'A kuǎn bǐ B kuǎn piányi, dànshì B kuǎn sùdù gèng kuài.',
						english: 'Model A is cheaper than Model B, but Model B is faster.',
						isCorrect: true,
						feedback: 'Grammatically sound and idiomatic comparison.'
					},
					{
						hanzi: 'A款很比B款。',
						pinyin: 'A kuǎn hěn bǐ B kuǎn.',
						english: 'Model A very than Model B.',
						isCorrect: false,
						feedback: 'Nonsensical grammar.'
					},
					{
						hanzi: '都是一样的便宜没有。',
						pinyin: 'Dōu shì yíyàng de piányi méiyǒu.',
						english: 'All are same cheap not have.',
						isCorrect: false,
						feedback: 'Disjointed vocabulary.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-21',
		unitNumber: 21,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Emotions and Relationships',
		chineseTitle: '情绪与人际',
		subtitle: 'Feelings, empathy, reassurance, personal boundaries, and comforting friends',
		milestoneGoal:
			'Express emotional states (stress, relief, excitement, sadness), comfort a stressed friend, and handle sensitive conversations with empathy.',
		estimatedMinutes: 15,
		characterHost: {
			name: 'Xiao Meng (小萌)',
			avatarEmoji: '👧',
			intro:
				'True connection requires empathy. Let’s learn how to express feelings, console friends through tough moments, and share genuine warmth.'
		},
		pronunciationLab: {
			title: 'Emotional Adjectives and Particle 了',
			explanation: 'Emotions are dynamic changes of state, so 了 is frequently used:',
			items: [
				{
					pinyin: '开心 / 难过 (kāixīn / nánguò)',
					hanzi: '他太开心了 / 别难过了',
					tone: 'Happy / Sad',
					audioText: '他太开心了 别难过了',
					tip: '难过 literally means "hard to pass through".'
				},
				{
					pinyin: '着急 / 放心 (zháojí / fàngxīn)',
					hanzi: '别着急，慢慢来 / 请放心',
					tone: 'Anxious / Put heart at ease',
					audioText: '别着急 慢慢来 请放心',
					tip: '放心 means "release the heart" — the supreme Chinese reassurance.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '小萌，看你叹气，是不是遇到什么烦心事了？',
				pinyin: 'Xiǎoméng, kàn nǐ tànqì, shì bu shì yùdào shénme fánxīn shì le?',
				english: 'Xiao Meng, seeing you sigh, did you run into something troublesome?',
				audioText: '小萌，看你叹气，是不是遇到什么烦心事了？'
			},
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '唉，最近期末考试压力特别大，我昨晚复习到凌晨两点，还是担心考不好。',
				pinyin:
					'Ài, zuìjìn qīmò kǎoshì yālì tèbié dà, wǒ zuówǎn fùxí dào língchén liǎng diǎn, háishi dānxīn kǎo bù hǎo.',
				english:
					'Sigh, recently final exam pressure has been huge; I studied until 2:00 AM last night, and I am still worried I will not do well.',
				audioText: '唉，最近期末考试压力特别大，我昨晚复习到凌晨两点，还是担心考不好。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '别太焦虑了！你平时学习那么用功，一定没问题的。先好好吃顿饭，休息一下吧。',
				pinyin:
					'Bié tài jiāolǜ le! Nǐ píngshí xuéxí nàme yònggōng, yídìng méi wèntí de. Xiān hǎohǎo chī dùn fàn, xiūxi yíxià ba.',
				english:
					'Don’t be too anxious! You work so hard normally, you will definitely be fine. Have a good meal first and rest a bit.',
				audioText: '别太焦虑了！你平时学习那么用功，一定没问题的。先好好吃顿饭，休息一下吧。'
			},
			{
				speaker: 'Xiao Meng',
				avatarEmoji: '👧',
				hanzi: '听你这么说，我心里轻松多了。谢谢你的安慰！',
				pinyin: 'Tīng nǐ zhème shuō, wǒ xīnlǐ qīngsōng duō le. Xièxie nǐ de ānwèi!',
				english: 'Hearing you say that, my heart feels much lighter. Thank you for your comfort!',
				audioText: '听你这么说，我心里轻松多了。谢谢你的安慰！'
			}
		],
		spotlightWords: [
			{
				hanzi: '担心',
				pinyin: 'dānxīn',
				english: 'to worry / anxious',
				mnemonic: 'Carrying (担) a heavy heart (心).',
				toneNumber: 1
			},
			{
				hanzi: '放心',
				pinyin: 'fàngxīn',
				english: 'to set one’s mind at ease / rest assured',
				mnemonic: 'Letting go (放) of heart tension (心).',
				toneNumber: 4
			},
			{
				hanzi: '压力',
				pinyin: 'yālì',
				english: 'stress / pressure',
				mnemonic: 'Press down (压) force (力).',
				toneNumber: 1
			},
			{
				hanzi: '别……了',
				pinyin: 'bié... le',
				english: 'stop / don’t do anymore',
				mnemonic: '别担心了 (stop worrying), 别着急了 (don’t panic).',
				toneNumber: 2
			}
		],
		patternBox: {
			title: 'Reassurance Formula: 别 + [Emotion / Action] + 了',
			formula: '别 + [Negative State] + 了 ， 慢慢来 / 会好的',
			slots: [
				{ label: 'Command to Cease', example: '别担心了 (Stop worrying)', pinyin: 'bié dānxīn le' },
				{
					label: 'Comforting follow-up',
					example: '一切都会好的 (Everything will be alright)',
					pinyin: 'yíqiè dōu huì hǎo de'
				}
			],
			notes:
				'The particle 了 here indicates a request to halt an ongoing emotional state: 别哭了 (Stop crying), 别想太多了 (Don’t overthink it).'
		},
		pragmaticTip: {
			title: 'The Golden Reassurance: "慢慢来" (Take It Slow)',
			tip: 'When a Chinese friend or colleague is stressed, overwhelmed, or apologizing for an error, the warmest response is 慢慢来 (Mànman lái = Take it slow / No rush). It immediately de-escalates tension.',
			naturalExample: {
				hanzi: '没关系，慢慢来，不着急。',
				pinyin: 'Méi guānxi, mànman lái, bù zháojí.',
				english: 'No problem, take your time, there is no hurry.'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the most comforting and idiomatic Chinese expression when telling someone not to panic?',
				options: ['别着急，慢慢来。', '快点快点！', '为什么哭？', '你必须着急。'],
				correctIndex: 0,
				explanation:
					'别着急，慢慢来 (Don’t panic, take it one step at a time) is the standard expression of empathy and patience.'
			},
			wordReorder: {
				sentenceHanzi: '听你这么说我心里轻松多了',
				sentencePinyin: 'Tīng nǐ zhème shuō wǒ xīnlǐ qīngsōng duō le',
				sentenceEnglish: 'Hearing you say that my heart feels much lighter',
				shuffledWords: ['我心里轻松多了', '听你这么说'],
				wordPinyinMap: {
					听你这么说: 'tīng nǐ zhème shuō',
					我心里轻松多了: 'wǒ xīnlǐ qīngsōng duō le'
				}
			},
			roleplayCheck: {
				situation: 'Your friend failed their driving test and is feeling disheartened.',
				prompt: 'How do you console them warmly?',
				options: [
					{
						hanzi: '别难过了，这次只是运气不好，下次一定能过！我请你喝奶茶。',
						pinyin:
							'Bié nánguò le, zhè cì zhǐshì yùnqì bù hǎo, xià cì yídìng néng guò! Wǒ qǐng nǐ hē nǎichá.',
						english:
							'Don’t be sad, it was just bad luck this time, you will definitely pass next time! Let me treat you to boba.',
						isCorrect: true,
						feedback: 'Empathetic, encouraging, and supportive.'
					},
					{
						hanzi: '你真笨！',
						pinyin: 'Nǐ zhēn bèn!',
						english: 'You are so stupid!',
						isCorrect: false,
						feedback: 'Cruel and inappropriate.'
					},
					{
						hanzi: '买单结账！',
						pinyin: 'Mǎidān jiézhàng!',
						english: 'Check please!',
						isCorrect: false,
						feedback: 'Completely out of context.'
					}
				]
			}
		},
		xpReward: 15
	},
	{
		id: 'unit-22',
		unitNumber: 22,
		partNumber: 4,
		partTitle: 'Part IV: Conversational Fluency',
		stage: 'Lower Intermediate',
		title: 'Conversation Management',
		chineseTitle: '把控对话',
		subtitle: 'Turn-taking, polite interruptions, clarification, and repairs',
		milestoneGoal:
			'Control the pace of conversation, ask for repetition politely (请再说一遍), clarify meaning (你的意思是……), and change subjects naturally.',
		estimatedMinutes: 16,
		characterHost: {
			name: 'Teacher Li (李老师)',
			avatarEmoji: '👨‍🏫',
			intro:
				'Milestone Unit 22! Fluency does not mean knowing every single word; it means managing the interaction smoothly when you do NOT know a word!'
		},
		pronunciationLab: {
			title: 'Repair Phrasing: 不好意思，请慢一点',
			explanation: 'Use clear, courteous expressions when communication hits a barrier.',
			items: [
				{
					pinyin: '请再说一遍 (qǐng zài shuō yí biàn)',
					hanzi: '请您再说一遍，可以吗？',
					tone: 'Polite Request for Repetition',
					audioText: '请您再说一遍 可以吗？',
					tip: 'Use 遍 (biàn) for repeating an entire action from start to finish.'
				},
				{
					pinyin: '你的意思是…… (nǐ de yìsi shì...)',
					hanzi: '你的意思是说……',
					tone: 'Confirming Understanding',
					audioText: '你的意思是说 我们明天不用去了？',
					tip: 'Echo back what you understood to verify mutual agreement.'
				}
			]
		},
		dialogue: [
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '李老师，不好意思，打断一下。刚才那个词我没太听清楚，请问是什么意思？',
				pinyin:
					'Lǐ lǎoshī, bù hǎoyìsi, dǎduàn yíxià. Gāngcái nà ge cí wǒ méi tài tīng qīngchu, qǐngwèn shì shénme yìsi?',
				english:
					'Teacher Li, sorry to interrupt for a second. I didn’t quite catch that word just now; may I ask what it means?',
				audioText: '李老师，不好意思，打断一下。刚才那个词我没太听清楚，请问是什么意思？'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '没关系！我说的是“举一反三”，意思是学到一个知识，就能推断出其他同类道理。',
				pinyin:
					'Méi guānxi! Wǒ shuō de shì “jǔ yī fǎn sān”, yìsi shì xuédào yí ge zhīshi, jiù néng tuīduàn chū qítā tónglèi dàolǐ.',
				english:
					'No problem! I said “jǔ yī fǎn sān”, meaning when you learn one principle, you can deduce other related instances.',
				audioText: '没关系！我说的是“举一反三”，意思是学到一个知识，就能推断出其他同类道理。'
			},
			{
				speaker: 'David',
				avatarEmoji: '👱',
				hanzi: '噢！你的意思是举一反三就像“触类旁通”一样，可以举反例推导，对吗？',
				pinyin:
					'Ò! Nǐ de yìsi shì jǔ yī fǎn sān jiù xiàng “chù lèi páng tōng” yíyàng, kěyǐ jǔ fǎnlì tuīdǎo, duì ma?',
				english:
					'Oh! Your meaning is that it is like understanding by analogy, deducing from one example, right?',
				audioText: '噢！你的意思是举一反三就像“触类旁通”一样，可以举反例推导，对吗？'
			},
			{
				speaker: 'Teacher Li',
				avatarEmoji: '👨‍🏫',
				hanzi: '太棒了！理解得非常准确。大卫，你的沟通策略越来越成熟了。',
				pinyin:
					'Tài bàng le! Lǐjiě de fēicháng zhǔnquè. Dàwèi, nǐ de gōutōng cèlüè yuè lái yuè chéngshú le.',
				english:
					'Terrific! You understood it with exact precision. David, your communication strategies are becoming ever more mature.',
				audioText: '太棒了！理解得非常准确。大卫，你的沟通策略越来越成熟了。'
			}
		],
		spotlightWords: [
			{
				hanzi: '打断一下',
				pinyin: 'dǎduàn yíxià',
				english: 'pardon the interruption',
				mnemonic: 'Break (断) flow politely for a second (一下).',
				toneNumber: 3
			},
			{
				hanzi: '听清楚',
				pinyin: 'tīng qīngchu',
				english: 'to hear clearly',
				mnemonic: 'Listen (听) with result of clarity (清楚).',
				toneNumber: 1
			},
			{
				hanzi: '意思是',
				pinyin: 'yìsi shì',
				english: 'the meaning is... / you mean to say...',
				mnemonic: 'Intention/meaning (意思) is (是).',
				toneNumber: 4
			},
			{
				hanzi: '换句话说',
				pinyin: 'huàn jù huà shuō',
				english: 'in other words / put another way',
				mnemonic: 'Change (换) a sentence (句话) to say (说).',
				toneNumber: 4
			}
		],
		patternBox: {
			title: 'Clarification Frame: 你的意思是说……对吗？',
			formula: '你的意思是说 + [Paraphrase] + ，对吗 / 是这样吗？',
			slots: [
				{
					label: 'Clarification Frame',
					example: '你的意思是说 (Your meaning is to say)',
					pinyin: 'nǐ de yìsi shì shuō'
				},
				{
					label: 'Restatement',
					example: '我们必须重新写报告 (we have to rewrite the report)',
					pinyin: 'wǒmen bìxū chóngxīn xiě bàogào'
				},
				{ label: 'Confirmation Tag', example: '对吗？ (right?)', pinyin: 'duì ma' }
			],
			notes:
				'Paraphrasing what the counterpart said ensures zero misunderstandings in negotiations or professional talks.'
		},
		pragmaticTip: {
			title: 'Pivoting Subjects Smoothly: "对了，……"',
			tip: 'To change topics naturally without being abrupt, use 对了，…… (Duì le,... = Oh by the way,...) or 顺便问一下 (Shùnbiàn wèn yíxià = While we are at it, may I ask...).',
			naturalExample: {
				hanzi: '对了，下周的活动你参加吗？',
				pinyin: 'Duì le, xià zhōu de huódòng nǐ cānjiā ma?',
				english: 'By the way, are you participating in next week’s event?'
			}
		},
		miniCheck: {
			comprehension: {
				question:
					'What is the most courteous and natural phrase to politely interrupt a speaker to seek clarification?',
				options: ['不好意思，打断一下。', '闭嘴！', '你别说了。', '停下！'],
				correctIndex: 0,
				explanation:
					'不好意思，打断一下 (Excuse me, pardon the brief interruption) is universally polite and professional.'
			},
			wordReorder: {
				sentenceHanzi: '刚才那个词我没太听清楚',
				sentencePinyin: 'Gāngcái nà ge cí wǒ méi tài tīng qīngchu',
				sentenceEnglish: 'I did not quite hear that word clearly just now',
				shuffledWords: ['我没太听清楚', '刚才那个词'],
				wordPinyinMap: { 刚才那个词: 'gāngcái nà ge cí', 我没太听清楚: 'wǒ méi tài tīng qīngchu' }
			},
			roleplayCheck: {
				situation: 'Your conversation partner spoke too fast and you missed a sentence.',
				prompt: 'How do you ask them to speak more slowly?',
				options: [
					{
						hanzi: '不好意思，请您说得慢一点儿，可以吗？',
						pinyin: 'Bù hǎoyìsi, qǐng nín shuō de màn yìdiǎnr, kěyǐ ma?',
						english: 'Excuse me, could you please speak a little more slowly?',
						isCorrect: true,
						feedback:
							'Superb! Respectful pronoun 您 + soft request 一点儿 + permission check 可以吗.'
					},
					{
						hanzi: '太快了，不要说！',
						pinyin: 'Tài kuài le, bú yào shuō!',
						english: 'Too fast, do not speak!',
						isCorrect: false,
						feedback: 'Inappropriately rude.'
					},
					{
						hanzi: '你叫什么名字？',
						pinyin: 'Nǐ jiào shénme míngzi?',
						english: 'What is your name?',
						isCorrect: false,
						feedback: 'Completely irrelevant.'
					}
				]
			}
		},
		xpReward: 15
	}
];
