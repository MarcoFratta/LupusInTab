<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLE_LIST } from '../roles/index';
import { shuffled } from '../utils/random';
import {
  beginReveal as engineBeginReveal,
  getMaxCountForRole as engineGetMaxCountForRole,
  updateRoleCount as engineUpdateRoleCount,
} from '../core/engine';
import RoleCard from './RoleCard.vue';

const store = useGameStore();
const state = store.state as any;

const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));
const totalRolesSelected = computed(() => {
  const values = Object.values(roleCounts.value as Record<string, number>);
  return values.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
});
const canStart = computed(() => {
  const numWolves = roleCounts.value['wolf'] || 0;
  const totalsMatch = totalRolesSelected.value === state.setup.numPlayers;
  return state.setup.players.length >= 4 && numWolves >= 1 && totalsMatch;
});

function getMaxCountForRole(roleId: string): number {
  return engineGetMaxCountForRole(state, roleId);
}

function updateRoleCount(roleId: string, count: number) {
  engineUpdateRoleCount(state, roleId, count);
}

function beginReveal() {
  engineBeginReveal(state, ROLE_LIST as any, shuffled);
}

// Sort roles by faction so they appear grouped in the grid
const factionOrder: Record<string, number> = {
  'village': 0,
  'lupi': 1,
  'mannari': 2,
  'matti': 3,
};

const sortedEnabledRoles = computed(() => {
  return ROLE_LIST
    .filter(r => state.setup.rolesEnabled?.[r.id] ?? true)
    .slice()
    .sort((a, b) => {
      const ao = factionOrder[a.team] ?? 99;
      const bo = factionOrder[b.team] ?? 99;
      if (ao !== bo) return ao - bo;
      // secondary sort: phaseOrder then name
      const ap = Number((a as any).phaseOrder) || 0;
      const bp = Number((b as any).phaseOrder) || 0;
      if (ap !== bp) return ap - bp;
      return String(a.name).localeCompare(String(b.name));
    });
});
</script>

<template>
  <div class="space-y-5">
    <!-- Compact Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2">
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-2">
        <div class="flex items-center justify-between gap-1.5 whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            <div class="w-6 h-6 bg-neutral-800/60 rounded flex items-center justify-center text-neutral-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" fill="currentColor"/>
              </svg>
            </div>
            <span class="text-xs text-neutral-400 leading-none">Giocatori</span>
          </div>
          <span class="text-base font-bold text-neutral-100 leading-none tabular-nums">{{ state.setup.numPlayers }}</span>
        </div>
      </div>
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-2"
           :class="totalRolesSelected === state.setup.numPlayers ? 'border-emerald-500/30' : 'border-red-500/30'">
        <div class="flex items-center justify-between gap-1.5 whitespace-nowrap">
          <div class="flex items-center gap-1.5">
          <div class="w-6 h-6 rounded flex items-center justify-center"
               :class="totalRolesSelected === state.setup.numPlayers ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <span class="text-xs text-neutral-400 leading-none">Ruoli</span>
          </div>
          <span class="text-base font-bold leading-none tabular-nums" :class="totalRolesSelected === state.setup.numPlayers ? 'text-emerald-400' : 'text-red-400'">
            {{ totalRolesSelected }}/{{ state.setup.numPlayers }}
          </span>
        </div>
      </div>
    </div>

    <!-- Role Selection Section -->
    <div class="space-y-4">
      <div class="text-center">
      <h3 class="text-lg font-semibold text-neutral-100 mb-1">Configura i ruoli</h3>
      <p class="text-sm text-neutral-400">Imposta il numero di ogni ruolo per la partita</p>
      </div>

      <div class="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
           <RoleCard
          v-for="role in sortedEnabledRoles"
          :key="role.id"
          :role="role"
          :count="state.setup.rolesCounts[role.id] || 0"
          :max-count="getMaxCountForRole(role.id)"
          :on-count-change="(count:number) => updateRoleCount(role.id, count)"
        />
      </div>
    </div>

    <!-- Start Game Section -->
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3"
         :class="canStart ? 'border-emerald-500/20' : 'border-red-500/20'">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-2.5 text-left w-full sm:w-auto">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
               :class="canStart ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
            <svg v-if="canStart" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="text-left">
            <div class="font-medium text-sm" :class="canStart ? 'text-emerald-400' : 'text-red-400'">
              {{ canStart ? 'Pronto per iniziare!' : 'Configurazione incompleta' }}
            </div>
            <div class="text-slate-400 text-[11px]">
              {{ canStart 
                ? 'Tutti i giocatori e i ruoli sono configurati'
                : (totalRolesSelected !== state.setup.numPlayers 
                    ? 'Il totale dei ruoli deve coincidere con i giocatori'
                    : 'È richiesto almeno 1 lupo') }}
            </div>
          </div>
        </div>
        <button class="btn btn-accent text-sm py-1.5" :class="{ 'btn-disabled': !canStart }" :disabled="!canStart" @click="beginReveal">Inizia partita</button>
      </div>
    </div>
  </div>
</template>

