<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import PlayerRoleCard from '../../ui/PlayerRoleCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: false }
});

const targetIds = computed(() => {
  if (!props.entry || !props.entry.targetIds) return [];
  return props.entry.targetIds.filter(id => Number.isFinite(id) && id > 0);
});

const parassitaPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

// Get all parassita names for display
const parassitaNames = computed(() => {
  const parassitaList = parassitaPlayers.value;
  if (parassitaList.length === 0) return '';
  if (parassitaList.length === 1) return parassitaList[0].name;
  return parassitaList.map(w => w.name).join(', ');
});

// For group roles, we need to create a representative player object
const representativeParassita = computed(() => {
  const parassitaList = parassitaPlayers.value;
  if (parassitaList.length === 0) return null;
  
  // Create a representative parassita object that shows all names
  return {
    ...parassitaList[0],
    name: parassitaNames.value, // Show all parassita names
    roleId: 'parassita'
  };
});

// Get the correct action text based on number of parassita
const infectAction = computed(() => {
  const parassitaList = parassitaPlayers.value;
  if (!parassitaList || parassitaList.length === 0) return 'ha infettato';
  return parassitaList.length === 1 ? 'ha infettato' : 'hanno infettato';
});

</script>

<template>
  <div class="space-y-4">
    <div v-if="!targetIds || targetIds.length === 0" class="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
      <p class="text-neutral-400 text-base font-medium">
        Nessuna infezione effettuata
      </p>
      <p class="text-neutral-500 text-sm mt-1">
        Il Parassita ha scelto di non infettare nessuno
      </p>
    </div>
    
    <div v-else class="space-y-3">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="representativeParassita"
        :right-player="targetIds.map(id => props.gameState.players.find(p => p.id === id)).filter(Boolean)"
        left-label="Parassita"
        right-label="Giocatori Infetti"
        :center-content="{
          action: infectAction
        }"
      />
      

    </div>
  </div>
</template>
