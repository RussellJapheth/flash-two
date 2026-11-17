#!/usr/bin/env python3
"""
Extract and generate deduplicated SayMei curriculum packs for flash-two.
Checks against existing packs 1-23 to guarantee 0 duplicates.
"""

import json
import glob
import os

existing_hanzi = set()
for pack_file in sorted(glob.glob('src/lib/data/chinese/[1-9].json') + glob.glob('src/lib/data/chinese/1[0-9].json') + glob.glob('src/lib/data/chinese/2[0-3].json')):
    try:
        with open(pack_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for w in data.get('words', []):
                hw = w.get('Chinese Word')
                if hw:
                    existing_hanzi.add(hw.strip())
    except Exception as e:
        print(f"Error reading {pack_file}: {e}")

print(f"Loaded {len(existing_hanzi)} unique existing Hanzi from baseline packs 1-23.")

candidate_packs = [
    {
        "pack_num": 24,
        "title": "Field Guide: Self-Introductions & Social Connections",
        "candidates": [
            ("来自", "láizì", "Verb", "to come from", "我来自伦敦。(Wǒ láizì Lúndūn.) — I come from London."),
            ("哪国人", "nǎ guó rén", "Noun / Question Phrase", "which country / nationality", "你是哪国人？(Nǐ shì nǎ guó rén?) — What is your nationality?"),
            ("大卫", "Dàwèi", "Proper Noun", "David", "我叫大卫，很高兴认识你。(Wǒ jiào Dàwèi, hěn gāoxìng rènshí nǐ.) — My name is David, nice to meet you."),
            ("李明", "Lǐ Míng", "Proper Noun", "Li Ming", "李明是我的中文老师。(Lǐ Míng shì wǒ de zhōngwén lǎoshī.) — Li Ming is my Chinese teacher."),
            ("大学生", "dàxuéshēng", "Noun", "university student / college student", "我是大学生，我学中文。(Wǒ shì dàxuéshēng, wǒ xué zhōngwén.) — I am a university student, I study Chinese."),
            ("公司", "gōngsī", "Noun", "company / firm", "我在一家国际公司工作。(Wǒ zài yì jiā guójì gōngsī gōngzuò.) — I work at an international company."),
            ("听音乐", "tīng yīnyuè", "Verb Phrase", "to listen to music", "周末我喜欢在家听音乐。(Zhōumò wǒ xǐhuan zài jiā tīng yīnyuè.) — On weekends I like listening to music at home."),
            ("做饭", "zuòfàn", "Verb Phrase", "to cook a meal", "你平时喜欢自己做饭吗？(Nǐ píngshí xǐhuan zìjǐ zuòfàn ma?) — Do you usually like cooking yourself?"),
            ("三十多岁", "sānshí duō suì", "Phrase", "in one's thirties / thirty-something", "他三十多岁，是一名医生。(Tā sānshí duō suì, shì yì míng yīshēng.) — He is in his thirties and is a doctor."),
            ("结婚", "jiéhūn", "Verb", "to marry / to get married", "你结婚了吗？— 还没有。(Nǐ jiéhūn le ma? — Hái méiyǒu.) — Are you married? — Not yet."),
            ("还在想", "hái zài xiǎng", "Phrase", "still thinking / still deciding", "你为什么学中文？— 我还在想。(Nǐ wèishénme xué zhōngwén? — Wǒ hái zài xiǎng.) — Why are you learning Chinese? — I'm still thinking about it."),
            ("聊点别的", "liáo diǎnr bié de", "Phrase", "talk about something else", "我们聊点别的吧，今天天气真好。(Wǒmen liáo diǎnr bié de ba, jīntiān tiānqì zhēn hǎo.) — Let's talk about something else, the weather today is really nice."),
            ("不太想说", "bú tài xiǎng shuō", "Phrase", "prefer not to say / rather not say", "这个我不太想说，不好意思。(Zhège wǒ bú tài xiǎng shuō, bù hǎoyìsi.) — I'd rather not say this, sorry."),
            ("语言", "yǔyán", "Noun", "language", "你会说什么语言？(Nǐ huì shuō shénme yǔyán?) — What languages can you speak?"),
            ("英语", "yīngyǔ", "Noun", "English language", "我会说英语和一点中文。(Wǒ huì shuō yīngyǔ hé yìdiǎnr zhōngwén.) — I can speak English and a little Chinese."),
            ("日语", "rìyǔ", "Noun", "Japanese language", "她也会说一点日语。(Tā yě huì shuō yìdiǎnr rìyǔ.) — She can also speak a little Japanese."),
            ("汉语", "hànyǔ", "Noun", "Mandarin / Chinese language", "我们班都在学汉语。(Wǒmen bān dōu zài xué hànyǔ.) — Our class is all studying Mandarin."),
            ("英国人", "yīngguó rén", "Noun", "British person", "我是英国人，来自伦敦。(Wǒ shì yīngguó rén, láizì Lúndūn.) — I am British, from London."),
            ("加拿大人", "jiānádà rén", "Noun", "Canadian person", "他是加拿大人，在上海工作。(Tā shì jiānádà rén, zài Shànghǎi gōngzuò.) — He is Canadian, working in Shanghai."),
            ("新加坡人", "xīnjiāpō rén", "Noun", "Singaporean person", "她是新加坡人，英语很好。(Tā shì xīnjiāpō rén, yīngyǔ hěn hǎo.) — She is Singaporean, her English is great."),
            ("多大", "duō dà", "Question Phrase", "how old", "请问你多大了？(Qǐngwèn nǐ duō dà le?) — May I ask how old you are?"),
            ("专业", "zhuānyè", "Noun", "major / specialty", "你的大学专业是什么？(Nǐ de dàxué zhuānyè shì shénme?) — What is your college major?"),
            ("年级", "niánjí", "Noun", "grade level / school year", "你现在读几年级？(Nǐ xiànzài dú jǐ niánjí?) — What school year are you in right now?"),
            ("室友", "shìyǒu", "Noun", "roommate", "我和室友一起租房。(Wǒ hé shìyǒu yìqǐ zūfáng.) — I rent an apartment with my roommate."),
            ("同行", "tóngháng", "Noun", "person of same trade / peer", "很高兴在会上遇到同行。(Hěn gāoxìng zài huì shang yùdào tóngháng.) — Glad to meet peers in the industry at the conference.")
        ]
    },
    {
        "pack_num": 25,
        "title": "Field Guide: Ordering Food & Restaurant Adjustments",
        "candidates": [
            ("一杯", "yì bēi", "Measure Word Phrase", "a cup of / a glass of", "我想要一杯热茶。(Wǒ xiǎng yào yì bēi rè chá.) — I'd like a cup of hot tea."),
            ("一碗", "yì wǎn", "Measure Word Phrase", "a bowl of", "请给我来一碗牛肉面。(Qǐng gěi wǒ lái yì wǎn niúròu miàn.) — Please bring me a bowl of beef noodles."),
            ("一份", "yí fèn", "Measure Word Phrase", "a portion of / an order of", "我们要一份煎饺。(Wǒmen yào yí fèn jiānjiǎo.) — We want an order of pan-fried dumplings."),
            ("一瓶", "yì píng", "Measure Word Phrase", "a bottle of", "我想要一瓶矿泉水。(Wǒ xiǎng yào yì píng kuàngquán shuǐ.) — I'd like a bottle of mineral water."),
            ("我想要", "wǒ xiǎng yào", "Phrase", "I would like (polite request)", "我想要一份菜单，谢谢。(Wǒ xiǎng yào yí fèn càidān, xièxie.) — I would like a menu, thank you."),
            ("不要辣", "bú yào là", "Phrase", "no spicy / not spicy", "这碗面请不要辣。(Zhè wǎn miàn qǐng bú yào là.) — Please make this bowl of noodles not spicy."),
            ("微辣", "wēi là", "Adjective Phrase", "mildly spicy / a little spicy", "我们点微辣的汤底。(Wǒmen diǎn wēi là de tāngdǐ.) — We order the mildly spicy soup base."),
            ("少冰", "shǎo bīng", "Phrase", "less ice", "这杯奶茶请少冰。(Zhè bēi nǎichá qǐng shǎo bīng.) — Less ice for this milk tea, please."),
            ("去冰", "qù bīng", "Phrase", "no ice", "请帮我做一杯去冰的红茶。(Qǐng bāng wǒ zuò yì bēi qù bīng de hóngchá.) — Please make me a cup of black tea with no ice."),
            ("常温", "chángwēn", "Noun / Adjective", "room temperature", "水要常温的，谢谢。(Shuǐ yào chángwēn de, xièxie.) — I'd like room temperature water, thanks."),
            ("热的", "rè de", "Phrase", "hot one", "我要一杯热的拿铁咖啡。(Wǒ yào yì bēi rè de nátiě kāfēi.) — I want a hot latte."),
            ("外带", "wàidài", "Verb", "takeout / to take away", "请问是堂食还是外带？(Qǐngwèn shì tángshí háishì wàidài?) — Excuse me, is it dine-in or takeout?"),
            ("在这里吃", "zài zhèlǐ chī", "Phrase", "dine in / eat here", "我们在这里吃。(Wǒmen zài zhèlǐ chī.) — We are eating here."),
            ("稍等", "shāoděng", "Verb", "wait a moment", "请稍等，菜马上就来。(Qǐng shāoděng, cài mǎshàng jiù lái.) — Please wait a moment, the dishes will arrive shortly."),
            ("忌口", "jìkǒu", "Noun / Verb", "dietary restrictions / avoid foods", "请问你们有什么忌口吗？(Qǐngwèn nǐmen yǒu shénme jìkǒu ma?) — Do you have any dietary restrictions?"),
            ("够了", "gòu le", "Phrase", "that's enough", "先点这些，够了，谢谢。(Xiān diǎn zhèxiē, gòu le, xièxie.) — That's enough for now, thanks."),
            ("还要别的吗", "hái yào bié de ma", "Question Phrase", "anything else?", "您好，还要别的吗？— 不要了。(Nín hǎo, hái yào bié de ma? — Bú yào le.) — Anything else? — Nothing else, thanks."),
            ("甜度", "tiándù", "Noun", "sweetness level", "请问饮品需要什么甜度？(Qǐngwèn yǐnpǐn xūyào shénme tiándù?) — What sweetness level would you like for your beverage?"),
            ("半糖", "bàn táng", "Phrase", "half sugar", "绿茶一杯，半糖少冰。(Lǜchá yì bēi, bàn táng shǎo bīng.) — One green tea, half sugar and less ice."),
            ("纸巾", "zhǐjīn", "Noun", "napkin / tissue", "麻烦给我们几张纸巾。(Máfan gěi wǒmen jǐ zhāng zhǐjīn.) — Could you please give us some napkins?"),
            ("不加香菜", "bù jiā xiāngcài", "Phrase", "no cilantro / coriander", "这碗牛肉粉请不加香菜。(Zhè wǎn niúrǒufěn qǐng bù jiā xiāngcài.) — Please do not add cilantro to this beef noodle soup."),
            ("加汤", "jiā tāng", "Verb Phrase", "refill soup", "服务员，麻烦帮我们加汤。(Fúwùyuán, máfan bāng wǒmen jiā tāng.) — Waiter, could you please refill our soup?"),
            ("免葱", "miǎn cōng", "Phrase", "omit green onions", "面里免葱，谢谢师傅。(Miàn lǐ miǎn cōng, xièxie shīfu.) — Omit scallions in the noodles, thanks chef."),
            ("结账", "jiézhàng", "Verb Phrase", "settle the bill", "你好，请问在哪里结账？(Nǐ hǎo, qǐngwèn zài nǎlǐ jiézhàng?) — Hello, where do I settle the bill?"),
            ("分单", "fēndān", "Verb Phrase", "split the bill", "请问可以分单付款吗？(Qǐngwèn kěyǐ fēndān fùkuǎn ma?) — Can we split the bill to pay?")
        ]
    },
    {
        "pack_num": 26,
        "title": "Field Guide: Shopping, Sizing & Garments",
        "candidates": [
            ("衬衫", "chènshān", "Noun", "shirt / button-up shirt", "我想要试一下这件白衬衫。(Wǒ xiǎng yào shì yíxià zhè jiàn bái chènshān.) — I'd like to try on this white shirt."),
            ("外套", "wàitào", "Noun", "coat / jacket", "有中号的蓝色外套吗？(Yǒu zhōnghào de lánsè wàitào ma?) — Do you have this blue jacket in medium?"),
            ("裤子", "kùzi", "Noun", "pants / trousers", "这条裤子有点长。(Zhè tiáo kùzi yǒudiǎnr cháng.) — These pants are a bit long."),
            ("大号", "dàhào", "Noun", "large size (L)", "请问这件衣服有大号吗？(Qǐngwèn zhè jiàn yīfu yǒu dàhào ma?) — Do you have a large in this garment?"),
            ("中号", "zhōnghào", "Noun", "medium size (M)", "我觉得中号最合身。(Wǒ juéde zhōnghào zuì héshēn.) — I think medium fits the best."),
            ("小号", "xiǎohào", "Noun", "small size (S)", "这个款式有小号吗？(Zhè ge kuǎnshì yǒu xiǎohào ma?) — Does this style come in small?"),
            ("试穿", "shìchuān", "Verb", "to try on (clothes)", "我可以试穿一下这双鞋吗？(Wǒ kěyǐ shìchuān yíxià zhè shuāng xié ma?) — May I try on this pair of shoes?"),
            ("试衣间", "shìyījiān", "Noun", "fitting room / dressing room", "请问试衣间在哪里？(Qǐngwèn shìyījiān zài nǎlǐ?) — Where is the fitting room?"),
            ("合身", "héshēn", "Adjective", "well-fitting / fits well", "大小正合适，非常合身。(Dàxiǎo zhèng héshì, fēicháng héshēn.) — The size is just right, it fits very well."),
            ("打折", "dǎzhé", "Verb", "to give a discount", "请问这件外套今天打折吗？(Qǐngwèn zhè jiàn wàitào jīntiān dǎzhé ma?) — Is this jacket on discount today?"),
            ("便宜一点", "piányi yìdiǎnr", "Phrase", "a little cheaper", "老板，能不能便宜一点？(Lǎobǎn, néng bu néng piányi yìdiǎnr?) — Boss, can you make it a bit cheaper?"),
            ("现金", "xiànjīn", "Noun", "cash", "请问这里可以付现金吗？(Qǐngwèn zhèlǐ kěyǐ fù xiànjīn ma?) — May I pay with cash here?"),
            ("换一件", "huàn yí jiàn", "Verb Phrase", "exchange for another piece", "这件有点脏，能换一件吗？(Zhè jiàn yǒudiǎnr zāng, néng huàn yí jiàn ma?) — This one has a smudge, could I swap it for another?"),
            ("宽松", "kuānsōng", "Adjective", "loose / roomy", "我喜欢宽松一点的版型。(Wǒ xǐhuan kuānsōng yìdiǎnr de bǎnxíng.) — I prefer a looser cut."),
            ("紧", "jǐn", "Adjective", "tight", "腰部感觉稍微有一点紧。(Yāobù gǎnjué shāowēi yǒu yìdiǎnr jǐn.) — The waist feels a little bit tight."),
            ("纯棉", "chúnmián", "Noun / Adjective", "100% cotton / pure cotton", "这件T恤是纯棉的，很舒服。(Zhè jiàn T-xù shì chúnmián de, hěn shūfu.) — This T-shirt is 100% cotton, very comfortable."),
            ("一双鞋", "yì shuāng xié", "Phrase", "a pair of shoes", "我想买一双鞋。(Wǒ xiǎng mǎi yì shuāng xié.) — I want to buy a pair of shoes."),
            ("收银台", "shōuyíntái", "Noun", "checkout counter / cashier", "收银台在靠近门口的地方。(Shōuyíntái zài kàojìn ménkǒu de dìfang.) — The cash register is near the exit."),
            ("发票", "fāpiào", "Noun", "official receipt / tax invoice", "请帮我开一张发票。(Qǐng bāng wǒ kāi yì zhāng fāpiào.) — Please provide an official invoice for me."),
            ("退换", "tuìhuàn", "Verb", "return or exchange", "七天之内可以凭小票退换。(Qī tiān zhīnèi kěyǐ píng xiǎopiào tuìhuàn.) — You can return or exchange within 7 days with receipt."),
            ("合适", "héshì", "Adjective", "suitable / fitting", "你觉得这条裙子合适吗？(Nǐ juéde zhè tiáo qúnzi héshì ma?) — Do you think this skirt is suitable?"),
            ("标价", "biāojià", "Noun", "marked price / tag price", "请看领子后面的标价。(Qǐng kàn lǐngzi hòumian de biāojià.) — Please look at the tag price behind the collar."),
            ("特大号", "tèdàhào", "Noun", "extra large (XL)", "这件外套有特大号的吗？(Zhè jiàn wàitào yǒu tèdàhào de ma?) — Is this coat available in extra large?"),
            ("保修", "bǎoxiū", "Verb / Noun", "warranty / guarantee", "电子手表全国联保保修一年。(Diànzǐ shǒubiǎo quánguó liánbǎo bǎoxiū yì nián.) — Electronic watch has one-year nationwide warranty.")
        ]
    },
    {
        "pack_num": 27,
        "title": "Field Guide: Conversational Particles & Nuance",
        "candidates": [
            ("吧", "ba", "Particle", "suggestion / softening particle", "我们先吃饭吧。(Wǒmen xiān chīfàn ba.) — Let's eat first."),
            ("呢", "ne", "Particle", "bounce-back / continuing topic particle", "我很好，你呢？(Wǒ hěn hǎo, nǐ ne?) — I'm good, and you?"),
            ("啊", "a", "Particle", "enthusiasm / confirmation particle", "好啊，我们一起去！(Hǎo a, wǒmen yìqǐ qù!) — Great, let's go together!"),
            ("先坐吧", "xiān zuò ba", "Phrase", "have a seat first", "请进，你先坐吧。(Qǐng jìn, nǐ xiān zuò ba.) — Please come in, have a seat first."),
            ("我们走吧", "wǒmen zǒu ba", "Phrase", "let's get going / let's leave", "时间到了，我们走吧。(Shíjiān dào le, wǒmen zǒu ba.) — It's time, let's go."),
            ("对吧", "duì ba", "Phrase", "right? / isn't that so?", "你是明天下午到，对吧？(Nǐ shì míngtiān xiàwǔ dào, duì ba?) — You arrive tomorrow afternoon, right?"),
            ("是吧", "shì ba", "Phrase", "yeah? / is that right?", "这家餐厅挺好吃的，是吧？(Zhè jiā cāntīng tǐng hǎochī de, shì ba?) — This restaurant is quite tasty, right?"),
            ("行吧", "xíng ba", "Phrase", "alright then / fair enough", "行吧，那就按你说的办。(Xíng ba, nà jiù àn nǐ shuō de bàn.) — Alright then, let's do it your way."),
            ("太好了", "tài hǎo le", "Exclamation Phrase", "wonderful! / that's great!", "你明天能来？太好了！(Nǐ míngtiān néng lái? Tài hǎo le!) — You can come tomorrow? Fantastic!"),
            ("看情况吧", "kàn qíngkuàng ba", "Phrase", "we'll see / depends on situation", "周末去不去爬山？— 看情况吧。(Zhōumò qù bu qù páshān? — Kàn qíngkuàng ba.) — Hiking this weekend? — We'll see how it goes."),
            ("这样啊", "zhèyàng a", "Phrase", "I see / so that's how it is", "原来是这样啊，我明白了。(Yuánlái shì zhèyàng a, wǒ míngbai le.) — Oh so that's how it is, I understand now."),
            ("没事啊", "méishì a", "Phrase", "no problem at all / don't worry", "没事啊，不用客气。(Méishì a, bú yòng kèqi.) — No problem at all, don't mention it."),
            ("快点吧", "kuài diǎnr ba", "Phrase", "hurry up a bit", "快点吧，电影要开始了。(Kuài diǎnr ba, diànyǐng yào kāishǐ le.) — Hurry up a bit, the movie is starting."),
            ("知道了", "zhīdào le", "Phrase", "got it / understood", "妈妈提醒的事情我都知道了。(Māma tíxǐng de shìqing wǒ dōu zhīdào le.) — I got everything mom reminded me of."),
            ("行啊", "xíng a", "Phrase", "sounds good / sure thing", "明晚一起吃饭？— 行啊！(Míngwǎn yìqǐ chīfàn? — Xíng a!) — Dinner tomorrow night? — Sure thing!"),
            ("好吧", "hǎo ba", "Phrase", "okay then / fine", "好吧，那我先回去了。(Hǎo ba, nà wǒ xiān huíqù le.) — Okay then, I'll head back first."),
            ("去哪儿呢", "qù nǎr ne", "Question Phrase", "where are you headed? / where to go?", "放假大家都在商量去哪儿呢。(Fàngjià dàjiā dōu zài shāngliang qù nǎr ne.) — Everyone is discussing where to go during break."),
            ("怎么说呢", "zěnme shuō ne", "Phrase", "how should I put it...", "怎么说呢，感觉还行吧。(Zěnme shuō ne, gǎnjué hái xíng ba.) — How should I put it, felt just okay."),
            ("谁说的啊", "shéi shuō de a", "Phrase", "who said that?!", "谁说的啊，根本没有这回事。(Shéi shuō de a, gēnběn méiyǒu zhè huí shì.) — Who said that?! That's not the case at all."),
            ("差不多吧", "chàbuduō ba", "Phrase", "pretty much / about right", "准备工作做得差不多吧。(Zhǔnbèi gōngzuò zuò de chàbuduō ba.) — The preparations are pretty much done."),
            ("再说吧", "zàishuō ba", "Phrase", "let's talk later / decide later", "这件事我们明天开会再说吧。(Zhè jiàn shì wǒmen míngtiān kāihuì zàishuō ba.) — Let's discuss this matter in tomorrow's meeting."),
            ("真香啊", "zhēn xiāng a", "Exclamation Phrase", "smells so good!", "这盘红烧肉真香啊！(Zhè pán hóngshāoròu zhēn xiāng a!) — This braised pork smells so good!"),
            ("想什么呢", "xiǎng shénme ne", "Question Phrase", "what are you daydreaming about?", "你一个人坐在这里想什么呢？(Nǐ yí ge rén zuò zài zhèlǐ xiǎng shénme ne?) — Sitting here alone, what are you thinking about?"),
            ("算了", "suàn le", "Interjection", "forget it / drop it", "既然买不到票，那就算了吧。(Jìrán mǎi bú dào piào, nà jiù suàn le ba.) — Since tickets are sold out, let's forget it.")
        ]
    },
    {
        "pack_num": 28,
        "title": "Field Guide: Conversation Rescue & Repair Loops",
        "candidates": [
            ("没听懂", "méi tīngdǒng", "Verb Phrase", "did not understand / didn't catch that", "不好意思，我刚才没听懂。(Bù hǎoyìsi, wǒ gāngcái méi tīngdǒng.) — Sorry, I didn't understand just now."),
            ("请再说一遍", "qǐng zài shuō yí biàn", "Phrase", "please say it once more", "信号不太好，请再说一遍。(Xìnhào bú tài hǎo, qǐng zài shuō yí biàn.) — Bad signal, please say that one more time."),
            ("说慢一点", "shuō màn yìdiǎnr", "Phrase", "speak a bit slower", "我的中文不太好，请说慢一点。(Wǒ de zhōngwén bú tài hǎo, qǐng shuō màn yìdiǎnr.) — My Chinese isn't great, please speak slower."),
            ("怎么说", "zěnme shuō", "Question Phrase", "how do you say...", "请问这个用中文怎么说？(Qǐngwèn zhè ge yòng zhōngwén zěnme shuō?) — Excuse me, how do you say this in Chinese?"),
            ("写下来", "xiě xiàlái", "Verb Phrase", "to write it down", "可以麻烦您帮我写下来吗？(Kěyǐ máfan nín bāng wǒ xiě xiàlái ma?) — Could you please write that down for me?"),
            ("打字", "dǎzì", "Verb Phrase", "to type characters", "可以打字给我看一下吗？(Kěyǐ dǎzì gěi wǒ kàn yíxià ma?) — Could you type it on your phone so I can see?"),
            ("你的意思是", "nǐ de yìsi shì", "Phrase", "do you mean... / your meaning is", "你的意思是明天不上课，对吗？(Nǐ de yìsi shì míngtiān bú shàngkè, duì ma?) — Your meaning is there's no class tomorrow, right?"),
            ("不知道怎么说", "bù zhīdào zěnme shuō", "Phrase", "don't know how to explain", "我想表达，但不知道怎么说。(Wǒ xiǎng biǎodá, dàn bù zhīdào zěnme shuō.) — I want to express it, but don't know how to say it."),
            ("一句一句地说", "yí jù yí jù de shuō", "Phrase", "speak sentence by sentence", "可以一句一句地说吗？(Kěyǐ yí jù yí jù de shuō ma?) — Could you go sentence by sentence?"),
            ("怎么拼", "zěnme pīn", "Question Phrase", "how do you spell it (in pinyin)?", "请问这个字怎么拼？(Qǐngwèn zhè ge zì zěnme pīn?) — Excuse me, how is this character spelled?"),
            ("什么意思", "shénme yìsi", "Question Phrase", "what does it mean?", "请问这个词是什么意思？(Qǐngwèn zhè ge cí shì shénme yìsi?) — What does this vocabulary word mean?"),
            ("听清楚", "tīng qīngchu", "Verb Phrase", "hear clearly", "环境有点吵，我没听清楚。(Huánjìng yǒudiǎnr chǎo, wǒ méi tīng qīngchu.) — It's noisy here, I didn't hear clearly."),
            ("懂了", "dǒng le", "Phrase", "understood / got it now", "谢谢你的耐心解释，我现在懂了。(Xièxie nǐ de nàixīn jiěshì, wǒ xiànzài dǒng le.) — Thanks for your patient explanation, I get it now."),
            ("对吗", "duì ma", "Question Phrase", "is that correct? / right?", "你是说九点半在大门见，对吗？(Nǐ shì shuō jiǔ diǎn bàn zài dàmén jiàn, duì ma?) — You said meet at 9:30 at the gate, right?"),
            ("等等我", "děngděng wǒ", "Phrase", "wait for me", "走得太快了，等等我！(Zǒu de tài kuài le, děngděng wǒ!) — You're walking too fast, wait for me!"),
            ("稍等一下", "shāoděng yíxià", "Phrase", "just a brief moment", "请稍等一下，我查一下地图。(Qǐng shāoděng yíxià, wǒ chá yíxià dìtú.) — Just a moment, let me check the map."),
            ("手势", "shǒushì", "Noun", "gesture / hand signal", "听不懂的时候可以用手势比划。(Tīng bù dǒng de shíhou kěyǐ yòng shǒushì bǐhua.) — When you don't understand, you can gesture."),
            ("指一下", "zhǐ yíxià", "Verb Phrase", "point at it", "请在菜单上指一下你想要的菜。(Qǐng zài càidān shang zhǐ yíxià nǐ xiǎng yào de cài.) — Please point to the dish you want on the menu."),
            ("发音", "fāyīn", "Noun / Verb", "pronunciation / to pronounce", "我的发音对不对？(Wǒ de fāyīn duì bu duì?) — Is my pronunciation correct?"),
            ("再说一次", "zài shuō yí cì", "Phrase", "say it once again", "不好意思，麻烦再说一次。(Bù hǎoyìsi, máfan zài shuō yí cì.) — Excuse me, please say it one more time."),
            ("听力", "tīnglì", "Noun", "listening ability / comprehension", "每天听中文播客可以提高听力。(Měitiān tīng zhōngwén bōkè kěyǐ tígāo tīnglì.) — Listening to Chinese podcasts daily improves listening skills."),
            ("重复", "chóngfù", "Verb", "to repeat", "老师把刚才的重点重复了一遍。(Lǎoshī bǎ gāngcái de zhòngdiǎn chóngfù le yí biàn.) — The teacher repeated the key point just mentioned."),
            ("清楚", "qīngchu", "Adjective", "clear / distinct", "现在声音非常清楚了。(Xiànzài shēngyīn fēicháng qīngchu le.) — The audio is very clear now.")
        ]
    },
    {
        "pack_num": 29,
        "title": "Field Guide: Numbers, Prices & Practical Math",
        "candidates": [
            ("两块", "liǎng kuài", "Measure Word Phrase", "two yuan (colloquial)", "这瓶水两块钱。(Zhè píng shuǐ liǎng kuài qián.) — This bottle of water is two yuan."),
            ("毛", "máo", "Measure Word / Noun", "10 cents (0.1 yuan, dime)", "一共五块五毛钱。(Yígòng wǔ kuài wǔ máo qián.) — In total five yuan and fifty cents."),
            ("角", "jiǎo", "Measure Word / Noun", "dime / 0.1 yuan (formal)", "一元等于十角。(Yì yuán děngyú shí jiǎo.) — One yuan equals ten jiao."),
            ("一共", "yígòng", "Adverb", "altogether / in total", "两样东西一共多少钱？(Liǎng yàng dōngxi yígòng duōshao qián?) — How much are these two items in total?"),
            ("微信支付", "wēixìn zhīfù", "Proper Noun Phrase", "WeChat Pay", "这里支持微信支付吗？(Zhèlǐ zhīchí wēixìn zhīfù ma?) — Do you accept WeChat Pay here?"),
            ("支付宝", "zhīfùbǎo", "Proper Noun", "Alipay", "我可以用支付宝付钱吗？(Wǒ kěyǐ yòng zhīfùbǎo fù qián ma?) — Can I pay with Alipay?"),
            ("找钱", "zhǎoqián", "Verb Phrase", "to give change", "请稍等，我找钱给你。(Qǐng shāoděng, wǒ zhǎoqián gěi nǐ.) — Please wait a moment, I will give you your change."),
            ("电话号码", "diànhuà hàomǎ", "Noun", "telephone number", "请留一下您的电话号码。(Qǐng liú yíxià nín de diànhuà hàomǎ.) — Please leave your phone number."),
            ("零钱", "língqián", "Noun", "small change / pocket money", "不好意思，我没有零钱。(Bù hǎoyìsi, wǒ méiyǒu língqián.) — Sorry, I don't have small change."),
            ("打八折", "dǎ bā zhé", "Phrase", "20% off (pay 80%)", "全场衣服今天打八折。(Quánchǎng yīfu jīntiān dǎ bā zhé.) — All clothes are 20% off today."),
            ("一百零八", "yì bǎi líng bā", "Number Phrase", "108", "这件衬衫售价一百零八块。(Zhè jiàn chènshān shòujià yì bǎi líng bā kuài.) — This shirt sells for 108 yuan."),
            ("两千", "liǎng qiān", "Number Phrase", "two thousand", "这台电脑售价两千块。(Zhè tái diànnǎo shòujià liǎng qiān kuài.) — This computer costs two thousand yuan."),
            ("一万", "yí wàn", "Number Phrase", "ten thousand (10,000)", "这个月预算是一万块。(Zhè ge yuè yùsuàn shì yí wàn kuài.) — This month's budget is 10,000 yuan."),
            ("分", "fēn", "Measure Word / Noun", "cent / penny / minute", "两块零五分。(Liǎng kuài líng wǔ fēn.) — Two yuan and five cents."),
            ("半价", "bànjià", "Noun / Adjective", "half price", "第二件饮品半价。(Dì èr jiàn yǐnpǐn bànjià.) — Second drink is half price."),
            ("收费", "shōufèi", "Verb / Noun", "to charge a fee / fee", "请问这个停车场怎么收费？(Qǐngwèn zhè ge tíngchēchǎng zěnme shōufèi?) — How does this parking lot charge?"),
            ("免费", "miǎnfèi", "Adjective", "free of charge", "店里的茶水是免费的。(Diàn lǐ de cháshuǐ shì miǎnfèi de.) — The tea in the store is free of charge."),
            ("买一送一", "mǎi yī sòng yī", "Idiom / Phrase", "buy one get one free", "今天咖啡买一送一！(Jīntiān kāfēi mǎi yī sòng yī!) — Coffee is buy-one-get-one-free today!"),
            ("价格", "jiàgé", "Noun", "price", "这个合理的价格吸引了很多人。(Zhè ge hélǐ de jiàgé xīyǐn le hěn duō rén.) — This reasonable price attracted many people."),
            ("特价", "tèjià", "Noun", "special offer / sale price", "新鲜草莓今天特价只要十块钱。(Xīnxiān cǎoméi jīntiān tèjià zhǐ yào shí kuài qián.) — Fresh strawberries are on sale for just 10 yuan today."),
            ("转账", "zhuǎnzhàng", "Verb", "transfer money (bank/app)", "我把餐费转账给你了。(Wǒ bǎ cānfèi zhuǎnzhàng gěi nǐ le.) — I transferred the meal cost to you."),
            ("计算器", "jìsuànqì", "Noun", "calculator", "请用计算器算一下总数。(Qǐng yòng jìsuànqì suàn yíxià zǒngshù.) — Please calculate the total with a calculator."),
            ("小票", "xiǎopiào", "Noun", "receipt / shopping docket", "这是您的小票，请拿好。(Zhè shì nín de xiǎopiào, qǐng ná hǎo.) — Here is your receipt, please hold onto it.")
        ]
    },
    {
        "pack_num": 30,
        "title": "Field Guide: Relative Time & Weekly Planning",
        "candidates": [
            ("前天", "qiántiān", "Noun", "the day before yesterday", "我是前天晚上到北京的。(Wǒ shì qiántiān wǎnshang dào Běijīng de.) — I arrived in Beijing the night before yesterday."),
            ("后天", "hòutiān", "Noun", "the day after tomorrow", "后天上午我们有一场考试。(Hòutiān shàngwǔ wǒmen yǒu yì chǎng kǎoshì.) — We have an exam the morning after tomorrow."),
            ("上个星期", "shàng ge xīngqī", "Noun Phrase", "last week", "上个星期我去了上海出差。(Shàng ge xīngqī wǒ qù le Shànghǎi chūchāi.) — Last week I went on a business trip to Shanghai."),
            ("下个星期", "xià ge xīngqī", "Noun Phrase", "next week", "下个星期我们去看电影吧。(Xià ge xīngqī wǒmen qù kàn diànyǐng ba.) — Let's go watch a movie next week."),
            ("上个月", "shàng ge yuè", "Noun Phrase", "last month", "上个月天气特别热。(Shàng ge yuè tiānqì tèbié rè.) — Last month the weather was especially hot."),
            ("下个月", "xià ge yuè", "Noun Phrase", "next month", "下个月姐姐要来北京看我。(Xià ge yuè jiějie yào lái Běijīng kàn wǒ.) — Next month my elder sister will visit me in Beijing."),
            ("前年", "qiánnián", "Noun", "the year before last", "我是前年开始学中文的。(Wǒ shì qiánnián kāishǐ xué zhōngwén de.) — I started learning Chinese the year before last."),
            ("后年", "hòunián", "Noun", "the year after next", "他打算后年大学毕业。(Tā dǎsuàn hòunián dàxué bìyè.) — He plans to graduate from university the year after next."),
            ("平时", "píngshí", "Noun", "normally / usually / weekdays", "你平时几点下班？(Nǐ píngshí jǐ diǎn xiàbān?) — What time do you normally get off work?"),
            ("以前", "yǐqián", "Noun / Time Word", "before / previously", "我以前在伦敦住过两年。(Wǒ yǐqián zài Lúndūn zhù guo liǎng nián.) — I lived in London for two years previously."),
            ("以后", "yǐhòu", "Noun / Time Word", "after / in the future", "吃完饭以后我们去散步。(Chī wán fàn yǐhòu wǒmen qù sànbù.) — After finishing the meal we'll go for a walk."),
            ("有时候", "yǒu shíhou", "Adverb Phrase", "sometimes", "我平时做饭，有时候点外卖。(Wǒ píngshí zuòfàn, yǒu shíhou diǎn wàimài.) — I usually cook, sometimes order takeout."),
            ("有空", "yǒu kòng", "Phrase", "to have free time / available", "你今天晚上有空吗？(Nǐ jīntiān wǎnshang yǒu kòng ma?) — Are you free tonight?"),
            ("没空", "méi kòng", "Phrase", "not available / no free time", "真不好意思，我明天一整天都没空。(Zhēn bù hǎoyìsi, wǒ míngtiān yì zhěng tiān dōu méi kòng.) — Really sorry, I have no free time all day tomorrow."),
            ("改天", "gǎitiān", "Adverb", "another day / some other time", "今天太匆忙了，改天再聚吧！(Jīntiān tài cōngmáng le, gǎitiān zài jù ba!) — Today is too rushed, let's meet another day!"),
            ("提前", "tíqián", "Verb / Adverb", "in advance / ahead of schedule", "我们需要提前半小时到达车站。(Wǒmen xūyào tíqián bàn xiǎoshí dàodá chēzhàn.) — We need to arrive at the station half an hour early."),
            ("推迟", "tuīchí", "Verb", "to postpone / delay", "因为下雨，活动推迟到下周。(Yīnwèi xiàyǔ, huódòng tuīchí dào xià zhōu.) — Due to rain, the event is postponed until next week."),
            ("马上", "mǎshàng", "Adverb", "right away / immediately", "我马上就到楼下了。(Wǒ mǎshàng jiù dào lóuxià le.) — I'll be downstairs immediately."),
            ("刚", "gāng", "Adverb", "just now / just", "我刚从超市买菜回来。(Wǒ gāng cóng chāoshì mǎi cài huílái.) — I just returned from grocery shopping at the supermarket."),
            ("已经", "yǐjīng", "Adverb", "already", "火车已经进站了。(Huǒchē yǐjīng jìnzhàn le.) — The train has already entered the station."),
            ("一会儿", "yíhuìr", "Time Word / Noun", "a short while / in a moment", "我休息一会儿就继续写作业。(Wǒ xiūxi yíhuìr jiù jìxù xiě zuòyè.) — I'll rest a moment then continue homework."),
            ("稍后", "shāohòu", "Adverb", "a little later / shortly", "我稍后给您回电话。(Wǒ shāohòu gěi nín huí diànhuà.) — I will call you back shortly."),
            ("定期", "dìngqī", "Adverb / Adjective", "regularly / at regular intervals", "汽车需要定期保养。(Qìchē xūyào dìngqī bǎoyǎng.) — Cars need regular maintenance.")
        ]
    },
    {
        "pack_num": 31,
        "title": "Field Guide: Everyday Home & Living Spaces",
        "candidates": [
            ("吃饱了", "chī bǎo le", "Phrase", "full / ate until full", "我已经吃饱了，谢谢。(Wǒ yǐjīng chī bǎo le, xièxie.) — I am already full, thank you."),
            ("关灯", "guān dēng", "Verb Phrase", "to turn off the light", "睡觉前别忘了关灯。(Shuìjiào qián bié wàng le guān dēng.) — Don't forget to turn off the light before sleeping."),
            ("开门", "kāi mén", "Verb Phrase", "to open the door", "请去开门。(Qǐng qù kāi mén.) — Please go open the door."),
            ("沙发", "shāfā", "Noun", "sofa / couch", "躺在舒服的沙发上休息。(Tǎng zài shūfu de shāfā shang xiūxi.) — Lying on the comfortable couch resting."),
            ("拖鞋", "tuōxié", "Noun", "slippers", "进屋请换上干净的拖鞋。(Jìn wū qǐng huàn shang gānjìng de tuōxié.) — Please switch into clean slippers upon entering."),
            ("毛巾", "máojīn", "Noun", "towel", "这条新毛巾吸水性特别好。(Zhè tiáo xīn máojīn xīshuǐ xìng tèbié hǎo.) — This new towel is very absorbent."),
            ("倒水", "dào shuǐ", "Verb Phrase", "to pour water", "请帮客人倒水。(Qǐng bāng kèrén dào shuǐ.) — Please pour water for the guest."),
            ("洗手", "xǐ shǒu", "Verb Phrase", "to wash hands", "饭前一定要先洗手。(Fàn qián yídìng yào xiān xǐ shǒu.) — Be sure to wash hands before meals."),
            ("微波炉", "wēibōlú", "Noun", "microwave oven", "把冷饭放进微波炉热两分钟。(Bǎ lěng fàn fàng jìn wēibōlú rè liǎng fēnzhōng.) — Heat cold rice in the microwave for two minutes."),
            ("出门", "chūmén", "Verb Phrase", "to go out / leave home", "出门记得带钥匙和手机。(Chūmén jìde dài yàoshi hé shǒujī.) — Remember to take your keys and phone when going out."),
            ("衣柜", "yīguì", "Noun", "wardrobe / clothes closet", "洗干净的外套挂在衣柜里。(Xǐ gānjìng de wàitào guà zài yīguì lǐ.) — Hang clean jackets in the wardrobe."),
            ("鞋架", "xiéjià", "Noun", "shoe rack", "进门把鞋子整齐地放在鞋架上。(Jìnmén bǎ xiézi zhěngqí de fàng zài xiéjià shang.) — Place shoes neatly on the shoe rack upon entering."),
            ("被子", "bèizi", "Noun", "quilt / blanket", "冬天睡觉盖厚一点的被子。(Dōngtiān shuìjiào gài hòu yìdiǎnr de bèizi.) — Sleep under a thicker quilt in winter."),
            ("枕头", "zhěntou", "Noun", "pillow", "这个记忆棉枕头很舒服。(Zhè ge jìyìmián zhěntou hěn shūfu.) — This memory foam pillow is very comfortable."),
            ("镜子", "jìngzi", "Noun", "mirror", "出门前在穿衣镜子前整理一下。(Chūmén qián zài chuānyī jìngzi qián zhěnglǐ yíxià.) — Tidy up before the full-length mirror before heading out."),
            ("扫地", "sǎo dì", "Verb Phrase", "sweep the floor", "吃完晚饭后弟弟负责扫地。(Chī wán wǎnfàn hòu dìdi fùzé sǎo dì.) — Younger brother sweeps the floor after dinner."),
            ("拖地", "tuō dì", "Verb Phrase", "mop the floor", "地板弄脏了，我来拖地。(Dìbǎn nòng zāng le, wǒ lái tuō dì.) — The floor got dirty, I will mop it."),
            ("倒垃圾", "dào lājī", "Verb Phrase", "take out the trash", "下楼顺便倒垃圾。(Xià lóu shùnbiàn dào lājī.) — Take out the trash on your way downstairs."),
            ("晾衣服", "liàng yīfu", "Verb Phrase", "hang clothes to dry", "衣服洗好了，拿到阳台去晾衣服。(Yīfu xǐ hǎo le, ná dào yángtái qù liàng yīfu.) — Clothes are washed, bring them to the balcony to dry."),
            ("开水壶", "kāishuǐhú", "Noun", "electric kettle / water boiler", "用电开水壶烧一壶热水。(Yòng diàn kāishuǐhú shāo yì hú rèshuǐ.) — Boil a pot of hot water with the electric kettle.")
        ]
    },
    {
        "pack_num": 32,
        "title": "Field Guide: Polite Reactions & Social Courtesies",
        "candidates": [
            ("请问", "qǐngwèn", "Phrase", "excuse me / may I ask", "请问洗手间在哪儿？(Qǐngwèn xǐshǒujiān zài nǎr?) — Excuse me, where is the restroom?"),
            ("是吗", "shì ma", "Question Phrase", "is that so?", "明天会降温？是吗，那我多穿点。(Míngtiān huì jiàngwēn? Shì ma, nà wǒ duō chuān diǎnr.) — Temperature dropping tomorrow? Is that so, I'll bundle up."),
            ("不用了", "bú yòng le", "Phrase", "no need / no thank you", "要喝水吗？— 不用了，谢谢。(Yào hē shuǐ ma? — Bú yòng le, xièxie.) — Want water? — No thank you."),
            ("我想一下", "wǒ xiǎng yíxià", "Phrase", "let me think / let me consider", "这个提议很好，让我想一下。(Zhè ge tíyì hěn hǎo, ràng wǒ xiǎng yíxià.) — Good suggestion, let me think about it."),
            ("麻烦你", "máfan nǐ", "Phrase", "could you please / bother you to", "麻烦你帮我递一下那本书。(Máfan nǐ bāng wǒ dì yíxià nà běn shū.) — Could you bother to pass me that book?"),
            ("借过", "jièguò", "Verb Phrase", "excuse me (passing by in crowd)", "借过借过，请大家让一让。(Jièguò jièguò, qǐng dàjiā ràng yí ràng.) — Excuse me passing through, please let me pass."),
            ("干杯", "gānbēi", "Verb Phrase", "cheers! / bottoms up", "为了我们的友谊，干杯！(Wèile wǒmen de yǒuyì, gānbēi!) — Cheers to our friendship!"),
            ("哪里哪里", "nǎlǐ nǎlǐ", "Phrase", "not at all / humble deflection", "您的中文讲得真好！— 哪里哪里，还在学。(Nín de zhōngwén jiǎng de zhēn hǎo! — Nǎlǐ nǎlǐ, hái zài xué.) — Your Chinese is great! — Not at all, still learning."),
            ("打扰了", "dǎrǎo le", "Verb Phrase", "sorry to disturb you", "不好意思打扰了，我想问个路。(Bù hǎoyìsi dǎrǎo le, wǒ xiǎng wèn ge lù.) — Sorry to disturb you, I wanted to ask for directions."),
            ("祝贺", "zhùhè", "Verb", "to congratulate", "祝贺你顺利通过了考试！(Zhùhè nǐ shùnlì tōngguò le kǎoshì!) — Congratulations on passing your exam smoothly!"),
            ("保重", "bǎozhòng", "Verb", "take care of yourself", "天气变冷了，多保重身体。(Tiānqì biàn lěng le, duō bǎozhòng shēntǐ.) — Weather is getting colder, take care of your health."),
            ("慢走", "màn zǒu", "Phrase", "take care on your way out (host to guest)", "吃好喝好了，您慢走，常来啊！(Chī hǎo hē hǎo le, nín màn zǒu, cháng lái a!) — Hope you enjoyed it, take care, come again!"),
            ("请慢用", "qǐng màn yòng", "Phrase", "please enjoy your meal", "您的菜齐了，请慢用。(Nín de cài qí le, qǐng màn yòng.) — All your dishes are here, please enjoy your meal."),
            ("抱歉", "bàoqiàn", "Adjective / Verb", "apologetic / sorry", "非常抱歉让您久等了。(Fēicháng bàoqiàn ràng nín jiǔděng le.) — Very sorry to have kept you waiting so long."),
            ("客气", "kèqi", "Adjective", "polite / courteous", "都是老朋友了，别那么客气。(Dōu shì lǎo péngyou le, bié nàme kèqi.) — We're old friends, don't be so formal."),
            ("一路顺风", "yílù shùnfēng", "Idiom", "have a pleasant journey / bon voyage", "明天坐飞机回国？祝你一路顺风！(Míngtiān zuò fēijī huíguó? Zhù nǐ yílù shùnfēng!) — Flying home tomorrow? Bon voyage!"),
            ("欢迎光临", "huānyíng guānglín", "Phrase", "welcome to our store!", "欢迎光临，请问几位？(Huānyíng guānglín, qǐngwèn jǐ wèi?) — Welcome, table for how many?"),
            ("请多指教", "qǐng duō zhǐjiào", "Phrase", "please give me guidance", "我是新来的实习生，请多指教。(Wǒ shì xīn lái de shíxíshēng, qǐng duō zhǐjiào.) — I am a new intern, please give me your guidance."),
            ("随时效劳", "suíshí xiàoláo", "Phrase", "at your service anytime", "有什么需要帮忙的，随时效劳。(Yǒu shénme xūyào bāngmáng de, suíshí xiàoláo.) — Whatever help you need, at your service anytime."),
            ("多谢", "duōxiè", "Phrase", "many thanks", "及时提醒，多谢多谢！(Jíshí tíxǐng, duōxiè duōxiè!) — Timely reminder, many thanks!")
        ]
    },
    {
        "pack_num": 33,
        "title": "Field Guide: 7-Day Travel Survival & Wayfinding",
        "candidates": [
            ("地址", "dìzhǐ", "Noun", "address", "这是我要去的具体地址。(Zhè shì wǒ yào qù de jùtǐ dìzhǐ.) — This is the specific address I want to go to."),
            ("多长时间", "duō cháng shíjiān", "Question Phrase", "how long (duration)", "开车到机场大概要多长时间？(Kāichē dào jīchǎng dàgài yào duō cháng shíjiān?) — About how long does driving to the airport take?"),
            ("房卡", "fángkǎ", "Noun", "room keycard", "这是您的房卡，电梯需要刷卡。(Zhè shì nín de fángkǎ, diàntī xūyào shuākǎ.) — Here is your room card, elevator requires tapping."),
            ("押金", "yājīn", "Noun", "security deposit", "入住需要交两百块押金。(Rùzhù xūyào jiāo liǎng bǎi kuài yājīn.) — Checking in requires a 200 yuan deposit."),
            ("早餐", "zǎocān", "Noun", "breakfast", "请问明天的早餐几点开始？(Qǐngwèn míngtiān de zǎocān jǐ diǎn kāishǐ?) — What time does breakfast start tomorrow?"),
            ("往左拐", "wǎng zuǒ guǎi", "Verb Phrase", "turn left", "走到十字路口往左拐。(Zǒu dào shízì lùkǒu wǎng zuǒ guǎi.) — Walk to the intersection and turn left."),
            ("往右拐", "wǎng yòu guǎi", "Verb Phrase", "turn right", "穿过马路然后往右拐。(Chuānguò mǎlù ránhòu wǎng yòu guǎi.) — Cross the street then turn right."),
            ("往直走", "wǎng zhí zǒu", "Verb Phrase", "go straight ahead", "沿着这条街一直往直走五百米。(Yánzhe zhè tiáo jiē yìzhí wǎng zhí zǒu wǔ bǎi mǐ.) — Walk straight ahead along this street for 500 meters."),
            ("到了", "dào le", "Phrase", "arrived / here we are", "师傅，就在前面路口停，到了。(Shīfu, jiù zài qiánmian lùkǒu tíng, dào le.) — Driver, please stop at the front intersection, we're here."),
            ("寄存", "jìcún", "Verb", "to store / check luggage", "车站有寄存大件行李的地方吗？(Chēzhàn yǒu jìcún dàjiàn xíngli de dìfang ma?) — Is there a luggage storage area at the station?"),
            ("问路", "wèn lù", "Verb Phrase", "to ask for directions", "路不熟的时候找警察问路最安全。(Lù bù shú de shíhou zhǎo jǐngchá wèn lù zuì ānquán.) — When unfamiliar with the route, asking police for directions is safest."),
            ("登机口", "dēngjīkǒu", "Noun", "boarding gate", "您的航班在十六号登机口登机。(Nín de hángbān zài shíliù hào dēngjīkǒu dēngjī.) — Your flight is boarding at gate 16."),
            ("高铁", "gāotiě", "Noun", "high-speed rail (bullet train)", "从北京坐高铁到上海只要四个多小时。(Cóng Běijīng zuò gāotiě dào Shànghǎi zhǐ yào sì ge duō xiǎoshí.) — High-speed rail from Beijing to Shanghai takes only 4+ hours."),
            ("一卡通", "yīkǎtōng", "Noun", "transit smart card (metro card)", "刷交通一卡通坐地铁非常方便。(Shuā jiāotōng yīkǎtōng zuò dìtiě fēicháng fāngbiàn.) — Tapping the transit metro card is very convenient."),
            ("应急", "yìngjí", "Verb / Adjective", "emergency / contingency", "出门旅行随身带上应急药品。(Chūmén lǚxíng suíshēn dài shang yìngjí yàopǐn.) — Carry contingency medicines when traveling."),
            ("安检", "ānjiǎn", "Noun / Verb", "security check", "请提前准备好证件配合安检。(Qǐng tíqián zhǔnbèi hǎo zhèngjiàn pèihé ānjiǎn.) — Please prepare ID cards ahead for security check."),
            ("检票口", "jiǎnpiàokǒu", "Noun", "ticket check gate", "发车前十五分钟开始在三号检票口检票。(Fāchē qián shíwǔ fēnzhōng kāishǐ zài sān hào jiǎnpiàokǒu jiǎnpiào.) — Ticket checking starts 15 minutes before departure at gate 3."),
            ("换乘", "huànchéng", "Verb", "transfer / change train or bus", "在下一站换乘地铁二号线。(Zài xià yí zhàn huànchéng dìtiě èr hào xiàn.) — Transfer to Metro Line 2 at the next station."),
            ("出站口", "chūzhànkǒu", "Noun", "station exit gate", "我们在火车站南出站口碰头。(Wǒmen zài huǒchēzhàn nán chūzhànkǒu pèngtóu.) — We'll meet at the south exit gate of the train station."),
            ("问询处", "wènxúnchù", "Noun", "information / inquiry desk", "如有遗失物品请去大厅问询处。(Rú yǒu yíshī wùpǐn qǐng qù dàtīng wènxúnchù.) — For lost items, please visit the hall information desk.")
        ]
    },
    {
        "pack_num": 34,
        "title": "Field Guide: Tone Pairs Lab (16 Pitches & Sandhi)",
        "candidates": [
            ("欢迎", "huānyíng", "Verb", "to welcome (Tone 1-2 pair)", "热烈欢迎新同学加入！(Rèliè huānyíng xīn tóngxué jiārù!) — Warmly welcome new classmates joining!"),
            ("面包", "miànbāo", "Noun", "bread (Tone 4-1 / 1-4 pair)", "早餐吃一片烤面包和鸡蛋。(Zǎocān chī yí piàn kǎo miànbāo hé jīdàn.) — Eat a slice of toast and an egg for breakfast."),
            ("首都", "shǒudū", "Noun", "capital city (Tone 3-1 pair)", "北京是中国的首都。(Běijīng shì Zhōngguó de shǒudū.) — Beijing is the capital of China."),
            ("简单", "jiǎndān", "Adjective", "simple / uncomplicated (Tone 3-2 pair)", "这个句子其实非常简单。(Zhè ge jùzi qíshí fēicháng jiǎndān.) — This sentence is actually very simple."),
            ("语法", "yǔfǎ", "Noun", "grammar (Tone 3-4 pair)", "掌握基础的汉语语法规则。(Zhǎowò jīchǔ de hànyǔ yǔfǎ guīzé.) — Master fundamental Chinese grammar rules."),
            ("汉字", "hànzì", "Noun", "Chinese characters (Tone 4-3 pair)", "学习书写常用汉字很实用。(Xuéxí shūxiě chángyòng hànzì hěn shíyòng.) — Learning to write common Chinese characters is very practical."),
            ("一样", "yí yàng", "Adjective / Phrase", "same / alike (一 Tone 2 sandhi)", "这两件衣服的质量完全一样。(Zhè liǎng jiàn yīfu de zhìliàng wánquán yí yàng.) — The quality of these two garments is completely identical."),
            ("不是", "bú shì", "Phrase", "is not (不 Tone 2 sandhi)", "他不是本地人，是从南方来的。(Tā bú shì běndì rén, shì cóng nánfāng lái de.) — He is not a local, he came from the south."),
            ("不要", "bú yào", "Phrase", "do not / don't want (不 Tone 2 sandhi)", "过马路时千万不要看手机。(Guò mǎlù shí qiānwàn bú yào kàn shǒujī.) — Definitely do not look at your phone when crossing the street."),
            ("一起", "yìqǐ", "Adverb", "together (一 Tone 4 sandhi)", "周末大家一起去公园散步。(Zhōumò dàjiā yìqǐ qù gōngyuán sànbù.) — On weekends everyone goes walking in the park together."),
            ("一块儿", "yíkuàir", "Adverb", "together (colloquial)", "走吧，我们一块儿去食堂。(Zǒu ba, wǒmen yíkuàir qù shítáng.) — Let's go, we'll head to the cafeteria together."),
            ("声调", "shēngdiào", "Noun", "tone (phonetics)", "掌握四个声调对汉语听力很重要。(Zhǎowò sì ge shēngdiào duì hànyǔ tīnglì hěn zhòngyào.) — Mastering the four tones is essential for Chinese listening."),
            ("轻声", "qīngshēng", "Noun", "neutral tone / light tone", "汉语中很多词的第二个字念轻声。(Hànyǔ zhōng hěn duō cí de dì èr ge zì niàn qīngshēng.) — In Chinese many words' second character is read in neutral tone."),
            ("变调", "biàndiào", "Noun", "tone sandhi / tone change", "第三声连续出现时会发生变调。(Dì sān shēng liánxù chūxiàn shí huì fāshēng biàndiào.) — When third tones appear consecutively, tone sandhi occurs."),
            ("黑板", "hēibǎn", "Noun", "blackboard (Tone 1-3 pair)", "老师在黑板上写了生词。(Lǎoshī zài hēibǎn shang xiě le shēngcí.) — The teacher wrote new words on the blackboard."),
            ("平时", "píngshí", "Noun", "ordinary times (Tone 2-2 pair)", "平时多听多读普通话。(Píngshí duō tīng duō dú pǔtōnghuà.) — In ordinary times listen and read Mandarin often."),
            ("啤酒", "píjiǔ", "Noun", "beer (Tone 2-3 pair)", "来一瓶冰镇啤酒。(Lái yì píng bīngzhèn píjiǔ.) — Bring a bottle of iced beer."),
            ("服务", "fúwù", "Noun / Verb", "service (Tone 2-4 pair)", "这家店的服务态度很热情。(Zhè jiā diàn de fúwù tàidu hěn rèqíng.) — The service attitude here is very enthusiastic."),
            ("许多", "xǔduō", "Adjective", "many / plenty (Tone 3-1 pair)", "公园里有许多人在散步。(Gōngyuán lǐ yǒu xǔduō rén zài sànbù.) — There are many people walking in the park."),
            ("努力", "nǔlì", "Adjective / Verb", "hard-working / strive (Tone 3-4 pair)", "只要努力就能学好中文。(Zhǐyào nǔlì jiù néng xué hǎo zhōngwén.) — As long as you work hard you can master Chinese.")
        ]
    },
    {
        "pack_num": 35,
        "title": "Field Guide: Pinyin Typing & Syllable Mechanics",
        "candidates": [
            ("拼音输入法", "pīnyīn shūrùfǎ", "Noun Phrase", "Pinyin Input Method (IME)", "在手机上切换到拼音输入法。(Zài shǒujī shang qiēhuàn dào pīnyīn shūrùfǎ.) — Switch to the Pinyin input method on your phone."),
            ("候选词", "hòuxuǎncí", "Noun", "candidate word", "从候选词列表里挑选正确的汉字。(Cóng hòuxuǎncí lièbiǎo lǐ tiāoxuǎn zhèngquè de hànzì.) — Pick the correct Chinese character from the candidate list."),
            ("翻页", "fānyè", "Verb Phrase", "page down / next candidate page", "按加号键或者等号键翻页选字。(Àn jiāhào jiàn huòzhě děnghào jiàn fānyè xuǎnzì.) — Press plus or equals key to page through candidate characters."),
            ("标点符号", "biāodiǎn fúhào", "Noun", "punctuation marks", "中文标点符号占一个完整的汉字空格。(Zhōngwén biāodiǎn fúhào zhàn yí ge wánzhěng de hànzì kònggé.) — Chinese punctuation marks take up a full character width."),
            ("逗号", "dòuhào", "Noun", "comma (，)", "在句子短暂停顿处输入中文逗号。(Zài jùzi duǎnzàn tíngdùn chù shūrù zhōngwén dòuhào.) — Enter a Chinese comma at brief pauses in a sentence."),
            ("句号", "jùhào", "Noun", "full stop / period (。)", "每句话写完整后记得打上句号。(Měi jù huà xiě wánzhěng hòu jìde dǎ shang jùhào.) — Remember to put a period after completing each sentence."),
            ("问号", "wènhào", "Noun", "question mark (？)", "疑问句结尾要使用中文问号。(Yíwènjù jiéwěi yào shǐyòng zhōngwén wènhào.) — Use a Chinese question mark at the end of interrogative sentences."),
            ("叹号", "tànhào", "Noun", "exclamation mark (！)", "感叹情绪强烈的句子用叹号结尾。(Gǎntàn qíngxù qiángliè de jùzi yòng tànhào jiéwěi.) — Use exclamation marks at the end of strong emotive sentences."),
            ("空格键", "kònggéjiàn", "Noun", "spacebar", "按空格键直接确认第一个候选词。(Àn kònggéjiàn zhíjiē quèrèn dì yī ge hòuxuǎncí.) — Press the spacebar to confirm the first candidate word directly."),
            ("回车键", "huíchējiàn", "Noun", "enter / return key", "按回车键可以直接输出英文字母。(Àn huíchējiàn kěyǐ zhíjiē shūchū yīngwén zìmǔ.) — Press enter key to output English letters directly."),
            ("字母", "zìmǔ", "Noun", "letters / alphabet", "拼音由英文字母组成。(Pīnyīn yóu yīngwén zìmǔ zǔchéng.) — Pinyin is composed of English letters."),
            ("声母", "shēngmǔ", "Noun", "initials (consonants)", "普通话拼音一共有二十一个声母。(Pǔtōnghuà pīnyīn yígòng yǒu èrshíyī ge shēngmǔ.) — Standard Mandarin pinyin has 21 initials in total."),
            ("韵母", "yùnmǔ", "Noun", "finals (vowels)", "练习好单韵母和复韵母的发音。(Liànxí hǎo dān yùnmǔ hé fù yùnmǔ de fāyīn.) — Practice pronunciation of simple and compound finals well."),
            ("整词输入", "zhěngcí shūrù", "Noun Phrase", "whole-word typing", "采用整词输入可以大大提高打字准确率。(Cǎiyòng zhěngcí shūrù kěyǐ dàdà tígāo dǎzì zhǔnquèlǜ.) — Typing whole words greatly improves character recognition accuracy."),
            ("隔音符号", "géyīn fúhào", "Noun", "apostrophe syllable separator", "输入西安时在两个音节中间加上隔音符号。(Shūrù Xī'ān shí zài liǎng ge yīnjié zhōngjiān jiā shang géyīn fúhào.) — Add an apostrophe delimiter between syllables when typing Xi'an."),
            ("错别字", "cuòbiézì", "Noun", "typo / miswritten character", "发信息前多检查一遍避免错别字。(Fā xìnxī qián duō jiǎnchá yí biàn bìmiǎn cuòbiézì.) — Proofread before sending messages to avoid typos."),
            ("单字", "dānzì", "Noun", "single character", "初学打字不要只打单字。(Chūxué dǎzì bú yào zhǐ dǎ dānzì.) — Beginners should avoid typing single characters only."),
            ("联想词", "liánxiǎngcí", "Noun", "predictive text / associative phrase", "输入法会自动提供常用的联想词。(Shūrùfǎ huì zìdòng tígōng chángyòng de liánxiǎngcí.) — The input method automatically offers common predictive phrases."),
            ("语音输入", "yǔyīn shūrù", "Noun Phrase", "voice input / speech-to-text", "手忙的时候可以用语音输入发消息。(Shǒu máng de shíhou kěyǐ yòng yǔyīn shūrù fā xiāoxi.) — When hands are busy you can use voice input to send messages."),
            ("简拼", "jiǎnpīn", "Noun", "abbreviated pinyin initials", "输入每个字的声母简拼即可出词。(Shūrù měi ge zì de shēngmǔ jiǎnpīn jíkě chū cí.) — Typing just the initials of each word will suggest the phrase.")
        ]
    }
]

generated_packs = []
seen_new_hanzi = set()
duplicates_skipped = []

for p in candidate_packs:
    clean_words = []
    word_no = 1
    for item in p["candidates"]:
        hanzi, pinyin, pos, english, example = item
        clean_hz = hanzi.strip()
        if clean_hz in existing_hanzi:
            duplicates_skipped.append((p["pack_num"], clean_hz, "In baseline packs 1-23"))
            continue
        if clean_hz in seen_new_hanzi:
            duplicates_skipped.append((p["pack_num"], clean_hz, "Already in new packs"))
            continue
        seen_new_hanzi.add(clean_hz)
        clean_words.append({
            "No": word_no,
            "Chinese Word": clean_hz,
            "Pinyin": pinyin,
            "Part of Speech": pos,
            "English Meaning": english,
            "Example (Chinese + Pinyin)": example
        })
        word_no += 1
    
    generated_packs.append({
        "pack_num": p["pack_num"],
        "title": p["title"],
        "words": clean_words
    })

print(f"Skipped {len(duplicates_skipped)} duplicate words against baseline.")

for p in generated_packs:
    filename = f"src/lib/data/chinese/{p['pack_num']}.json"
    data = {
        "title": p["title"],
        "words": p["words"]
    }
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {filename}: {p['title']} ({len(p['words'])} words)")

print("Finished generating packs 24-35 with 0 duplicates.")
