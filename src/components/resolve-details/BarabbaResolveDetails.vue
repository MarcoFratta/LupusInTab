<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    nightNumber: { type: Number, required: false },
});

const barabbaEvent = computed(() => {
    const playerId = props.entry?.playerId;
    const nightNumber = props.nightNumber || props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'barabba_execute' ? nightEvents[playerId] : null;
});

const targetId = computed(() => barabbaEvent.value?.data?.target);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const barabba = computed(() => {
    const playerId = props.entry?.playerId;
    return props.gameState.players.find(p => p.id === playerId);
});

const hasAction = computed(() => target.value && barabba.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="barabba"
                :right-player="target"
                left-label="Barabba"
                right-label="Bersaglio"
                :center-content="{
                    action: 'ha ucciso'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>
