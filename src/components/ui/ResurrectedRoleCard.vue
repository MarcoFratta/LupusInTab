<template>
  <div class="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
    <div class="flex items-center justify-center gap-2 mb-2">
      <div class="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
        <span class="text-emerald-400 text-lg">✨</span>
      </div>
      <span class="font-medium text-emerald-400">Resuscitato</span>
    </div>
    <div class="text-sm text-slate-300">
      <div class="font-medium truncate max-w-full" :title="player.name">{{ player.name }}</div>
      <div class="text-xs text-emerald-300 mt-1">È stato riportato in vita</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  player: any;
}>();
</script>
