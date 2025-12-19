import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import thTranslations from './locales/th.json';

// Always initialize with 'en' to prevent hydration mismatch
// The actual language will be loaded from localStorage after mount
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      th: {
        translation: thTranslations,
      },
    },
    lng: 'en', // Always start with 'en' for consistent SSR/client rendering
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
