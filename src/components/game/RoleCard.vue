<script setup lang="ts">
import { computed } from 'vue';
import type { RoleDef } from '../../types';
import { hexToRgba } from '../../utils/color';
import { getFactionConfig } from '../../factions';
import { getRoleDisplayName } from '../../utils/roleUtils';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

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
  <div class="group relative overflow-hidden bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 hover:bg-neutral-900/80 transition-all duration-300 hover:scale-[1.02] w-full">
    
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div class="relative flex flex-col space-y-3 items-center text-center">
      <div class="flex items-center justify-center w-full">
        <h3 class="w-full text-center text-sm font-semibold leading-tight truncate"
             :style="{ color: getFactionConfig(role.team)?.color || '#9ca3af' }">
          {{ getRoleDisplayName(role.id, t) }}
        </h3>
      </div>
      
      <div class="flex items-center justify-center">
        <button
          type="button"
          class="role-counter-btn w-7 h-7 rounded-l-lg border border-r-0 border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-all duration-200 hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95"
          :disabled="count <= (minCount || 0)"
          @click="decrementCount"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="role-counter-display w-8 h-7 bg-neutral-800/60 border border-neutral-800/50 flex items-center justify-center">
          <span class="text-sm font-bold text-neutral-100 tabular-nums">{{ count }}</span>
        </div>
        
        <button
          type="button"
          class="role-counter-btn w-7 h-7 rounded-r-lg border border-l-0 border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-all duration-200 hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95"
          :disabled="count >= maxCount"
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
