<template>
  <div class="space-y-4">
    <div v-if="!simbionteEvent" class="text-neutral-400 text-center text-xs">Nessuna trasformazione</div>
    
    <div v-else class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
      <!-- Player and Action -->
      <div class="flex items-center justify-center mb-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40">
          <span class="text-neutral-300 text-lg">🦠</span>
          <span class="text-xs font-medium text-neutral-300">{{ simbionteNames }} si è trasformato</span>
        </div>
      </div>
      
      <!-- Target Player -->
      <div class="flex flex-col items-center space-y-2 mb-4">
        <span class="text-xs text-neutral-400">Copiando il ruolo di:</span>
        <div class="px-3 py-2 rounded text-sm font-medium bg-neutral-800/60 border border-neutral-700/40">
          {{ simbionteEvent.targetPlayerName }}
        </div>
      </div>
      
      <!-- Chosen Role -->
      <div class="flex flex-col items-center space-y-2">
        <span class="text-xs text-neutral-400">Nuovo ruolo:</span>
        <div class="px-3 py-2 rounded text-sm font-medium"
             :style="{ 
               backgroundColor: getFactionColor(simbionteEvent.newRoleTeam) + '20',
               color: getFactionColor(simbionteEvent.newRoleTeam),
               border: `1px solid ${getFactionColor(simbionteEvent.newRoleTeam)}40`
             }">
          {{ simbionteEvent.newRoleName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../../factions';

const props = defineProps({
  gameState: { type: Object, required: true },
  entry: { type: Object, required: true },
  players: { type: Array, required: false },
  player: { type: Object, required: true }
});

const simbiontePlayers = computed(() => {
  if (props.entry && props.entry.playerIds) {
    const playerIds = props.entry.playerIds;
    const players = props.gameState.players.filter(p => playerIds.includes(p.id));
    return players;
  }
  
  const players = props.gameState.players.filter(p => p.roleId === 'simbionte');
  return players;
});

const simbionteNames = computed(() => {
  const simbionteList = simbiontePlayers.value;
  if (simbionteList.length === 0) {
    if (props.entry && props.entry.playerId) {
      const player = props.gameState.players.find(p => p.id === props.entry.playerId);
      return player ? player.name : 'Simbionte';
    }
    return 'Simbionte';
  }
  if (simbionteList.length === 1) return simbionteList[0].name;
  return simbionteList.map(g => g.name).join(', ');
});

const simbionteEvent = computed(() => {
  if (!props.entry || props.entry.type !== 'simbionte_transform') {
    return null;
  }
  
  return {
    message: props.entry.message,
    newRoleName: props.entry.newRoleName,
    newRoleTeam: props.entry.newRoleTeam,
    targetPlayerName: props.entry.targetPlayerName
  };
});

const getFactionColor = (team: string) => {
  const factionConfig = getFactionConfig(team);
  return factionConfig?.color || '#9ca3af';
};
</script>
