<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

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

const targetPlayer = computed(() => {
  if (!props.entry || !props.entry.targetId) return null;
  return props.gameState.players.find((p) => p.id === props.entry.targetId);
});

</script>

<template>
  <div class="space-y-4">
    <div v-if="redirectInfo && targetPlayer" class="space-y-2">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="ammaestratorePlayers"
        :right-player="targetPlayer"
        :left-label="t('resolveDetails.ammaestratore')"
        :right-label="t('resolveDetails.target')"
        :center-content="{
          action: redirectInfo.result === 'blocked' ? t('resolveDetails.blockedAttacks') : t('resolveDetails.redirectedAttacksTo')
        }"
      />
    </div>
  </div>
</template>
