<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';

const props = withDefaults(defineProps<{
  team: string;
  labelText: string;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  team: 'villaggio',
  size: 'md'
});

const faction = computed(() => getFactionConfig(props.team));
const factionColor = computed(() => faction.value?.color || '#9ca3af');

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return 'text-[10px] px-1.5 py-0.5';
  }
  if (props.size === 'lg') {
    return 'text-sm px-3 py-1.5';
  }
  return 'text-[11px] px-2 py-0.5';
});

const circleSize = computed(() => {
  if (props.size === 'sm') {
    return 'w-1.5 h-1.5';
  }
  if (props.size === 'lg') {
    return 'w-2.5 h-2.5';
  }
  return 'w-2 h-2';
});
</script>

<template>
  <span class="inline-flex items-center justify-center rounded font-semibold border"
        :class="[sizeClasses, props.size === 'lg' ? 'gap-2' : 'gap-1.5']"
        :style="{ 
          backgroundColor: hexToRgba(factionColor, 0.2) || undefined, 
          color: factionColor, 
          borderColor: hexToRgba(factionColor, 0.4) || undefined 
        }">
    <span :class="['rounded-full bg-current flex-shrink-0', circleSize]"></span>
    <span class="leading-none flex items-center">{{ labelText }}</span>
  </span>
</template>
