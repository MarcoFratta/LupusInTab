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
  <div class="grid grid-cols-2 gap-3">
    <button 
      v-if="showSkip"
      class="btn btn-secondary py-2 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
      :class="{ 'btn-disabled': skipDisabled }"
      :disabled="skipDisabled"
      @click="emit('skip')"
    >
      {{ skipText }}
    </button>
    <button 
      class="btn btn-accent py-2 text-base font-semibold rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
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
