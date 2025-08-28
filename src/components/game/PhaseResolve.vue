<script setup lang="ts">
import { ref } from 'vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import GhostButton from '../ui/GhostButton.vue';
import PrimaryButton from '../ui/PrimaryButton.vue';
import NightDetailsGrid from '../ui/NightDetailsGrid.vue';

const props = defineProps<{
  state: any;
  onContinue: () => void;
  onReset: () => void;
}>();

const showDetails = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div class="w-full max-w-2xl space-y-6 text-center">
      <h2 class="text-xl font-semibold text-slate-100">Esito della notte</h2>
      <div v-if="props.state.night.summary" class="space-y-4">
        <!-- Focus: Died -->
        <div class="bg-white/5 border border-white/10 rounded-lg p-6 w-full text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-400">
              <path d="M12 3C7.582 3 4 6.582 4 11v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4c0-4.418-3.582-8-8-8Z" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
              <path d="M9 16c1.333-.667 4.667-.667 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="font-semibold text-slate-100">Morti<span v-if="props.state.night.summary.died.length"> ({{ props.state.night.summary.died.length }})</span></div>
          </div>
            <div v-if="props.state.night.summary.died.length === 0" class="text-slate-400 text-sm">Nessun morto stanotte.</div>
          <div v-else class="mt-2 flex flex-wrap justify-center gap-2">
            <span 
              v-for="pid in props.state.night.summary.died" 
              :key="pid"
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium border bg-red-500/15 text-red-300 border-red-500/30"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span class="truncate max-w-[8rem]" :title="props.state.players.find((p: any) => p.id === pid)?.name">{{ props.state.players.find((p: any) => p.id === pid)?.name }}</span>
            </span>
          </div>
        </div>

        <!-- Resurrected Players -->
        <div v-if="props.state.night.summary.resurrected && props.state.night.summary.resurrected.length > 0" class="bg-white/5 border border-white/10 rounded-lg p-6 w-full text-center">
          <div class="flex items-center justify-center gap-2 mb-1">
            <span class="text-emerald-400 text-lg">✨</span>
            <div class="font-semibold text-emerald-400">Resuscitati<span v-if="props.state.night.summary.resurrected.length"> ({{ props.state.night.summary.resurrected.length }})</span></div>
          </div>
          <div class="mt-2 flex flex-wrap justify-center gap-2">
            <span 
              v-for="pid in props.state.night.summary.resurrected" 
              :key="pid"
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium border bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="truncate max-w-[8rem]" :title="props.state.players.find((p: any) => p.id === pid)?.name">{{ props.state.players.find((p: any) => p.id === pid)?.name }}</span>
            </span>
          </div>
        </div>

        <!-- Controls: two equal buttons, left and right -->
        <ButtonGroup>
          <GhostButton full-width @click="showDetails = !showDetails">
            {{ showDetails ? 'Nascondi dettagli' : 'Mostra dettagli' }}
          </GhostButton>
          <PrimaryButton full-width @click="props.onContinue">Continua</PrimaryButton>
        </ButtonGroup>

        <!-- Details section -->
        <NightDetailsGrid 
          v-if="showDetails" 
          :game-state="props.state" 
          :night-number="props.state.nightNumber" 
        />
      </div>
      <div v-else class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div class="text-slate-400">Risoluzione…</div>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for resolve phase */
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


