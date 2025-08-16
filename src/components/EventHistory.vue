<script setup>
import { computed, ref, defineAsyncComponent } from 'vue';
import EventCard from './ui/EventCard.vue';
import DetailsCard from './ui/DetailsCard.vue';
import { ROLES } from '../roles/index';
import GhostButton from './ui/GhostButton.vue';

// Dynamic imports for role resolve detail components (to match the app's pattern)
const WolvesResolveDetails = defineAsyncComponent(() => import('./roles/Wolf/WolvesResolveDetails.vue'));
const DoctorResolveDetails = defineAsyncComponent(() => import('./roles/Doctor/DoctorResolveDetails.vue'));
const MediumResolveDetails = defineAsyncComponent(() => import('./roles/Medium/MediumResolveDetails.vue'));
const DogResolveDetails = defineAsyncComponent(() => import('./roles/Dog/DogResolveDetails.vue'));
const HangmanResolveDetails = defineAsyncComponent(() => import('./roles/Hangman/HangmanResolveDetails.vue'));
const WitchResolveDetails = defineAsyncComponent(() => import('./roles/Witch/WitchResolveDetails.vue'));
const JusticerResolveDetails = defineAsyncComponent(() => import('./roles/Justicer/JusticerResolveDetails.vue'));

const props = defineProps({
  state: { type: Object, required: true },
  onClose: { type: Function, required: true }
});

const expandedEvents = ref(new Set());

function toggleEventExpansion(eventId) {
  if (expandedEvents.value.has(eventId)) {
    expandedEvents.value.delete(eventId);
  } else {
    expandedEvents.value.add(eventId);
  }
}

function isEventExpanded(eventId) {
  return expandedEvents.value.has(eventId);
}

// Build detail entries for a specific night (reusing logic from PhaseResolve)
function buildNightDetailEntries(nightData) {
  const entries = [];
  const summary = nightData.summary;
  const state = props.state;
  
  if (!summary) return entries;

  // Wolves (group): show who they killed
  const wolvesRole = ROLES['wolf'];
  if (wolvesRole) {
    const title = props.state.roleMeta?.['wolf']?.name || wolvesRole.name || 'Lupi';
    entries.push({ key: 'wolf', title, component: WolvesResolveDetails });
  }

  // Doctor (per-actor): show saves if any
  const doctorRole = ROLES['doctor'];
  if (doctorRole) {
    const doctors = state.players.filter((p) => p.roleId === 'doctor');
    for (const d of doctors) {
      const title = props.state.roleMeta?.['doctor']?.name || doctorRole.name || 'Guardia';
      entries.push({ key: `doctor-${d.id}`, title, component: DoctorResolveDetails, props: { player: d } });
    }
  }

  // Medium (per-actor): show checks
  const mediumRole = ROLES['medium'];
  if (mediumRole) {
    const mediums = state.players.filter((p) => p.roleId === 'medium');
    for (const m of mediums) {
      const title = props.state.roleMeta?.['medium']?.name || mediumRole.name || 'Medium';
      entries.push({ key: `medium-${m.id}`, title, component: MediumResolveDetails, props: { player: m } });
    }
  }

  // Role-specific results
  const results = nightData.results || [];
  
  // Dog results
  const dogResults = results.filter((r) => r.roleId === 'dog');
  for (const result of dogResults) {
    const player = state.players.find((p) => p.id === result.playerId);
    if (player) {
      const title = props.state.roleMeta?.['dog']?.name || 'Lupo Mannaro';
      entries.push({ 
        key: `dog-${result.playerId}`, 
        title, 
        component: DogResolveDetails, 
        props: { 
          gameState: { ...state, night: { ...state.night, results } }, 
          entry: result,
          player: player
        } 
      });
    }
  }

  // Hangman results
  const hangmanResults = results.filter((r) => r.roleId === 'hangman');
  for (const result of hangmanResults) {
    const player = state.players.find((p) => p.id === result.playerId);
    if (player) {
      const title = props.state.roleMeta?.['hangman']?.name || 'Boia';
      entries.push({ 
        key: `hangman-${result.playerId}`, 
        title, 
        component: HangmanResolveDetails, 
        props: { 
          gameState: { ...state, night: { ...state.night, results } }, 
          entry: result,
          player: player
        } 
      });
    }
  }

  // Witch results
  const witchResults = results.filter((r) => r.roleId === 'witch');
  for (const result of witchResults) {
    const player = state.players.find((p) => p.id === result.playerId);
    if (player) {
      const title = props.state.roleMeta?.['witch']?.name || 'Medium';
      entries.push({ 
        key: `witch-${result.playerId}`, 
        title, 
        component: WitchResolveDetails, 
        props: { 
          gameState: { ...state, night: { ...state.night, results } }, 
          entry: result,
          player: player
        } 
      });
    }
  }

  // Justicer results
  const justicerResults = results.filter((r) => r.roleId === 'justicer');
  for (const result of justicerResults) {
    const player = state.players.find((p) => p.id === result.playerId);
    if (player) {
      entries.push({ 
        key: `justicer-${result.playerId}`, 
        title: 'Giustiziere', 
        component: JusticerResolveDetails, 
        props: { 
          gameState: { ...state, night: { ...state.night, results } }, 
          entry: result,
          player: player
        } 
      });
    }
  }

  return entries;
}

