<script setup>
import { computed, ref, watch } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true }
});

const step = ref('investigation');
const firstPlayerId = ref(null);
const investigationTargets = ref([]);
const killTargetId = ref(null);

// Helper function to get all lupi players (including grouped roles)
function getLupiPlayers() {
	const directLupi = props.gameState.players.filter(p => p.roleId === 'lupo');
	const groupedLupi = [];
	
	if (props.gameState.groupings) {
		for (const grouping of props.gameState.groupings) {
			if (grouping.fromRole === 'lupo') {
				const groupedRolePlayers = props.gameState.players.filter(p => p.roleId === grouping.toRole);
				groupedLupi.push(...groupedRolePlayers);
			}
		}
	}
	
	return [...directLupi, ...groupedLupi];
}

const hasLupoAlive = computed(() => {
	return getLupiPlayers().some(p => p.alive);
});

const canKill = computed(() => !hasLupoAlive.value);

const selectableForInvestigation = computed(() => {
	return props.gameState.players.filter(p => p.alive && !props.playerIds.includes(p.id));
});

const firstPlayerChoices = computed(() => {
	const choices = [];
	
	for (let i = 0; i < selectableForInvestigation.value.length - 2; i++) {
		const player = selectableForInvestigation.value[i];
		choices.push({ label: player.name, value: player.id });
	}
	
	return choices;
});

const selectedPlayers = computed(() => {
	if (!firstPlayerId.value) return [];
	
	const firstPlayerIndex = selectableForInvestigation.value.findIndex(p => p.id === firstPlayerId.value);
	if (firstPlayerIndex === -1 || firstPlayerIndex > selectableForInvestigation.value.length - 3) return [];
	
	return [
		selectableForInvestigation.value[firstPlayerIndex],
		selectableForInvestigation.value[firstPlayerIndex + 1],
		selectableForInvestigation.value[firstPlayerIndex + 2]
	];
});

const killingChoices = computed(() => [
	{ label: 'Seleziona un bersaglio…', value: null },
	...selectableForInvestigation.value.map((p) => ({ label: p.name, value: p.id }))
]);

const investigationResult = computed(() => {
	if (!selectedPlayers.value || selectedPlayers.value.length !== 3) return null;
	
	const hasLupiAmongTargets = selectedPlayers.value.some((player) => {
		return player && (player.roleState?.visibleAsTeam === 'lupi' || player.roleState?.team === 'lupi');
	});
	
	return hasLupiAmongTargets;
});

watch(firstPlayerId, (newValue) => {
	if (newValue && selectedPlayers.value.length === 3) {
		investigationTargets.value = selectedPlayers.value.map(p => p.id);
	} else {
		investigationTargets.value = [];
	}
});

function submitInvestigation() {
	if (selectedPlayers.value && selectedPlayers.value.length === 3) {
		investigationTargets.value = selectedPlayers.value.map(p => p.id);
		// If they can kill, move to killing step
		if (canKill.value) {
			step.value = 'killing';
		} else {
			// If no killing, submit the final result now
			submitFinal();
		}
	}
}

function skipInvestigation() {
	// Skip investigation and move to next step
	if (canKill.value) {
		step.value = 'killing';
	} else {
		// If no killing, submit the final result now
		submitFinal();
	}
}

function submitKilling() {
	// Submit the final result with both investigation and kill target
	submitFinal();
}

function submitFinal() {
	const result = {
		investigationTargets: investigationTargets.value || [],
		killTargetId: killTargetId.value
	};
	props.onComplete(result);
}

function skipKilling() {
	submitFinal();
}
</script>

