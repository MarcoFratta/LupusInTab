<script setup lang="ts">
import { useGameStore } from '../../stores/game';
import { watch } from 'vue';
import { saveSettings } from '../../utils/storage';

const store = useGameStore();
const state = store.state as any;

watch(() => state.settings, () => {
  saveSettings({
    skipFirstNightActions: !!state.settings.skipFirstNightActions,
    enableSindaco: !!state.settings.enableSindaco,
    discussionTimerEnabled: !!state.settings.discussionTimerEnabled,
  });
}, { deep: true });
</script>

<template>
  <div class="space-y-6 text-center px-4 sm:px-0 sm:pb-0">
    <!-- Desktop Page Navigation (hidden on mobile) -->
    <div class="hidden sm:flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg w-full text-sm">
      <a href="/setup/home" class="flex-1 text-center py-1 btn btn-ghost"> Home </a>
      <a href="/setup/roles" class="flex-1 text-center py-1 btn btn-ghost"> Ruoli </a>
      <a href="/setup/players" class="flex-1 text-center py-1 btn btn-ghost"> Giocatori </a>
      <a href="/setup/settings" class="flex-1 text-center py-1 btn btn-primary shadow-sm" aria-current="page"> Impostazioni </a>
    </div>

    <!-- Page Content -->
    <div class="space-y-4 px-4 sm:px-0">
      <!-- Header Section -->
      <div class="text-center space-y-3">
        <div class="space-y-2">
          <h2 class="text-xl sm:text-xl font-bold text-neutral-100">Impostazioni di Gioco</h2>
          <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Personalizza le regole e le funzionalità per questa partita.
          </p>
        </div>
      </div>

      <!-- Settings Configuration -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-medium text-neutral-300">Opzioni di Gioco</h3>
          <div class="flex-1 h-px bg-neutral-800/50"></div>
          <span class="text-xs text-neutral-500 font-medium">{{ Object.values(state.settings).filter(Boolean).length }} attiv{{ Object.values(state.settings).filter(Boolean).length === 1 ? 'a' : 'e' }}</span>
        </div>
        
        <div class="space-y-2.5">
          <!-- Skip First Night Actions -->
          <div class="relative rounded-lg border border-neutral-800/40 p-3 transition-all duration-300 bg-neutral-900/50 overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation">
            <div class="flex flex-row justify-between gap-3">
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-neutral-200">Salta le azioni della prima notte</span>
                </div>
                <div class="text-xs text-neutral-400 leading-relaxed text-left">
                  Tutti i ruoli vengono chiamati nella Notte 1, ma i loro effetti sono ignorati.
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-center">
                <!-- Toggle switch -->
                <div class="relative w-12 h-6 bg-neutral-600 rounded-full cursor-pointer" 
                     :class="{ 'bg-blue-500': state.settings.skipFirstNightActions }"
                     @click="state.settings.skipFirstNightActions = !state.settings.skipFirstNightActions">
                  <div class="absolute top-1 w-4 h-4 rounded-full shadow transition-transform duration-200"
                       :class="{ 
                         'translate-x-6': state.settings.skipFirstNightActions, 
                         'translate-x-1 bg-white': !state.settings.skipFirstNightActions 
                       }"
                       :style="state.settings.skipFirstNightActions ? { backgroundColor: '#3b82f6' } : {}">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active indicator line -->
            <div v-if="state.settings.skipFirstNightActions" 
                 class="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 bg-blue-500">
            </div>
          </div>

          <!-- Enable Sindaco -->
          <div class="relative rounded-lg border border-neutral-800/40 p-3 transition-all duration-300 bg-neutral-900/50 overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation opacity-80">
            <div class="flex flex-row justify-between gap-3">
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-neutral-200">Abilita Sindaco</span>
                </div>
                <div class="text-xs text-neutral-400 leading-relaxed text-left">
                  Il voto del sindaco vale doppio durante la votazione quando è in vita.
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-center">
                <!-- Toggle switch -->
                <div class="relative w-12 h-6 bg-neutral-600 rounded-full cursor-pointer" 
                     :class="{ 'bg-blue-500': state.settings.enableSindaco }"
                     @click="state.settings.enableSindaco = !state.settings.enableSindaco">
                  <div class="absolute top-1 w-4 h-4 rounded-full shadow transition-transform duration-200"
                       :class="{ 
                         'translate-x-6': state.settings.enableSindaco, 
                         'translate-x-1 bg-white': !state.settings.enableSindaco 
                       }"
                       :style="state.settings.enableSindaco ? { backgroundColor: '#3b82f6' } : {}">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active indicator line -->
            <div v-if="state.settings.enableSindaco" 
                 class="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 bg-blue-500">
            </div>
          </div>

          <!-- Discussion Timer -->
          <div class="relative rounded-lg border border-neutral-800/40 p-3 transition-all duration-300 bg-neutral-900/50 overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation">
            <div class="flex flex-row justify-between gap-3">
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold text-neutral-200">Timer discussione (giorno)</span>
                </div>
                <div class="text-xs text-neutral-400 leading-relaxed text-left">
                  Mostra un timer compatto nella fase di linciaggio per la discussione (max 60 minuti).
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-center">
                <!-- Toggle switch -->
                <div class="relative w-12 h-6 bg-neutral-600 rounded-full cursor-pointer" 
                     :class="{ 'bg-blue-500': state.settings.discussionTimerEnabled }"
                     @click="state.settings.discussionTimerEnabled = !state.settings.discussionTimerEnabled">
                  <div class="absolute top-1 w-4 h-4 rounded-full shadow transition-transform duration-200"
                       :class="{ 
                         'translate-x-6': state.settings.discussionTimerEnabled, 
                         'translate-x-1 bg-white': !state.settings.discussionTimerEnabled 
                       }"
                       :style="state.settings.discussionTimerEnabled ? { backgroundColor: '#3b82f6' } : {}">
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Active indicator line -->
            <div v-if="state.settings.discussionTimerEnabled" 
                 class="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 bg-blue-500">
            </div>
          </div>
        </div>
      </div>

      <!-- Note -->
      <div class="text-center p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
        <div class="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <span>Le impostazioni vengono salvate automaticamente e si applicano a tutte le partite future.</span>
        </div>
      </div>
    </div>
  </div>
</template>

