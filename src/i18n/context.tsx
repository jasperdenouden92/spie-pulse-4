'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import en, { type TranslationKey } from './translations/en';
import nl from './translations/nl';

export type Locale = 'en' | 'nl';

const translations: Record<Locale, Record<TranslationKey, string>> = { en, nl };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'nl',
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('nl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && stored in translations) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.setAttribute('lang', newLocale);
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let value = translations[locale]?.[key] ?? translations.nl[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  }, [locale]);

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('lang', locale);
    }
  }, [locale, mounted]);

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
