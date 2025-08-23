<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  state: any;
  onLynch: (playerId: number) => void;
  onElectSindaco: (playerId: number) => void;
  onSkipDay: () => void;
  onReset: () => void;
}>();

const selectedId = ref<number | null>(null);
const alivePlayers = computed(() => props.state.players.filter((p: any) => p.alive));
const isFirstDay = computed(() => props.state.dayNumber === 1);
const sindacoEnabled = computed(() => !!props.state.settings?.enableSindaco);
const hasSindaco = computed(() => typeof props.state.sindacoId === 'number' && props.state.sindacoId > 0);
const needsSindacoElection = computed(() => isFirstDay.value && sindacoEnabled.value && !hasSindaco.value);
const isFirstDaySkipped = computed(() => !!props.state.settings?.skipFirstNightActions && isFirstDay.value);
const showSkipCard = computed(() => isFirstDaySkipped.value && !needsSindacoElection.value);

// Discussion timer settings (enabled via state.settings.discussionTimerEnabled)
const discussionEnabled = computed(() => !!props.state.settings?.discussionTimerEnabled);
const discussionSeconds = ref<number>(0);
// Planned time in seconds (edited via +/- by 30s)
const plannedSeconds = ref<number>(0);
const timerInput = ref<string>('');
const ticking = ref<boolean>(false);
let intervalId: any = null;

// Default = 30 seconds per alive player, capped to 60 minutes, rounded up to whole minutes
const defaultMinutes = computed(() => {
  const players = (props.state?.players || []).filter((p: any) => p.alive).length || 0;
  const totalSeconds = players * 30;
  const minutes = Math.ceil(totalSeconds / 60);
  return Math.min(60, Math.max(0, minutes));
});

function parseMinutesToSeconds(input: string): number {
  const str = String(input || '').trim();
  let m = 0; let s = 0;
  if (str.includes(':')) {
    const [mStr, sStr] = str.split(':');
    m = Math.max(0, Math.floor(Number(mStr) || 0));
    s = Math.max(0, Math.floor(Number(sStr) || 0));
  } else {
    m = Math.max(0, Math.floor(Number(str) || 0));
    s = 0;
  }
  m += Math.floor(s / 60);
  s = s % 60;
  if (m > 60) { m = 60; s = 0; }
  if (m === 60) s = 0;
  return m * 60 + s;
}

const mmss = computed(() => {
  const s = Math.max(0, discussionSeconds.value);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
});

const displayValue = computed(() => ticking.value ? mmss.value : (timerInput.value || ''));

// When entering day or enabling the timer, prefill the input if empty or if day changed
watch(
  () => [props.state.dayNumber, discussionEnabled.value],
  () => {
    if (!discussionEnabled.value) return;
    // Reset planned time to default on new day or when enabling
    plannedSeconds.value = Math.max(0, Math.min(60, defaultMinutes.value)) * 60;
    timerInput.value = `${String(defaultMinutes.value).padStart(2,'0')}:00`;
    discussionSeconds.value = 0;
    ticking.value = false;
    clearInterval(intervalId);
  },
  { immediate: true }
);

function startDiscussionTimer() {
  if (ticking.value) return;
  // Start from plannedSeconds
  discussionSeconds.value = Math.max(0, Math.min(plannedSeconds.value, 60 * 60));
  if (discussionSeconds.value <= 0) return;
  ticking.value = true;
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (discussionSeconds.value > 0) {
      discussionSeconds.value -= 1;
    }
    if (discussionSeconds.value <= 0) {
      clearInterval(intervalId);
      ticking.value = false;
    }
  }, 1000);
}

function stopDiscussionTimer() {
  ticking.value = false;
  clearInterval(intervalId);
}

