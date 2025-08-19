<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { ROLES } from '../../../roles';

const props = defineProps({
	gameState: { type: Object, required: true },
	entry: { type: Object, required: true },
	player: { type: Object, required: true },
});

const dogEvent = computed(() => {
    const playerId = props.player?.id;
    const nightNumber = props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'dog_declare' ? nightEvents[playerId] : null;
});

const targetId = computed(() => dogEvent.value?.data?.target);
const target = computed(() => targetId.value ? 
	props.gameState.players.find((p) => p.id === targetId.value) : null
);

const roleId = computed(() => dogEvent.value?.data?.declaredRole);
const roleName = computed(() => roleId.value ? (ROLES[roleId.value]?.name || roleId.value) : 'N/A');
const isCorrect = computed(() => dogEvent.value?.data?.correct);

const hasDeclaration = computed(() => target.value && roleId.value);

const centerContent = computed(() => ({
    action: 'ha dichiarato',
    declaredRole: {
        name: roleName.value || 'N/A',
        color: roleName.value ? (ROLES[roleId.value]?.color || '#9ca3af') : '#9ca3af'
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
        v-else
        :game-state="gameState"
        :left-player="player"
        :right-player="target"
        left-label="Lupo Mannaro"
        right-label="Bersaglio"
        :center-content="centerContent"
    />
</template>

