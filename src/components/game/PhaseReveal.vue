<script setup lang="ts">
import { computed, ref } from 'vue';
import RoleRevealCard from './RoleRevealCard.vue';
import { nextReveal as engineNextReveal } from '../../core/engine';
import { getFactionConfig } from '../../factions';
import FactionLabel from '../ui/FactionLabel.vue';
import { ROLES } from '../../roles';

const props = defineProps<{ state: any, onStartNight: () => void }>();

const showIntro = ref(true);
const showPreNightInfo = ref(false);
const showRoleReveal = ref(false);

const currentPlayer = computed(() => props.state.players[props.state.revealIndex]);
const currentRoleDef = computed(() => ROLES[currentPlayer.value?.roleId]);

// Players to show as known team allies to the current player
const knownTeamAllies = computed(() => {
  const me = currentPlayer.value;
  const myRoleDef = currentRoleDef.value;
  if (!myRoleDef) return [] as any[];
  const allPlayers = props.state.players as Array<any>;
  const result: any[] = [];

  for (const p of allPlayers) {
    if (p.id === me.id) continue;
    const otherRoleDef = ROLES[p.roleId];
    if (!otherRoleDef) continue;
    let visible = false;
    
    // Role-targeted visibility: only show roles that explicitly know the current player
    // This creates one-way visibility: if Role A knows Role B, only Role B sees Role A
    const otherKnowsMe = Array.isArray(otherRoleDef.knownTo) && otherRoleDef.knownTo.includes(myRoleDef.id);
    if (otherKnowsMe) visible = true;

    if (visible) {
      const showMode = otherRoleDef.revealToAllies || 'team';
      const labelText = showMode === 'role' ? otherRoleDef.name : (getFactionConfig(otherRoleDef.team)?.displayName || otherRoleDef.team);
      result.push({ 
        id: p.id, 
        name: p.name, 
        labelText, 
        team: otherRoleDef.team
      });
    }
  }
  return result;
});

// Players to show as allies with the same role to the current player
const knownRoleAllies = computed(() => {
  const me = currentPlayer.value;
  const myRoleDef = currentRoleDef.value;
  if (!myRoleDef) return [] as any[];
  const allPlayers = props.state.players as Array<any>;
  const result: any[] = [];

  for (const p of allPlayers) {
    if (p.id === me.id) continue;
    const otherRoleDef = ROLES[p.roleId];
    if (!otherRoleDef) continue;
    
    if (otherRoleDef.id === myRoleDef.id) {
      const myRoleState = me.roleState;
      const otherRoleState = p.roleState;
      
      if (myRoleState && otherRoleState && 
          myRoleState.actsAtNight !== "never" && 
          otherRoleState.actsAtNight !== "never") {
        const labelText = otherRoleDef.name;
        result.push({ 
          id: p.id, 
          name: p.name, 
          labelText, 
          team: otherRoleDef.team
        });
      }
    }
  }
  return result;
});

function continueFromIntro() {
  showIntro.value = false;
}

function nextReveal() {
  showRoleReveal.value = false; // Hide role, show next player
  engineNextReveal(props.state, () => {
    // At the end of reveal sequence, show a safety info screen before starting Night 1
    showPreNightInfo.value = true;
  });
}

function startNight() {
  props.onStartNight();
}
</script>

<template>
     <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
     <div class="w-full max-w-2xl space-y-6 text-center">
               <div class="text-center space-y-3 md:space-y-4">
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Rivelazione dei ruoli
          </h2>
          <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
        </div>

      <!-- Intro info card shown once at the start of reveal phase -->
      <div v-if="showIntro" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-6 md:p-8">
        <div class="text-center space-y-6">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Come rivelare i ruoli</h3>
            <p class="text-neutral-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Passa il dispositivo a ogni giocatore a turno. Tocca per vedere il tuo ruolo, poi passa al prossimo.
            </p>
          </div>
          <button 
            class="btn btn-accent px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
            @click="continueFromIntro"
          >
            Inizia Rivelazioni
          </button>
        </div>
      </div>

      <!-- Pre-night safety card shown only after the last player reveal -->
      <div v-else-if="showPreNightInfo" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-6 md:p-8">
        <div class="text-center space-y-6">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Prima che inizi la Notte</h3>
            <p class="text-neutral-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Riporta il dispositivo al narratore.
            </p>
          </div>
          <button 
            class="btn btn-accent px-6 py-3 text-base font-semibold rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
            @click="startNight"
          >
            Inizia Notte
          </button>
        </div>
      </div>

      <!-- Reveal flow for current player -->
      <template v-else>
        <div v-if="!showRoleReveal" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-6 md:p-8 text-center">
          <div class="space-y-6">
            <div class="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <div class="text-neutral-300 text-lg md:text-xl mb-3">Passa il telefono a</div>
              <div class="text-3xl md:text-4xl font-bold text-neutral-100 mb-6 truncate max-w-full" :title="currentPlayer.name">
                {{ currentPlayer.name }}
              </div>
            </div>
            <button 
              class="btn btn-accent text-lg px-8 py-4 rounded-xl transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
              @click="showRoleReveal = true"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Rivela Ruolo
            </button>
          </div>
        </div>

        <div v-else class="space-y-4 md:space-y-6">
          <RoleRevealCard 
            :player="currentPlayer" 
            :roleDef="currentRoleDef" 
            :knownRoleAllies="knownRoleAllies"
            :knownTeamAllies="knownTeamAllies"
            @next="nextReveal" 
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for reveal phase */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
  
  /* Ensure proper scrolling on mobile */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* Prevent horizontal overflow */
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>


