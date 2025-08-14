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
		<div class="muted">Villagers sleep peacefully. No action.</div>
		<button @click="submit">Continue</button>
	</div>
</template>


