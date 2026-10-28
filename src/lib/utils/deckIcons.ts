/**
 * Deck icon resolution: maps a deck id/language to its image and accent tokens.
 */
export interface DeckIconInfo {
	imageSrc: string;
	alt: string;
	accentColor: string;
	bgColor: string;
}

const DECK_ICONS_MAP: Record<string, DeckIconInfo> = {
	'chinese-1': {
		imageSrc: '/images/decks/chinese-1.svg',
		alt: 'Essentials & Greetings Icon',
		accentColor: '#4F46E5',
		bgColor: '#EEF2FF'
	},
	'chinese-2': {
		imageSrc: '/images/decks/chinese-2.svg',
		alt: 'Numbers, Dates & Time Icon',
		accentColor: '#0284C7',
		bgColor: '#E0F2FE'
	},
	'chinese-3': {
		imageSrc: '/images/decks/chinese-3.svg',
		alt: 'Family, People & Jobs Icon',
		accentColor: '#9333EA',
		bgColor: '#F3E8FF'
	},
	'chinese-4': {
		imageSrc: '/images/decks/chinese-4.svg',
		alt: 'Food, Drink & Dining Icon',
		accentColor: '#EA580C',
		bgColor: '#FFEDD5'
	},
	'chinese-5': {
		imageSrc: '/images/decks/chinese-5.svg',
		alt: 'Daily Life & Home Icon',
		accentColor: '#059669',
		bgColor: '#D1FAE5'
	},
	'chinese-6': {
		imageSrc: '/images/decks/chinese-6.svg',
		alt: 'Shopping, Colors & Money Icon',
		accentColor: '#DB2777',
		bgColor: '#FCE7F3'
	},
	'chinese-7': {
		imageSrc: '/images/decks/chinese-7.svg',
		alt: 'Places & Transportation Icon',
		accentColor: '#2563EB',
		bgColor: '#DBEAFE'
	},
	'chinese-8': {
		imageSrc: '/images/decks/chinese-8.svg',
		alt: 'Weather & Nature Icon',
		accentColor: '#16A34A',
		bgColor: '#DCFCE7'
	},
	'chinese-9': {
		imageSrc: '/images/decks/chinese-9.svg',
		alt: 'Feelings, Health & Modals Icon',
		accentColor: '#E11D48',
		bgColor: '#FFE4E6'
	},
	'chinese-10': {
		imageSrc: '/images/decks/chinese-10.svg',
		alt: 'Books of the Bible Icon',
		accentColor: '#D97706',
		bgColor: '#FEF3C7'
	},
	'chinese-11': {
		imageSrc: '/images/decks/chinese-11.svg',
		alt: 'Daily Routines & Leisure Activities Icon',
		accentColor: '#7C3AED',
		bgColor: '#EDE9FE'
	},
	'chinese-12': {
		imageSrc: '/images/decks/chinese-12.svg',
		alt: 'House, Apartment & Living Essentials Icon',
		accentColor: '#0D9488',
		bgColor: '#CCFBF1'
	},
	'chinese-13': {
		imageSrc: '/images/decks/chinese-13.svg',
		alt: 'Workplace & Office Communication Icon',
		accentColor: '#475569',
		bgColor: '#F1F5F9'
	},
	'chinese-14': {
		imageSrc: '/images/decks/chinese-14.svg',
		alt: 'Dining Out, Flavors & Cooking Icon',
		accentColor: '#DC2626',
		bgColor: '#FEE2E2'
	},
	'chinese-15': {
		imageSrc: '/images/decks/chinese-15.svg',
		alt: 'City Navigation & Landmarks Icon',
		accentColor: '#0891B2',
		bgColor: '#CFFAFE'
	},
	'chinese-16': {
		imageSrc: '/images/decks/chinese-16.svg',
		alt: 'Modern Digital Life & Mobile Pay Icon',
		accentColor: '#6366F1',
		bgColor: '#EEF2FF'
	},
	'chinese-17': {
		imageSrc: '/images/decks/chinese-17.svg',
		alt: 'Spoken Phrases & Conversational Fillers Icon',
		accentColor: '#F59E0B',
		bgColor: '#FEF3C7'
	},
	'chinese-18': {
		imageSrc: '/images/decks/chinese-18.svg',
		alt: 'Travel, Hotels & Sightseeing Icon',
		accentColor: '#0284C7',
		bgColor: '#E0F2FE'
	},
	'chinese-19': {
		imageSrc: '/images/decks/chinese-19.svg',
		alt: 'Health, Pharmacy & Emergencies Icon',
		accentColor: '#E11D48',
		bgColor: '#FFE4E6'
	},
	'chinese-20': {
		imageSrc: '/images/decks/chinese-20.svg',
		alt: 'Expressing Opinions & Logic Connectors Icon',
		accentColor: '#CA8A04',
		bgColor: '#FEF9C3'
	},
	'chinese-21': {
		imageSrc: '/images/decks/chinese-21.svg',
		alt: 'Everyday Spoken Expressions & Situations Icon',
		accentColor: '#0891B2',
		bgColor: '#ECFEFF'
	},
	'chinese-22': {
		imageSrc: '/images/decks/chinese-22.svg',
		alt: 'Assignment A Icon',
		accentColor: '#4F46E5',
		bgColor: '#EEF2FF'
	},
	'chinese-23': {
		imageSrc: '/images/decks/chinese-23.svg',
		alt: 'Assignment B Icon',
		accentColor: '#8B5CF6',
		bgColor: '#F5F3FF'
	},
	'chinese-24': {
		imageSrc: '/images/decks/chinese-24.svg',
		alt: 'Self-Introductions & Social Connections Icon',
		accentColor: '#3B82F6',
		bgColor: '#EFF6FF'
	},
	'chinese-25': {
		imageSrc: '/images/decks/chinese-25.svg',
		alt: 'Ordering Food & Restaurant Adjustments Icon',
		accentColor: '#F97316',
		bgColor: '#FFF7ED'
	},
	'chinese-26': {
		imageSrc: '/images/decks/chinese-26.svg',
		alt: 'Shopping, Sizing & Garments Icon',
		accentColor: '#EC4899',
		bgColor: '#FDF2F8'
	},
	'chinese-27': {
		imageSrc: '/images/decks/chinese-27.svg',
		alt: 'Conversational Particles & Nuance Icon',
		accentColor: '#14B8A6',
		bgColor: '#F0FDFA'
	},
	'chinese-28': {
		imageSrc: '/images/decks/chinese-28.svg',
		alt: 'Conversation Rescue & Repair Loops Icon',
		accentColor: '#EF4444',
		bgColor: '#FEF2F2'
	},
	'chinese-29': {
		imageSrc: '/images/decks/chinese-29.svg',
		alt: 'Numbers, Prices & Practical Math Icon',
		accentColor: '#EAB308',
		bgColor: '#FEFCE8'
	},
	'chinese-30': {
		imageSrc: '/images/decks/chinese-30.svg',
		alt: 'Relative Time & Weekly Planning Icon',
		accentColor: '#0284C7',
		bgColor: '#F0F9FF'
	},
	'chinese-31': {
		imageSrc: '/images/decks/chinese-31.svg',
		alt: 'Everyday Home & Living Spaces Icon',
		accentColor: '#10B981',
		bgColor: '#ECFDF5'
	},
	'chinese-32': {
		imageSrc: '/images/decks/chinese-32.svg',
		alt: 'Polite Reactions & Social Courtesies Icon',
		accentColor: '#F59E0B',
		bgColor: '#FFFBEB'
	},
	'chinese-33': {
		imageSrc: '/images/decks/chinese-33.svg',
		alt: '7-Day Travel Survival & Wayfinding Icon',
		accentColor: '#1E40AF',
		bgColor: '#EFF6FF'
	},
	'chinese-34': {
		imageSrc: '/images/decks/chinese-34.svg',
		alt: 'Tone Pairs Lab Icon',
		accentColor: '#06B6D4',
		bgColor: '#ECFEFF'
	},
	'chinese-35': {
		imageSrc: '/images/decks/chinese-35.svg',
		alt: 'Pinyin Typing & Syllable Mechanics Icon',
		accentColor: '#6366F1',
		bgColor: '#EEF2FF'
	},
	'french-1': {
		imageSrc: '/images/decks/french-1.svg',
		alt: 'French Greetings & Essentials Icon',
		accentColor: '#2563EB',
		bgColor: '#DBEAFE'
	},
	'french-2': {
		imageSrc: '/images/decks/french-2.svg',
		alt: 'French Numbers & Time Icon',
		accentColor: '#D97706',
		bgColor: '#FEF3C7'
	}
};

const DEFAULT_CUSTOM_ICON: DeckIconInfo = {
	imageSrc: '/images/decks/custom-default.svg',
	alt: 'Custom Deck Icon',
	accentColor: '#7C3AED',
	bgColor: '#F5F3FF'
};

export function getDeckIcon(deckId: string, language?: 'chinese' | 'french'): DeckIconInfo {
	// 1. Direct key match (e.g. 'chinese-1', 'french-2')
	const normalizedId = deckId.toLowerCase();
	if (DECK_ICONS_MAP[normalizedId]) {
		return DECK_ICONS_MAP[normalizedId];
	}

	// 2. Extract pack number if formatted as 'pack-1' or '1'
	const packMatch = normalizedId.match(/(?:chinese-|french-|pack-|week-)?(\d+)/);
	if (packMatch) {
		const num = packMatch[1];
		const lang = language || (normalizedId.includes('french') ? 'french' : 'chinese');
		const mappedKey = `${lang}-${num}`;
		if (DECK_ICONS_MAP[mappedKey]) {
			return DECK_ICONS_MAP[mappedKey];
		}
	}

	// 3. Fallback for custom or unmatched decks
	return DEFAULT_CUSTOM_ICON;
}
