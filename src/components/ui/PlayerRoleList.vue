<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';
import { ROLES } from '../../roles';

const props = defineProps<{ state: any; players: Array<{ id: number; name: string; roleId: string; alive?: boolean }> }>();

const items = computed(() => props.players.map((p: any) => {
  const roleDef = ROLES[p.roleId];
  const faction = getFactionConfig(roleDef?.team || 'unknown');
  const factionColor = faction?.color || '#9ca3af';
  return {
    id: p.id,
    name: p.name,
    roleName: roleDef?.name || p.roleId,
    team: roleDef?.team || 'unknown',
    roleColor: factionColor,
    factionColor: factionColor,
  };
}));
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <li v-for="p in items" :key="p.id" class="px-3 py-2 rounded-md border bg-neutral-900/50 text-neutral-200 flex items-center justify-between"
        :class="props.state.sindacoId === p.id ? 'border-yellow-400' : 'border-neutral-700/60'">
      <div class="font-medium truncate text-left flex-1 min-w-0 mr-2" :title="p.name">{{ p.name }}</div>
      <div class="text-[11px] px-2 py-0.5 rounded border truncate max-w-[6rem] flex-shrink-0" :style="{ color: p.factionColor, borderColor: hexToRgba(p.factionColor, 0.5) || p.factionColor }" :title="p.roleName">{{ p.roleName }}</div>
    </li>
  </ul>
</template>


