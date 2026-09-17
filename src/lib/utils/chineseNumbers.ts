/**
 * Chinese numeral helpers: Arabic digits to Hanzi, and position-aware spoken
 * forms (tones modulo 10 for 5/9) used by the Number Rush voice game.
 */
const DIGIT_HANZI: Record<number, string> = {
	0: '零',
	1: '一',
	2: '二',
	3: '三',
	4: '四',
	5: '五',
	6: '六',
	7: '七',
	8: '八',
	9: '九'
};

const DIGIT_PINYIN: Record<number, string> = {
	0: 'líng',
	1: 'yī',
	2: 'èr',
	3: 'sān',
	4: 'sì',
	5: 'wǔ',
	6: 'liù',
	7: 'qī',
	8: 'bā',
	9: 'jiǔ'
};

export interface ChineseNumberData {
	value: number;
	hanzi: string;
	pinyin: string;
}

export function numberToChinese(num: number): ChineseNumberData {
	const n = Math.floor(Math.max(0, Math.min(999, num)));

	if (n === 0) {
		return { value: 0, hanzi: DIGIT_HANZI[0], pinyin: DIGIT_PINYIN[0] };
	}

	if (n < 10) {
		return { value: n, hanzi: DIGIT_HANZI[n], pinyin: DIGIT_PINYIN[n] };
	}

	if (n < 20) {
		const unit = n % 10;
		if (unit === 0) {
			return { value: 10, hanzi: '十', pinyin: 'shí' };
		}
		return {
			value: n,
			hanzi: `十${DIGIT_HANZI[unit]}`,
			pinyin: `shí ${DIGIT_PINYIN[unit]}`
		};
	}

	if (n < 100) {
		const tens = Math.floor(n / 10);
		const unit = n % 10;
		if (unit === 0) {
			return {
				value: n,
				hanzi: `${DIGIT_HANZI[tens]}十`,
				pinyin: `${DIGIT_PINYIN[tens]} shí`
			};
		}
		return {
			value: n,
			hanzi: `${DIGIT_HANZI[tens]}十${DIGIT_HANZI[unit]}`,
			pinyin: `${DIGIT_PINYIN[tens]} shí ${DIGIT_PINYIN[unit]}`
		};
	}

	// 100 - 999
	const hundreds = Math.floor(n / 100);
	const remainder = n % 100;
	const tens = Math.floor(remainder / 10);
	const unit = remainder % 10;

	let hanzi = `${DIGIT_HANZI[hundreds]}百`;
	let pinyin = `${DIGIT_PINYIN[hundreds]} bǎi`;

	if (remainder === 0) {
		return { value: n, hanzi, pinyin };
	}

	if (tens === 0) {
		// e.g. 105 -> 一百零五
		hanzi += `零${DIGIT_HANZI[unit]}`;
		pinyin += ` líng ${DIGIT_PINYIN[unit]}`;
	} else if (unit === 0) {
		// e.g. 120 -> 一百二十
		hanzi += `${DIGIT_HANZI[tens]}十`;
		pinyin += ` ${DIGIT_PINYIN[tens]} shí`;
	} else {
		// e.g. 125 -> 一百二十五
		hanzi += `${DIGIT_HANZI[tens]}十${DIGIT_HANZI[unit]}`;
		pinyin += ` ${DIGIT_PINYIN[tens]} shí ${DIGIT_PINYIN[unit]}`;
	}

	return { value: n, hanzi, pinyin };
}

export interface NumberRushQuestion {
	correctValue: number;
	hanzi: string;
	pinyin: string;
	options: number[];
}

