<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true }, 
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const sonnambuloChoices = computed(() => {
  if (!props.entry || !props.entry.targetId) return [];
  
  const targetId = Number(props.entry.targetId);
  if (Number.isFinite(targetId) && targetId > 0) {
    return [{ target: targetId }];
  }
  
  return [];
});

const sonnambuloPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeSonnambulo = computed(() => {
  const sList = sonnambuloPlayers.value;
  if (sList.length === 0) return null;
  
  return {
    ...sList[0],
    name: sList.length === 1 ? sList[0].name : sList.map(s => s.name).join(', '),
    roleId: 'sonnambulo'
  };
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="sonnambuloChoices.length" class="space-y-3">
      <div v-for="s in sonnambuloChoices" :key="'sc-' + props.player.id + '-' + s.target" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeSonnambulo"
          :right-player="props.gameState.players.find((p)=>p.id===s.target)"
          left-label="Sonnambulo"
          right-label="Casa di"
          :center-content="{
            action: 'è andato a dormire da'
          }"
        />
      </div>
    </div>
  </div>
</template>
