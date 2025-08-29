<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center space-y-8">
    <div class="space-y-6">
      <div class="relative">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/40 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <svg class="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </div>
      </div>
      
      <div class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-bold text-neutral-100">
          {{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.title }}
        </h3>
        <div class="w-16 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
      </div>
    </div>

    <button 
      class="group relative px-8 py-3 text-lg font-semibold rounded-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40"
      @click="onComplete({ skipped: true })"
    >
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
      </div>
      
      <div class="relative z-10 flex items-center justify-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="font-semibold">{{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.buttonText }}</span>
      </div>
      
      <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </button>
  </div>
</template>
