<script setup>
import { ref } from 'vue';
import SecondaryButton from '../SecondaryButton.vue';
import PrimaryButton from '../PrimaryButton.vue';

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, required: true },
    yesText: { type: String, default: 'Sì' },
    noText: { type: String, default: 'No' },
    onComplete: { type: Function, required: true },
    disabled: { type: Boolean, default: false }
});

const selected = ref(null);

function submit() {
    if (selected.value !== null) {
        props.onComplete({ 
            result: selected.value,
            data: { choice: selected.value }
        });
    }
}

function selectYes() {
    selected.value = true;
}

function selectNo() {
    selected.value = false;
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            <p class="text-neutral-400 text-base font-medium">{{ description }}</p>
        </div>
        
        <div class="flex gap-4 justify-center">
            <SecondaryButton
                :class="{ 'ring-2 ring-blue-500': selected === false }"
                @click="selectNo"
                :disabled="disabled"
            >
                {{ noText }}
            </SecondaryButton>
            
            <PrimaryButton
                :class="{ 'ring-2 ring-blue-500': selected === true }"
                @click="selectYes"
                :disabled="disabled"
            >
                {{ yesText }}
            </PrimaryButton>
        </div>
        
        <div class="flex justify-center">
            <PrimaryButton
                @click="submit"
                :disabled="selected === null || disabled"
                class="px-8"
            >
                Conferma
            </PrimaryButton>
        </div>
    </div>
</template>
