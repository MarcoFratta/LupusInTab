<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true },
});

const hasActed = computed(() => {
    const used = props.gameState.usedPowers?.['barabba'] || [];
    return used.includes(props.player.id);
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => p.alive && p.id !== props.player.id && !props.playerIds.includes(p.id)));
const choices = computed(() => [
    { label: 'Seleziona un giocatore…', value: null },
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
        <div v-if="hasActed" class="text-xs text-neutral-400">Hai già usato il tuo potere in questa partita.</div>
        <PromptSelect
            v-else
            label="Barabba, scegli un giocatore da uccidere (una volta per partita)"
            v-model="targetId"
            :choices="choices"
            buttonText=""
            accent="violet"
            :disabled="choices.length === 0"
        />
        <SkipConfirmButtons
            v-if="!hasActed"
            confirm-text="Uccidi"
            :confirm-disabled="!canSubmit"
            @confirm="submit"
            @skip="skip"
        />
        <div v-else>
            <SkipConfirmButtons
                :showSkip="false"
                confirm-text="Continua"
                :confirm-disabled="false"
                @confirm="skip"
            />
        </div>
    </div>
</template>
