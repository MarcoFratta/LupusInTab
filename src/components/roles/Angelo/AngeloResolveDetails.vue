<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: false },
});

const angeloEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => angeloEvent.value?.targetId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const angeloPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const hasAction = computed(() => target.value && angeloPlayers.value.length > 0);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="angeloPlayers"
                :right-player="target"
                :left-label="t('resolveDetails.angelo')"
                :right-label="t('resolveDetails.resuscitato')"
                :center-content="{
                    action: t('resolveDetails.resurrected')
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>
