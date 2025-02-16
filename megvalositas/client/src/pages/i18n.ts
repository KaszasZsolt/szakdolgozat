import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import huTranslation from '../assets/locales/hu.json';

i18n
  .use(LanguageDetector) // automatikus nyelvfelismerés és -tárolás
  .use(initReactI18next)
  .init({
    resources: {
      hu: { translation: huTranslation }
    },
    fallbackLng: 'hu',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Ebben a beállításban megadhatod, hogy milyen sorrendben és hol keresse a nyelvet
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
