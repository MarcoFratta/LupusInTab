<script setup>
import PromptDeclare from '../../ui/prompts/PromptDeclare.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});
</script>

<template>
    <PromptDeclare
        :skippable="false"
        :gameState="props.gameState" 
        :player="props.player" 
        :onComplete="props.onComplete" 
    />
</template>

