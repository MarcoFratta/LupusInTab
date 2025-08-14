<script setup lang="ts">
import { computed } from 'vue';
import type { RoleDef } from '../types';

const props = defineProps<{
  role: RoleDef;
  count: number;
  maxCount: number;
  onCountChange: (newCount: number) => void;
}>();

const roleColors = {
  wolf: 'role-wolf',
  village: 'role-village'
};

const roleColor = computed(() => roleColors[(props.role.team as 'wolf'|'village')] || 'role-village');

function incrementCount() {
  if (props.count < props.maxCount) {
    props.onCountChange(props.count + 1);
  }
}

function decrementCount() {
  const min = props.role.id === 'lover' ? 2 : (props.role.id === 'villager' ? 0 : (props.role.team === 'wolf' ? 1 : 1));
  if (props.count > min) {
    props.onCountChange(props.count - 1);
  }
}

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const min = props.role.id === 'lover' ? 2 : (props.role.id === 'villager' ? 0 : (props.role.team === 'wolf' ? 1 : 1));
  const newCount = Math.max(min, Math.min(props.maxCount, parseInt(target.value) || 0));
  props.onCountChange(newCount);
}
</script>

<template>
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3 hover:bg-neutral-900/80 transition-colors"
       :class="role.team === 'wolf' ? 'border-red-500/30' : (role.team === 'crazyman' ? 'border-violet-500/30' : (role.team === 'dog' ? 'border-indigo-500/30' : 'border-emerald-500/30'))">
    <div class="space-y-1">
      <!-- Row 1: title + team pill (left) | selector (right) -->
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0 flex items-center gap-2">
          <h3 class="text-base font-semibold text-neutral-100 truncate">{{ role.name }}</h3>
          <span class="inline-flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium"
                :class="role.team === 'wolf' ? 'bg-red-500/20 text-red-400' : (role.team === 'crazyman' ? 'bg-violet-500/20 text-violet-400' : (role.team === 'dog' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'))">
            <span class="w-1 h-1 rounded-full bg-current"></span>
            {{ role.team === 'wolf' ? 'Wolf' : (role.team === 'crazyman' ? 'Crazyman' : (role.team === 'dog' ? 'Dog' : 'Village')) }}
          </span>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <button
            type="button"
            class="w-7 h-7 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count <= 0"
            @click="decrementCount"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <input
            type="number"
            :value="count"
            :min="0"
            :max="maxCount"
            class="w-14 px-2 py-1 text-center bg-neutral-800/60 border border-neutral-800/50 rounded text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-400/40 focus:border-neutral-500/40 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @input="handleInputChange"
          />
          <button
            type="button"
            class="w-7 h-7 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center transition-colors hover:bg-neutral-700/60 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
            :disabled="count >= maxCount"
            @click="incrementCount"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Row 2 removed to reduce card height -->
    </div>
  </div>
</template>
