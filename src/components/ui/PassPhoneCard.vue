<script setup lang="ts">
import { LongPressButton } from './index';

const props = defineProps<{
  playerName: string;
  buttonText?: string;
  buttonSize?: 'md' | 'lg';
  onActivate: () => void;
}>();

const defaultButtonText = props.buttonText || 'Rivela';
const defaultButtonSize = props.buttonSize || 'lg';
</script>

<template>
  <div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6 text-center">
    <div class="space-y-4">
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div>
        <div class="text-neutral-300 text-base md:text-lg mb-2">Passa il telefono a</div>
        <div class="text-2xl md:text-3xl font-bold text-neutral-100 mb-4 truncate max-w-full" :title="playerName">
          {{ playerName }}
        </div>
      </div>
      <LongPressButton
        class="w-full"
        :size="defaultButtonSize"
        @activate="onActivate"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        {{ defaultButtonText }}
      </LongPressButton>
    </div>
  </div>
</template>
