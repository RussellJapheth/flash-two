import type { TextbookPartMeta, TextbookUnitData } from './types';
import { PART_1_UNITS } from './part1';
import { PART_2_UNITS } from './part2';
import { PART_3_UNITS } from './part3';
import { PART_4_UNITS } from './part4';
import { PART_5_UNITS } from './part5';
import { PART_6_UNITS } from './part6';

export * from './types';
export * from './grammarHub';
export * from './pronunciationHub';
export * from './pragmaticsHub';

export const TEXTBOOK_PARTS: TextbookPartMeta[] = [
	{
		partNumber: 1,
		title: 'Part I: Foundations',
		chineseTitle: '语音与基础',
		unitsRange: 'Units 1–4',
		stage: 'Absolute Beginner',
		goal: 'Master Pinyin, 4 tones + neutral tone, tone sandhi, and hold first greetings & introductions without scripts.',
		color: 'from-blue-600 to-indigo-600',
		illustrationUrl: '/images/textbook/part1-foundations.jpg'
	},
	{
		partNumber: 2,
		title: 'Part II: Survival Mandarin',
		chineseTitle: '生存汉语',
		unitsRange: 'Units 5–10',
		stage: 'Beginner',
		goal: 'Handle numbers, schedules, family, ordering food, market shopping, directions, and invitations.',
		color: 'from-indigo-600 to-violet-600',
		illustrationUrl: '/images/textbook/part2-market.jpg'
	},
	{
		partNumber: 3,
		title: 'Part III: Everyday Independence',
		chineseTitle: '日常独立',
		unitsRange: 'Units 11–16',
		stage: 'Elementary',
		goal: 'Routines with 正在, work/study, hobbies, health/pharmacies, travel with 过, and solving unexpected hitches.',
		color: 'from-emerald-600 to-teal-600',
		illustrationUrl: '/images/textbook/part3-daily.jpg'
	},
	{
		partNumber: 4,
		title: 'Part IV: Conversational Fluency',
		chineseTitle: '会话流利',
		unitsRange: 'Units 17–22',
		stage: 'Lower Intermediate',
		goal: 'Narrate anecdotes, explain motivations with 为了, compare with 比/没有, manage feelings, and steer discussions.',
		color: 'from-amber-600 to-orange-600',
		illustrationUrl: '/images/textbook/part4-teahouse.jpg'
	},
	{
		partNumber: 5,
		title: 'Part V: Natural Mandarin',
		chineseTitle: '地道汉语',
		unitsRange: 'Units 23–28',
		stage: 'Intermediate',
		goal: 'Native colloquial contractions (啥/咋), modal particles (嘛/呗), collocations, face/hospitality, and problem resolution.',
		color: 'from-rose-600 to-pink-600',
		illustrationUrl: '/images/textbook/part5-park.jpg'
	},
	{
		partNumber: 6,
		title: 'Part VI: Independent Conversation',
		chineseTitle: '独立表达',
		unitsRange: 'Units 29–36',
		stage: 'Upper Intermediate',
		goal: 'News analysis, AI/technology ethics, cultural depth, workplace strategy, formal debates, keynotes, and lifelong fluency.',
		color: 'from-purple-600 to-indigo-700',
		illustrationUrl: '/images/textbook/part6-library.jpg'
	}
];

export const ALL_TEXTBOOK_UNITS: TextbookUnitData[] = [
	...PART_1_UNITS,
	...PART_2_UNITS,
	...PART_3_UNITS,
	...PART_4_UNITS,
	...PART_5_UNITS,
	...PART_6_UNITS
];

export function getAllTextbookCourseUnits(): TextbookUnitData[] {
	return ALL_TEXTBOOK_UNITS;
}

export function getTextbookUnitById(id: string): TextbookUnitData | undefined {
	const normalized = id.toLowerCase().trim();
	return ALL_TEXTBOOK_UNITS.find(
		(u) =>
			u.id.toLowerCase() === normalized ||
			`unit-${String(u.unitNumber).padStart(2, '0')}` === normalized ||
			String(u.unitNumber) === normalized
	);
}

export function getTextbookUnitsByPart(part: 1 | 2 | 3 | 4 | 5 | 6): TextbookUnitData[] {
	return ALL_TEXTBOOK_UNITS.filter((u) => u.partNumber === part);
}

export function getAdjacentTextbookUnits(id: string): {
	prev?: TextbookUnitData;
	next?: TextbookUnitData;
} {
	const current = getTextbookUnitById(id);
	if (!current) return {};
	const currentIndex = ALL_TEXTBOOK_UNITS.findIndex((u) => u.id === current.id);
	return {
		prev: currentIndex > 0 ? ALL_TEXTBOOK_UNITS[currentIndex - 1] : undefined,
		next:
			currentIndex < ALL_TEXTBOOK_UNITS.length - 1
				? ALL_TEXTBOOK_UNITS[currentIndex + 1]
				: undefined
	};
}

export function searchAllTextbookUnits(query: string): TextbookUnitData[] {
	const clean = query.trim().toLowerCase();
	if (!clean) return ALL_TEXTBOOK_UNITS;

	return ALL_TEXTBOOK_UNITS.filter((u) => {
		return (
			u.title.toLowerCase().includes(clean) ||
			u.chineseTitle.includes(clean) ||
			u.subtitle.toLowerCase().includes(clean) ||
			u.milestoneGoal.toLowerCase().includes(clean) ||
			u.patternBox.formula.toLowerCase().includes(clean) ||
			u.spotlightWords.some(
				(w) =>
					w.hanzi.includes(clean) ||
					w.pinyin.toLowerCase().includes(clean) ||
					w.english.toLowerCase().includes(clean)
			)
		);
	});
}

export function getUnitSceneIllustration(unit: TextbookUnitData): {
	imageUrl: string;
	alt: string;
	caption?: string;
} {
	if (unit.sceneIllustration) return unit.sceneIllustration;
	const part = TEXTBOOK_PARTS.find((p) => p.partNumber === unit.partNumber);
	const imageUrl = part?.illustrationUrl || '/images/textbook/part1-foundations.jpg';
	return {
		imageUrl,
		alt: `${unit.partTitle} Scene - ${unit.chineseTitle} (${unit.title})`,
		caption: `${unit.partTitle} · ${unit.stage}`
	};
}
