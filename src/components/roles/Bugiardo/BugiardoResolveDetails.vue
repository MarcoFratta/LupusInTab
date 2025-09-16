<script setup lang="ts">
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { getFactionConfig } from '../../../factions';
import { ROLES } from '../../../roles';
import {getRoleById} from "../../../utils/roleUtils";
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

const bugiardoEvents = computed(() => {
    if (!props.entry || !props.entry.targetId) return [];
    return [props.entry];
});

const bugiardoPlayers = computed(() => props.gameState.players.filter((p: any) => p.roleId === 'bugiardo'));

const getRoleColor = (roleId: string) => {
  const role = props.gameState.roles?.[roleId];
  return role?.color || '#9ca3af';
};
const getRoleName = (roleId: string) => {
  return getRoleDisplayName(roleId, t);
}
const getFactionColor = (roleId: string) => {
  const role = ROLES[roleId];
  if (!role?.team) return '#9ca3af';
  const factionConfig = getFactionConfig(role.team);
  return factionConfig?.color || '#9ca3af';
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="bugiardoEvents.length">
      <div v-for="event in bugiardoEvents" :key="'bg-' + event.playerId + '-' + event.targetId" class="space-y-2">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="bugiardoPlayers"
          :right-player="event.targetId && props.gameState.players.find((p: any)=>p.id===Number(event.targetId))"
          :left-label="getRoleDisplayName('bugiardo', t)"
          :right-label="t('resolveDetails.target')"
          :center-content="{
            action: bugiardoPlayers.length > 1 ? t('resolveDetails.sawPlural') : t('resolveDetails.saw')
          }"
        />
        
        <InvestigationResultCard 
          :title="t('resolveDetails.investigationResult')"
          :text="t('resolveDetails.hadRole')"
          :results="getRoleName(event.discoveredRole)"
          :color="getFactionColor(event.discoveredRole)"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
