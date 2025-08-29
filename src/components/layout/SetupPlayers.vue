<script setup lang="ts">
import { computed, watch } from 'vue';
import { useGameStore } from '../../stores/game';
import { initSetupPlayers as engineInitSetupPlayers, resizePlayers as engineResizePlayers, normalizeRoleCounts as engineNormalizeRoleCounts } from '../../core/engine';
import { SetupTitle } from '../ui';

const store = useGameStore();
const state = store.state as any;

const playerCount = computed(() => state.setup.players.length);

watch(() => state.setup.players.length, (newLength) => {
  state.setup.numPlayers = newLength;
});

const duplicateNames = computed(() => {
  const names = state.setup.players.map((p: any) => p.name?.trim().toLowerCase()).filter(Boolean);
  const duplicates = names.filter((name: string, index: number) => names.indexOf(name) !== index);
  return duplicates;
});

const hasDuplicateNames = computed(() => duplicateNames.value.length > 0);

const getDuplicateNameError = (playerName: string) => {
  const trimmedName = playerName?.trim().toLowerCase();
  if (!trimmedName) return null;
  
  const count = state.setup.players.filter((p: any) => 
    p.name?.trim().toLowerCase() === trimmedName
  ).length;
  
  return count > 1 ? 'Nome duplicato' : null;
};

const getCharacterLengthError = (playerName: string) => {
  if (!playerName) return null;
  return playerName.length > 15 ? 'Nome troppo lungo (max 15 caratteri)' : null;
};

const getPlayerNameError = (playerName: string) => {
  return getCharacterLengthError(playerName) || getDuplicateNameError(playerName);
};

const hasNameErrors = computed(() => {
  return state.setup.players.some((p: any) => getPlayerNameError(p.name));
});

function resetNames() {
  engineInitSetupPlayers(state);
  state.setup.numPlayers = state.setup.players.length;
  engineNormalizeRoleCounts(state);
}

function addPlayer() {
  state.setup.players.push({ name: `Giocatore ${state.setup.players.length + 1}` });
  state.setup.numPlayers = state.setup.players.length;
  engineNormalizeRoleCounts(state);
}

function removePlayer(index: number) {
  state.setup.players.splice(index, 1);
  state.setup.numPlayers = state.setup.players.length;
  engineNormalizeRoleCounts(state);
}

function onNumChange(e: any) {
  engineResizePlayers(state, Number(e?.target?.value) || 0);
  engineNormalizeRoleCounts(state);
}

function movePlayerUp(index: number) {
  if (index > 0) {
    const temp = state.setup.players[index];
    state.setup.players[index] = state.setup.players[index - 1];
    state.setup.players[index - 1] = temp;
    engineNormalizeRoleCounts(state);
  }
}

function movePlayerDown(index: number) {
  if (index < state.setup.players.length - 1) {
    const temp = state.setup.players[index];
    state.setup.players[index] = state.setup.players[index + 1];
    state.setup.players[index + 1] = temp;
    engineNormalizeRoleCounts(state);
  }
}
</script>

<template>
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
    <SetupTitle 
      title="Gestione Giocatori"
      subtitle="Aggiungi, rimuovi e personalizza i nomi dei giocatori per questa partita."
    />
    
    <div class="flex items-center justify-center gap-3">
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <div class="w-3 h-3 rounded-full bg-violet-500"></div>
        <span class="text-sm font-medium text-neutral-200">Giocatori</span>
        <span class="text-sm font-bold text-violet-400">{{ playerCount }}</span>
      </div>
    </div>

    <div v-if="hasNameErrors" class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4">
      <div class="flex items-center gap-3 text-red-400">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <span class="text-sm font-medium">Risolvi gli errori nei nomi per continuare</span>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <button 
          class="group relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden bg-neutral-800/60 text-neutral-200 border border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600/50"
          @click="resetNames"
        >
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute inset-0 bg-neutral-700/60"></div>
          </div>
          
          <div class="relative z-10 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-6h-6"/>
            </svg>
            <span class="font-medium">Reset</span>
          </div>
        </button>
        
        <button
          class="group relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-400 hover:to-fuchsia-400"
          @click="addPlayer"
        >
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
          </div>
          
          <div class="relative z-10 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m-7-7h14"/>
            </svg>
            <span class="font-medium">Aggiungi</span>
          </div>
          
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>
      
      <div class="space-y-3">
        <div 
          v-for="(player, index) in state.setup.players" 
          :key="index" 
          class="group relative rounded-xl border border-neutral-800/40 p-3
          md:p-5 transition-all duration-300 bg-neutral-900/60 overflow-hidden hover:bg-neutral-900/80 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation"
          :class="{
            'border-red-500/50 bg-red-500/5': getPlayerNameError(player.name)
          }"
        >
          <div class="flex items-center gap-3">
            <div class="flex flex-col gap-1">
              <button
                class="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="index === 0"
                @click="movePlayerUp(index)"
                title="Sposta giocatore in alto"
              >
                <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              <button
                class="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                :disabled="index === state.setup.players.length - 1"
                @click="movePlayerDown(index)"
                title="Sposta giocatore in basso"
              >
                <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
            
            <div class="flex-1 min-w-0">
              <input 
                type="text" 
                v-model="player.name" 
                class="w-full px-3 py-2 md:px-4 md:py-2.5 bg-neutral-800/40 border border-neutral-700/40 rounded-lg text-neutral-100 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-neutral-500"
                :class="{
                  'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50': getPlayerNameError(player.name)
                }"
                                :placeholder="`Giocatore ${index + 1}`"
                maxlength="15"
              />
                             <div v-if="getPlayerNameError(player.name)" class="mt-1 text-red-400 text-xs flex items-center gap-1">
                 <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                 </svg>
                 {{ getPlayerNameError(player.name) }}
               </div>
            </div>
            
            <button 
              class="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-neutral-700/40 bg-neutral-800/40 text-neutral-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              @click="removePlayer(index)"
              title="Rimuovi giocatore"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slider {
  background: linear-gradient(to right, #6b7280 0%, #6b7280 50%, #374151 50%, #374151 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
}
</style>

