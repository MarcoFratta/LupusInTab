<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: false },
	playerIds: { type: Array, required: true },
	onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const selectable = computed(() => {
	return props.gameState.players.filter(p => p.alive && !props.playerIds.includes(p.id));
});
const choices = computed(() => [
	{ label: 'Seleziona un giocatore…', value: null },
	...selectable.value.map((p) => ({ label: p.name, value: p.id }))
]);

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
    <div class="space-y-4">
        <div class="text-center">
            <p class="text-neutral-400 text-sm">Scegliete una vittima da eliminare questa notte</p>
        </div>
        
        <PromptSelect
            label="Chi vuoi eliminare?"
            v-model="targetId"
            :choices="choices"
            buttonText="Conferma selezione"
            accent="red"
            :disabled="choices.length === 0"
            @confirm="submit"
        />
    </div>
</template>


