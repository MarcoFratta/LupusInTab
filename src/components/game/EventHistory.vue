<script setup lang="ts">
import { computed, ref, onMounted, onUpdated, nextTick } from 'vue';
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
const timelineContainerRef = ref<HTMLElement>();
const timelineLineRef = ref<HTMLElement>();

const updateTimelineLine = () => {
  if (!timelineContainerRef.value || !timelineLineRef.value || timelineDays.value.length < 2) return;
  
  const container = timelineContainerRef.value;
  const line = timelineLineRef.value;
  const firstDay = container.querySelector('.timeline-dot') as HTMLElement;
  const lastDay = container.querySelectorAll('.timeline-dot')[timelineDays.value.length - 1] as HTMLElement;
  
  if (!firstDay || !lastDay) return;
  
  const firstRect = firstDay.getBoundingClientRect();
  const lastRect = lastDay.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  const firstCenter = firstRect.left + firstRect.width / 2 - containerRect.left;
  const lastCenter = lastRect.left + lastRect.width / 2 - containerRect.left;
  
  line.style.left = `${firstCenter}px`;
  line.style.width = `${lastCenter - firstCenter}px`;
};

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
      
      const summary: {
        died: any[];
        saved: any[];
        targeted: any[];
        resurrected: any[];
        checks: any[];
      } = {
        died: Array.isArray(state.nightDeathsByNight?.[nightNum]) ? [...state.nightDeathsByNight[nightNum]] : [],
        saved: [],
        targeted: [],
        resurrected: [],
        checks: []
      };
      
      for (const event of nightEvents) {
        if (event && typeof event === 'object' && 'type' in event && event.type === 'guardia_save' && 
            'data' in event && event.data && typeof event.data === 'object' && 'target' in event.data && 
            event.data.target && !summary.saved.includes(event.data.target)) {
          summary.saved.push(event.data.target);
        }
      }
      
      const dayNum = Number(nightNum);
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

const lynchHistoryByDay = computed(() => {
  const state = props.state;
  const lynchMap: Record<number, any> = {};
  
  const skipFirstNight = state.settings?.skipFirstNightActions || false;
  
  if (skipFirstNight) {
    for (let i = 0; i < (state.lynchedHistory?.length || 0); i++) {
      lynchMap[i + 2] = state.lynchedHistory[i];
    }
  } else {
    for (let i = 0; i < (state.lynchedHistory?.length || 0); i++) {
      lynchMap[i + 1] = state.lynchedHistory[i];
    }
  }
  return lynchMap;
});

const currentDay = computed(() => {
  if (timelineDays.value.length === 0) return null;
  return timelineDays.value.find(day => day.day === selectedDay.value) || timelineDays.value[0];
});

