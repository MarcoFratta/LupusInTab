<template>
    <div class="space-y-4 mb-2">
        <div v-if="insinuoEvent" class="text-center space-y-1.5">
            <div class="text-neutral-300 text-sm">{{ representativeInsinuo?.name }} ha insinuato:</div>
            <div class="text-neutral-100 font-medium">{{ getTargetName(insinuoEvent.targetId) }}</div>
            <FactionComparisonCard 
                :current-team="insinuoEvent.previousFaction || 'villaggio'"
                :next-team="insinuoEvent.newFaction || 'villaggio'"
            />
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

const insinuoPlayers = computed(() => props.gameState.players.filter((p: any) => p.roleId === 'insinuo'));

const representativeInsinuo = computed(() => {
  const insinuoList = insinuoPlayers.value;
  if (insinuoList.length === 0) return null;
  
  return {
    ...insinuoList[0],
    name: insinuoList.length === 1 ? insinuoList[0].name : insinuoList.map((i: any) => i.name).join(', '),
    roleId: 'insinuo'
  };
});

const getTargetName = (targetId: number) => {
    const player = props.gameState.players.find((p: any) => p.id === targetId);
    return player?.name || 'Unknown';
};
</script>
