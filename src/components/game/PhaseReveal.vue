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
      <h2 class="text-xl font-semibold text-slate-100">Rivelazione dei ruoli</h2>

      <!-- Intro info card shown once at the start of reveal phase -->
      <div v-if="showIntro" class="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-3">
        <div class="text-slate-100 text-sm font-medium">Come rivelare i ruoli</div>
        <div class="text-slate-400 text-sm">
          Passa il dispositivo a ogni giocatore a turno. Tocca per vedere il tuo ruolo, poi passa al prossimo.
        </div>
        <div class="flex justify-end pt-1">
          <button class="btn btn-primary w-full" @click="continueFromIntro">Inizia rivelazioni</button>
        </div>
      </div>

      <!-- Pre-night safety card shown only after the last player reveal -->
      <div v-else-if="showPreNightInfo" class="bg-white/5 border border-white/10 rounded-lg p-4 text-left space-y-3">
        <div class="text-slate-100 text-md font-medium">Prima che inizi la Notte</div>
        <div class="text-slate-400 text-sm">
          Riporta il dispositivo al narratore.
        </div>
        <div class="flex justify-end pt-1">
          <button class="btn btn-primary w-full" @click="startNight">Inizia Notte</button>
        </div>
      </div>

      <!-- Reveal flow for current player -->
      <template v-else>
        <!-- Step 1: Show who to pass phone to -->
        <div v-if="!showRoleReveal" class="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 text-center">
          <div class="text-slate-300 text-lg mb-3">Passa il telefono a</div>
          <div class="text-3xl font-bold text-slate-100 mb-6 truncate max-w-full" :title="currentPlayer.name">{{ currentPlayer.name }}</div>
          <button 
            class="btn btn-primary text-lg px-8 py-3 rounded-xl"
            @click="showRoleReveal = true"
          >
            Rivela Ruolo
          </button>
        </div>

        <!-- Step 2: Show role and allies -->
        <div v-else class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <RoleRevealCard :player="currentPlayer" :roleDef="currentRoleDef" @next="nextReveal">
            <!-- Unified allies section -->
            <div v-if="knownRoleAllies.length || knownTeamAllies.length" class="bg-white/5 border border-white/10 rounded-lg py-4 px-3">
              <div class="text-slate-100 text-lg font-semibold mb-6 text-center">I tuoi alleati</div>
              
              <!-- Same role allies -->
              <div v-if="knownRoleAllies.length" class="mb-6 last:mb-0">
                <div class="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <div class="w-1 h-4 rounded-full bg-slate-400"></div>
                  Vi conoscete a vicenda ({{ knownRoleAllies.length }})
                </div>
                <div class="space-y-2">
                  <div v-for="p in knownRoleAllies" :key="p.id" class="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <span class="text-slate-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                    <FactionLabel :team="p.team" :labelText="p.labelText" />
                  </div>
                </div>
              </div>

              <!-- Known allies -->
              <div v-if="knownTeamAllies.length">
                <div class="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
                  <div class="w-1 h-4 rounded-full bg-slate-400"></div>
                  Tu conosci loro ({{ knownTeamAllies.length }})
                </div>
                <div class="space-y-2">
                  <div v-for="p in knownTeamAllies" :key="p.id" class="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                    <span class="text-slate-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                    <FactionLabel :team="p.team" :labelText="p.labelText" />
                  </div>
                </div>
              </div>
            </div>
          </RoleRevealCard>
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