<template>
    <div class="space-y-6">
        <!-- Investigation Step -->
        <div v-if="step === 'investigation'" class="space-y-4">
            <div class="text-center space-y-2">
                <p class="text-neutral-300 text-sm font-medium">
                    Scegliete il primo giocatore da investigare
                </p>
                <p class="text-neutral-500 text-xs">
                    I prossimi 2 giocatori contigui verranno selezionati automaticamente
                </p>
            </div>
            
            <div v-if="firstPlayerChoices.length > 0" class="space-y-4">
                <PromptSelect
                    label="Chi sarà il primo giocatore investigato?"
                    v-model="firstPlayerId"
                    :choices="firstPlayerChoices"
                />
                
                <!-- Show selection status -->
                <div v-if="!firstPlayerId" class="text-center py-4">
                    <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-500/10 border border-neutral-500/30">
                        <div class="w-2 h-2 rounded-full bg-neutral-400"></div>
                        <p class="text-neutral-400 text-xs font-medium">
                            Seleziona un giocatore per vedere i 3 investigati
                        </p>
                    </div>
                </div>
                
                <!-- Show selected players -->
                <div v-if="selectedPlayers.length === 3" class="space-y-3">
                    <div class="text-center space-y-3">
                        <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30">
                            <div class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
                            <p class="text-violet-200 text-xs font-medium">
                                Giocatori selezionati per l'investigazione
                            </p>
                        </div>
                        
                        <div class="flex justify-center gap-2 flex-wrap">
                            <div v-for="(player, index) in selectedPlayers" :key="player.id" 
                                 class="group relative">
                                <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/40 text-violet-100 font-medium shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105">
                                    <!-- Position Badge -->
                                    <div class="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 border border-violet-300/60 text-violet-100 font-bold text-sm">
                                        {{ index + 1 }}
                                    </div>
                                    
                                    <!-- Player Name -->
                                    <span class="text-violet-100 font-semibold text-sm">{{ player.name }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-violet-300/70 text-xs font-medium">
                                I giocatori verranno investigati in questo ordine
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Investigation Result Display -->
                <div v-if="investigationResult !== null" class="space-y-3">
                    <div class="relative overflow-hidden rounded-xl border p-4 text-center transition-all duration-300" 
                         :class="investigationResult ? 
                            'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/40 shadow-lg shadow-green-500/10' : 
                            'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-400/40 shadow-lg shadow-red-500/10'">
                        
                        <div class="relative">
                            <!-- Result Icon and Text -->
                            <div class="flex items-center justify-center gap-3 mb-2">
                                <div class="flex items-center justify-center w-8 h-8 rounded-full border-2" 
                                     :class="investigationResult ? 
                                        'bg-green-500/20 border-green-400/60 text-green-300' : 
                                        'bg-red-500/20 border-red-400/60 text-red-300'">
                                    <svg v-if="investigationResult" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                    </svg>
                                </div>
                                <div class="text-2xl font-bold" :class="investigationResult ? 'text-green-300' : 'text-red-300'">
                        {{ investigationResult ? 'SÌ' : 'NO' }}
                    </div>
                            </div>
                            
                            <!-- Result Description -->
                            <div class="text-sm font-medium" :class="investigationResult ? 'text-green-200' : 'text-red-200'">
                        {{ investigationResult ? 'C\'è almeno un lupo tra i giocatori investigati!' : 'Non ci sono lupi tra i giocatori investigati.' }}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="pt-2">
                    <button 
                        class="group relative w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden" 
                        :class="selectedPlayers.length === 3 
                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25' 
                            : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/50'" 
                        :disabled="selectedPlayers.length !== 3" 
                        @click="submitInvestigation"
                    >
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
                            <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
                        </div>
                        <div class="relative px-2 z-10 flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="font-medium">Conferma investigazione</span>
                        </div>
                        <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </button>
                </div>
            </div>
            
            <!-- No investigation choices available -->
            <div v-else class="space-y-3">
                <div class="p-4 rounded-lg bg-neutral-800/40 border border-neutral-700/40 text-center">
                    <p class="text-neutral-400 text-sm font-medium mb-1">
                        Non ci sono abbastanza giocatori per investigare
                    </p>
                    <p class="text-neutral-500 text-xs">
                        Non è possibile selezionare 3 giocatori contigui senza includere te stesso
                    </p>
                </div>
                
                <div class="pt-1">
                    <button 
                        class="w-full px-4 py-2 text-sm font-medium rounded-lg border border-neutral-600/40 hover:bg-neutral-700/40 transition-all duration-300 text-neutral-300" 
                        @click="skipInvestigation"
                    >
                        Salta investigazione
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Killing Step (only if can kill) -->
        <div v-else-if="step === 'killing'" class="space-y-4">
            <div class="text-center space-y-2">
                <p class="text-neutral-300 text-sm font-medium">
                    Tutti i lupi sono morti! Ora potete anche uccidere qualcuno
                </p>
                <p class="text-neutral-500 text-xs">
                    Scegliete un bersaglio da eliminare
                </p>
            </div>
            
            <PromptSelect
                label="Chi volete uccidere?"
                v-model="killTargetId"
                :choices="killingChoices"
                buttonText="Conferma uccisione"
                accent="red"
                :disabled="killingChoices.length === 0"
                @confirm="submitKilling"
            />
        </div>
    </div>
</template>
