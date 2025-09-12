<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';

const props = defineProps<{
  gameState: any;
  playerIds: number[];
  onComplete: (result: any) => void;
}>();

const targetId = ref<number | null>(null);
const showTargetRolePrompt = ref(false);

const selectable = computed(() => {
  // If mutaforma players are dying, they can't select targets
  if (hasPendingKills.value) return [];
  
  return props.gameState.players.filter((p: any) => 
    p.alive && 
    !props.playerIds.includes(p.id)
  );
});

const choices = computed(() => [
  { label: 'Seleziona un giocatore...', value: null },
  ...selectable.value.map((p: any) => {
    const role = ROLES[p.roleId];
    const roleName = role ? role.name : p.roleId;
    return { 
      label: `${p.name} (${roleName})`, 
      value: p.id 
    };
  })
]);

const canSubmit = computed(() => {
  if (hasPendingKills.value) return false;
  return Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0;
});

const hasPendingKills = computed(() => {
  if (!props.gameState.night?.context?.pendingKills) return false;
  
  // Get all alive mutaforma players
  const aliveMutaformaPlayers = props.playerIds.filter((playerId: number) => {
    const player = props.gameState.players.find((p: any) => p.id === playerId);
    return player && player.alive;
  });
  
  if (aliveMutaformaPlayers.length === 0) return false;
  
  // Check if ANY alive mutaforma player has pending kills from mutaforma passive effect
  return aliveMutaformaPlayers.some((playerId: number) => {
    const pendingKills = props.gameState.night.context.pendingKills[playerId];
    if (!pendingKills || pendingKills.length === 0) return false;
    
    // Check if any of the pending kills are from mutaforma passive effect
    return pendingKills.some((kill: any) => kill.role === 'mutaforma');
  });
});

const targetPlayer = computed(() => {
  if (!targetId.value) return null;
  return props.gameState.players.find((p: any) => p.id === targetId.value);
});

const targetRole = computed(() => {
  if (!targetPlayer.value) return null;
  
  const originalRole = ROLES[targetPlayer.value.roleId];
  if (!originalRole) return null;
  
  // Check if this role is grouped with another role that can act at night
  if (originalRole.actsAtNight === 'never') {
    const groupings = props.gameState.groupings || [];
    const grouping = groupings.find((g: any) => g.toRole === originalRole.id);
    
    if (grouping) {
      // Use the grouped role instead
      const groupedRole = ROLES[grouping.fromRole];
      if (groupedRole && groupedRole.actsAtNight !== 'never') {
        console.log(`🔄 [DEBUG] Mutaforma UI using grouped role: ${groupedRole.id} instead of ${originalRole.id}`);
        return groupedRole;
      }
    }
  }
  
  return originalRole;
});

const targetRoleFactionColor = computed(() => {
  if (!targetRole.value) return '#10b981'; // Default emerald color
  const factionConfig = getFactionConfig(targetRole.value.team);
  return factionConfig?.color || '#10b981';
});

const targetRoleCanBeUsed = computed(() => {
  if (hasPendingKills.value) return false;
  if (!targetRole.value) return false;
  // Check if the target role can be used by the mutaforma
  return mutaformaCanUseTargetRole(targetRole.value);
});

const AsyncTargetRolePrompt = computed(() => {
  if (!targetRole.value || !targetRoleCanBeUsed.value) return null;
  const promptComponent = targetRole.value.getPromptComponent;
  if (!promptComponent) return null;
  return defineAsyncComponent(promptComponent as () => Promise<any>);
});

