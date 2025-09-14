<script setup>
import { computed, ref } from 'vue';
import { useGameStore } from '../../../stores/game';
import PromptSelect from './PromptSelect.vue';
import { useI18n } from '../../../composables/useI18n';

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, required: true },
    label: { type: String, required: true },
    buttonText: { type: String, default: 'rolePrompts.confirmSelection' },
    accent: { type: String, default: 'blue' },
    onComplete: { type: Function, required: true },
    disabled: { type: Boolean, default: false },
    choices: { type: Array, required: true }
});

const { t } = useI18n();
const targetId = ref(null);

// Check if buttonText is a translation key or already translated
const translatedButtonText = computed(() => {
    // If it starts with common translation key prefixes, translate it
    if (props.buttonText.startsWith('rolePrompts.') || 
        props.buttonText.startsWith('common.') || 
        props.buttonText.startsWith('setup.') || 
        props.buttonText.startsWith('game.') ||
        props.buttonText.startsWith('phases.') ||
        props.buttonText.startsWith('resolveDetails.')) {
        return t(props.buttonText);
    }
    // Otherwise, it's already translated
    return props.buttonText;
});

const choices = computed(() => [
    { label: t('rolePrompts.selectPlayer'), value: null },
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
            :buttonText="translatedButtonText"
            :accent="accent"
            :disabled="choices.length === 0 || disabled"
            @confirm="submit"
        />
    </div>
</template>
