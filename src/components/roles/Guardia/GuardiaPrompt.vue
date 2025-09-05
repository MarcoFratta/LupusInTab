<script setup>
import { computed } from 'vue';
import { useGameStore } from '../../../stores/game';
import GenericTargetSelectPrompt from '../../ui/prompts/GenericTargetSelectPrompt.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const store = useGameStore();
const state = store.state;

const choices = computed(() => {
	const alivePlayers = state.players.filter((p) => 
		p && p.alive
	);
	
	return alivePlayers.map((p) => ({
		label: p.name,
		value: p.id
	}));
});

function handleComplete(data) {
	const result = { 
		targetId: data.targetId || 0,
		saverRole: 'guardia',
		saverPlayerId: props.playerIds[0] || 0
	};
	props.onComplete(result);
}
</script>

<template>
	<GenericTargetSelectPrompt
		title="Guardia"
		description="Scegli un giocatore da proteggere questa notte"
		label="Scegli un giocatore da salvare"
		buttonText="Conferma"
		accent="emerald"
		:choices="choices"
		@complete="handleComplete"
	/>
</template>


