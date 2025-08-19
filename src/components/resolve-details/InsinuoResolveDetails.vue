<template>
    <div class="space-y-4 mb-2">
        <div v-if="insinuoEvent" class="text-center space-y-1.5">
            <div class="text-neutral-300 text-sm">Hai insinuato:</div>
            <div class="text-neutral-100 font-medium">{{ getTargetName(insinuoEvent.data.target) }}</div>
            <FactionComparisonCard 
                :current-team="insinuoEvent.data.previousFaction"
                :next-team="insinuoEvent.data.newFaction"
            />
        </div>
        
        <div v-else class="text-center text-neutral-400 text-sm">
            Nessun giocatore è stato insinuato questa notte.
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameState } from '../../../stores/game';
import FactionComparisonCard from '../ui/FactionComparisonCard.vue';

interface Props {
    gameState: GameState;
    entry: any;
}

const props = defineProps<Props>();

const insinuoEvent = computed(() => {
    const playerId = props.entry?.playerId;
    const nightNumber = props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'insinuo_effect' ? nightEvents[playerId] : null;
});

const getTargetName = (targetId: number) => {
    const player = props.gameState.players.find((p: any) => p.id === targetId);
    return player?.name || 'Unknown';
};

</script>
