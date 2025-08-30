<script setup lang="ts">
import { computed, ref, watch, onErrorCaptured, onBeforeUnmount } from 'vue';
import { getFactionConfig } from '../../factions';
import FactionLabel from '../ui/FactionLabel.vue';
import { LongPressButton } from '../ui';
import PromptSelect from '../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../roles';
import * as RoleIcons from '../roles/icons';

const props = defineProps<{
  state: any;
  onBack: () => void;
}>();

const selectedPlayerId = ref<number | null>(null);
const showPlayerSelection = ref(true);
const showPassPhoneCard = ref(false);
const showRoleReveal = ref(false);
const hasError = ref(false);
const isUnmounting = ref(false);

// Error handling
onErrorCaptured((error, instance, info) => {
  console.error('RoleReseeCard error:', error, instance, info);
  hasError.value = true;
  return false; // Prevent error from propagating
});

// Cleanup on unmount
onBeforeUnmount(() => {
  isUnmounting.value = true;
});

// Check if state is valid
const isStateValid = computed(() => {
  return !isUnmounting.value && 
         props.state && 
         props.state.players && 
         Array.isArray(props.state.players) && 
         props.state.players.length > 0;
});

// Define alivePlayers first
const alivePlayers = computed(() => 
  props.state.players.filter((p: any) => p.alive)
);

// Set default selected player when component loads
const defaultPlayer = computed(() => alivePlayers.value[0]);
watch(defaultPlayer, (newPlayer) => {
  if (newPlayer && !selectedPlayerId.value) {
    selectedPlayerId.value = newPlayer.id;
  }
}, { immediate: true });

const playerChoices = computed(() => 
  alivePlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
);

const selectedPlayer = computed(() => 
  selectedPlayerId.value ? props.state.players.find((p: any) => p.id === selectedPlayerId.value) : null
);

const selectedRoleDef = computed(() => 
  selectedPlayer.value ? (ROLES as any)[selectedPlayer.value.roleId] : null
);

