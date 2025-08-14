<script setup>
const props = defineProps({
  title: { type: String, required: true },
  variant: { type: String, default: 'neutral' }, // 'wolf' | 'village' | 'violet' | 'emerald' | 'neutral'
});

function headerAccentClass(variant) {
  const v = String(variant || 'neutral');
  if (v === 'wolf') return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (v === 'village' || v === 'emerald') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (v === 'violet') return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  return 'text-neutral-300 border-neutral-600/40';
}
</script>

<template>
  <div class="bg-white/5 border border-white/10 rounded-lg py-2 px-4 w-full">
    <div class="flex items-center justify-center mb-2">
      <div class="font-semibold text-slate-100">{{ title }}</div>
    </div>
    <div class="text-left">
      <slot />
    </div>
  </div>
</template>


