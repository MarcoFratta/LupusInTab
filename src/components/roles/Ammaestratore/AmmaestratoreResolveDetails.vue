<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({ 
  gameState: { type: Object, required: true }, 
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const redirectInfo = computed(() => {
  if (!props.entry || !props.entry.targetId) return null;
  
  const targetId = Number(props.entry.targetId);
  if (!Number.isFinite(targetId) || targetId <= 0) return null;
  
  const redirectData = props.entry.redirectInfo;
  if (!redirectData || redirectData.targetId !== targetId) return null;
  
  return redirectData;
});

const ammaestratorePlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeAmmaestratore = computed(() => {
  const ammaestratoreList = ammaestratorePlayers.value;
  if (ammaestratoreList.length === 0) return null;
  
  return {
    ...ammaestratoreList[0],
    name: ammaestratoreList.length === 1 ? ammaestratoreList[0].name : ammaestratoreList.map(a => a.name).join(', '),
    roleId: 'ammaestratore'
  };
});

const targetPlayer = computed(() => {
  if (!props.entry || !props.entry.targetId) return null;
  return props.gameState.players.find((p) => p.id === props.entry.targetId);
});


</script>

<template>
  <div class="space-y-4">
    <div v-if="redirectInfo && targetPlayer" class="space-y-3">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="representativeAmmaestratore"
        :right-player="targetPlayer"
        left-label="Ammaestratore"
        right-label="Bersaglio"
        :center-content="{
          action: redirectInfo.result === 'blocked' ? 'ha bloccato gli attacchi' : 'ha reindirizzato gli attacchi verso'
        }"
      />
      
      <div v-if="redirectInfo.result === 'blocked'" class="text-center">
        <p class="text-sm text-neutral-600">Nessuno è morto questa notte</p>
      </div>
    </div>
  </div>
</template>
