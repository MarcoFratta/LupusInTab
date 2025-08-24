<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/game';
import { ROLE_LIST } from '../../roles/index';
import { shuffled } from '../../utils/random';
import {
  beginReveal as engineBeginReveal,
  getMaxCountForRole as engineGetMaxCountForRole,
  updateRoleCount as engineUpdateRoleCount,
  getMinCountForRole as engineGetMinCountForRole,
} from '../../core/engine';
import RoleCard from '../game/RoleCard.vue';
import { useTeamBalance } from '../../composables/useTeamBalance';

const store = useGameStore();
const state = store.state as any;

const { teamBalance } = useTeamBalance();

const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));
const totalRolesSelected = computed(() => {
  const values = Object.values(roleCounts.value as Record<string, number>);
  return values.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
});

const disadvantagedTeam = computed(() => {
  const teamData = teamBalance.value.teamData;
  if (!teamData || Object.keys(teamData).length === 0) return null;
  
  let minPower = Infinity;
  let disadvantagedTeamName = '';
  
  Object.entries(teamData).forEach(([teamName, team]) => {
    if (team.players > 0 && team.power < minPower) {
      minPower = team.power;
      disadvantagedTeamName = teamName;
    }
  });
  
  return disadvantagedTeamName;
});

const getTeamDisplayName = (teamName: string) => {
  const teamNames: Record<string, string> = {
    'villaggio': 'Villaggio',
    'lupi': 'Lupi',
    'mannari': 'Mannari',
    'matti': 'Matti'
  };
  return teamNames[teamName] || teamName;
};

const canStart = computed(() => {
  	const numWolves = roleCounts.value['lupo'] || 0;
  const totalsMatch = totalRolesSelected.value === state.setup.numPlayers;
  return state.setup.players.length >= 4 && numWolves >= 1 && totalsMatch;
});

function getMaxCountForRole(roleId: string): number {
  return engineGetMaxCountForRole(state, roleId);
}

function getMinCountForRole(roleId: string): number {
  return engineGetMinCountForRole(state as any, roleId);
}

function updateRoleCount(roleId: string, count: number) {
  engineUpdateRoleCount(state, roleId, count);
}

function beginReveal() {
  engineBeginReveal(state, ROLE_LIST as any, shuffled);
}

const factionOrder: Record<string, number> = {
  'villaggio': 0,
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
      const ap = Number((a as any).phaseOrder) || 0;
      const bp = Number((b as any).phaseOrder) || 0;
      if (ap !== bp) return ap - bp;
      return String(a.name).localeCompare(String(b.name));
    });
});
</script>

<template>
  <div class="space-y-4 px-2 sm:px-0 overflow-visible">


    <!-- Header Section with Role Summary -->
    <div class="text-center space-y-4">
      <!-- Title and Description -->
      <div class="space-y-2">
        <h2 class="text-xl sm:text-2xl font-bold text-neutral-100">Configurazione</h2>
      </div>
      
      <!-- Role Summary Info with Start Button -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
               :class="totalRolesSelected === state.setup.numPlayers ? 'from-emerald-500/30 to-blue-500/30 border-emerald-400/50' : 'from-red-500/20 to-orange-500/20 border-red-500/30'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                 :class="totalRolesSelected === state.setup.numPlayers ? 'text-emerald-400' : 'text-red-400'">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-2xl font-bold leading-none tabular-nums bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent" 
                 :class="totalRolesSelected === state.setup.numPlayers ? 'from-emerald-400 to-blue-400' : 'from-red-400 to-orange-400'">
              {{ totalRolesSelected }}
            </div>
            <div class="text-2xl font-bold leading-none text-neutral-400">/</div>
            <div class="text-2xl font-bold leading-none text-neutral-200">{{ state.setup.numPlayers }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden" 
                  :class="canStart ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/50'" 
                  :disabled="!canStart" 
                  @click="beginReveal">
            <!-- Button Background Pattern -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-80"></div>
            </div>
            
            <!-- Button Content -->
            <div class="relative z-10 flex items-center gap-1.5">
              <svg v-if="canStart" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              <span class="text-sm font-medium">{{ canStart ? 'Avvia' : 'Configura' }}</span>
            </div>
            
            <!-- Shine Effect -->
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="max-w-md mx-auto">
        <div class="flex justify-between text-xs text-neutral-400 mb-2">
          <span>Bilanciamento Squadre</span>
          <span class="font-medium">{{ teamBalance.fairness }}%</span>
        </div>
        <div class="w-full bg-neutral-800/40 rounded-full h-2.5 overflow-hidden">
          <div class="h-2.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-emerald-500 to-blue-500"
               :class="teamBalance.fairness >= 70 ? 'from-emerald-500 to-blue-500' : teamBalance.fairness >= 50 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-orange-500'"
               :style="{ width: `${teamBalance.fairness}%` }">
          </div>
        </div>
        <div class="text-xs text-neutral-500 mt-2 text-center space-y-1">
          <div v-if="disadvantagedTeam && teamBalance.fairness < 100" class="text-xs">
            Fazione più debole: {{ getTeamDisplayName(disadvantagedTeam) }}
          </div>
          <div class="text-xs text-neutral-600">
            Totale: {{ teamBalance.totalPlayers }}/{{ state.setup.numPlayers }} giocatori
          </div>
        </div>
      </div>
      
      
    </div>

    <!-- Roles Configuration Grid -->
    <div class="space-y-3">
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[1fr]">
        <RoleCard
          v-for="role in sortedEnabledRoles"
          :key="role.id"
          :role="role"
          :count="state.setup.rolesCounts[role.id] || 0"
          :max-count="getMaxCountForRole(role.id)"
          :min-count="getMinCountForRole(role.id)"
          :on-count-change="(count:number) => updateRoleCount(role.id, count)"
        />
      </div>
    </div>


  </div>
</template>

