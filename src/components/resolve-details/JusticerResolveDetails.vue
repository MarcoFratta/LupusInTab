<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    nightNumber: { type: Number, required: false },
});

const justicerEvent = computed(() => {
    const playerId = props.entry?.playerId;
    const nightNumber = props.nightNumber || props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'justicer_execute' ? nightEvents[playerId] : null;
});

const targetId = computed(() => justicerEvent.value?.data?.target);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const justicer = computed(() => {
    const playerId = props.entry?.playerId;
    return props.gameState.players.find(p => p.id === playerId);
});

const hasAction = computed(() => target.value && justicer.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="justicer"
                :right-player="target"
                left-label="Giustiziere"
                right-label="Bersaglio"
                :center-content="{
                    action: 'ha giustiziato'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>



