<script setup>
import { computed, ref, watch } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true }
});

const targetIds = ref([]);

console.log('ParassitaPrompt initialized, targetIds:', targetIds.value);

watch(targetIds, (newVal, oldVal) => {
	console.log('targetIds changed from', oldVal, 'to', newVal);
}, { deep: true });

const maxTargets = computed(() => {
	const usageCount = props.gameState.custom?.parassita?.usageCount || 0;
	if (usageCount === 0) return 3;
	if (usageCount === 1) return 2;
	return 1;
});

const selectable = computed(() => {
	const infetti = props.gameState.custom?.parassita?.infetti || [];
	const result = props.gameState.players.filter(p => 
		p.alive && 
		!props.playerIds.includes(p.id) && 
		!infetti.includes(p.id)
	);
	console.log('Selectable players:', result.map(p => ({ id: p.id, name: p.name })));
	console.log('Infetti:', infetti);
	console.log('Player IDs to exclude:', props.playerIds);
	return result;
});

const choices = computed(() => {
	const result = selectable.value.map((p) => ({ label: p.name, value: p.id }));
	console.log('Choices computed:', result);
	return result;
});

function submit(skip = false ) {
	console.log('Submit called with skip:', skip, 'targetIds:', targetIds.value);
	if (skip || targetIds.value.length === 0) {
		console.log('Submitting empty targetIds (skip or no selection)');
		props.onComplete({ targetIds: [] });
		return;
	}
	
	console.log('Submitting targetIds:', targetIds.value);
	props.onComplete({ targetIds: targetIds.value });
}

function updateSelection(value) {
	if (value === null) {
		targetIds.value = [];
		return;
	}
	
	const index = targetIds.value.indexOf(value);
	if (index > -1) {
		targetIds.value = targetIds.value.filter(id => id !== value);
		console.log('Removed player', value, 'targetIds now:', targetIds.value);
	} else {
		if (targetIds.value.length < maxTargets.value) {
			targetIds.value = [...targetIds.value, value];
			console.log('Added player', value, 'targetIds now:', targetIds.value);
		}
	}
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 Scegli i giocatori da infettare</p>
            </div>
            <h3 class="text-lg font-semibold text-white">Parassita</h3>
            <p class="text-neutral-400 text-base font-medium">
                Utilizzo {{ (gameState.custom?.parassita?.usageCount || 0) + 1 }}: Infetta fino a {{ maxTargets }} giocatore{{ maxTargets > 1 ? 'i' : '' }}
            </p>
            <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
        </div>
        
        <div v-if="choices.length > 0" class="space-y-3">
            <div class="grid gap-2">
                <div v-for="choice in choices" :key="choice.value" 
                     class="flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer"
                     :class="targetIds.includes(choice.value) 
                       ? 'bg-violet-500/20 border-2 border-violet-500 shadow-lg shadow-violet-500/20 hover:bg-violet-500/25 hover:border-violet-500 hover:shadow-violet-500/30' 
                       : 'bg-neutral-800/80 border border-neutral-700/60 hover:bg-neutral-800 hover:border-violet-500/30'"
                     @click="updateSelection(choice.value)">
                    <span class="text-sm font-medium text-neutral-200">
                        {{ choice.label }}
                    </span>
                    <div v-if="targetIds.includes(choice.value)" class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-violet-500"></div>
                        <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="choices.length === 0" class="text-center space-y-3">
            <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4">
                <p class="text-neutral-400 text-sm">
                    Tutti i giocatori vivi sono già infetti!
                </p>
            </div>
        </div>

        <div class="space-y-3">
            <button
                v-if="choices.length > 0"
                @click="() => submit()"
                class="btn btn-accent w-full py-3 text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                :class="{ 'btn-disabled': targetIds.length === 0 }"
                :disabled="targetIds.length === 0"
            >
                Conferma infezione ({{ targetIds.length }}/{{ maxTargets }})
            </button>
            
            <button
                v-if="choices.length > 0"
                @click="() => submit(true)"
                class="btn btn-ghost w-full py-2 text-sm font-medium rounded-xl border-neutral-700/50 text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300 transition-all duration-300"
            >
                Salta
            </button>
            
            <button
                v-else
                @click="() => submit()"
                class="btn btn-accent w-full py-3 text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
                Continua
            </button>
        </div>
    </div>
</template>
