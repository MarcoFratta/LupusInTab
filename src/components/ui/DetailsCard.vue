<script setup>
import { hexToRgba } from '../../utils/color';
const props = defineProps({
  title: { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // legacy; kept for backward-compat
  color: { type: String, default: '' }, // hex color; if provided, overrides variant styling
});

function headerStyle(color) {
  if (!color) return {};
  const bg = hexToRgba(color, 0.18) || undefined;
  const border = hexToRgba(color, 0.35) || undefined;
  return { backgroundColor: bg, color, borderColor: border };
}
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg py-2 px-4 w-full">
    <div class="flex items-center justify-center mb-2">
      <div class="font-semibold px-2 py-1 rounded border"
           :style="headerStyle(color)">
        {{ title }}
      </div>
    </div>
    <div class="text-left">
      <slot />
    </div>
  </div>
</template>


