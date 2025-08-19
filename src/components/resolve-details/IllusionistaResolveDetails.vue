<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    player: { type: Object, required: true },
    nightNumber: { type: Number, required: false },
});

const illusionistaEvent = computed(() => {
    const playerId = props.player?.id;
    const nightNumber = props.nightNumber || props.gameState.nightNumber;
    if (!playerId || !nightNumber) return null;
    
    // Access the new night-based history structure (map)
    const nightEvents = props.gameState.history?.[nightNumber] || {};
    return nightEvents[playerId] && nightEvents[playerId].type === 'illusionista_block' ? nightEvents[playerId] : null;
});

const targetId = computed(() => illusionistaEvent.value?.data?.target);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const hasAction = computed(() => target.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="props.player"
                :right-player="target"
                left-label="Illusionista"
                right-label="Bersaglio"
                :center-content="{
                    action: 'ha bloccato'
                }"
            />
        </template>
        <template v-else>
            <div class="text-neutral-400 text-center text-xs">Nessun giocatore bloccato</div>
        </template>
    </div>
</template>
