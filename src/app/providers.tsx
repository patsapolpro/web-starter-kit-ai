'use client';

import { useEffect } from 'react';
import i18n from '@/lib/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved language from localStorage after hydration is complete
    // This prevents hydration mismatch by ensuring server and client render the same initial content
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  return <>{children}</>;
}
