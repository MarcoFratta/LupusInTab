<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';
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
    <div class="space-y-4">
        <div class="text-center">
            <p class="text-neutral-400 text-sm">Controlla la fazione di un giocatore morto</p>
        </div>

        <div v-if="!hasDeadPlayers" class="text-center space-y-3">
            <div class="text-neutral-400 text-sm">Nessun giocatore morto ancora</div>
            <button class="btn btn-primary w-full" @click="skip">
                Continua
            </button>
        </div>

        <div v-else class="space-y-3">
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



