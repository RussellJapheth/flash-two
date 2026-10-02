<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import KitchenLine, {
		type RoundResult
	} from '$lib/components/games/restaurant/KitchenLine.svelte';
	import { buildRestaurantMenu } from '$lib/data/restaurantDishes';
	import { playSound } from '$lib/utils/audio';
	import { getGameHighScore, saveGameScore } from '$lib/utils/gameStorage';
	import { addXP, calculateGameXP } from '$lib/utils/xp';
	import { ChevronLeft, Sparkles, Trophy } from 'lucide-svelte';

	const GAME_ID = 'restaurant';
	const GAME_NAME = 'Restaurant';

	type Phase = 'playing' | 'results';

	interface RoundSummary {
		score: number;
		correct: number;
		wrong: number;
		maxCombo: number;
		headline: string;
		detail: string;
	}

	let phase = $state<Phase>('playing');
	let soundEnabled = $state(true);
	let highScore = $state(0);
	let isNewHighScore = $state(false);
	let earnedXP = $state(0);
	let accuracy = $state(0);
	let summary = $state<RoundSummary | null>(null);

	const menu = buildRestaurantMenu();

	onMount(() => {
		highScore = getGameHighScore(GAME_ID, 'visual');
	});

	async function recordRound(result: RoundResult) {
		phase = 'results';
		const completed = result.itemsPlated >= result.orderSize;
		summary = {
			score: result.score,
			correct: result.correct,
			wrong: result.wrong,
			maxCombo: result.maxCombo,
			headline: completed
				? result.wrong === 0
					? 'Perfect service'
					: 'Order complete'
				: 'Diner walked out',
			detail: completed
				? `${result.itemsPlated}/${result.orderSize} courses plated`
				: `${result.itemsPlated}/${result.orderSize} courses plated • ${result.wrong} ${result.wrong === 1 ? 'mistake' : 'mistakes'}`
		};

		const attempts = result.correct + result.wrong;
		accuracy = attempts > 0 ? Math.round((result.correct / attempts) * 100) : 0;

		earnedXP = calculateGameXP(result.correct, accuracy, result.maxCombo);
		if (earnedXP > 0) addXP(earnedXP);

		if (result.score > highScore && result.score > 0) {
			highScore = result.score;
			isNewHighScore = true;
		}

		if (soundEnabled) playSound('milestone');

		await saveGameScore({
			gameId: GAME_ID,
			gameName: GAME_NAME,
			score: result.score,
			correct: result.correct,
			wrong: result.wrong,
			accuracy,
			maxCombo: result.maxCombo,
			mode: 'visual'
		});
	}

	function replay() {
		summary = null;
		isNewHighScore = false;
		earnedXP = 0;
		phase = 'playing';
	}
</script>

<svelte:head>
	<title>Restaurant • FlashCards</title>
	<meta
		name="description"
		content="Run a Mandarin Chinese kitchen: read hanzi and pinyin, pick the English meaning, and plate the order before the timer runs out."
	/>
</svelte:head>

{#if !menu.ok}
	<div class="min-h-dvh bg-slate-50 font-sans text-slate-900">
		<header
			class="sticky top-0 z-40 flex items-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md"
		>
			<a
				href={resolve('/games')}
				aria-label="Back to Games"
				class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-transform hover:bg-slate-50 active:scale-95"
			>
				<ChevronLeft size={20} strokeWidth={2.5} />
			</a>
			<h1 class="font-headline text-base font-extrabold tracking-tight text-slate-900">
				{GAME_NAME}
			</h1>
		</header>
		<main class="mx-auto w-full max-w-lg px-4 py-6">
			<section
				class="shadow-card rounded-3xl border border-rose-200 bg-white p-6 text-center"
				role="alert"
			>
				<h2 class="font-headline text-lg font-black text-slate-900">Menu unavailable</h2>
				<p class="mt-2 text-sm text-slate-600">{menu.error}</p>
				{#if menu.missingHanzi.length > 0}
					<p class="mt-2 font-headline text-xs font-bold text-slate-500">
						Missing words: {menu.missingHanzi.join(' · ')}
					</p>
				{/if}
				<a
					href={resolve('/games')}
					class="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-5 font-headline text-sm font-bold text-white transition-colors hover:bg-indigo-700"
				>
					Back to games
				</a>
			</section>
		</main>
	</div>
{:else if phase === 'playing'}
	<div class="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900 select-none">
		<KitchenLine
			{menu}
			{soundEnabled}
			{highScore}
			onFinish={(result) => void recordRound(result)}
			onExit={() => goto(resolve('/games'))}
			onToggleSound={() => (soundEnabled = !soundEnabled)}
		/>
	</div>
{:else if summary}
	<div class="min-h-dvh bg-slate-50 font-sans text-slate-900 select-none">
		<header
			class="sticky top-0 z-40 flex items-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md"
		>
			<a
				href={resolve('/games')}
				aria-label="Back to Games"
				class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-xs transition-transform hover:bg-slate-50 active:scale-95"
			>
				<ChevronLeft size={20} strokeWidth={2.5} />
			</a>
			<h1 class="font-headline text-base font-extrabold tracking-tight text-slate-900">
				{GAME_NAME}
			</h1>
		</header>

		<main class="mx-auto w-full max-w-lg px-4 py-6">
			<section class="shadow-card rounded-3xl border border-slate-200/80 bg-white p-6 text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25"
				>
					<Trophy size={32} strokeWidth={2.5} />
				</div>

				<h2 class="mt-4 font-headline text-2xl font-black tracking-tight text-slate-900">
					{summary.headline}
				</h2>
				<p class="mt-1 text-xs text-slate-500">{summary.detail}</p>

				{#if isNewHighScore}
					<div
						class="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-headline text-xs font-black text-amber-900"
					>
						<Sparkles size={14} class="text-amber-600" />
						<span>New personal best!</span>
					</div>
				{/if}

				<div class="mt-5 grid grid-cols-2 gap-3">
					<div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
						<p class="font-headline text-xl font-black text-slate-900 tabular-nums">
							{summary.score.toLocaleString()}
						</p>
						<p class="text-[11px] font-medium text-slate-500">Score</p>
					</div>
					<div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
						<p class="font-headline text-xl font-black text-slate-900 tabular-nums">{accuracy}%</p>
						<p class="text-[11px] font-medium text-slate-500">Accuracy</p>
					</div>
					<div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
						<p class="font-headline text-xl font-black text-slate-900 tabular-nums">
							x{summary.maxCombo}
						</p>
						<p class="text-[11px] font-medium text-slate-500">Best combo</p>
					</div>
					<div class="rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
						<p class="font-headline text-xl font-black text-slate-900 tabular-nums">
							{summary.correct}
						</p>
						<p class="text-[11px] font-medium text-slate-500">Correct</p>
					</div>
				</div>

				{#if earnedXP > 0}
					<div
						class="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-3"
					>
						<Sparkles size={16} class="text-indigo-600" />
						<span class="font-headline text-base font-black text-indigo-700">+{earnedXP} XP</span>
					</div>
				{/if}

				<button
					type="button"
					onclick={replay}
					class="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 font-headline text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
				>
					Serve another order
				</button>
				<a
					href={resolve('/games')}
					class="mt-2 flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white font-headline text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98]"
				>
					Back to games
				</a>
			</section>
		</main>
	</div>
{/if}
