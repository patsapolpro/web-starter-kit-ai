'use client';

import React, { useState } from 'react';
import { useLanguage, type Language } from '@/hooks/useLanguage';

export function LanguageToggle() {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  ];

  const currentLang = languages.find((l) => l.code === currentLanguage) || languages[0];

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 lg:px-4 py-2 bg-white/80 border border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-soft transition-smooth flex items-center gap-2 text-sm font-medium"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <i className={`fa-solid fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-soft-lg border border-gray-200 py-2 z-50 animate-fade-in-up">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-primary-50 transition-colors ${
                  currentLanguage === lang.code ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.label}</span>
                {currentLanguage === lang.code && <i className="fa-solid fa-check ml-auto text-primary-600 text-xs"></i>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
