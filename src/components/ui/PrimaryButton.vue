<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  size: { type: String, default: 'default' }, // 'xs', 'sm', 'default'
});

const emit = defineEmits(['click']);

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  default: ''
};
</script>

<template>
  <button 
    class="btn btn-primary"
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
