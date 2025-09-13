<script setup>
import { ref, computed } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles/index';

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const targetId = ref(null);

const aliveChoices = computed(() => [
    { label: 'Seleziona un giocatore...', value: null },
    ...props.gameState.players
        .filter(p => {
            // Only show alive players
            if (!p.alive) return false;
            
            // Don't show the current player (Illusionista) or other players with the same role
            if (props.playerIds.includes(p.id)) return false;
            
            return true;
        })
        .map(p => ({ label: p.name, value: p.id }))
]);

function submit() {
    props.onComplete({ targetId: Number(targetId.value), used: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="text-center">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 Scegli un giocatore da illusionare</p>
            </div>
            <div class="text-slate-100 text-sm font-medium mb-2">Seleziona un giocatore da illusionare</div>
            <div class="text-slate-400 text-xs">Il giocatore scelto non potrà usare la sua abilità questa notte</div>
        </div>
        
        <PromptSelect 
            label="Seleziona un giocatore da bloccare"
            v-model="targetId" 
            :choices="aliveChoices" 
            buttonText="Conferma"
            @confirm="submit"
        />
    </div>
</template>
