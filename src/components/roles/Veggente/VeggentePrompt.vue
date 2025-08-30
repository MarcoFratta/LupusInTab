<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';
import { ROLES } from '../../../roles';

const props = defineProps<{ gameState: any, player: any, playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const selectable = computed(() => props.gameState.players.filter((p: any) => p.alive && p.id !== props.player?.id && !props.playerIds.includes(p.id)));
const choices = computed(() => [
	{ label: 'Seleziona un giocatore…', value: null },
	...selectable.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<p class="text-neutral-400 text-base font-medium">Controlla la fazione di un giocatore</p>
		</div>
		
		<PromptSelect
			label="Chi vuoi controllare?"
			v-model="targetId"
			:choices="choices"
			buttonText="Conferma selezione"
			accent="violet"
			:disabled="!choices.length"
			@confirm="submit"
		>
			<DisplayFaction
				:game-state="gameState"
				:target-id="targetId"
				discovery-text="Ha scoperto che"
			/>
		</PromptSelect>
	</div>
</template>


