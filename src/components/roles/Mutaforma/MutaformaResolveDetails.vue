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
  if (!props.entry?.data?.targetRoleId) return null;
  return ROLES[props.entry.data.targetRoleId];
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
    name: mutaformaList.length === 1 ? mutaformaList[0].name : mutaformaList.map(m => m.name).join(', '),
    roleId: 'mutaforma'
  };
});

const canUseRole = computed(() => props.entry?.data?.canUseRole === true);

const targetRoleResult = computed(() => props.entry?.data?.targetRoleResult);

const targetRoleResolveDetailsComponent = computed(() => {
  if (!targetRole.value || !canUseRole.value) return null;
  return targetRole.value.getResolveDetailsComponent;
});

const AsyncTargetRoleDetails = computed(() => {
  if (!targetRoleResolveDetailsComponent.value) return null;
  return defineAsyncComponent(targetRoleResolveDetailsComponent.value);
});

const hasAction = computed(() => targetPlayer.value && representativeMutaforma.value);
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
    <div v-if="canUseRole && targetRoleResult && typeof targetRoleResult === 'object' &&
    !targetRoleResult.skipped" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm ">
          Risultato dell'azione copiata:
        </div>
      </div>
      
      <div>
        <AsyncTargetRoleDetails
          v-if="AsyncTargetRoleDetails"
          :gameState="props.gameState"
          :entry="targetRoleResult"
          :players="props.players"
          :player="representativeMutaforma"
          :playerIds="mutaformaPlayers.map(p => p.id)"
        />
        
        <!-- Fallback display if component can't be loaded -->
        <div v-else class="text-center text-neutral-400">
          <div class="text-sm mb-2">Azione copiata:</div>
          <div class="text-xs">
            <strong>Players:</strong> {{ mutaformaPlayers.map(p => p.name).join(', ') }}<br>
            <strong>Target:</strong> {{ targetRoleResult.targetId }}<br>
            <strong>Type:</strong> {{ targetRoleResult.type }}<br>
            <strong>Data:</strong> {{ JSON.stringify(targetRoleResult.data) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Role Cannot Be Used Due to Constraints -->
    <div v-else-if="!canUseRole && targetRoleResult && typeof targetRoleResult === 'string'" class="space-y-2">
      <div class="text-center">
        <div class="text-neutral-400 text-sm mb-2">
          Il ruolo copiato non può essere utilizzato:
        </div>
      </div>
      
      <div>
        <BlockedRoleCard
          :reason="targetRoleResult"
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
