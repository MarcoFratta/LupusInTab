<script setup lang="ts">
import { computed } from 'vue';
import { getPlayerRealTimeVisibleTeam } from '../../core/engine';
import { getFactionDisplayName } from '../../utils/factionUtils';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

interface Props {
    gameState: any;
    targetId: number | null;
    discoveryText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    discoveryText: 'Ha scoperto che'
});

const selectedPlayer = computed(() => {
    if (!props.targetId) return null;
    return props.gameState.players.find((p: any) => p.id === props.targetId) || null;
});

const teamId = computed(() => {
    if (!selectedPlayer.value) return null as string | null;
    return getPlayerRealTimeVisibleTeam(props.gameState, selectedPlayer.value.id) || null;
});

const teamLabel = computed(() => {
    if (!teamId.value) return null;
    return getFactionDisplayName(teamId.value, t);
});

const teamPillClass = computed(() => {
    return teamId.value === 'lupi'
        ? 'bg-red-500/20 text-red-300 border-red-500/30'
        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
});
</script>

<template>
    <div v-if="selectedPlayer && teamLabel" class="space-y-3">
        <!-- Investigation Result -->
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
            <div class="text-center space-y-3">
                <div class="text-xs text-neutral-400">{{ discoveryText }}</div>
                <div class="flex items-center justify-center gap-3">
                    <span class="text-neutral-400 text-xs">{{ t('phaseReveal.appearsAs') }}</span>
                    <span class="px-3 py-1.5 rounded text-sm font-medium border" :class="teamPillClass">{{ teamLabel }}</span>
                </div>
            </div>
        </div>
    </div>
</template>


