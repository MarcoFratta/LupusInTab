<script setup lang="ts">
import { computed } from 'vue';
import PlayerRoleCard from '../ui/PlayerRoleCard.vue';
import { getFactionConfig } from '../../factions';

interface Props {
    gameState: any;
    player: any;
    nightNumber?: number;
}

const props = defineProps<Props>();

const investigationEvents = computed(() => {
    const playerId = props.player?.id;
    const nightNumber = props.nightNumber || props.gameState?.nightNumber;
    if (!playerId || !nightNumber) return [];
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
        const playerAction = nightEvents[playerId];
    return playerAction && playerAction.type === 'veggente_investigation' ? [playerAction] : [];
  });

const getFactionDisplay = (faction: string) => {
    const factionConfig = getFactionConfig(faction);
    return {
        name: factionConfig?.displayName || faction,
        color: factionConfig?.color || '#9ca3af'
    };
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="investigationEvents.length">
      <div v-for="event in investigationEvents" :key="'mc-' + event.playerId + '-' + event.data.target" class="space-y-3">
        <!-- Player Info Row - Always horizontal -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 w-full">
          <PlayerRoleCard 
            :game-state="props.gameState" 
            :player="props.player" 
            label="Veggente"
            align="left"
          />
          <div class="text-neutral-400 text-lg text-center">→</div>
          <PlayerRoleCard 
            :game-state="props.gameState" 
            :player="props.gameState.players.find((p)=>p.id===event.data.target)" 
            label="Bersaglio"
            align="right"
          />
        </div>
        
        <!-- Investigation Result Card - Always below -->
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
          <div class="text-center space-y-3">
            <div class="text-xs text-neutral-400">Ha scoperto che</div>
            <div class="flex items-center justify-center gap-3">
              <span class="text-neutral-400 text-xs">gioca per</span>
              <span class="px-3 py-1.5 rounded text-sm font-medium border" 
                    :style="{ 
                      color: getFactionDisplay(event.data.discoveredFaction).color,
                      borderColor: getFactionDisplay(event.data.discoveredFaction).color,
                      backgroundColor: getFactionDisplay(event.data.discoveredFaction).color + '20'
                    }">
                {{ getFactionDisplay(event.data.discoveredFaction).name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else></template>
  </div>
</template>