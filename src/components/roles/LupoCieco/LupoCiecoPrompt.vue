<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true }
});

const step = ref('investigation');
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

const investigationChoices = computed(() => {
	const choices = [];
	
	for (let i = 0; i < selectableForInvestigation.value.length - 2; i++) {
		const player1 = selectableForInvestigation.value[i];
		const player2 = selectableForInvestigation.value[i + 1];
		const player3 = selectableForInvestigation.value[i + 2];
		
		const label = `${player1.name}, ${player2.name}, ${player3.name}`;
		const value = [player1.id, player2.id, player3.id];
		
		choices.push({ label, value });
	}
	
	return choices;
});

const killingChoices = computed(() => [
	{ label: 'Seleziona un bersaglio…', value: null },
	...selectableForInvestigation.value.map((p) => ({ label: p.name, value: p.id }))
]);

const investigationResult = computed(() => {
	if (!investigationTargets.value || investigationTargets.value.length !== 3) return null;
	
	const hasLupiAmongTargets = investigationTargets.value.some((targetId) => {
		const player = props.gameState.players.find((p) => p.id === targetId);
		return player && (player.roleState?.visibleAsTeam === 'lupi' || player.roleState?.team === 'lupi');
	});
	
	return hasLupiAmongTargets;
});

function updateInvestigationSelection(value) {
	if (value === null) {
		investigationTargets.value = [];
		return;
	}
	
	const index = investigationTargets.value.findIndex(targets => 
		targets.length === value.length && 
		targets.every(id => value.includes(id))
	);
	
	if (index > -1) {
		investigationTargets.value = [];
	} else {
		investigationTargets.value = value;
	}
}

function submitInvestigation() {
	if (investigationTargets.value && investigationTargets.value.length === 3) {
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
        <div v-if="step === 'investigation'" class="space-y-6">
            <div class="text-center space-y-3">
                <p class="text-neutral-400 text-base font-medium">
                    Scegliete 3 giocatori contigui da investigare
                </p>
                <p class="text-neutral-500 text-sm">
                    Scoprirete se tra loro c'è almeno un lupo
                </p>
            </div>
            
            <div v-if="investigationChoices.length > 0" class="space-y-4">
                <div class="grid gap-3">
                    <div v-for="choice in investigationChoices" :key="choice.label" class="flex items-center space-x-3 p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/40 hover:bg-neutral-800/60 transition-all duration-200">
                        <input
                            type="radio"
                            :id="`investigation-${choice.value.join('-')}`"
                            :value="choice.value"
                            :checked="investigationTargets.length === choice.value.length && investigationTargets.every(id => choice.value.includes(id))"
                            @change="updateInvestigationSelection(choice.value)"
                            name="investigation"
                            class="w-5 h-5 text-blue-600 bg-neutral-900/70 border-neutral-700 rounded focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900"
                        />
                        <label :for="`investigation-${choice.value.join('-')}`" class="flex-1 text-neutral-200 font-medium cursor-pointer">
                            {{ choice.label }}
                        </label>
                    </div>
                </div>
                
                <!-- Investigation Result Display -->
                <div v-if="investigationResult !== null" class="bg-blue-500/10 rounded-lg p-4 text-center border border-blue-500/30">
                    <div class="text-4xl font-bold text-blue-400 mb-2">
                        {{ investigationResult ? 'SÌ' : 'NO' }}
                    </div>
                    <div class="text-blue-200 text-lg">
                        {{ investigationResult ? 'C\'è almeno un lupo tra i giocatori investigati!' : 'Non ci sono lupi tra i giocatori investigati.' }}
                    </div>
                </div>
                
                <div class="pt-2">
                    <button 
                        class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300" 
                        :class="{ 'btn-disabled': investigationTargets.length !== 3 }" 
                        :disabled="investigationTargets.length !== 3" 
                        @click="submitInvestigation"
                    >
                        Conferma investigazione
                    </button>
                </div>
            </div>
            
            <!-- No investigation choices available -->
            <div v-else class="space-y-4">
                <div class="p-6 rounded-xl bg-neutral-800/40 border border-neutral-700/40 text-center">
                    <p class="text-neutral-400 text-base font-medium mb-2">
                        Non ci sono abbastanza giocatori per investigare
                    </p>
                    <p class="text-neutral-500 text-sm">
                        Non è possibile selezionare 3 giocatori contigui senza includere te stesso
                    </p>
                </div>
                
                <div class="pt-2">
                    <button 
                        class="btn btn-ghost w-full py-3 text-lg font-semibold rounded-2xl border border-neutral-600/40 hover:bg-neutral-700/40 transition-all duration-300" 
                        @click="skipInvestigation"
                    >
                        Salta investigazione
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Killing Step (only if can kill) -->
        <div v-else-if="step === 'killing'" class="space-y-6">
            <div class="text-center space-y-3">
                <p class="text-neutral-400 text-base font-medium">
                    Tutti i lupi sono morti! Ora potete anche uccidere qualcuno
                </p>
                <p class="text-neutral-500 text-sm">
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
