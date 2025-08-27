<script setup lang="ts">
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';

interface Props {
    gameState: any;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();

const investigationEvents = computed(() => {
    // The entry is now the role-specific history object
    if (!props.entry || !props.entry.targetId) return [];
    
    return [props.entry];
});

const veggentePlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeVeggente = computed(() => {
  const veggenteList = veggentePlayers.value;
  if (veggenteList.length === 0) return null;
  
  // Create a representative veggente object that shows all names
  return {
    ...veggenteList[0],
    name: veggenteList.length === 1 ? veggenteList[0].name : veggenteList.map(v => v.name).join(', '),
    roleId: 'veggente'
  };
});


</script>

<template>
  <div class="space-y-4">
    <template v-if="investigationEvents.length">
      <div v-for="event in investigationEvents" :key="'mc-' + event.playerId + '-' + (event.data?.target || 'no-target')" class="space-y-3">
        <!-- Player Comparison Row using RoleComparisonCard -->
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeVeggente"
          :right-player="event.targetId && props.gameState.players.find((p)=>p.id===Number(event.targetId))"
          left-label="Veggente"
          right-label="Bersaglio"
          :center-content="{
            action: veggentePlayers.length > 1 ? 'hanno visto' : 'ha visto'
          }"
        />
        
        <!-- Investigation Result using reusable component -->
        <InvestigationResultCard 
          :discovered-faction="event.discoveredFaction"
          title="Risultato Investigazione"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>