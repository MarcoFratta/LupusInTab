<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: false }
});

const wolfKills = computed(() => {
  // The entry is now the role-specific history object
  if (!props.entry || !props.entry.targetIds) return [];
  
  return props.entry.targetIds.filter(id => Number.isFinite(id) && id > 0);
});

const wolves = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

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
    roleId: 'lupo'
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
    <div v-if="!wolfKills || wolfKills.length === 0" class="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
      <p class="text-neutral-400 text-base font-medium">
        Nessun attacco effettuato
      </p>
      <p class="text-neutral-500 text-sm mt-1">
        I Lupi hanno scelto di non attaccare nessuno
      </p>
    </div>
    
    <div v-else class="space-y-3">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="representativeWolf"
        :right-player="wolfKills.map(id => props.gameState.players.find(p => p.id === id)).filter(Boolean)"
        left-label="Lupi"
        right-label="Bersagli"
        :center-content="{
          action: attackAction
        }"
      />
    </div>
  </div>
</template>


