<script setup>
const props = defineProps({
	gameState: { type: Object, required: true },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true }
});

function submit() {
	props.onComplete({});
}
</script>

<template>
	<div class="stack center">
		<div class="muted">I massoni dormono tranquillamente. Nessuna azione.</div>
		<button @click="submit">Continua</button>
	</div>
</template>

