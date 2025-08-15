<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const deadChoices = computed(() => [
    { label: 'Seleziona un giocatore morto…', value: null },
    ...props.gameState.players.filter(p => !p.alive).map(p => ({ label: p.name, value: p.id }))
]);
const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

function submit() {
    if (!canSubmit.value) return;
    props.onComplete({ targetId: Number(targetId.value) });
}

function skip() {
    props.onComplete({ targetId: null });
}
</script>

<template>
    <div class="space-y-3">
        <PromptSelect
            label="Medium, controlla la fazione di un giocatore morto"
            v-model="targetId"
            :choices="deadChoices"
            buttonText="Rivela fazione"
            accent="violet"
            :disabled="deadChoices.length <= 1 && !canSubmit"
            @confirm="submit"
        />
        <div class="flex justify-end">
            <button class="btn btn-secondary" @click="skip">Salta</button>
        </div>
    </div>
</template>



