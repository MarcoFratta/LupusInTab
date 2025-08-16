<script setup lang="ts">
import { computed } from 'vue';
import { getFaction } from '../../factions';
import { hexToRgba } from '../../utils/color';

const props = defineProps<{ state: any; players: Array<{ id: number; name: string; roleId: string; alive?: boolean }> }>();

const items = computed(() => props.players.map((p: any) => {
  const meta = props.state.roleMeta[p.roleId] || {} as any;
  const faction = getFaction(meta.team);
  const fallbackColor = faction.color;
  return {
    id: p.id,
    name: p.name,
    roleName: meta.name || p.roleId,
    team: meta.team || 'unknown',
    roleColor: meta.color || fallbackColor,
  };
}));
</script>

<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <li v-for="p in items" :key="p.id" class="px-3 py-2 rounded-md border bg-neutral-900/50 text-neutral-200 flex items-center justify-between"
        :class="props.state.sindacoId === p.id ? 'border-yellow-400' : 'border-neutral-700/60'">
      <div class="font-medium">{{ p.name }}</div>
      <div class="text-[11px] px-2 py-0.5 rounded border" :style="{ color: p.roleColor, borderColor: hexToRgba(p.roleColor, 0.5) || p.roleColor }">{{ p.roleName }}</div>
    </li>
  </ul>
</template>


