<script setup lang="ts">
import { computed } from 'vue';
import PlayerRoleList from './ui/PlayerRoleList.vue';
import { getFactionConfig } from '../factions';
import { ROLES } from '../roles';

const props = defineProps<{ state: any; onContinue: () => void }>();

const aliveWithRoles = computed(() => props.state.players.filter((p: any) => p.alive).map((p: any) => {
  const roleDef = ROLES[p.roleId];
  const faction = getFactionConfig(roleDef?.team || 'unknown');
  const fallbackColor = faction?.color || '#9ca3af';
  return {
    id: p.id,
    name: p.name,
    roleName: roleDef?.name || p.roleId,
    team: roleDef?.team || 'unknown',
    roleColor: roleDef?.color || fallbackColor,
  };
}));
</script>

<template>
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Preparazione per la Notte {{ props.state.nightNumber + 1 }}</h2>
    <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
      <div class="text-slate-300 text-sm">
        Dite a tutti i giocatori di chiudere gli occhi. È ora di iniziare la Notte {{ props.state.nightNumber + 1 }}.
      </div>
      <div class="text-slate-400 text-xs">Giocatori vivi e i loro ruoli:</div>
      <PlayerRoleList :state="props.state" :players="props.state.players.filter((p: any) => p.alive)" />
      <div class="flex items-center justify-end pt-2">
        <button class="btn btn-primary" @click="props.onContinue">Continua</button>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
    </div>
  </div>
</template>


