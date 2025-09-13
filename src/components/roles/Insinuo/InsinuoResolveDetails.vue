<template>
    <div class="space-y-4 mb-2">
        <div v-if="insinuoEvent" class="space-y-3">
            <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3">
                <div class="flex flex-wrap gap-1 justify-center">
                    <span 
                        v-for="player in insinuoPlayers" 
                        :key="player.id"
                        class="px-2 py-1 bg-neutral-800/60 border border-neutral-700/40 rounded text-xs text-neutral-200 max-w-full truncate"
                        :title="player.name"
                    >
                        {{ player.name }}
                    </span>
                </div>
                <div class="text-center text-neutral-300 text-sm mt-2">
                    ha insinuato:
                </div>
            </div>
            
            <div class="text-center space-y-1.5">
                <div class="text-neutral-100 font-medium truncate max-w-full" :title="getTargetName(insinuoEvent.targetId)">{{ getTargetName(insinuoEvent.targetId) }}</div>
                <FactionComparisonCard 
                    :current-team="insinuoEvent.previousFaction || 'villaggio'"
                    :next-team="insinuoEvent.newFaction || 'villaggio'"
                />
            </div>
        </div>
        
        <div v-else class="text-center text-neutral-400 text-sm">
            Nessun giocatore è stato insinuato questa notte.
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameState } from '../../../types';
import FactionComparisonCard from '../../ui/FactionComparisonCard.vue';

interface Props {
    gameState: GameState;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();

const insinuoEvent = computed(() => {
    return props.entry;
});

const insinuoPlayers = computed(() => {
    if (!props.entry || !props.entry.playerIds) return [];
    return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const getTargetName = (targetId: number) => {
    const player = props.gameState.players.find((p: any) => p.id === targetId);
    return player?.name || 'Unknown';
};
</script>
