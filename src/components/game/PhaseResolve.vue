<script setup lang="ts">
import { ref } from 'vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import GhostButton from '../ui/GhostButton.vue';
import PrimaryButton from '../ui/PrimaryButton.vue';
import NightDetailsGrid from '../ui/NightDetailsGrid.vue';
import { SetupTitle } from '../ui';

const props = defineProps<{
  state: any;
  onContinue: () => void;
  onReset: () => void;
}>();

const showDetails = ref(false);
</script>

<template>
     <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
       <SetupTitle title="Esito della Notte" />
     <div class="w-full max-w-2xl space-y-4 mt-2 text-center">

    <!-- Mobile-First Content Sections -->
    <div class="space-y-4 md:space-y-6">
      
      <!-- Night Summary Section -->
      <div v-if="props.state.night.summary" class="space-y-4">
        
        <!-- Deaths Card -->
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
          <div class="text-center">
            <div class="flex items-center justify-center gap-3 mb-3">
              <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-500/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-400">
                  <path d="M12 3C7.582 3 4 6.582 4 11v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4c0-4.418-3.582-8-8-8Z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                  <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                  <path d="M9 16c1.333-.667 4.667-.667 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div v-if="props.state.night.summary.died.length > 0" class="text-2xl md:text-3xl font-bold text-red-400">
                {{ props.state.night.summary.died.length }}
              </div>
              <h3 class="text-lg md:text-xl font-semibold text-neutral-200">Morti</h3>
            </div>
            <div v-if="props.state.night.summary.died.length === 0" class="text-sm text-neutral-400">
              Nessun morto stanotte
            </div>
          </div>
          
          <div v-if="props.state.night.summary.died.length > 0" class="space-y-3">
            <div class="flex flex-wrap justify-center gap-2">
              <span 
                v-for="pid in props.state.night.summary.died" 
                :key="pid"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/20 transition-all duration-200"
              >
                <span class="w-2 h-2 rounded-full bg-red-400"></span>
                <span class="truncate max-w-[8rem]" :title="props.state.players.find((p: any) => p.id === pid)?.name">
                  {{ props.state.players.find((p: any) => p.id === pid)?.name }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Resurrected Card -->
        <div v-if="props.state.night.summary.resurrected && props.state.night.summary.resurrected.length > 0" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
          <div class="text-center mb-4">
            <div class="flex items-center justify-center gap-3 mb-3">
              <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-emerald-400">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </div>
              <div class="text-2xl md:text-3xl font-bold text-emerald-400">
                {{ props.state.night.summary.resurrected.length }}
              </div>
              <h3 class="text-lg md:text-xl font-semibold text-neutral-200">Resuscitati</h3>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex flex-wrap justify-center gap-2">
              <span 
                v-for="pid in props.state.night.summary.resurrected" 
                :key="pid"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-200"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="truncate max-w-[8rem]" :title="props.state.players.find((p: any) => p.id === pid)?.name">
                  {{ props.state.players.find((p: any) => p.id === pid)?.name }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
          <div class="space-y-3">
            <ButtonGroup>
              <GhostButton full-width @click="showDetails = !showDetails">
                {{ showDetails ? 'Nascondi' : 'Dettagli' }}
              </GhostButton>
              <PrimaryButton full-width @click="props.onContinue">Continua</PrimaryButton>
            </ButtonGroup>
          </div>
        </div>

        <!-- Night Details Grid -->
        <NightDetailsGrid 
          v-if="showDetails" 
          :game-state="props.state" 
          :night-number="props.state.nightNumber" 
        />
      </div>
      
      <!-- Loading State -->
      <div v-else class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
        <div class="flex items-center justify-center gap-3">
          <div class="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <div class="text-neutral-400">Risoluzione in corso…</div>
        </div>
      </div>
      
      <!-- Help Text -->
      <div class="text-center text-xs text-neutral-500">
        Ricarica per iniziare una nuova partita dal menu principale
      </div>
      </div>
     </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for resolve phase */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh;
  }
  
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>