export function generateDistractors(correct: number, maxRange: number): number[] {
	const candidates = new Set<number>();

	// 1. Swapped digits for 2-digit numbers (e.g., 35 -> 53)
	if (correct >= 10 && correct <= 99) {
		const tens = Math.floor(correct / 10);
		const unit = correct % 10;
		const swapped = unit * 10 + tens;
		if (swapped !== correct && swapped <= maxRange) {
			candidates.add(swapped);
		}
	}

	// 2. Off-by-10 (+10, -10, +20, -20)
	[-10, 10, -20, 20].forEach((delta) => {
		const val = correct + delta;
		if (val >= 0 && val <= maxRange && val !== correct) {
			candidates.add(val);
		}
	});

	// 3. Off-by-1 (+1, -1, +2, -2)
	[-1, 1, -2, 2].forEach((delta) => {
		const val = correct + delta;
		if (val >= 0 && val <= maxRange && val !== correct) {
			candidates.add(val);
		}
	});

	// 4. Same last digit
	const unit = correct % 10;
	for (let t = 0; t <= Math.floor(maxRange / 10); t++) {
		const val = t * 10 + unit;
		if (val !== correct && val <= maxRange) {
			candidates.add(val);
		}
	}

	const pool = Array.from(candidates).filter((x) => x !== correct);

	// Shuffle pool
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}

	const chosen: number[] = pool.slice(0, 3);

	// Fallback if not enough candidates
	while (chosen.length < 3) {
		const randomVal = Math.floor(Math.random() * (maxRange + 1));
		if (randomVal !== correct && !chosen.includes(randomVal)) {
			chosen.push(randomVal);
		}
	}

	return chosen;
}

export function generateNumberRushQuestion(
	maxNumber: number = 99,
	usedNumbers?: Set<number>
): NumberRushQuestion {
	const available: number[] = [];
	if (usedNumbers && usedNumbers.size < maxNumber + 1) {
		for (let i = 0; i <= maxNumber; i++) {
			if (!usedNumbers.has(i)) {
				available.push(i);
			}
		}
	}

	let val: number;
	if (available.length > 0) {
		val = available[Math.floor(Math.random() * available.length)];
	} else {
		val = Math.floor(Math.random() * (maxNumber + 1));
	}

	if (usedNumbers) {
		usedNumbers.add(val);
	}

	const data = numberToChinese(val);
	const distractors = generateDistractors(val, maxNumber);

	const allOptions = [val, ...distractors];
	// Fisher-Yates shuffle
	for (let i = allOptions.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
	}

	return {
		correctValue: val,
		hanzi: data.hanzi,
		pinyin: data.pinyin,
		options: allOptions
	};
}

