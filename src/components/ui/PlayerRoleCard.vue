<script setup>
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { ROLES } from '../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    label: { type: String, required: true },
    align: { type: String, default: 'left' }
});

const playerRoleDef = computed(() => props.player ? ROLES[props.player.roleId] : null);
const factionConfig = computed(() => playerRoleDef.value ? getFactionConfig(playerRoleDef.value.team) : null);

const alignmentClasses = computed(() => {
    if (props.align === 'right') return 'text-right';
    if (props.align === 'center') return 'text-center';
    return 'text-left';
});

const roleAlignmentClasses = computed(() => {
    if (props.align === 'right') return 'justify-end ml-auto';
    if (props.align === 'center') return 'justify-center';
    return 'justify-start';
});

const playerNames = computed(() => {
    if (!props.player?.name) return [];
    return props.player.name.split(',').map(name => name.trim());
});
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div v-if="player" class="flex-1 font-medium bg-transparent flex flex-col">
      <div class="flex flex-wrap gap-1 justify-center">
        <span v-for="name in playerNames" :key="name" 
              class="px-2 py-1 bg-neutral-800/60 border border-neutral-700/40 rounded text-xs text-neutral-200">
          {{ name.trim() }}
        </span>
      </div>
      <div class="flex items-center justify-center gap-2 mt-2">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: factionConfig?.color || '#9ca3af' }"></div>
        <span class="text-xs" :style="{ color: factionConfig?.color || '#9ca3af' }">{{ playerRoleDef?.name || player.roleId }}</span>
      </div>
    </div>
    <div v-else class="flex-1 font-medium bg-transparent flex flex-col justify-center items-center text-neutral-400 text-xs">
      {{ label || 'N/A' }}
    </div>
  </div>
</template>
