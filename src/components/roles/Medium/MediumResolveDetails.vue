<script setup lang="ts">
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { getFactionConfig } from '../../../factions';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

interface Props {
    gameState: any;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();

const investigationEvents = computed(() => {
    if (!props.entry || !props.entry.targetId) return [];
    
    return [props.entry];
});

const mediumPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const getFactionColor = (faction: string) => {
  const factionConfig = getFactionConfig(faction);
  return factionConfig?.color || '#9ca3af';
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="investigationEvents.length">
      <div v-for="event in investigationEvents" :key="'medium-' + event.playerId + '-' + (event.data?.target || 'no-target')" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="mediumPlayers"
          :right-player="event.targetId && props.gameState.players.find((p: any)=>p.id===Number(event.targetId))"
          :left-label="getRoleDisplayName('medium', t)"
          :right-label="t('resolveDetails.target')"
          :center-content="{
            action: mediumPlayers.length > 1 ? t('resolveDetails.sawPlural') : t('resolveDetails.saw')
          }"
        />
        
        <InvestigationResultCard 
          :title="t('resolveDetails.investigationResult')"
          :text="t('resolveDetails.playsFor')"
          :results="event.discoveredFaction"
          :color="getFactionColor(event.discoveredFaction)"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
