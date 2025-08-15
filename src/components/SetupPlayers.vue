<script setup lang="ts">
import { useGameStore } from '../stores/game';
import { initSetupPlayers as engineInitSetupPlayers, resizePlayers as engineResizePlayers, normalizeRoleCounts as engineNormalizeRoleCounts } from '../core/engine';

const store = useGameStore();
const state = store.state as any;

function resetNames() {
  state.setup.numPlayers = 6;
  engineInitSetupPlayers(state);
  engineNormalizeRoleCounts(state);
}
function onNumChange(e: any) {
  engineResizePlayers(state, Number(e?.target?.value) || 0);
  engineNormalizeRoleCounts(state);
}
</script>

<template>
  <div class="space-y-6 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Modifica giocatori</h2>
    <div class="bg-white/5 border border-white/10 rounded-lg p-5">
      <div class="flex flex-col gap-3 mb-4 pb-3 border-b border-neutral-800/40">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-slate-300">Giocatori</h3>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold border text-neutral-200 border-neutral-700/60">{{ state.setup.players.length }}</span>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button class="btn btn-secondary w-full text-xs" @click="resetNames">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reimposta nomi
          </button>
          <button class="btn btn-primary w-full text-xs" @click="() => { state.setup.players.push({ name: `Giocatore ${state.setup.players.length + 1}` }); state.setup.numPlayers = state.setup.players.length; engineNormalizeRoleCounts(state); }">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Aggiungi giocatore
          </button>
        </div>
      </div>

      <div class="space-y-3 text-left">
        <h3 class="text-sm font-medium text-slate-300">Nomi dei giocatori</h3>
        <div class="max-h-72 overflow-y-auto overflow-x-hidden space-y-2 px-1.5">
          <div v-for="(p, idx) in state.setup.players" :key="idx" class="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 border border-neutral-800/40 rounded-lg hover:bg-neutral-800/60 transition-colors w-full">
            <div class="w-6 h-6 bg-indigo-600 rounded text-white text-xs font-medium flex items-center justify-center flex-shrink-0">{{ idx + 1 }}</div>
            <input type="text" v-model="p.name" class="flex-1 min-w-0 px-2 py-1 bg-transparent border border-neutral-800/40 rounded text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50" :placeholder="`Giocatore ${idx + 1}`"/>
            <button class="w-8 h-8 flex items-center justify-center rounded border border-neutral-800/60 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/60 hover:text-neutral-100 transition-colors" @click="() => { state.setup.players.splice(idx, 1); state.setup.numPlayers = state.setup.players.length; engineNormalizeRoleCounts(state); }">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="flex justify-end" />
        </div>
      </div>
    </div>
  </div>
</template>

