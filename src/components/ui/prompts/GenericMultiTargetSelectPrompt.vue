<script setup>
import { computed, ref } from 'vue';
import { useGameStore } from '../../../stores/game';
import SecondaryButton from '../SecondaryButton.vue';
import PrimaryButton from '../PrimaryButton.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, required: true },
    label: { type: String, required: true },
    buttonText: { type: String, default: 'rolePrompts.confirmSelection' },
    accent: { type: String, default: 'blue' },
    onComplete: { type: Function, required: true },
    disabled: { type: Boolean, default: false },
    choices: { type: Array, required: true },
    minTargets: { type: Number, default: 0 },
    maxTargets: { type: Number, default: Infinity }
});

const selectedTargets = ref(new Set());

const canSubmit = computed(() => {
    const count = selectedTargets.value.size;
    return count >= props.minTargets && count <= props.maxTargets;
});

const selectedPlayers = computed(() => {
    return props.choices.filter(choice => selectedTargets.value.has(choice.value));
});

function toggleTarget(playerId) {
    if (selectedTargets.value.has(playerId)) {
        selectedTargets.value.delete(playerId);
    } else if (selectedTargets.value.size < props.maxTargets) {
        selectedTargets.value.add(playerId);
    }
}

function clearSelection() {
    selectedTargets.value.clear();
}

function submit() {
    if (canSubmit.value) {
        props.onComplete({ 
            targetIds: Array.from(selectedTargets.value),
            data: { targetIds: Array.from(selectedTargets.value) }
        });
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            <p class="text-neutral-400 text-base font-medium">{{ description }}</p>
            <p v-if="minTargets > 0 || maxTargets < Infinity" class="text-sm text-neutral-500">
                {{ t('rolePrompts.selectBetweenPlayers', { min: minTargets, max: maxTargets === Infinity ? '∞' : maxTargets }) }}
            </p>
        </div>
        
        <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
                <button
                    v-for="choice in choices"
                    :key="choice.value"
                    @click="toggleTarget(choice.value)"
                    :disabled="!selectedTargets.has(choice.value) && selectedTargets.size >= maxTargets"
                    :class="[
                        'p-3 rounded-lg border text-left transition-colors',
                        selectedTargets.has(choice.value)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-100'
                            : 'border-neutral-600 bg-neutral-800/40 text-neutral-300 hover:border-neutral-500',
                        (!selectedTargets.has(choice.value) && selectedTargets.size >= maxTargets)
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                    ]"
                >
                    <div class="font-medium">{{ choice.label }}</div>
                    <div v-if="choice.roleId" class="text-sm opacity-75">{{ choice.roleId }}</div>
                </button>
            </div>
        </div>
        
        <div v-if="selectedPlayers.length > 0" class="space-y-3">
            <div class="text-center">
                <p class="text-sm text-neutral-400">{{ t('rolePrompts.selectedPlayers', { count: selectedPlayers.length }) }}</p>
                <p class="text-white font-medium">
                    {{ selectedPlayers.map(p => p.label).join(', ') }}
                </p>
            </div>
            
            <div class="flex gap-2 justify-center">
                <SecondaryButton @click="clearSelection" :disabled="disabled">
                    {{ t('rolePrompts.clear') }}
                </SecondaryButton>
                
                <PrimaryButton
                    @click="submit"
                    :disabled="!canSubmit || disabled"
                    :class="accent"
                >
                    {{ t(buttonText) }}
                </PrimaryButton>
            </div>
        </div>
        
        <div v-else class="text-center">
            <p class="text-neutral-500 text-sm">{{ t('rolePrompts.selectAtLeastPlayers', { count: minTargets }) }}</p>
        </div>
    </div>
</template>
