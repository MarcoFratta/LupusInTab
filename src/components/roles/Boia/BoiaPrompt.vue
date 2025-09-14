<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';
import { ROLES } from '../../../roles';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

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
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerAndGuessRole') }}</p>
            </div>
            <p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.condemnPlayerOrRevealRole') }}</p>
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

