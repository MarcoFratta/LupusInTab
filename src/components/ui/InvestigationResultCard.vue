<script setup lang="ts">
import { getFactionConfig } from '../../factions';

interface Props {
    discoveredFaction?: string;
    title?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Risultato Investigazione'
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
  <!-- Compact Investigation Result Card -->
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3">
    <!-- Header with Icon -->
    <div class="flex items-center justify-center gap-2 mb-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-neutral-400">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-xs font-medium text-neutral-300">{{ title }}</span>
    </div>
    
    <!-- Investigation Content -->
    <div class="text-center">
                <div v-if="discoveredFaction" class="flex items-center justify-center gap-2">
            <span class="text-xs text-neutral-500">gioca per</span>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium text-sm"
                 :style="{ 
                   color: getFactionDisplay(discoveredFaction).color,
                   borderColor: getFactionDisplay(discoveredFaction).color,
                   backgroundColor: getFactionDisplay(discoveredFaction).color + '15'
                 }">
              <div class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: getFactionDisplay(discoveredFaction).color }"></div>
              {{ getFactionDisplay(discoveredFaction).name }}
            </div>
          </div>
      
      <div v-else>
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-600 bg-neutral-800/40 text-neutral-500 font-medium text-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-neutral-600">
            <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Fazione non scoperta
        </div>
      </div>
    </div>
  </div>
</template>
