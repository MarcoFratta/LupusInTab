<script setup lang="ts">
import { computed } from 'vue';
import type { RoleDef } from '../types';
import { hexToRgba } from '../utils/color';
import { getFactionConfig } from '../factions';

const props = defineProps<{
  role: RoleDef;
  count: number;
  maxCount: number;
  minCount?: number;
  onCountChange: (newCount: number) => void;
}>();

function incrementCount() {
  const min = Math.max(0, Number(props.minCount || 0));
  if (props.count === 0 && min > 0) {
    if (min <= props.maxCount) props.onCountChange(min);
    return;
  }
  if (props.count < props.maxCount) {
    props.onCountChange(props.count + 1);
  }
}

function decrementCount() {
  const min = Math.max(0, Number(props.minCount || 0));
  if (min > 0 && props.count === min) {
    // Cannot go below minimum count for roles that require it
    return;
  }
  if (props.count > 0) {
    props.onCountChange(props.count - 1);
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const min = Math.max(0, Number(props.minCount || 0));
  let raw = parseInt(target.value);
  if (!Number.isFinite(raw)) raw = 0;
  
  // If role has minCount > 0, cannot set to 0
  if (raw === 0 && min > 0) {
    props.onCountChange(min);
    return;
  }
  
  if (raw === 0) {
    props.onCountChange(0);
    return;
  }
  
  const clamped = Math.max(min, Math.min(props.maxCount, raw));
  props.onCountChange(clamped);
}
</script>

<template>
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-2 sm:p-3 hover:bg-neutral-900/80 transition-colors"
       :style="{ borderColor: hexToRgba(getFactionConfig(role.team)?.color || '#9ca3af', 0.3) || undefined }">
    <div class="space-y-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1 flex flex-col gap-1">
          <div class="flex flex-col md:flex-row md:items-start gap-1 md:gap-2">
            <h3 class="text-sm font-semibold leading-tight truncate text-left md:order-1"
                :style="{ color: getFactionConfig(role.team)?.color || '#9ca3af' }">{{ role.name }}</h3>
            <span class="inline-flex w-max items-center gap-1.5 rounded text-[10px] sm:text-[10px]
            font-medium px-1.5 py-0.5 md:order-2 md:self-start"
                 :style="{ backgroundColor: hexToRgba(getFactionConfig(role.team)?.color || '#9ca3af', 0.2) || undefined, color: getFactionConfig(role.team)?.color || '#9ca3af' }">
              <span class="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
              <span class="leading-none">{{ getFactionConfig(role.team)?.displayName || role.team }}</span>
            </span>
          </div>
        </div>
        <div class="shrink-0 self-center flex items-center gap-1 sm:gap-1">
          <button
            type="button"
            class="w-5 h-5 sm:w-5 sm:w-5 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count <= (minCount || 0)"
            @click="decrementCount"
          >
            <svg width="8" height="8" class="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <input
            type="number"
            :value="count"
            :min="minCount || 0"
            :max="maxCount"
            class="w-8 sm:w-8 h-5 sm:h-5 px-1 py-0 text-center bg-neutral-800/60 border border-neutral-800/50 rounded text-neutral-100 text-xs leading-none focus:outline-none focus:ring-1 focus:ring-neutral-400/40 focus:border-neutral-500/40 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @input="handleInputChange"
          />
          <button
            type="button"
            class="w-5 h-5 sm:w-5 sm:h-5 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count >= maxCount"
            @click="incrementCount"
          >
            <svg width="8" height="8" class="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