// Get variant for role titles
function getRoleVariant(title) { return 'neutral'; }

// Combine and sort all events chronologically
const allEvents = computed(() => {
  const events = [];
  const nights = props.state.eventHistory?.nights || [];
  const days = props.state.eventHistory?.days || [];

  // Add night events
  for (const night of nights) {
    events.push({
      type: 'night',
      order: night.night * 2, // Even numbers for nights
      night: night.night,
      data: night
    });
  }

  // Add day events
  for (const day of days) {
    events.push({
      type: 'day',
      order: day.day * 2 + 1, // Odd numbers for days
      day: day.day,
      data: day
    });
  }

  // Sort chronologically
  return events.sort((a, b) => a.order - b.order);
});
</script>

<template>
  <div class="h-full flex flex-col space-y-4 text-center">
    <div class="flex items-center justify-between flex-shrink-0">
      <h2 class="text-2xl font-semibold text-slate-100">📋 Storico Eventi</h2>
      <GhostButton size="sm" @click="onClose">
        ✕ Chiudi
      </GhostButton>
    </div>
    
    <div class="flex-1 overflow-y-auto space-y-3 pr-2">
      <template v-for="event in allEvents" :key="event.type + '-' + (event.night || event.day)">
        <!-- Night Event -->
        <EventCard 
          v-if="event.type === 'night'" 
          :title="`Notte ${event.night}`"
          variant="neutral"
        >
          <!-- Deaths Summary -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
            <div class="flex items-center justify-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-red-400">
                <path d="M12 3C7.582 3 4 6.582 4 11v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4c0-4.418-3.582-8-8-8Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="11" r="1.5" fill="currentColor"/>
                <path d="M9 16c1.333-.667 4.667-.667 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <div class="font-medium text-slate-100 text-sm">
                Morti
                <span v-if="event.data.summary.died.length"> ({{ event.data.summary.died.length }})</span>
              </div>
            </div>
            <div v-if="event.data.summary.died.length === 0" class="text-slate-400 text-xs">
              Nessun morto stanotte.
            </div>
            <div v-else class="flex flex-wrap justify-center gap-1">
              <span 
                v-for="pid in event.data.summary.died" 
                :key="pid"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-red-500/15 text-red-300 border-red-500/30"
              >
                <span class="w-1 h-1 rounded-full bg-red-400"></span>
                {{ props.state.players.find((p) => p.id === pid)?.name }}
              </span>
            </div>
          </div>

          <!-- Toggle Details Button -->
          <GhostButton 
            full-width 
            size="xs"
            class="mb-2"
            @click="toggleEventExpansion('night-' + event.night)"
          >
            {{ isEventExpanded('night-' + event.night) ? 'Nascondi dettagli' : 'Mostra dettagli' }}
          </GhostButton>

          <!-- Detailed Actions (expanded) -->
          <div v-if="isEventExpanded('night-' + event.night)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-left">
            <DetailsCard 
              v-for="entry in buildNightDetailEntries(event.data)" 
              :key="entry.key" 
              :title="entry.title" 
              :color="entry.props?.player ? (props.state.roleMeta[entry.props.player.roleId]?.color) : (entry.key==='wolf' ? props.state.roleMeta['wolf']?.color : '#9ca3af')"
            >
              <component 
                :is="entry.component" 
                :state="entry.props?.gameState || props.state" 
                v-bind="entry.props || {}" 
              />
            </DetailsCard>
          </div>
        </EventCard>

        <!-- Day Event -->
        <EventCard 
          v-if="event.type === 'day'" 
          :title="`Giorno ${event.day}`"
          variant="emerald"
        >
          <div class="bg-white/5 border border-white/10 rounded-lg p-3">
            <div class="flex items-center justify-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-amber-400">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div class="font-medium text-slate-100 text-sm">Linciaggio</div>
            </div>
            <div v-if="event.data.lynched === null" class="text-slate-400 text-xs">
              Nessun linciaggio oggi.
            </div>
            <div v-else class="flex justify-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-amber-500/15 text-amber-300 border-amber-500/30">
                <span class="w-1 h-1 rounded-full bg-amber-400"></span>
                {{ props.state.players.find((p) => p.id === event.data.lynched)?.name }}
              </span>
            </div>
          </div>
        </EventCard>
      </template>
      
      <div v-if="allEvents.length === 0" class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div class="text-slate-400">Nessun evento registrato.</div>
      </div>
    </div>
  </div>
</template>
