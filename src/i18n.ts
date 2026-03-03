import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ja from './locales/ja.json';
import en from './locales/en.json';

const resources = {
  ja: { translation: ja },
  en: { translation: en },
};

// 🟢 コンソールメッセージを抑制
const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('i18next')) return;
  originalConsoleLog(...args);
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    saveMissing: false,
  })
  .then(() => {
    // 🟢 初期化完了後にconsole.logを元に戻す
    console.log = originalConsoleLog;
  });

export default i18n;