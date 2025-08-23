<script setup>
import { ref, computed } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles/index';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const targetId = ref(null);

const aliveChoices = computed(() => [
    { label: 'Seleziona un giocatore...', value: null },
    ...props.gameState.players
        .filter(p => {
            // Only show alive players
            if (!p.alive) return false;
            
            // Don't show the current player (Illusionista)
            if (p.id === props.player.id) return false;
            
            // Don't show other players with the Illusionista role
            if (p.roleId === 'illusionista') return false;
            
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
            <div class="text-slate-100 text-sm font-medium mb-2">Seleziona un giocatore da bloccare</div>
            <div class="text-slate-400 text-xs">Il giocatore selezionato non potrà usare la sua abilità notturna</div>
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
