<script setup>
const props = defineProps({
  cols: { type: Number, default: 2 }, // Number of columns in the grid
  gap: { type: String, default: '2' }, // Tailwind gap size (e.g., '2', '3', '4')
});

const gridClass = `grid grid-cols-${props.cols} gap-${props.gap}`;
</script>

<template>
  <div :class="gridClass">
    <slot />
  </div>
</template>
