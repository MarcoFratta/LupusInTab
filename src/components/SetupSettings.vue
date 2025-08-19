<script setup lang="ts">
import { useGameStore } from '../stores/game';
import { watch } from 'vue';
import { saveSettings } from '../utils/storage';

const store = useGameStore();
const state = store.state as any;

watch(() => state.settings, () => {
  saveSettings({
    skipFirstNightActions: !!state.settings.skipFirstNightActions,
    enableSindaco: !!state.settings.enableSindaco,
    discussionTimerEnabled: !!state.settings.discussionTimerEnabled,
  });
}, { deep: true });
</script>

<template>
  <div class="space-y-6 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Impostazioni di gioco</h2>
    <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-left space-y-4">
      <label class="flex items-start gap-3">
        <input type="checkbox" v-model="state.settings.skipFirstNightActions" class="mt-1" />
        <div>
          <div class="text-slate-100 text-sm font-medium">Salta le azioni della prima notte</div>
          <div class="text-slate-400 text-xs">Tutti i ruoli vengono chiamati nella Notte 1, ma i loro effetti sono ignorati.</div>
        </div>
      </label>
      <label class="flex items-start gap-3 opacity-80">
        <input type="checkbox" v-model="state.settings.enableSindaco" class="mt-1" />
        <div>
          <div class="text-slate-100 text-sm font-medium">Abilita Sindaco</div>
          <div class="text-slate-400 text-xs">Il voto del sindaco vale doppio durante la votazione quando è in vita.</div>
        </div>
      </label>
      <label class="flex items-start gap-3">
        <input type="checkbox" v-model="state.settings.discussionTimerEnabled" class="mt-1" />
        <div>
          <div class="text-slate-100 text-sm font-medium">Timer discussione (giorno)</div>
          <div class="text-slate-400 text-xs">Mostra un timer compatto nella fase di linciaggio per la discussione (max 60 minuti).</div>
        </div>
      </label>
    </div>
  </div>
</template>

