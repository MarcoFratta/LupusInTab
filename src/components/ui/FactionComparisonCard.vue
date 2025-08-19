<script setup lang="ts">
import FactionLabel from './FactionLabel.vue';

interface Props {
    currentTeam: string;
    nextTeam: string;
    currentLabel?: string;
    nextLabel?: string;
    showLabels?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    currentLabel: 'Prima:',
    nextLabel: 'Dopo:',
    showLabels: true
});
</script>

<template>
    <!-- Always horizontal layout with better alignment -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
        <div class="flex flex-col items-center gap-3">
            <span v-if="showLabels" class="text-neutral-400 text-xs font-medium">{{ currentLabel }}</span>
            <FactionLabel 
                :team="currentTeam" 
                :labelText="currentTeam === 'lupi' ? 'Lupi' : 'Villaggio'" 
                size="lg"
            />
        </div>
        <div class="text-neutral-400 text-xl text-center font-medium px-2">→</div>
        <div class="flex flex-col items-center gap-3">
            <span v-if="showLabels" class="text-neutral-400 text-xs font-medium">{{ nextLabel }}</span>
            <FactionLabel 
                :team="nextTeam" 
                :labelText="nextTeam === 'lupi' ? 'Lupi' : 'Villaggio'" 
                size="lg"
            />
        </div>
    </div>
</template>

