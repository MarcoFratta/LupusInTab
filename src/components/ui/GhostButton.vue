<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },
  size: { type: String, default: 'default' }, // 'xs', 'sm', 'default'
  class: { type: String, default: '' }
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
    class="btn btn-ghost"
    :class="[
      { 'w-full': fullWidth },
      { 'btn-disabled': disabled },
      sizeClasses[size],
      props.class
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
