<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import RoleRevealCard from './RoleRevealCard.vue';
import RoleReseeCard from './RoleReseeCard.vue';
import { nextReveal as engineNextReveal } from '../../core/engine';
import { getFactionConfig } from '../../factions';
import { shouldRolesKnowEachOther, getRevealRoleLabel } from '../../utils/revealUtils';
import FactionLabel from '../ui/FactionLabel.vue';
import { ROLES } from '../../roles';
import { SetupTitle, LongPressButton, PassPhoneCard } from '../ui';
import { useI18n } from '../../composables/useI18n';
import { getFactionDisplayName } from '../../utils/factionUtils';
import { getRoleDisplayName } from '../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps<{ state: any, onStartNight: () => void }>();

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

// Watch for phase changes to ensure proper cleanup
watch(() => props.state.phase, (newPhase, oldPhase) => {
  console.log('PhaseReveal - Phase changed:', { oldPhase, newPhase });
  
  // If we're transitioning away from reveal phase, ensure RoleReseeCard is hidden
  if (oldPhase === 'revealRoles' && newPhase !== 'revealRoles') {
    console.log('PhaseReveal - Hiding RoleReseeCard due to phase change');
    props.state.showRoleResee = false;
  }
});

const currentPlayer = computed(() => props.state.players[props.state.revealIndex]);
const currentRoleDef = computed(() => ROLES[currentPlayer.value?.roleId]);
const showRoleResee = computed(() => {
  // Simplified condition - just check if showRoleResee is true in the state
  const shouldShow = props.state.showRoleResee === true;
  
  console.log('PhaseReveal - showRoleResee computed:', {
    stateShowRoleResee: props.state.showRoleResee,
    shouldShow,
    phase: props.state.phase
  });
  
  return shouldShow;
});

const canRenderRoleResee = computed(() => {
  // Additional safety check to ensure the component can render safely
  return showRoleResee.value && 
         props.state && 
         props.state.players && 
         Array.isArray(props.state.players) && 
         props.state.players.length > 0;
});

// Get reveal phase state from game state, with fallbacks
const revealState = computed(() => {
    if (!props.state.revealPhaseState) {
        props.state.revealPhaseState = {
            showIntro: true,
            showPreNightInfo: false,
            showRoleReveal: false,
            roleRevealed: false
        };
    }
    return props.state.revealPhaseState;
});

// Helper functions to update the game state
function updateRevealState(updates: Partial<typeof revealState.value>) {
    Object.assign(revealState.value, updates);
}

