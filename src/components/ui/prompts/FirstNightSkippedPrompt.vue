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
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </div>
      
      <div>
        <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">
          {{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.title }}
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
      </div>
    </div>

    <button 
      class="group relative px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
      @click="onComplete({ skipped: true })"
    >
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
      </div>
      
      <div class="relative z-10 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="font-medium">{{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.buttonText }}</span>
      </div>
      
      <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </button>
  </div>
</template>
