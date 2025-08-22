<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROLES } from '../roles/index';
import { getFactionConfig } from '../factions';
import type { RoleDef } from '../types';

const route = useRoute();
const router = useRouter();
const roleId = computed(() => route.query.role as string);
const role = computed(() => ROLES[roleId.value] as RoleDef | undefined);

// Map a role id to its Italian display name
function mapRoleIdToName(id: string): string {
  const r = ROLES[id] as RoleDef | undefined;
  return r?.name || id;
}

// Get win condition from faction config
function getWinCondition(team: string): string {
  const faction = getFactionConfig(team);
  return faction?.winConditionDescription || 'Condizione specifica del ruolo';
}

// Get actsAtNight display text
function getActsAtNightText(actsAtNight: string | undefined): string {
  switch (actsAtNight) {
    case 'always': return 'Agisce sempre di notte';
    case 'alive': return 'Agisce di notte quando vivo';
    case 'dead': return 'Agisce di notte quando morto';
    case 'never': return 'Non agisce di notte';
    default: return 'Non agisce di notte';
  }
}

// Usage policy display
const usageDisplay: Record<string, string> = {
  'unlimited': 'Illimitato - può agire ogni notte',
  'once': 'Una volta - può agire solo una volta per partita',
  'requiredEveryNight': 'Obbligatorio - deve agire ogni notte'
};

// Get faction display info
function getFactionInfo(team: string) {
  const faction = getFactionConfig(team);
  
  // Convert hex color to Tailwind background class
  let bgColor = 'bg-neutral-400';
  if (faction?.color) {
    // Map common hex colors to Tailwind classes
    const colorMap: Record<string, string> = {
      '#34d399': 'bg-emerald-400', // villaggio green
      '#f87171': 'bg-red-400',     // lupi red
      '#818cf8': 'bg-indigo-400',  // mannari indigo
      '#a78bfa': 'bg-violet-400'   // matti violet
    };
    bgColor = colorMap[faction.color] || 'bg-neutral-400';
  }
  
  return {
    name: faction?.displayName || team,
    color: faction?.color || 'text-neutral-400',
    bgColor: bgColor,
    ringColor: faction?.ringColor || 'ring-neutral-500/40'
  };
}

function goBack() {
  router.back();
}

// Min/Max count display
function getCountDisplay(role: RoleDef): { min: string; max: string } {
  const defaultPlayers = 8;
  
  let min = '0';
  let max = 'Illimitato';
  
  if (role.minCount !== undefined) {
    min = typeof role.minCount === 'function' ? role.minCount(defaultPlayers).toString() : role.minCount.toString();
  }
  
  if (role.maxCount !== undefined) {
    max = typeof role.maxCount === 'function' ? role.maxCount(defaultPlayers).toString() : role.maxCount.toString();
  }
  
  return { min, max };
}

