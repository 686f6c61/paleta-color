/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * LanguageToggle Component
 * December 2025
 *
 * Button to toggle between Spanish and English languages.
 * Shows "EN" when in Spanish, "ES" when in English.
 *
 * @component LanguageToggle
 */

'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="px-3 py-2 rounded-lg border border-border dark:border-border hover:bg-accent dark:hover:bg-accent transition-colors font-medium text-sm"
      aria-label="Toggle language"
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
