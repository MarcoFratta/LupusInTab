<script setup lang="ts">
import { computed, ref } from 'vue';
import { DiscussionTimer } from '../ui';

const props = defineProps<{
  state: any;
  onLynch: (playerId: number) => void;
  onElectSindaco: (playerId: number) => void;
  onSkipDay: () => void;
  onReset: () => void;
}>();

const selectedId = ref<number | null>(null);
const alivePlayers = computed(() => props.state.players.filter((p: any) => p.alive));
const isFirstDay = computed(() => props.state.dayNumber === 1);
const sindacoEnabled = computed(() => !!props.state.settings?.enableSindaco);
const hasSindaco = computed(() => typeof props.state.sindacoId === 'number' && props.state.sindacoId > 0);
const needsSindacoElection = computed(() => isFirstDay.value && sindacoEnabled.value && !hasSindaco.value);
const isFirstDaySkipped = computed(() => !!props.state.settings?.skipFirstNightActions && isFirstDay.value);
const showSkipCard = computed(() => isFirstDaySkipped.value && !needsSindacoElection.value);

// Discussion timer settings (enabled via state.settings.discussionTimerEnabled)
const discussionEnabled = computed(() => !!props.state.settings?.discussionTimerEnabled);

function confirmLynch() {
  if (selectedId.value == null) return;
  props.onLynch(selectedId.value);
}

function confirmSindaco() {
  if (selectedId.value == null) return;
  props.onElectSindaco(selectedId.value);
  // After electing Sindaco, if skipping first day lynch, component will show the skip card
  // otherwise it will fall through to the lynch UI
  selectedId.value = null;
}
</script>

<template>
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
    <div class="text-center space-y-3 md:space-y-4">
      <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        Giorno {{ props.state.dayNumber }}
      </h2>
      <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
    </div>

    <div class="space-y-4 md:space-y-6">
      <!-- Sindaco election step (first day only, when enabled and not yet elected) -->
      <div v-if="needsSindacoElection" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 space-y-4">
        <div class="text-center mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Eleggi il Sindaco</h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
        </div>
        <p class="text-neutral-300 text-sm text-center">Il voto dell'eletto conterà come 2 per il resto della partita.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label v-for="p in alivePlayers" :key="p.id" class="group relative overflow-hidden rounded-xl border border-neutral-800/40 p-3 md:p-4 transition-all duration-300 bg-neutral-800/40 hover:bg-neutral-800/60 hover:border-neutral-700/50 active:scale-[0.98] cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative flex items-center gap-3">
              <div class="relative">
                <input 
                  class="sr-only" 
                  type="radio" 
                  name="sindaco" 
                  :value="p.id" 
                  v-model="selectedId" 
                />
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                     :class="selectedId === p.id ? 'border-violet-400 bg-violet-400' : 'border-neutral-500'">
                  <div v-if="selectedId === p.id" class="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              </div>
              <span class="font-medium text-neutral-200 truncate max-w-full" :title="p.name">
                <span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}
              </span>
            </div>
          </label>
        </div>
        
        <div class="pt-4">
          <button 
            class="group relative w-full px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="selectedId == null" 
            @click="confirmSindaco"
          >
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
            </div>
            
            <div class="relative z-10 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-medium">Conferma Sindaco</span>
            </div>
            
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
      </div>

      <!-- First day skipped (only after Sindaco election if enabled) -->
      <div v-else-if="showSkipCard" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 space-y-4 text-center">
        <div class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <div>
            <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Il linciaggio del primo giorno è saltato</h3>
            <div class="w-12 h-0.5 bg-gradient-to-r from-amber-500/50 to-orange-500/50 mx-auto rounded-full"></div>
          </div>
        </div>

        <button 
          class="group relative px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
          @click="props.onSkipDay"
        >
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80"></div>
          </div>
          
          <div class="relative z-10 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <span class="font-medium">Vai alla notte</span>
          </div>
          
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>

      <!-- Regular lynch voting (or first day lynch if not skipped) -->
      <div v-else class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 space-y-4">
        <div class="text-center mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Seleziona il giocatore da linciare</h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
        </div>

        <DiscussionTimer :enabled="discussionEnabled" :alivePlayersCount="alivePlayers.length" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label v-for="p in alivePlayers" :key="p.id" class="group relative overflow-hidden rounded-xl border border-neutral-800/40 p-3 md:p-4 transition-all duration-300 bg-neutral-800/40 hover:bg-neutral-800/60 hover:border-neutral-700/50 active:scale-[0.98] cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative flex items-center gap-3">
              <div class="relative">
                <input 
                  class="sr-only" 
                  type="radio" 
                  name="lynch" 
                  :value="p.id" 
                  v-model="selectedId" 
                />
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                     :class="selectedId === p.id ? 'border-violet-400 bg-violet-400' : 'border-neutral-500'">
                  <div v-if="selectedId === p.id" class="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              </div>
              <span class="font-medium text-neutral-200 truncate max-w-full" :title="p.name">
                <span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}
              </span>
            </div>
          </label>
        </div>

        <div class="pt-4">
          <button 
            class="group relative w-full px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="selectedId == null" 
            @click="confirmLynch"
          >
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
            </div>
            
            <div class="relative z-10 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-medium">Conferma linciaggio</span>
            </div>
            
            <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
        
        <div class="pb-4"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for day phase */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
  
  /* Prevent horizontal overflow */
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>



