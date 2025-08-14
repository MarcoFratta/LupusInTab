<script setup lang="ts">
import { computed } from 'vue';
import PlayerRoleList from './ui/PlayerRoleList.vue';
const props = defineProps<{ state: any; onContinue: () => void }>();
const aliveWithRoles = computed(() => props.state.players.filter((p: any) => p.alive).map((p: any) => {
  const meta = props.state.roleMeta[p.roleId] || {} as any;
  const fallbackColor = meta.team === 'wolf' ? '#ef4444' : '#22c55e';
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
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Prepare for Night {{ props.state.nightNumber + 1 }}</h2>
    <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
      <div class="text-slate-300 text-sm">
        Tell all players to close their eyes. It's time to begin Night {{ props.state.nightNumber + 1 }}.
      </div>
      <div class="text-slate-400 text-xs">Alive players and their roles:</div>
      <PlayerRoleList :state="props.state" :players="props.state.players.filter((p: any) => p.alive)" />
      <div class="flex items-center justify-end pt-2">
        <button class="btn btn-primary" @click="props.onContinue">Continue</button>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">reload to start a new game from the main menu</div>
    </div>
  </div>
</template>


