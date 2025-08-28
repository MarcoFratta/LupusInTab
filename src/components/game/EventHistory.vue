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
           <div class="overflow-x-auto pb-4 scrollbar-hide">
             <div ref="timelineContainerRef" class="flex items-start justify-start gap-8 min-w-max px-4 relative timeline-container">
               <!-- Timeline Line -->
               <div 
                 v-if="timelineDays.length > 1"
                 ref="timelineLineRef"
                 class="absolute top-6 sm:top-5 h-0.5 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-blue-400/30 timeline-line"
               ></div>
               
                               <!-- Timeline Days -->
                <div 
                  v-for="(day, index) in timelineDays" 
                  :key="`day-${day.day}`"
                  class="relative flex-shrink-0 w-20 sm:w-24 z-10"
                >
                 <!-- Timeline Dot -->
                 <div 
                   @click="selectDay(day.day)"
                   :class="[
                     'relative w-12 h-12 sm:w-10 sm:h-10 rounded-full border-4 cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 mx-auto flex-shrink-0 timeline-dot',
                     selectedDay === day.day
                       ? 'border-blue-400 bg-blue-500 shadow-lg shadow-blue-500/50'
                       : 'border-white/40 bg-slate-800 hover:border-white/60'
                   ]"
                 >
                   <!-- Inner Glow Effect -->
                   <div 
                     v-if="selectedDay === day.day"
                     class="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 pointer-events-none"
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
      
      <!-- Selected Day Details -->
      <div v-if="currentDay" class="space-y-6">
         
                 <!-- Results Grid -->
         <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                     <!-- Night Results -->
           <div class="relative bg-gradient-to-br 
           from-slate-800/80 via-slate-900/90 to-slate-800/80
            border border-slate-600/30 rounded-xl pt-6 
            px-0 sm:p-8 overflow-hidden group hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-5 pointer-events-none">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
            </div>
            
            <!-- Night Icon with Glow -->
            <div class="flex items-center justify-center gap-4 mb-6">
              <div class="relative">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br
                 from-blue-500/20 to-purple-600/20 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                  <span class="text-2xl filter drop-shadow-lg">🌙</span>
                </div>
                <div class="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse pointer-events-none"></div>
              </div>
              <div class="text-center">
                <div class="font-bold text-lg text-slate-100 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Notte {{ currentDay.night }}
                </div>
                <div class="text-slate-400 text-sm font-medium">Risultati</div>
              </div>
            </div>
            
            <!-- Deaths Section -->
            <div class="relative mb-6">
              <div class="flex items-center justify-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-red-400 shadow-sm"></div>
                  <span class="text-sm font-semibold text-slate-200">Morti</span>
                  <span class="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">({{ currentDay.nightSummary.died.length }})</span>
                </div>
              </div>
              
              <div v-if="currentDay.nightSummary.died.length === 0" class="text-center py-2">
                <div class="text-slate-400 text-sm mb-2">🌅</div>
                <div class="text-slate-400 text-xs font-medium">Nessun morto</div>
                <div class="text-slate-500 text-xs">La notte è stata tranquilla</div>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="pid in currentDay.nightSummary.died" 
                  :key="pid"
                  class="group/item relative flex justify-center"
                >
                  <div class="inline-flex items-center gap-3 px-4 py-2
                   rounded-lg text-sm font-medium border bg-blue-600/80 text-white
                    border-blue-500/60 hover:bg-blue-500/80 hover:border-blue-400/60 
                    transition-all duration-200 hover:shadow-lg hover:shadow-blue-900/50">
                    <span class="font-semibold">{{ props.state.players.find((p) => p.id === pid)?.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
                                                   <!-- Details Accordion -->
              <div class="border-t border-slate-600/30 pt-6">
                <button 
                  @click="toggleDetails"
                  class="w-full flex px-2 items-center justify-between text-slate-300 
                  hover:text-slate-100 transition-colors duration-200 group mb-4"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-blue-400/60"></div>
                    <span class="text-sm font-medium">Dettagli notturni</span>
                  </div>
                  <div class="w-5 h-5 rounded-full bg-slate-600/50 flex items-center justify-center transition-all duration-200 group-hover:bg-slate-500/50">
                    <span class="text-xs font-bold p-0 transition-transform duration-300 ease-in-out transform-gpu leading-none" :class="{ '-rotate-90': showDetails }" style="transform-origin: center;">◀</span>
                  </div>
                </button>
                
                <Transition
                  enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 max-h-0 overflow-hidden"
                  enter-to-class="opacity-100 max-h-[1000px] overflow-visible"
                  leave-active-class="transition-all duration-300 ease-in"
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
            
            <!-- Night Atmosphere -->
            <div class="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none">
              <div class="text-xs text-slate-400">✨</div>
            </div>
          </div>
          
                     <!-- Day Results -->
           <div class="relative bg-gradient-to-br from-amber-900/20 via-orange-900/30 to-amber-900/20 border border-amber-600/30 rounded-xl p-6 sm:p-8 overflow-hidden group hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/50">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-5 pointer-events-none">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.1),transparent_50%)]"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.1),transparent_50%)]"></div>
            </div>
            
            <!-- Day Icon with Glow -->
            <div class="flex items-center justify-center gap-4 mb-6">
              <div class="relative">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all duration-300">
                  <span class="text-2xl filter drop-shadow-lg">☀️</span>
                </div>
                <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none"></div>
              </div>
              <div class="text-center">
                <div class="font-bold text-lg text-slate-100 bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  Giorno {{ currentDay.day }}
                </div>
                <div class="text-slate-400 text-sm font-medium">Votazione</div>
              </div>
            </div>
            
            <!-- Lynch Results -->
            <div class="relative">
              <div class="flex items-center justify-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded-full bg-amber-400 shadow-sm"></div>
                  <span class="text-sm font-semibold text-slate-200">Linciaggio</span>
                </div>
              </div>
              

                             
                             <div v-if="!lynchHistoryByDay[currentDay.day]" class="text-center py-6">
                 <div class="text-slate-400 text-sm mb-2">🤝</div>
                 <div class="text-slate-400 text-xs font-medium">Nessun linciaggio</div>
               </div>
               
               <div v-else class="text-center">
                 <div class="group/item relative inline-block">
                   <div class="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium border bg-amber-600/80 text-white border-amber-500/60 hover:bg-amber-500/80 hover:border-amber-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-amber-900/50">
                     <span class="font-semibold">{{ props.state.players.find((p) => p.id === lynchHistoryByDay[currentDay.day])?.name }}</span>
                   </div>
                 </div>
               </div>
            </div>
            
            <!-- Day Atmosphere -->
            <div class="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none">
              <div class="text-xs text-slate-400">🌅</div>
            </div>
          </div>
        </div>
        
        <!-- Remove the old details button and accordion that are outside the cards -->
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

/* Timeline container improvements */
.timeline-container {
  position: relative;
  min-width: max-content;
}

/* Ensure timeline dots are properly spaced */
.timeline-container > div {
  flex-shrink: 0;
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

/* Fix text rendering and remove outline spacing */
* {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "kern" 1;
  font-kerning: normal;
}

/* Remove text outline spacing for specific text elements */
.text-sm, .text-xs, .text-lg, .text-xl, .text-2xl, 
.font-semibold, .font-medium, .font-bold {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: none;
  -webkit-text-stroke: 0;
}

/* Specific fixes for timeline text */
.text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400, .text-slate-500 {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Timeline Styles */
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