const selectDay = (day: number) => {
  selectedDay.value = day;
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

onMounted(() => {
  nextTick(() => {
    updateTimelineLine();
  });
});

onUpdated(() => {
  nextTick(() => {
    updateTimelineLine();
  });
});

window.addEventListener('resize', updateTimelineLine);
</script>

<template>
  <div class="w-full py-4 md:px-6 md:max-w-6xl space-y-8">
    <div class="space-y-6">
      <div class="flex px-4 items-center justify-between">
        <div class="space-y-2">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl rounded-full"></div>
            <h2 class="relative text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Storico Eventi
            </h2>
          </div>
          <div class="w-16 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div>
        </div>
        <GhostButton size="sm" @click="props.onClose">
          ✕ Chiudi
        </GhostButton>
      </div>
      
      <div class="w-full">
        <div class="relative">
          <div class="overflow-x-auto pb-4 scrollbar-hide">
            <div ref="timelineContainerRef" class="flex items-start justify-start gap-8 min-w-max px-4 relative timeline-container">
              <div 
                v-if="timelineDays.length > 1"
                ref="timelineLineRef"
                class="absolute top-6 sm:top-5 h-0.5 bg-gradient-to-r from-violet-400/30 via-fuchsia-500/30 to-violet-400/30 timeline-line"
              ></div>
              
              <div 
                v-for="(day, index) in timelineDays" 
                :key="`day-${day.day}`"
                class="relative flex-shrink-0 w-20 sm:w-24 z-10"
              >
                                 <div 
                   @click="selectDay(day.day)"
                   :class="[
                     'relative w-12 h-12 sm:w-10 sm:h-10 rounded-full border-4 cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 mx-auto flex-shrink-0 timeline-dot',
                     selectedDay === day.day
                       ? 'border-violet-400 bg-violet-500 shadow-lg shadow-violet-500/50'
                       : 'border-neutral-600/40 bg-neutral-900 hover:border-neutral-500/60'
                   ]"
                 >
                  <div 
                    v-if="selectedDay === day.day"
                    class="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-20 pointer-events-none"
                  ></div>
                  
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-sm sm:text-xs font-bold text-white">{{ day.day }}</span>
                  </div>
                </div>
                
                <div class="mt-3 flex flex-col items-center">
                  <div class="text-sm sm:text-xs font-medium text-neutral-300 text-center">
                    Giorno {{ day.day }}
                  </div>
                  
                  <div class="flex gap-1 mt-2">
                    <div 
                      v-if="day.nightSummary.died.length > 0"
                      class="w-2 h-2 rounded-full bg-red-400"
                      :title="`${day.nightSummary.died.length} morti`"
                    ></div>
                    <div 
                      v-if="lynchHistoryByDay[day.day]"
                      class="w-2 h-2 rounded-full bg-amber-400"
                      title="Linciaggio"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="currentDay" class="space-y-6 px-2">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <div class="group relative overflow-hidden rounded-2xl border border-neutral-800/40 transition-all duration-300 hover:scale-[1.02] hover:border-neutral-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative bg-neutral-900/80 backdrop-blur-sm pt-6 pb-2 px-2 md:p-8">
              <div class="flex items-center justify-center gap-4 mb-6">
                <div class="relative">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 border border-violet-400/30 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-all duration-300">
                    <span class="text-2xl filter drop-shadow-lg">🌙</span>
                  </div>
                  <div class="absolute inset-0 rounded-full bg-violet-400/20 animate-pulse pointer-events-none"></div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-lg bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                    Notte {{ currentDay.night }}
                  </div>
                  <div class="text-neutral-400 text-sm font-medium">Risultati</div>
                </div>
              </div>
              
              <div class="relative mb-6">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-red-400 shadow-sm"></div>
                    <span class="text-sm font-semibold text-neutral-200">Morti</span>
                    <span class="text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded-full">({{ currentDay.nightSummary.died.length }})</span>
                  </div>
                </div>
                
                <div v-if="currentDay.nightSummary.died.length === 0" class="text-center py-2">
                  <div class="text-neutral-400 text-sm mb-2">🌅</div>
                  <div class="text-neutral-400 text-xs font-medium">Nessun morto</div>
                  <div class="text-neutral-500 text-xs">La notte è stata tranquilla</div>
                </div>
                
                <div v-else class="space-y-3">
                  <div class="flex flex-wrap gap-3 justify-center">
                    <div 
                      v-for="pid in currentDay.nightSummary.died" 
                      :key="pid"
                      class="group/item relative"
                    >
                      <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border bg-violet-600/80 text-white border-violet-500/60 hover:bg-violet-500/80 hover:border-violet-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/50">
                        <span class="font-semibold truncate max-w-full" :title="props.state.players.find((p) => p.id === pid)?.name">{{ props.state.players.find((p) => p.id === pid)?.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="border-t border-neutral-700/30 pt-6">
                <button 
                  @click="toggleDetails"
                  class="w-full flex items-center justify-between text-neutral-300 hover:text-neutral-100 transition-colors duration-200 group mb-4"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-violet-400/60"></div>
                    <span class="text-sm font-medium">Dettagli notturni</span>
                  </div>
                  <div class="w-5 h-5 rounded-full bg-neutral-600/50 flex items-center justify-center transition-all duration-200 group-hover:bg-neutral-500/50">
                    <span class="text-xs font-bold transition-transform duration-300 ease-in-out transform-gpu leading-none" :class="{ '-rotate-90': showDetails }" style="transform-origin: center;">◀</span>
                  </div>
                </button>
                
                <Transition
                  enter-active-class="transition-all duration-100 ease-out"
                  enter-from-class="opacity-0 max-h-0 overflow-hidden"
                  enter-to-class="opacity-100 max-h-[1000px] overflow-visible"
                  leave-active-class="transition-all duration-100 ease-in"
                  leave-from-class="opacity-100 max-h-[1000px] overflow-visible"
                  leave-to-class="opacity-0 max-h-0 overflow-hidden"
                >
                  <div v-if="showDetails" class="w-full">
                    <NightDetailsGrid 
                      :game-state="props.state" 
                      :night-number="currentDay.night" 
                    />
                  </div>
                </Transition>
              </div>
            </div>
          </div>
          
          <div class="group relative overflow-hidden rounded-2xl border border-neutral-800/40 transition-all duration-300 hover:scale-[1.02] hover:border-neutral-700/50">
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative bg-neutral-900/80 backdrop-blur-sm p-6 md:p-8">
              <div class="flex items-center justify-center gap-4 mb-6">
                <div class="relative">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all duration-300">
                    <span class="text-2xl filter drop-shadow-lg">☀️</span>
                  </div>
                  <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none"></div>
                </div>
                <div class="text-center">
                  <div class="font-bold text-lg bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                    Giorno {{ currentDay.day }}
                  </div>
                  <div class="text-neutral-400 text-sm font-medium">Votazione</div>
                </div>
              </div>
              
              <div class="relative">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-amber-400 shadow-sm"></div>
                    <span class="text-sm font-semibold text-neutral-200">Linciaggio</span>
                  </div>
                </div>
                
                <div v-if="!lynchHistoryByDay[currentDay.day]" class="text-center py-6">
                  <div class="text-neutral-400 text-sm mb-2">🤝</div>
                  <div class="text-neutral-400 text-xs font-medium">Nessun linciaggio</div>
                </div>
                
                <div v-else class="text-center">
                  <div class="group/item relative inline-block">
                    <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border bg-amber-600/80 text-white border-amber-500/60 hover:bg-amber-500/80 hover:border-amber-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-amber-900/50">
                      <span class="font-semibold truncate max-w-full" :title="props.state.players.find((p) => p.id === lynchHistoryByDay[currentDay.day])?.name">{{ props.state.players.find((p) => p.id === lynchHistoryByDay[currentDay.day])?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="timelineDays.length === 0" class="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/40 rounded-2xl p-8 text-center">
        <div class="text-neutral-400">Nessun evento registrato.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.5) transparent;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6));
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8));
}

.timeline-container {
  position: relative;
  min-width: max-content;
}

.timeline-container > div {
  flex-shrink: 0;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.active\:scale-95:active {
  transform: scale(0.95);
}

* {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "kern" 1;
  font-kerning: normal;
}

.text-sm, .text-xs, .text-lg, .text-xl, .text-2xl, .text-3xl,
.font-semibold, .font-medium, .font-bold {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: none;
  -webkit-text-stroke: 0;
}

.text-neutral-100, .text-neutral-200, .text-neutral-300, .text-neutral-400, .text-neutral-500 {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.timeline-container {
  position: relative;
}

.timeline-line {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.timeline-dot {
  position: relative;
  z-index: 10;
}
</style>

