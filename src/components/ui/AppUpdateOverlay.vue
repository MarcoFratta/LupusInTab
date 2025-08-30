<template>
  <div v-if="isUpdating" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full text-center">
      <!-- Update Icon -->
      <div class="mb-4">
        <div class="w-16 h-16 mx-auto bg-violet-500/20 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-semibold text-neutral-100 mb-2">
        Aggiornamento App
      </h2>

      <!-- Version Info -->
      <div class="space-y-2 mb-6">
        <div class="flex items-center justify-center gap-2 text-sm text-neutral-400">
          <span>Versione attuale:</span>
          <span class="text-neutral-300 font-medium">{{ currentVersion }}</span>
        </div>
        <div class="flex items-center justify-center gap-2 text-sm text-neutral-400">
          <span>Nuova versione:</span>
          <span class="text-violet-400 font-medium">{{ newVersion }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="w-full bg-neutral-800 rounded-full h-2">
          <div 
            class="bg-violet-500 h-2 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Status Text -->
      <p class="text-sm text-neutral-400 mb-4">
        {{ statusText }}
      </p>

      <!-- Loading Spinner -->
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  isUpdating: boolean;
  currentVersion?: string;
  newVersion?: string;
  progress?: number;
  status?: string;
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  status: 'Preparazione aggiornamento...'
});

const progress = ref(0);
const statusText = ref(props.status);

// Simulate progress animation
onMounted(() => {
  if (props.isUpdating) {
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 15;
        progress.value = Math.min(currentProgress, 90);
      }
    }, 200);

    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }
});

// Update status text based on progress
const updateStatus = (newStatus: string) => {
  statusText.value = newStatus;
};

// Expose method to update status from parent
defineExpose({
  updateStatus,
  setProgress: (value: number) => {
    progress.value = value;
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
