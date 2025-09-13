<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: true },
});

const illusionistaEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => illusionistaEvent.value?.targetId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const illusionistaPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const hasAction = computed(() => target.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="illusionistaPlayers"
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
