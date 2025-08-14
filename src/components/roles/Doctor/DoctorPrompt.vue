<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps<{ gameState: any, player: any, onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const choices = computed(() => {
	const alive = props.gameState.players.filter((p: any) => p.alive);
	return [
		{ label: 'No one', value: null },
		...alive.map((p: any) => ({ label: p.name, value: p.id }))
	];
});

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<PromptSelect
		label="Choose a player to save"
		v-model="targetId"
		:choices="choices"
		buttonText="Confirm"
		accent="emerald"
		@confirm="submit"
	/>
</template>


