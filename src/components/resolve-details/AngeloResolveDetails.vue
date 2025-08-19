<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    nightNumber: { type: Number, required: false },
});

const angeloEvent = computed(() => {
    const playerId = props.entry?.playerId;
    const nightNumber = props.nightNumber || props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'angelo_resurrect' ? nightEvents[playerId] : null;
});

const targetId = computed(() => angeloEvent.value?.data?.target);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const angelo = computed(() => {
    const playerId = props.entry?.playerId;
    return props.gameState.players.find(p => p.id === playerId);
});

const hasAction = computed(() => target.value && angelo.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="angelo"
                :right-player="target"
                left-label="Angelo"
                right-label="Resuscitato"
                :center-content="{
                    action: 'ha resuscitato'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>
