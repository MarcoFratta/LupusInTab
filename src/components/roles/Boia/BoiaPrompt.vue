<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';
import { ROLES } from '../../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const availablePlayers = computed(() => 
    props.gameState.players.filter(p => 
        p.alive && 
        p.id !== props.player.id && 
        p.roleId !== 'boia'
    )
);

const availableRoles = computed(() => {
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))];
    
    return rolesInGame.filter(roleId => 
        roleId !== props.player.roleId && 
        roleId !== 'lupo' && 
        roleId !== 'boia'
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

