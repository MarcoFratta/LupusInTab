<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import PlayerRoleCard from '../../ui/PlayerRoleCard.vue';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps({ 
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: false }
});

const investigationTargets = computed(() => {
  if (!props.entry || !props.entry.investigationTargets) return [];
  return props.entry.investigationTargets.filter(id => Number.isFinite(id) && id > 0);
});

const investigationResult = computed(() => {
  return props.entry?.investigationResult;
});

const killTargetId = computed(() => {
  return props.entry?.killTargetId;
});

const lupoCiecoPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const lupoCiecoNames = computed(() => {
  const players = lupoCiecoPlayers.value;
  if (players.length === 0) return '';
  if (players.length === 1) return players[0].name;
  return players.map(p => p.name).join(', ');
});

const investigationAction = computed(() => {
  const players = lupoCiecoPlayers.value;
  if (!players || players.length === 0) return 'ha investigato';
  return players.length === 1 ? 'ha investigato' : 'hanno investigato';
});

const killingAction = computed(() => {
  const players = lupoCiecoPlayers.value;
  if (!players || players.length === 0) return 'ha ucciso';
  return players.length === 1 ? 'ha ucciso' : 'hanno ucciso';
});

const investigationResults = computed(() => {
  if (investigationResult.value === null) return '';
  return investigationResult.value ? 'SÌ' : 'NO';
});

const getResultColor = (result) => {
  return investigationResult.value ? '#22c55e' : '#ef4444'; // green for SÌ, red for NO
};
</script>

<template>
  <div class="space-y-4">
    <!-- Investigation Results -->
    <div v-if="!investigationTargets || investigationTargets.length === 0" class="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
      <p class="text-neutral-400 text-base font-medium">
        {{ t('resolveDetails.noInvestigationPerformed') }}
      </p>
      <p class="text-neutral-500 text-sm mt-1">
        {{ t('resolveDetails.lupoCiecoChoseNotToInvestigate') }}
      </p>
    </div>
    
    <div v-else class="space-y-3">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="lupoCiecoPlayers"
        :right-player="investigationTargets.map(id => props.gameState.players.find(p => p.id === id)).filter(Boolean)"
        :left-label="getRoleDisplayName('lupoCieco', t)"
        :right-label="t('resolveDetails.investigatedPlayers')"
        :center-content="{
          action: investigationAction
        }"
      />
      
      <!-- Investigation Result using InvestigationResultCard -->
      <InvestigationResultCard 
        :title="t('resolveDetails.investigationResult')"
        :text="t('resolveDetails.wolvesFound')"
        :results="investigationResults"
        :color="investigationResults.length > 0 ? getResultColor(investigationResults[0]) : '#9ca3af'"
      />
    </div>
    
    <!-- Killing Results -->
    <div v-if="killTargetId" class="space-y-3 mt-6">
      <div class="w-full h-px bg-neutral-700/40"></div>
      
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="lupoCiecoPlayers"
        :right-player="props.gameState.players.find(p => p.id === killTargetId)"
        :left-label="getRoleDisplayName('lupoCieco', t)"
        :right-label="t('resolveDetails.target')"
        :center-content="{
          action: killingAction
        }"
      />
    </div>
  </div>
</template>
