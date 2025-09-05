<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';

interface Props {
    gameState: any;
    playerIds: number[];
    onComplete: (r: any) => void;
}

const props = defineProps<Props>();

const targetId = ref<number | null>(null);
const deadPlayers = computed(() => {
    const allPlayers = props.gameState.players || [];
    const dead = allPlayers.filter((p: any) => !p.alive);
    console.log('Medium Prompt Debug:', {
        totalPlayers: allPlayers.length,
        allPlayers: allPlayers.map(p => ({ id: p.id, name: p.name, alive: p.alive })),
        deadPlayers: dead.map(p => ({ id: p.id, name: p.name, alive: p.alive }))
    });
    return dead;
});

const choices = computed(() => [
    { label: 'Seleziona un giocatore morto…', value: null },
    ...deadPlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

function submit() {
    props.onComplete({ targetId: targetId.value });
}

function submitNoAction() {
    props.onComplete({ skipped: true });
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center space-y-3">
      <p class="text-neutral-400 text-base font-medium">Controlla la fazione di un giocatore morto</p>
    </div>
    
    <div v-if="deadPlayers.length === 0" class="text-center space-y-4">
      <p class="text-neutral-400 text-base">Nessun giocatore morto da investigare</p>
      <button 
        class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
        @click="submitNoAction"
      >
        Continua
      </button>
    </div>
    
    <div v-else class="space-y-6">
      <PromptSelect
        label="Chi vuoi controllare?"
        v-model="targetId"
        :choices="choices"
        buttonText="Conferma selezione"
        accent="violet"
        :disabled="!choices.length"
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
