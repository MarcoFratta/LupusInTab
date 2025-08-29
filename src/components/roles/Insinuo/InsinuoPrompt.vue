<template>
    <div class="space-y-4">
        <div class="text-center">
            <p class="text-neutral-400 text-sm">Scegli un giocatore da insinuare per questa notte.</p>
        </div>
        
        <PromptSelect
            label="Chi vuoi insinuare?"
            v-model="selectedTargetId"
            :choices="playerChoices"
            placeholder="Seleziona un giocatore..."
            buttonText="Conferma selezione"
            accent="violet"
            @confirm="onTargetSelect"
        >
            <div v-if="selectedTarget && targetFactionInfo" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4">
                <div class="text-center space-y-3">
                    <div class="text-neutral-300 text-sm">Hai scelto:</div>
                    <div class="text-neutral-100 font-medium">{{ selectedTarget.name }}</div>
                    <FactionComparisonCard 
                        :current-team="targetFactionInfo.currentTeam"
                        :next-team="targetFactionInfo.nextTeam"
                    />
                </div>
            </div>
        </PromptSelect>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import FactionComparisonCard from '../../ui/FactionComparisonCard.vue';

const props = defineProps<{ gameState: any, player: any, onComplete: (r:any)=>void }>();

const selectedTargetId = ref<number | null>(null);

const alivePlayers = computed(() => 
    props.gameState.players.filter((p: any) => p.alive && p.roleId !== 'insinuo')
);

const playerChoices = computed(() => 
    alivePlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
);

const selectedTarget = computed(() => 
    selectedTargetId.value ? alivePlayers.value.find((p: any) => p.id === selectedTargetId.value) : null
);

const targetFactionInfo = computed(() => {
    if (!selectedTarget.value) return null;
    
    const currentVisible = selectedTarget.value.roleState?.visibleAsTeam || selectedTarget.value.roleState?.realTeam || 'villaggio';
    const nextVisible = currentVisible === 'lupi' ? 'villaggio' : 'lupi';
    
    return {
        current: currentVisible === 'lupi' ? 'Lupi' : 'Villaggio',
        next: nextVisible === 'lupi' ? 'Lupi' : 'Villaggio',
        currentTeam: currentVisible,
        nextTeam: nextVisible
    };
});

function onTargetSelect() {
    props.onComplete({ targetId: selectedTargetId.value });
}
</script>