function mutaformaCanUseTargetRole(role: any) {
  if (!role || hasPendingKills.value) return false;
  
  // Check if role acts at night, considering groupings
  let effectiveRole = role;
  if (role.actsAtNight === 'never') {
    // Check if this role is grouped with a role that can act at night
    const groupings = props.gameState.groupings || [];
    const grouping = groupings.find((g: any) => g.toRole === role.id);
    
    if (grouping) {
      // Use the grouped role instead
      const groupedRole = ROLES[grouping.fromRole];
      if (groupedRole && groupedRole.actsAtNight !== 'never') {
        effectiveRole = groupedRole;
        console.log(`🔄 [DEBUG] Mutaforma check using grouped role: ${groupedRole.id} instead of ${role.id}`);
      } else {
        return false; // No valid grouping found
      }
    } else {
      return false; // No grouping and actsAtNight is never
    }
  }
  
  // Check if the target player's roleState.actsAtNight is blocked
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') return false;
  
  // Check if the target player is dead
  if (!targetPlayer.value?.alive) return false;
  
  // Role requires being dead but Mutaforma is alive
  if (effectiveRole.actsAtNight === 'dead') return false;
  
  // Role requires being alive but ALL Mutaforma players are dead
  if (effectiveRole.actsAtNight === 'alive') {
    const aliveMutaformaPlayers = props.playerIds.filter((playerId: number) => {
      const player = props.gameState.players.find((p: any) => p.id === playerId);
      return player && player.alive;
    });
    if (aliveMutaformaPlayers.length === 0) return false;
  }
  
  // Role can only start from a certain night
  if (effectiveRole.startNight && typeof effectiveRole.startNight === 'number') {
     const startNight = props.gameState.settings.skipFirstNightActions ? effectiveRole.startNight + 1 : effectiveRole.startNight;
    if (props.gameState.nightNumber < startNight) return false;
  }
  
  // Role has usage limits that are already exhausted
  if (effectiveRole.numberOfUsage !== 'unlimited' && effectiveRole.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[effectiveRole.id] || [];
    const timesUsed = usedPowers.length;
    if (timesUsed >= effectiveRole.numberOfUsage) return false;
  }
  
  // Role is blocked or has other constraints
  if (effectiveRole.effectType === 'blocked') return false;
  
  return true;
}

function selectTarget() {
  if (!canSubmit.value || hasPendingKills.value) {
    if (hasPendingKills.value) {
      skip();
    }
    return;
  }
  
  if (!targetRoleCanBeUsed.value) {
    // Show warning that the role cannot be used, but let user decide
    showTargetRolePrompt.value = true;
    return;
  }
  
  // Show the target role's prompt
  showTargetRolePrompt.value = true;
}

function onTargetRoleComplete(result: any) {
  if (hasPendingKills.value) {
    skip();
    return;
  }
  
  // Complete with the target selection - the target role's resolve will be called later
  props.onComplete({
    targetId: targetId.value,
    targetRoleId: targetRole.value?.id,
    targetPlayerName: targetPlayer.value?.name,
    canUseRole: true,
    targetRoleAction: result // Pass the target role's action data to be resolved later
  });
}

function goBack() {
  if (hasPendingKills.value) {
    skip();
    return;
  }
  showTargetRolePrompt.value = false;
  targetId.value = null;
}

function skip() {
  if (hasPendingKills.value) {
    // When there are pending kills, force the player to continue without using power
    props.onComplete({ 
      targetId: null, 
      skipped: true, 
      reason: 'mutaforma_passive_death',
      message: 'Potere non utilizzato a causa della perdita di equilibrio tra le squadre'
    });
    return;
  }
  props.onComplete({ targetId: null, skipped: true });
}

