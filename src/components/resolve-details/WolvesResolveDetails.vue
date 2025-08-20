<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true },
  nightNumber: { type: Number, required: false }
});

const wolfKills = computed(() => {
  const nightNumber = props.nightNumber || props.gameState?.nightNumber;
  if (!nightNumber) return [];
  
  // Access the new night-based history structure (map)
  const nightEvents = props.gameState.history?.[nightNumber] || {};
  const targetIds = [];
  
  // Look for wolf actions in the night history
  for (const [playerId, action] of Object.entries(nightEvents)) {
    if (action && action.type === 'wolf_attack') {
      const targetId = Number(action.data?.target);
      if (Number.isFinite(targetId) && targetId > 0) {
        targetIds.push(targetId);
      }
    }
  }
  
  return targetIds;
});

const wolves = computed(() => props.gameState.players.filter((p) => p.roleId === 'wolf'));

// Get all wolf names for display
const wolfNames = computed(() => {
  const wolvesList = wolves.value;
  if (wolvesList.length === 0) return '';
  if (wolvesList.length === 1) return wolvesList[0].name;
  return wolvesList.map(w => w.name).join(', ');
});

// For group roles, we need to create a representative player object
const representativeWolf = computed(() => {
  const wolvesList = wolves.value;
  if (wolvesList.length === 0) return null;
  
  // Create a representative wolf object that shows all names
  return {
    ...wolvesList[0],
    name: wolfNames.value, // Show all wolf names
    roleId: 'wolf'
  };
});

// Get the correct action text based on number of wolves
const attackAction = computed(() => {
  const wolvesList = wolves.value;
  if (!wolvesList || wolvesList.length === 0) return 'ha attaccato';
  return wolvesList.length === 1 ? 'ha attaccato' : 'hanno attaccato';
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="!wolfKills || wolfKills.length === 0" class="text-slate-400">Nessun attacco effettuato.</div>
    <div v-else class="space-y-3">
      <div v-for="targetId in wolfKills" :key="targetId" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeWolf"
          :right-player="props.gameState.players.find(p=>p.id===targetId)"
          left-label="Lupi"
          right-label="Bersaglio"
          :center-content="{
            action: attackAction
          }"
        />
      </div>
    </div>
  </div>
</template>


