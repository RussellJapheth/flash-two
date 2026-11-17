export interface PragmaticsStrategy {
	id: string;
	functionName: string;
	chineseName: string;
	situation: string;
	keyPhrases: {
		hanzi: string;
		pinyin: string;
		english: string;
		toneUsage: string;
	}[];
	exampleExchange: {
		speakerA: string;
		hanziA: string;
		pinyinA: string;
		englishA: string;
		speakerB: string;
		hanziB: string;
		pinyinB: string;
		englishB: string;
		comment: string;
	};
}

export const CONVERSATION_STRATEGIES: PragmaticsStrategy[] = [
	{
		id: 'extend-conversation',
		functionName: 'Extending Conversation beyond One-Word Answers',
		chineseName: '延伸对话 · 避免一字冷场',
		situation:
			'When asked a yes/no or preference question, give a reason, add detail, and bounce back.',
		keyPhrases: [
			{
				hanzi: '特别喜欢……，因为……你呢？',
				pinyin: 'Tèbié xǐhuan..., yīnwèi... Nǐ ne?',
				english: 'I especially like..., because... How about you?',
				toneUsage: 'Invites genuine mutual sharing'
			},
			{
				hanzi: '我觉得挺好的，不过……',
				pinyin: 'Wǒ juéde tǐng hǎo de, búguò...',
				english: 'I think it’s quite good, though...',
				toneUsage: 'Softened balanced perspective'
			}
		],
		exampleExchange: {
			speakerA: 'Xiao Ming',
			hanziA: '你喜欢中国菜吗？',
			pinyinA: 'Nǐ xǐhuan Zhōngguócài ma?',
			englishA: 'Do you like Chinese food?',
			speakerB: 'David',
			hanziB: '喜欢！特别喜欢四川菜，因为味道很丰富。你平时喜欢吃什么？',
			pinyinB:
				'Xǐhuan! Tèbié xǐhuan Sìchuāncài, yīnwèi wèidào hěn fēngfù. Nǐ píngshí xǐhuan chī shénme?',
			englishB:
				'Yes! I especially like Sichuan food because the flavor is so rich. What do you usually like eating?',
			comment:
				'Notice how David gives an enthusiastic answer, names a specific cuisine, gives a reason, and bounces back an open-ended question.'
		}
	},
	{
		id: 'soften-suggestions',
		functionName: 'Softening Suggestions & Indirect Refusals',
		chineseName: '委婉建议与礼貌拒绝',
		situation:
			'Avoiding abrupt disagreement or commanding imperatives in social and workplace settings.',
		keyPhrases: [
			{
				hanzi: '要不我们……？',
				pinyin: 'Yàobù wǒmen...?',
				english: 'How about we... / What if we...?',
				toneUsage: 'Extremely polite, collaborative suggestion'
			},
			{
				hanzi: '我可能不太方便……',
				pinyin: 'Wǒ kěnéng bú tài fāngbiàn...',
				english: 'I might not be very convenient... (polite decline)',
				toneUsage: 'Saves face without direct rejection'
			},
			{
				hanzi: '看情况吧。',
				pinyin: 'Kàn qíngkuàng ba.',
				english: 'Let’s see how things go / It depends.',
				toneUsage: 'Diplomatic buffer'
			}
		],
		exampleExchange: {
			speakerA: 'Linna',
			hanziA: '今晚我们一起去聚餐怎么样？',
			pinyinA: 'Jīnwǎn wǒmen yìqǐ qù jùcān zěnmeyàng?',
			englishA: 'How about we go out for dinner together tonight?',
			speakerB: 'Teacher Li',
			hanziB: '今晚我可能有点儿事情，要不明天中午再去？',
			pinyinB: 'Jīnwǎn wǒ kěnéng yǒudiǎnr shìqing, yàobù míngtiān zhōngwǔ zài qù?',
			englishB: 'I might have some errands tonight; how about we go tomorrow at lunch instead?',
			comment:
				'Uses 可能有点儿事情 (gentle soften) + 要不……再去 (proposing a thoughtful alternative).'
		}
	},
	{
		id: 'conversation-repair',
		functionName: 'Conversation Repair & Clarification',
		chineseName: '交际修复 · 澄清与化解',
		situation:
			'When you did not catch what was said or need the speaker to adjust pace without panic.',
		keyPhrases: [
			{
				hanzi: '不好意思，请您说得慢一点儿。',
				pinyin: 'Bù hǎoyìsi, qǐng nín shuō de màn yìdiǎnr.',
				english: 'Excuse me, could you please speak a little slower?',
				toneUsage: 'Clear, polite request'
			},
			{
				hanzi: '你的意思是……对吗？',
				pinyin: 'Nǐ de yìsi shì... duì ma?',
				english: 'Do you mean that..., right?',
				toneUsage: 'Confirming comprehension'
			},
			{
				hanzi: '这个用中文怎么说？',
				pinyin: 'Zhè ge yòng zhōngwén zěnme shuō?',
				english: 'How do you say this in Chinese?',
				toneUsage: 'Spontaneous elicitation tool'
			}
		],
		exampleExchange: {
			speakerA: 'Master Zhang',
			hanziA: '师傅，您前头那疙瘩右拐就到了。',
			pinyinA: 'Shīfu, nín qiántou nà gēda yòuguǎi jiù dào le.',
			englishA: 'Buddy, turn right at that spot up ahead and you’re there.',
			speakerB: 'David',
			hanziB: '不好意思，您的意思是前面路口右转对吗？',
			pinyinB: 'Bù hǎoyìsi, nín de yìsi shì qiánmian lùkǒu yòuzhuǎn duì ma?',
			englishB: 'Excuse me, do you mean turn right at the intersection ahead, right?',
			comment:
				'Paraphrasing local colloquial slang (那疙瘩) with standard Chinese (前面路口) keeps the interaction flowing seamlessly.'
		}
	}
];
