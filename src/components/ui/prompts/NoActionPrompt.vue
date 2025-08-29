<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center space-y-6">
    <div class="space-y-4">
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 border border-neutral-500/40 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-500/20">
        <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <div class="space-y-3">
        <h3 class="text-lg sm:text-xl font-semibold text-neutral-100">
          {{ GAME_CONSTANTS.PROMPT_MESSAGES.NO_ACTION.title }}
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
      </div>
    </div>
    
    <button 
      class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
      @click="onComplete({ skipped: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.NO_ACTION.buttonText }}
    </button>
  </div>
</template>
