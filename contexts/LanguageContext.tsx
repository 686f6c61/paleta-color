/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Language Context
 * December 2025
 *
 * Provides internationalization (i18n) support for the application.
 * Manages language state and translations for Spanish and English.
 *
 * Features:
 * - Language switching between Spanish (es) and English (en)
 * - Persistent language preference via localStorage
 * - Type-safe translation object
 * - Default language: Spanish
 *
 * Usage:
 * const { locale, setLocale, t } = useLanguage();
 *
 * @context LanguageContext
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

type Locale = 'es' | 'en';

type Translations = typeof es;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [translations, setTranslations] = useState<Translations>(es);

  useEffect(() => {
    // Load from localStorage
    const savedLocale = (typeof window !== 'undefined' ? localStorage.getItem('locale') : null) as Locale;
    if (savedLocale && (savedLocale === 'es' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
      setTranslations(savedLocale === 'es' ? es : en);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(newLocale === 'es' ? es : en);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
