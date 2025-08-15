<script setup>
const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
});

const targetId = Number(props.entry?.result?.targetId);
const target = Number.isFinite(targetId) ? props.gameState.players.find(p => p.id === targetId) : null;
</script>

<template>
    <div class="text-sm text-neutral-300">
        <div v-if="target">Giustiziere ha giustiziato <span class="font-semibold">{{ target.name }}</span>.</div>
        <div v-else>Giustiziere non ha agito.</div>
    </div>
</template>



