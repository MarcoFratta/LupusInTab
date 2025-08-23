<script setup lang="ts">
const props = defineProps<{
	label: string;
	yesText?: string;
	noText?: string;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(e: 'yes'): void;
	(e: 'no'): void;
}>();

function onYes() { emit('yes'); }
function onNo() { emit('no'); }
</script>

<template>
	<div class="stack">
		<div class="muted">{{ label }}</div>
		<div class="mt-2 flex items-center justify-end gap-2">
			<button class="btn btn-secondary" :class="{ 'btn-disabled': disabled }" :disabled="disabled" @click="onNo">{{ noText || 'No' }}</button>
			<button class="btn btn-primary" :class="{ 'btn-disabled': disabled }" :disabled="disabled" @click="onYes">{{ yesText || 'Sì' }}</button>
		</div>
	</div>
</template>


