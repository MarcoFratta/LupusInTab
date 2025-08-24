<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const hasActed = computed(() => {
    const used = props.gameState.usedPowers?.['angelo'] || [];
    return used.includes(props.player.id);
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => !p.alive));
const choices = computed(() => [
    { label: 'Seleziona un giocatore morto…', value: null },
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

function submitNoAction() {
    props.onComplete({ skipped: true });
}
</script>

<template>
    <div class="space-y-3">
        <div v-if="hasActed" class="text-xs text-neutral-400">Hai già usato il tuo potere in questa partita.</div>
        
        <div v-else-if="selectable.length === 0" class="text-center text-gray-500">
            <p>Nessun giocatore da resuscitare</p>
            <button 
                class="btn btn-primary w-full mt-4" 
                @click="submitNoAction"
            >
                Continua
            </button>
        </div>
        
        <div v-else class="space-y-3">
            <PromptSelect
                label="Angelo, scegli un giocatore morto da riportare in vita (una volta per partita)"
                v-model="targetId"
                :choices="choices"
                buttonText=""
                accent="yellow"
                :disabled="choices.length === 0"
            />
            <SkipConfirmButtons
                confirm-text="Resuscita"
                :confirm-disabled="!canSubmit"
                @confirm="submit"
                @skip="skip"
            />
        </div>
        
        <div v-if="hasActed">
            <SkipConfirmButtons
                :showSkip="false"
                confirm-text="Continua"
                :confirm-disabled="false"
                @confirm="skip"
            />
        </div>
    </div>
</template>
