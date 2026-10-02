<script lang="ts">
	/**
	 * Subtle kitchen backdrop built from the baked Kenney Furniture Kit sprites.
	 * Decorative only: it sits behind the cards at low contrast (same pattern as
	 * the greeting hero backdrop) and never intercepts taps.
	 */
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="pointer-events-none absolute inset-0 overflow-hidden {className}" aria-hidden="true">
	<!-- Atmospheric restaurant backdrop -->
	<img
		src="/images/restaurant/kitchen-bg.jpg"
		alt=""
		class="absolute inset-0 h-full w-full object-cover object-center opacity-85 select-none"
	/>
	<div
		class="absolute inset-0 bg-linear-to-b from-amber-950/20 via-slate-900/10 to-amber-950/35 backdrop-blur-[0.5px]"
	></div>

	<!-- Back wall: extractor hood, cabinets and a television over the counter -->
	<img
		src="/images/restaurant/sprites/props/hoodLarge.png"
		alt=""
		class="absolute top-[6%] left-[4%] w-24 opacity-30 drop-shadow-sm select-none"
	/>
	<img
		src="/images/restaurant/sprites/props/kitchenCabinet.png"
		alt=""
		class="absolute top-[18%] right-[3%] w-28 opacity-30 drop-shadow-sm select-none"
	/>
	<img
		src="/images/restaurant/sprites/props/televisionModern.png"
		alt=""
		class="absolute top-[16%] left-[42%] w-16 opacity-15 select-none"
	/>

	<!-- Serving pass: the plated dish the player is filling -->
	<img
		src="/images/restaurant/sprites/food/plate.png"
		alt=""
		class="absolute bottom-[30%] left-1/2 w-40 -translate-x-1/2 opacity-15 select-none"
	/>

	<!-- Floor, table and seating -->
	<img
		src="/images/restaurant/sprites/props/floorFull.png"
		alt=""
		class="absolute right-0 bottom-0 left-0 w-full opacity-20 select-none"
	/>
	<img
		src="/images/restaurant/sprites/props/tableCloth.png"
		alt=""
		class="absolute bottom-[8%] left-[6%] w-24 opacity-25 select-none"
	/>
	<img
		src="/images/restaurant/sprites/props/chairRounded.png"
		alt=""
		class="absolute right-[10%] bottom-[6%] w-20 opacity-25 select-none"
	/>
	<img
		src="/images/restaurant/sprites/props/pottedPlant.png"
		alt=""
		class="absolute top-[46%] left-[6%] w-16 opacity-20 select-none"
	/>
</div>
