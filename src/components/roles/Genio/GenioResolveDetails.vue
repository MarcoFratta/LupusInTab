<template>
  <div class="space-y-4">
    <div v-if="!genioEvent" class="text-neutral-400 text-center text-xs">{{ t('roleDetails.noTransformation') }}</div>
    
    <div v-else class="space-y-3">
      <!-- Players who used the role -->
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3">
        <div class="flex flex-wrap gap-1 justify-center">
          <span 
            v-for="player in genioPlayers" 
            :key="player.id"
            class="px-2 py-1 bg-neutral-800/60 border border-neutral-700/40 rounded text-xs text-neutral-200 max-w-full truncate"
            :title="player.name"
          >
            {{ player.name }}
          </span>
        </div>
        <div class="text-center text-neutral-300 text-sm mt-2">
          {{ genioPlayers.length === 1 ? t('roleDetails.transformed') : t('roleDetails.transformedPlural') }}
        </div>
      </div>
      
      <!-- Chosen Role -->
      <div class="flex flex-col items-center space-y-2 pb-4">
        <span class="text-xs text-neutral-400">{{ t('roleDetails.newRole') }}:</span>
        <div class="px-3 py-2 rounded text-sm font-medium"
             :style="{ 
               backgroundColor: getFactionColor(genioEvent.newRoleTeam) + '20',
               color: getFactionColor(genioEvent.newRoleTeam),
               border: `1px solid ${getFactionColor(genioEvent.newRoleTeam)}40`
             }">
          {{ getRoleDisplayName(genioEvent.newRoleId, t) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../../factions';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps({
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const genioPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const genioEvent = computed(() => {
  console.log('GenioResolveDetails - props.entry:', props.entry);
  console.log('GenioResolveDetails - entry.type:', props.entry?.type);
  
  if (!props.entry || props.entry.type !== 'genio_transform') {
    console.log('GenioResolveDetails - No genio_transform entry found');
    return null;
  }
  
  console.log('GenioResolveDetails - Valid genio_transform entry found:', props.entry);
  
  return {
    message: props.entry.message,
    newRoleName: props.entry.newRoleName,
    newRoleTeam: props.entry.newRoleTeam,
    newRoleId: props.entry.newRoleId || props.entry.newRoleName
  };
});

const getFactionColor = (team: string) => {
  const factionConfig = getFactionConfig(team);
  return factionConfig?.color || '#9ca3af';
};
</script>
