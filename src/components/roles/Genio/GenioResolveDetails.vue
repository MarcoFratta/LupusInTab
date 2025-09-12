<template>
  <div class="space-y-4">
    <div v-if="!genioEvent" class="text-neutral-400 text-center text-xs">Nessuna trasformazione</div>
    
    <div v-else class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
      <!-- Player and Action -->
      <div class="flex items-center justify-center mb-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/60 border border-neutral-700/40">
          <span class="text-neutral-300 text-lg">🧞‍♂️</span>
          <span class="text-xs font-medium text-neutral-300">{{ genioNames }} {{ players.length === 1 ? 'si è trasformato' : 'si sono trasformati' }}</span>
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

const players = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const genioNames = computed(() => {
  const genioList = players.value;
  if (genioList.length === 0) {
    return 'Genio della Lampada';
  }
  if (genioList.length === 1) return genioList[0].name;
  return genioList.map((g: any) => g.name).join(', ');
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
