<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		audioActive?: boolean;
	}

	let { audioActive = false }: Props = $props();

	let canvasEl: HTMLCanvasElement | null = $state(null);
	let animId: number | null = null;

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		alpha: number;
		decay: number;
		rotation?: number;
		vRot?: number;
		shape?: 'circle' | 'spark' | 'confetti' | 'star';
	}

	interface WaveRing {
		x: number;
		y: number;
		radius: number;
		maxRadius: number;
		alpha: number;
		color: string;
	}

	let particles: Particle[] = [];
	let rings: WaveRing[] = [];
	let ambientParticles: Particle[] = [];

	export function triggerHit(
		x?: number,
		y?: number,
		type: 'correct' | 'wrong' | 'combo' = 'correct'
	) {
		if (!canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const cx = x !== undefined ? x - rect.left : canvasEl.width / 2;
		const cy = y !== undefined ? y - rect.top : canvasEl.height / 2;

		const count = type === 'wrong' ? 12 : type === 'combo' ? 36 : 20;
		const colors =
			type === 'wrong'
				? ['#E11D48', '#FDA4AF', '#FB7185']
				: type === 'combo'
					? ['#F59E0B', '#FBBF24', '#4F46E5', '#10B981', '#6366F1']
					: ['#10B981', '#34D399', '#4F46E5', '#A7F3D0'];

		// Trigger wave ring
		rings.push({
			x: cx,
			y: cy,
			radius: 10,
			maxRadius: type === 'combo' ? 120 : 80,
			alpha: 0.8,
			color: colors[0]
		});

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * (type === 'combo' ? 6 : 4) + 1.5;
			const color = colors[Math.floor(Math.random() * colors.length)];
			const shape = type === 'combo' ? (Math.random() > 0.5 ? 'star' : 'spark') : 'circle';

			particles.push({
				x: cx,
				y: cy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: Math.random() * 4 + 2,
				color,
				alpha: 1,
				decay: Math.random() * 0.025 + 0.015,
				rotation: Math.random() * 360,
				vRot: (Math.random() - 0.5) * 10,
				shape
			});
		}
	}

	export function triggerConfetti() {
		if (!canvasEl) return;
		const colors = [
			'#4F46E5',
			'#6366F1',
			'#10B981',
			'#F59E0B',
			'#EC4899',
			'#8B5CF6',
			'#38BDF8',
			'#F43F5E'
		];
		const w = canvasEl.width;

		for (let i = 0; i < 90; i++) {
			particles.push({
				x: Math.random() * w,
				y: -20 - Math.random() * 60,
				vx: (Math.random() - 0.5) * 4,
				vy: Math.random() * 3.5 + 2.5,
				size: Math.random() * 6 + 4,
				color: colors[Math.floor(Math.random() * colors.length)],
				alpha: 1,
				decay: Math.random() * 0.006 + 0.004,
				rotation: Math.random() * 360,
				vRot: (Math.random() - 0.5) * 12,
				shape: 'confetti'
			});
		}
	}

	function initAmbient() {
		if (!canvasEl) return;
		const w = canvasEl.width;
		const h = canvasEl.height;
		ambientParticles = [];
		const ambientCount = 18;

		for (let i = 0; i < ambientCount; i++) {
			ambientParticles.push({
				x: Math.random() * w,
				y: Math.random() * h,
				vx: (Math.random() - 0.5) * 0.4,
				vy: -Math.random() * 0.5 - 0.2,
				size: Math.random() * 2.5 + 1,
				color: Math.random() > 0.5 ? '#818CF8' : '#FCD34D',
				alpha: Math.random() * 0.35 + 0.1,
				decay: 0,
				shape: 'circle'
			});
		}
	}

	function resize() {
		if (!canvasEl || !canvasEl.parentElement) return;
		const rect = canvasEl.parentElement.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvasEl.width = rect.width * dpr;
		canvasEl.height = rect.height * dpr;
		canvasEl.style.width = `${rect.width}px`;
		canvasEl.style.height = `${rect.height}px`;
		const ctx = canvasEl.getContext('2d');
		if (ctx) {
			ctx.scale(dpr, dpr);
		}
	}

	let audioPhase = 0;

	function render() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = canvasEl.width / dpr;
		const h = canvasEl.height / dpr;

		ctx.clearRect(0, 0, w, h);

		// 1. Ambient floating particles
		for (let i = 0; i < ambientParticles.length; i++) {
			const p = ambientParticles[i];
			p.x += p.vx;
			p.y += p.vy;
			if (p.y < -10) p.y = h + 10;
			if (p.x < -10) p.x = w + 10;
			if (p.x > w + 10) p.x = -10;

			ctx.save();
			ctx.globalAlpha = p.alpha;
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		// 2. Audio waveform pulse when audio is active
		if (audioActive) {
			audioPhase += 0.08;
			ctx.save();
			ctx.strokeStyle = '#6366F1';
			ctx.lineWidth = 2;
			ctx.globalAlpha = 0.45;
			ctx.beginPath();
			const centerY = h * 0.45;
			for (let x = 0; x < w; x += 4) {
				const wave = Math.sin(x * 0.04 + audioPhase) * Math.cos(x * 0.02 - audioPhase * 0.5) * 16;
				if (x === 0) ctx.moveTo(x, centerY + wave);
				else ctx.lineTo(x, centerY + wave);
			}
			ctx.stroke();
			ctx.restore();
		}

		// 3. Wave shockwave rings
		for (let i = rings.length - 1; i >= 0; i--) {
			const r = rings[i];
			r.radius += 3.5;
			r.alpha -= 0.035;

			if (r.alpha <= 0 || r.radius >= r.maxRadius) {
				rings.splice(i, 1);
				continue;
			}

			ctx.save();
			ctx.strokeStyle = r.color;
			ctx.lineWidth = 2.5;
			ctx.globalAlpha = Math.max(0, r.alpha);
			ctx.beginPath();
			ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		// 4. Hit & Confetti particles
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.alpha -= p.decay;
			if (p.rotation !== undefined && p.vRot !== undefined) {
				p.rotation += p.vRot;
			}

			if (p.alpha <= 0) {
				particles.splice(i, 1);
				continue;
			}

			ctx.save();
			ctx.globalAlpha = Math.max(0, p.alpha);
			ctx.fillStyle = p.color;

			if (p.shape === 'confetti') {
				ctx.translate(p.x, p.y);
				ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
				ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
			} else if (p.shape === 'star') {
				ctx.translate(p.x, p.y);
				ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
				ctx.beginPath();
				ctx.arc(0, 0, p.size, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}

		animId = requestAnimationFrame(render);
	}

	onMount(() => {
		resize();
		initAmbient();
		animId = requestAnimationFrame(render);
		window.addEventListener('resize', resize);
	});

	onDestroy(() => {
		if (animId !== null) cancelAnimationFrame(animId);
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', resize);
		}
	});
</script>

<canvas
	bind:this={canvasEl}
	class="pointer-events-none absolute inset-0 z-10 h-full w-full"
	aria-hidden="true"
></canvas>
