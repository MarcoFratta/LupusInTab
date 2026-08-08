<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps<{ gameState: any, playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const choices = computed(() => {
	const alive = props.gameState.players.filter((p: any) => p.alive && !props.playerIds.includes(p.id));
	return alive.map((p: any) => ({ label: p.name, value: p.id }));
});

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<p class="text-neutral-400 text-base font-medium">Scegli da quale giocatore andare a dormire questa notte.</p>
		</div>
		
		<PromptSelect
			label="Scegli un giocatore"
			v-model="targetId"
			:choices="choices"
			buttonText="Conferma"
			accent="blue"
			@confirm="submit"
		/>
	</div>
</template>
