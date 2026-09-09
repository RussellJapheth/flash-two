import type { Story } from '$lib/types';

export const BUILTIN_STORIES: Story[] = [
	{
		id: 'midnight-noodles',
		title: 'The Midnight Noodle Shop',
		subtitle: '深夜面馆 · Order beef noodles & request custom toppings',
		language: 'chinese',
		difficulty: 'Beginner',
		durationMinutes: 3,
		requiresVoice: true,
		baseXP: 45,
		bgImageUrl: '/images/stories/noodle-shop-bg.jpg',
		coverImageUrl: '/images/stories/noodle-shop-bg.jpg',
		characters: {
			chef: {
				id: 'chef',
				name: 'Chef Lao Wang',
				avatarUrl: '/images/stories/avatars/chef.jpg',
				role: 'Noodle Shop Owner'
			}
		},
		startNodeId: 'node-welcome',
		summaryVocabulary: [
			{ word: '欢迎光临', pinyin: 'huānyíng guānglín', meaning: 'Welcome' },
			{ word: '牛肉面', pinyin: 'niúròu miàn', meaning: 'Beef noodles' },
			{ word: '香菜', pinyin: 'xiāngcài', meaning: 'Cilantro / Coriander' },
			{ word: '微信支付', pinyin: 'wēixìn zhīfù', meaning: 'WeChat Pay' }
		],
		nodes: {
			'node-welcome': {
				id: 'node-welcome',
				speakerId: 'chef',
				text: '欢迎光临！请问几位？',
				pinyin: 'Huānyíng guānglín! Qǐngwèn jǐ wèi?',
				translation: 'Welcome! How many people, please?',
				audioText: '欢迎光临！请问几位？',
				type: 'choice',
				choices: [
					{
						id: 'choice-1-person',
						text: '一位，谢谢。',
						pinyin: 'Yí wèi, xièxie.',
						translation: 'One person, thank you.',
						nextNodeId: 'node-menu',
						isOptimal: true,
						feedback: 'Polite and natural! The chef smiles and points you to a cozy corner stool.',
						xpReward: 10
					},
					{
						id: 'choice-blunt',
						text: '我要吃面！',
						pinyin: 'Wǒ yào chī miàn!',
						translation: 'I want to eat noodles!',
						nextNodeId: 'node-menu',
						isOptimal: false,
						feedback: 'Direct! The chef chuckles at your eagerness and hands you the menu.',
						xpReward: 5
					}
				]
			},
			'node-menu': {
				id: 'node-menu',
				speakerId: 'chef',
				text: '这是菜单，今天招牌是手工牛肉面！你想吃什么？',
				pinyin: 'Zhè shì càidān, jīntiān zhāopai shì shǒugōng niúròumiàn! Nǐ xiǎng chī shénme?',
				translation:
					'Here is the menu. Today’s specialty is handmade beef noodles! What would you like?',
				audioText: '这是菜单，今天招牌是手工牛肉面！你想吃什么？',
				type: 'cloze',
				cloze: {
					sentence: '我想吃一碗 {blank}。',
					pinyin: 'Wǒ xiǎng chī yī wǎn {blank}.',
					translation: 'I would like a bowl of {blank}.',
					options: ['牛肉面', '苹果', '飞机', '喝水'],
					optionPinyins: {
						牛肉面: 'niúròumiàn',
						苹果: 'píngguǒ',
						飞机: 'fēijī',
						喝水: 'hēshuǐ'
					},
					optionTranslations: {
						牛肉面: 'beef noodles',
						苹果: 'apple',
						飞机: 'airplane',
						喝水: 'drink water'
					},
					correctOption: '牛肉面',
					nextNodeId: 'node-spicy-pref'
				}
			},
			'node-spicy-pref': {
				id: 'node-spicy-pref',
				speakerId: 'chef',
				text: '好咧！一碗牛肉面。要不要辣？',
				pinyin: 'Hǎo lie! Yī wǎn niúròumiàn. Yào bu yào là?',
				translation: 'Alright! One bowl of beef noodles. Do you want it spicy?',
				audioText: '好咧！一碗牛肉面。要不要辣？',
				type: 'choice',
				choices: [
					{
						id: 'choice-mild',
						text: '微辣就好，谢谢！',
						pinyin: 'Wēi là jiù hǎo, xièxie!',
						translation: 'Mild spice is great, thank you!',
						nextNodeId: 'node-cilantro-speech',
						isOptimal: true,
						feedback: 'Perfect level of spice for late-night noodles.',
						xpReward: 10
					},
					{
						id: 'choice-no-spicy',
						text: '不要辣，清汤的。',
						pinyin: 'Bú yào là, qīngtāng de.',
						translation: 'No spice, clear broth please.',
						nextNodeId: 'node-cilantro-speech',
						isOptimal: true,
						feedback: 'Healthy choice! Clean and savory broth.',
						xpReward: 10
					}
				]
			},
			'node-cilantro-speech': {
				id: 'node-cilantro-speech',
				speakerId: 'narrator',
				text: 'You have a strong dislike for cilantro. Tell the chef clearly using your voice!',
				type: 'speech',
				expectedSpeech: {
					target: '请不要放香菜',
					pinyin: 'Qǐng bù yào fàng xiāngcài',
					keywords: ['香菜', '不要'],
					fallbackChoices: [
						{
							id: 'fb-nocilantro',
							text: '请不要放香菜。',
							pinyin: 'Qǐng bù yào fàng xiāngcài.',
							translation: 'Please do not put cilantro.',
							nextNodeId: 'node-cooking',
							isOptimal: true,
							feedback: 'Understood!',
							xpReward: 10
						},
						{
							id: 'fb-morecilantro',
							text: '多放点香菜。',
							pinyin: 'Duō fàng diǎn xiāngcài.',
							translation: 'Put extra cilantro.',
							nextNodeId: 'node-cooking-cilantro',
							isOptimal: false,
							feedback: 'Wait, that means extra cilantro!',
							xpReward: 5
						}
					]
				},
				nextNodeId: 'node-cooking'
			},
			'node-cooking': {
				id: 'node-cooking',
				speakerId: 'chef',
				text: '没问题，不放香菜！面马上煮好！',
				pinyin: 'Méi wèntí, bù fàng xiāngcài! Miàn mǎshàng zhǔ hǎo!',
				translation: 'No problem, no cilantro! The noodles will be ready right away!',
				audioText: '没问题，不放香菜！面马上煮好！',
				type: 'dialogue',
				nextNodeId: 'node-bill'
			},
			'node-cooking-cilantro': {
				id: 'node-cooking-cilantro',
				speakerId: 'chef',
				text: '哈哈，好！给你多加一大把新鲜香菜！',
				pinyin: 'Hāhā, hǎo! Gěi nǐ duō jiā yí dà bǎ xīnxiān xiāngcài!',
				translation: 'Haha, sure! Adding a huge handful of fresh cilantro for you!',
				audioText: '哈哈，好！给你多加一大把新鲜香菜！',
				type: 'dialogue',
				nextNodeId: 'node-bill'
			},
			'node-bill': {
				id: 'node-bill',
				speakerId: 'chef',
				text: '您的面来啦！一共二十五块钱。',
				pinyin: 'Nín de miàn lái la! Yígòng èrshíwǔ kuài qián.',
				translation: 'Here are your noodles! Total is 25 yuan.',
				audioText: '您的面来啦！一共二十五块钱。',
				type: 'choice',
				choices: [
					{
						id: 'choice-wechat',
						text: '可以微信支付吗？',
						pinyin: 'Kěyǐ wēixìn zhīfù ma?',
						translation: 'Can I pay with WeChat Pay?',
						nextNodeId: 'node-finish',
						isOptimal: true,
						feedback: 'Chef points to the QR code on the counter with a smile.',
						xpReward: 15
					},
					{
						id: 'choice-cash',
						text: '给您三十块现金。',
						pinyin: 'Gěi nín sānshí kuài xiànjīn.',
						translation: 'Here is thirty yuan in cash.',
						nextNodeId: 'node-finish',
						isOptimal: true,
						feedback: 'Chef quickly returns five yuan in change.',
						xpReward: 10
					}
				]
			},
			'node-finish': {
				id: 'node-finish',
				speakerId: 'chef',
				text: '收到了！慢用，吃得开心！欢迎下次再来！',
				pinyin: 'Shōudào le! Mànyòng, chī de kāixīn! Huānyíng xià cì zài lái!',
				translation: 'Payment received! Enjoy your meal! Please come again next time!',
				audioText: '收到了！慢用，吃得开心！欢迎下次再来！',
				type: 'dialogue'
			}
		}
	},
	{
		id: 'beijing-subway',
		title: 'Transfer at Beijing Subway',
		subtitle: '北京地铁换乘 · Ask for directions & recharge transit pass',
		language: 'chinese',
		difficulty: 'Intermediate',
		durationMinutes: 4,
		requiresVoice: true,
		baseXP: 60,
		bgImageUrl: '/images/stories/subway-bg.jpg',
		coverImageUrl: '/images/stories/subway-bg.jpg',
		characters: {
			attendant: {
				id: 'attendant',
				name: 'Attendant Li Mei',
				avatarUrl: '/images/stories/avatars/attendant.jpg',
				role: 'Subway Station Officer'
			}
		},
		startNodeId: 'node-subway-start',
		summaryVocabulary: [
			{ word: '地铁站', pinyin: 'dìtiě zhàn', meaning: 'Subway station' },
			{ word: '换乘', pinyin: 'huànchéng', meaning: 'Transfer / Change lines' },
			{ word: '一卡通', pinyin: 'yīkǎtōng', meaning: 'Transit pass' },
			{ word: '充值', pinyin: 'chōngzhí', meaning: 'Recharge / Top up' }
		],
		nodes: {
			'node-subway-start': {
				id: 'node-subway-start',
				speakerId: 'attendant',
				text: '您好！请问需要什么帮助？',
				pinyin: 'Nínhǎo! Qǐngwèn xūyào shénme bāngzhù?',
				translation: 'Hello! How may I assist you?',
				audioText: '您好！请问需要什么帮助？',
				type: 'speech',
				expectedSpeech: {
					target: '请问去工人体育场怎么走',
					pinyin: 'Qǐngwèn qù Gōngrén Tǐyùchǎng zěnme zǒu',
					keywords: ['工人体育场', '怎么走'],
					fallbackChoices: [
						{
							id: 'sub-fb-direction',
							text: '请问去工人体育场怎么走？',
							pinyin: 'Qǐngwèn qù Gōngrén Tǐyùchǎng zěnme zǒu?',
							translation: 'Excuse me, how do I get to Workers’ Stadium?',
							nextNodeId: 'node-subway-direction',
							isOptimal: true,
							feedback: 'Polite inquiry!',
							xpReward: 15
						},
						{
							id: 'sub-fb-line',
							text: '这里是几号线？',
							pinyin: 'Zhèlǐ shì jǐ hào xiàn?',
							translation: 'Which line is this?',
							nextNodeId: 'node-subway-direction',
							isOptimal: false,
							feedback: 'Good question, but asking direct destination is quicker.',
							xpReward: 5
						}
					]
				},
				nextNodeId: 'node-subway-direction'
			},
			'node-subway-direction': {
				id: 'node-subway-direction',
				speakerId: 'attendant',
				text: '去工人体育场请乘坐3号线，前面走到底上电梯就是站台。',
				pinyin:
					'Qù Gōngrén Tǐyùchǎng qǐng chéngzuò sān hào xiàn, qiánmiàn zǒu dàodǐ shàng diàntī jiùshì zhàntái.',
				translation:
					'To go to Workers’ Stadium, please take Line 3. Walk straight to the end and take the escalator to the platform.',
				audioText: '去工人体育场请乘坐3号线，前面走到底上电梯就是站台。',
				type: 'choice',
				choices: [
					{
						id: 'sub-choice-transfer',
						text: '需要换乘吗？',
						pinyin: 'Xūyào huànchéng ma?',
						translation: 'Do I need to transfer?',
						nextNodeId: 'node-subway-transfer-info',
						isOptimal: true,
						feedback: 'Smart follow up question!',
						xpReward: 10
					},
					{
						id: 'sub-choice-ok',
						text: '太好了，谢谢您！',
						pinyin: 'Tài hǎo le, xièxie nín!',
						translation: 'Great, thank you!',
						nextNodeId: 'node-subway-topup-prompt',
						isOptimal: false,
						feedback: 'Direct, but double-checking transfer avoids missing stops.',
						xpReward: 5
					}
				]
			},
			'node-subway-transfer-info': {
				id: 'node-subway-transfer-info',
				speakerId: 'attendant',
				text: '不用换乘，直达两站就到！请记得检查交通卡余额。',
				pinyin: 'Búyòng huànchéng, zhídá liǎng zhàn jiù dào! Qǐng jìde jiǎnchá jiāotōngkǎ yú’é.',
				translation:
					'No transfer needed, direct in two stops! Please remember to check your transit card balance.',
				audioText: '不用换乘，直达两站就到！请记得检查交通卡余额。',
				type: 'cloze',
				cloze: {
					sentence: '我想给我的交通卡 {blank} 五十块。',
					pinyin: 'Wǒ xiǎng gěi wǒ de jiāotōngkǎ {blank} wǔshí kuài.',
					translation: 'I would like to {blank} 50 yuan to my transit card.',
					options: ['充值', '看书', '跑步', '唱歌'],
					optionPinyins: {
						充值: 'chōngzhí',
						看书: 'kànshū',
						跑步: 'pǎobù',
						唱歌: 'chànggē'
					},
					optionTranslations: {
						充值: 'recharge',
						看书: 'read',
						跑步: 'run',
						唱歌: 'sing'
					},
					correctOption: '充值',
					nextNodeId: 'node-subway-end'
				}
			},
			'node-subway-topup-prompt': {
				id: 'node-subway-topup-prompt',
				speakerId: 'attendant',
				text: '进站前请确认交通卡有足够余额哦。',
				pinyin: 'Jìnzhàn qián qǐng quèrèn jiāotōngkǎ yǒu zúgòu yú’é o.',
				translation: 'Please make sure your transit card has enough balance before entering.',
				audioText: '进站前请确认交通卡有足够余额哦。',
				type: 'cloze',
				cloze: {
					sentence: '我想给我的交通卡 {blank} 五十块。',
					pinyin: 'Wǒ xiǎng gěi wǒ de jiāotōngkǎ {blank} wǔshí kuài.',
					translation: 'I would like to {blank} 50 yuan to my transit card.',
					options: ['充值', '看书', '跑步', '唱歌'],
					optionPinyins: {
						充值: 'chōngzhí',
						看书: 'kànshū',
						跑步: 'pǎobù',
						唱歌: 'chànggē'
					},
					optionTranslations: {
						充值: 'recharge',
						看书: 'read',
						跑步: 'run',
						唱歌: 'sing'
					},
					correctOption: '充值',
					nextNodeId: 'node-subway-end'
				}
			},
			'node-subway-end': {
				id: 'node-subway-end',
				speakerId: 'attendant',
				text: '充值成功！祝您旅途愉快，注意脚下安全！',
				pinyin: 'Chōngzhí chénggōng! Zhù nín lǚtú yúkuài, zhùyì jiǎoxià ānquán!',
				translation: 'Top-up successful! Have a pleasant journey and mind your step!',
				audioText: '充值成功！祝您旅途愉快，注意脚下安全！',
				type: 'dialogue'
			}
		}
	},
	{
		id: 'paris-boulangerie',
		title: 'Morning at the Paris Boulangerie',
		subtitle: 'Matinée à la Boulangerie · Order pastries & practice French polite phrases',
		language: 'french',
		difficulty: 'Beginner',
		durationMinutes: 3,
		requiresVoice: true,
		baseXP: 45,
		bgImageUrl: '/images/stories/boulangerie-bg.jpg',
		coverImageUrl: '/images/stories/boulangerie-bg.jpg',
		characters: {
			baker: {
				id: 'baker',
				name: 'Élise',
				avatarUrl: '/images/stories/avatars/baker.jpg',
				role: 'Artisan Baker'
			}
		},
		startNodeId: 'node-fr-welcome',
		summaryVocabulary: [
			{ word: 'Bonjour', meaning: 'Hello / Good morning' },
			{ word: 'Une baguette tradition', meaning: 'A traditional baguette' },
			{ word: "S'il vous plaît", meaning: 'Please' },
			{ word: 'Par carte', meaning: 'By credit card' }
		],
		nodes: {
			'node-fr-welcome': {
				id: 'node-fr-welcome',
				speakerId: 'baker',
				text: 'Bonjour ! Qu’est-ce qui vous ferait plaisir aujourd’hui ?',
				translation: 'Good morning! What would you like today?',
				audioText: 'Bonjour ! Qu’est-ce qui vous ferait plaisir aujourd’hui ?',
				type: 'choice',
				choices: [
					{
						id: 'choice-fr-polite',
						text: "Bonjour madame, je voudrais deux croissants s'il vous plaît.",
						translation: 'Good morning ma’am, I would like two croissants please.',
						nextNodeId: 'node-fr-croissant-reply',
						isOptimal: true,
						feedback: 'Very polite and natural greeting in French!',
						xpReward: 15
					},
					{
						id: 'choice-fr-direct',
						text: 'Donne-moi deux croissants.',
						translation: 'Give me two croissants.',
						nextNodeId: 'node-fr-croissant-reply',
						isOptimal: false,
						feedback: 'A bit too informal for a Parisian shop, but understood.',
						xpReward: 5
					}
				]
			},
			'node-fr-croissant-reply': {
				id: 'node-fr-croissant-reply',
				speakerId: 'baker',
				text: 'Très bien, deux croissants tout chauds ! Et avec ceci ?',
				translation: 'Very well, two warm croissants! And with this?',
				audioText: 'Très bien, deux croissants tout chauds ! Et avec ceci ?',
				type: 'speech',
				expectedSpeech: {
					target: 'Une baguette tradition bien cuite sil vous plait',
					keywords: ['baguette', 'tradition', 'plait'],
					fallbackChoices: [
						{
							id: 'fr-fb-baguette',
							text: "Une baguette tradition bien cuite, s'il vous plaît.",
							translation: 'A well-baked traditional baguette, please.',
							nextNodeId: 'node-fr-total',
							isOptimal: true,
							feedback: 'Parfait! The baker picks the crispest baguette from the basket.',
							xpReward: 15
						},
						{
							id: 'fr-fb-nothing',
							text: 'Ce sera tout, merci.',
							translation: 'That will be all, thank you.',
							nextNodeId: 'node-fr-total',
							isOptimal: false,
							feedback: 'Short and sweet.',
							xpReward: 8
						}
					]
				},
				nextNodeId: 'node-fr-total'
			},
			'node-fr-total': {
				id: 'node-fr-total',
				speakerId: 'baker',
				text: 'Ça vous fera quatre euros cinquante. Vous réglez comment ?',
				translation: 'That will be four euros fifty. How are you paying?',
				audioText: 'Ça vous fera quatre euros cinquante. Vous réglez comment ?',
				type: 'cloze',
				cloze: {
					sentence: 'Je paye {blank}, merci.',
					translation: 'I am paying {blank}, thank you.',
					options: ['par carte', 'par train', 'avec du pain', 'en avion'],
					correctOption: 'par carte',
					nextNodeId: 'node-fr-end'
				}
			},
			'node-fr-end': {
				id: 'node-fr-end',
				speakerId: 'baker',
				text: 'Merci beaucoup ! Bonne journée et à bientôt !',
				translation: 'Thank you very much! Have a great day and see you soon!',
				audioText: 'Merci beaucoup ! Bonne journée et à bientôt !',
				type: 'dialogue'
			}
		}
	}
];
