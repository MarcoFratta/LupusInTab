<template>
  <div class="space-y-4">
    <div v-if="!genioEvent" class="text-neutral-400 text-center text-xs">Nessuna trasformazione</div>
    
    <div v-else class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
      <!-- Player and Action -->
      <div class="flex items-center justify-center mb-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40">
          <span class="text-neutral-300 text-lg">🧞‍♂️</span>
          <span class="text-xs font-medium text-neutral-300">{{ genioNames }} si è trasformato</span>
        </div>
      </div>
      
      <!-- Chosen Role -->
      <div class="flex flex-col items-center space-y-2">
        <span class="text-xs text-neutral-400">Nuovo ruolo:</span>
        <div class="px-3 py-2 rounded text-sm font-medium"
             :style="{ 
               backgroundColor: getFactionColor(genioEvent.newRoleTeam) + '20',
               color: getFactionColor(genioEvent.newRoleTeam),
               border: `1px solid ${getFactionColor(genioEvent.newRoleTeam)}40`
             }">
          {{ genioEvent.newRoleName }}
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

const genioPlayers = computed(() => {
  // After transformation, the player is no longer a genio, so we need to use the entry data
  if (props.entry && props.entry.playerIds) {
    const playerIds = props.entry.playerIds;
    const players = props.gameState.players.filter(p => playerIds.includes(p.id));
    console.log('GenioResolveDetails - genioPlayers from entry:', players);
    return players;
  }
  
  // Fallback: look for current genio players (shouldn't find any after transformation)
  const players = props.gameState.players.filter(p => p.roleId === 'genio');
  console.log('GenioResolveDetails - genioPlayers fallback found:', players);
  return players;
});

const genioNames = computed(() => {
  const genioList = genioPlayers.value;
  if (genioList.length === 0) {
    // If no players found, try to get the name from the entry
    if (props.entry && props.entry.playerId) {
      const player = props.gameState.players.find(p => p.id === props.entry.playerId);
      return player ? player.name : 'Genio della Lampada';
    }
    return 'Genio della Lampada';
  }
  if (genioList.length === 1) return genioList[0].name;
  return genioList.map(g => g.name).join(', ');
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
    newRoleTeam: props.entry.newRoleTeam
  };
});

const getFactionColor = (team: string) => {
  const factionConfig = getFactionConfig(team);
  return factionConfig?.color || '#9ca3af';
};
</script>
