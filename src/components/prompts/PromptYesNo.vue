<script setup lang="ts">
const props = defineProps<{
\tlabel: string;
\tyesText?: string;
\tnoText?: string;
\tdisabled?: boolean;
}>();

const emit = defineEmits<{
\t(e: 'yes'): void;
\t(e: 'no'): void;
}>();

function onYes() { emit('yes'); }
function onNo() { emit('no'); }
</script>

<template>
\t<div class="stack">
\t\t<div class="muted">{{ label }}</div>
\t\t<div class="mt-2 flex items-center justify-end gap-2">
\t\t\t<button class="btn btn-secondary" :class="{ 'btn-disabled': disabled }" :disabled="disabled" @click="onNo">{{ noText || 'No' }}</button>
\t\t\t<button class="btn btn-primary" :class="{ 'btn-disabled': disabled }" :disabled="disabled" @click="onYes">{{ yesText || 'Yes' }}</button>
\t\t</div>
\t</div>
</template>


