<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center p-4 space-y-4">
    <div class="text-neutral-400 text-sm">
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.NO_ACTION.title }}
    </div>
    <button 
      class="btn btn-primary w-full" 
      @click="onComplete({ skipped: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.NO_ACTION.buttonText }}
    </button>
  </div>
</template>
