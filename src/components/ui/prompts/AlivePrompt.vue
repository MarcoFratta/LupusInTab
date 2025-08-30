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
      <div class="text-green-400 text-5xl sm:text-6xl">{{ GAME_CONSTANTS.PROMPT_ICONS.ALIVE }}</div>
      
      <div class="space-y-3">
        <h3 class="text-xl sm:text-2xl font-bold text-neutral-100">
          {{ GAME_CONSTANTS.PROMPT_MESSAGES.ALIVE.title }}
        </h3>
        <div class="w-16 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full"></div>
        <p class="text-neutral-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          {{ GAME_CONSTANTS.PROMPT_MESSAGES.ALIVE.subtitle }}
        </p>
      </div>
    </div>
    
    <button 
      class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
      @click="onComplete({ skipped: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.ALIVE.buttonText }}
    </button>
  </div>
</template>
