<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  showStats?: boolean;
  statsData?: {
    enabled: number;
    disabled: number;
  };
}

defineProps<Props>();
</script>

<template>
  <div class="text-center space-y-3 md:space-y-4 overflow-visible">
    <div class="relative overflow-visible py-3">
      <div class="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-2xl md:blur-3xl rounded-full"></div>
      <h2 class="relative text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-lg">
        {{ title }}
      </h2>
    </div>
    
    <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
    
    <p v-if="subtitle" class="text-sm md:text-base text-neutral-400 max-w-md mx-auto leading-relaxed">
      {{ subtitle }}
    </p>
    
    <div v-if="showStats && statsData" class="flex items-center justify-center gap-3">
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <div class="w-3 h-3 rounded-full bg-violet-500"></div>
        <span class="text-sm font-medium text-neutral-200">Abilitati</span>
        <span class="text-sm font-bold text-violet-400">
          {{ statsData.enabled }}
        </span>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
        <div class="w-3 h-3 rounded-full bg-neutral-500"></div>
        <span class="text-sm font-medium text-neutral-200">Disabilitati</span>
        <span class="text-sm font-bold text-neutral-400">
          {{ statsData.disabled }}
        </span>
      </div>
    </div>
  </div>
</template>
