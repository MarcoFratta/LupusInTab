<script setup lang="ts">
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { getFactionConfig } from '../../../factions';

interface Props {
    gameState: any;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();

const investigationEvents = computed(() => {
    if (!props.entry || !props.entry.targetId) return [];
    
    return [props.entry];
});

const mediumPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const representativeMedium = computed(() => {
  const mediumList = mediumPlayers.value;
  if (mediumList.length === 0) return null;
  
  return {
    ...mediumList[0],
    name: mediumList.length === 1 ? mediumList[0].name : mediumList.map((m: any) => m.name).join(', '),
    roleId: 'medium'
  };
});

const getFactionColor = (faction: string) => {
  const factionConfig = getFactionConfig(faction);
  return factionConfig?.color || '#9ca3af';
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="investigationEvents.length">
      <div v-for="event in investigationEvents" :key="'medium-' + event.playerId + '-' + (event.data?.target || 'no-target')" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeMedium"
          :right-player="event.targetId && props.gameState.players.find((p: any)=>p.id===Number(event.targetId))"
          left-label="Medium"
          right-label="Bersaglio"
          :center-content="{
            action: mediumPlayers.length > 1 ? 'hanno visto' : 'ha visto'
          }"
        />
        
        <InvestigationResultCard 
          title="Risultato Investigazione"
          text="gioca per"
          :results="event.discoveredFaction"
          :color="getFactionColor(event.discoveredFaction)"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
