<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles';

const props = defineProps<{
  gameState: any;
  player: any;
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
    p.id !== props.player?.id && 
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

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

const hasPendingKills = computed(() => {
  if (!props.gameState.night?.context?.pendingKills) return false;
  
  // Get all alive mutaforma players
  const aliveMutaformaPlayers = props.playerIds.filter(playerId => {
    const player = props.gameState.players.find(p => p.id === playerId);
    return player && player.alive;
  });
  
  if (aliveMutaformaPlayers.length === 0) return false;
  
  // Check if ALL alive mutaforma players have pending kills made by mutaforma themselves
  return aliveMutaformaPlayers.every(playerId => {
    const pendingKills = props.gameState.night.context.pendingKills[playerId];
    if (!pendingKills || pendingKills.length === 0) return false;
    
    // Check if any of the pending kills are made by mutaforma themselves
    return pendingKills.some(kill => kill.source === 'mutaforma_passive');
  });
});

const targetPlayer = computed(() => {
  if (!targetId.value) return null;
  return props.gameState.players.find((p: any) => p.id === targetId.value);
});

const targetRole = computed(() => {
  if (!targetPlayer.value) return null;
  return ROLES[targetPlayer.value.roleId];
});

const targetRoleCanBeUsed = computed(() => {
  if (!targetRole.value) return false;
  // Check if the target role can be used by the mutaforma
  return mutaformaCanUseTargetRole(targetRole.value);
});

const AsyncTargetRolePrompt = computed(() => {
  if (!targetRole.value || !targetRoleCanBeUsed.value) return null;
  return defineAsyncComponent(targetRole.value.getPromptComponent);
});

function mutaformaCanUseTargetRole(role: any) {
  if (!role) return false;
  
  // Role doesn't act at night
  if (role.actsAtNight === 'never') return false;
  
  // Check if the target player's roleState.actsAtNight is blocked
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') return false;
  
  // Check if the target player is dead
  if (!targetPlayer.value?.alive) return false;
  
  // Role requires being dead but Mutaforma is alive
  if (role.actsAtNight === 'dead') return false;
  
  // Role requires being alive but ALL Mutaforma players are dead
  if (role.actsAtNight === 'alive') {
    const aliveMutaformaPlayers = props.playerIds.filter(playerId => {
      const player = props.gameState.players.find(p => p.id === playerId);
      return player && player.alive;
    });
    if (aliveMutaformaPlayers.length === 0) return false;
  }
  
  // Role can only start from a certain night
  if (role.startNight && typeof role.startNight === 'number') {
    if (props.gameState.nightNumber < role.startNight) return false;
  }
  
  // Role has usage limits that are already exhausted
  if (role.numberOfUsage !== 'unlimited' && role.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[role.id] || [];
    const timesUsed = usedPowers.filter((playerId: number) => playerId === props.player?.id).length;
    if (timesUsed >= role.numberOfUsage) return false;
  }
  
  // Role is blocked or has other constraints
  if (role.effectType === 'blocked') return false;
  
  return true;
}

function selectTarget() {
  if (!canSubmit.value) return;
  
  if (!targetRoleCanBeUsed.value) {
    // Show warning that the role cannot be used, but let user decide
    showTargetRolePrompt.value = true;
    return;
  }
  
  // Show the target role's prompt
  showTargetRolePrompt.value = true;
}

function onTargetRoleComplete(result: any) {
  // Call the target role's resolve function to get the proper result
  let targetRoleResult = result;
  
  if (targetRole.value?.resolve && typeof targetRole.value.resolve === 'function') {
    try {
      // Create a proper action context for the target role
      const targetAction = {
        data: result,
        playerId: props.player?.id,
        playerIds: props.playerIds,
        roleId: targetRole.value.id,
        nightNumber: props.gameState.nightNumber
      };
      
      // Call the target role's resolve function
      const resolvedResult = targetRole.value.resolve(props.gameState, targetAction);
      if (resolvedResult) {
        targetRoleResult = resolvedResult;
      }
    } catch (error) {
      console.error('Error calling target role resolve function:', error);
    }
  }
  
  // Complete with both the target selection and the target role's result
  props.onComplete({
    targetId: targetId.value,
    targetRoleId: targetRole.value?.id,
    targetPlayerName: targetPlayer.value?.name,
    canUseRole: true,
    targetRoleResult: targetRoleResult
  });
}

function goBack() {
  showTargetRolePrompt.value = false;
  targetId.value = null;
}

function skip() {
  props.onComplete({ targetId: null, skipped: true });
}

function completeWithUnusableRole() {
  // Determine the reason why the role cannot be used
  let reason = 'unknown';
  
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') {
    reason = 'blocked';
  } else if (!targetPlayer.value?.alive) {
    reason = 'dead';
  } else if (targetRole.value?.actsAtNight === 'dead') {
    reason = 'alive';
  } else if (targetRole.value?.startNight && typeof targetRole.value.startNight === 'number') {
    if (props.gameState.nightNumber < targetRole.value.startNight) {
      reason = 'startNight';
    }
  } else if (targetRole.value?.numberOfUsage !== 'unlimited' && targetRole.value?.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
    const timesUsed = usedPowers.filter((playerId: number) => playerId === props.player?.id).length;
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

  // Check if target player's roleState.actsAtNight is blocked
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') {
    return 'Il giocatore selezionato è bloccato e non può utilizzare il suo ruolo.';
  }

  // Check if target player is dead
  if (!targetPlayer.value?.alive) {
    return 'Il giocatore selezionato è morto e non può utilizzare il suo ruolo.';
  }

  if (targetRole.value.actsAtNight === 'never') {
    return 'Il ruolo non può essere utilizzato questa notte.';
  }

  if (targetRole.value.actsAtNight === 'dead') {
    return 'Il ruolo richiede di essere morto per essere utilizzato.';
  }

  if (targetRole.value.actsAtNight === 'alive') {
    const aliveMutaformaPlayers = props.playerIds.filter(playerId => {
      const player = props.gameState.players.find(p => p.id === playerId);
      return player && player.alive;
    });
    if (aliveMutaformaPlayers.length === 0) {
      return 'Il ruolo richiede che tu sia vivo per essere utilizzato.';
    }
  }

  if (targetRole.value.startNight && typeof targetRole.value.startNight === 'number') {
    if (props.gameState.nightNumber < targetRole.value.startNight) {
      return `Il ruolo può essere utilizzato solo a partire dalla notte ${targetRole.value.startNight}.`;
    }
  }

  if (targetRole.value.numberOfUsage !== 'unlimited' && targetRole.value.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
    const timesUsed = usedPowers.filter((playerId: number) => playerId === props.player?.id).length;
    if (timesUsed >= targetRole.value.numberOfUsage) {
      return `Il ruolo è già stato utilizzato ${targetRole.value.numberOfUsage} volte questa notte.`;
    }
  }

  if (targetRole.value.effectType === 'blocked') {
    return 'Il ruolo è bloccato da un altro giocatore o ha altre restrizioni.';
  }

  return '';
}
</script>

