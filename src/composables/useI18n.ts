import { useI18n as useVueI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

export function useI18n() {
  const { t, locale } = useVueI18n();
  
  // Available locales
  const availableLocales = ref([
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]);
  
  // Current locale info
  const currentLocale = computed(() => {
    return availableLocales.value.find(l => l.code === locale.value) || availableLocales.value[0];
  });
  
  // Change language function
  const changeLanguage = (newLocale: string) => {
    locale.value = newLocale;
    localStorage.setItem('app-locale', newLocale);
  };
  
  // Translation function with fallback
  const translate = (key: string, params?: Record<string, any>) => {
    return t(key, params || {});
  };
  
  return {
    t: translate,
    locale,
    currentLocale,
    availableLocales,
    changeLanguage
  };
}
