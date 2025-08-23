<script setup lang="ts">
import { GAME_CONSTANTS } from '../../../constants/game';

interface Props {
  onComplete: (result: any) => void;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center p-4 space-y-4">
    <div class="text-amber-400 text-4xl">{{ GAME_CONSTANTS.PROMPT_ICONS.BLOCKED }}</div>
    <div>
      <div class="text-neutral-100 font-medium text-lg">
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.BLOCKED.title }}
      </div>
      <div class="text-neutral-400 text-sm mt-1">
        {{ GAME_CONSTANTS.PROMPT_MESSAGES.BLOCKED.subtitle }}
      </div>
    </div>
    <button 
      class="btn btn-primary w-full" 
      @click="onComplete({ blocked: true })"
    >
      {{ GAME_CONSTANTS.PROMPT_MESSAGES.BLOCKED.buttonText }}
    </button>
  </div>
</template>
