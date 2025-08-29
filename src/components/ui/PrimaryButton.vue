<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  size: { type: String, default: 'default' }, // 'xs', 'sm', 'default'
});

const emit = defineEmits(['click']);

const sizeClasses = {
  xs: 'text-xs py-2',
  sm: 'text-sm py-2',
  default: 'text-base py-3'
};
</script>

<template>
  <button 
    class="btn btn-accent font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
    :class="[
      { 'w-full': fullWidth },
      { 'btn-disabled': disabled },
      sizeClasses[size]
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
