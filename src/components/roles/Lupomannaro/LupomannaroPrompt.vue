<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const availablePlayers = computed(() => 
    props.gameState.players.filter(p => 
        p.alive && 
        p.id !== props.player.id && 
        p.roleId !== 'lupomannaro'
    )
);

const availableRoles = computed(() => {
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))];
    
    return rolesInGame.filter(roleId => 
        roleId !== props.player.roleId && 
        roleId !== 'lupomannaro'
    );
});
</script>

<template>
    <PromptDeclare
        :skippable="false"
        :gameState="props.gameState" 
        :player="props.player" 
        :onComplete="props.onComplete"
        :availablePlayers="availablePlayers"
        :availableRoles="availableRoles"
    />
</template>

