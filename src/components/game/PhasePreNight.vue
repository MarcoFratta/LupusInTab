<script setup lang="ts">
import { computed, ref } from 'vue';
import PlayerRoleList from '../ui/PlayerRoleList.vue';
import { getFactionConfig } from '../../factions';
import { ROLES } from '../../roles';
import { SetupTitle } from '../ui';

const props = defineProps<{ state: any; onContinue: () => void }>();

const showRoleResee = ref(false);

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
  
  return players.sort((a, b) => {
    const teamOrder = { 'villaggio': 1, 'lupi': 2, 'mannari': 3, 'matti': 4, 'parassita': 5, 'alieni': 6, 'unknown': 7 };
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
  const teamNames: { [key: string]: string } = {
    'villaggio': 'Villaggio',
    'lupi': 'Lupi',
    'mannari': 'Mannari',
    'matti': 'Matti',
    'parassita': 'Parassita',
    'alieni': 'Alieni',
    'unknown': 'Sconosciuti'
  };
  return teamNames[team] || 'Sconosciuti';
};
</script>

<template>
  <div class="w-full px-3 py-2 md:px-6 space-y-4 md:space-y-6">
    <SetupTitle title="Preparazione per la Notte" />

    <div class="space-y-4 md:space-y-6">
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
        <div class="space-y-6">
          <div class="text-center space-y-4">
            <div class="flex items-center justify-center gap-3 mb-4">
              <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/50">
                <svg class="w-6 h-6 md:w-8 md:h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              </div>
              <div class="text-3xl md:text-4xl font-bold text-violet-400">
                Notte {{ props.state.nightNumber + 1 }}
              </div>
            </div>
            
            <div class="space-y-3">
              <p class="text-md md:text-2xl font-semibold text-neutral-100 leading-relaxed">
                Chiedi a tutti i giocatori di chiudere gli occhi
              </p>
              <p class="text-md md:text-xl text-neutral-300 leading-relaxed">
                Quando tutti sono pronti prosegui alla fase notturna
              </p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full bg-violet-500"></div>
              <h4 class="text-base md:text-lg font-semibold text-neutral-200">Giocatori vivi e i loro ruoli</h4>
            </div>
            <div class="bg-neutral-800/40 border border-neutral-700/40 rounded-lg p-3">
              <div class="space-y-4">
                <template v-for="(teamPlayers, team) in groupPlayersByTeam(aliveWithRoles)" :key="team">
                  <div v-if="teamPlayers.length > 0" class="space-y-2">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: getTeamColor(team) }"></div>
                      <h5 class="text-sm font-medium text-neutral-300 capitalize">{{ getTeamDisplayName(team) }}</h5>
                      <span class="text-xs text-neutral-500">({{ teamPlayers.length }})</span>
                    </div>
                    <div class="">
                      <PlayerRoleList :state="props.state" :players="teamPlayers" />
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <div class="pt-4">
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
                <span class="font-medium">Inizia la Notte</span>
              </div>
              
              <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="text-center text-xs text-neutral-500">
        Ricarica per iniziare una nuova partita dal menu principale
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


