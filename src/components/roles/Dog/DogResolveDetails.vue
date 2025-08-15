<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    player: { type: Object, required: true },
});

const targetId = Number(props.entry?.result?.targetId);
const roleId = String(props.entry?.result?.roleId || '');
const target = Number.isFinite(targetId) ? props.gameState.players.find(p => p.id === targetId) : null;
const roleName = roleId ? (props.gameState.roleMeta?.[roleId]?.name || roleId) : '';

const playerRole = computed(() => props.player.roleId);
const playerRoleMeta = computed(() => props.gameState.roleMeta?.[playerRole.value]);
const targetRoleMeta = computed(() => target ? props.gameState.roleMeta?.[target.roleId] : null);

const hasDeclaration = computed(() => target && roleId);
</script>

<template>
    <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2">
            <template v-if="hasDeclaration">
                <ComparisonRow
                    :key="'declare-' + props.player.id + '-' + targetId"
                    label="dichiarato"
                    :left-items="[{ 
                        label: props.player.name, 
                        color: playerRoleMeta?.color 
                    }]"
                    :right-items="[{ 
                        label: `${target?.name} → ${roleName}`, 
                        color: targetRoleMeta?.color 
                    }]"
                />
            </template>
            <span v-else class="text-neutral-400 text-xs">Nessuna dichiarazione</span>
        </div>
    </div>
</template>

