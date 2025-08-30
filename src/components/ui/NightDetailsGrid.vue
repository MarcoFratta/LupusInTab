<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../../roles';
import { getFactionConfig } from '../../factions';
import BlockedRoleCard from './BlockedRoleCard.vue';
import EventCard from './EventCard.vue';

interface Props {
  gameState: any;
  nightNumber: number;
}

const props = defineProps<Props>();

type DetailEntry = { key: string; title: string; component: any; props?: Record<string, any> };

const nightPlayerActions = computed(() => {
  const nightNumber = props.nightNumber;
  if (!nightNumber) return {};
  
  return props.gameState.history?.[nightNumber] || {};
});

const roleActions = computed(() => {
  const actions = new Map();
  
  for (const [roleId, action] of Object.entries(nightPlayerActions.value)) {
    if (!action) continue;
    
    const roleDef = (ROLES as any)[roleId];
    if (!roleDef) continue;
    
    let rolePlayers: any[] = [];
    
    if (action && typeof action === 'object' && action.playerIds) {
      rolePlayers = props.gameState.players.filter((p: any) => action.playerIds.includes(p.id));
    } else if (action && typeof action === 'object' && action.playerId) {
      const player = props.gameState.players.find((p: any) => p.id === action.playerId);
      if (player) rolePlayers = [player];
    } else {
      rolePlayers = props.gameState.players.filter((p: any) => p.roleId === roleId);
    }
    
    if (!actions.has(roleId)) {
      actions.set(roleId, { roleId, action, players: rolePlayers });
    }
  }
  
  return actions;
});

const getRoleColor = (roleId: string) => {
  if (!roleId || roleId === 'none') return '#9ca3af';
  
  const roleDef = (ROLES as any)[roleId];
  if (!roleDef) return '#9ca3af';
  
  return getFactionConfig(roleDef.team)?.color || '#9ca3af';
};

const detailEntries = computed(() => {
  const entries: DetailEntry[] = [];
  
  for (const [roleId, roleData] of roleActions.value) {
    const roleDef = (ROLES as any)[roleId];
    if (!roleDef) continue;
    
    const title = roleDef.name || roleId;
    const action = roleData.action;
    const firstPlayer = roleData.players[0];
    
    if (typeof action === 'string') {
      const reason = action;
      
      if (reason === 'skipped') continue;
      
      entries.push({ 
        key: `${roleId}-${reason}`, 
        title, 
        component: BlockedRoleCard, 
        props: { 
          reason: reason,
          player: firstPlayer,
          roleId
        } 
      });
      continue;
    }
    
    if (action && typeof action === 'object' && action.type) {
      const componentFactory = roleDef.getResolveDetailsComponent;
      
      if (componentFactory && typeof componentFactory === 'function') {
        entries.push({
          key: `${roleId}-details`,
          title,
          component: defineAsyncComponent({
            loader: componentFactory,
            errorComponent: EventCard,
            onError: (error, retry, fail, attempts) => {
              console.error(`Failed to load component for role ${roleId}:`, error);
              if (attempts <= 3) {
                retry();
              } else {
                fail();
              }
            }
          }),
          props: { 
            gameState: props.gameState, 
            entry: action,
            players: roleData.players,
            player: roleData.players[0],
            roleId
          }
        });
      } else {
        entries.push({
          key: `${roleId}-summary`,
          title,
          component: EventCard,
          props: { 
            title: title,
            event: action, 
            roleId 
          }
        });
      }
    }
  }
  
  if (entries.length === 0) {
    entries.push({
      key: 'no-actions',
      title: 'Nessuna azione',
      component: 'div',
      props: { 
        content: 'Nessun ruolo ha utilizzato i suoi poteri questa notte.',
        roleId: 'none'
      }
    });
  }
  
  return entries.sort((a, b) => {
    const roleIdA = a.props?.roleId || a.key.split('-')[0];
    const roleIdB = b.props?.roleId || b.key.split('-')[0];
    
    const roleDefA = (ROLES as any)[roleIdA];
    const roleDefB = (ROLES as any)[roleIdB];
    
    if (!roleDefA || !roleDefB) return 0;
    
    const factionA = roleDefA.team || 'unknown';
    const factionB = roleDefB.team || 'unknown';
    
    const factionOrder = ['villaggio', 'lupi', 'matti', 'mannari', 'parassita', 'alieni'];
    const priorityA = factionOrder.indexOf(factionA);
    const priorityB = factionOrder.indexOf(factionB);
    
    const finalPriorityA = priorityA === -1 ? factionOrder.length : priorityA;
    const finalPriorityB = priorityB === -1 ? factionOrder.length : priorityB;
    
    if (finalPriorityA !== finalPriorityB) {
      return finalPriorityA - finalPriorityB;
    }
    
    return (roleDefA.name || roleIdA).localeCompare(roleDefB.name || roleIdB);
  });
});
</script>

<template>
  <div class="space-y-4">
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="e in detailEntries" 
        :key="e.key" 
        class="bg-white/5 border border-white/10 rounded-lg pt-4"
      >
        <div class="flex items-center justify-center mb-3">
          <div class="font-semibold text-sm" :style="{ color: getRoleColor(e.props?.roleId || e.key.split('-')[0]) }">
            {{ e.title }}
          </div>
        </div>
        <div class="text-left">
          <component 
            v-if="e.component !== 'div'" 
            :is="e.component" 
            :state="props.gameState" 
            :gameState="props.gameState" 
            v-bind="e.props || {}" 
          />
          <div v-else class="text-center p-2 text-neutral-400 text-xs">
            {{ e.props?.content || 'Nessun dettaglio disponibile' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
