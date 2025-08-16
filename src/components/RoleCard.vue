<script setup lang="ts">
import { computed } from 'vue';
import type { RoleDef } from '../types';
import { getFaction } from '../factions';
import { hexToRgba } from '../utils/color';

const props = defineProps<{
  role: RoleDef;
  count: number;
  maxCount: number;
  onCountChange: (newCount: number) => void;
}>();

const roleColors = {
  lupi: 'role-wolf',
  village: 'role-village'
};

const roleColor = computed(() => roleColors[(props.role.team as 'lupi'|'village')] || 'role-village');

function incrementCount() {
  if (props.count < props.maxCount) {
    props.onCountChange(props.count + 1);
  }
}

function decrementCount() {
  const min = props.role.id === 'lover' ? 2 : (props.role.id === 'villager' ? 0 : (props.role.team === 'lupi' ? 1 : 1));
  if (props.count > min) {
    props.onCountChange(props.count - 1);
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const min = props.role.id === 'lover' ? 2 : (props.role.id === 'villager' ? 0 : (props.role.team === 'lupi' ? 1 : 1));
  const newCount = Math.max(min, Math.min(props.maxCount, parseInt(target.value) || 0));
  props.onCountChange(newCount);
}
</script>

<template>
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-1.5 sm:p-2 hover:bg-neutral-900/80 transition-colors"
       :style="{ borderColor: hexToRgba(getFaction(role.team).color, 0.3) || undefined }">
    <div class="space-y-0.5">
      <!-- Role info and selector -->
      <div class="flex justify-between gap-1.5 sm:gap-2">
        <div class="min-w-0 flex-1 flex items-center gap-1.5 md:flex-col md:items-start">
          <h3 class="text-xs sm:text-sm font-semibold text-neutral-100 leading-tight truncate text-left md:order-1">{{ role.name }}</h3>
          <span class="inline-flex w-max items-center gap-1 rounded text-[9px] sm:text-[10px] font-medium px-1 py-0.5 md:order-2 md:self-start"
                :style="{ backgroundColor: hexToRgba(getFaction(role.team).color, 0.2) || undefined, color: getFaction(role.team).color }">
            <span class="w-1 h-1 rounded-full bg-current"></span>
            {{ getFaction(role.team).name }}
          </span>
        </div>
        <div class="shrink-0 self-center flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            class="w-4 h-4 sm:w-5 sm:h-5 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count <= 0"
            @click="decrementCount"
          >
            <svg width="7" height="7" class="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <input
            type="number"
            :value="count"
            :min="0"
            :max="maxCount"
            class="w-6 sm:w-8 h-4 sm:h-5 px-0.5 py-0 text-center bg-neutral-800/60 border border-neutral-800/50 rounded text-neutral-100 text-[10px] sm:text-xs leading-none focus:outline-none focus:ring-1 focus:ring-neutral-400/40 focus:border-neutral-500/40 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @input="handleInputChange"
          />
          <button
            type="button"
            class="w-4 h-4 sm:w-5 sm:h-5 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count >= maxCount"
            @click="incrementCount"
          >
            <svg width="7" height="7" class="sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Row 2 removed to reduce card height -->
    </div>
  </div>
</template>
