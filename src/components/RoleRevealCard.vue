<script setup lang="ts">
import { getFactionConfig } from '../factions';
import FactionLabel from './ui/FactionLabel.vue';

const props = defineProps<{
  player: any;
  roleDef: any;
}>();

const emit = defineEmits<{
  next: [];
}>();

function handleNext() {
  emit('next');
}
</script>

<template>
  <div class="space-y-4" v-if="roleDef">
    <div class="rounded-xl p-4 border border-white/10" :style="{ background: (getFactionConfig(roleDef.team)?.color || '#111827') + '22' }">
      <div class="text-2xl font-extrabold tracking-tight" :style="{ color: getFactionConfig(roleDef.team)?.color || '#e5e7eb' }">{{ roleDef.name }}</div>
      <div v-if="roleDef.description" class="mt-2 text-sm text-neutral-300 leading-snug">{{ roleDef.description }}</div>
    </div>

    <div class="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 text-center">
      <div class="text-slate-200 text-lg font-semibold mb-4">La tua fazione</div>
      <div class="flex justify-center">
        <FactionLabel size="lg" :team="roleDef.team" :labelText="getFactionConfig(roleDef.team)?.displayName || roleDef.team" />
      </div>
    </div>

    <slot />

    <div class="pt-2">
      <button class="btn btn-primary w-full" @click="handleNext">Prossimo</button>
    </div>
  </div>
  <div v-else class="space-y-4">
    <div class="rounded-xl p-4 border border-white/10">
      <div class="text-2xl font-extrabold tracking-tight text-slate-200">Ruolo sconosciuto</div>
      <div class="mt-2 text-sm text-neutral-300 leading-snug">{{ player?.roleId }}</div>
    </div>
    <div class="pt-2">
      <button class="btn btn-primary w-full" @click="handleNext">Prossimo</button>
    </div>
  </div>
</template>


