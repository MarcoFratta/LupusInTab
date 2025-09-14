<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

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
  { label: t('rolePrompts.selectPlayerPlaceholder'), value: null },
  ...selectable.value.map((p: any) => {
    const role = ROLES[p.roleId];
    const roleName = role ? getRoleDisplayName(role.id, t) : p.roleId;
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
    const timesUsed = usedPowers.length; // Check total usage by any player, not just Mutaforma
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
      message: t('roleDetails.powerNotUsedDueToImbalance')
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
    const timesUsed = usedPowers.length; // Check total usage by any player, not just Mutaforma
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
    return t('roleDetails.cannotUsePowerDying');
  }

  // Check if target player's roleState.actsAtNight is blocked
  if (targetPlayer.value?.roleState?.actsAtNight === 'blocked') {
    return t('roleDetails.selectedPlayerBlocked');
  }

  // Check if target player is dead
  if (!targetPlayer.value?.alive) {
    return t('roleDetails.selectedPlayerDead');
  }

  if (targetRole.value.actsAtNight === 'never') {
    return t('roleDetails.roleCannotBeUsedAtNight');
  }

  if (targetRole.value.actsAtNight === 'dead') {
    return t('roleDetails.roleRequiresDead');
  }

  if (targetRole.value.actsAtNight === 'alive') {
    const aliveMutaformaPlayers = props.playerIds.filter((playerId: number) => {
      const player = props.gameState.players.find((p: any) => p.id === playerId);
      return player && player.alive;
    });
    if (aliveMutaformaPlayers.length === 0) {
      return t('roleDetails.roleRequiresAlive');
    }
  }

  if (targetRole.value.startNight && typeof targetRole.value.startNight === 'number') {
    const startNight = props.gameState.settings.skipFirstNightActions ? targetRole.value.startNight + 1 :
        targetRole.value.startNight;
    if (props.gameState.nightNumber < startNight) {
      return t('roleDetails.roleCanOnlyBeUsedFromNight', { night: startNight });
    }
  }
 console.log('checking -> ' + targetRole.value.id)
  const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
  console.log('his used powers are' + usedPowers)
  if (targetRole.value.numberOfUsage !== 'unlimited' && targetRole.value.numberOfUsage !== undefined) {
    const usedPowers = props.gameState.usedPowers?.[targetRole.value.id] || [];
    const timesUsed = usedPowers.length;
    if (timesUsed >= targetRole.value.numberOfUsage) {
      return t('roleDetails.maxUsageReached');
    }
  }

  if (targetRole.value.actsAtNight === 'blocked') {
    return t('roleDetails.roleBlockedByOther');
  }

  return t('roleDetails.roleCannotBeUsedUnknown');
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
            {{ t('roleDetails.cannotUsePowerDying') }}
          </p>
        </div>
        
        <div class="mt-6">
          <button 
            @click="skip"
            class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {{ t('rolePrompts.continueWithoutPower') }}
          </button>
        </div>
      </div>
      
      <div v-else class="text-center space-y-3">
        <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
          <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerToCopy') }}</p>
        </div>
        <p class="text-neutral-400 text-base font-medium">
          {{ hasPendingKills ? t('roleDetails.powerBlockedDueToImbalance') : t('roleDetails.copyAnotherPlayerPower') }}
        </p>
      </div>

      <PromptSelect
        v-if="!hasPendingKills"
        :label="hasPendingKills ? t('rolePrompts.powerUnavailable') : t('rolePrompts.choosePlayerToCopy')"
        v-model="targetId"
        :choices="choices"
        :buttonText="hasPendingKills ? t('rolePrompts.powerBlocked') : t('rolePrompts.copyRole')"
        accent="emerald"
        :disabled="choices.length === 0 || hasPendingKills"
        @confirm="selectTarget"
      />
    </div>

    <!-- Target Role Prompt Phase -->
    <div v-else-if="targetRole && showTargetRolePrompt" class="space-y-6">
      <div class="text-center space-y-3">
        <h3 class="text-lg sm:text-xl font-semibold text-neutral-100">
          {{ t('roleDetails.roleCopiedSuccessfully') }}
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 mx-auto rounded-full"></div>
        <p class="text-neutral-300 text-sm">
          {{ t('roleDetails.copiedRole') }}:
          <span 
            class="font-medium"
            :style="{ color: targetRoleFactionColor }"
          >
            {{ targetRole ? getRoleDisplayName(targetRole.id, t) : t('common.unknown') }}
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
          {{ t('rolePrompts.chooseAnotherRole') }}
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
            {{ t('roleDetails.roleNotUsable') }}
          </h3>
          <div class="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 mx-auto rounded-full"></div>
          <p class="text-amber-300 text-sm">
            {{ hasPendingKills ? t('roleDetails.cannotUsePowerDying') : getRoleConstraintReason() }}
          </p>
        </div>
        
        <button 
          @click="completeWithUnusableRole"
          class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transform hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {{ t('rolePrompts.continue') }}
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
          {{ hasPendingKills ? t('roleDetails.powerNotAvailable') : t('roleDetails.roleNotUsable') }}
        </h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
        <p class="text-neutral-300 text-sm">
          {{ hasPendingKills ? t('roleDetails.cannotUsePowerDyingShort') : t('roleDetails.selectedRoleCannotBeUsed') }}
        </p>
      </div>
      
      <button
        @click="goBack"
        :disabled="hasPendingKills"
        class="btn btn-secondary w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-neutral-500/30 hover:shadow-2xl hover:shadow-neutral-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ hasPendingKills ? t('rolePrompts.continue') : t('rolePrompts.backToSelection') }}
      </button>
    </div>
  </div>
</template>
