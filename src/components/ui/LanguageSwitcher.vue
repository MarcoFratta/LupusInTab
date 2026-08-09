<template>
  <!-- Floating Flag Button -->
  <button
    @click="isOpen = true"
    class="fixed right-4 md:right-6 z-[60] w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-700/50 hover:border-neutral-600 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 backdrop-blur-md"
    style="top: calc(env(safe-area-inset-top, 0px) + 1rem);"
  >
    <span class="text-xl leading-none">{{ currentLocale.flag }}</span>
  </button>

  <!-- Backdrop -->
  <transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
      @click="isOpen = false"
    ></div>
  </transition>

  <!-- Bottom Sheet / Modal -->
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
    enter-to-class="translate-y-0 sm:scale-100 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 sm:scale-100 opacity-100"
    leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-x-4 bottom-20 sm:inset-0 sm:m-auto sm:max-w-sm sm:h-fit bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[75vh]"
    >
      <!-- Drag handle / close hint (mobile only) -->
      <div class="w-full flex justify-center pt-3 pb-2 sm:hidden" @click="isOpen = false">
        <div class="w-12 h-1.5 bg-neutral-700 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-white">Lingua / Language</h3>
        <button @click="isOpen = false" class="text-neutral-500 hover:text-white transition-colors p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Languages List -->
      <div class="p-4 overflow-y-auto overscroll-contain flex-1">
        <div class="grid gap-2 grid-cols-1">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="selectLanguage(locale.code)"
            class="flex items-center w-full px-4 py-3 rounded-xl border transition-all duration-200"
            :class="[
              locale.code === currentLocale.code 
                ? 'bg-violet-600/20 border-violet-500 text-violet-300' 
                : 'bg-neutral-800/40 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600'
            ]"
          >
            <span class="text-2xl mr-4">{{ locale.flag }}</span>
            <span class="font-medium text-base">{{ locale.name }}</span>
            
            <svg 
              v-if="locale.code === currentLocale.code"
              class="w-5 h-5 ml-auto text-violet-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { currentLocale, availableLocales, changeLanguage } = useI18n();
const isOpen = ref(false);

const selectLanguage = (localeCode: string) => {
  changeLanguage(localeCode);
  setTimeout(() => {
    isOpen.value = false;
  }, 150);
};
</script>
