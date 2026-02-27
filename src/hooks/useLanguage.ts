import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { T } from '../constants/tokens';
import { format } from 'date-fns';
import { ja as dateFnsJa } from 'date-fns/locale';
import { Article } from '../types/article';

type Language = 'en' | 'ja';

export interface UseLanguageReturn {
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: Language;
  toggleLanguage: () => void;
  getLocalizedField: <T>(enValue: T, jaValue: T) => T;
  getArticleField: <K extends keyof Article>(article: Article, field: K) => Article[K];
  formatDate: (date: Date | string, formatStr?: string) => string;
}

const STORAGE_KEY = 'ortrad_language';

export function useLanguage(): UseLanguageReturn {
  const { t, i18n } = useTranslation();

  const lang = i18n.language as Language;

  // Initialize language from localStorage or browser setting on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (savedLang && (savedLang === 'ja' || savedLang === 'en')) {
      if (i18n.language !== savedLang) {
        i18n.changeLanguage(savedLang);
      }
    } else {
      // Use browser language as default
      const browserLang = navigator.language.toLowerCase();
      const defaultLang: Language = browserLang.startsWith('ja') ? 'ja' : 'en';
      localStorage.setItem(STORAGE_KEY, defaultLang);
      if (i18n.language !== defaultLang) {
        i18n.changeLanguage(defaultLang);
      }
    }
  }, [i18n]);

  const toggleLanguage = useCallback(() => {
    const newLang: Language = lang === 'ja' ? 'en' : 'ja';
    i18n.changeLanguage(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, [lang, i18n]);

  const getLocalizedField = useCallback(<T,>(
    enValue: T,
    jaValue: T
  ): T => {
    return lang === 'en' ? enValue : jaValue;
  }, [lang]);

  // Smart article field localization
  const getArticleField = useCallback(<K extends keyof Article>(
    article: Article,
    field: K
  ): Article[K] => {
    if (lang === 'en') {
      // English: prefer English fields, fallback to Japanese
      if (field === 'title' && article.title) return article.title as Article[K];
      if (field === 'summary_ja' && article.summary_en) return article.summary_en as Article[K];
      return article[field];
    } else {
      // Japanese: prefer Japanese fields, fallback to English
      if (field === 'title' && article.title_ja) return article.title_ja as Article[K];
      if (field === 'summary_ja' && article.summary_ja) return article.summary_ja;
      if (field === 'summary_ja' && article.summary_en) return article.summary_en;
      return article[field];
    }
  }, [lang]);

  // Date formatting with locale support
  const formatDate = useCallback((date: Date | string, formatStr: string = 'yyyy/MM/dd'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = lang === 'ja' ? dateFnsJa : undefined;

    if (lang === 'ja') {
      return format(dateObj, 'yyyy年MM月dd日', { locale });
    } else {
      return format(dateObj, 'MMM d, yyyy', { locale });
    }
  }, [lang]);

  return {
    t,
    lang,
    toggleLanguage,
    getLocalizedField,
    getArticleField,
    formatDate,
  };
}
