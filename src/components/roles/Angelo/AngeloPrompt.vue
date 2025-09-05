<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const hasActed = computed(() => {
    const used = props.gameState.usedPowers?.['angelo'] || [];
    return props.playerIds.some(playerId => used.includes(playerId));
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
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <p class="text-neutral-400 text-base font-medium">Angelo, scegli un giocatore morto da riportare in vita (una volta per partita)</p>
        </div>
        
        <div v-if="hasActed" class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
                <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-sm font-medium text-neutral-300">Hai già usato il tuo potere in questa partita</span>
            </div>
        </div>
        
        <div v-else-if="selectable.length === 0" class="text-center space-y-4">
            <p class="text-neutral-400 text-base">Nessun giocatore da resuscitare</p>
            <button 
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                @click="submitNoAction"
            >
                Continua
            </button>
        </div>
        
        <div v-else class="space-y-6">
            <PromptSelect
                label="Chi vuoi resuscitare?"
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