onMounted(() => {
  if (!role.value) {
    router.push('/setup/roles');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(roleId, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div v-if="role" class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
    <!-- Header with back button -->
    <div class="sticky top-0 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/50 z-50">
      <div class="max-w-5xl mx-auto px-4 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center gap-3 sm:gap-4">
          <button 
            @click="goBack"
            class="p-2 rounded-lg sm:rounded-xl bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800/40 transition-all duration-200 hover:scale-105"
          >
            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-lg sm:text-xl font-bold">Dettagli Ruolo</h1>
            <p class="text-xs sm:text-sm text-neutral-400">Informazioni complete sul ruolo selezionato</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
      <div class="space-y-6 sm:space-y-8">
        <!-- Role header card -->
        <div class="relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-800/40 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-neutral-900/80 to-neutral-800/40 backdrop-blur-sm">
          <div class="absolute inset-0 bg-gradient-to-br opacity-20"
               :class="getFactionInfo(role.team).ringColor.replace('ring-', 'from-').replace('/40', '') + ' to-transparent'"></div>
          
          <div class="relative">
            <div class="space-y-4 sm:space-y-6">
              <!-- Role name -->
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold" :style="{ color: getFactionConfig(role.team)?.color || '#e5e7eb' }">
                {{ role.name }}
              </h2>
              
              <!-- Role description -->
              <p class="text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed">{{ role.description }}</p>
            </div>
          </div>
        </div>

        <!-- Faction Information Section -->
        <div class="space-y-4 sm:space-y-6">
          <h3 class="text-xl sm:text-2xl font-bold text-neutral-100 flex items-center gap-2 sm:gap-3">
            <div class="w-1 h-6 sm:h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            Informazioni Fazione
          </h3>
          
          <div class="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <!-- Real faction -->
            <div class="group rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6 hover:border-neutral-700/60 transition-all duration-200 hover:scale-105">
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 class="text-base sm:text-lg font-semibold">Fazione Reale</h4>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="w-3 h-3 sm:w-4 sm:h-4 rounded-full" :class="getFactionInfo(role.team).bgColor"></span>
                <span class="font-semibold text-base sm:text-lg" :style="{ color: getFactionInfo(role.team).color }">
                  {{ getFactionInfo(role.team).name }}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-neutral-400 mt-2">La fazione a cui appartiene realmente questo ruolo</p>
            </div>

            <!-- Visible faction -->
            <div class="group rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6 hover:border-neutral-700/60 transition-all duration-200 hover:scale-105">
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 class="text-base sm:text-lg font-semibold">Come Appare</h4>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                      :class="getFactionInfo(role.visibleAsTeam || role.team).bgColor"></span>
                <span class="font-semibold text-base sm:text-lg" 
                      :style="{ color: getFactionInfo(role.visibleAsTeam || role.team).color }">
                  {{ getFactionInfo(role.visibleAsTeam || role.team).name }}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-neutral-400 mt-2">Come appare agli altri ruoli investigativi</p>
            </div>

            <!-- Counts as faction -->
            <div class="group rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6 hover:border-neutral-700/60 transition-all duration-200 hover:scale-105 md:col-span-2 lg:col-span-1">
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 class="text-base sm:text-lg font-semibold">Conta Come</h4>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                      :class="getFactionInfo(role.countAs || role.team).bgColor"></span>
                <span class="font-semibold text-base sm:text-lg" 
                      :style="{ color: getFactionInfo(role.countAs || role.team).color }">
                  {{ getFactionInfo(role.countAs || role.team).name }}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-neutral-400 mt-2">Per quale fazione conta nelle condizioni di vittoria</p>
            </div>
          </div>
        </div>

        <!-- Game Mechanics Section -->
        <div class="space-y-4 sm:space-y-6">
          <h3 class="text-xl sm:text-2xl font-bold text-neutral-100 flex items-center gap-2 sm:gap-3">
            <div class="w-1 h-6 sm:h-8 rounded-full bg-gradient-to-b from-green-500 to-blue-500"></div>
            Meccaniche di Gioco
          </h3>
          
          <div class="grid gap-4 sm:gap-6 md:grid-cols-2">
            <!-- Player count constraints -->
            <div class="group rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6 hover:border-neutral-700/60 transition-all duration-200 hover:scale-105">
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h4 class="text-base sm:text-lg font-semibold">Numero Giocatori</h4>
              </div>
              <div class="space-y-2 sm:space-y-3">
                <div class="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-neutral-900/50">
                  <span class="text-xs sm:text-sm text-neutral-400">Minimo:</span>
                  <span class="font-semibold text-sm sm:text-lg">{{ getCountDisplay(role).min }}</span>
                </div>
                <div class="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-neutral-900/50">
                  <span class="text-xs sm:text-sm text-neutral-400">Massimo:</span>
                  <span class="font-semibold text-sm sm:text-lg">{{ getCountDisplay(role).max }}</span>
                </div>
              </div>
            </div>

            <!-- Win condition -->
            <div class="group rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6 hover:border-neutral-700/60 transition-all duration-200 hover:scale-105">
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 class="text-base sm:text-lg font-semibold">Condizione di Vittoria</h4>
              </div>
              <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {{ getWinCondition(role.team) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Abilities Section -->
        		<div v-if="role.actsAtNight !== 'never' || role.usage || role.affectedRoles" class="space-y-4 sm:space-y-6">
          <h3 class="text-xl sm:text-2xl font-bold text-neutral-100 flex items-center gap-2 sm:gap-3">
            <div class="w-1 h-6 sm:h-8 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
            Abilità e Caratteristiche
          </h3>
          
          <div class="rounded-lg sm:rounded-xl border border-neutral-800/40 bg-gradient-to-br from-neutral-900/60 to-neutral-800/30 p-4 sm:p-6">
            <div class="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div v-if="role.actsAtNight && role.actsAtNight !== 'never'" class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400"></div>
                <span class="text-xs sm:text-sm font-medium">{{ getActsAtNightText(role.actsAtNight) }}</span>
              </div>
              
              <div class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></div>
                <span class="text-xs sm:text-sm font-medium">Azione di gruppo</span>
              </div>
              
              <div v-if="role.usage" class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400 mt-1"></div>
                <div>
                  <div class="text-xs sm:text-sm font-medium">{{ usageDisplay[role.usage] || role.usage }}</div>
                </div>
              </div>
              
              <div v-if="role.canTargetDead" class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400"></div>
                <span class="text-xs sm:text-sm font-medium">Può agire sui morti</span>
              </div>
              
              <div v-if="role.affectedRoles?.length" class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 mt-1"></div>
                <div>
                  <div class="text-xs sm:text-sm font-medium">Influenza: {{ role.affectedRoles.map(mapRoleIdToName).join(', ') }}</div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fallback if role not found -->
  <div v-else class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 flex items-center justify-center">
    <div class="text-center px-4">
      <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-neutral-800/40 flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg class="w-8 h-8 sm:w-12 sm:h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Ruolo non trovato</h1>
      <p class="text-sm sm:text-base lg:text-lg text-neutral-400 mb-4 sm:mb-6">Il ruolo richiesto non esiste o non è disponibile.</p>
      <button 
        @click="router.push('/setup/roles')"
        class="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 font-semibold text-sm sm:text-base"
      >
        Torna ai ruoli
      </button>
    </div>
  </div>
</template>
