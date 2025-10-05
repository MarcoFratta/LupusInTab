<script setup lang="ts">
import { computed, ref } from 'vue';
import Swal from 'sweetalert2';
import PlayerRoleList from '../ui/PlayerRoleList.vue';
import { getFactionConfig } from '../../factions';
import { ROLES } from '../../roles';
import { SetupTitle } from '../ui';
import { useI18n } from '../../composables/useI18n';
import { getFactionDisplayName } from '../../utils/factionUtils';

const { t } = useI18n();

const props = defineProps<{ state: any; onContinue: () => void; onBackToDay?: () => void }>();

const showRoleResee = ref(false);
const expandedFactions = ref<Set<string>>(new Set());

const aliveWithRoles = computed(() => {
  const players = props.state.players.filter((p: any) => p.alive).map((p: any) => {
    const roleDef = ROLES[p.roleId];
    const faction = getFactionConfig(roleDef?.team || 'unknown');
    return {
      ...p,
      team: roleDef?.team || 'unknown',
      factionName: faction?.name || 'Unknown',
    };
  });
  
  return players.sort((a: any, b: any) => {
    const teamOrder: Record<string, number> = { 'villaggio': 1, 'lupi': 2, 'mannari': 3, 'matti': 4, 'parassita': 5, 'alieni': 6, 'unknown': 7 };
    const aOrder = teamOrder[a.team] || 7;
    const bOrder = teamOrder[b.team] || 7;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    return a.name.localeCompare(b.name);
  });
});

const groupPlayersByTeam = (players: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  players.forEach(player => {
    if (!grouped[player.team]) {
      grouped[player.team] = [];
    }
    grouped[player.team].push(player);
  });
  return grouped;
};

const getTeamColor = (team: string) => {
  const faction = getFactionConfig(team);
  return faction?.color || '#9ca3af';
};

const getTeamDisplayName = (team: string) => {
  return getFactionDisplayName(team, t);
};

const toggleFaction = (team: string) => {
  if (expandedFactions.value.has(team)) {
    expandedFactions.value.delete(team);
  } else {
    expandedFactions.value.add(team);
  }
};

const isFactionExpanded = (team: string) => {
  return expandedFactions.value.has(team);
};
</script>

<template>
  <SetupTitle class="pt-2" :title="t('phases.preNight')" />
  <div class="w-full px-3 py-2 md:px-6 space-y-4 md:space-y-6">
    <div class="space-y-4 md:space-y-6">
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
        <div class="space-y-6">
          <div class="text-center space-y-4 pt-2">
            <div class="flex items-center justify-center gap-3 mb-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/50">
                <svg class="w-6 h-6 md:w-8 md:h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </div>
              <div class="text-2xl md:text-4xl font-bold text-violet-400">
                {{ t('preNightPhase.night') }} {{ props.state.nightNumber + 1 }}
              </div>
            </div>
            
            <div class="space-y-2">
              <p class="text-md md:text-2xl font-semibold text-neutral-100 leading-relaxed">
                {{ t('preNightPhase.askPlayersToCloseEyes') }}
              </p>
              <p class="text-sm md:text-xl text-neutral-300 leading-relaxed">
                {{ t('preNightPhase.whenReadyProceed') }}
              </p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-violet-500"></div>
              <h4 class="text-base md:text-lg font-semibold text-neutral-200">{{ t('preNightPhase.alivePlayersAndRoles') }}</h4>
            </div>
            <div class="bg-neutral-800/40 border border-neutral-700/40 rounded-lg pt-3 px-2 pb-2">
              <div class="space-y-4">
                <template v-for="(teamPlayers, team) in groupPlayersByTeam(aliveWithRoles)" :key="team">
                  <div v-if="teamPlayers.length > 0" class="space-y-2">
                    <button 
                      @click="toggleFaction(String(team))"
                      class="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-neutral-700/40 transition-colors duration-200 group"
                    >
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: getTeamColor(String(team)) }"></div>
                        <h5 class="text-md font-medium text-neutral-300 capitalize">{{ getTeamDisplayName(String(team)) }}</h5>
                        <span class="text-xs text-neutral-500">({{ teamPlayers.length }})</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <svg 
                          class="w-4 h-4 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-300"
                          :class="{ 'rotate-180': isFactionExpanded(String(team)) }"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </button>
                    <div 
                      v-show="isFactionExpanded(String(team))"
                      class="pl-3 border-l-2 border-neutral-700/40 ml-2"
                    >
                      <PlayerRoleList :state="props.state" :players="teamPlayers" />
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <div class="pt-6 space-y-3">
            <button
              v-if="props.onBackToDay && (!props.state.settings?.skipFirstNightActions || props.state.nightNumber >= 1)"
              class="w-full px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700/70"
              @click="async () => {
                const result = await Swal.fire({
                  title: t('preNightPhase.confirmBackTitle'),
                  text: t('preNightPhase.confirmBackText'),
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: t('preNightPhase.confirm'),
                  cancelButtonText: t('preNightPhase.cancel'),
                  background: '#0a0a0a',
                  color: '#e5e7eb',
                  customClass: {
                    popup: 'rounded-2xl border border-neutral-800/60',
                    title: 'text-violet-300 font-semibold',
                    htmlContainer: 'text-neutral-300',
                    actions: 'swal2-actions gap-2 sm:gap-3',
                    confirmButton: 'swal2-confirm btn btn-primary mr-2',
                    cancelButton: 'swal2-cancel btn btn-ghost ml-2'
                  },
                  buttonsStyling: false
                });
                if (result.isConfirmed) props.onBackToDay && props.onBackToDay();
              }"
            >
              {{ t('preNightPhase.backToLynch') }}
            </button>
            <button 
              class="group relative w-full px-6 py-3 text-lg font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
              @click="props.onContinue"
            >
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
              </div>
              
              <div class="relative z-10 flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span class="font-medium">{{ t('preNightPhase.startNight') }}</span>
              </div>
              
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="text-center text-xs text-neutral-500">
        {{ t('preNightPhase.reloadHelp') }}
      </div>
    </div>
    
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for pre-night phase */
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