<template>
  <div class="space-y-4">
    <!-- Mutaforma Selection Phase -->
    <div v-if="!showTargetRolePrompt" class="space-y-4">
      <!-- Warning when mutaforma players are dying -->
      <div v-if="hasPendingKills" class="bg-red-900/60 border border-red-800/40 rounded-lg p-4 text-center">
        <div class="text-red-300 text-sm mb-2">
          ⚠️ <strong>Attenzione:</strong> State morendo e non potete usare il vostro potere
        </div>
        <div class="text-red-200 text-xs mb-4">
          Non potete copiare ruoli questa notte
        </div>
        <div class="text-center">
          <button 
            @click="skip"
            class="btn btn-secondary w-full"
          >
            Continua
          </button>
        </div>
      </div>
      
      <div v-else class="text-center mb-4">
        <p class="text-neutral-400 text-xs">
          Copia il potere di un altro giocatore per questa notte
        </p>
      </div>

      <PromptSelect
        label="Mutaforma, scegli un giocatore per copiare il suo ruolo"
        v-model="targetId"
        :choices="choices"
        buttonText="Copia Ruolo"
        accent="emerald"
        :disabled="choices.length === 0 || hasPendingKills"
        @confirm="selectTarget"
      />
    </div>

    <!-- Target Role Prompt Phase -->
    <div v-else-if="targetRole && showTargetRolePrompt" class="space-y-4">
      <div class="text-center mb-4">
        <p class="text-neutral-300 text-sm">
          <span class="font-medium">{{ props.player?.name || 'Mutaforma' }}</span>
          ha copiato il ruolo di
          <span class="font-medium">{{ targetPlayer?.name }}</span>
        </p>
        <div class="text-emerald-400 text-xs mt-2">
          ✅ Ora usa il potere copiato:
        </div>
      </div>

      <!-- Warning when role cannot be used -->
      <div v-if="!targetRoleCanBeUsed" class="bg-red-900/60 border border-red-800/40 rounded-lg p-4 text-center">
        <div class="text-red-300 text-sm mb-3">
          ⚠️ <strong>Attenzione:</strong> Il ruolo selezionato non ha effetto questa notte.
        </div>
        <div class="text-red-200 text-xs mb-4">
          {{ getRoleConstraintReason() }}
        </div>
        <div class="text-center">
          <button 
            @click="completeWithUnusableRole"
            class="btn btn-secondary w-full"
          >
            Continua
          </button>
        </div>
      </div>

      <!-- Normal role prompt when role can be used -->
      <div v-else>
        <AsyncTargetRolePrompt
          v-if="AsyncTargetRolePrompt"
          :gameState="props.gameState"
          :player="props.player"
          :playerIds="props.playerIds"
          :onComplete="onTargetRoleComplete"
        />
      </div>
    </div>

    <!-- Fallback if target role cannot be used -->
    <div v-else class="text-center text-neutral-400">
      <p>⚠️ Il ruolo selezionato non può essere utilizzato</p>
      <button
        @click="goBack"
        class="btn btn-secondary w-full mt-4"
      >
        Torna alla selezione
      </button>
    </div>
  </div>
</template>
