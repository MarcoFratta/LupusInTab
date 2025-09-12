<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Props {
  duration?: number;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 700,
  disabled: false,
  variant: 'accent',
  size: 'md',
  fullWidth: false
});

const emit = defineEmits<{
  activate: [];
}>();

const isPressed = ref(false);
const pressStartTime = ref(0);
const pressProgress = ref(0);
const pressTimer = ref<number | null>(null);
const isActivated = ref(false);

const buttonClasses = computed(() => {
  const baseClasses = 'relative overflow-hidden rounded-lg ' +
      'font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    secondary: 'bg-neutral-600 hover:bg-neutral-700 text-white shadow-neutral-500/25',
    accent: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClasses = props.fullWidth ? 'w-full' : '';
  
  const pulseClass = isPressed.value && !isActivated.value ? 'animate-pulse' : '';
  
  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${widthClasses} ${pulseClass}`;
});

const progressBarStyle = computed(() => ({
  width: `${pressProgress.value}%`,
  transition: 'width 0.1s linear'
}));

function handlePointerDown(event: PointerEvent) {
  if (props.disabled || isActivated.value) return;
  
  event.preventDefault();
  isPressed.value = true;
  pressStartTime.value = Date.now();
  pressProgress.value = 0;
  
  pressTimer.value = window.setInterval(() => {
    const elapsed = Date.now() - pressStartTime.value;
    pressProgress.value = Math.min((elapsed / props.duration) * 100, 100);
    
    if (elapsed >= props.duration) {
      activate();
    }
  }, 16);
}

function handlePointerUp() {
  if (!isPressed.value) return;
  
  isPressed.value = false;
  pressProgress.value = 0;
  
  if (pressTimer.value) {
    clearInterval(pressTimer.value);
    pressTimer.value = null;
  }
}

function handlePointerLeave() {
  if (!isPressed.value) return;
  
  isPressed.value = false;
  pressProgress.value = 0;
  
  if (pressTimer.value) {
    clearInterval(pressTimer.value);
    pressTimer.value = null;
  }
}

function activate() {
  if (isActivated.value) return;
  
  isActivated.value = true;
  isPressed.value = false;
  pressProgress.value = 100;
  
  if (pressTimer.value) {
    clearInterval(pressTimer.value);
    pressTimer.value = null;
  }
  
  emit('activate');
}

onUnmounted(() => {
  if (pressTimer.value) {
    clearInterval(pressTimer.value);
  }
});
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="props.disabled || isActivated"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerLeave"
    @touchstart.prevent
    @touchend.prevent
  >
    <div class="relative z-10 flex items-center justify-center">
      <slot />
    </div>
    
    <div
      v-if="isPressed && !isActivated"
      class="absolute inset-0 bg-white/20 transition-all duration-100"
      :style="progressBarStyle"
    ></div>
    
    <div
      v-if="isPressed && !isActivated"
      class="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-100"
      :style="progressBarStyle"
    ></div>
    
    <div
      v-if="isActivated"
      class="absolute inset-0 bg-green-500/30 transition-all duration-300"
    ></div>
  </button>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
