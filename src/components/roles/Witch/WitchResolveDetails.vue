<script setup>
const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
});
const id = Number(props.entry?.result?.targetId);
const target = Number.isFinite(id) ? props.gameState.players.find(p => p.id === id) : null;
const team = target ? (props.gameState.roleMeta[target.roleId]?.visibleAsTeam || props.gameState.roleMeta[target.roleId]?.team) : '';
</script>

<template>
    <div class="text-sm text-neutral-300">
        <div v-if="target">Il Medium ha controllato che <span class="font-semibold">{{ target.name }}</span> era <span class="font-semibold">{{ (team || '').toUpperCase() }}</span>.</div>
        <div v-else>Il Medium non ha agito.</div>
    </div>
</template>



