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

const representativeMutaforma = computed(() => {
  const mutaformaList = mutaformaPlayers.value;
  if (mutaformaList.length === 0) return null;
  
  return {
    ...mutaformaList[0],
    name: mutaformaList.length === 1 ? mutaformaList[0].name : mutaformaList.map((m: any) => m.name).join(', '),
    roleId: 'mutaforma'
  };
});

const mutaformaUsingTargetRole = computed(() => {
  if (!representativeMutaforma.value || !targetRole.value) return null;
  
  return {
    ...representativeMutaforma.value,
    roleId: targetRole.value.id,
    name: representativeMutaforma.value.name
  };
});

const canUseRole = computed(() => props.entry?.data?.canUseRole === true);

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

const hasAction = computed(() => targetPlayer.value && representativeMutaforma.value);

const shouldShowTargetRoleDetails = computed(() => {
  return canUseRole.value && 
         targetRoleActionEntry.value && 
         targetRoleResolveDetailsComponent.value;
});
</script>

<template>
  <div class="space-y-2">
    <!-- Mutaforma Action Summary using RoleComparisonCard -->
    <template v-if="hasAction">
      <RoleComparisonCard
        :game-state="props.gameState"
        :left-player="representativeMutaforma"
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

    <!-- Role Cannot Be Used Due to Constraints -->
    <div v-else-if="!canUseRole && props.entry?.data?.reason" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm mb-2">
          Il ruolo copiato non può essere utilizzato:
        </div>
      </div>
      
      <div>
        <BlockedRoleCard
          :reason="props.entry.data.reason"
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
