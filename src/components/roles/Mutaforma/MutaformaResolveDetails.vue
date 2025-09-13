<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import BlockedRoleCard from '../../ui/BlockedRoleCard.vue';

const props = defineProps<{
  gameState: any;
  entry: any;
  players: any[];
  player: any;
}>();

const targetRole = computed(() => {
  // Get the original target role first
  if (!props.entry?.targetRoleId) return null;
  const originalRole = ROLES[props.entry.targetRoleId];
  if (!originalRole) return null;
  
  // Check if this role is grouped with another role that can act at night
  if (originalRole.actsAtNight === 'never') {
    const groupings = props.gameState.groupings || [];
    const grouping = groupings.find((g: any) => g.toRole === originalRole.id);
    
    if (grouping) {
      // Use the grouped role instead for resolve details
      const groupedRole = ROLES[grouping.fromRole];
      if (groupedRole && groupedRole.actsAtNight !== 'never') {
        return groupedRole; // Returns lupo instead of lupoCiccione
      }
    }
  }
  
  return originalRole;
});

const targetRoleFaction = computed(() => {
  if (!targetRole.value) return null;
  return getFactionConfig(targetRole.value.team);
});

const targetPlayer = computed(() => {
  // Check both the main entry data and the targetRoleResult for the targetId
  const targetId = props.entry?.data?.targetId || props.entry?.data?.targetRoleResult?.targetId;
  if (!targetId) return null;
  return props.gameState.players.find((p: any) => p.id === targetId);
});

const mutaformaPlayers = computed(() => {
  if (!props.entry?.playerIds || !Array.isArray(props.entry.playerIds)) return [];
  return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});

const mutaformaUsingTargetRole = computed(() => {
  if (mutaformaPlayers.value.length === 0 || !targetRole.value) return null;
  
  // Create a representative mutaforma object for the target role
  const firstMutaforma = mutaformaPlayers.value[0];
  return {
    ...firstMutaforma,
    roleId: targetRole.value.id,
    name: mutaformaPlayers.value.length === 1 
      ? firstMutaforma.name 
      : mutaformaPlayers.value.map((m: any) => m.name).join(', ')
  };
});

const canUseRole = computed(() => props.entry?.canUseRole === true);

const targetRoleResult = computed(() => props.entry?.data?.targetRoleResult);

// Use the actual target role result from Mutaforma's action
const targetRoleActionEntry = computed(() => {
  if (!canUseRole.value || !targetRoleResult.value) return null;
  
  // The target role result is the object returned by the target role's resolve function
  // It should already have the correct structure with Mutaforma players as actors
  return targetRoleResult.value;
});

const targetRoleResolveDetailsComponent = computed(() => {
  if (!targetRole.value || !canUseRole.value) return null;
  return targetRole.value.getResolveDetailsComponent;
});

const AsyncTargetRoleDetails = computed(() => {
  if (!targetRoleResolveDetailsComponent.value) return null;
  return defineAsyncComponent(targetRoleResolveDetailsComponent.value);
});

const hasAction = computed(() => targetPlayer.value && mutaformaPlayers.value.length > 0);

const shouldShowTargetRoleDetails = computed(() => {
  return canUseRole.value && 
         targetRoleActionEntry.value && 
         targetRoleResolveDetailsComponent.value;
});

// Check if the target role had no effect that night
const targetRoleHadNoEffect = computed(() => {
  if (!canUseRole.value) return false;
  
  // Check if the target role action was skipped
  return props.entry?.data?.targetRoleAction?.skipped === true;
});

// Check if the target role couldn't be used due to constraints
const targetRoleBlocked = computed(() => {
  if (canUseRole.value) return false; // If Mutaforma can use the role, it's not blocked
  
  // Check if there's a reason why the target role cannot be used
  const mainReason = props.entry?.reason;
  
  // If there's a reason in the main entry, it's a constraint reason
  if (mainReason && typeof mainReason === 'string') return true;
  
  return false;
});

// Get the constraint reason
const constraintReason = computed(() => {
  const mainReason = props.entry?.reason;
  
  console.log(`🔄 [DEBUG] MutaformaResolveDetails - entry:`, props.entry);
  console.log(`🔄 [DEBUG] MutaformaResolveDetails - mainReason:`, mainReason);
  
  // Use the main reason from the entry (this is the reason why target role cannot be used)
  if (mainReason && typeof mainReason === 'string') return mainReason;
  
  return 'unknown';
});
</script>

<template>
  <div class="space-y-2">
    <!-- Mutaforma Action Summary using RoleComparisonCard -->
    <template v-if="hasAction">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="mutaformaPlayers"
        :right-player="targetPlayer"
        left-label="Mutaforma"
        right-label="Ruolo Copiato"
        :center-content="{
          action: mutaformaPlayers.length > 1 ? 'hanno copiato' : 'ha copiato'
        }"
      />
    </template>

    <!-- Target Role Results (if any) -->
    <div v-if="shouldShowTargetRoleDetails" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm ">
          Risultato dell'azione copiata:
        </div>
      </div>
      
      <div>
        <AsyncTargetRoleDetails
          v-if="AsyncTargetRoleDetails"
          :gameState="props.gameState"
          :entry="targetRoleActionEntry"
          :players="props.players"
          :player="mutaformaUsingTargetRole"
          :playerIds="mutaformaPlayers.map((p: any) => p.id)"
        />
        
        <!-- Fallback display if component can't be loaded -->
        <div v-else class="text-center text-neutral-400">
          <div class="text-sm mb-2">Azione copiata:</div>
          <div class="text-xs">
            <strong>Players:</strong> {{ mutaformaPlayers.map((p: any) => p.name).join(', ') }}<br>
            <strong>Target:</strong> {{ targetRoleActionEntry?.targetId }}<br>
            <strong>Type:</strong> {{ targetRoleActionEntry?.type }}<br>
            <strong>Role:</strong> {{ targetRole?.name }}<br>
            <strong>Data:</strong> {{ JSON.stringify(targetRoleActionEntry) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Target Role Had No Effect -->
    <div v-else-if="targetRoleHadNoEffect" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-xs mb-2">
          Nessun azione effettuata
        </div>
      </div>
      
      <div class="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
        <p class="text-neutral-400 text-sm font-medium">
          Il ruolo copiato non ha avuto alcun effetto questa notte
        </p>
        <p class="text-neutral-500 text-xs mt-1">
          {{ targetRole?.name }} ha scelto di non utilizzare il suo potere
        </p>
      </div>
    </div>

    <!-- Target Role Blocked Due to Constraints -->
    <div v-else-if="targetRoleBlocked" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm mb-2">
          Il ruolo copiato non può essere utilizzato:
        </div>
      </div>
      
      <div>
        <BlockedRoleCard
          :reason="constraintReason"
          :player="targetPlayer"
        />
      </div>
    </div>

    <!-- Role Cannot Be Used Due to Constraints (fallback) -->
    <div v-else-if="!canUseRole" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm mb-2">
          Il ruolo copiato non può essere utilizzato:
        </div>
      </div>
      
      <div>
        <BlockedRoleCard
          :reason="constraintReason"
          :player="targetPlayer"
        />
      </div>
    </div>

    <!-- No Action Taken -->
    <div v-else-if="!hasAction" class="text-center text-sm mb-2 text-neutral-400">
      Nessuna azione intrapresa
    </div>
  </div>
</template>
