#!/usr/bin/env python3
"""
Generate comprehensive, beautifully formatted Markdown field guides in docs/field-guides/.
"""

import os

os.makedirs('docs/field-guides', exist_ok=True)

guides = {
    "INDEX.md": """# SayMei Mandarin Field Guides: Master Index & Study Route

Curated, high-yield field guides distilled from the 15 SayMei Mandarin Beginner Field Guides & Practice Books. Each guide matches directly with an in-app SRS flashcard pack in `flash-two`.

---

## 🗺️ Field Guide Curriculum & SRS Pack Mapping

| Guide | Topic & Core Focus | Flashcard Pack |
| :--- | :--- | :--- |
| [01. Meet People & Self-Introductions](01-meet-people.md) | Introductions, names, professions, nationalities, polite deflections | **Pack 24** |
| [02. Order Food & Drinks](02-order-food-and-drinks.md) | Restaurant ordering frames, quantity measure words, ice/sugar/spice mods | **Pack 25** |
| [03. Shop for Clothes & Sizing](03-clothes-shopping.md) | Garments, sizing (S/M/L/XL), trying on, bargaining, receipts & returns | **Pack 26** |
| [04. Conversation Particles](04-conversation-particles.md) | The 5 core spoken particles (`吧`, `呢`, `吗`, `了`, `啊`) and situational nuance | **Pack 27** |
| [05. Conversation Rescue & Repair Loops](05-conversation-rescue-cards.md) | The 3-move rescue loop (Signal, Ask, Confirm), handling breakdowns gracefully | **Pack 28** |
| [06. Numbers, Prices & Practical Math](06-numbers-prices-dates-time.md) | Place-value 0 (`零`), currency (`块`/`毛`), mobile pay, dates, clock time | **Pack 29** |
| [07. Relative Time & Weekly Planning](07-relative-time-and-plans.md) | Relative days, weeks, months, years, time placement, schedule arrangements | **Pack 30** |
| [08. Mandarin at Home & Living Spaces](08-mandarin-at-home.md) | Domestic rooms, furniture, household appliances, morning/night routines | **Pack 31** |
| [09. Polite Courtesies & Reactions](09-polite-phrases-reactions.md) | Social manners, genuine vs mild apologies, spontaneous conversational reactions | **Pack 32** |
| [10. 7-Day Travel Survival Refresher](10-travel-refresher.md) | Taxi navigation, hotel check-in/out, wayfinding, high-speed rail, emergencies | **Pack 33** |
| [11. Tone Pairs Lab (16 Pitches)](11-tone-pairs-lab.md) | Master all 16 two-syllable tone combinations (1-1 through 4-4) and pitch contours | **Pack 34** |
| [12. Real-World Tone Sandhi Rules](12-tone-sandhi-rules.md) | 3rd tone sandhi, dynamic shifts for `一` (yī/yí/yì) and `不` (bù/bú), neutral tones | **Pack 34** |
| [13. Pinyin Typing & IME Mechanics](13-typing-and-spelling-guide.md) | Whole-word typing, candidate navigation, `ü` typing (`v`), apostrophe delimiters | **Pack 35** |

---

## 🎯 Recommended Study Routine
1. **Read Field Guide**: Review sentence frames, functional jobs, and cultural nuances.
2. **Review Flashcard Pack**: Practice Hanzi, Pinyin, and example sentences in `flash-two` SRS.
3. **Play Mini-Games**:
   - **Tone Pair Lab**: Train pitch combination recognition (1-1 to 4-4).
   - **Restaurant**: Practice dish and drink recognition under time pressure.
   - **Number Rush**: Train instant auditory & visual number reflex.
""",

    "01-meet-people.md": """# Field Guide 01: Meet People & Self-Introductions

*Source: SayMei Beginner Field Guide · Speaking: Starter*  
*Corresponding SRS Deck: Pack 24 (Field Guide: Self-Introductions & Social Connections)*

---

## 1. The 5-Step Introduction Loop

In natural Mandarin conversation, an introduction is a two-way collaborative exchange, not a monologue. Move through these five jobs:

```mermaid
graph LR
    A["1. Greet (你好!)"] --> B["2. Share Name (我叫...)"]
    B --> C["3. Ask Name (你叫什么名字?)"]
    C --> D["4. Return Ball (你呢?)"]
    D --> E["5. Polite Close (很高兴认识你!)"]
```

| Step | Job | Model Phrase | Pinyin | English Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **1. Greet** | Open connection | 你好！ | Nǐ hǎo! | Hello! |
| **2. Share** | Give one detail | 我叫大卫。 | Wǒ jiào Dàwèi. | My name is David. |
| **3. Ask** | Invite other person | 你叫什么名字？ | Nǐ jiào shénme míngzi? | What is your name? |
| **4. Return** | Bounce back topic | 你呢？ | Nǐ ne? | And you? |
| **5. Close** | Warm wrap-up | 很高兴认识你。 | Hěn gāoxìng rènshí nǐ. | Nice to meet you. |

---

## 2. Core Sharing Frames

### Origin & Nationality
- **Structure A (Country + 人)**: `我是 [国家] 人。` (e.g. 我是英国人。 · *Wǒ shì yīngguó rén.*)
- **Structure B (来自 + City/Place)**: `我来自 [城市]。` (e.g. 我来自伦敦。 · *Wǒ láizì Lúndūn.*)
- **Question**: `你是哪国人？` (*Nǐ shì nǎ guó rén?*) or `你是哪里人？` (*Nǐ shì nǎlǐ rén?*)

### Profession & Study
- `我是大学生，我学中文。` (*Wǒ shì dàxuéshēng, wǒ xué zhōngwén.* — I am a college student, I study Chinese.)
- `我在一家公司工作。` (*Wǒ zài yì jiā gōngsī gōngzuò.* — I work at a company.)

### Personal Life & Hobbies
- `我喜欢在家听音乐。` (*Wǒ xǐhuan zài jiā tīng yīnyuè.* — I like listening to music at home.)
- `我喜欢跑步和做饭。` (*Wǒ xǐhuan pǎobù hé zuòfàn.* — I like jogging and cooking.)

---

## 3. Polite Deflection & Topic Redirection

You are never obligated to answer personal questions (age, marital status, salary). Use these safe native responses:

- **Prefer not to say**: `这个我不太想说，不好意思。` (*Zhège wǒ bú tài xiǎng shuō, bù hǎoyìsi.* — I'd rather not say, sorry.)
- **Still deciding**: `我还在想。你呢？` (*Wǒ hái zài xiǎng. Nǐ ne?* — I'm still thinking about it. What about you?)
- **Change topic politely**: `我们聊点别的吧，今天天气真好！` (*Wǒmen liáo diǎnr bié de ba, jīntiān tiānqì zhēn hǎo!* — Let's talk about something else, the weather today is really nice!)\
""",

    "02-order-food-and-drinks.md": """# Field Guide 02: Ordering Food & Restaurant Adjustments

*Source: SayMei Beginner Field Guide · Speaking: Early Beginner*  
*Corresponding SRS Deck: Pack 25 (Field Guide: Ordering Food & Restaurant Adjustments)*

---

## 1. Two Safe Request Frames

| Frame | Style | When to Use | Example |
| :--- | :--- | :--- | :--- |
| **我要……** | Direct & common | Busy counters, street stalls, casual diners | `我要一碗牛肉面。` (Wǒ yào yì wǎn niúròu miàn.) |
| **我想要……** | Softer & polite | Sit-down restaurants, cafes, polite requests | `我想要一杯热茶。` (Wǒ xiǎng yào yì bēi rè chá.) |

> **Cultural Note**: Place `谢谢` (*xièxie*) **after** your complete request rather than translating every English "please".

---

## 2. Four Practical Quantity Measure Words

Mandarin requires the right measure word between the number and the noun:

| Measure Chunk | Pinyin | Typical Food/Drink | Example Sentence |
| :--- | :--- | :--- | :--- |
| **一杯** | yì bēi | Cup / glass (tea, coffee, beer) | `我想要一杯热茶。` (A cup of hot tea.) |
| **一碗** | yì wǎn | Bowl (noodles, rice, soup) | `请给我来一碗面。` (A bowl of noodles.) |
| **一份** | yí fèn | Portion / order (dumplings, cold dishes) | `我们要一份煎饺。` (An order of pan-fried dumplings.) |
| **一瓶** | yì píng | Bottle (water, beer, soda) | `我想要一瓶矿泉水。` (A bottle of mineral water.) |

---

## 3. High-Yield Drink & Food Adjustments

### Temperature & Ice
- **去冰** (*qù bīng*): No ice
- **少冰** (*shǎo bīng*): Less ice
- **常温** (*chángwēn*): Room temperature
- **热的** (*rè de*): Hot / served warm

### Sweetness
- **半糖** (*bàn táng*): Half sugar (50%)
- **微糖** (*wēi táng*): Slight sugar (30%)
- **无糖** (*wú táng*): Sugar free (0%)

### Spice & Ingredients
- **不要辣** (*bú yào là*): No spice at all
- **微辣** (*wēi là*): Mildly spicy
- **不加香菜** (*bù jiā xiāngcài*): No cilantro/coriander
- **免葱** (*miǎn cōng*): Omit scallions / spring onions

---

## 4. Dining Logistics & Payment
- **Dine in vs Takeout**: `在这里吃` (*zài zhèlǐ chī* — dine in) vs `外带` (*wàidài* — takeout)
- **Check / Bill**: `你好，我们要买单。` (*Nǐ hǎo, wǒmen yào mǎidān.*) or `结账` (*jiézhàng*)
- **Packing leftovers**: `麻烦帮我打包。` (*Máfan bāng wǒ dǎbāo.*)
- **Asking for napkins**: `麻烦给我们几张纸巾。` (*Máfan gěi wǒmen jǐ zhāng zhǐjīn.*)
""",

    "03-clothes-shopping.md": """# Field Guide 03: Clothes Shopping, Sizing & Garments

*Source: SayMei Beginner Field Guide · Speaking: Early Beginner*  
*Corresponding SRS Deck: Pack 26 (Field Guide: Shopping, Sizing & Garments)*

---

## 1. Core Clothing Nouns & Measure Words

In Chinese, different garments take distinct measure words:

| Item | Pinyin | Meaning | Measure Word | Example Chunk |
| :--- | :--- | :--- | :--- | :--- |
| **衣服** | yīfu | Clothes (general) | **件** (*jiàn*) | 一件衣服 (yí jiàn yīfu) |
| **衬衫** | chènshān | Shirt / blouse | **件** (*jiàn*) | 这件白衬衫 (zhè jiàn bái chènshān) |
| **外套** | wàitào | Jacket / coat | **件** (*jiàn*) | 那件蓝色外套 (nà jiàn lánsè wàitào) |
| **裤子** | kùzi | Pants / trousers | **条** (*tiáo*) | 这条黑裤子 (zhè tiáo hēi kùzi) |
| **裙子** | qúnzi | Skirt / dress | **条** (*tiáo*) | 一条裙子 (yì tiáo qúnzi) |
| **鞋** | xié | Shoes (paired) | **双** (*shuāng*) | 一双运动鞋 (yì shuāng yùndòngxié) |

---

## 2. Size Classification (S/M/L/XL)

| Size | Hanzi | Pinyin | Inquiries |
| :--- | :--- | :--- | :--- |
| Small (S) | **小号** | xiǎohào | `有小号的吗？` (Do you have small?) |
| Medium (M) | **中号** | zhōnghào | `我觉得中号最合身。` (I think medium fits best.) |
| Large (L) | **大号** | dàhào | `这件衣服有大号吗？` (Is there a large?) |
| Extra Large (XL) | **特大号** | tèdàhào | `有特大号的外套吗？` (Do you have XL?) |

---

## 3. The Fitting & In-Store Dialogue

1. **Asking to try on**:
   - `我可以试穿一下吗？` (*Wǒ kěyǐ shìchuān yíxià ma?* — May I try this on?)
2. **Finding the fitting room**:
   - `请问试衣间在哪里？` (*Qǐngwèn shìyījiān zài nǎlǐ?* — Where is the fitting room?)
3. **Evaluating fit**:
   - **合身** (*héshēn*): Fits well (`非常合身`)
   - **宽松** (*kuānsōng*): Loose / roomy (`喜欢宽松一点的`)
   - **紧** (*jǐn*): Tight (`腰部有点紧`)
4. **Requesting a fresh item**:
   - `这件有点脏，能换一件吗？` (*Zhè jiàn yǒudiǎnr zāng, néng huàn yí jiàn ma?* — This has a mark, could I swap for a clean one?)
5. **Inquiring on discounts & price**:
   - `请问今天打折吗？` (*Qǐngwèn jīntiān dǎzhé ma?* — Is this discounted today?)
   - `老板，能不能便宜一点？` (*Lǎobǎn, néng bu néng piányi yìdiǎnr?* — Can you make it a bit cheaper?)
""",

    "04-conversation-particles.md": """# Field Guide 04: Spoken Particles & Conversational Nuance

*Source: SayMei Beginner Field Guide · Speaking: Confident Beginner*  
*Corresponding SRS Deck: Pack 27 (Field Guide: Conversational Particles & Nuance)*

Particles don't translate into single English words; they perform **communicative jobs** at the end of clauses.

---

## The 5 Essential Spoken Particles

```mermaid
graph TD
    A["Particle Tools"] --> B["吗 (ma): Neutral Yes/No Question"]
    A --> C["吧 (ba): Soft Proposal or Confirmation"]
    A --> D["呢 (ne): Topic Continuation & Bounce-Back"]
    A --> E["了 (le): Change of State / Completed Action"]
    A --> F["啊 (a): Warmth, Enthusiasm, Vividness"]
```

### 1. 吗 (*ma*) — Neutral Inquiry
- **Job**: Transforms a declarative statement into a yes/no question without rearranging word order.
- **Example**: `你喜欢咖啡吗？` (*Nǐ xǐhuan kāfēi ma?* — Do you like coffee?)

### 2. 吧 (*ba*) — Proposal & Soft Direction
- **Job 1 (Proposal)**: `我们先吃饭吧。` (*Wǒmen xiān chīfàn ba.* — Let's eat first.)
- **Job 2 (Soft direction)**: `请进，你先坐吧。` (*Qǐng jìn, nǐ xiān zuò ba.* — Please come in, have a seat first.)
- **Job 3 (Confirmation tag)**: `你是明天下午到，对吧？` (*Nǐ shì míngtiān xiàwǔ dào, duì ba?* — You arrive tomorrow afternoon, right?)

### 3. 呢 (*ne*) — Returning Topics & Elliptical Questions
- **Job 1 (Bounce-back)**: `我很好，你呢？` (*Wǒ hěn hǎo, nǐ ne?* — I'm good, and you?)
- **Job 2 (Missing item inquiry)**: `我的手机呢？` (*Wǒ de shǒujī ne?* — Where's my phone?)
- **Job 3 (Ongoing action)**: `想什么呢？` (*Xiǎng shénme ne?* — What are you thinking about?)

### 4. 了 (*le*) — Change of State
- **Job**: Signals a new situation or threshold reached.
- **Example 1**: `时间到了，我们走吧。` (*Shíjiān dào le, wǒmen zǒu ba.* — Time's up, let's head out.)
- **Example 2**: `太好了！` (*Tài hǎo le!* — Fantastic! / That's great!)

### 5. 啊 (*a*) — Warmth & Confirmation
- **Job**: Softens tone, adds friendliness or expressive emphasis.
- **Example 1**: `好啊，我们一起去！` (*Hǎo a, wǒmen yìqǐ qù!* — Great, let's go together!)
- **Example 2**: `这样啊，我明白了。` (*Zhèyàng a, wǒ míngbai le.* — Oh I see, I understand now.)
""",

    "05-conversation-rescue-cards.md": """# Field Guide 05: Conversation Rescue & Repair Loops

*Source: SayMei Beginner Field Guide · Speaking: Confident Beginner*  
*Corresponding SRS Deck: Pack 28 (Field Guide: Conversation Rescue & Repair Loops)*

When native speech is too fast, unfamiliar, or noisy, conversations easily break down. Do not freeze or say nothing. Execute the **3-Move Rescue Loop**.

---

## The 3-Move Rescue Loop

```mermaid
sequenceDiagram
    participant Speaker as Native Speaker
    participant Learner as You (Learner)
    Speaker->>Learner: [Speaks fast / unfamiliar words]
    Note over Learner: Move 1: Signal the break
    Learner->>Speaker: 不好意思，我没听懂。(Signal)
    Note over Learner: Move 2: Ask for specific help
    Learner->>Speaker: 请说慢一点 / 可以打字给我看吗？ (Ask)
    Speaker->>Learner: [Speaks slowly or types]
    Note over Learner: Move 3: Confirm understanding
    Learner->>Speaker: 你是说九点半在大门见，对吗？ (Confirm)
    Speaker->>Learner: 对，没问题！
```

---

## Move Toolkit

### Move 1: Signal the Problem
- `不好意思，我没听懂。` (*Bù hǎoyìsi, wǒ méi tīngdǒng.* — Excuse me, I didn't understand.)
- `我没听清楚。` (*Wǒ méi tīng qīngchu.* — I didn't hear clearly.)

### Move 2: Ask for Specific Help
- **Speed**: `请说慢一点。` (*Qǐng shuō màn yìdiǎnr.* — Please speak a bit slower.)
- **Repetition**: `请再说一遍。` (*Qǐng zài shuō yí biàn.* — Please say that once more.)
- **Visual backup**: `可以帮我写下来吗？` (*Kěyǐ bāng wǒ xiě xiàlái ma?* — Could you write it down?)
- **Phone typing**: `可以打字给我看一下吗？` (*Kěyǐ dǎzì gěi wǒ kàn yíxià ma?* — Could you type it on your phone?)
- **Pacing**: `可以一句一句地说吗？` (*Kěyǐ yí jù yí jù de shuō ma?* — Can you speak sentence by sentence?)
- **Vocabulary inquiry**: `这个用中文怎么说？` (*Zhège yòng zhōngwén zěnme shuō?* — How do you say this in Chinese?)

### Move 3: Confirm What You Understood
- `你的意思是……对吗？` (*Nǐ de yìsi shì... duì ma?* — Do you mean..., right?)
- `懂了，谢谢你的耐心！` (*Dǒng le, xièxie nǐ de nàixīn!* — Understood, thanks for your patience!)
""",

    "06-numbers-prices-dates-time.md": """# Field Guide 06: Numbers, Prices & Practical Math

*Source: SayMei Beginner Field Guide · Vocabulary: Starter*  
*Corresponding SRS Deck: Pack 29 (Field Guide: Numbers, Prices & Practical Math)*

---

## 1. Place-Value Zero Rule (零 · líng)

In spoken Chinese, **零** is spoken **only once** for consecutive missing places inside a number:

| Number | Reading | Reason |
| :--- | :--- | :--- |
| **105** | 一百**零**五 (*yì bǎi líng wǔ*) | Missing tens place requires 零 |
| **1005** | 一千**零**五 (*yì qiān líng wǔ*) | Even with 2 zeroes, say 零 only once |
| **150** | 一百五(十) (*yì bǎi wǔ*) | Trailing zeroes are omitted or read as 十 |

---

## 2. Chinese Currency Units: Spoken vs Written

| Value | Written / Formal | Spoken / Colloquial | Example |
| :--- | :--- | :--- | :--- |
| 1.00 Yuan | **元** (*yuán*) | **块** (*kuài*) | 五块钱 (5 kuai) |
| 0.10 Yuan | **角** (*jiǎo*) | **毛** (*máo*) | 五毛钱 (50 cents) |
| 0.01 Yuan | **分** (*fēn*) | **分** (*fēn*) | 两块零五分 (2.05 yuan) |

---

## 3. Mobile Payments & Shopping Phrases

China is largely cashless; you will use QR codes for transit, dining, and shops:

- `请扫码付款。` (*Qǐng sǎomǎ fùkuǎn.* — Please scan the QR code to pay.)
- `微信支付` (*wēixìn zhīfù* — WeChat Pay) / `支付宝` (*zhīfùbǎo* — Alipay)
- `一共多少钱？` (*Yígòng duōshao qián?* — How much in total?)
- `找钱` (*zhǎoqián* — give change) / `零钱` (*língqián* — small change)
- `小票` (*xiǎopiào* — receipt)

### Discount Math: "打折"
Chinese discounts indicate the percentage you **pay**, not what is taken off:
- **打八折** (*dǎ bā zhé*): Pay 80% = **20% off**
- **打五折 / 半价** (*bànjià*): Pay 50% = **Half price**
- **买一送一** (*mǎi yī sòng yī*): Buy one get one free
""",

    "07-relative-time-and-plans.md": """# Field Guide 07: Relative Time & Weekly Planning

*Source: SayMei Beginner Field Guide · Speaking: Starter*  
*Corresponding SRS Deck: Pack 30 (Field Guide: Relative Time & Weekly Planning)*

---

## 1. The 5-Day & 3-Week Relative Grid

```
  [前天]  <---  [昨天]  <---  [今天]  --->  [明天]  --->  [后天]
qiántiān      zuótiān       jīntiān       míngtiān      hòutiān
(2 days ago)  (yesterday)    (today)      (tomorrow)  (in 2 days)
```

| Time Scope | Past ("Up / Before") | Present ("This") | Future ("Down / Next") |
| :--- | :--- | :--- | :--- |
| **Day** | 昨天 (*yesterday*) | 今天 (*today*) | 明天 (*tomorrow*) |
| **Week** | 上个星期 (*last week*) | 这个星期 (*this week*) | 下个星期 (*next week*) |
| **Month** | 上个月 (*last month*) | 这个月 (*this month*) | 下个月 (*next month*) |
| **Year** | 去年 (*last year*) | 今年 (*this year*) | 明年 (*next year*) |

---

## 2. Sentence Architecture: Where Does Time Go?

In Mandarin, time words **NEVER** go at the end of a sentence. They occur before the verb, either before or after the subject:

$$\\text{Subject} + \\mathbf{\\text{Time}} + \\text{Verb} + \\text{Object}$$
$$\\text{or } \\mathbf{\\text{Time}} + \\text{Subject} + \\text{Verb} + \\text{Object}$$

- **Correct**: `我明天下午去图书馆。` (*Wǒ míngtiān xiàwǔ qù túshūguǎn.*)
- **Correct**: `明天下午我去图书馆。` (*Míngtiān xiàwǔ wǒ qù túshūguǎn.*)
- **WRONG**: <s>我去图书馆明天下午。</s>

---

## 3. Planning & Scheduling Phrases
- `你有空吗？` (*Nǐ yǒu kòng ma?* — Are you free / available?)
- `真不巧，我没空。` (*Zhēn bù qiǎo, wǒ méi kòng.* — Unfortunately, I'm not free.)
- `改天再聚吧！` (*Gǎitiān zài jù ba!* — Let's meet up another day!)
- `提前半小时到达` (*tíqián bàn xiǎoshí dàodá* — arrive half an hour early)
- `推迟到下周` (*tuīchí dào xià zhōu* — postponed until next week)
""",

    "08-mandarin-at-home.md": """# Field Guide 08: Everyday Home & Living Spaces

*Source: SayMei Beginner Field Guide · Family: Early Beginner*  
*Corresponding SRS Deck: Pack 31 (Field Guide: Everyday Home & Living Spaces)*

---

## 1. The Home Floor Plan

| Room | Hanzi | Pinyin | Common Item Inside |
| :--- | :--- | :--- | :--- |
| Living Room | **客厅** | kètīng | 沙发 (*couch*), 电视 (*TV*) |
| Bedroom | **卧室** | wòshì | 床 (*bed*), 衣柜 (*wardrobe*), 枕头 (*pillow*) |
| Kitchen | **厨房** | chúfáng | 冰箱 (*fridge*), 微波炉 (*microwave*), 开水壶 (*kettle*) |
| Bathroom | **卫生间** | wèishēngjiān | 毛巾 (*towel*), 镜子 (*mirror*), 拖鞋 (*slippers*) |
| Balcony | **阳台** | yángtái | 洗衣机 (*washer*), 晾衣服 (*drying rack*) |

---

## 2. Daily Sequence Verbs
- **起床** (*qǐchuáng*): Get out of bed
- **洗手 / 洗澡** (*xǐ shǒu / xǐzǎo*): Wash hands / take a bath or shower
- **做饭 / 吃饱了** (*zuòfàn / chī bǎo le*): Cook / full from eating
- **出门** (*chūmén*): Leave the house (remember: keys & phone!)
- **关灯 / 睡觉** (*guān dēng / shuìjiào*): Turn off lights / go to sleep

## 3. Household Chores
- `扫地` (*sǎo dì* — sweep the floor)
- `拖地` (*tuō dì* — mop the floor)
- `倒垃圾` (*dào lājī* — take out the trash)
- `晾衣服` (*liàng yīfu* — hang clothes to dry)
""",

    "09-polite-phrases-reactions.md": """# Field Guide 09: Polite Courtesies & Natural Reactions

*Source: SayMei Beginner Field Guide · Speaking: Starter*  
*Corresponding SRS Deck: Pack 32 (Field Guide: Polite Reactions & Social Courtesies)*

---

## 1. Apologies: 对不起 vs 不好意思

| Phrase | Pinyin | Severity | When to Use |
| :--- | :--- | :--- | :--- |
| **对不起** | duìbuqǐ | Serious / High | Deep personal fault, serious mistakes, causing damage |
| **不好意思** | bù hǎoyìsi | Mild / Conversational | Squeezing past in a crowd, minor delay, mild inconvenience |

- **Responses to apology**: `没关系` (*méi guānxi* — it's alright) or `没事` (*méishì* — no problem at all).

---

## 2. Gratitude & Modesty
- **Thank you**: `谢谢` (*xièxie*) $\\rightarrow$ Response: `不客气` (*bú kèqi* — you're welcome).
- **Humble deflection**: When complimented on your Chinese:
  - `哪里哪里，还在学呢。` (*Nǎlǐ nǎlǐ, hái zài xué ne.* — Not at all, still learning.)
- **After hard work**: `辛苦了！` (*Xīnkǔ le!* — Thanks for your hard work!)

---

## 3. Conversational Reactions
- `真的吗？` (*Zhēn de ma?* — Really? Are you serious?)
- `太好了！` (*Tài hǎo le!* — That's wonderful!)
- `是吗？这样啊。` (*Shì ma? Zhèyàng a.* — Is that so? I see.)
- `慢慢来，不用着急。` (*Mànmàn lái, bú yòng zháojí.* — Take your time, no rush.)
""",

    "10-travel-refresher.md": """# Field Guide 10: 7-Day Travel Survival & Wayfinding

*Source: SayMei Beginner Field Guide · Travel: Confident Beginner*  
*Corresponding SRS Deck: Pack 33 (Field Guide: 7-Day Travel Survival & Wayfinding)*

---

## 1. In a Taxi (出租车)
- **Addressing the driver**: `师傅，您好！` (*Shīfu, nín hǎo!*)
- **Showing address**: `请带我去这个地址。` (*Qǐng dài wǒ qù zhège dìzhǐ.*)
- **Confirming duration**: `大概要多长时间？` (*Dàgài yào duō cháng shíjiān?*)
- **Arriving**: `师傅，就在前面路口停，到了。` (*Shīfu, jiù zài qiánmian lùkǒu tíng, dào le.*)

---

## 2. At the Hotel (酒店)
- **Check-in**: `你好，我预订了一个房间，办理入住。` (*Bànlǐ rùzhù.*)
- **Deposit & Keycard**: `押金两百块` (*deposit 200 yuan*) / `房卡` (*room card*)
- **Breakfast hours**: `明天的早餐几点开始？` (*Zǎocān jǐ diǎn kāishǐ?*)
- **Checkout**: `退房` (*tuìfáng* — checkout)

---

## 3. Wayfinding & Navigation (问路)
- **Go straight**: `一直往直走。` (*Yìzhí wǎng zhí zǒu.*)
- **Turn left**: `走到路口往左拐。` (*Wǎng zuǒ guǎi.*)
- **Turn right**: `过马路然后往右拐。` (*Wǎng yòu guǎi.*)
- **Transit transfers**: `换乘地铁二号线。` (*Huànchéng dìtiě èr hào xiàn.*)
- **Gates**: `登机口` (*boarding gate*), `检票口` (*ticket barrier*), `出站口` (*station exit*)
""",

    "11-tone-pairs-lab.md": """# Field Guide 11: Mandarin Tone Pairs Lab (All 16 Combinations)

*Source: SayMei Beginner Field Guide · Pronunciation: Developing Beginner*  
*Corresponding SRS Deck: Pack 34 (Field Guide: Tone Pairs Lab)*  
*In-App Mini Game: Tone Pair Lab (`/games/tone-pairs`)*

Two-syllable combinations determine whether your spoken Mandarin sounds robotic or rhythmically natural. Master the 16 combinations below.

---

## The 16 Tone Combinations Matrix

| 1st Syllable \\ 2nd | Tone 1 (High Level) | Tone 2 (Rising) | Tone 3 (Low Dip) | Tone 4 (Sharp Fall) |
| :---: | :---: | :---: | :---: | :---: |
| **Tone 1 (5-5)** | **1-1: 今天** (jīntiān) | **1-2: 欢迎** (huānyíng) | **1-3: 开始** (kāishǐ) | **1-4: 面包** (miànbāo) |
| **Tone 2 (3-5)** | **2-1: 银行** (yínháng) | **2-2: 学习** (xuéxí) | **2-3: 苹果** (píngguǒ) | **2-4: 时间** (shíjiān) |
| **Tone 3 (2-1)** | **3-1: 首都** (shǒudū) | **3-2: 简单** (jiǎndān) | **3-3: 你好** (nǐ hǎo $\\to$ 2-3) | **3-4: 语法** (yǔfǎ) |
| **Tone 4 (5-1)** | **4-1: 问题** (wèntí) | **4-2: 跑步** (pǎobù) | **4-3: 汉字** (hànzì) | **4-4: 再见** (zàijiàn) |

---

## 🎯 Production Secrets
1. **The Half-Third Rule (3-1, 3-2, 3-4)**:
   - When Tone 3 precedes Tone 1, 2, or 4, **do not rise at the end**. Simply hit the low pitch (2-1) and jump immediately to the next syllable!
2. **Tone 1-4 Contrast**:
   - In 1-4 (e.g. *miànbāo*), keep Tone 1 high and level, then let Tone 4 fall sharply from the exact same ceiling.
""",

    "12-tone-sandhi-rules.md": """# Field Guide 12: Real-World Tone Sandhi Rules

*Source: SayMei Beginner Field Guide · Pronunciation: Developing Beginner*  
*Corresponding SRS Deck: Pack 34 (Field Guide: Tone Pairs Lab & Sandhi)*

Dictionary pinyin lists words in isolation, but connected speech automatically shifts tones according to three fixed phonological rules.

---

## Rule 1: Third-Tone Sandhi (3 + 3 $\\rightarrow$ 2 + 3)

When two 3rd tones occur back-to-back, the **first syllable rises to a 2nd tone**:

$$\\text{Tone 3} + \\text{Tone 3} \\longrightarrow \\mathbf{\\text{Tone 2}} + \\text{Tone 3}$$

- **你好**: `nǐ + hǎo` $\\longrightarrow$ Spoken as `ní hǎo`
- **可以**: `kě + yǐ` $\\longrightarrow$ Spoken as `ké yǐ`
- **水果**: `shuǐ + guǒ` $\\longrightarrow$ Spoken as `shuí guǒ`

---

## Rule 2: Tone Sandhi for "不" (bù)

Dictionary tone is 4th tone (**bù**).
- **Before Tone 1, 2, 3**: Stays **bù** (`不吃` bù chī, `不来` bù lái, `不好` bù hǎo)
- **Before another Tone 4**: Shifts to **bú** (2nd tone):
  - `不是`: `bù + shì` $\\longrightarrow$ **bú shì**
  - `不要`: `bù + yào` $\\longrightarrow$ **bú yào**
  - `不去`: `bù + qù` $\\longrightarrow$ **bú qù**

---

## Rule 3: Tone Sandhi for "一" (yī)

Dictionary tone is 1st tone (**yī**), heard in counting (一, 二, 三) and ordinal numbers.
- **Before Tone 4**: Shifts to **yí** (2nd tone):
  - `一样`: `yī + yàng` $\\longrightarrow$ **yí yàng**
  - `一定`: `yī + dìng` $\\longrightarrow$ **yí dìng**
  - `一块`: `yī + kuài` $\\longrightarrow$ **yí kuài**
- **Before Tone 1, 2, 3**: Shifts to **yì** (4th tone):
  - `一起`: `yī + qǐ` $\\longrightarrow$ **yìqǐ**
  - `一杯`: `yī + bēi` $\\longrightarrow$ **yì bēi**
  - `一碗`: `yī + wǎn` $\\longrightarrow$ **yì wǎn**
  - `一瓶`: `yī + píng` $\\longrightarrow$ **yì píng**
""",

    "13-typing-and-spelling-guide.md": """# Field Guide 13: Pinyin Typing & IME Mechanics

*Source: SayMei Beginner Field Guide · Writing: Starter*  
*Corresponding SRS Deck: Pack 35 (Field Guide: Pinyin Typing & Syllable Mechanics)*

---

## 1. How a Pinyin IME Operates
A Chinese Input Method Editor (IME) converts Latin letters into Hanzi candidate lists:
1. **Type sound code without tone marks**: Type `nihao` instead of `nǐ hǎo`.
2. **Whole-Word Typing**: Typing entire phrases (`women`, `zhongguo`, `gongsi`) yields the correct candidates at the top, avoiding homophone confusion.
3. **Selection**: Press `Spacebar` for candidate 1, number keys for other candidates, or `+` / `-` to page down.

---

## 2. Key Input Conventions

| Challenge | Solution | Example |
| :--- | :--- | :--- |
| **Umlaut `ü` (lü, nü)** | Use **v** on standard QWERTY | Type `lv` for **绿** (*lǜ*), `nv` for **女** (*nǚ*) |
| **Syllable Boundaries** | Use apostrophe **'** delimiter | `xian` $\\to$ 先 (*xiān*) vs `xi'an` $\\to$ **西安** (*Xī'ān*) |
| **Punctuation** | Full-width Chinese punctuation | `，` (comma), `。` (period), `？` (question), `！` (exclamation) |
| **Direct English output** | Press **Enter** key directly | Outputs typed Latin letters without converting to Hanzi |
"""
}

for filename, content in guides.items():
    filepath = os.path.join('docs/field-guides', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Generated {filepath}")

print("Successfully generated all markdown field guides.")
