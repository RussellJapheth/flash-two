#!/usr/bin/env python3
"""
Generates podcast audio and exact timestamp alignments.
Uses edge-tts with high-quality neural voices (Xiaoxiao, Yunxi, Xiaoyi, Yunyang)
for completely natural, human-like speech with natural conversational pauses
and FFmpeg encoding for crisp, lightweight mobile delivery.
"""

import asyncio
import json
import os
import re
import subprocess
import edge_tts
import jieba
from pypinyin import pinyin, Style

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../.."))
OUTPUT_AUDIO_DIR = os.path.join(PROJECT_ROOT, "static/audio/podcasts")
OUTPUT_DATA_DIR = os.path.join(PROJECT_ROOT, "src/lib/data/podcasts")

os.makedirs(OUTPUT_AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_DATA_DIR, exist_ok=True)

EPISODES = [
    {
        "id": "morning-coffee",
        "title": "早晨的咖啡店",
        "titleEn": "Morning Coffee Shop",
        "titlePinyin": "Zǎochén de Kāfēidiàn",
        "coverImage": "/images/podcasts/morning-coffee.jpg",
        "description": "敏敏在街角咖啡店点一杯热咖啡，与热情的咖啡师练习日常点单和微信付钱。",
        "level": "beginner",
        "hskLevel": 1,
        "xpReward": 20,
        "rate": "-6%",
        "speakers": [
            {
                "id": "minmin",
                "name": "敏敏",
                "role": "顾客 (Customer)",
                "avatarEmoji": "👧",
                "voice": "zh-CN-XiaoxiaoNeural"
            },
            {
                "id": "xiaoli",
                "name": "小李",
                "role": "咖啡师 (Barista)",
                "avatarEmoji": "☕",
                "voice": "zh-CN-YunxiNeural"
            }
        ],
        "keyVocabulary": [
            {"word": "咖啡", "pinyin": "kāfēi", "meaning": "coffee"},
            {"word": "热", "pinyin": "rè", "meaning": "hot"},
            {"word": "大杯", "pinyin": "dà bēi", "meaning": "large cup"},
            {"word": "付钱", "pinyin": "fù qián", "meaning": "to pay"},
            {"word": "微信", "pinyin": "wēixìn", "meaning": "WeChat"},
            {"word": "愉快", "pinyin": "yúkuài", "meaning": "pleasant / happy"}
        ],
        "dialogue": [
            {
                "speakerId": "minmin",
                "text": "早上好！请给我一杯热咖啡。",
                "pinyin": "Zǎoshang hǎo! Qǐng gěi wǒ yì bēi rè kāfēi.",
                "en": "Good morning! Please give me a cup of hot coffee.",
                "words": [
                    {"word": "早上好", "pinyin": "zǎoshang hǎo", "en": "good morning"},
                    {"word": "请", "pinyin": "qǐng", "en": "please"},
                    {"word": "给我", "pinyin": "gěi wǒ", "en": "give me"},
                    {"word": "一杯", "pinyin": "yì bēi", "en": "a cup of"},
                    {"word": "热咖啡", "pinyin": "rè kāfēi", "en": "hot coffee"}
                ]
            },
            {
                "speakerId": "xiaoli",
                "text": "早上好！您要大杯还是中杯？",
                "pinyin": "Zǎoshang hǎo! Nín yào dà bēi háishi zhōng bēi?",
                "en": "Good morning! Would you like a large cup or medium cup?",
                "words": [
                    {"word": "您要", "pinyin": "nín yào", "en": "you want"},
                    {"word": "大杯", "pinyin": "dà bēi", "en": "large cup"},
                    {"word": "还是", "pinyin": "háishi", "en": "or"},
                    {"word": "中杯", "pinyin": "zhōng bēi", "en": "medium cup"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "大杯的，谢谢。不用加糖，多放一点牛奶。",
                "pinyin": "Dà bēi de, xièxie. Bú yòng jiā táng, duō fàng yìdiǎn niúnǎi.",
                "en": "Large cup, thanks. No sugar needed, just a bit more milk.",
                "words": [
                    {"word": "不用", "pinyin": "bú yòng", "en": "no need"},
                    {"word": "加糖", "pinyin": "jiā táng", "en": "add sugar"},
                    {"word": "多放", "pinyin": "duō fàng", "en": "put more"},
                    {"word": "牛奶", "pinyin": "niúnǎi", "en": "milk"}
                ]
            },
            {
                "speakerId": "xiaoli",
                "text": "好的，一共二十块钱。",
                "pinyin": "Hǎo de, yígòng èrshí kuài qián.",
                "en": "Sure thing, altogether twenty yuan.",
                "words": [
                    {"word": "好的", "pinyin": "hǎo de", "en": "okay / all right"},
                    {"word": "一共", "pinyin": "yígòng", "en": "altogether"},
                    {"word": "二十块", "pinyin": "èrshí kuài", "en": "20 yuan"},
                    {"word": "钱", "pinyin": "qián", "en": "money"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "我用微信付钱可以吗？",
                "pinyin": "Wǒ yòng Wēixìn fù qián kěyǐ ma?",
                "en": "Can I pay using WeChat?",
                "words": [
                    {"word": "我用", "pinyin": "wǒ yòng", "en": "I use"},
                    {"word": "微信", "pinyin": "wēixìn", "en": "WeChat"},
                    {"word": "付钱", "pinyin": "fù qián", "en": "pay money"},
                    {"word": "可以吗", "pinyin": "kěyǐ ma", "en": "is it okay?"}
                ]
            },
            {
                "speakerId": "xiaoli",
                "text": "当然可以。请扫这里。您的咖啡好了，请慢用！",
                "pinyin": "Dāngrán kěyǐ. Qǐng sǎo zhèlǐ. Nín de kāfēi hǎo le, qǐng màn yòng!",
                "en": "Of course. Please scan here. Your coffee is ready, enjoy!",
                "words": [
                    {"word": "当然可以", "pinyin": "dāngrán kěyǐ", "en": "of course"},
                    {"word": "请扫", "pinyin": "qǐng sǎo", "en": "please scan"},
                    {"word": "这里", "pinyin": "zhèlǐ", "en": "here"},
                    {"word": "慢用", "pinyin": "màn yòng", "en": "enjoy your food/drink"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "太香了，谢谢！祝你今天过得愉快。",
                "pinyin": "Tài xiāng le, xièxie! Zhù nǐ jīntiān guò de yúkuài.",
                "en": "Smells so fragrant, thank you! Wish you a pleasant day.",
                "words": [
                    {"word": "太香了", "pinyin": "tài xiāng le", "en": "smells so great"},
                    {"word": "祝你", "pinyin": "zhù nǐ", "en": "wish you"},
                    {"word": "今天", "pinyin": "jīntiān", "en": "today"},
                    {"word": "愉快", "pinyin": "yúkuài", "en": "pleasant / joyful"}
                ]
            },
            {
                "speakerId": "xiaoli",
                "text": "也祝你今天愉快，欢迎下次光临！",
                "pinyin": "Yě zhù nǐ jīntiān yúkuài, huānyíng xià cì guānglín!",
                "en": "Wish you a happy day too, welcome back next time!",
                "words": [
                    {"word": "也祝你", "pinyin": "yě zhù nǐ", "en": "also wish you"},
                    {"word": "欢迎", "pinyin": "huānyíng", "en": "welcome"},
                    {"word": "下次", "pinyin": "xià cì", "en": "next time"},
                    {"word": "光临", "pinyin": "guānglín", "en": "presence / visit"}
                ]
            }
        ]
    },
    {
        "id": "shanghai-metro",
        "title": "上海地铁奇遇",
        "titleEn": "Shanghai Metro Adventure",
        "titlePinyin": "Shànghǎi Dìtiě Qíyù",
        "coverImage": "/images/podcasts/shanghai-metro.jpg",
        "description": "大卫在人民广场换乘站向热情的王阿姨问路，体验高效便捷的上海轨道交通。",
        "level": "intermediate",
        "hskLevel": 3,
        "xpReward": 25,
        "rate": "-4%",
        "speakers": [
            {
                "id": "dawei",
                "name": "大卫",
                "role": "留学生 (Student)",
                "avatarEmoji": "🎒",
                "voice": "zh-CN-YunyangNeural"
            },
            {
                "id": "wangayi",
                "name": "王阿姨",
                "role": "上海市民 (Local Resident)",
                "avatarEmoji": "👵",
                "voice": "zh-CN-XiaoyiNeural"
            }
        ],
        "keyVocabulary": [
            {"word": "地铁", "pinyin": "dìtiě", "meaning": "subway / metro"},
            {"word": "换乘", "pinyin": "huànchéng", "meaning": "to transfer"},
            {"word": "高峰期", "pinyin": "gāofēng qī", "meaning": "rush hour"},
            {"word": "方便", "pinyin": "fāngbiàn", "meaning": "convenient"},
            {"word": "四通八达", "pinyin": "sì tōng bā dá", "meaning": "accessible in all directions"},
            {"word": "志愿者", "pinyin": "zhìyuànzhě", "meaning": "volunteer"}
        ],
        "dialogue": [
            {
                "speakerId": "dawei",
                "text": "阿姨您好，请问去人民广场应该坐哪条线？",
                "pinyin": "Āyí nín hǎo, qǐngwèn qù Rénmín Guǎngchǎng yīnggāi zuò nǎ tiáo xiàn?",
                "en": "Hello Auntie, may I ask which line I should take to People's Square?",
                "words": [
                    {"word": "请问", "pinyin": "qǐngwèn", "en": "excuse me / may I ask"},
                    {"word": "人民广场", "pinyin": "rénmín guǎngchǎng", "en": "People's Square"},
                    {"word": "应该", "pinyin": "yīnggāi", "en": "should"},
                    {"word": "哪条线", "pinyin": "nǎ tiáo xiàn", "en": "which line"}
                ]
            },
            {
                "speakerId": "wangayi",
                "text": "小伙子，坐二号线最方便，直接坐四站就到了。",
                "pinyin": "Xiǎohuǒzi, zuò èrhào xiàn zuì fāngbiàn, zhíjiē zuò sì zhàn jiù dào le.",
                "en": "Young man, taking Line 2 is most convenient, just ride 4 stops directly.",
                "words": [
                    {"word": "小伙子", "pinyin": "xiǎohuǒzi", "en": "young man"},
                    {"word": "二号线", "pinyin": "èrhào xiàn", "en": "Line 2"},
                    {"word": "最方便", "pinyin": "zuì fāngbiàn", "en": "most convenient"},
                    {"word": "四站", "pinyin": "sì zhàn", "en": "four stations"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "现在正是早高峰，车厢里人会不会特别多？",
                "pinyin": "Xiànzài zhèng shì zǎogāofēng, chēxiāng lǐ rén huì bu huì tèbié duō?",
                "en": "It's right at morning rush hour now, will the train carriage be super crowded?",
                "words": [
                    {"word": "早高峰", "pinyin": "zǎogāofēng", "en": "morning rush hour"},
                    {"word": "车厢", "pinyin": "chēxiāng", "en": "carriage / train car"},
                    {"word": "特别多", "pinyin": "tèbié duō", "en": "especially crowded / many"}
                ]
            },
            {
                "speakerId": "wangayi",
                "text": "人肯定不少，不过每两分钟就有一趟车，不用担心挤不上。",
                "pinyin": "Rén kěndìng bù shǎo, búguò měi liǎng fēnzhōng jiù yǒu yí tàng chē, bú yòng dānxīn jǐ bu shàng.",
                "en": "There'll definitely be a lot of people, but a train arrives every two minutes, don't worry about not squeezing on.",
                "words": [
                    {"word": "肯定", "pinyin": "kěndìng", "en": "definitely"},
                    {"word": "两分钟", "pinyin": "liǎng fēnzhōng", "en": "two minutes"},
                    {"word": "不用担心", "pinyin": "bú yòng dānxīn", "en": "no need to worry"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "太好了，站台上的指示牌非常清楚。",
                "pinyin": "Tài hǎo le, zhàntái shang de zhǐshìpái fēicháng qīngchu.",
                "en": "That's wonderful, the signs on the platform are very clear.",
                "words": [
                    {"word": "站台", "pinyin": "zhàntái", "en": "platform"},
                    {"word": "指示牌", "pinyin": "zhǐshìpái", "en": "signs"},
                    {"word": "非常清楚", "pinyin": "fēicháng qīngchu", "en": "very clear"}
                ]
            },
            {
                "speakerId": "wangayi",
                "text": "对呀！上海地铁四通八达。要是遇到问题，可以问穿红马甲的志愿者。",
                "pinyin": "Duì ya! Shànghǎi dìtiě sì tōng bā dá. Yàoshi yù dào wèntí, kěyǐ wèn chuān hóng mǎjiǎ de zhìyuànzhě.",
                "en": "That's right! The Shanghai metro connects in every direction. If you have any questions, ask the volunteers in red vests.",
                "words": [
                    {"word": "四通八达", "pinyin": "sì tōng bā dá", "en": "connected everywhere"},
                    {"word": "要是", "pinyin": "yàoshi", "en": "if"},
                    {"word": "志愿者", "pinyin": "zhìyuànzhě", "en": "volunteer"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "非常感谢您的热心帮忙，祝您今天愉快！",
                "pinyin": "Fēicháng gǎnxiè nín de rèxīn bāngmáng, zhù nín jīntiān yúkuài!",
                "en": "Thank you so much for your kind help, wish you a lovely day!",
                "words": [
                    {"word": "非常感谢", "pinyin": "fēicháng gǎnxiè", "en": "thank you very much"},
                    {"word": "热心帮忙", "pinyin": "rèxīn bāngmáng", "en": "warm help"},
                    {"word": "今天愉快", "pinyin": "jīntiān yúkuài", "en": "have a pleasant day"}
                ]
            }
        ]
    },
    {
        "id": "weekend-night-market",
        "title": "周末去夜市",
        "titleEn": "Weekend at the Night Market",
        "titlePinyin": "Zhōumò Qù Yèshì",
        "coverImage": "/images/podcasts/weekend-night-market.jpg",
        "description": "敏敏和大卫在热闹的夜市吃饺子、喝热茶，练习日常点餐、付钱和周末计划。",
        "level": "beginner",
        "hskLevel": 1,
        "xpReward": 30,
        "rate": "-7%",
        "speakers": [
            {
                "id": "minmin",
                "name": "敏敏",
                "role": "顾客 / 朋友 (Friend)",
                "avatarEmoji": "👧",
                "voice": "zh-CN-XiaoxiaoNeural"
            },
            {
                "id": "dawei",
                "name": "大卫",
                "role": "留学生 / 朋友 (Friend)",
                "avatarEmoji": "🎒",
                "voice": "zh-CN-YunyangNeural"
            },
            {
                "id": "laoban",
                "name": "王老板",
                "role": "饺子店老板 (Shop Owner)",
                "avatarEmoji": "👨‍🍳",
                "voice": "zh-CN-YunxiNeural"
            }
        ],
        "keyVocabulary": [
            {"word": "夜市", "pinyin": "yèshì", "meaning": "night market"},
            {"word": "小吃", "pinyin": "xiǎochī", "meaning": "snacks / street food"},
            {"word": "饺子", "pinyin": "jiǎozi", "meaning": "dumplings"},
            {"word": "盘", "pinyin": "pán", "meaning": "plate (measure word)"},
            {"word": "热茶", "pinyin": "rè chá", "meaning": "hot tea"},
            {"word": "饱", "pinyin": "bǎo", "meaning": "full (not hungry)"},
            {"word": "请客", "pinyin": "qǐngkè", "meaning": "to treat (someone)"},
            {"word": "散步", "pinyin": "sànbù", "meaning": "to take a walk"}
        ],
        "dialogue": [
            {
                "speakerId": "minmin",
                "text": "大卫，快看！这个夜市好热闹啊。",
                "pinyin": "Dàwèi, kuài kàn! Zhè ge yèshì hǎo rènao a.",
                "en": "David, look! This night market is so lively.",
                "words": [
                    {"word": "快看", "pinyin": "kuài kàn", "en": "look"},
                    {"word": "夜市", "pinyin": "yèshì", "en": "night market"},
                    {"word": "热闹", "pinyin": "rènao", "en": "lively"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "哇，真的！这里有很多好吃的小吃。你饿不饿？",
                "pinyin": "Wa, zhēnde! Zhèlǐ yǒu hěn duō hǎochī de xiǎochī. Nǐ è bu è?",
                "en": "Wow, really! There are lots of delicious snacks here. Are you hungry?",
                "words": [
                    {"word": "很多", "pinyin": "hěn duō", "en": "a lot of"},
                    {"word": "小吃", "pinyin": "xiǎochī", "en": "snacks"},
                    {"word": "饿不饿", "pinyin": "è bu è", "en": "hungry or not"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "我很饿。今天走了很多路，现在很想吃热的东西。",
                "pinyin": "Wǒ hěn è. Jīntiān zǒu le hěn duō lù, xiànzài hěn xiǎng chī rè de dōngxi.",
                "en": "I'm very hungry. I walked a lot today, now I really want to eat hot food.",
                "words": [
                    {"word": "很多路", "pinyin": "hěn duō lù", "en": "a lot of walking"},
                    {"word": "想吃", "pinyin": "xiǎng chī", "en": "want to eat"},
                    {"word": "热的", "pinyin": "rè de", "en": "hot"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "你看，前面有一家饺子店，很多人在排队。",
                "pinyin": "Nǐ kàn, qiánmiàn yǒu yì jiā jiǎozidiàn, hěn duō rén zài páiduì.",
                "en": "Look, up ahead there's a dumpling shop, many people are waiting in line.",
                "words": [
                    {"word": "前面", "pinyin": "qiánmiàn", "en": "ahead"},
                    {"word": "饺子店", "pinyin": "jiǎozidiàn", "en": "dumpling shop"},
                    {"word": "排队", "pinyin": "páiduì", "en": "line up"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "那家店很有名！听说那里的饺子很好吃。",
                "pinyin": "Nà jiā diàn hěn yǒumíng! Tīngshuō nàlǐ de jiǎozi hěn hǎochī.",
                "en": "That shop is very famous! I hear the dumplings there are delicious.",
                "words": [
                    {"word": "有名", "pinyin": "yǒumíng", "en": "famous"},
                    {"word": "听说", "pinyin": "tīngshuō", "en": "hear that"},
                    {"word": "好吃", "pinyin": "hǎochī", "en": "delicious"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "太好了！正好有两个位子，我们快坐下吧。",
                "pinyin": "Tài hǎo le! Zhènghǎo yǒu liǎng gè wèizi, wǒmen kuài zuòxià ba.",
                "en": "Great! There happen to be two seats, let's sit down quickly.",
                "words": [
                    {"word": "正好", "pinyin": "zhènghǎo", "en": "just happens to be"},
                    {"word": "位子", "pinyin": "wèizi", "en": "seat"},
                    {"word": "坐下", "pinyin": "zuòxià", "en": "sit down"}
                ]
            },
            {
                "speakerId": "laoban",
                "text": "两位晚上好！欢迎光临。请问想吃什么饺子？",
                "pinyin": "Liǎng wèi wǎnshang hǎo! Huānyíng guānglín. Qǐngwèn xiǎng chī shénme jiǎozi?",
                "en": "Good evening to you both! Welcome. What kind of dumplings would you like to eat?",
                "words": [
                    {"word": "两位", "pinyin": "liǎng wèi", "en": "both of you"},
                    {"word": "欢迎光临", "pinyin": "huānyíng guānglín", "en": "welcome"},
                    {"word": "饺子", "pinyin": "jiǎozi", "en": "dumplings"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "老板您好，请问你们有什么饺子？",
                "pinyin": "Lǎobǎn nín hǎo, qǐngwèn nǐmen yǒu shénme jiǎozi?",
                "en": "Hello boss, may I ask what dumplings do you have?",
                "words": [
                    {"word": "老板", "pinyin": "lǎobǎn", "en": "boss / shopkeeper"},
                    {"word": "请问", "pinyin": "qǐngwèn", "en": "excuse me / may I ask"},
                    {"word": "什么", "pinyin": "shénme", "en": "what"}
                ]
            },
            {
                "speakerId": "laoban",
                "text": "我们有猪肉白菜的、牛肉的，还有鸡蛋蔬菜的。",
                "pinyin": "Wǒmen yǒu zhūròu báicài de, niúròu de, hái yǒu jīdàn shūcài de.",
                "en": "We have pork with cabbage, beef, and also egg with vegetables.",
                "words": [
                    {"word": "猪肉", "pinyin": "zhūròu", "en": "pork"},
                    {"word": "牛肉", "pinyin": "niúròu", "en": "beef"},
                    {"word": "鸡蛋", "pinyin": "jīdàn", "en": "egg"},
                    {"word": "蔬菜", "pinyin": "shūcài", "en": "vegetable"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "敏敏，你想吃哪种？我都想尝一尝。",
                "pinyin": "Mǐnmǐn, nǐ xiǎng chī nǎ zhǒng? Wǒ dōu xiǎng cháng yi cháng.",
                "en": "Minmin, which kind do you want to eat? I want to taste both.",
                "words": [
                    {"word": "哪种", "pinyin": "nǎ zhǒng", "en": "which kind"},
                    {"word": "尝一尝", "pinyin": "cháng yi cháng", "en": "taste / try"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "那我们要一盘猪肉的，再要一盘牛肉的，好不好？",
                "pinyin": "Nà wǒmen yào yì pán zhūròu de, zài yào yì pán niúròu de, hǎo bu hǎo?",
                "en": "Then let's have one plate of pork, and another plate of beef, okay?",
                "words": [
                    {"word": "一盘", "pinyin": "yì pán", "en": "one plate"},
                    {"word": "好不好", "pinyin": "hǎo bu hǎo", "en": "is that okay?"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "好！老板，我们要这两盘，一共多少钱？",
                "pinyin": "Hǎo! Lǎobǎn, wǒmen yào zhè liǎng pán, yígòng duōshao qián?",
                "en": "Great! Boss, we'd like these two plates, how much altogether?",
                "words": [
                    {"word": "要", "pinyin": "yào", "en": "want / take"},
                    {"word": "一共", "pinyin": "yígòng", "en": "altogether"},
                    {"word": "多少钱", "pinyin": "duōshao qián", "en": "how much money"}
                ]
            },
            {
                "speakerId": "laoban",
                "text": "猪肉饺子二十块，牛肉饺子二十四块，一共四十四块钱。要不要辣椒和醋？",
                "pinyin": "Zhūròu jiǎozi èrshí kuài, niúròu jiǎozi èrshísì kuài, yígòng sìshísì kuài qián. Yào bu yào làjiāo hé cù?",
                "en": "Pork dumplings are 20 yuan, beef dumplings are 24 yuan, total 44 yuan. Do you want chili and vinegar?",
                "words": [
                    {"word": "块", "pinyin": "kuài", "en": "yuan (measure for money)"},
                    {"word": "辣椒", "pinyin": "làjiāo", "en": "chili"},
                    {"word": "醋", "pinyin": "cù", "en": "vinegar"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "要一点醋，不要太辣，少放一点辣就可以。",
                "pinyin": "Yào yìdiǎn cù, bú yào tài là, shǎo fàng yìdiǎn là jiù kěyǐ.",
                "en": "A little vinegar, not too spicy, just put a little bit of spicy is fine.",
                "words": [
                    {"word": "不要", "pinyin": "bú yào", "en": "don't want"},
                    {"word": "太辣", "pinyin": "tài là", "en": "too spicy"},
                    {"word": "少放", "pinyin": "shǎo fàng", "en": "put less"},
                    {"word": "可以", "pinyin": "kěyǐ", "en": "fine / okay"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "老板，店里有热茶或者水吗？",
                "pinyin": "Lǎobǎn, diàn lǐ yǒu rè chá huòzhě shuǐ ma?",
                "en": "Boss, do you have hot tea or water in the shop?",
                "words": [
                    {"word": "热茶", "pinyin": "rè chá", "en": "hot tea"},
                    {"word": "或者", "pinyin": "huòzhě", "en": "or"},
                    {"word": "水", "pinyin": "shuǐ", "en": "water"}
                ]
            },
            {
                "speakerId": "laoban",
                "text": "有热茶，是免费的！桌子上有茶和杯子，请慢用。",
                "pinyin": "Yǒu rè chá, shì miǎnfèi de! Zhuōzi shang yǒu chá hé bēizi, qǐng màn yòng.",
                "en": "We have hot tea, it's free! There is tea and cups on the table, please enjoy.",
                "words": [
                    {"word": "免费", "pinyin": "miǎnfèi", "en": "free"},
                    {"word": "桌子", "pinyin": "zhuōzi", "en": "table"},
                    {"word": "杯子", "pinyin": "bēizi", "en": "cups"},
                    {"word": "慢用", "pinyin": "màn yòng", "en": "enjoy your meal"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "饺子来啦，好香啊！大卫，快趁热吃。",
                "pinyin": "Jiǎozi lái la, hǎo xiāng a! Dàwèi, kuài chènrè chī.",
                "en": "The dumplings are here, smells so good! David, eat while they're hot.",
                "words": [
                    {"word": "好香", "pinyin": "hǎo xiāng", "en": "smells so good"},
                    {"word": "趁热吃", "pinyin": "chènrè chī", "en": "eat while hot"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "小心烫！哇，这个牛肉饺子太好吃了！",
                "pinyin": "Xiǎoxīn tàng! Wa, zhè ge niúròu jiǎozi tài hǎochī le!",
                "en": "Careful, it's hot! Wow, this beef dumpling is so delicious!",
                "words": [
                    {"word": "小心烫", "pinyin": "xiǎoxīn tàng", "en": "careful it's hot"},
                    {"word": "太好吃了", "pinyin": "tài hǎochī le", "en": "very delicious"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "猪肉的也很香。喝一口热茶，真舒服！",
                "pinyin": "Zhūròu de yě hěn xiāng. Hē yì kǒu rè chá, zhēn shūfu!",
                "en": "The pork one is also very tasty. Drinking a sip of hot tea feels so comfortable!",
                "words": [
                    {"word": "喝一口", "pinyin": "hē yì kǒu", "en": "drink a sip"},
                    {"word": "舒服", "pinyin": "shūfu", "en": "comfortable"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "我吃得好饱！今天的晚饭太好吃了。",
                "pinyin": "Wǒ chī de hǎo bǎo! Jīntiān de wǎnfàn tài hǎochī le.",
                "en": "I'm so full! Tonight's dinner was delicious.",
                "words": [
                    {"word": "好饱", "pinyin": "hǎo bǎo", "en": "very full"},
                    {"word": "晚饭", "pinyin": "wǎnfàn", "en": "dinner"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "老板，我们吃好了！我用微信付钱。",
                "pinyin": "Lǎobǎn, wǒmen chī hǎo le! Wǒ yòng Wēixìn fù qián.",
                "en": "Boss, we're finished eating! I'll pay with WeChat.",
                "words": [
                    {"word": "吃好", "pinyin": "chī hǎo", "en": "finished eating"},
                    {"word": "微信", "pinyin": "wēixìn", "en": "WeChat"},
                    {"word": "付钱", "pinyin": "fù qián", "en": "pay money"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "等等，今天我请客！你经常帮我学中文。",
                "pinyin": "Děngděng, jīntiān wǒ qǐngkè! Nǐ jīngcháng bāng wǒ xué Zhōngwén.",
                "en": "Wait, I'll treat today! You often help me learn Chinese.",
                "words": [
                    {"word": "等等", "pinyin": "děngděng", "en": "wait a moment"},
                    {"word": "请客", "pinyin": "qǐngkè", "en": "treat / pay"},
                    {"word": "经常", "pinyin": "jīngcháng", "en": "often"},
                    {"word": "学中文", "pinyin": "xué Zhōngwén", "en": "learn Chinese"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "哈哈，我已经付钱了！下次你请客吧。",
                "pinyin": "Hāhā, wǒ yǐjīng fù qián le! Xià cì nǐ qǐngkè ba.",
                "en": "Haha, I already paid! Next time it's your turn to treat.",
                "words": [
                    {"word": "已经", "pinyin": "yǐjīng", "en": "already"},
                    {"word": "下次", "pinyin": "xià cì", "en": "next time"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "好啊，没问题！明天是星期天，我们去公园散步吗？",
                "pinyin": "Hǎo a, méi wèntí! Míngtiān shì xīngqītiān, wǒmen qù gōngyuán sànbù ma?",
                "en": "Sure, no problem! Tomorrow is Sunday, shall we go to the park for a walk?",
                "words": [
                    {"word": "没问题", "pinyin": "méi wèntí", "en": "no problem"},
                    {"word": "星期天", "pinyin": "xīngqītiān", "en": "Sunday"},
                    {"word": "散步", "pinyin": "sànbù", "en": "take a walk"}
                ]
            },
            {
                "speakerId": "minmin",
                "text": "当然去！明天天气很好，我们早上九点在公园门口见！",
                "pinyin": "Dāngrán qù! Míngtiān tiānqì hěn hǎo, wǒmen zǎoshang jiǔ diǎn zài gōngyuán ménkǒu jiàn!",
                "en": "Of course! The weather tomorrow is great, let's meet at 9:00 AM at the park entrance!",
                "words": [
                    {"word": "当然", "pinyin": "dāngrán", "en": "of course"},
                    {"word": "天气很好", "pinyin": "tiānqì hěn hǎo", "en": "weather is very good"},
                    {"word": "门口", "pinyin": "ménkǒu", "en": "entrance / gate"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "太好了！回家好好休息，明天见！",
                "pinyin": "Tài hǎo le! Huí jiā hǎohāo xiūxi, míngtiān jiàn!",
                "en": "Great! Go home and rest well, see you tomorrow!",
                "words": [
                    {"word": "太好了", "pinyin": "tài hǎo le", "en": "wonderful"},
                    {"word": "休息", "pinyin": "xiūxi", "en": "rest"},
                    {"word": "明天见", "pinyin": "míngtiān jiàn", "en": "see you tomorrow"}
                ]
            }
        ]
    }
]

def get_audio_duration(path):
    cmd = [
        "ffprobe", "-i", path,
        "-show_entries", "format=duration",
        "-v", "quiet", "-of", "csv=p=0"
    ]
    out = subprocess.check_output(cmd).decode().strip()
    return float(out)

def create_silence_mp3(path, duration_sec):
    cmd = [
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "anullsrc=r=24000:cl=mono",
        "-t", str(duration_sec),
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def segment_turn_text(text, start_time, duration, known_words_map=None):
    if known_words_map is None:
        known_words_map = {}
        
    tokens = list(jieba.cut(text))
    clean_chars = sum(len(t) for t in tokens if not re.match(r'^[，。！？、,.!?…—\s]+$', t))
    total_chars = max(1, clean_chars)
    
    turn_words = []
    current_time = start_time
    
    for token in tokens:
        is_punct = bool(re.match(r'^[，。！？、,.!?…—\s]+$', token))
        if is_punct:
            token_dur = 0.04
            py_str = ""
            en_str = ""
        else:
            token_dur = (len(token) / total_chars) * duration
            py_list = [p[0] for p in pinyin(token, style=Style.TONE)]
            py_str = " ".join(py_list)
            en_str = known_words_map.get(token, "")
            
        token_start = round(current_time, 2)
        token_end = round(current_time + token_dur, 2)
        
        turn_words.append({
            "word": token,
            "pinyin": py_str,
            "en": en_str,
            "start": token_start,
            "end": token_end
        })
        
        if not is_punct:
            current_time += token_dur
            
    return turn_words

async def synthesize_turn_edge(text, voice, rate, out_mp3):
    comm = edge_tts.Communicate(text, voice, rate=rate)
    await comm.save(out_mp3)

async def process_episode_async(ep_data):
    ep_id = ep_data["id"]
    rate = ep_data.get("rate", "-5%")
    temp_dir = os.path.join("/tmp", f"podcast_neural_{ep_id}")
    os.makedirs(temp_dir, exist_ok=True)
    
    speaker_map = {s["id"]: s for s in ep_data["speakers"]}
    concat_list_file = os.path.join(temp_dir, "concat.txt")
    
    current_time = 0.5  # 0.5s initial lead-in
    lead_silence = os.path.join(temp_dir, "lead_silence.mp3")
    create_silence_mp3(lead_silence, 0.5)
    
    inter_silence = os.path.join(temp_dir, "pause.mp3")
    create_silence_mp3(inter_silence, 0.45)
    
    processed_segments = []
    audio_files = [lead_silence]
    
    for idx, turn in enumerate(ep_data["dialogue"]):
        sp_id = turn["speakerId"]
        sp_info = speaker_map[sp_id]
        voice = sp_info.get("voice", "zh-CN-XiaoxiaoNeural")
        turn_mp3 = os.path.join(temp_dir, f"turn_{idx}.mp3")
        
        await synthesize_turn_edge(turn["text"], voice, rate, turn_mp3)
        duration = get_audio_duration(turn_mp3)
        
        start_time = round(current_time, 2)
        end_time = round(current_time + duration, 2)
        
        known_map = {w["word"]: w.get("en", "") for w in turn.get("words", [])}
        for kv in ep_data.get("keyVocabulary", []):
            known_map[kv["word"]] = kv.get("meaning", "")
            
        turn_words = segment_turn_text(turn["text"], start_time, duration, known_map)

        processed_segments.append({
            "id": f"{ep_id}-seg-{idx+1}",
            "speakerId": sp_id,
            "speakerName": sp_info["name"],
            "speakerAvatar": sp_info.get("avatarEmoji", "👤"),
            "start": start_time,
            "end": end_time,
            "text": turn["text"],
            "pinyin": turn.get("pinyin", ""),
            "en": turn.get("en", ""),
            "words": turn_words
        })
        
        audio_files.append(turn_mp3)
        audio_files.append(inter_silence)
        current_time = end_time + 0.45
        
    trail_silence = os.path.join(temp_dir, "trail_silence.mp3")
    create_silence_mp3(trail_silence, 0.6)
    audio_files.append(trail_silence)
    current_time = round(current_time + 0.6, 2)

    with open(concat_list_file, "w") as f:
        for apath in audio_files:
            f.write(f"file '{apath}'\n")

    out_mp3 = os.path.join(OUTPUT_AUDIO_DIR, f"{ep_id}.mp3")
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list_file,
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        "-ar", "24000",
        out_mp3
    ]
    subprocess.run(ffmpeg_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    file_size = os.path.getsize(out_mp3)

    episode_result = {
        "id": ep_id,
        "title": ep_data["title"],
        "titleEn": ep_data.get("titleEn", ""),
        "titlePinyin": ep_data.get("titlePinyin", ""),
        "description": ep_data["description"],
        "level": ep_data["level"],
        "hskLevel": ep_data.get("hskLevel", 1),
        "duration": current_time,
        "audioUrl": f"/audio/podcasts/{ep_id}.mp3",
        "audioFormat": "mp3",
        "fileSizeBytes": file_size,
        "coverImage": ep_data.get("coverImage", f"/images/podcasts/{ep_id}.jpg"),
        "speakers": [
            {
                "id": s["id"],
                "name": s["name"],
                "role": s.get("role", ""),
                "avatarEmoji": s.get("avatarEmoji", "👤")
            }
            for s in ep_data["speakers"]
        ],
        "keyVocabulary": ep_data["keyVocabulary"],
        "segments": processed_segments,
        "xpReward": ep_data["xpReward"]
    }

    return episode_result

def load_existing_episodes():
    try:
        res = subprocess.run(
            ["node", "-e", "import('./src/lib/data/podcasts/index.ts').then(m => console.log(JSON.stringify(m.BUILTIN_PODCASTS)))"],
            capture_output=True, text=True, check=True, cwd=PROJECT_ROOT
        )
        data = json.loads(res.stdout)
        return {ep["id"]: ep for ep in data}
    except Exception as e:
        print(f"Notice: could not load existing episodes ({e}); will regenerate.")
        return {}

async def main_async():
    import sys
    force_all = "--force" in sys.argv
    existing = load_existing_episodes() if not force_all else {}

    all_episodes = []
    for ep in EPISODES:
        ep_id = ep["id"]
        out_mp3 = os.path.join(OUTPUT_AUDIO_DIR, f"{ep_id}.mp3")
        if not force_all and ep_id in existing and os.path.exists(out_mp3):
            print(f"Reusing cached episode {ep_id} (mp3 exists: {out_mp3})...")
            ex = dict(existing[ep_id])
            if "titleEn" in ep:
                ex["titleEn"] = ep["titleEn"]
            if "coverImage" in ep:
                ex["coverImage"] = ep["coverImage"]
            all_episodes.append(ex)
            continue

        print(f"Generating neural episode {ep_id} with edge-tts...")
        result = await process_episode_async(ep)
        all_episodes.append(result)
        print(f"  Duration: {result['duration']}s, Size: {result['fileSizeBytes']} bytes")

    ts_content = f"""// AUTO-GENERATED BY scripts/bake/generate_podcast.py
import type {{ PodcastEpisode }} from '$lib/types';

export const BUILTIN_PODCASTS: PodcastEpisode[] = {json.dumps(all_episodes, indent=2, ensure_ascii=False)};
"""
    output_ts = os.path.join(OUTPUT_DATA_DIR, "index.ts")
    with open(output_ts, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"Saved {len(all_episodes)} neural episodes to {output_ts}")

def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()
