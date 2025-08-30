<script setup lang="ts">
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { getFactionConfig } from '../../../factions';
import { ROLES } from '../../../roles';
import {getRoleById} from "../../../utils/roleUtils";

interface Props {
    gameState: any;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();

const bugiardoEvents = computed(() => {
    if (!props.entry || !props.entry.targetId) return [];
    return [props.entry];
});

const bugiardoPlayers = computed(() => props.gameState.players.filter(p => p.roleId === 'bugiardo'));

const representativeBugiardo = computed(() => {
  const bugiardoList = bugiardoPlayers.value;
  if (bugiardoList.length === 0) return null;
  
  return {
    ...bugiardoList[0],
    name: bugiardoList.length === 1 ? bugiardoList[0].name : bugiardoList.map(b => b.name).join(', '),
    roleId: 'bugiardo'
  };
});



const getRoleColor = (roleId: string) => {
  const role = props.gameState.roles?.[roleId];
  return role?.color || '#9ca3af';
};
const getRoleName = (roleId: string) => {
  return ROLES[roleId].name;
}
const getFactionColor = (roleId: string) => {
  const role = ROLES[roleId];
  if (!role?.team) return '#9ca3af';
  const factionConfig = getFactionConfig(role.team);
  return factionConfig?.color || '#9ca3af';
};
</script>

<template>
  <div class="space-y-4">
    <template v-if="bugiardoEvents.length">
      <div v-for="event in bugiardoEvents" :key="'bg-' + event.playerId + '-' + event.targetId" class="space-y-3">
        <RoleComparisonCard
          :game-state="props.gameState"
          :left-player="representativeBugiardo"
          :right-player="event.targetId && props.gameState.players.find((p)=>p.id===Number(event.targetId))"
          left-label="Bugiardo"
          right-label="Bersaglio"
          :center-content="{
            action: bugiardoPlayers.length > 1 ? 'hanno visto' : 'ha visto'
          }"
        />
        
        <InvestigationResultCard 
          title="Risultato Investigazione"
          text="aveva il ruolo"
          :results="getRoleName(event.discoveredRole)"
          :color="getFactionColor(event.discoveredRole)"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
