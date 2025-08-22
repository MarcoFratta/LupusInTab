<script setup>
const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: true },
	onComplete: { type: Function, required: true },
});

function submit() {
	props.onComplete({});
}
</script>

<template>
	<div class="stack center">
		<div class="muted">I paesani dormono tranquillamente. Nessuna azione.</div>
		<button @click="submit">Continua</button>
	</div>
</template>


