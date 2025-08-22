<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true }, 
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const doctorChoices = computed(() => {
  // The entry is now the role-specific history object
  if (!props.entry || !props.entry.targetId) return [];
  
  const targetId = Number(props.entry.targetId);
  if (Number.isFinite(targetId) && targetId > 0) {
    return [{ target: targetId }];
  }
  
  return [];
});

const guardiaPlayers = computed(() => props.gameState.players.filter(p => p.roleId === 'guardia'));

const representativeGuardia = computed(() => {
  const guardiaList = guardiaPlayers.value;
  if (guardiaList.length === 0) return null;
  
  // Create a representative guardia object that shows all names
  return {
    ...guardiaList[0],
    name: guardiaList.length === 1 ? guardiaList[0].name : guardiaList.map(g => g.name).join(', '),
    roleId: 'guardia'
  };
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="doctorChoices.length" class="space-y-3">
      <div v-for="s in doctorChoices" :key="'dc-' + props.player.id + '-' + s.target" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeGuardia"
          :right-player="props.gameState.players.find((p)=>p.id===s.target)"
          left-label="Guardia"
          right-label="Bersaglio"
          :center-content="{
            action: 'ha protetto'
          }"
        />
      </div>
    </div>
  </div>
</template>


