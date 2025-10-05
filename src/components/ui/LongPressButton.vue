<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Props {
  duration?: number;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  feedbackPalette?: 'accent' | 'fuchsia' | 'neutral' | 'white';
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
  const baseClasses = 'relative overflow-hidden rounded-lg cursor-pointer select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ' +
      'font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg';
  
  const variantClasses = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25',
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
  const palette = props.feedbackPalette || (props.variant === 'secondary' ? 'neutral' : 'accent');
  const ringClass = isPressed.value && !isActivated.value
    ? (
        palette === 'neutral' ? 'ring-4 ring-neutral-500 ring-inset'
      : palette === 'white' ? 'ring-4 ring-neutral-400 ring-inset'
      : palette === 'fuchsia' ? 'ring-4 ring-fuchsia-500 ring-inset'
      : 'ring-4 ring-violet-500 ring-inset'
      )
    : '';
  
  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${widthClasses} ${pulseClass} ${ringClass}`;
});

const overlayClass = computed(() => {
  const palette = props.feedbackPalette || (props.variant === 'secondary' ? 'neutral' : 'accent');
  return (
    palette === 'neutral' ? 'bg-neutral-200/10'
    : palette === 'white' ? 'bg-white/10'
    : palette === 'fuchsia' ? 'bg-fuchsia-200/10'
    : 'bg-violet-200/10'
  );
});

const barClass = computed(() => {
  const palette = props.feedbackPalette || (props.variant === 'secondary' ? 'neutral' : 'accent');
  return (
    palette === 'neutral' ? 'bg-neutral-300/70'
    : palette === 'white' ? 'bg-white/60'
    : palette === 'fuchsia' ? 'bg-fuchsia-300/70'
    : 'bg-violet-300/70'
  );
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
      class="absolute inset-0 transition-all duration-100"
      :class="overlayClass"
      :style="progressBarStyle"
    ></div>
    
    <div
      v-if="isPressed && !isActivated"
      class="absolute bottom-0 left-0 h-1 transition-all duration-100"
      :class="barClass"
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
