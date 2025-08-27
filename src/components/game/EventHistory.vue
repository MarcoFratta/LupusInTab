<script setup lang="ts">
import { computed, ref } from 'vue';
import EventCard from '../ui/EventCard.vue';
import GhostButton from '../ui/GhostButton.vue';
import NightDetailsGrid from '../ui/NightDetailsGrid.vue';

interface Props {
  state: any;
  onClose: () => void;
}

const props = defineProps<Props>();

const selectedDay = ref(1);
const showDetails = ref(false);

const timelineDays = computed(() => {
  const days = [];
  const state = props.state;
  
  if (state.history) {
    const nightNumbers = new Set();
    
    for (const nightNum in state.history) {
      nightNumbers.add(Number(nightNum));
    }
    if (state.nightDeathsByNight) {
      for (const nightNum in state.nightDeathsByNight) {
        nightNumbers.add(Number(nightNum));
      }
    }
    
    const sortedNights = Array.from(nightNumbers).sort((a, b) => a - b);
    
    for (const nightNum of sortedNights) {
      const nightPlayerActions = state.history[nightNum] || {};
      const nightEvents = Object.values(nightPlayerActions).filter(Boolean);
      
      const summary = {
        died: Array.isArray(state.nightDeathsByNight?.[nightNum]) ? [...state.nightDeathsByNight[nightNum]] : [],
        saved: [],
        targeted: [],
        resurrected: [],
        checks: []
      };
      
      for (const event of nightEvents) {
        if (event.type === 'guardia_save' && event.data?.target && !summary.saved.includes(event.data.target)) {
          summary.saved.push(event.data.target);
        }
      }
      
      const dayNum = nightNum;
      let lynchedPlayer = null;
      
      if (state.lynchedHistoryByDay && state.lynchedHistoryByDay[dayNum]) {
        const lynchedIds = state.lynchedHistoryByDay[dayNum] || [];
        lynchedPlayer = lynchedIds.length > 0 ? lynchedIds[0] : null;
      } else if (state.lynchedHistory && state.lynchedHistory[dayNum - 1]) {
        lynchedPlayer = state.lynchedHistory[dayNum - 1];
      }
      
      days.push({
        day: dayNum,
        night: nightNum,
        nightSummary: summary,
        lynchedPlayer,
        nightEvents
      });
    }
  }
  
  return days;
});

const currentDay = computed(() => {
  if (timelineDays.value.length === 0) return null;
  return timelineDays.value.find(day => day.day === selectedDay.value) || timelineDays.value[0];
});

const selectDay = (day: number) => {
  selectedDay.value = day;
  showDetails.value = false;
};
</script>

