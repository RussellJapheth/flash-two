<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		alpha: number;
		life: number;
		maxLife: number;
		gravity: number;
		shape?: 'circle' | 'star' | 'spark';
	}

	let canvasEl: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animId: number | null = null;
	let particles: Particle[] = [];

	const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#38BDF8', '#F43F5E'];

	function resize() {
		if (!canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = rect.width * dpr;
		canvasEl.height = rect.height * dpr;
		if (ctx) {
			ctx.resetTransform();
			ctx.scale(dpr, dpr);
		}
	}

	export function spawnBurst(
		clientX: number,
		clientY: number,
		count: number = 24,
		frenzy: boolean = false
	) {
		if (!canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		const baseCount = frenzy ? count * 1.5 : count;
		for (let i = 0; i < baseCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * (frenzy ? 7 : 5) + 1.5;
			const color = frenzy ? '#F59E0B' : COLORS[Math.floor(Math.random() * COLORS.length)];
			particles.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - (Math.random() * 2 + 1),
				size: Math.random() * (frenzy ? 6 : 4) + 2,
				color,
				alpha: 1,
				life: 0,
				maxLife: Math.random() * 25 + 25,
				gravity: 0.12,
				shape: frenzy && Math.random() > 0.5 ? 'star' : 'circle'
			});
		}
	}

	function render() {
		if (!canvasEl || !ctx) return;
		const rect = canvasEl.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy += p.gravity;
			p.vx *= 0.98;
			p.life++;
			p.alpha = Math.max(0, 1 - p.life / p.maxLife);

			if (p.alpha <= 0) {
				particles.splice(i, 1);
				continue;
			}

			ctx.save();
			ctx.globalAlpha = p.alpha;
			ctx.fillStyle = p.color;

			if (p.shape === 'star') {
				drawStar(ctx, p.x, p.y, 4, p.size * 1.4, p.size * 0.6);
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}

		animId = requestAnimationFrame(render);
	}

	function drawStar(
		c: CanvasRenderingContext2D,
		cx: number,
		cy: number,
		spikes: number,
		outerRadius: number,
		innerRadius: number
	) {
		let rot = (Math.PI / 2) * 3;
		let x = cx;
		let y = cy;
		const step = Math.PI / spikes;

		c.beginPath();
		c.moveTo(cx, cy - outerRadius);
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			c.lineTo(x, y);
			rot += step;

			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			c.lineTo(x, y);
			rot += step;
		}
		c.lineTo(cx, cy - outerRadius);
		c.closePath();
		c.fill();
	}

	onMount(() => {
		ctx = canvasEl.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
		animId = requestAnimationFrame(render);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', resize);
		}
		if (animId !== null) {
			cancelAnimationFrame(animId);
		}
	});
</script>

<canvas
	bind:this={canvasEl}
	class="pointer-events-none absolute inset-0 z-30 h-full w-full"
	aria-hidden="true"
></canvas>
