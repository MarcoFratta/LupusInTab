<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

// Determine if Justicer has already acted before (usage once) by checking global usedPowers
const hasActed = computed(() => {
    const used = props.gameState.usedPowers?.['justicer'] || [];
    return used.includes(props.player.id);
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => p.alive && p.id !== props.player.id));
const choices = computed(() => [
    { label: 'Select a player…', value: null },
    ...selectable.value.map((p) => ({ label: p.name, value: p.id }))
]);

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

function submit() {
    if (!canSubmit.value) return;
    props.onComplete({ targetId: targetId.value, used: true });
}

function skip() {
    props.onComplete({ targetId: null, used: false });
}
</script>

<template>
    <div class="space-y-3">
        <div v-if="hasActed" class="text-xs text-neutral-400">You have already used your power this game.</div>
        <PromptSelect
            v-else
            label="Justicer, choose a player to execute (once per game)"
            v-model="targetId"
            :choices="choices"
            buttonText="Execute"
            accent="violet"
            :disabled="!canSubmit && choices.length === 0"
            @confirm="submit"
        />
        <div class="flex justify-end" v-if="!hasActed">
            <button class="btn btn-secondary" @click="skip">Skip</button>
        </div>
    </div>
</template>



