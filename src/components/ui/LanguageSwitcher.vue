<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <span class="text-lg">{{ currentLocale.flag }}</span>
      <span class="text-sm font-medium">{{ currentLocale.name }}</span>
      <svg 
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <div 
      v-if="isOpen"
      class="absolute top-full left-0 mt-2 w-full min-w-[140px] bg-neutral-900 border border-white/10 rounded-lg shadow-lg z-50"
    >
      <button
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="selectLanguage(locale.code)"
        class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
        :class="{ 'bg-violet-500/20 text-violet-300': locale.code === currentLocale.code }"
      >
        <span class="text-lg">{{ locale.flag }}</span>
        <span class="text-sm font-medium">{{ locale.name }}</span>
        <svg 
          v-if="locale.code === currentLocale.code"
          class="w-4 h-4 ml-auto text-violet-400"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { currentLocale, availableLocales, changeLanguage } = useI18n();

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (localeCode: string) => {
  changeLanguage(localeCode);
  isOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
