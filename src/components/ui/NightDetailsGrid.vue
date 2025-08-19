<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../../roles';
import DetailsCard from './DetailsCard.vue';
import BlockedRoleCard from './BlockedRoleCard.vue';
import DeadRoleCard from './DeadRoleCard.vue';

interface Props {
  gameState: any;
  nightNumber: number;
}

const props = defineProps<Props>();

// Build detail entries dynamically by asking roles for their detail components
type DetailEntry = { key: string; title: string; component: any; props?: Record<string, any> };

const detailEntries = computed(() => {
  if (!props.nightNumber) return [];
  
  // Get the map of player actions for this night
  const nightPlayerActions = props.gameState?.history?.[props.nightNumber] || {};
  console.log(`🔍 NightDetailsGrid: night ${props.nightNumber} player actions:`, nightPlayerActions);
  
  const entries: DetailEntry[] = [];

  // Process each player that acted this night
  const processedGroupRoles = new Set(); // Track which group roles we've already processed
  
  const activeEntries: DetailEntry[] = [];
  const blockedOrDeadEntries: DetailEntry[] = [];
  
  for (const [playerId, action] of Object.entries(nightPlayerActions)) {
    if (!action) continue; // Skip undefined entries (skipped actions)
    
    const playerIdNum = Number(playerId);
    const player = props.gameState.players.find((p: any) => p.id === playerIdNum);
    if (!player) {
      console.log(`🔍 NightDetailsGrid: player not found for ID ${playerIdNum}`);
      continue;
    }
    
    const roleDef = (ROLES as any)[player.roleId];
    if (!roleDef) {
      console.log(`🔍 NightDetailsGrid: role definition not found for ${player.roleId}`);
      continue;
    }
    
    const title = roleDef.name || player.roleId;
    console.log(`🔍 NightDetailsGrid: processing ${player.roleId} (${title}) for player ${player.name}, action type: ${action.type}, action data:`, action);
    
    // Check if this is a skipped/blocked action - add to blocked/dead list
    if (action.type === 'role_skipped' || action.type === 'group_role_blocked') {
      const reason = action.reason || 'unknown';
      const isDeadPlayer = reason === 'dead' || reason === 'alive';
      
      console.log(`🔍 NightDetailsGrid: adding blocked/dead entry for ${player.roleId}, reason: ${reason}`);
      blockedOrDeadEntries.push({ 
        key: `${player.roleId}-${isDeadPlayer ? 'dead' : 'blocked'}-${playerIdNum}`, 
        title, 
        component: isDeadPlayer ? DeadRoleCard : BlockedRoleCard, 
        props: { 
          reason: reason,
          player: player
        } 
      });
      continue;
    }
    
    // Check if this is a group role
    if (roleDef.group && typeof roleDef.getGroupResolveDetailsComponent === 'function') {
      // Only process each group role once
      if (processedGroupRoles.has(player.roleId)) {
        console.log(`🔍 NightDetailsGrid: skipping duplicate group role ${player.roleId} for player ${playerId}`);
        continue;
      }
      
      console.log(`🔍 NightDetailsGrid: found group component for ${player.roleId}`);
      const factory = roleDef.getGroupResolveDetailsComponent(props.gameState, action);
      if (factory) {
        const component = defineAsyncComponent(factory);
        activeEntries.push({ 
          key: `${player.roleId}-group`, 
          title, 
          component, 
          props: { 
            gameState: props.gameState, 
            entry: action,
            player: player,
            state: props.gameState,
            nightNumber: props.nightNumber
          } 
        });
        processedGroupRoles.add(player.roleId); // Mark this group role as processed
      }
    }
    
    // Check if this is a single role
    if (!roleDef.group && typeof roleDef.getResolveDetailsComponent === 'function') {
      console.log(`🔍 NightDetailsGrid: found single component for ${player.roleId}, factory:`, roleDef.getResolveDetailsComponent);
      const factory = roleDef.getResolveDetailsComponent(props.gameState, action);
      if (factory) {
        console.log(`🔍 NightDetailsGrid: factory returned:`, factory);
        const component = defineAsyncComponent(factory);
        activeEntries.push({ 
          key: `${player.roleId}-${playerIdNum}`, 
          title, 
          component, 
          props: { 
            gameState: props.gameState, 
            entry: action, 
            player: player,
            state: props.gameState,
            nightNumber: props.nightNumber
          } 
        });
      } else {
        console.log(`🔍 NightDetailsGrid: factory returned null/undefined for ${player.roleId}`);
      }
    } else if (!roleDef.group) {
      console.log(`🔍 NightDetailsGrid: no resolve details component for ${player.roleId}`);
      // Add a fallback component for roles without resolve details
      activeEntries.push({ 
        key: `${player.roleId}-${playerIdNum}`, 
        title, 
        component: 'div', 
        props: { 
          gameState: props.gameState, 
          entry: action, 
          player: player,
          content: 'Nessun dettaglio disponibile'
        } 
      });
    }
  }
  
  // Combine active entries first, then blocked/dead entries at the bottom
  entries.push(...activeEntries, ...blockedOrDeadEntries);

  console.log(`🔍 NightDetailsGrid: final entries for night ${props.nightNumber}:`, entries.length, 'active:', activeEntries.length, 'blocked/dead:', blockedOrDeadEntries.length);
  console.log(`🔍 NightDetailsGrid: active entries:`, activeEntries.map(e => ({ key: e.key, title: e.title, component: e.component })));
  console.log(`🔍 NightDetailsGrid: blocked/dead entries:`, blockedOrDeadEntries.map(e => ({ key: e.key, title: e.title, component: e.component })));
  return entries;
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
    <DetailsCard 
      v-for="e in detailEntries" 
      :key="e.key" 
      :title="e.title" 
      :color="ROLES[e.props?.player?.roleId]?.color || '#9ca3af'">
      <component 
        v-if="e.component !== 'div'" 
        :is="e.component" 
        :state="props.gameState" 
        :gameState="props.gameState" 
        v-bind="e.props || {}" 
        @vue:mounted="() => console.log('🔍 NightDetailsGrid: component mounted:', e.key, e.component, e.props)"
      />
      <div v-else class="text-center p-2 text-neutral-400 text-xs">
        {{ e.props?.content || 'Nessun dettaglio disponibile' }}
      </div>
    </DetailsCard>
  </div>
</template>
