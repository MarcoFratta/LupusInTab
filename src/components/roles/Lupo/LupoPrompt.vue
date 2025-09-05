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
		p && p.alive && !props.playerIds.includes(p.id)
	);

	return alivePlayers.map((p) => ({
		label: p.name,
		value: p.id
	}));
});

function handleComplete(data) {
	const result = { 
		targetIds: data.targetId ? [data.targetId] : [],
		targetId: data.targetId || 0,
		killerRole: 'lupo',
		killerPlayerId: props.playerIds[0] || 0
	};
	props.onComplete(result);
}
</script>

<template>
    <GenericTargetSelectPrompt
        title="Lupo"
        description="Scegliete una vittima da eliminare questa notte"
        label="Chi vuoi eliminare?"
        buttonText="Conferma selezione"
        accent="red"
        :choices="choices"
        @complete="handleComplete"
    />
</template>


