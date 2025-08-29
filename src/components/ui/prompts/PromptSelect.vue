<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	label: string;
	modelValue: number | null;
	choices: Array<{ label: string; value: number | null }>;
	placeholder?: string;
	buttonText?: string;
	accent?: 'red' | 'emerald' | 'violet' | 'neutral';
	disabled?: boolean;
}>();

const canSubmit = computed(() => {
	if (props.disabled) return false;
	if (props.modelValue === null) return false;
	return Number.isFinite(Number(props.modelValue)) && Number(props.modelValue) > 0;
});

const emit = defineEmits<{
	(e: 'update:modelValue', value: number | null): void;
	(e: 'confirm'): void;
}>();

const accentClasses = computed(() => {
	switch (props.accent) {
		case 'red':
			return 'focus:ring-red-400/30 focus:border-red-500/40 border-red-500/40';
		case 'emerald':
			return 'focus:ring-emerald-400/30 focus:border-emerald-500/40 border-emerald-500/40';
		case 'violet':
			return 'focus:ring-violet-400/30 focus:border-violet-500/40 border-violet-500/40';
		default:
			return 'focus:ring-neutral-400/30 focus:border-neutral-500/40 border-neutral-500/40';
	}
});

function onChange(event: Event) {
	const target = event.target as HTMLSelectElement;
	const raw = target.value;
	const value = raw === 'null' ? null : Number(raw);
	emit('update:modelValue', Number.isFinite(value as any) ? (value as number) : null);
}

function confirm() {
	emit('confirm');
}
</script>

<template>
    <div class="space-y-6">
        <div v-if="label" class="text-center">
            <h3 class="text-lg sm:text-xl font-semibold text-neutral-100 mb-2">{{ label }}</h3>
            <div class="w-12 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
        </div>
        
        <div class="relative">
            <select 
                :disabled="disabled"
                class="w-full appearance-none rounded-xl border-2 bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-neutral-100 text-base font-medium hover:bg-neutral-900/90 focus:outline-none focus:ring-4 transition-all duration-200 shadow-lg"
                :class="accentClasses"
                @change="onChange"
                :value="modelValue === null ? 'null' : String(modelValue)"
            >
                <option v-if="placeholder" disabled :value="'null'">{{ placeholder }}</option>
                <option v-for="opt in choices" :key="String(opt.value)" :value="opt.value === null ? 'null' : String(opt.value)">
                    {{ opt.label }}
                </option>
            </select>
            <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
        </div>
        
        <slot />
        
        <div v-if="buttonText" class="pt-2">
            <button 
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300" 
                :class="{ 'btn-disabled': !canSubmit }" 
                :disabled="!canSubmit" 
                @click="confirm"
            >
                {{ buttonText }}
            </button>
        </div>
    </div>
</template>


