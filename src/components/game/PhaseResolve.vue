<script setup lang="ts">
import { ref } from 'vue';
import Swal from 'sweetalert2';
import ButtonGroup from '../ui/ButtonGroup.vue';
import GhostButton from '../ui/GhostButton.vue';
import PrimaryButton from '../ui/PrimaryButton.vue';
import NightDetailsGrid from '../ui/NightDetailsGrid.vue';
import { SetupTitle } from '../ui';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  state: any;
  onContinue: () => void;
  onReset: () => void;
  onReplay?: () => void;
}>();

const showDetails = ref(false);
</script>

<template>
     <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
       <SetupTitle :title="t('phaseResolve.title')" />
     <div class="w-full max-w-2xl space-y-4 mt-2 text-center">

    <!-- Mobile-First Content Sections -->
    <div class="space-y-4 md:space-y-6">
      
      <!-- Night Summary Section -->
      <div v-if="props.state.night.summary" class="space-y-4">
        
        <!-- Events to Announce Header -->
        <div class="text-center space-y-2">
          <h3 class="text-lg font-semibold text-neutral-300">{{ t('phaseResolve.nightResults') }}</h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mx-auto"></div>
        </div>

        <!-- Night Results Card -->
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
          <div class="space-y-6">
            <!-- Deaths Section -->
            <div class="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-red-600/5 to-transparent transition-all duration-300 hover:border-red-500/30 hover:from-red-500/10">
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative p-0 md:p-2 lg:p-4">
                <div class="flex items-center justify-center gap-4 mb-4">
                  <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-all duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-400">
                        <path d="M12 3C7.582 3 4 6.582 4 11v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4c0-4.418-3.582-8-8-8Z" stroke="currentColor" stroke-width="1.5"/>
                        <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                        <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                        <path d="M9 16c1.333-.667 4.667-.667 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div class="absolute inset-0 rounded-full bg-red-400/20 animate-pulse pointer-events-none"></div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-lg bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">
                      {{ t('phaseResolve.deaths') }}
                    </div>
                    <div class="text-red-400 text-sm font-medium">
                      {{ props.state.night.summary.died.length }} {{ props.state.night.summary.died.length === 1 ? t('phaseResolve.player') : t('phaseResolve.players') }}
                    </div>
                  </div>
                </div>
                
                <div v-if="props.state.night.summary.died.length === 0" class="text-center py-2">
                  <div class="text-red-400 text-2xl mb-2">🌅</div>
                  <div class="text-red-300 text-sm font-medium mb-1">{{ t('phaseResolve.noDeaths') }}</div>
                  <div class="text-red-400/70 text-xs">{{ t('phaseResolve.peacefulNight') }}</div>
                </div>
                
                <div v-else class="space-y-3">
                  <div class="flex flex-wrap gap-3 justify-center">
                    <div 
                      v-for="pid in props.state.night.summary.died" 
                      :key="pid"
                      class="group/item relative"
                    >
                      <div class="inline-flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border bg-red-600/80 text-white border-red-500/60 hover:bg-red-500/80 hover:border-red-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-red-900/50">
                        <span class="w-2 h-2 rounded-full bg-red-300"></span>
                        <span class="font-semibold truncate max-w-full" :title="props.state.players.find((p: any) => p.id === pid)?.name">
                          {{ props.state.players.find((p: any) => p.id === pid)?.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Resurrected Section -->
            <div v-if="props.state.night.summary.resurrected && props.state.night.summary.resurrected.length > 0" class="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-emerald-600/5 to-transparent transition-all duration-300 hover:border-emerald-500/30 hover:from-emerald-500/10">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative p-0 sm:p-2 lg:p-4">
                <div class="flex items-center justify-center gap-4 mb-4">
                  <div class="relative">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-300">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-emerald-400">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse pointer-events-none"></div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-lg bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                      {{ t('phaseResolve.resurrected') }}
                    </div>
                    <div class="text-emerald-400 text-sm font-medium">
                      {{ props.state.night.summary.resurrected.length }} {{ props.state.night.summary.resurrected.length === 1 ? t('phaseResolve.player') : t('phaseResolve.players') }}
                    </div>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-3 justify-center">
                    <div 
                      v-for="pid in props.state.night.summary.resurrected" 
                      :key="pid"
                      class="group/item relative"
                    >
                      <div class="inline-flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium border bg-emerald-600/80 text-white border-emerald-500/60 hover:bg-emerald-500/80 hover:border-emerald-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/50">
                        <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
                        <span class="font-semibold truncate max-w-full" :title="props.state.players.find((p: any) => p.id === pid)?.name">
                          {{ props.state.players.find((p: any) => p.id === pid)?.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 border-t border-neutral-700/50">
              <div class="space-y-4">
                <ButtonGroup>
                  <GhostButton full-width @click="showDetails = !showDetails">
                    {{ showDetails ? t('phaseResolve.hide') : t('phaseResolve.details') }}
                  </GhostButton>
                  <GhostButton v-if="props.onReplay && props.state?.custom?.nightSnapshot" full-width @click="async () => {
                    const result = await Swal.fire({
                      title: t('phaseResolve.confirmReplayTitle'),
                      text: t('phaseResolve.confirmReplayText'),
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: t('phaseResolve.confirm'),
                      cancelButtonText: t('phaseResolve.cancel'),
                      background: '#0a0a0a',
                      color: '#e5e7eb',
                      customClass: {
                        popup: 'rounded-2xl border border-neutral-800/60',
                        title: 'text-violet-300 font-semibold',
                        htmlContainer: 'text-neutral-300',
                        actions: 'swal2-actions gap-2 sm:gap-3',
                        confirmButton: 'swal2-confirm btn btn-primary mr-2',
                        cancelButton: 'swal2-cancel btn btn-ghost ml-2'
                      },
                      buttonsStyling: false
                    });
                    if (result.isConfirmed) props.onReplay && props.onReplay();
                  }">
                    {{ t('phaseResolve.replayNight') }}
                  </GhostButton>
                  <div class="col-span-2 mt-2">
                    <PrimaryButton full-width @click="props.onContinue">{{ t('phaseResolve.continue') }}</PrimaryButton>
                  </div>
                </ButtonGroup>
              </div>
            </div>
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
          <div class="text-neutral-400">{{ t('phaseResolve.resolving') }}</div>
        </div>
      </div>
      
      <!-- Help Text -->
      <div class="text-center text-xs text-neutral-500">
        {{ t('phaseResolve.reloadHelp') }}
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
    min-height: 100dvh;
  }
  
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  /* Ensure proper spacing on mobile */
  .space-y-6 > * + * {
    margin-top: 1rem;
  }
  
  /* Adjust card padding for mobile */
  .group.relative.overflow-hidden.rounded-2xl {
    padding: 1rem;
  }
  
  /* Better text sizing on mobile */
  .text-lg {
    font-size: 1rem;
  }
  
  /* Ensure player name tags don't overflow */
  .truncate.max-w-full {
    max-width: 8rem;
  }
}

/* Enhanced animations for better UX */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group.relative.overflow-hidden.rounded-2xl {
  animation: fadeInUp 0.6s ease-out;
}

.group.relative.overflow-hidden.rounded-2xl:nth-child(2) {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

/* Smooth hover transitions */
.group:hover .group-hover\:shadow-emerald-500\/30,
.group:hover .group-hover\:shadow-red-500\/30 {
  transition: box-shadow 0.3s ease;
}

/* Better focus states for accessibility */
.group:focus-within {
  outline: 2px solid rgba(139, 92, 246, 0.5);
  outline-offset: 2px;
}

/* Improved text rendering */
.font-bold, .font-semibold, .font-medium {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>


