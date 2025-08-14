<script setup>
const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
});

const targetId = Number(props.entry?.result?.targetId);
const roleId = String(props.entry?.result?.roleId || '');
const target = Number.isFinite(targetId) ? props.gameState.players.find(p => p.id === targetId) : null;
const roleName = roleId ? (props.gameState.roleMeta?.[roleId]?.name || roleId) : '';
</script>

<template>
    <div class="text-sm text-neutral-300">
        <div v-if="targetId && roleId">Declared <span class="font-semibold">{{ target?.name || ('#'+targetId) }}</span> as <span class="font-semibold">{{ roleName }}</span>.</div>
        <div v-else>No declaration.</div>
    </div>
</template>