const showIntro = computed(() => revealState.value.showIntro);
const showPreNightInfo = computed(() => revealState.value.showPreNightInfo);
const showRoleReveal = computed(() => revealState.value.showRoleReveal);
const roleRevealed = computed(() => revealState.value.roleRevealed);

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
    
    // Also check if the other role knows any role that the current role is grouped with
    if (!visible && Array.isArray(otherRoleDef.knownTo)) {
      // Check if the current role is grouped with any role that the other role knows
      if (props.state.groupings) {
        for (const grouping of props.state.groupings) {
          if (grouping.toRole === myRoleDef.id && otherRoleDef.knownTo.includes(grouping.fromRole)) {
            visible = true;
            break;
          }
        }
      }
    }

    if (visible) {
      const showMode = otherRoleDef.revealToAllies || 'team';
      const labelText = showMode === 'role' ? getRoleDisplayName(otherRoleDef.id, t) : getFactionDisplayName(otherRoleDef.team, t);
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
    
    // Check if roles should know each other (considering groupings)
    if (shouldRolesKnowEachOther(myRoleDef.id, otherRoleDef.id, props.state)) {
      const myRoleState = me.roleState;
      const otherRoleState = p.roleState;
      
      // If roles are grouped, they should know each other regardless of actsAtNight
      // If roles are not grouped, apply the normal actsAtNight checks
      const areGrouped = myRoleDef.id !== otherRoleDef.id; // Different roles means they're grouped
      
      if (myRoleState && otherRoleState && 
          (areGrouped || (myRoleState.actsAtNight !== "never" && otherRoleState.actsAtNight !== "never")) &&
          otherRoleState.actsAtNight !== "blocked") {
        // Use the grouped role name for display if applicable
        const displayRoleId = getRevealRoleLabel(otherRoleDef.id, props.state);
        const displayRoleDef = ROLES[displayRoleId] || otherRoleDef;
        const labelText = getRoleDisplayName(displayRoleId, t);
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
  updateRevealState({ showIntro: false });
}

function nextReveal() {
  updateRevealState({ showRoleReveal: false }); // Hide role, show next player
  updateRevealState({ roleRevealed: false }); // Reset for next player
  engineNextReveal(props.state, () => {
    // At the end of reveal sequence, show a safety info screen before starting Night 1
    updateRevealState({ showPreNightInfo: true });
  });
}

function startNight() {
  console.log('PhaseReveal - startNight called, current state:', {
    phase: props.state.phase,
    showRoleResee: props.state.showRoleResee,
    revealPhaseState: props.state.revealPhaseState
  });
  
  // Immediately hide the role resee card to prevent rendering issues
  props.state.showRoleResee = false;
  
  // Force a small delay to ensure the state update is processed
  setTimeout(() => {
    console.log('PhaseReveal - calling onStartNight');
    props.onStartNight();
  }, 0);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
    <SetupTitle :title="t('phaseReveal.title')" />
    <div class="w-full max-w-2xl space-y-4 mt-2 text-center">

      <!-- Role Resee Component -->
      <div v-if="showRoleResee" class="role-resee-wrapper">
        <RoleReseeCard 
          :key="`role-resee-${state.phase}-${state.showRoleResee}`"
          :state="state" 
          :onBack="() => props.state.showRoleResee = false" 
        />
      </div>

      <!-- Intro info card shown once at the start of reveal phase -->
      <div v-else-if="showIntro" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6">
        <div class="text-center space-y-4">
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-base md:text-lg font-semibold text-neutral-200 mb-2">{{ t('phaseReveal.howToReveal') }}</h3>
            <p class="text-neutral-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
              {{ t('phaseReveal.howToRevealDescription') }}
            </p>
          </div>
          <button 
            class="btn w-full btn-accent p-4 text-sm font-semibold rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
            @click="continueFromIntro"
          >
            {{ t('phaseReveal.startReveals') }}
          </button>
        </div>
      </div>

      <!-- Pre-night safety card shown only after the last player reveal -->
      <div v-else-if="showPreNightInfo" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6">
        <div class="text-center space-y-6">
          <div class="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </div>
          <div class="space-y-4">
            <h3 class="text-xl md:text-2xl font-semibold text-neutral-200 mb-3">{{ t('phaseReveal.beforeNight') }}</h3>
            <div class="space-y-3">
              <p class="text-lg md:text-xl font-semibold text-neutral-100 leading-relaxed">
                {{ t('phaseReveal.closeEyes') }}
              </p>
              <p class="text-base md:text-lg text-neutral-300 leading-relaxed">
                {{ t('phaseReveal.whenReady') }}
              </p>
            </div>
          </div>
          <div class="space-y-3">
            <button 
              class="btn btn-secondary w-full px-6 py-3 text-base font-semibold rounded-lg transform hover:scale-105
              active:scale-95 transition-all duration-200"
              @click="() => {
                console.log('PhaseReveal - Button clicked, setting showRoleResee to true');
                props.state.showRoleResee = true;
                console.log('PhaseReveal - State after setting:', props.state.showRoleResee);
              }"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              {{ t('phaseReveal.revealAgain') }}
            </button>
            <button 
              class="btn btn-accent w-full px-6 py-3 text-base font-semibold
               rounded-lg transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/25"
              @click="startNight"
            >
              {{ t('phaseReveal.startNight') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reveal flow for current player -->
      <template v-else>
        <div v-if="!showRoleReveal">
          <PassPhoneCard 
            :playerName="currentPlayer.name" 
            :buttonText="roleRevealed ? t('phaseReveal.roleRevealed') : t('phaseReveal.reveal')"
            buttonSize="lg"
            :onActivate="() => { updateRevealState({ showRoleReveal: true, roleRevealed: true }); }"
          />
          
          <div v-if="roleRevealed" class="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div class="flex items-center justify-center gap-2 text-green-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-xs font-medium">{{ t('phaseReveal.roleRevealedSuccess') }}</span>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
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

/* Role resee wrapper styling */
.role-resee-wrapper {
  width: 100%;
  min-height: 0;
  overflow: visible;
}

/* Loading spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


