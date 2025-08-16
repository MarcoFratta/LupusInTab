<script setup>
const props = defineProps({
  confirmText: { type: String, default: 'Conferma' },
  skipText: { type: String, default: 'Salta' },
  confirmDisabled: { type: Boolean, default: false },
  skipDisabled: { type: Boolean, default: false },
  showSkip: { type: Boolean, default: true },
});

const emit = defineEmits(['confirm', 'skip']);
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <button 
      v-if="showSkip"
      class="btn btn-secondary w-full"
      :class="{ 'btn-disabled': skipDisabled }"
      :disabled="skipDisabled"
      @click="emit('skip')"
    >
      {{ skipText }}
    </button>
    <button 
      class="btn btn-primary w-full"
      :class="[
        { 'btn-disabled': confirmDisabled },
        { 'col-span-2': !showSkip }
      ]"
      :disabled="confirmDisabled"
      @click="emit('confirm')"
    >
      {{ confirmText }}
    </button>
  </div>
</template>
