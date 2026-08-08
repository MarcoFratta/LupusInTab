<script setup lang="ts">
import { useGameStore } from '../../stores/game';
import { watch, computed, ref, onMounted } from 'vue';
import { SetupTitle } from '../ui';
import { saveSettings } from '../../utils/storage';
import { useI18n } from '../../composables/useI18n';

const store = useGameStore();
const state = store.state as any;
const appVersion = ref('');
const { t, currentLocale, availableLocales, changeLanguage } = useI18n();

const activeSettingsCount = computed(() => Object.values(state.settings).filter(Boolean).length);



const loadAppVersion = async () => {
  try {
    const response = await fetch('/version.json');
    const data = await response.json();
    appVersion.value = data.version;
  } catch (error) {
    console.warn('Failed to load app version:', error);
    appVersion.value = '';
  }
};

onMounted(() => {
  loadAppVersion();
});


watch(() => state.settings, () => {
  saveSettings({
    skipFirstNightActions: !!state.settings.skipFirstNightActions,
    enableSindaco: !!state.settings.enableSindaco,
    discussionTimerEnabled: !!state.settings.discussionTimerEnabled,
    difficolta: !!state.settings.difficolta,
  });
}, { deep: true });

const openBuyMeACoffee = () => {
  window.open('https://ko-fi.com/marcofratta', '_blank');
};

const openGitHubStar = () => {
  window.open('https://github.com/MarcoFratta/LupusInTab', '_blank');
};

const openGitHubIssue = () => {
  window.open('https://github.com/MarcoFratta/LupusInTab/issues/new', '_blank');
};

const gameSettings = computed(() => [
  {
    key: 'skipFirstNightActions',
    title: t('settings.skipFirstNight'),
    description: t('settings.skipFirstNightDescription'),
    disabled: false
  },
  {
    key: 'enableSindaco',
    title: t('settings.enableMayor'),
    description: t('settings.enableMayorDescription'),
    disabled: true
  },
  {
    key: 'discussionTimerEnabled',
    title: t('settings.discussionTimer'),
    description: t('settings.discussionTimerDescription'),
    disabled: false
  },
  {
    key: 'difficolta',
    title: t('settings.maxDifficulty'),
    description: t('settings.maxDifficultyDescription'),
    disabled: false
  }
]);

const toggleSetting = (key: string) => {
  state.settings[key] = !state.settings[key];
};
</script>

<template>
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
         <SetupTitle 
           :title="t('settings.title')"
         />

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-200">{{ t('settings.gameOptions') }}</h3>
      
      <div class="space-y-3">
        <div v-for="setting in gameSettings" 
             :key="setting.key"
             class="group relative p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200"
             :class="{ 'opacity-80': setting.disabled }">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-neutral-200">{{ setting.title }}</span>
              </div>
              <div class="text-xs text-neutral-500 leading-relaxed text-left">
                {{ setting.description }}
              </div>
            </div>
            
            <div class="flex-shrink-0">
              <div class="relative w-12 h-6 bg-neutral-700 rounded-full cursor-pointer transition-all duration-200 hover:scale-105" 
                   :class="{ 'bg-violet-500': state.settings[setting.key] }"
                   @click="toggleSetting(setting.key)">
                <div class="absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
                     :class="{ 
                       'translate-x-6 bg-white': state.settings[setting.key], 
                       'translate-x-0.5 bg-neutral-300': !state.settings[setting.key] 
                     }">
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="state.settings[setting.key]" 
               class="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-b-lg">
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-200">{{ t('settings.supportProject') }}</h3>
      
      <div class="space-y-3">
        <div class="p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="space-y-3">
            <div class="space-y-1">
              <span class="text-sm font-medium text-neutral-200">{{ t('settings.buyCoffee') }}</span>
              <p class="text-xs text-neutral-500 leading-relaxed text-left">
                {{ t('settings.buyCoffeeDescription') }}
              </p>
            </div>
            <button 
              @click="openBuyMeACoffee"
              class="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-violet-600 hover:border-violet-700 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 2v2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 2v2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 2v2" />
              </svg>
              {{ t('settings.offerCoffee') }}
            </button>
          </div>
        </div>

        <div class="p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="space-y-3">
            <div class="space-y-1">
              <span class="text-sm font-medium text-neutral-200">{{ t('settings.contributeGitHub') }}</span>
              <p class="text-xs text-neutral-500 leading-relaxed text-left">
                {{ t('settings.contributeGitHubDescription') }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <button 
                @click="openGitHubStar"
                class="flex-1 py-2.5 px-4 bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 hover:text-neutral-300 text-sm font-medium rounded-lg transition-all duration-200 border border-neutral-500/30 hover:border-neutral-500/50">
                {{ t('settings.starProject') }}
              </button>
              <button 
                @click="openGitHubIssue"
                class="flex-1 py-2.5 px-4 bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 hover:text-neutral-300 text-sm font-medium rounded-lg transition-all duration-200 border border-neutral-500/30 hover:border-neutral-500/50">
                {{ t('settings.reportIssue') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>




    <div v-if="appVersion" class="text-xs text-neutral-500 text-center mt-6">
      {{ t('settings.version') }} {{ appVersion }}
    </div>
  </div>
</template>

