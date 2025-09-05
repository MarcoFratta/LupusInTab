<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';
import { ROLES } from '../../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const availablePlayers = computed(() => 
    props.gameState.players.filter(p => 
        p.alive && 
        !props.playerIds.includes(p.id)
    )
);

const availableRoles = computed(() => {
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))];
    
    return rolesInGame
});
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <p class="text-neutral-400 text-base font-medium">Condanna un giocatore o rivela un ruolo</p>
        </div>
        
        <PromptDeclare 
            :gameState="props.gameState" 
            :playerIds="props.playerIds" 
            :onComplete="props.onComplete"
            :availablePlayers="availablePlayers"
            :availableRoles="availableRoles"
        />
    </div>
</template>

