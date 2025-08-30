<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps<{ gameState: any, player: any, playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const choices = computed(() => {
	const alive = props.gameState.players.filter((p: any) => p.alive);
	return [
		{ label: 'Nessuno', value: null },
		...alive.map((p: any) => ({ label: p.name, value: p.id }))
	];
});

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<p class="text-neutral-400 text-base font-medium">Scegli un giocatore da proteggere questa notte</p>
		</div>
		
		<PromptSelect
			label="Scegli un giocatore da salvare"
			v-model="targetId"
			:choices="choices"
			buttonText="Conferma"
			accent="emerald"
			@confirm="submit"
		/>
	</div>
</template>


