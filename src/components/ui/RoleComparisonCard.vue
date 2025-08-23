<script setup>
import PlayerRoleCard from './PlayerRoleCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    leftPlayer: { type: Object, required: true },
    rightPlayer: { type: Object, required: true },
    leftLabel: { type: String, required: true },
    rightLabel: { type: String, required: true },
    centerContent: { type: Object, required: true }
});

const centerContent = props.centerContent;
</script>

<template>
  <div class="w-full bg-neutral-900/60 border border-neutral-800/40 rounded-lg py-2 px-1 space-y-4">
    <!-- Player Cards with Clear Relationship -->
    <div class="flex items-center gap-2">
      <!-- Left Player (Actor) -->
      <div class="text-center flex-1">
        <div class="text-xs text-neutral-400 mb-2">{{ leftLabel }}</div>
        <PlayerRoleCard 
            :game-state="gameState" 
            :player="leftPlayer" 
            :label="leftLabel" 
            align="center"
        />
      </div>
      
      <!-- Action Flow Indicator -->
      <div class="flex items-center justify-center">
        <div class="flex items-center gap-1 px-1.5 py-1 rounded-full text-center bg-neutral-800/60 border border-neutral-700/40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-neutral-400">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-xs font-medium text-neutral-300">{{ centerContent.action }}</span>
        </div>
      </div>
      
      <!-- Right Player (Target) -->
      <div class="text-center flex-1">
        <div class="text-xs text-neutral-400 mb-2">{{ rightLabel }}</div>
        <PlayerRoleCard 
            :game-state="gameState" 
            :player="rightPlayer" 
            :label="rightLabel" 
            align="center"
        />
      </div>
    </div>
    
    <!-- Declaration and Result Row -->
    <div v-if="centerContent.declaredRole || centerContent.status" class="flex flex-col items-center pt-3 border-t border-neutral-800/40 space-y-2">
      <!-- Declared Role -->
      <div v-if="centerContent.declaredRole" class="flex items-center gap-2">
        <span class="text-xs text-neutral-400">Dichiarato:</span>
        <div class="px-2.5 py-1 rounded text-xs font-medium"
             :style="{ 
                 color: centerContent.declaredRole.color || '#9ca3af',
                 backgroundColor: (centerContent.declaredRole.color || '#9ca3af') + '15',
                 border: '1px solid ' + (centerContent.declaredRole.color || '#9ca3af') + '30'
             }">
          {{ centerContent.declaredRole.name }}
        </div>
      </div>
      
      <!-- Status Result -->
      <div v-if="centerContent.status" class="flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium" 
           :class="centerContent.status.isCorrect ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'">
        <svg v-if="centerContent.status.isCorrect" width="12" height="12" viewBox="0 0 24 24" class="text-green-400">
          <path d="M20 7L9 18l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" class="text-red-400">
          <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ centerContent.status.text }}</span>
      </div>
    </div>
  </div>
</template>
