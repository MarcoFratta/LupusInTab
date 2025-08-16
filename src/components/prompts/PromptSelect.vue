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

const emit = defineEmits<{
	(e: 'update:modelValue', value: number | null): void;
	(e: 'confirm'): void;
}>();

const accentClasses = computed(() => {
	switch (props.accent) {
		case 'red':
			return 'focus:ring-red-400/30 focus:border-red-500/40';
		case 'emerald':
			return 'focus:ring-emerald-400/30 focus:border-emerald-500/40';
		case 'violet':
			return 'focus:ring-violet-400/30 focus:border-violet-500/40';
		default:
			return 'focus:ring-neutral-400/30 focus:border-neutral-500/40';
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
    <div class="stack">
        <div class="muted  mb-4">{{ label }}</div>
		<div class="relative">
			<select 
				:disabled="disabled"
				class="w-full appearance-none rounded-lg border border-neutral-800/60 bg-neutral-900/70 px-2 pr-9 py-2 text-neutral-100 text-sm hover:bg-neutral-900/80 focus:outline-none"
				:class="accentClasses"
				@change="onChange"
				:value="modelValue === null ? 'null' : String(modelValue)"
			>
				<option v-if="placeholder" disabled :value="'null'">{{ placeholder }}</option>
				<option v-for="opt in choices" :key="String(opt.value)" :value="opt.value === null ? 'null' : String(opt.value)">
					{{ opt.label }}
				</option>
			</select>
			<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</span>
		</div>
        <div v-if="buttonText" class="mt-3">
            <button class="btn btn-primary w-full" :class="{ 'btn-disabled': disabled }" :disabled="disabled" @click="confirm">{{ buttonText }}</button>
		</div>
	</div>
	
</template>


