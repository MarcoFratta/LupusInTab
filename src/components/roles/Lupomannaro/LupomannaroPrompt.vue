<script setup>
import { computed } from 'vue';
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';
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
    
    // Get the role of the first player in the group
    const currentPlayerRole = props.gameState.players.find(p => p.id === props.playerIds[0])?.roleId;
    
    return rolesInGame.filter(roleId => 
        roleId !== currentPlayerRole
    );
});
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerAndGuessRole') }}</p>
            </div>
        </div>
        
        <PromptDeclare
            :skippable="false"
            :gameState="props.gameState" 
            :playerIds="props.playerIds" 
            :onComplete="props.onComplete"
            :availablePlayers="availablePlayers"
            :availableRoles="availableRoles"
        />
    </div>
</template>

