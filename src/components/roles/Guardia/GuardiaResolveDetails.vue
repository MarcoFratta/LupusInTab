<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps({ 
  gameState: { type: Object, required: true }, 
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const doctorChoices = computed(() => {
  if (!props.entry || !props.entry.targetId) return [];
  
  const targetId = Number(props.entry.targetId);
  if (Number.isFinite(targetId) && targetId > 0) {
    return [{ target: targetId }];
  }
  
  return [];
});

const guardiaPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

</script>

<template>
  <div class="space-y-4">
    <div v-if="doctorChoices.length" class="space-y-2">
      <div v-for="s in doctorChoices" :key="'dc-' + s.target" class="space-y-2">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="guardiaPlayers"
          :right-player="props.gameState.players.find((p)=>p.id===s.target)"
          :left-label="getRoleDisplayName('guardia', t)"
          :right-label="t('resolveDetails.target')"
          :center-content="{
            action: t('resolveDetails.protected')
          }"
        />
      </div>
    </div>
  </div>
</template>

