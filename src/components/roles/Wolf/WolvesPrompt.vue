<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps({
	gameState: { type: Object, required: true },
	player: { type: Object, required: false },
	onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const selectable = computed(() => {
	return props.gameState.players.filter(p => p.alive && p.roleId !== 'wolf');
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
            <h3 class="text-lg font-semibold text-neutral-100">Lupi</h3>
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


