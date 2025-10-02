import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '../app/i18n';

// Initialize i18n for tests with the same resources as the app
i18n.use(initReactI18next).init({
  resources,
  lng: 'es-AR', // default language
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});
