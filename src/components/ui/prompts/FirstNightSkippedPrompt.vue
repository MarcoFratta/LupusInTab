<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
    <div class="text-slate-300 text-sm">
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.title }}
    </div>
    <div class="pt-2">
      <button 
        class="btn btn-primary w-full" 
        @click="onComplete({ skipped: true })"
      >
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.FIRST_NIGHT_SKIPPED.buttonText }}
      </button>
    </div>
  </div>
</template>