function completeWithUnusableRole() {
  if (hasPendingKills.value) {
    skip();
    return;
  }
  
  // Determine the reason why the role cannot be used
  let reason = 'unknown';
  
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') {
    reason = 'blocked';
  } else if (!targetPlayer.value?.alive) {
    reason = 'dead';
  } else if (targetRole.value?.actsAtNight === 'dead') {
    reason = 'alive';
  } else if (targetRole.value?.actsAtNight === 'never') {
    reason = 'never';
  } else if (targetRole.value?.startNight && typeof targetRole.value.startNight === 'number') {
    const startNight = props.gameState.settings.skipFirstNightActions ? targetRole.value.startNight + 1 : targetRole.value.startNight;
    if (props.gameState.nightNumber < startNight) {
      reason = 'startNight';
    }
  } else if (targetRole.value?.numberOfUsage !== 'unlimited' && targetRole.value?.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
    const timesUsed = usedPowers.filter((playerId: number) => props.playerIds.includes(playerId)).length;
    if (timesUsed >= targetRole.value.numberOfUsage) {
      reason = 'usageLimit';
    }
  }
  
  props.onComplete({
    targetId: targetId.value,
    targetRoleId: targetRole.value?.id,
    targetPlayerName: targetPlayer.value?.name,
    canUseRole: false,
    targetRoleResult: reason
  });
}

function getRoleConstraintReason() {
  if (!targetRole.value) return '';

  // Check if mutaforma players are dying due to passive effect
  if (hasPendingKills.value) {
    return 'Non puoi utilizzare il tuo potere perché stai morendo a causa della perdita di equilibrio tra le squadre.';
  }

  // Check if target player's roleState.actsAtNight is blocked
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') {
    return 'Il giocatore selezionato è bloccato e non può utilizzare il suo ruolo.';
  }

  // Check if target player is dead
  if (!targetPlayer.value?.alive) {
    return 'Il giocatore selezionato è morto e non può utilizzare il suo ruolo.';
  }

  if (targetRole.value.actsAtNight === 'never') {
    return 'Questo ruolo non può essere utilizzato durante la notte.';
  }

  if (targetRole.value.actsAtNight === 'dead') {
    return 'Questo ruolo richiede di essere morto per essere utilizzato.';
  }

  if (targetRole.value.actsAtNight === 'alive') {
    const aliveMutaformaPlayers = props.playerIds.filter((playerId: number) => {
      const player = props.gameState.players.find((p: any) => p.id === playerId);
      return player && player.alive;
    });
    if (aliveMutaformaPlayers.length === 0) {
      return 'Questo ruolo richiede che tu sia vivo per essere utilizzato.';
    }
  }

  if (targetRole.value.startNight && typeof targetRole.value.startNight === 'number') {
    const startNight = props.gameState.settings.skipFirstNightActions ? targetRole.value.startNight + 1 :
        targetRole.value.startNight;
    if (props.gameState.nightNumber < startNight) {
      return `Questo ruolo può essere utilizzato solo a partire dalla notte ${startNight}.`;
    }
  }
 console.log('checking -> ' + targetRole.value.id)
  const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
  console.log('his used powers are' + usedPowers)
  if (targetRole.value.numberOfUsage !== 'unlimited' && targetRole.value.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
    const timesUsed = usedPowers.length;
    if (timesUsed >= targetRole.value.numberOfUsage) {
      return `Questo ruolo è già stato utilizzato il numero massimo di volte permesso.`;
    }
  }

  if (targetRole.value.actsAtNight === 'blocked') {
    return 'Questo ruolo è bloccato da un altro giocatore o ha altre restrizioni.';
  }

  return 'Questo ruolo non può essere utilizzato per motivi sconosciuti.';
}
</script>

