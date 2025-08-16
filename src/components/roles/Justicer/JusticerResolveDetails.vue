<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
});

const targetId = Number(props.entry?.result?.targetId);
const target = Number.isFinite(targetId) ? props.gameState.players.find(p => p.id === targetId) : null;

// Get the justicer player who performed this action
const justicer = computed(() => {
    const playerId = props.entry?.playerId;
    return props.gameState.players.find(p => p.id === playerId);
});

const justicerRoleMeta = computed(() => props.gameState.roleMeta?.['justicer']);
const targetRoleMeta = computed(() => target ? props.gameState.roleMeta?.[target.roleId] : null);

const hasAction = computed(() => target && justicer.value);
</script>

<template>
    <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2">
            <template v-if="hasAction">
                <ComparisonRow
                    :key="'justicer-' + justicer.id + '-' + targetId"
                    label="giustiziato"
                    :left-items="[{ 
                        label: justicer.name, 
                        color: justicerRoleMeta?.color || '#8b5cf6' 
                    }]"
                    :right-items="[{ 
                        label: target.name, 
                        color: targetRoleMeta?.color 
                    }]"
                />
            </template>
            <span v-else class="text-neutral-400 text-xs">Nessuna giustizia</span>
        </div>
    </div>
</template>



