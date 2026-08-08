import { createI18n } from 'vue-i18n';
import it from './it';
import en from './en';
import es from './es';
import de from './de';
import fr from './fr';

// Get saved language from localStorage or default to Italian
const savedLocale = localStorage.getItem('app-locale') || 'it';

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: savedLocale,
  fallbackLocale: 'it',
  messages: {
    it,
    en,
    es,
    de,
    fr
  }
});

export default i18n;
