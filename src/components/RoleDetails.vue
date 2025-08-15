<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROLES } from '../roles/index';
import type { RoleDef } from '../types';

const route = useRoute();
const router = useRouter();
const roleId = computed(() => route.query.role as string);
const role = computed(() => ROLES[roleId.value] as RoleDef | undefined);

// Team mapping for display
const teamMapping: Record<string, string> = {
  'lupi': 'Lupi',
  'village': 'Villaggio', 
  'matti': 'Folle',
  'mannari': 'Mannari'
};

// Win condition mapping based on team
const winConditionMapping: Record<string, string> = {
  'lupi': 'Vincono quando raggiungono la parità numerica con gli altri giocatori o li superano',
  'village': 'Vincono quando tutti i lupi sono stati eliminati',
  'matti': 'Vince se viene eliminato durante il giorno (votazione)',
  'mannari': 'Vince se restano solo in due (lui e un altro giocatore)'
};

// Usage policy display
const usageDisplay: Record<string, string> = {
  'unlimited': 'Illimitato - può agire ogni notte',
  'once': 'Una volta - può agire solo una volta per partita',
  'requiredEveryNight': 'Obbligatorio - deve agire ogni notte'
};

// Role team styling
function getRoleTeamStyle(team: string): string {
  if (team === 'lupi') return 'from-red-500/20 to-red-600/10 border-red-500/30';
  if (team === 'matti') return 'from-violet-500/20 to-violet-600/10 border-violet-500/30';
  if (team === 'mannari') return 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30';
  return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
}

function getRoleTeamColor(team: string): string {
  if (team === 'lupi') return 'text-red-400';
  if (team === 'matti') return 'text-violet-400';
  if (team === 'mannari') return 'text-indigo-400';
  return 'text-emerald-400';
}

function getRoleTeamBgColor(team: string): string {
  if (team === 'lupi') return 'bg-red-400';
  if (team === 'matti') return 'bg-violet-400';
  if (team === 'mannari') return 'bg-indigo-400';
  return 'bg-emerald-400';
}

function goBack() {
  router.back();
}

// Min/Max count display
function getCountDisplay(role: RoleDef): { min: string; max: string } {
  const defaultPlayers = 8; // Example player count for display
  
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
  
  // Scroll to top when component mounts
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Also scroll to top when navigating between different roles
watch(roleId, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div v-if="role" class="min-h-screen bg-neutral-950 text-neutral-100">
    <!-- Header with back button -->
    <div class="sticky top-0 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/50 z-50">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center gap-4">
          <button 
            @click="goBack"
            class="p-2 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/50 border border-neutral-800/40 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold">Dettagli Ruolo</h1>
            <p class="text-sm text-neutral-400">Informazioni complete sul ruolo selezionato</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 max-w-4xl mx-auto px-6 py-6">
      <div class="space-y-6">
        <!-- Role header card -->
        <div class="relative overflow-hidden rounded-xl border p-6 bg-gradient-to-br"
             :class="getRoleTeamStyle(role.team)">
          <div class="relative">
            <div class="flex items-start justify-between gap-6">
              <div class="min-w-0">
                <h2 class="text-3xl font-bold mb-2" :style="{ color: role.color || '#e5e7eb' }">
                  {{ role.name }}
                </h2>
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800/40">
                  <span class="w-2 h-2 rounded-full" :class="getRoleTeamBgColor(role.team)"></span>
                  <span class="text-sm font-medium" :class="getRoleTeamColor(role.team)">
                    {{ teamMapping[role.team] || role.team }}
                  </span>
                </div>
              </div>
              

            </div>
          </div>
        </div>

        <!-- Details grid -->
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Description -->
          <div class="md:col-span-2">
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
              <h3 class="text-base font-semibold mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descrizione
              </h3>
              <p class="text-neutral-300 text-sm leading-relaxed">{{ role.description }}</p>
            </div>
          </div>

          <!-- Real faction -->
          <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
            <h3 class="text-base font-semibold mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Fazione reale
            </h3>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" :class="getRoleTeamBgColor(role.team)"></span>
              <span class="font-medium text-sm" :class="getRoleTeamColor(role.team)">
                {{ teamMapping[role.team] || role.team }}
              </span>
            </div>
          </div>

          <!-- Visible faction -->
          <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
            <h3 class="text-base font-semibold mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Come appare
            </h3>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" 
                    :class="getRoleTeamBgColor(role.visibleAsTeam || role.team)"></span>
              <span class="font-medium text-sm" 
                    :class="getRoleTeamColor(role.visibleAsTeam || role.team)">
                {{ teamMapping[role.visibleAsTeam || role.team] || (role.visibleAsTeam || role.team) }}
              </span>
            </div>
          </div>

          <!-- Player count constraints -->
          <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
            <h3 class="text-base font-semibold mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Numero giocatori
            </h3>
            <div class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-neutral-400">Min:</span>
                <span class="font-medium">{{ getCountDisplay(role).min }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-neutral-400">Max:</span>
                <span class="font-medium">{{ getCountDisplay(role).max }}</span>
              </div>
            </div>
          </div>

          <!-- Win condition -->
          <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
            <h3 class="text-base font-semibold mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Vittoria
            </h3>
            <p class="text-neutral-300 text-sm leading-relaxed">
              {{ winConditionMapping[role.team] || 'Condizione specifica del ruolo' }}
            </p>
          </div>

          <!-- Additional abilities (if applicable) -->
          <div v-if="role.actsAtNight || role.usage || role.affectsKillers || role.immuneToKillers" 
               class="md:col-span-2">
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4">
              <h3 class="text-base font-semibold mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Abilità
              </h3>
              <div class="grid gap-3 md:grid-cols-2">
                <div v-if="role.actsAtNight" class="flex items-center gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span class="text-xs">Agisce di notte</span>
                </div>
                <div v-if="role.group" class="flex items-center gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-green-400"></div>
                  <span class="text-xs">Azione di gruppo</span>
                </div>
                <div v-if="role.usage" class="flex items-start gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-purple-400 mt-1"></div>
                  <div>
                    <div class="text-xs font-medium">{{ usageDisplay[role.usage] || role.usage }}</div>
                  </div>
                </div>
                <div v-if="role.canTargetDead" class="flex items-center gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span class="text-xs">Può agire sui morti</span>
                </div>
                <div v-if="role.affectsKillers?.length" class="flex items-start gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-red-400 mt-1"></div>
                  <div>
                    <div class="text-xs font-medium">Influenza: {{ role.affectsKillers.join(', ') }}</div>
                  </div>
                </div>
                <div v-if="role.immuneToKillers?.length" class="flex items-start gap-2 p-2 rounded bg-neutral-900/50">
                  <div class="w-2 h-2 rounded-full bg-yellow-400 mt-1"></div>
                  <div>
                    <div class="text-xs font-medium">Immune a: {{ role.immuneToKillers.join(', ') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fallback if role not found -->
  <div v-else class="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">Ruolo non trovato</h1>
      <p class="text-neutral-400 mb-4">Il ruolo richiesto non esiste.</p>
      <button 
        @click="router.push('/setup/roles')"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Torna ai ruoli
      </button>
    </div>
  </div>
</template>
