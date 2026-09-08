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
