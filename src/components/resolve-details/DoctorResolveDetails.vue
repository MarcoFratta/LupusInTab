<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true }, 
  player: { type: Object, required: true },
  nightNumber: { type: Number, required: false }
});

const doctorChoices = computed(() => {
  const nightNumber = props.nightNumber || props.gameState?.nightNumber;
  if (!nightNumber) return [];
  
  // Access the new night-based history structure (map)
  const nightEvents = props.gameState.history?.[nightNumber] || {};
  const playerAction = nightEvents[props.player.id];
  
  if (playerAction && playerAction.type === 'doctor_protection') {
    const targetId = Number(playerAction.data?.target);
    if (Number.isFinite(targetId) && targetId > 0) {
      return [{ target: targetId }];
    }
  }
  
  return [];
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="doctorChoices.length" class="space-y-3">
      <div v-for="s in doctorChoices" :key="'dc-' + props.player.id + '-' + s.target" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="props.player"
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


