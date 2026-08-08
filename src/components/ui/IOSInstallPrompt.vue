<template>
  <div>
    <!-- Floating Banner Button (Prompt) -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-10 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-10 opacity-0 scale-95"
    >
      <div
        v-if="showPrompt && !showModal"
        class="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-auto z-[90] pointer-events-auto"
      >
        <div 
          class="group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 shadow-2xl transition-all duration-200 hover:border-neutral-700 active:scale-[0.98] flex items-center gap-3 backdrop-blur-xl"
        >
          <!-- Clickable main area -->
          <button 
            @click="openGuideModal"
            class="flex items-center gap-3 text-left flex-1 group-hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div class="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center text-neutral-200 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ t('settings.installApp') }}</span>
              <span class="text-sm font-semibold text-white flex items-center gap-1.5">
                {{ t('settings.installAppButton') }}
                <svg class="w-3.5 h-3.5 text-neutral-400 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>

          <!-- Close button -->
          <button
            @click="dismissPrompt"
            class="p-1.5 text-neutral-400 hover:text-white bg-neutral-800/40 hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Installation Guide Modal / Bottom Sheet -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        @click="showModal = false"
      >
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-full sm:translate-y-4 opacity-0 scale-95"
          enter-to-class="translate-y-0 opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100 scale-100"
          leave-to-class="translate-y-full sm:translate-y-4 opacity-0 scale-95"
        >
          <div
            v-if="showModal"
            class="w-full mb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:mb-0 sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 overflow-hidden mx-4"
            @click.stop
          >
            <!-- Handle indicator for mobile -->
            <div class="w-12 h-1 bg-neutral-700 rounded-full mx-auto sm:hidden -mt-2 mb-2 opacity-60"></div>

            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center text-neutral-200">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-white">
                  {{ t('settings.installIosInstructionsTitle') }}
                </h3>
              </div>
              <button
                @click="showModal = false"
                class="p-2 text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Instructions steps -->
            <div class="space-y-3 pt-1">
              <!-- Step 1 -->
              <div class="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-4">
                <div class="w-9 h-9 rounded-lg bg-neutral-800/80 border border-neutral-700/40 text-neutral-300 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p class="text-xs font-medium text-neutral-300 leading-relaxed">
                  {{ t('settings.installIosStep1') }}
                </p>
              </div>

              <!-- Step 2 -->
              <div class="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-4">
                <div class="w-9 h-9 rounded-lg bg-neutral-800/80 border border-neutral-700/40 text-neutral-300 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-xs font-medium text-neutral-300 leading-relaxed">
                  {{ t('settings.installIosStep2') }}
                </p>
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="showModal = false"
              class="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-750 text-white font-medium text-sm rounded-xl border border-neutral-700/60 transition-all active:scale-[0.98]"
            >
              {{ t('common.confirm', 'Ho capito!') }}
            </button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const showPrompt = ref(false);
const showModal = ref(false);

const checkIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform || '';
  
  // Detect iPhone, iPod, iPad, or iPadOS in Desktop mode (MacIntel + multi-touch)
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1);
    
  const isStandalone = ('standalone' in window.navigator && !!(window.navigator as any).standalone) || 
    window.matchMedia('(display-mode: standalone)').matches;
    
  const isDismissed = localStorage.getItem('ios_install_dismissed') === 'true';
  const forceTest = window.location.search.includes('force_ios=true') || window.location.search.includes('ios=1');

  if ((isIOS || forceTest) && (!isStandalone || forceTest) && (!isDismissed || forceTest)) {
    setTimeout(() => {
      showPrompt.value = true;
    }, 500);
  }
};

const openGuideModal = () => {
  showModal.value = true;
};

const dismissPrompt = () => {
  showPrompt.value = false;
  localStorage.setItem('ios_install_dismissed', 'true');
};

onMounted(() => {
  checkIOS();
});
</script>