function onTimerInput(e: any) {
  if (ticking.value) return;
  const raw = String(e?.target?.value ?? '');
  // normalize to mm:ss as user types
  const secs = parseMinutesToSeconds(raw);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  timerInput.value = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function increasePlanned() {
  if (ticking.value) return;
  plannedSeconds.value = Math.min(60 * 60, plannedSeconds.value + 30);
}

function decreasePlanned() {
  if (ticking.value) return;
  plannedSeconds.value = Math.max(0, plannedSeconds.value - 30);
}

function confirmLynch() {
  if (selectedId.value == null) return;
  props.onLynch(selectedId.value);
}

function confirmSindaco() {
  if (selectedId.value == null) return;
  props.onElectSindaco(selectedId.value);
  // After electing Sindaco, if skipping first day lynch, component will show the skip card
  // otherwise it will fall through to the lynch UI
  selectedId.value = null;
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div class="w-full max-w-2xl space-y-6 text-center">
      <h2 class="text-xl font-semibold text-slate-100">Giorno {{ props.state.dayNumber }}</h2>

      <!-- Sindaco election step (first day only, when enabled and not yet elected) -->
      <div v-if="needsSindacoElection" class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 text-left">
        <div class="text-slate-300 text-sm">Eleggi il Sindaco. Il voto dell'eletto conterà come 2 per il resto della partita.</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label v-for="p in alivePlayers" :key="p.id" class="flex items-center gap-3 px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-900/50 text-neutral-200 cursor-pointer hover:bg-neutral-800/50 transition-colors">
            <div class="flex items-center gap-3">
              <div class="relative">
                <input 
                  class="sr-only" 
                  type="radio" 
                  name="sindaco" 
                  :value="p.id" 
                  v-model="selectedId" 
                />
                <div class="w-4 h-4 rounded-full border-2 border-neutral-500 flex items-center justify-center transition-colors"
                     :class="selectedId === p.id ? 'border-blue-400 bg-blue-400' : 'border-neutral-500'">
                  <div v-if="selectedId === p.id" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
              <span class="font-medium">
                <span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}
              </span>
            </div>
          </label>
        </div>
        <div class="flex items-center justify-end pt-2">
          <button class="btn btn-primary" :disabled="selectedId == null" @click="confirmSindaco">Conferma Sindaco</button>
        </div>
        <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
      </div>

      <!-- First day skipped (only after Sindaco election if enabled) -->
      <div v-else-if="showSkipCard" class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 text-left">
        <div class="text-slate-300 text-sm">Il linciaggio del primo giorno è saltato.</div>
        <div class="pt-2">
          <button class="btn btn-primary w-full" @click="props.onSkipDay">Vai alla notte</button>
        </div>
        <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
      </div>

      <!-- Regular lynch voting (or first day lynch if not skipped) -->
      <div v-else class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 text-left">
        <div class="text-slate-300 text-sm">Seleziona il giocatore con più voti da linciare.</div>

        <!-- Compact discussion timer (if enabled) -->
        <div v-if="discussionEnabled" class="rounded-md border border-neutral-700/60 bg-neutral-900/50 p-3">
          <div class="text-xs text-neutral-400">Timer discussione</div>
          <div class="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <div class="flex items-center gap-2 sm:gap-1 justify-center sm:justify-start">
              <button class="w-9 h-9 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center"
                      :class="{ 'btn-disabled': ticking || plannedSeconds <= 0 }"
                      :disabled="ticking || plannedSeconds <= 0"
                      @click="decreasePlanned">−</button>
              <div class="w-28 h-9 px-2 rounded bg-neutral-800/60 border text-neutral-100 text-sm font-mono tracking-widest flex items-center justify-center"
                   :class="ticking ? 'border-emerald-500/50' : 'border-neutral-700/60'">
                {{ ticking ? mmss : (plannedSeconds > 0 ? `${String(Math.floor(plannedSeconds/60)).padStart(2,'0')}:${String(plannedSeconds%60).padStart(2,'0')}` : '00:00') }}
              </div>
              <button class="w-9 h-9 rounded border border-neutral-800/50 bg-neutral-800/60 text-neutral-300 flex items-center justify-center"
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label v-for="p in alivePlayers" :key="p.id" class="flex items-center gap-3 px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-900/50 text-neutral-200 cursor-pointer hover:bg-neutral-800/50 transition-colors">
            <div class="flex items-center gap-3">
              <div class="relative">
                <input 
                  class="sr-only" 
                  type="radio" 
                  name="lynch" 
                  :value="p.id" 
                  v-model="selectedId" 
                />
                <div class="w-4 h-4 rounded-full border-2 border-neutral-500 flex items-center justify-center transition-colors"
                     :class="selectedId === p.id ? 'border-blue-400 bg-blue-400' : 'border-neutral-500'">
                  <div v-if="selectedId === p.id" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
              <span class="font-medium"><span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}</span>
            </div>
          </label>
        </div>

        <div class="flex items-center justify-end pt-2">
          <button class="btn w-full btn-primary" :disabled="selectedId == null" @click="confirmLynch">Conferma linciaggio</button>
        </div>
        <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for day phase */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
  
  /* Prevent horizontal overflow */
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>



