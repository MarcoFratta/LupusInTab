<script setup lang="ts">
import { computed, ref } from 'vue';
import EventCard from './ui/EventCard.vue';
import GhostButton from './ui/GhostButton.vue';
import NightDetailsGrid from './ui/NightDetailsGrid.vue';

interface Props {
  state: any;
  onClose: () => void;
}

const props = defineProps<Props>();

const expandedEvents = ref(new Set<string>());

const toggleEventExpansion = (eventKey: string) => {
  if (expandedEvents.value.has(eventKey)) {
    expandedEvents.value.delete(eventKey);
  } else {
    expandedEvents.value.add(eventKey);
  }
};

const isEventExpanded = (eventKey: string) => expandedEvents.value.has(eventKey);

// Get variant for role titles
function getRoleVariant(title: string) { return 'neutral'; }

// Combine and sort all events chronologically
const allEvents = computed(() => {
  const events = [];
  const state = props.state;
  
  // Use event history nights if available, otherwise derive from history
  if (state.eventHistory && state.eventHistory.nights && state.eventHistory.nights.length > 0) {
    // Use the actual night summaries from event history
    for (const nightEvent of state.eventHistory.nights) {
      events.push({
        type: 'night',
        order: nightEvent.night * 2, // Even numbers for nights
        night: nightEvent.night,
        data: {
          night: nightEvent.night,
          summary: nightEvent.summary,
          results: nightEvent.results || []
        }
      });
    }
  } else if (state.history) {
    // Fallback: derive night events from history (for backward compatibility)
    const nightNumbers = new Set();
    
    // Collect all night numbers from history
    for (const nightNum in state.history) {
      nightNumbers.add(Number(nightNum));
    }
    // Also include nights from nightDeathsByNight map
    if (state.nightDeathsByNight) {
      for (const nightNum in state.nightDeathsByNight) {
        nightNumbers.add(Number(nightNum));
      }
    }
    
    // Create night events from history
    for (const nightNum of Array.from(nightNumbers).sort((a, b) => a - b)) {
      const nightPlayerActions = state.history[nightNum] || {};
      const nightEvents = Object.values(nightPlayerActions).filter(Boolean);
      
      // Create summary
      const summary = {
        died: Array.isArray(state.nightDeathsByNight?.[nightNum]) ? [...state.nightDeathsByNight[nightNum]] : [],
        saved: [],
        targeted: [],
        resurrected: [], // Add missing field
        checks: []
      };
      
      // Process events to build additional info
      for (const event of nightEvents) {
        if (event.type === 'guardia_save' && event.data?.target && !summary.saved.includes(event.data.target)) {
          summary.saved.push(event.data.target);
        }
      }
      
      events.push({
        type: 'night',
        order: nightNum * 2, // Even numbers for nights
        night: nightNum,
        data: {
          night: nightNum,
          summary,
          results: [] // derived
        }
      });
    }
  }
  
  // Add day events from lynchedHistoryByDay, or fallback to lynchedHistory
  if (state.lynchedHistoryByDay && Object.keys(state.lynchedHistoryByDay).length > 0) {
    for (const dayKey of Object.keys(state.lynchedHistoryByDay)) {
      const dayNum = Number(dayKey);
      const lynchedIds = state.lynchedHistoryByDay[dayNum] || [];
      for (const pid of lynchedIds) {
        events.push({
          type: 'day',
          order: dayNum * 2 + 1,
          day: dayNum,
          data: { day: dayNum, lynched: pid }
        });
      }
    }
  } else if (state.lynchedHistory) {
    let dayIndex = 1;
    for (const pid of state.lynchedHistory) {
      events.push({
        type: 'day',
        order: dayIndex * 2 + 1,
        day: dayIndex,
        data: { day: dayIndex, lynched: pid }
      });
      dayIndex += 1;
    }
  }

  // Sort chronologically
  return events.sort((a, b) => a.order - b.order);
});
</script>

<template>
  <div class="h-full flex flex-col space-y-4 text-center">
    <div class="flex items-center justify-between flex-shrink-0">
      <h2 class="text-2xl font-semibold text-slate-100">📋 Storico Eventi</h2>
      <GhostButton size="sm" @click="props.onClose">
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

          <!-- Resurrected Players -->
          <div v-if="event.data.summary.resurrected && event.data.summary.resurrected.length > 0" class="bg-white/5 border border-white/10 rounded-lg p-3 mb-2">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="text-emerald-400 text-sm">✨</span>
              <div class="font-medium text-emerald-400 text-sm">
                Resuscitati
                <span v-if="event.data.summary.resurrected.length"> ({{ event.data.summary.resurrected.length }})</span>
              </div>
            </div>
            <div class="flex flex-wrap justify-center gap-1">
              <span 
                v-for="pid in event.data.summary.resurrected" 
                :key="pid"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              >
                <span class="w-1 h-1 rounded-full bg-emerald-400"></span>
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
          <NightDetailsGrid 
            v-if="isEventExpanded('night-' + event.night)" 
            :game-state="props.state" 
            :night-number="event.night" 
          />
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
