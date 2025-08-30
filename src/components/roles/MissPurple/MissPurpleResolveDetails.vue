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

const misspurpleEvents = computed(() => {
    if (!props.entry || !props.entry.lupiCount) return [];
    return [props.entry];
});

const misspurplePlayers = computed(() => props.gameState.players.filter(p => p.roleId === 'misspurple'));

const representativeMissPurple = computed(() => {
  const misspurpleList = misspurplePlayers.value;
  if (misspurpleList.length === 0) return null;
  
  return {
    ...misspurpleList[0],
    name: misspurpleList.length === 1 ? misspurpleList[0].name : misspurpleList.map(m => m.name).join(', '),
    roleId: 'misspurple'
  };
});
</script>

<template>
  <div class="space-y-4">
    <template v-if="misspurpleEvents.length">
      <div v-for="event in misspurpleEvents" :key="'mp-' + event.playerId + '-' + event.nightNumber" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeMissPurple"
          :right-player="null"
          left-label="Miss Purple"
          right-label=""
          :center-content="{
            action: misspurplePlayers.length > 1 ? 'hanno scoperto' : 'ha scoperto'
          }"
        />
        
        <InvestigationResultCard 
          title="Risultato Investigazione"
          text="lupi nel villaggio"
          :results="event.lupiCount"
          color="#9333ea"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