<template>
  <div class="space-y-6">
    <!-- Mutaforma Selection Phase -->
    <div v-if="!showTargetRolePrompt" class="space-y-6">
      <!-- Warning when mutaforma players are dying -->
      <div v-if="hasPendingKills" class="bg-red-900/60 border border-red-800/40 rounded-xl p-6 text-center">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/40 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        
        <div class="space-y-3">
          <h3 class="text-lg sm:text-xl font-semibold text-red-100">
            Attenzione: Potere non disponibile
          </h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-400 mx-auto rounded-full"></div>
          <p class="text-red-300 text-sm">
            Non potete usare il vostro potere questa notte perché state morendo a causa della perdita di equilibrio tra le squadre
          </p>
        </div>
        
        <div class="mt-6">
          <button 
            @click="skip"
            class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Continua senza potere
          </button>
        </div>
      </div>
      
      <div v-else class="text-center space-y-3">
        <p class="text-neutral-400 text-base font-medium">
          {{ hasPendingKills ? 'Il vostro potere è bloccato a causa della perdita di equilibrio tra le squadre' : 'Copia il potere di un altro giocatore per questa notte' }}
        </p>
      </div>

      <PromptSelect
        v-if="!hasPendingKills"
        :label="hasPendingKills ? 'Potere non disponibile - Squadra sbilanciata' : 'Mutaforma, scegli un giocatore per copiare il suo ruolo'"
        v-model="targetId"
        :choices="choices"
        :buttonText="hasPendingKills ? 'Potere bloccato' : 'Copia Ruolo'"
        accent="emerald"
        :disabled="choices.length === 0 || hasPendingKills"
        @confirm="selectTarget"
      />
    </div>

    <!-- Target Role Prompt Phase -->
    <div v-else-if="targetRole && showTargetRolePrompt" class="space-y-6">
      <div class="text-center space-y-3">
        <h3 class="text-lg sm:text-xl font-semibold text-neutral-100">
          Ruolo copiato con successo
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 mx-auto rounded-full"></div>
        <p class="text-neutral-300 text-sm">
          Ruolo copiato:
          <span 
            class="font-medium"
            :style="{ color: targetRoleFactionColor }"
          >
            {{ targetRole?.name || 'Sconosciuto' }}
          </span>
        </p>
      </div>

      <!-- Back button -->
      <div class="text-center">
        <button
          @click="goBack"
          :disabled="hasPendingKills"
          class="btn btn-ghost text-sm text-neutral-400 hover:text-neutral-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Scegli un altro ruolo
        </button>
      </div>

      <!-- Warning when role cannot be used -->
      <div v-if="!targetRoleCanBeUsed" class="bg-amber-900/60 border border-amber-800/40 rounded-xl p-6 text-center">
        <div class="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        
        <div class="space-y-3 mb-6">
          <h3 class="text-lg sm:text-xl font-semibold text-amber-100">
            Ruolo non utilizzabile
          </h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 mx-auto rounded-full"></div>
          <p class="text-amber-300 text-sm">
            {{ hasPendingKills ? 'Non puoi utilizzare il tuo potere perché stai morendo a causa della perdita di equilibrio tra le squadre' : getRoleConstraintReason() }}
          </p>
        </div>
        
        <button 
          @click="completeWithUnusableRole"
          class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {{ hasPendingKills ? 'Continua' : 'Continua' }}
        </button>
      </div>

      <!-- Normal role prompt when role can be used -->
      <div v-else>
        <AsyncTargetRolePrompt
          v-if="AsyncTargetRolePrompt"
          :gameState="props.gameState"
          :playerIds="props.playerIds"
          :onComplete="onTargetRoleComplete"
        />
      </div>
    </div>

    <!-- Fallback if target role cannot be used -->
    <div v-else class="text-center space-y-6">
      <div class="w-16 h-16 mx-auto bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 border border-neutral-500/40 rounded-2xl flex items-center justify-center shadow-lg shadow-neutral-500/20">
        <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>
      
      <div class="space-y-3">
        <h3 class="text-lg sm:text-xl font-semibold text-neutral-100">
          {{ hasPendingKills ? 'Potere non disponibile' : 'Ruolo non utilizzabile' }}
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
        <p class="text-neutral-300 text-sm">
          {{ hasPendingKills ? 'Non puoi utilizzare il tuo potere perché stai morendo' : 'Il ruolo selezionato non può essere utilizzato' }}
        </p>
      </div>
      
      <button
        @click="goBack"
        :disabled="hasPendingKills"
        class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-neutral-500/30 hover:shadow-2xl hover:shadow-neutral-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ hasPendingKills ? 'Continua' : 'Torna alla selezione' }}
      </button>
    </div>
  </div>
</template>
