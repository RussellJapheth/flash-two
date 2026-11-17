export interface GrammarEntry {
	id: string;
	category: string;
	chineseTitle: string;
	title: string;
	formula: string;
	explanation: string;
	usageConditions: string[];
	examples: {
		hanzi: string;
		pinyin: string;
		english: string;
	}[];
	contrasts?: {
		label: string;
		explanation: string;
		rightHanzi: string;
		rightPinyin: string;
		wrongHanzi?: string;
		wrongPinyin?: string;
		tip: string;
	}[];
	commonMistakes: string[];
	associatedUnits: number[];
}

export const TEXTBOOK_GRAMMAR_CURRICULUM: GrammarEntry[] = [
	{
		id: 'sentence-order',
		category: 'A. Sentence Structure',
		chineseTitle: '基本语序：主语 + 时间 + 地点 + 动词 + 宾语',
		title: 'Basic Sentence Order (Subject + Time + Place + Action)',
		formula: 'Subject + Time When + Place (在...) + Verb + Object',
		explanation:
			'Unlike English where time and location often go at the very end of a sentence ("I drink coffee at 8 AM in the cafe"), Mandarin strictly places Time and Place BEFORE the main action. The setting comes before the event.',
		usageConditions: [
			'Time expressions can appear directly before or after the subject: 我明天去 (Wǒ míngtiān qù) or 明天我去 (Míngtiān wǒ qù).',
			'Place phrases with 在 (zài) precede the verb when indicating where an action occurs: 在家吃饭 (eat at home), not 吃饭在家.',
			'Adjectives act as predicates directly without 是 (shì) — use 很 (hěn) instead.'
		],
		examples: [
			{
				hanzi: '我明天在公司开会。',
				pinyin: 'Wǒ míngtiān zài gōngsī kāihuì.',
				english: 'I have a meeting at the company tomorrow. (Subj + Time + Place + Verb)'
			},
			{
				hanzi: '今天天气很好。',
				pinyin: 'Jīntiān tiānqì hěn hǎo.',
				english: 'The weather today is very good. (Adjective predicate with 很, no 是).'
			},
			{
				hanzi: '这本书我看过了。',
				pinyin: 'Zhè běn shū wǒ kàn guo le.',
				english: 'This book, I have already read. (Topic-Comment structure).'
			}
		],
		contrasts: [
			{
				label: 'Adjective Predicates vs Copula 是',
				explanation: 'Do not use 是 with adjectives unless using the 是……的 structure.',
				rightHanzi: '他很高。',
				rightPinyin: 'Tā hěn gāo.',
				wrongHanzi: '他是很高。*(unnatural)',
				wrongPinyin: 'Tā shì hěn gāo.',
				tip: '很 acts as an unstressed structural link here, not strictly "very".'
			}
		],
		commonMistakes: [
			'Putting time words at the end of the sentence (*我喝咖啡在早上).',
			'Using 是 before adjectives (*他是很忙 instead of 他很忙).'
		],
		associatedUnits: [1, 4, 11]
	},
	{
		id: 'questions-negation',
		category: 'B. Questions & Negation',
		chineseTitle: '疑问与否定：不 vs 没',
		title: 'Questions and Negation (不 vs 没 / 没有)',
		formula: '不 (bù) + Stative/Future Verb | 没(有) (méiyǒu) + Completed/Past Action',
		explanation:
			'不 negates habits, desires, stative verbs, and future intentions ("do not / will not"). 没(有) negates past actions, completed events, and possession ("did not / has not / do not have").',
		usageConditions: [
			'Use 没 with 有 (没有) for "do not have" or "there is not". Never say *不有.',
			'Use 不 for adjectives, habitual actions, and modal verbs (会, 想, 要, 能).',
			"Never use 了 in a clause negated by 没: say 我没去 (I didn't go), not *我没去了."
		],
		examples: [
			{
				hanzi: '我今天不去学校。',
				pinyin: 'Wǒ jīntiān bú qù xuéxiào.',
				english: 'I am not going to school today. (Habitual / intention: 不)'
			},
			{
				hanzi: '我昨天没去学校。',
				pinyin: 'Wǒ zuótiān méi qù xuéxiào.',
				english: 'I did not go to school yesterday. (Past occurrence: 没)'
			},
			{
				hanzi: '你吃早饭了吗？',
				pinyin: 'Nǐ chī zǎofàn le ma?',
				english: 'Have you eaten breakfast? (Yes/No question with 吗)'
			}
		],
		contrasts: [
			{
				label: '我不吃肉 vs 我没吃肉',
				explanation: '不 negates habit/preference; 没 negates whether the action happened.',
				rightHanzi: '我不吃肉（我是素食者） vs 我刚才没吃肉。',
				rightPinyin: "Wǒ bù chī ròu (vegetarian) vs Wǒ gāngcái méi chī ròu (didn't eat just now).",
				tip: 'Remember: 不 for willingness/habit; 没 for completion/occurrence.'
			}
		],
		commonMistakes: [
			'Saying *不有 instead of 没有.',
			'Attaching 了 to a negative sentence (*我没买了票 instead of 我没买票).'
		],
		associatedUnits: [4, 5, 10]
	},
	{
		id: 'measure-words',
		category: 'C. Classifiers & Measure Words',
		chineseTitle: '量词体系：个、本、张、杯、位、条、件',
		title: 'Measure Words (Classifiers)',
		formula: 'Number / Demonstrative (这/那) + Measure Word + Noun',
		explanation:
			'In Mandarin, a number or demonstrative cannot directly modify a noun without a dedicated classifier or measure word. Each noun category pairs with a specific measure word based on its shape or domain.',
		usageConditions: [
			'个 (ge): General default classifier for people, fruits, concepts.',
			'本 (běn): Bound items (books, magazines, passports).',
			'张 (zhāng): Flat surfaces (paper, tickets, tables, photos).',
			'杯 (bēi): Cups and glasses of beverages.',
			'位 (wèi): Polite classifier for guests, teachers, doctors.',
			'条 (tiáo): Long, flexible items (roads, rivers, fish, pants).',
			'件 (jiàn): Upper-body clothes, matters, gifts.'
		],
		examples: [
			{
				hanzi: '两杯热咖啡和三本书。',
				pinyin: 'Liǎng bēi rè kāfēi hé sān běn shū.',
				english: 'Two cups of hot coffee and three books.'
			},
			{
				hanzi: '请问有几位客人？',
				pinyin: 'Qǐngwèn yǒu jǐ wèi kèrén?',
				english: 'May I ask how many guests there are? (Polite 位)'
			},
			{
				hanzi: '我想买这件衬衫。',
				pinyin: 'Wǒ xiǎng mǎi zhè jiàn chènshān.',
				english: 'I would like to buy this shirt. (件 for clothing)'
			}
		],
		contrasts: [
			{
				label: '二 (èr) vs 两 (liǎng) with Measure Words',
				explanation: 'When counting quantity before a measure word, always use 两, never 二.',
				rightHanzi: '两个星期 / 两张票',
				rightPinyin: 'Liǎng ge xīngqī / Liǎng zhāng piào',
				wrongHanzi: '二个星期 / 二张票 *(incorrect)',
				wrongPinyin: 'Èr ge xīngqī / Èr zhāng piào',
				tip: 'Use 二 for digits and ordinal numbers (第二, 二十); use 两 for "two of something".'
			}
		],
		commonMistakes: [
			'Omitting the measure word (*三书 instead of 三本书).',
			'Using 二 instead of 两 before a measure word (*二个人 instead of 两个人).'
		],
		associatedUnits: [5, 7, 8]
	},
	{
		id: 'aspect-markers',
		category: 'D. Aspect & Event Structure',
		chineseTitle: '体貌标记：了、过、着、正在',
		title: 'Aspect Markers (了, 过, 着, 正在)',
		formula:
			'Verb + 了 (completed) | Verb + 过 (experience) | Verb + 着 (ongoing state) | 正在 + Verb (active process)',
		explanation:
			'Mandarin verbs do not conjugate for past, present, or future tense. Instead, aspect markers express whether an action is completed (了), experienced in the past (过), continuing as a background state (着), or in progress right now (正在).',
		usageConditions: [
			'Verb + 了: Marks completion of an action or change of situation, NOT simply "past tense".',
			'Verb + 过: Past experiential aspect ("have ever done before").',
			'Verb + 着: Continuous state or manner ("wearing glasses", "door is open", "speaking while smiling").',
			'正在 + Verb: Dynamic ongoing action ("is currently doing").'
		],
		examples: [
			{
				hanzi: '我去过两次北京。',
				pinyin: 'Wǒ qù guo liǎng cì Běijīng.',
				english: 'I have been to Beijing twice. (Past experience: 过)'
			},
			{
				hanzi: '他正在厨房做晚饭。',
				pinyin: 'Tā zhèngzài chúfáng zuò wǎnfàn.',
				english: 'He is currently cooking dinner in the kitchen. (Active action: 正在)'
			},
			{
				hanzi: '门开着，请进。',
				pinyin: 'Mén kāi zhe, qǐng jìn.',
				english: 'The door is open (standing open), please come in. (Continuous state: 着)'
			}
		],
		contrasts: [
			{
				label: '了 vs 过 for Past Events',
				explanation: '了 marks an event as completed; 过 emphasizes life experience that is over.',
				rightHanzi:
					'我吃了晚饭 (I finished dinner) vs 我吃过烤鸭 (I have tasted Peking duck before).',
				rightPinyin: 'Wǒ chī le wǎnfàn vs Wǒ chī guo kǎoyā.',
				tip: 'If you want to know if someone has ever tried something in their life, always ask with 过.'
			}
		],
		commonMistakes: [
			'Treating 了 as equivalent to English past tense and placing it after every past verb.',
			'Using 过 when referring to a specific completed instance (*我昨天去过超市 instead of 我昨天去了超市).'
		],
		associatedUnits: [11, 14, 15]
	},
	{
		id: 'complements',
		category: 'E. Complements of Verb',
		chineseTitle: '补语体系：结果补语、可能补语、趋向补语、程度补语',
		title: 'Verb Complements (Result, Potential, Direction, Degree)',
		formula: 'Verb + Result / Verb + 得/不 + Complement / Verb + 来/去',
		explanation:
			'Complements provide vital information following the verb: whether the action was understood (听懂), finished (做完), capable of being done (听得懂/做不完), direction toward or away (走过来/带回去), or degree (跑得快).',
		usageConditions: [
			'Resultative Complements: 听懂 (hear & understand), 看见 (look & see), 找到 (seek & find), 做完 (do & finish).',
			'Potential Complements: Verb + 得 + Comp ("can succeed") vs Verb + 不 + Comp ("cannot succeed"). e.g., 听得懂 (can understand) vs 听不懂 (cannot understand).',
			'Directional Complements: 来 (toward speaker) vs 去 (away from speaker). e.g., 进来看 (come in and look) vs 走出去 (walk out).',
			'Degree Complements: Verb + 得 + Adjective/Description. e.g., 他中文说得非常流利。'
		],
		examples: [
			{
				hanzi: '你说得太快了，我听不懂。',
				pinyin: 'Nǐ shuō de tài kuài le, wǒ tīng bu dǒng.',
				english: 'You are speaking too fast, I cannot understand (potential complement).'
			},
			{
				hanzi: '我们把作业做完了。',
				pinyin: 'Wǒmen bǎ zuòyè zuò wán le.',
				english: 'We have finished doing the homework (resultative complement).'
			},
			{
				hanzi: '快进来吧，外面很冷！',
				pinyin: 'Kuài jìnlái ba, wàimiàn hěn lěng!',
				english: 'Come on in, it is very cold outside! (Directional complement).'
			}
		],
		contrasts: [
			{
				label: '不能看 vs 看不懂',
				explanation:
					'不能看 means "not permitted or physically impossible to look"; 看不懂 means "can see the text but unable to comprehend the meaning".',
				rightHanzi: '这个字我看得见，但是看不懂。',
				rightPinyin: 'Zhè ge zì wǒ kàn de jiàn, dànshì kàn bu dǒng.',
				tip: 'Use potential complements (看得懂/看不懂) for cognitive ability to absorb.'
			}
		],
		commonMistakes: [
			'Using 不能 + Verb instead of potential complement (*我不能听懂 instead of 我听不懂).',
			'Confusing 得 in degree complement (*他说好 instead of 他说得很好).'
		],
		associatedUnits: [15, 16, 27]
	},
	{
		id: 'comparisons',
		category: 'F. Comparisons & Degree',
		chineseTitle: '比较句：比、没有、跟……一样、越来越',
		title: 'Comparisons & Degree (比, 没有, 跟……一样)',
		formula: 'A + 比 + B + Adjective (+ Difference) | A + 没有 + B + Adjective',
		explanation:
			'Expressing differences in degree. Mandarin uses 比 for superior degree ("A is more... than B") and 没有 for inferior degree ("A is not as... as B").',
		usageConditions: [
			'Never put 很 (hěn) after 比! Say A 比 B 大, NOT *A 比 B 很大.',
			'To express degree difference, put it at the end: A 比 B 大三岁 (A is 3 years older than B).',
			'Negation of comparison: A 没有 B + Adj (A is not as... as B).',
			'Equality comparison: A 跟/和 B 一样 (+ Adj).'
		],
		examples: [
			{
				hanzi: '高铁比飞机更方便。',
				pinyin: 'Gāotiě bǐ fēijī gèng fāngbiàn.',
				english: 'High-speed rail is even more convenient than airplanes.'
			},
			{
				hanzi: '今天没有昨天冷。',
				pinyin: 'Jīntiān méiyǒu zuótiān lěng.',
				english: 'Today is not as cold as yesterday.'
			},
			{
				hanzi: '我的想法跟你一样。',
				pinyin: 'Wǒ de xiǎngfǎ gēn nǐ yíyàng.',
				english: 'My thinking is the same as yours.'
			}
		],
		contrasts: [
			{
				label: '比 with Difference at End',
				explanation: 'The specific degree of difference goes after the adjective, not before.',
				rightHanzi: '哥哥比我大两岁。',
				rightPinyin: 'Gēge bǐ wǒ dà liǎng suì.',
				wrongHanzi: '哥哥比我两岁大。*(incorrect)',
				wrongPinyin: 'Gēge bǐ wǒ liǎng suì dà.',
				tip: 'Formula: A + 比 + B + Adj + [Difference Quantity].'
			}
		],
		commonMistakes: [
			'Adding 很 after 比 (*他比我很高).',
			'Using 不比 when simply meaning "not as... as" (use 没有 instead).'
		],
		associatedUnits: [8, 16, 20]
	},
	{
		id: 'ba-bei-constructions',
		category: 'G. Special Constructions',
		chineseTitle: '处置与被动：把字句与被字句',
		title: 'The 把 (Disposal) and 被 (Passive) Structures',
		formula:
			'Subject + 把 + Object + Verb + Result/Disposal | Receiver + 被 + (Agent) + Verb + Result',
		explanation:
			'把 brings a specific, known object to the front of the verb to emphasize what happens to it, how it is disposed of, moved, or altered. 被 expresses passive voice, often denoting adversity or outcome.',
		usageConditions: [
			'The object in a 把 sentence must be definite and known to both speakers.',
			'The verb in a 把 sentence cannot stand alone; it MUST have a complement, 了, or directional phrase attached.',
			'Modal verbs (想, 要, 可以) and negation (没) go BEFORE 把: 我没把手机带来.',
			'被 marks passive action: 手机被偷了 (phone was stolen).'
		],
		examples: [
			{
				hanzi: '请把门关上。',
				pinyin: 'Qǐng bǎ mén guān shàng.',
				english: 'Please shut the door. (Subj + 把 + Object + Verb + Complement)'
			},
			{
				hanzi: '我把药吃了。',
				pinyin: 'Wǒ bǎ yào chī le.',
				english: 'I have taken the medicine.'
			},
			{
				hanzi: '咖啡被大卫喝完了。',
				pinyin: 'Kāfēi bèi Dàwèi hē wán le.',
				english: 'The coffee was finished by David.'
			}
		],
		contrasts: [
			{
				label: 'Bare Verb vs Completed Result in 把',
				explanation: 'You cannot use a bare verb without complement or result in a 把 sentence.',
				rightHanzi: '把书放在桌子上。',
				rightPinyin: 'Bǎ shū fàng zài zhuōzi shàng.',
				wrongHanzi: '把书放。*(incomplete)',
				wrongPinyin: 'Bǎ shū fàng.',
				tip: 'A 把 sentence always tells where the object ended up or what condition it reached.'
			}
		],
		commonMistakes: [
			'Using a bare verb without a result or complement (*我把咖啡喝).',
			'Putting negation after 把 (*我把手机没带 instead of 我没把手机带).'
		],
		associatedUnits: [16, 20, 22]
	},
	{
		id: 'conversational-particles',
		category: 'H. Modal Particles & Discourse',
		chineseTitle: '语气助词：了、呢、吧、啊、嘛、呗',
		title: 'Conversational Particles (呢, 吧, 啊, 嘛, 呗)',
		formula: 'Statement + [Particle] (Adds attitude, tone softening, presumption, or obviousness)',
		explanation:
			"Modal particles at the end of sentences convey the speaker's mood, confidence, politeness, and social alignment. They turn flat sentences into natural, living Mandarin.",
		usageConditions: [
			'吧 (ba): Softens suggestions ("let\'s..."), expresses mild agreement or presumption ("I suppose?").',
			'呢 (ne): Rebounds questions ("and you?"), marks ongoing action, or points out an ongoing fact.',
			'嘛 (ma): Marks something as obvious or self-evident ("obviously!").',
			'呗 (bei): Conveys resignation or casual obviousness ("well, then just...").',
			'啊 (a): Adds warmth, enthusiasm, or exclamation.'
		],
		examples: [
			{
				hanzi: '我们走吧！',
				pinyin: 'Wǒmen zǒu ba!',
				english: 'Let’s go! (Soft suggestion: 吧)'
			},
			{
				hanzi: '这本来就是事实嘛。',
				pinyin: 'Zhè běnlái jiù shì shìshí ma.',
				english: 'Well, this has always been a fact, obviously! (Obviousness: 嘛)'
			},
			{
				hanzi: '不会就学呗。',
				pinyin: 'Bú huì jiù xué bei.',
				english: "If you don't know how, then just learn! (Casual resignation: 呗)"
			}
		],
		contrasts: [
			{
				label: '吧 vs 吗 in Questions',
				explanation:
					'吗 is an open question with no presumption; 吧 seeks confirmation of what you already assume.',
				rightHanzi:
					"你是老师吗？(Do you happen to be a teacher?) vs 你是老师吧？(You're a teacher, right?)",
				rightPinyin: 'Nǐ shì lǎoshī ma? vs Nǐ shì lǎoshī ba?',
				tip: 'Use 吧 when you are 80% sure and want confirmation.'
			}
		],
		commonMistakes: [
			'Confusing 吗 (question) with 嘛 (obviousness).',
			'Overusing bare imperative sentences without 吧, sounding overly curt.'
		],
		associatedUnits: [23, 24, 25]
	}
];
