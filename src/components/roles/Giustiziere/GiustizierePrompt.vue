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
    const used = props.gameState.usedPowers?.['justicer'] || [];
    return used.includes(props.player.id);
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => p.alive && p.id !== props.player.id));
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
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <p class="text-neutral-400 text-base font-medium">Giustiziere, scegli un giocatore da giustiziare (una volta per partita)</p>
        </div>
        
        <div v-if="hasActed" class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
                <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-sm font-medium text-neutral-300">Hai già usato il tuo potere in questa partita</span>
            </div>
        </div>
        
        <PromptSelect
            v-else
            label="Chi vuoi giustiziare?"
            v-model="targetId"
            :choices="choices"
            buttonText=""
            accent="violet"
            :disabled="choices.length === 0"
        />
        
        <SkipConfirmButtons
            v-if="!hasActed"
            confirm-text="Giustizia"
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



