<script setup>
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { ROLES } from '../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    label: { type: String, required: true },
    align: { type: String, default: 'left' }
});

const playerRoleDef = computed(() => ROLES[props.player.roleId]);

const alignmentClasses = computed(() => {
    if (props.align === 'right') return 'text-right';
    if (props.align === 'center') return 'text-center';
    return 'text-left';
});

const roleAlignmentClasses = computed(() => {
    if (props.align === 'right') return 'justify-end ml-auto';
    if (props.align === 'center') return 'justify-center';
    return 'justify-start';
});
</script>

<template>
    <div :class="['w-full flex-grow min-w-0 flex flex-col', alignmentClasses.value]">
        <div class="text-xs text-neutral-400 mb-1"
             :class="align === 'right' ? 'text-right' : ''">{{ label }}</div>
        <div class="px-2 py-1.5 rounded border text-sm h-full font-medium bg-transparent"
             :class="align === 'right' ? 'text-right' : ''"
             :style="{ borderColor: getFactionConfig(playerRoleDef?.team)?.color || '#9ca3af' }">
            <div class="text-neutral-200">{{ player.name }}</div>
            <div class="flex items-center gap-1 mt-0.5" 
                 :class="[
                     roleAlignmentClasses.value,
                     align === 'right' ? 'flex-row-reverse' : ''
                 ]">
                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: playerRoleDef?.color }"></div>
                <span class="text-xs" :style="{ color: playerRoleDef?.color }">{{ playerRoleDef?.name || player.roleId }}</span>
            </div>
        </div>
    </div>
</template>
