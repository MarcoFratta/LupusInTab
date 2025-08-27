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

const witchPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeWitch = computed(() => {
  const witchList = witchPlayers.value;
  if (witchList.length === 0) return null;
  
  // Create a representative witch object that shows all names
  return {
    ...witchList[0],
    name: witchList.length === 1 ? witchList[0].name : witchList.map(w => w.name).join(', '),
    roleId: 'witch'
  };
});


</script>

<template>
  <div class="space-y-4">
    <template v-if="investigationEvents.length">
      <div v-for="event in investigationEvents" :key="'witch-' + event.playerId + '-' + event.data.target" class="space-y-3">
        <!-- Player Comparison Row using RoleComparisonCard -->
        <RoleComparisonCard
          v-if="representativeWitch"
          :game-state="props.gameState"
          :left-player="representativeWitch"
          :right-player="props.gameState.players.find((p)=>p.id===event.targetId)"
          left-label="Strega"
          right-label="Bersaglio"
          :center-content="{
            action: 'ha controllato'
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



