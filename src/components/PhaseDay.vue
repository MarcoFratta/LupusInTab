<script setup lang="ts">
import { computed, ref } from 'vue';

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
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Giorno {{ props.state.dayNumber }}</h2>

    <!-- Sindaco election step (first day only, when enabled and not yet elected) -->
    <div v-if="needsSindacoElection" class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
      <div class="text-slate-300 text-sm">Eleggi il Sindaco. Il voto dell'eletto conterà come 2 per il resto della partita.</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label v-for="p in alivePlayers" :key="p.id" class="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-900/50 text-neutral-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <input class="accent-indigo-500" type="radio" name="sindaco" :value="p.id" v-model="selectedId" />
            <span class="font-medium">
              <span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}
            </span>
          </div>
          <!-- Alive badge removed: only alive players are listed here -->
        </label>
      </div>
      <div class="flex items-center justify-end pt-2">
        <button class="btn btn-primary" :disabled="selectedId == null" @click="confirmSindaco">Conferma Sindaco</button>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
    </div>

    <!-- First day skipped (only after Sindaco election if enabled) -->
    <div v-else-if="showSkipCard" class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
      <div class="text-slate-300 text-sm">Il linciaggio del primo giorno è saltato.</div>
      <div class="pt-2">
        <button class="btn btn-primary w-full" @click="props.onSkipDay">Vai alla notte</button>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
    </div>

    <!-- Regular lynch voting (or first day lynch if not skipped) -->
    <div v-else class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
      <div class="text-slate-300 text-sm">Seleziona il giocatore con più voti da linciare. Se un Crazyman viene linciato, la partita termina immediatamente con la sua vittoria.</div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label v-for="p in alivePlayers" :key="p.id" class="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-neutral-700/60 bg-neutral-900/50 text-neutral-200 cursor-pointer">
          <div class="flex items-center gap-3">
            <input class="accent-indigo-500" type="radio" name="lynch" :value="p.id" v-model="selectedId" />
            <span class="font-medium"><span v-if="props.state.sindacoId === p.id" class="text-amber-400">★ </span>{{ p.name }}</span>
          </div>
          <!-- Alive badge removed: only alive players are listed here -->
        </label>
      </div>

      <div class="flex items-center justify-end pt-2">
        <button class="btn btn-primary" :disabled="selectedId == null" @click="confirmLynch">Conferma linciaggio</button>
      </div>
      <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
    </div>
  </div>
</template>



