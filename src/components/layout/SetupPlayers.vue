<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../../stores/game';
import { initSetupPlayers as engineInitSetupPlayers, resizePlayers as engineResizePlayers, normalizeRoleCounts as engineNormalizeRoleCounts } from '../../core/engine';

const store = useGameStore();
const state = store.state as any;

const playerCount = computed(() => state.setup.players.length);
const canAddPlayer = computed(() => playerCount.value < 20);
const canRemovePlayer = computed(() => playerCount.value > 4);

function resetNames() {
  state.setup.numPlayers = 6;
  engineInitSetupPlayers(state);
  engineNormalizeRoleCounts(state);
}

function addPlayer() {
  if (canAddPlayer.value) {
    state.setup.players.push({ name: `Giocatore ${state.setup.players.length + 1}` });
    state.setup.numPlayers = state.setup.players.length;
    engineNormalizeRoleCounts(state);
  }
}

function removePlayer(index: number) {
  if (canRemovePlayer.value) {
    state.setup.players.splice(index, 1);
    state.setup.numPlayers = state.setup.players.length;
    engineNormalizeRoleCounts(state);
  }
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
  <div class="space-y-4 px-2 sm:px-0 overflow-visible">
    <!-- Header Section -->
    <div class="text-center space-y-3">
      <div class="space-y-2">
        <h2 class="text-xl sm:text-xl font-bold text-neutral-100">Gestione Giocatori</h2>
        <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Aggiungi, rimuovi e personalizza i nomi dei giocatori per questa partita.
        </p>
      </div>
    </div>

    <!-- Player Management Card -->
    <div class="bg-neutral-900/50 border border-neutral-800/40 rounded-xl p-4 space-y-4">
      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-2">
        <button
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          :disabled="!canAddPlayer"
          @click="addPlayer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m-7-7h14"/>
          </svg>
          <span class="text-xs font-medium">Aggiungi Giocatore</span>
        </button>
        
        <button 
          class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 bg-neutral-800/60 text-neutral-200 border border-neutral-700/50 hover:bg-neutral-700/60 hover:border-neutral-600/50"
          @click="resetNames"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-6h-6"/>
          </svg>
          <span class="text-xs font-medium">Reimposta</span>
        </button>
      </div>
    </div>

    <!-- Players List -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-medium text-neutral-300">Nomi dei giocatori</h3>
        <div class="flex-1 h-px bg-neutral-800/50"></div>
        <span class="text-xs text-neutral-500 font-medium">{{ playerCount }} giocator{{ playerCount === 1 ? 'e' : 'i' }}</span>
      </div>
      
      <div class="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
        <div 
          v-for="(player, index) in state.setup.players" 
          :key="index" 
          class="group relative rounded-lg border border-neutral-800/40 p-2.5 transition-all duration-300 bg-neutral-900/50 overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation"
        >
          <div class="flex items-center gap-1">
            <!-- Reorder Buttons -->
            <div class="flex flex-col gap-1">
              <div
                class="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                :hidden="index === 0"
                @click="movePlayerUp(index)"
                title="Move player up"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
              </div>
              <div
                class="w-5 h-5 flex items-center justify-center rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                :hidden="index === state.setup.players.length - 1"
                @click="movePlayerDown(index)"
                title="Move player down"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            <!-- Player Name Input -->
            <div class="flex-1 min-w-0">
              <input 
                type="text" 
                v-model="player.name" 
                class="w-full px-2.5 py-1.5 bg-neutral-800/40 border border-neutral-700/40 rounded-md text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-neutral-500"
                :placeholder="`Giocatore ${index + 1}`"
              />
            </div>
            
            <!-- Remove Button -->
            <button 
              class="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-700/40 bg-neutral-800/40 text-neutral-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canRemovePlayer"
              @click="removePlayer(index)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="text-center p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
      <div class="flex items-center justify-center gap-2 text-xs text-neutral-400">
        <span>I nomi personalizzati verranno utilizzati durante il gioco. Assicurati che ogni giocatore abbia un nome univoco.</span>
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

