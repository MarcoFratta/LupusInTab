<script setup>
import { computed, ref, watch } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: false },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true },
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
		p.id !== props.player?.id && 
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
            <p class="text-neutral-400 text-base font-medium">
                Utilizzo {{ (gameState.custom?.parassita?.usageCount || 0) + 1 }}: Puoi infettare fino a {{ maxTargets }} giocatore{{ maxTargets > 1 ? 'i' : '' }}
            </p>
            <p class="text-neutral-400 text-sm">
                Seleziona i giocatori da infettare (giocatori già infetti non possono essere selezionati)
            </p>
        </div>
        
        <div v-if="choices.length > 0" class="space-y-4">
            <div class="grid gap-3">
                <div v-for="choice in choices" :key="choice.value" class="flex items-center space-x-3 p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/40 hover:bg-neutral-800/60 transition-all duration-200">
                    <input
                        type="checkbox"
                        :id="`player-${choice.value}`"
                        :value="choice.value"
                        :checked="targetIds.includes(choice.value)"
                        @change="(e) => { console.log('Checkbox changed:', choice.value, 'checked:', e.target.checked); updateSelection(choice.value); }"
                        :disabled="choice.value === null || (!targetIds.includes(choice.value) && targetIds.length >= maxTargets)"
                        class="w-5 h-5 text-pink-600 bg-neutral-900/70 border-neutral-700 rounded focus:ring-2 focus:ring-pink-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    />
                    <label :for="`player-${choice.value}`" class="text-base font-medium text-neutral-200 cursor-pointer flex-1">
                        {{ choice.label }}
                    </label>
                </div>
            </div>
        </div>

        <div v-if="choices.length === 0" class="text-center space-y-4">
            <p class="text-neutral-400 text-base">
                Non ci sono più giocatori da infettare. Tutti i giocatori vivi sono già infetti!
            </p>
        </div>

        <div class="space-y-4">
            <button
                v-if="choices.length > 0"
                @click="() => submit()"
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                :class="{ 'btn-disabled': targetIds.length === 0 }"
                :disabled="targetIds.length === 0"
            >
                Conferma infezione ({{ targetIds.length }}/{{ maxTargets }})
            </button>
            
            <button
                v-if="choices.length > 0"
                @click="() => submit(true)"
                class="btn btn-outline w-full py-3 text-lg font-semibold rounded-2xl border-neutral-600 text-neutral-300 hover:bg-neutral-700/50 hover:border-neutral-500 transition-all duration-300"
            >
                Salta
            </button>
            
            <button
                v-else
                @click="() => submit()"
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
                Continua
            </button>
        </div>
    </div>
</template>
