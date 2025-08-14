<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: false },
	onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => p.alive && props.gameState.roleMeta[p.roleId]?.team !== 'wolf'));
const choices = computed(() => [
	{ label: 'Select a player…', value: null },
	...selectable.value.map((p) => ({ label: p.name, value: p.id }))
]);

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

function submit() {
	if (!canSubmit.value) return;
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
    <PromptSelect
        label="Lupi, scegliete una vittima"
		v-model="targetId"
		:choices="choices"
        buttonText="Conferma"
		accent="red"
		:disabled="!canSubmit && choices.length === 0"
		@confirm="submit"
	/>
</template>


