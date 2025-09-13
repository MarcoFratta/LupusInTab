<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useNightPhase } from '../../composables/useNightPhase';
import { SetupTitle } from '../ui';
import {
  FirstNightSkippedPrompt,
  DeadPrompt,
  AlivePrompt,
  BlockedPrompt,
  StartNightPrompt,
  UsageLimitPrompt,
  NoActionPrompt
} from '../ui/prompts';

interface Props {
  state: any;
  onPromptComplete: (result: any) => void;
}

const props = defineProps<Props>();

const {
  currentPromptComponent,
  currentActor,
  currentRole,
  isFirstNightSkipped,
  shouldShowDeadPrompt,
  shouldShowAlivePrompt,
  shouldShowBlockedPrompt,
  shouldShowStartNightPrompt,
  shouldShowUsageLimitPrompt,
  currentGroupNames,
  roleDisplayInfo,
  currentTurn,
  getEarliestStartNight
} = useNightPhase();

const asyncPromptComponent = computed(() => {
  if (!currentPromptComponent.value) return null;
  const component = defineAsyncComponent(currentPromptComponent.value);
  return component;
});
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
    <SetupTitle 
      v-if="!currentRole" 
      title="Notte" 
    />
    <div v-else class="text-center space-y-3 overflow-visible py-3">
      <div class="relative overflow-visible">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-2xl md:blur-3xl rounded-full"></div>
        <h2 
          class="relative text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-lg drop-shadow-violet-500/50"
          :style="{ '--tw-gradient-from': roleDisplayInfo?.color || '#8b5cf6', '--tw-gradient-to': roleDisplayInfo?.color || '#a855f7' }"
        >
          {{ currentRole.name }}
        </h2>
      </div>
      <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
    </div>
    
    <div class="w-full max-w-2xl space-y-4 mt-2 text-center">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl rounded-3xl"></div>
        <div class="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          <!-- Players List -->
          <div v-if="currentGroupNames" class="text-center space-y-4 mb-8">
            <div class="space-y-2">
              <p class="text-sm text-neutral-300 font-medium">Possono aprire gli occhi:</p>
              <div class="flex flex-wrap justify-center gap-2">
                <span 
                  v-for="player in currentGroupNames" 
                  :key="player.id"
                  class="inline-flex items-center px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 text-sm font-medium"
                >
                  {{ player.name }}
                </span>
              </div>
            </div>
          </div>



          <FirstNightSkippedPrompt 
            v-if="isFirstNightSkipped" 
            :on-complete="props.onPromptComplete" 
          />

          <DeadPrompt 
            v-else-if="shouldShowDeadPrompt" 
            :on-complete="props.onPromptComplete" 
          />

          <AlivePrompt 
            v-else-if="shouldShowAlivePrompt" 
            :on-complete="props.onPromptComplete" 
          />

          <BlockedPrompt 
            v-else-if="shouldShowBlockedPrompt" 
            :on-complete="props.onPromptComplete" 
          />

          <StartNightPrompt 
            v-else-if="shouldShowStartNightPrompt" 
            :earliest-start-night="getEarliestStartNight()"
            :on-complete="props.onPromptComplete" 
          />

          <UsageLimitPrompt 
            v-else-if="shouldShowUsageLimitPrompt" 
            :on-complete="props.onPromptComplete" 
          />

          <component 
            v-else-if="asyncPromptComponent" 
            :is="asyncPromptComponent"
            :gameState="props.state" 
            :playerIds="currentTurn?.playerIds || []"
            :onComplete="props.onPromptComplete" 
          />

          <div 
            v-else-if="currentRole && currentRole.actsAtNight !== 'never'"
            class="text-center space-y-6"
          >
            <div class="space-y-4">
              <div class="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/40 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              
              <div class="space-y-3">
                <h3 class="text-lg sm:text-xl font-semibold text-red-100">
                  Errore: Prompt non trovato
                </h3>
                <div class="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-400 mx-auto rounded-full"></div>
                <p class="text-red-300 text-sm">
                  Impossibile trovare il prompt per il ruolo {{ currentRole.name }}. 
                  Questo potrebbe essere un errore del sistema.
                </p>
              </div>
            </div>
            
            <button 
              class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
              @click="props.onPromptComplete({ error: 'prompt_not_found' })"
            >
              Continua (con errore)
            </button>
          </div>

          <NoActionPrompt 
            v-else 
            :on-complete="props.onPromptComplete" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>


