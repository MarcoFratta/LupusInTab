<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

interface Props {
    gameState: any;
    player: any;
    onComplete: (r: any) => void;
}

const props = defineProps<Props>();

const targetId = ref<number | null>(null);
const deadPlayers = computed(() => 
    props.gameState.players.filter((p: any) => p.isDead)
);

const choices = computed(() => [
    { label: 'Seleziona un giocatore morto…', value: null },
    ...deadPlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

function submit() {
    props.onComplete({ targetId: targetId.value });
}

</script>

<template>
  <div class="space-y-4">
    <div v-if="deadPlayers.length === 0" class="text-center text-gray-500">
      <p>Nessun giocatore morto da investigare</p>
    </div>
    
    <div v-else class="space-y-4">
      <div class="text-center">
        <p class="text-neutral-400 text-sm">Controlla la fazione di un giocatore morto</p>
      </div>
      
      <PromptSelect
        label="Chi vuoi controllare?"
        v-model="targetId"
        :choices="choices"
        buttonText="Conferma selezione"
        accent="violet"
        :disabled="!choices.length"
        @confirm="submit"
      />
    </div>
  </div>
</template>