const knownTeamAllies = computed(() => {
  const me = selectedPlayer.value;
  const myRoleDef = selectedRoleDef.value;
  if (!myRoleDef) return [] as any[];
  const allPlayers = props.state.players as Array<any>;
  const result: any[] = [];

  for (const p of allPlayers) {
    if (p.id === me.id) continue;
    const otherRoleDef = (ROLES as any)[p.roleId];
    if (!otherRoleDef) continue;
    let visible = false;
    
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

const knownRoleAllies = computed(() => {
  const me = selectedPlayer.value;
  const myRoleDef = selectedRoleDef.value;
  if (!myRoleDef) return [] as any[];
  const allPlayers = props.state.players as Array<any>;
  const result: any[] = [];

  for (const p of allPlayers) {
    if (p.id === me.id) continue;
    const otherRoleDef = (ROLES as any)[p.roleId];
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

function handlePlayerSelect() {
  if (selectedPlayerId.value) {
    showPlayerSelection.value = false;
    showPassPhoneCard.value = true;
  }
}

function handleBack() {
  showRoleReveal.value = false;
  showPassPhoneCard.value = false;
  showPlayerSelection.value = true;
  selectedPlayerId.value = null;
}

function handleContinue() {
  props.onBack();
}

function handleShowRole() {
  console.log('RoleReseeCard - handleShowRole called, current state:', {
    showPassPhoneCard: showPassPhoneCard.value,
    showRoleReveal: showRoleReveal.value
  });
  
  showPassPhoneCard.value = false;
  showRoleReveal.value = true;
  
  console.log('RoleReseeCard - handleShowRole after state change:', {
    showPassPhoneCard: showPassPhoneCard.value,
    showRoleReveal: showRoleReveal.value
  });
}
</script>

<template>
  <!-- Safety check - only render if state is valid -->
  <div v-if="!isStateValid" class="space-y-4">
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <div class="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-200 mb-1">Stato non valido</div>
          <div class="text-neutral-400 text-xs md:text-sm">Lo stato del gioco non è valido. Torna indietro.</div>
        </div>
      </div>
    </div>
    <div class="pt-2">
      <LongPressButton 
        size="md"
        fullWidth
        @activate="props.onBack"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Torna indietro
      </LongPressButton>
    </div>
  </div>

  <!-- Player Selection -->
  <div v-else-if="showPlayerSelection" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6">
    <!-- Back button -->
    <div class="text-left mb-4">
      <button 
        class="p-2 text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
        @click="props.onBack"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>
    </div>

    <div class="text-center space-y-4">
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </div>
      <div>
        <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Rivela di nuovo un ruolo</h3>
        <p class="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
          Seleziona un giocatore per fargli rivedere il suo ruolo
        </p>
      </div>
      
              <PromptSelect
          label="Chi vuoi far rivedere il ruolo?"
          v-model="selectedPlayerId"
          :choices="playerChoices"
          buttonText="Rivela ruolo"
          accent="violet"
          @confirm="handlePlayerSelect"
        />
    </div>
  </div>

  <!-- Pass Phone Card -->
  <div v-else-if="showPassPhoneCard && !showRoleReveal" class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6 text-center">


    <div class="space-y-4">
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div>
        <div class="text-neutral-300 text-base md:text-lg mb-2">Passa il telefono a</div>
        <div class="text-2xl md:text-3xl font-bold text-neutral-100 mb-4 truncate max-w-full" :title="selectedPlayer.name">
          {{ selectedPlayer.name }}
        </div>
      </div>
      <LongPressButton
        class="w-full"
        size="md"
        @activate="handleShowRole"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
        Rivela
      </LongPressButton>
    </div>
  </div>

      <!-- Role Reveal -->
    <div v-else-if="showRoleReveal && selectedPlayer && selectedRoleDef">
      <div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6">
        <div class="text-center space-y-4">
          <div>
            <div class="text-2xl md:text-3xl font-extrabold tracking-tight mb-2" 
                 :style="{ color: getFactionConfig(selectedRoleDef.team)?.color || '#e5e7eb' }">
              {{ selectedRoleDef.name }}
            </div>
            <div v-if="selectedRoleDef.description" class="text-neutral-300 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-4">
              {{ selectedRoleDef.description }}
            </div>
            
            <div class="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
              <span class="text-neutral-200 font-medium">La tua fazione</span>
              <FactionLabel :team="selectedRoleDef.team" :labelText="getFactionConfig(selectedRoleDef.team)?.displayName || selectedRoleDef.team" size="lg" />
            </div>
          </div>

          <div v-if="(knownRoleAllies && knownRoleAllies.length) || (knownTeamAllies && knownTeamAllies.length)" class="pt-4 border-t border-neutral-700/40">
            <div class="text-center mb-4">
              <h4 class="text-base md:text-lg font-semibold text-neutral-200 mb-2">I tuoi alleati</h4>
              <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
            </div>
            
            <div v-if="knownRoleAllies && knownRoleAllies.length" class="mb-4 last:mb-0">
              <div class="text-neutral-300 text-sm font-medium mb-2 flex items-center gap-2">
                <div class="w-1 h-4 rounded-full bg-violet-400"></div>
                Vi conoscete a vicenda ({{ knownRoleAllies.length }})
              </div>
              <div class="space-y-2">
                <div v-for="p in knownRoleAllies" :key="p.id" class="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700/40 rounded-lg hover:bg-neutral-800/60 transition-colors">
                  <span class="text-neutral-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                  <FactionLabel :team="p.team" :labelText="p.labelText" size="lg" />
                </div>
              </div>
            </div>

            <div v-if="knownTeamAllies && knownTeamAllies.length">
              <div class="text-neutral-300 text-sm font-medium mb-2 flex items-center gap-2">
                <div class="w-1 h-4 rounded-full bg-fuchsia-400"></div>
                Tu conosci loro ({{ knownTeamAllies.length }})
              </div>
              <div class="space-y-2">
                <div v-for="p in knownTeamAllies" :key="p.id" class="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700/40 rounded-lg hover:bg-neutral-800/60 transition-colors">
                  <span class="text-neutral-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                  <FactionLabel :team="p.team" :labelText="p.labelText" size="lg" />
                </div>
              </div>
            </div>
          </div>

          <!-- Continua button inside the card -->
          <div class="pt-4">
            <LongPressButton 
              size="md"
              fullWidth
              @activate="handleContinue"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
              Continua
            </LongPressButton>
          </div>
        </div>
      </div>
    </div>

  <!-- Error state -->
  <div v-else-if="showRoleReveal && !selectedRoleDef" class="space-y-4">
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <div class="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-200 mb-1">Ruolo sconosciuto</div>
          <div class="text-neutral-400 text-xs md:text-sm">{{ selectedPlayer?.roleId }}</div>
        </div>
      </div>
    </div>
    <div class="pt-2">
      <LongPressButton 
        size="md"
        fullWidth
        @activate="handleContinue"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        Continua
      </LongPressButton>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="hasError" class="space-y-4">
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <div class="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-200 mb-1">Errore di rendering</div>
          <div class="text-neutral-400 text-xs md:text-sm">Si è verificato un errore. Torna indietro e riprova.</div>
        </div>
      </div>
    </div>
    <div class="pt-2">
      <LongPressButton 
        size="md"
        fullWidth
        @activate="handleBack"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Torna indietro
      </LongPressButton>
    </div>
  </div>

  <!-- Fallback state - should never happen but prevents black screen -->
  <div v-else class="space-y-4">
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <div class="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-200 mb-1">Stato non valido</div>
          <div class="text-neutral-400 text-xs md:text-sm">Riprova o torna indietro</div>
        </div>
      </div>
    </div>
    <div class="pt-2">
      <LongPressButton 
        size="md"
        fullWidth
        @activate="handleBack"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Torna indietro
      </LongPressButton>
    </div>
  </div>
</template>