const ONES = [
	'zero',
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine',
	'ten',
	'eleven',
	'twelve',
	'thirteen',
	'fourteen',
	'fifteen',
	'sixteen',
	'seventeen',
	'eighteen',
	'nineteen'
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberToEnglish(num: number): string {
	const n = Math.floor(Math.max(0, Math.min(999, num)));
	if (n < 20) return ONES[n];
	if (n < 100) {
		const t = Math.floor(n / 10);
		const u = n % 10;
		return u === 0 ? TENS[t] : `${TENS[t]} ${ONES[u]}`;
	}
	const h = Math.floor(n / 100);
	const rem = n % 100;
	if (rem === 0) return `${ONES[h]} hundred`;
	if (rem < 20) return `${ONES[h]} hundred ${ONES[rem]}`;
	const t = Math.floor(rem / 10);
	const u = rem % 10;
	return u === 0 ? `${ONES[h]} hundred ${TENS[t]}` : `${ONES[h]} hundred ${TENS[t]} ${ONES[u]}`;
}

const HOMOPHONES: Record<string, string> = {
	to: 'two',
	too: 'two',
	tu: 'two',
	tew: 'two',
	doe: 'two',
	for: 'four',
	fore: 'four',
	ford: 'four',
	fourth: 'four',
	fourty: 'forty',
	fo: 'four',
	won: 'one',
	wan: 'one',
	wun: 'one',
	juan: 'one',
	wen: 'one',
	ate: 'eight',
	ait: 'eight',
	hate: 'eight',
	late: 'eight',
	eighth: 'eight',
	tree: 'three',
	free: 'three',
	tri: 'three',
	tre: 'three',
	tin: 'ten',
	tan: 'ten',
	then: 'ten',
	den: 'ten',
	sex: 'six',
	sicks: 'six',
	syx: 'six',
	sax: 'six',
	sixth: 'six',
	sevn: 'seven',
	severn: 'seven',
	seventh: 'seven',
	nein: 'nine',
	nin: 'nine',
	ninth: 'nine',
	night: 'nine',
	mine: 'nine',
	line: 'nine',
	oh: 'zero',
	o: 'zero',
	nil: 'zero',
	nought: 'zero',
	naught: 'zero',
	hero: 'zero',
	zed: 'zero',
	zip: 'zero',
	thurty: 'thirty',
	fif: 'five',
	fife: 'five',
	hive: 'five',
	vibe: 'five',
	fifth: 'five'
};

const NUMBER_WORDS: Record<string, number> = {
	zero: 0,
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
	eleven: 11,
	twelve: 12,
	thirteen: 13,
	fourteen: 14,
	fifteen: 15,
	sixteen: 16,
	seventeen: 17,
	eighteen: 18,
	nineteen: 19,
	twenty: 20,
	thirty: 30,
	forty: 40,
	fifty: 50,
	sixty: 60,
	seventy: 70,
	eighty: 80,
	ninety: 90
};

const FILLER_WORDS = new Set([
	'it',
	'is',
	'its',
	'the',
	'a',
	'an',
	'number',
	'and',
	'i',
	'said',
	'say',
	'think',
	'um',
	'uh',
	'er',
	'ah',
	'yeah',
	'yes',
	'please'
]);

export function parseEnglishSpokenNumber(spoken: string): number | null {
	if (!spoken) return null;
	const clean = spoken
		.toLowerCase()
		.replace(/(\d+)(st|nd|rd|th)\b/g, '$1') // strip ordinals e.g. "35th" -> "35"
		.replace(/[^a-z0-9\s]/g, ' ')
		.trim();

	if (!clean) return null;

	// Check if entire string is direct numeric digits (e.g. "25", "0", "105")
	if (/^\d+$/.test(clean)) {
		const val = parseInt(clean, 10);
		if (!isNaN(val) && val >= 0 && val <= 999) return val;
	}

	const rawWords = clean.split(/\s+/).filter(Boolean);
	if (rawWords.length === 0) return null;

	// Normalize homophones and filter fillers
	const words: string[] = [];
	for (let i = 0; i < rawWords.length; i++) {
		const rw = rawWords[i];
		const mapped = HOMOPHONES[rw] || rw;
		if (mapped === 'a' && rawWords[i + 1] === 'hundred') {
			words.push('one');
		} else if (!FILLER_WORDS.has(mapped)) {
			words.push(mapped);
		}
	}

	if (words.length === 0) return null;

	// Case A: Digit-by-digit sequence (e.g. ["three", "five"] -> 35, ["one", "zero", "five"] -> 105)
	const singleDigitValues: Record<string, number> = {
		zero: 0,
		one: 1,
		two: 2,
		three: 3,
		four: 4,
		five: 5,
		six: 6,
		seven: 7,
		eight: 8,
		nine: 9
	};

	if (
		words.length >= 2 &&
		words.length <= 3 &&
		words.every((w) => w in singleDigitValues || /^\d$/.test(w))
	) {
		const digits = words.map((w) =>
			w in singleDigitValues ? singleDigitValues[w] : parseInt(w, 10)
		);
		const val = parseInt(digits.join(''), 10);
		if (!isNaN(val) && val >= 0 && val <= 999) return val;
	}

	// Case B: Standard English compound numbers (e.g. "twenty five", "two hundred and eight", "a hundred five")
	let total = 0;
	let current = 0;
	let matchedAny = false;

	for (let i = 0; i < words.length; i++) {
		const w = words[i];
		if (w in NUMBER_WORDS) {
			current += NUMBER_WORDS[w];
			matchedAny = true;
		} else if (w === 'hundred') {
			current = (current === 0 ? 1 : current) * 100;
			total += current;
			current = 0;
			matchedAny = true;
		} else if (/^\d+$/.test(w)) {
			const n = parseInt(w, 10);
			if (n >= 100) {
				total += n;
			} else {
				current += n;
			}
			matchedAny = true;
		}
	}
	total += current;

	if (matchedAny && total >= 0 && total <= 999) {
		return total;
	}

	return null;
}
