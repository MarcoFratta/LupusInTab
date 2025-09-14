<template>
  <div class="space-y-4">
    <div v-if="!simbionteEvent" class="text-neutral-400 text-center text-xs">{{ t('resolveDetails.noTransformation') }}</div>
    
    <div v-else class="space-y-4">
      <RoleComparisonCard
        :game-state="gameState"
        :left-player="simbiontePlayers"
        :right-player="targetRolePlayer"
        :left-label="getRoleDisplayName('simbionte', t)"
        :right-label="t('resolveDetails.target')"
        :center-content="{ action: simbionteActionText }"
      />
      
      <InvestigationResultCard 
        :title="t('resolveDetails.newRole')"
        :text="t('resolveDetails.transformedInto')"
        :results="getRoleDisplayName(simbionteEvent.newRoleId, t)"
        :color="getFactionColor(simbionteEvent.newRoleTeam)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../../factions';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps({
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const players = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const simbiontePlayers = computed(() => {
  const simbionteList = players.value;
  if (simbionteList.length === 0) {
    if (props.entry && props.entry.playerId) {
      const player = props.gameState.players.find((p: any) => p.id === props.entry.playerId);
      return player ? [{ ...player, roleId: props.entry.oldRoleId || 'simbionte' }] : [{ name: 'Simbionte', roleId: 'simbionte' }];
    }
    return [{ name: 'Simbionte', roleId: 'simbionte' }];
  }
  // Return array of players with updated roleId
  return simbionteList.map((player: any) => ({
    ...player,
    roleId: props.entry.oldRoleId || 'simbionte'
  }));
});

const simbionteActionText = computed(() => {
  const simbionteList = players.value;
  if (simbionteList.length === 0) return t('resolveDetails.copied');
  if (simbionteList.length === 1) return t('resolveDetails.copied');
  return t('resolveDetails.copiedPlural');
});

const targetRolePlayer = computed(() => {
  if (!props.entry?.targetPlayerId || !props.entry?.targetPlayerName) return null;
  
  const targetPlayer = props.gameState.players.find((p: any) => p.id === props.entry.targetPlayerId);
  if (!targetPlayer) return null;
  
  return targetPlayer;
});

const simbionteEvent = computed(() => {
  if (!props.entry || props.entry.type !== 'simbionte_transform') {
    return null;
  }
  
  return {
    message: props.entry.message,
    newRoleName: props.entry.newRoleName,
    newRoleTeam: props.entry.newRoleTeam,
    targetPlayerName: props.entry.targetPlayerName,
    newRoleId: props.entry.newRoleId || props.entry.newRoleName
  };
});

const getFactionColor = (team: string) => {
  const factionConfig = getFactionConfig(team);
  return factionConfig?.color || '#9ca3af';
};
</script>
