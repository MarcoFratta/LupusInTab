<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  variant: { type: String, default: 'neutral' }, // 'lupi' | 'villaggio' | 'violet' | 'emerald' | 'neutral'
});

function headerAccentClass(variant) {
  const v = String(variant || 'neutral');
  if (v === 'lupi') return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (v === 'villaggio' || v === 'emerald') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (v === 'violet') return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  return 'text-neutral-300 border-neutral-600/40';
}
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg py-3 px-4 w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="font-semibold text-slate-100">{{ title }}</div>
      <div v-if="subtitle" class="text-xs text-slate-400">{{ subtitle }}</div>
    </div>
    <div class="text-left">
      <slot />
    </div>
  </div>
</template>
