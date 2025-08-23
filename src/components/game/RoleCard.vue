<script setup lang="ts">
import { computed } from 'vue';
import type { RoleDef } from '../../types';
import { hexToRgba } from '../../utils/color';
import { getFactionConfig } from '../../factions';

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
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3 hover:bg-neutral-900/80 transition-colors w-full"
       :style="{ borderColor: hexToRgba(getFactionConfig(role.team)?.color || '#9ca3af', 0.3) || undefined }">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0 flex-1 flex flex-col justify-center">
        <h3 class="text-sm font-semibold leading-tight text-left truncate mb-1"
            :style="{ color: getFactionConfig(role.team)?.color || '#9ca3af' }">{{ role.name }}</h3>
        <span class="inline-flex w-max items-center gap-1 rounded text-[10px] font-medium px-1.5 py-0.5"
             :style="{ backgroundColor: hexToRgba(getFactionConfig(role.team)?.color || '#9ca3af', 0.15) || undefined, color: getFactionConfig(role.team)?.color || '#9ca3af' }">
          <span class="w-1 h-1 rounded-full bg-current flex-shrink-0"></span>
          <span class="leading-none">{{ getFactionConfig(role.team)?.displayName || role.team }}</span>
        </span>
      </div>
      <div class="flex items-center">
        <button
          type="button"
          class="role-counter-btn w-8 h-8 rounded-l border border-r-0 border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
          :disabled="count <= (minCount || 0)"
          @click="decrementCount"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="role-counter-display w-8 h-8 bg-neutral-800/60 border border-neutral-800/50 flex items-center justify-center">
          <span class="text-sm font-semibold text-neutral-100 tabular-nums">{{ count }}</span>
        </div>
        <button
          type="button"
          class="role-counter-btn w-8 h-8 rounded-r border border-l-0 border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
          :disabled="count >=  maxCount"
          @click="incrementCount"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
