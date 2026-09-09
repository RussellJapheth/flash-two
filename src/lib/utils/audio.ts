let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!audioCtx) {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		if (AudioContextClass) {
			audioCtx = new AudioContextClass();
		}
	}
	if (audioCtx && audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

export function playSound(type: 'flip' | 'correct' | 'wrong' | 'milestone') {
	const ctx = getAudioContext();
	if (!ctx) return;

	const now = ctx.currentTime;

	if (type === 'flip') {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(320, now);
		osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

		gain.gain.setValueAtTime(0.12, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + 0.08);
	} else if (type === 'correct') {
		// Pleasant two-tone chime
		const notes = [587.33, 880.0]; // D5, A5
		notes.forEach((freq, idx) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, now + idx * 0.08);

			gain.gain.setValueAtTime(0.15, now + idx * 0.08);
			gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + idx * 0.08);
			osc.stop(now + idx * 0.08 + 0.25);
		});
	} else if (type === 'wrong') {
		// Low soft buzzer
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(180, now);
		osc.frequency.linearRampToValueAtTime(140, now + 0.2);

		gain.gain.setValueAtTime(0.1, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now);
		osc.stop(now + 0.2);
	} else if (type === 'milestone') {
		// 3-note celebration arpeggio
		const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
		chord.forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, now + i * 0.1);

			gain.gain.setValueAtTime(0.18, now + i * 0.1);
			gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now + i * 0.1);
			osc.stop(now + i * 0.1 + 0.4);
		});
	}
}

// Pentatonic scale frequencies for dynamic match combo ladder (C5 to C7)
const PENTATONIC_SCALE = [
	523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0
];

export function playMatchFlip() {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(420, now);
	osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

	gain.gain.setValueAtTime(0.08, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + 0.05);
}

export function playMatchSuccess(comboCount: number = 0) {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;

	const scaleIndex = Math.min(comboCount, PENTATONIC_SCALE.length - 2);
	const baseFreq = PENTATONIC_SCALE[scaleIndex];
	const highFreq = PENTATONIC_SCALE[scaleIndex + 1] || baseFreq * 1.25;

	// Primary melodic chime
	[baseFreq, highFreq].forEach((freq, idx) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.setValueAtTime(freq, now + idx * 0.06);

		gain.gain.setValueAtTime(0.14, now + idx * 0.06);
		gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + idx * 0.06);
		osc.stop(now + idx * 0.06 + 0.22);
	});

	// Sparkle bell overtone for high streaks
	if (comboCount >= 3) {
		const sparkleOsc = ctx.createOscillator();
		const sparkleGain = ctx.createGain();
		sparkleOsc.type = 'sine';
		sparkleOsc.frequency.setValueAtTime(baseFreq * 2, now + 0.04);
		sparkleGain.gain.setValueAtTime(0.06, now + 0.04);
		sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

		sparkleOsc.connect(sparkleGain);
		sparkleGain.connect(ctx.destination);
		sparkleOsc.start(now + 0.04);
		sparkleOsc.stop(now + 0.28);
	}
}

export function playMatchMismatch() {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = 'sawtooth';
	osc.frequency.setValueAtTime(160, now);
	osc.frequency.linearRampToValueAtTime(110, now + 0.16);

	gain.gain.setValueAtTime(0.08, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + 0.16);
}

export function playFrenzyIgnite() {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;

	const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51];
	arpeggio.forEach((freq, idx) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, now + idx * 0.04);

		gain.gain.setValueAtTime(0.12, now + idx * 0.04);
		gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + idx * 0.04);
		osc.stop(now + idx * 0.04 + 0.3);
	});
}

export function playHeartbeatWarning() {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = 'sine';
	osc.frequency.setValueAtTime(80, now);
	osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

	gain.gain.setValueAtTime(0.2, now);
	gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + 0.08);
}

export function stopSpeech() {
	if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
		window.speechSynthesis.cancel();
	}
}

// Text to Speech
export function speakWord(
	text: string,
	language: 'chinese' | 'french' | 'english' = 'chinese',
	options?: { rate?: number; cancelPrevious?: boolean }
): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			console.warn('SpeechSynthesis is not supported in this browser');
			resolve();
			return;
		}

		if (options?.cancelPrevious !== false) {
			window.speechSynthesis.cancel(); // Stop any pending utterance
		}

		const clean = text.replace(/[[\]()]/g, '').trim();
		if (!clean) {
			resolve();
			return;
		}

		const utterance = new SpeechSynthesisUtterance(clean);
		utterance.rate = options?.rate ?? (language === 'english' ? 0.95 : 0.9);

		if (language === 'chinese') {
			utterance.lang = 'zh-CN';
		} else if (language === 'french') {
			utterance.lang = 'fr-FR';
		} else {
			utterance.lang = 'en-US';
		}

		// Try finding high quality native voices
		const voices = window.speechSynthesis.getVoices();
		if (voices.length > 0) {
			const targetLang = language === 'chinese' ? 'zh' : language === 'french' ? 'fr' : 'en';
			const voice =
				voices.find(
					(v) =>
						v.lang.toLowerCase().startsWith(targetLang) &&
						(v.localService || v.name.includes('Natural'))
				) || voices.find((v) => v.lang.toLowerCase().startsWith(targetLang));

			if (voice) utterance.voice = voice;
		}

		let settled = false;
		const done = () => {
			if (!settled) {
				settled = true;
				resolve();
			}
		};

		utterance.onend = done;
		utterance.onerror = done;

		// Fallback safety timeout in case browser synthesis drops event
		const fallbackMs = Math.max(2500, clean.length * 150 + 1000);
		setTimeout(done, fallbackMs);

		window.speechSynthesis.speak(utterance);
	});
}

export const speakText = speakWord;