<template>
  <div class="min-h-screen flex flex-col px-4 py-4 sm:px-6 sm:py-6">
    <div class="w-full space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl sm:text-2xl font-semibold text-slate-100">📋 Storico Eventi</h2>
        <GhostButton size="sm" @click="props.onClose">
          ✕ Chiudi
        </GhostButton>
      </div>
      
      <!-- Horizontal Timeline -->
      <div class="w-full">
        <div class="relative">
          <!-- Timeline Container -->
          <div class="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <!-- Connecting Lines Layer -->
            <div class="relative h-0">
              <div 
                v-for="(day, index) in timelineDays.slice(0, -1)" 
                :key="`line-${day.day}`"
                class="absolute top-6 sm:top-5 h-0.5 bg-gradient-to-r from-blue-500/40 to-purple-500/40 z-0"
                :style="{
                  left: `${(index + 0.5) * (100 / (timelineDays.length - 1))}%`,
                  width: `${100 / (timelineDays.length - 1)}%`
                }"
              ></div>
            </div>
            
            <div class="flex items-start justify-between w-full min-w-max gap-4 sm:gap-6">
              <!-- Timeline Days -->
              <div 
                v-for="(day, index) in timelineDays" 
                :key="`day-${day.day}`"
                class="relative flex-shrink-0 flex-1"
              >
                <!-- Timeline Dot -->
                <div 
                  @click="selectDay(day.day)"
                  :class="[
                    'relative z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full border-4 cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 mx-auto',
                    selectedDay === day.day
                      ? 'border-blue-400 bg-blue-500 shadow-lg shadow-blue-500/50'
                      : 'border-white/40 bg-slate-800 hover:border-white/60'
                  ]"
                >
                  <!-- Inner Glow Effect -->
                  <div 
                    v-if="selectedDay === day.day"
                    class="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"
                  ></div>
                  
                  <!-- Day Number -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm sm:text-xs font-bold text-white">{{ day.day }}</span>
                  </div>
                </div>
                
                <!-- Day Label -->
                <div class="mt-3 flex flex-col items-center">
                  <div class="text-sm sm:text-xs font-medium text-slate-300 text-center">
                    Giorno {{ day.day }}
                  </div>
                  
                  <!-- Quick Indicators -->
                  <div class="flex gap-1 mt-2">
                    <div 
                      v-if="day.nightSummary.died.length > 0"
                      class="w-2 h-2 rounded-full bg-red-400"
                      :title="`${day.nightSummary.died.length} morti`"
                    ></div>
                    <div 
                      v-if="day.lynchedPlayer"
                      class="w-2 h-2 rounded-full bg-amber-400"
                      title="Linciaggio"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Main Timeline Line -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 transform translate-y-1/2 -mx-4 sm:mx-0"></div>
        </div>
      </div>
      
      <!-- Selected Day Details -->
      <div v-if="currentDay" class="space-y-6">
        <!-- Day Header -->
        <div class="text-center">
          <h3 class="text-lg sm:text-xl font-semibold text-slate-100 mb-2">
            Ciclo {{ currentDay.day }}
          </h3>
          <div class="flex items-center justify-center gap-4 text-sm text-slate-400">
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              Notte {{ currentDay.night }}
            </span>
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Giorno {{ currentDay.day }}
            </span>
          </div>
        </div>
        
        <!-- Results Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <!-- Night Results -->
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span class="text-xl">🌙</span>
              </div>
              <div>
                <div class="font-semibold text-slate-200">Notte {{ currentDay.night }}</div>
                <div class="text-slate-400 text-sm">Risultati</div>
              </div>
            </div>
            
            <!-- Deaths -->
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <span class="text-sm font-medium text-slate-200">Morti</span>
                <span class="text-xs text-slate-400">({{ currentDay.nightSummary.died.length }})</span>
              </div>
              <div v-if="currentDay.nightSummary.died.length === 0" class="text-slate-400 text-xs text-center py-3">
                Nessun morto
              </div>
              <div v-else class="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span 
                  v-for="pid in currentDay.nightSummary.died" 
                  :key="pid"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/40"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {{ props.state.players.find((p) => p.id === pid)?.name }}
                </span>
              </div>
            </div>
            
            <!-- Actions Count -->
            <div class="text-center pt-2 border-t border-white/20">
              <div class="text-2xl font-bold text-slate-200">{{ Object.keys(currentDay.nightEvents).length }}</div>
              <div class="text-xs text-slate-400">Azioni notturne</div>
            </div>
          </div>
          
          <!-- Day Results -->
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span class="text-xl">☀️</span>
              </div>
              <div>
                <div class="font-semibold text-slate-200">Giorno {{ currentDay.day }}</div>
                <div class="text-slate-400 text-sm">Votazione</div>
              </div>
            </div>
            
            <!-- Lynch Results -->
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                <span class="text-sm font-medium text-slate-200">Linciaggio</span>
              </div>
              
              <div v-if="!currentDay.lynchedPlayer" class="text-slate-400 text-xs text-center py-6">
                Nessun linciaggio
              </div>
              <div v-else class="text-center">
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border bg-amber-500/20 text-amber-300 border-amber-500/40">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  {{ props.state.players.find((p) => p.id === currentDay.lynchedPlayer)?.name }}
                </span>
              </div>
            </div>
            
            <!-- Day Status -->
            <div class="text-center pt-2 border-t border-white/20">
              <div class="text-sm font-medium text-slate-200">
                {{ currentDay.lynchedPlayer ? 'Completato' : 'Nessun voto' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Details Button -->
        <div class="flex justify-center">
          <GhostButton 
            size="default"
            @click="showDetails = !showDetails"
            class="px-6 py-3"
          >
            {{ showDetails ? 'Nascondi dettagli' : 'Mostra dettagli' }}
          </GhostButton>
        </div>
        
        <!-- Night Details Grid -->
        <div v-if="showDetails" class="w-full">
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <h4 class="text-base sm:text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
              Dettagli Azioni Notturne - Notte {{ currentDay.night }}
            </h4>
            <NightDetailsGrid 
              :game-state="props.state" 
              :night-number="currentDay.night" 
            />
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="timelineDays.length === 0" class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
        <div class="text-slate-400">Nessun evento registrato.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-first responsive design */
@media (max-width: 640px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh;
  }
  
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}

/* Enhanced mobile scrolling */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
  -webkit-overflow-scrolling: touch;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6));
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
}

/* Touch-friendly animations */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Mobile touch optimizations */
.active\:scale-95:active {
  transform: scale(0.95);
}


</style>
