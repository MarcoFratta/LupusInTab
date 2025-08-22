<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: true },
});

const boiaEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => boiaEvent.value?.targetId);
const roleId = computed(() => boiaEvent.value?.declaredRoleId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);
const roleName = computed(() => roleId.value ? (ROLES[roleId.value]?.name || roleId.value) : '');

const boiaPlayers = computed(() => props.gameState.players.filter(p => p.roleId === 'boia'));

const representativeBoia = computed(() => {
  const boiaList = boiaPlayers.value;
  if (boiaList.length === 0) return null;
  
  // Create a representative boia object that shows all names
  return {
    ...boiaList[0],
    name: boiaList.length === 1 ? boiaList[0].name : boiaList.map(h => h.name).join(', '),
    roleId: 'boia'
  };
});

const hasDeclaration = computed(() => target.value && roleId.value);
const isCorrect = computed(() => boiaEvent.value?.correct ?? false);

const centerContent = computed(() => ({
    action: 'ha scelto',
    declaredRole: {
        name: roleName.value || 'N/A',
        color: roleName.value ? (getFactionConfig(ROLES[roleId.value]?.team)?.color || '#9ca3af') : '#9ca3af'
    },
    status: {
        isCorrect: isCorrect.value,
        text: isCorrect.value ? 'Corretto' : 'Sbagliato'
    }
}));
</script>

<template>
    <div v-if="!hasDeclaration" class="text-neutral-400 text-center text-xs">Nessuna dichiarazione</div>
    <RoleComparisonCard
        v-else-if="representativeBoia"
        :game-state="gameState"
        :left-player="representativeBoia"
        :right-player="target"
        left-label="Boia"
        right-label="Bersaglio"
        :center-content="centerContent"
    />
</template>

