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
