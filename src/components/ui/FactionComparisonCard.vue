<script setup lang="ts">
import FactionLabel from './FactionLabel.vue';
import { useI18n } from '../../composables/useI18n';

interface Props {
    currentTeam: string;
    nextTeam: string;
    currentLabel?: string;
    nextLabel?: string;
    showLabels?: boolean;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
    currentTeam: 'villaggio',
    nextTeam: 'villaggio',
    currentLabel: 'factionComparison.before',
    nextLabel: 'factionComparison.after',
    showLabels: true
});
</script>

<template>
    <!-- Always horizontal layout with better alignment -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-2 w-full">
        <div class="flex flex-col items-center gap-3">
            <span v-if="showLabels" class="text-neutral-400 text-xs font-medium">{{ t(currentLabel) }}</span>
            <FactionLabel 
                :team="currentTeam" 
                :labelText="t(`factions.${currentTeam}`)" 
                size="lg"
            />
        </div>
        <div class="text-neutral-400 text-xl text-center font-medium px-2 flex items-center justify-center self-center">→</div>
        <div class="flex flex-col items-center gap-3">
            <span v-if="showLabels" class="text-neutral-400 text-xs font-medium">{{ t(nextLabel) }}</span>
            <FactionLabel 
                :team="nextTeam" 
                :labelText="t(`factions.${nextTeam}`)" 
                size="lg"
            />
        </div>
    </div>
</template>

