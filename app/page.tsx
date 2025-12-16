/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Home Page
 * December 2025
 *
 * Main page component that loads the PaletaApp dynamically.
 * Uses dynamic import with SSR disabled to prevent hydration issues
 * with localStorage-based contexts (Theme and Language).
 */

'use client';

import dynamic from 'next/dynamic';

const PaletaApp = dynamic(() => import('@/components/PaletaApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-sm text-muted dark:text-muted">Loading...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <PaletaApp />;
}
