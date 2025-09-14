<script setup lang="ts">
import { computed, ref } from 'vue';
import { DiscussionTimer, SetupTitle } from '../ui';
import PromptSelect from '../ui/prompts/PromptSelect.vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

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

// Choices for select boxes
const lynchChoices = computed(() => [
  { label: t('dayPhase.selectPlayer'), value: null },
  ...alivePlayers.value.map((p: any) => ({ 
    label: `${props.state.sindacoId === p.id ? '★ ' : ''}${p.name}`, 
    value: p.id 
  }))
]);

const sindacoChoices = computed(() => [
  { label: t('dayPhase.selectPlayer'), value: null },
  ...alivePlayers.value.map((p: any) => ({ 
    label: `${props.state.sindacoId === p.id ? '★ ' : ''}${p.name}`, 
    value: p.id 
  }))
]);

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
  <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-visible">
    <SetupTitle :title="`${t('dayPhase.day')} ${props.state.dayNumber}`" />
    
    <div class="w-full max-w-2xl space-y-4 mt-2 text-center">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl rounded-3xl"></div>
        <div class="relative space-y-4">
          <!-- Sindaco election step (first day only, when enabled and not yet elected) -->
          <div v-if="needsSindacoElection" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6 space-y-6">
            <div class="text-center space-y-4">
              <!-- Icon and title -->
              <div class="flex flex-col items-center space-y-3">
                <div class="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">{{ t('dayPhase.electMayor') }}</h3>
                  <div class="w-12 h-0.5 bg-gradient-to-r from-amber-500/50 to-yellow-500/50 mx-auto rounded-full"></div>
                </div>
                <p class="text-neutral-300 text-sm">{{ t('dayPhase.mayorVoteDescription') }}</p>
              </div>
            </div>
            
            <PromptSelect
              :label="t('dayPhase.whoToElectAsMayor')"
              v-model="selectedId"
              :choices="sindacoChoices"
              :buttonText="t('rolePrompts.confirmMayor')"
              accent="emerald"
              :disabled="sindacoChoices.length === 0"
              @confirm="confirmSindaco"
            />
          </div>

      <!-- First day skipped (only after Sindaco election if enabled) -->
      <div v-else-if="showSkipCard" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6 space-y-4 text-center">
        <div class="space-y-4">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <div>
            <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">{{ t('dayPhase.firstDayLynchSkipped') }}</h3>
            <div class="w-12 h-0.5 bg-gradient-to-r from-amber-500/50 to-orange-500/50 mx-auto rounded-full"></div>
          </div>
        </div>

        <button 
          class="group relative w-full px-6 py-3 text-base
          font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
          @click="props.onSkipDay"
        >
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80"></div>
          </div>
          
          <div class="relative z-10 flex justify-center items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <span class="font-medium">{{ t('dayPhase.goToNight') }}</span>
          </div>
          
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>

      <!-- Regular lynch voting (or first day lynch if not skipped) -->
      <div v-else class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6 space-y-6">
        <div class="text-center space-y-4">
          <!-- Icon and title -->
          <div class="flex flex-col items-center space-y-3">
            <div class="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">{{ t('dayPhase.selectPlayerToLynch') }}</h3>
              <div class="w-12 h-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 mx-auto rounded-full"></div>
              <p class="text-neutral-300 text-sm mt-3">{{ t('dayPhase.timeToVote') }}</p>
            </div>
          </div>
        </div>

        <DiscussionTimer :enabled="discussionEnabled" :alivePlayersCount="alivePlayers.length" />

        <PromptSelect
          :label="t('dayPhase.whoToLynch')"
          v-model="selectedId"
          :choices="lynchChoices"
          :buttonText="t('rolePrompts.confirmLynch')"
          accent="red"
          :disabled="lynchChoices.length === 0"
          @confirm="confirmLynch"
        />
      </div>
        </div>
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



