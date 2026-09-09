/**
 * Speech Recognition and Audio Evaluation Utility for Story Mode
 */

export function isSpeechRecognitionSupported(): boolean {
	if (typeof window === 'undefined') return false;
	const SpeechRecognition =
		(window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
			.SpeechRecognition ||
		(window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
			.webkitSpeechRecognition;
	return Boolean(SpeechRecognition);
}

/**
 * Normalizes text for comparison by removing punctuation and excess whitespace
 */
export function normalizeText(text: string, lang: 'chinese' | 'french'): string {
	if (!text) return '';
	let cleaned = text
		.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'，。！？、；：“”‘’（）《》【】]/g, '')
		.trim();

	if (lang === 'french') {
		cleaned = cleaned
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, ''); // strip diacritics for tolerant comparison
	} else {
		// Chinese: strip all spaces
		cleaned = cleaned.replace(/\s+/g, '');
	}
	return cleaned;
}

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (m === 0) return n;
	if (n === 0) return m;

	const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(
				dp[i - 1][j] + 1, // deletion
				dp[i][j - 1] + 1, // insertion
				dp[i - 1][j - 1] + cost // substitution
			);
		}
	}

	return dp[m][n];
}

/**
 * Calculates similarity ratio between 0 and 1
 */
export function calculateSimilarity(a: string, b: string): number {
	if (a === b) return 1;
	const maxLen = Math.max(a.length, b.length);
	if (maxLen === 0) return 1;
	const dist = levenshteinDistance(a, b);
	return Math.max(0, 1 - dist / maxLen);
}

/**
 * Strips tone marks from pinyin string (e.g. "nǐ hǎo" -> "ni hao")
 */
export function stripPinyinTones(pinyinStr: string): string {
	return pinyinStr
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z]/g, '');
}

export interface SpeechEvaluationResult {
	passed: boolean;
	score: number; // 0.0 to 1.0
	matchedKeywords: string[];
	missingKeywords: string[];
	feedback: string;
	recognizedText: string;
}

/**
 * Evaluates spoken text against expected target sentence
 */
export function evaluateSpeechAccuracy(
	spokenText: string,
	expectedText: string,
	lang: 'chinese' | 'french',
	expectedPinyin?: string,
	keywords?: string[]
): SpeechEvaluationResult {
	const normSpoken = normalizeText(spokenText, lang);
	const normExpected = normalizeText(expectedText, lang);

	if (!normSpoken) {
		return {
			passed: false,
			score: 0,
			matchedKeywords: [],
			missingKeywords: keywords || [],
			feedback: 'No speech detected. Please try speaking closer to the microphone.',
			recognizedText: spokenText
		};
	}

	// 1. Exact match check
	if (normSpoken === normExpected) {
		return {
			passed: true,
			score: 1.0,
			matchedKeywords: keywords || [],
			missingKeywords: [],
			feedback: 'Excellent pronunciation! Perfectly understood.',
			recognizedText: spokenText
		};
	}

	// 2. Similarity calculation
	const textSimilarity = calculateSimilarity(normSpoken, normExpected);

	// 3. Keyword matching check
	const matchedKeywords: string[] = [];
	const missingKeywords: string[] = [];

	if (keywords && keywords.length > 0) {
		for (const kw of keywords) {
			const normKw = normalizeText(kw, lang);
			if (normSpoken.includes(normKw)) {
				matchedKeywords.push(kw);
			} else {
				missingKeywords.push(kw);
			}
		}
	}

	const keywordRatio =
		keywords && keywords.length > 0 ? matchedKeywords.length / keywords.length : 1.0;

	// Blended score
	const score = Math.min(1.0, Math.max(textSimilarity, keywordRatio * 0.9));

	// Pass condition: similarity >= 0.65 or all keywords present
	const passed =
		score >= 0.65 || Boolean(keywords && keywords.length > 0 && missingKeywords.length === 0);

	const feedback =
		score >= 0.9
			? 'Excellent pronunciation! Clear and natural.'
			: passed
				? 'Understood! Good attempt, understandable by native speakers.'
				: 'Could not quite catch that. Give it another try!';

	return {
		passed,
		score: Math.round(score * 100) / 100,
		matchedKeywords,
		missingKeywords,
		feedback,
		recognizedText: spokenText
	};
}

export interface SpeechRecognizerOptions {
	lang: 'zh-CN' | 'fr-FR' | string;
	onStart?: () => void;
	onResult?: (transcript: string, isFinal: boolean) => void;
	onError?: (error: string) => void;
	onEnd?: () => void;
}

export interface SpeechRecognizerHandle {
	stop: () => void;
	abort: () => void;
}

/**
 * Initializes and starts speech recognition session
 */
export function startSpeechRecognition(
	options: SpeechRecognizerOptions
): SpeechRecognizerHandle | null {
	if (typeof window === 'undefined') return null;

	const SpeechRecognition =
		(
			window as unknown as {
				SpeechRecognition?: new () => unknown;
				webkitSpeechRecognition?: new () => unknown;
			}
		).SpeechRecognition ||
		(
			window as unknown as {
				SpeechRecognition?: new () => unknown;
				webkitSpeechRecognition?: new () => unknown;
			}
		).webkitSpeechRecognition;

	if (!SpeechRecognition) {
		if (options.onError) {
			options.onError('SpeechRecognition is not supported in this browser.');
		}
		return null;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const recognizer = new (SpeechRecognition as any)();
		recognizer.lang = options.lang;
		recognizer.continuous = false;
		recognizer.interimResults = true;
		recognizer.maxAlternatives = 3;

		recognizer.onstart = () => {
			if (options.onStart) options.onStart();
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		recognizer.onresult = (event: any) => {
			let finalTranscript = '';
			let interimTranscript = '';

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				const transcript = result[0].transcript;
				if (result.isFinal) {
					finalTranscript += transcript;
				} else {
					interimTranscript += transcript;
				}
			}

			const text = finalTranscript || interimTranscript;
			const isFinal = Boolean(finalTranscript);
			if (options.onResult) {
				options.onResult(text, isFinal);
			}
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		recognizer.onerror = (event: any) => {
			if (options.onError) {
				options.onError(event.error || 'Speech recognition error');
			}
		};

		recognizer.onend = () => {
			if (options.onEnd) options.onEnd();
		};

		recognizer.start();

		return {
			stop: () => {
				try {
					recognizer.stop();
				} catch {
					// Ignore if already stopped
				}
			},
			abort: () => {
				try {
					recognizer.abort();
				} catch {
					// Ignore if already aborted
				}
			}
		};
	} catch (err) {
		if (options.onError) {
			options.onError((err as Error).message || 'Failed to start speech recognition');
		}
		return null;
	}
}
