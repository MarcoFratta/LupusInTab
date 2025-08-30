<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  enabled: boolean;
  alivePlayersCount?: number;
  onComplete?: (result: any) => void;
}

const props = defineProps<Props>();

const ticking = ref(false);
const plannedSeconds = ref(0);
const timerInput = ref<string>('');
const interval = ref<number | null>(null);

const mmss = computed(() => {
  const m = Math.floor(plannedSeconds.value / 60);
  const s = plannedSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const displayValue = computed(() => ticking.value ? mmss.value : (timerInput.value || ''));

const defaultSeconds = computed(() => {
  if (props.alivePlayersCount && props.alivePlayersCount > 0) {
    return Math.min(60 * 60, Math.max(30, props.alivePlayersCount * 30));
  }
  return 300;
});

const defaultMinutes = computed(() => Math.floor(defaultSeconds.value / 60));

watch(() => props.enabled, (newVal) => {
  if (newVal && !timerInput.value) {
    plannedSeconds.value = defaultSeconds.value;
    timerInput.value = `${String(defaultMinutes.value).padStart(2, '0')}:${String(defaultSeconds.value % 60).padStart(2, '0')}`;
  }
}, { immediate: true });

function startDiscussionTimer() {
  if (plannedSeconds.value <= 0) return;
  
  ticking.value = true;
  interval.value = window.setInterval(() => {
    plannedSeconds.value--;
    if (plannedSeconds.value <= 0) {
      stopDiscussionTimer();
    }
  }, 1000);
}

function stopDiscussionTimer() {
  ticking.value = false;
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
  }
}

function increasePlanned() {
  if (plannedSeconds.value < 60 * 60) {
    plannedSeconds.value += 60;
    timerInput.value = `${String(Math.floor(plannedSeconds.value / 60)).padStart(2, '0')}:${String(plannedSeconds.value % 60).padStart(2, '0')}`;
  }
}

function decreasePlanned() {
  if (plannedSeconds.value > 60) {
    plannedSeconds.value -= 60;
    timerInput.value = `${String(Math.floor(plannedSeconds.value / 60)).padStart(2, '0')}:${String(plannedSeconds.value % 60).padStart(2, '0')}`;
  }
}

function onTimerInput(e: any) {
  const value = e.target.value;
  const parts = value.split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0]) || 0;
    const s = parseInt(parts[1]) || 0;
    if (m >= 0 && m <= 60 && s >= 0 && s < 60) {
      plannedSeconds.value = m * 60 + s;
      timerInput.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }
}
</script>

<template>
  <div v-if="enabled" class="rounded-md border border-neutral-700/60 bg-neutral-900/50 p-3">
    <div class="text-xs text-center text-neutral-400">Timer discussione</div>
    <div class="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
      <div class="flex items-center gap-2 sm:gap-1 justify-center sm:justify-start">
        <button class="w-9 h-9 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center text-lg font-medium leading-none"
                :class="{ 'btn-disabled': ticking || plannedSeconds <= 0 }"
                :disabled="ticking || plannedSeconds <= 0"
                @click="decreasePlanned">−</button>
        <div class="w-28 h-9 px-2 rounded bg-neutral-800/60 border text-neutral-100 text-sm font-mono tracking-widest flex items-center justify-center leading-none"
             :class="ticking ? 'border-emerald-500/50' : 'border-neutral-700/60'">
          {{ ticking ? mmss : (plannedSeconds > 0 ? `${String(Math.floor(plannedSeconds/60)).padStart(2,'0')}:${String(plannedSeconds%60).padStart(2,'0')}` : '00:00') }}
        </div>
        <button class="w-9 h-9 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center text-lg font-medium leading-none"
                :class="{ 'btn-disabled': ticking || plannedSeconds >= 60*60 }"
                :disabled="ticking || plannedSeconds >= 60*60"
                @click="increasePlanned">+</button>
      </div>
      <div class="flex items-center gap-2 sm:ml-auto">
        <button class="btn btn-secondary h-9 w-full sm:w-auto" :class="{ 'btn-disabled': !ticking }" :disabled="!ticking" @click="stopDiscussionTimer">Stop</button>
        <button class="btn btn-primary h-9 w-full sm:w-auto" :class="{ 'btn-disabled': ticking || plannedSeconds <= 0 }"
                :disabled="ticking || plannedSeconds <= 0" @click="startDiscussionTimer">Avvia</button>
      </div>
    </div>
  </div>
</template>
