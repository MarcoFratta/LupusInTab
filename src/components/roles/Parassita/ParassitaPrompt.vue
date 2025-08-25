<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: false },
	onComplete: { type: Function, required: true },
});

const targetIds = ref([]);

const maxTargets = computed(() => {
	const usageCount = props.gameState.custom?.parassita?.usageCount || 0;
	if (usageCount === 0) return 3;
	if (usageCount === 1) return 2;
	return 1;
});

const selectable = computed(() => {
	const infetti = props.gameState.custom?.parassita?.infetti || [];
	return props.gameState.players.filter(p => 
		p.alive && 
		p.id !== props.player?.id && 
		p.roleId !== 'parassita' && 
		!infetti.includes(p.id)
	);
});

const choices = computed(() => 
	selectable.value.map((p) => ({ label: p.name, value: p.id }))
);

function submit() {
	if (targetIds.value.length === 0) {
		props.onComplete({ targetIds: [] });
		return;
	}
	
	props.onComplete({ targetIds: targetIds.value });
}

function updateSelection(value) {
	if (value === null) {
		targetIds.value = [];
		return;
	}
	
	const index = targetIds.value.indexOf(value);
	if (index > -1) {
		targetIds.value.splice(index, 1);
	} else {
		if (targetIds.value.length < maxTargets.value) {
			targetIds.value.push(value);
		}
	}
}
</script>

<template>
    <div class="space-y-4">
        <div class="text-center">
            <p class="text-neutral-400 text-sm">
                Utilizzo {{ (gameState.custom?.parassita?.usageCount || 0) + 1 }}: Puoi infettare fino a {{ maxTargets }} giocatore{{ maxTargets > 1 ? 'i' : '' }}
            </p>
            <p class="text-neutral-400 text-sm mt-2">
                Seleziona i giocatori da infettare (giocatori già infetti non possono essere selezionati)
            </p>
        </div>
        
        <div v-if="choices.length > 0" class="space-y-3">
            <div v-for="choice in choices" :key="choice.value" class="flex items-center space-x-3">
                <input
                    type="checkbox"
                    :id="`player-${choice.value}`"
                    :value="choice.value"
                    :checked="targetIds.includes(choice.value)"
                    @change="updateSelection(choice.value)"
                    :disabled="choice.value === null || (!targetIds.includes(choice.value) && targetIds.length >= maxTargets)"
                    class="w-4 h-4 text-pink-600 bg-neutral-900/70 border-neutral-700 rounded"
                />
                <label :for="`player-${choice.value}`" class="text-sm font-medium text-neutral-200">
                    {{ choice.label }}
                </label>
            </div>
        </div>

        <div v-if="choices.length === 0" class="text-center py-4">
            <p class="text-neutral-400 text-sm mb-4">
                Non ci sono più giocatori da infettare. Tutti i giocatori vivi sono già infetti!
            </p>
        </div>

        <div class="text-center">
            <button
                v-if="choices.length > 0"
                @click="submit"
                class="btn btn-primary w-full"
                :class="{ 'btn-disabled': targetIds.length === 0 }"
                :disabled="targetIds.length === 0"
            >
                Conferma infezione ({{ targetIds.length }}/{{ maxTargets }})
            </button>
            
            <button
                v-else
                @click="submit"
                class="btn btn-secondary w-full"
            >
                Continua
            </button>
        </div>
    </div>
</template>
