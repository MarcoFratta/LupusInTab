<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  earliestStartNight: number;
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center p-4 space-y-4">
    <div class="text-blue-400 text-4xl">{{ GAME_CONSTANTS.PROMPT_ICONS.START_NIGHT }}</div>
    <div>
      <div class="text-neutral-100 font-medium text-lg">
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.START_NIGHT.title }}
      </div>
      <div class="text-neutral-400 text-sm mt-1">
        Questo ruolo può essere usato a partire dalla notte {{ earliestStartNight }}
      </div>
    </div>
    <button 
      class="btn btn-primary w-full" 
      @click="onComplete({ skipped: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.START_NIGHT.buttonText }}
    </button>
  </div>
</template>
