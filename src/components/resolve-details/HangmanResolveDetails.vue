<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';
import { ROLES } from '../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    player: { type: Object, required: true },
});

const hangmanEvent = computed(() => {
    const playerId = props.player?.id;
    const nightNumber = props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'hangman_execute' ? nightEvents[playerId] : null;
});

const targetId = computed(() => hangmanEvent.value?.data?.target);
const roleId = computed(() => hangmanEvent.value?.data?.roleId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);
const roleName = computed(() => roleId.value ? (ROLES[roleId.value]?.name || roleId.value) : '');

const hasDeclaration = computed(() => target.value && roleId.value);
const isCorrect = computed(() => hangmanEvent.value?.data?.correct ?? false);

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
        left-label="Boia"
        right-label="Bersaglio"
        :center-content="centerContent"
    />
</template>

