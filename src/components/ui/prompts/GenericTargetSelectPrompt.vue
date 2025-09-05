<script setup>
import { computed, ref } from 'vue';
import { useGameStore } from '../../../stores/game';
import PromptSelect from './PromptSelect.vue';

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, required: true },
    label: { type: String, required: true },
    buttonText: { type: String, default: 'Conferma selezione' },
    accent: { type: String, default: 'blue' },
    onComplete: { type: Function, required: true },
    disabled: { type: Boolean, default: false },
    choices: { type: Array, required: true }
});

const targetId = ref(null);

const choices = computed(() => [
    { label: 'Seleziona un giocatore…', value: null },
    ...props.choices
]);

function submit() {
    props.onComplete({ 
        targetId: targetId.value,
        data: { targetId: targetId.value }
    });
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            <p class="text-neutral-400 text-base font-medium">{{ description }}</p>
        </div>
        
        <PromptSelect
            :label="label"
            v-model="targetId"
            :choices="choices"
            :buttonText="buttonText"
            :accent="accent"
            :disabled="choices.length === 0 || disabled"
            @confirm="submit"
        />
    </div>
</template>
