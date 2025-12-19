'use client';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export type Language = 'en' | 'th';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    // Save language preference to localStorage whenever it changes
    const handleLanguageChange = (lng: string) => {
      localStorage.setItem('app-language', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language as Language;

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
}
