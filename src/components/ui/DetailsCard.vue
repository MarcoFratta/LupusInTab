<script setup>
const props = defineProps({
  title: { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // legacy; unused for styling now
  color: { type: String, default: '' }, // hex color for title text
});

function titleStyle(color) {
  if (!color) return {};
  return { color };
}
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg py-2 px-3 w-full">
    <div class="flex items-center justify-center mb-2">
      <div class="font-semibold" :style="titleStyle(color)">{{ title }}</div>
    </div>
    <div class="text-left">
      <slot />
    </div>
  </div>
</template>


