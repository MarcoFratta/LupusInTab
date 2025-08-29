<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';

const props = defineProps<{ gameState: any, player: any, onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const deadPlayers = computed(() => props.gameState.players.filter(p => !p.alive));
const deadChoices = computed(() => [
    { label: 'Seleziona un giocatore morto…', value: null },
    ...deadPlayers.value.map(p => ({ label: p.name, value: p.id }))
]);

const hasDeadPlayers = computed(() => deadPlayers.value.length > 0);

function submit() {
    props.onComplete({ targetId: Number(targetId.value) });
}

function skip() {
    props.onComplete({ targetId: null });
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <p class="text-neutral-400 text-base font-medium">Controlla la fazione di un giocatore morto</p>
        </div>

        <div v-if="!hasDeadPlayers" class="text-center space-y-4">
            <p class="text-neutral-400 text-base">Nessun giocatore morto ancora</p>
            <button 
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                @click="skip"
            >
                Continua
            </button>
        </div>

        <div v-else class="space-y-6">
            <PromptSelect
                label="Chi vuoi controllare?"
                v-model="targetId"
                :choices="deadChoices"
                buttonText="Conferma selezione"
                accent="violet"
                @confirm="submit"
            >
                <DisplayFaction
                    :game-state="gameState"
                    :target-id="targetId"
                    discovery-text="Ha scoperto che"
                />
            </PromptSelect>
        </div>
    </div>
</template>



