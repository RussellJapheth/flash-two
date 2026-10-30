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
        "titlePinyin": "Zǎochén de Kāfēidiàn",
        "description": "敏敏在街角咖啡店点一杯热咖啡，与热情的咖啡师练习日常点单和移动支付。",
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
            {"word": "支付", "pinyin": "zhīfù", "meaning": "to pay"},
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
                "text": "我用微信支付可以吗？",
                "pinyin": "Wǒ yòng Wēixìn zhīfù kěyǐ ma?",
                "en": "Can I pay using WeChat?",
                "words": [
                    {"word": "我用", "pinyin": "wǒ yòng", "en": "I use"},
                    {"word": "微信", "pinyin": "wēixìn", "en": "WeChat"},
                    {"word": "支付", "pinyin": "zhīfù", "en": "pay"},
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
        "titlePinyin": "Shànghǎi Dìtiě Qíyù",
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
                "text": "太好了，站台上的换乘指示牌非常清晰明了。",
                "pinyin": "Tài hǎo le, zhàntái shang de huànchéng zhǐshìpái fēicháng qīngxī míngliǎo.",
                "en": "That's wonderful, the transfer directional signs on the platform are very clear.",
                "words": [
                    {"word": "站台", "pinyin": "zhàntái", "en": "platform"},
                    {"word": "指示牌", "pinyin": "zhǐshìpái", "en": "signboard / signs"},
                    {"word": "清晰明了", "pinyin": "qīngxī míngliǎo", "en": "clear and easy to understand"}
                ]
            },
            {
                "speakerId": "wangayi",
                "text": "对呀！上海地铁四通八达。要是遇到问题，随时问身穿红色马甲的志愿者。",
                "pinyin": "Duì ya! Shànghǎi dìtiě sì tōng bā dá. Yàoshi yù dào wèntí, suíshí wèn shēn chuān hóngsè mǎjiǎ de zhìyuànzhě.",
                "en": "That's right! The Shanghai metro connects in every direction. If you hit any issue, ask the volunteers in red vests anytime.",
                "words": [
                    {"word": "四通八达", "pinyin": "sì tōng bā dá", "en": "connected everywhere"},
                    {"word": "要是", "pinyin": "yàoshi", "en": "if"},
                    {"word": "志愿者", "pinyin": "zhìyuànzhě", "en": "volunteer"}
                ]
            },
            {
                "speakerId": "dawei",
                "text": "非常感谢您的热情指引，祝您生活愉快！",
                "pinyin": "Fēicháng gǎnxiè nín de rèqíng zhǐyǐn, zhù nín shēnghuó yúkuài!",
                "en": "Thank you so much for your warm guidance, wish you a lovely day!",
                "words": [
                    {"word": "非常感谢", "pinyin": "fēicháng gǎnxiè", "en": "thank you very much"},
                    {"word": "热情", "pinyin": "rèqíng", "en": "warm / enthusiastic"},
                    {"word": "指引", "pinyin": "zhǐyǐn", "en": "guidance / direction"}
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
        "titlePinyin": ep_data.get("titlePinyin", ""),
        "description": ep_data["description"],
        "level": ep_data["level"],
        "hskLevel": ep_data.get("hskLevel", 1),
        "duration": current_time,
        "audioUrl": f"/audio/podcasts/{ep_id}.mp3",
        "audioFormat": "mp3",
        "fileSizeBytes": file_size,
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

async def main_async():
    all_episodes = []
    for ep in EPISODES:
        print(f"Generating neural episode {ep['id']} with edge-tts...")
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
