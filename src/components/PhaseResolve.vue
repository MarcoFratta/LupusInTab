<script setup lang="ts">
import { ref, computed } from 'vue';
import { ROLES } from '../roles';
import WolvesResolveDetails from './roles/Wolf/WolvesResolveDetails.vue';
import DoctorResolveDetails from './roles/Doctor/DoctorResolveDetails.vue';
import MediumResolveDetails from './roles/Medium/MediumResolveDetails.vue';
import DetailsCard from './ui/DetailsCard.vue';

const props = defineProps<{
  state: any;
  onContinue: () => void;
  onReset: () => void;
}>();

const showDetails = ref(false);

// Build detail entries grouped by role/group
type DetailEntry = { key: string; title: string; component: any; props?: Record<string, any> };
const detailEntries = computed(() => {
  const summary = props.state?.night?.summary;
  if (!summary) return [] as DetailEntry[]; 

  const entries: DetailEntry[] = [];

  // Wolves (group): show who they killed (targeted minus saved, or targeted list)
  const wolvesRole = ROLES['wolf'];
  if (wolvesRole) {
    entries.push({ key: 'wolf', title: 'Lupi', component: WolvesResolveDetails });
  }

  // Doctor (per-actor): show saves if any
  const doctorRole = ROLES['doctor'];
  if (doctorRole) {
    const doctors = props.state.players.filter((p: any) => p.roleId === 'doctor');
    for (const d of doctors) {
      entries.push({ key: `doctor-${d.id}` , title: 'Doctor', component: DoctorResolveDetails, props: { player: d } });
    }
  }

  // Medium (per-actor): show checks
  const mediumRole = ROLES['medium'];
  if (mediumRole) {
    const mediums = props.state.players.filter((p: any) => p.roleId === 'medium');
    for (const m of mediums) {
      entries.push({ key: `medium-${m.id}` , title: 'Medium', component: MediumResolveDetails, props: { player: m } });
    }
  }

  // Villager: no details
  return entries;
});
</script>

<template>
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Esito della notte</h2>
    <div v-if="props.state.night.summary" class="space-y-4">
      <!-- Focus: Died -->
      <div class="bg-white/5 border border-white/10 rounded-lg p-5 w-full text-center">
        <div class="flex items-center justify-center gap-2 mb-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-400">
            <path d="M12 3C7.582 3 4 6.582 4 11v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4c0-4.418-3.582-8-8-8Z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
            <path d="M9 16c1.333-.667 4.667-.667 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <div class="font-semibold text-slate-100">Morti<span v-if="props.state.night.summary.died.length"> ({{ props.state.night.summary.died.length }})</span></div>
        </div>
          <div v-if="props.state.night.summary.died.length === 0" class="text-slate-400 text-sm">Nessun morto stanotte.</div>
        <div v-else class="mt-2 flex flex-wrap justify-center gap-2">
          <span 
            v-for="pid in props.state.night.summary.died" 
            :key="pid"
            class="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium border bg-red-500/15 text-red-300 border-red-500/30"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            {{ props.state.players.find((p: any) => p.id === pid)?.name }}
          </span>
        </div>
      </div>

      <!-- Controls: two equal buttons, left and right -->
      <div class="grid grid-cols-2 gap-2">
        <button class="btn btn-ghost w-full" @click="showDetails = !showDetails">
          {{ showDetails ? 'Nascondi dettagli' : 'Mostra dettagli' }}
        </button>
        <button class="btn btn-primary w-full" @click="props.onContinue">Continua</button>
      </div>

      <!-- Details section -->
      <div v-if="showDetails" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <DetailsCard v-for="e in detailEntries" :key="e.key" :title="e.title" :variant="e.title === 'Lupi' ? 'lupi' : (e.title === 'Doctor' ? 'emerald' : (e.title === 'Medium' ? 'violet' : 'neutral'))">
          <component :is="e.component" :state="props.state" v-bind="e.props || {}" />
        </DetailsCard>
      </div>
    </div>
    <div v-else class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
      <div class="text-slate-400">Risoluzione…</div>
    </div>
    <div class="pt-1 text-[11px] text-neutral-500 text-right">ricarica per iniziare una nuova partita dal menu principale</div>
  </div>
</template>


