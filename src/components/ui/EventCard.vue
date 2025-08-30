<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  variant: { type: String, default: 'neutral' }, // 'lupi' | 'villaggio' | 'violet' | 'emerald' | 'neutral'
});
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg py-3 px-3 w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-slate-100">{{ title }}</div>
      <div v-if="subtitle" class="text-xs text-slate-400">{{ subtitle }}</div>
    </div>
    <div class="text-left">
      <slot />
    </div>
  </div>
</template>
