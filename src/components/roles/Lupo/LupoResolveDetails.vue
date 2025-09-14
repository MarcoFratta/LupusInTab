<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

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


// Get the correct action text based on number of wolves
const attackAction = computed(() => {
  const wolvesList = wolves.value;
  if (!wolvesList || wolvesList.length === 0) return t('resolveDetails.attacked');
  return wolvesList.length === 1 ? t('resolveDetails.attacked') : t('resolveDetails.attackedPlural');
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="!wolfKills || wolfKills.length === 0" class="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
      <p class="text-neutral-400 text-base font-medium">
        {{ t('resolveDetails.noAttack') }}
      </p>
      <p class="text-neutral-500 text-sm mt-1">
        {{ t('resolveDetails.wolvesChoseNotToAttack') }}
      </p>
    </div>
    
    <div v-else class="space-y-3">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="wolves"
        :right-player="wolfKills.map(id => props.gameState.players.find(p => p.id === id)).filter(Boolean)"
        :left-label="t('resolveDetails.wolves')"
        :right-label="t('resolveDetails.targets')"
        :center-content="{
          action: attackAction
        }"
      />
    </div>
  </div>
</template>


