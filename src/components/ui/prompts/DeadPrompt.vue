<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center p-4 space-y-4">
    <div class="text-red-400 text-4xl">{{ GAME_CONSTANTS.PROMPT_ICONS.DEAD }}</div>
    <div>
      <div class="text-neutral-100 font-medium text-lg">
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.DEAD.title }}
      </div>
      <div class="text-neutral-400 text-sm mt-1">
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.DEAD.subtitle }}
      </div>
    </div>
    <button 
      class="btn btn-primary w-full" 
      @click="onComplete({ skipped: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.DEAD.buttonText }}
    </button>
  </div>
</template>
