<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';
import { ROLES } from '../../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true },
});

const availablePlayers = computed(() => 
    props.gameState.players.filter(p => 
        p.alive && 
        p.id !== props.player.id && 
        !props.playerIds.includes(p.id)
    )
);

const availableRoles = computed(() => {
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))];
    
    return rolesInGame.filter(roleId => 
        roleId !== props.player.roleId && 
        roleId !== 'lupo'
    );
});
</script>

<template>
    <PromptDeclare 
        :gameState="props.gameState" 
        :player="props.player" 
        :onComplete="props.onComplete"
        :availablePlayers="availablePlayers"
        :availableRoles="availableRoles"
    />
</template>

