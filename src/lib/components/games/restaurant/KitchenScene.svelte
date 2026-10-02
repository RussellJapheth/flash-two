<script lang="ts">
	/**
	 * Fullscreen restaurant kitchen backdrop.
	 * Sits behind the cards across the entire screen and never intercepts taps.
	 */
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="pointer-events-none fixed inset-0 overflow-hidden {className}" aria-hidden="true">
	<!-- Atmospheric restaurant backdrop covering entire screen -->
	<img
		src="/images/restaurant/kitchen-bg.jpg"
		alt=""
		class="absolute inset-0 h-full w-full object-cover object-center select-none"
	/>
</div>
