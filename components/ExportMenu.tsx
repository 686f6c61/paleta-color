/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * ExportMenu Component
 * December 2025
 *
 * Provides export functionality for color palettes in multiple formats.
 * Users can download their generated palette as PNG, JSON, CSS, or SVG.
 *
 * Export formats:
 * - PNG: Visual representation of color swatches
 * - JSON: Structured data with HEX, RGB, and HSL values
 * - CSS: CSS custom properties for web projects
 * - SVG: Scalable vector graphic of the palette
 *
 * Features:
 * - Disabled state when no colors are available
 * - Grid layout with 2 columns
 * - Icon representation for each format
 * - Hover effects for better UX
 *
 * @component ExportMenu
 * @param {Color[]} colors - Array of colors to export
 * @param {boolean} disabled - Whether export is disabled (optional)
 */

'use client';

import { Color } from '@/types/color.types';
import { exportAsJSON, exportAsCSS, exportAsSVG, exportAsPNG } from '@/lib/export-utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExportMenuProps {
  colors: Color[];
  disabled?: boolean;
}

export default function ExportMenu({ colors, disabled = false }: ExportMenuProps) {
  const { t } = useLanguage();

  const exportFormats = [
    { label: t.export.formats.png, handler: () => exportAsPNG(colors), icon: '□' },
    { label: t.export.formats.json, handler: () => exportAsJSON(colors), icon: '{ }' },
    { label: t.export.formats.css, handler: () => exportAsCSS(colors), icon: 'CSS' },
    { label: t.export.formats.svg, handler: () => exportAsSVG(colors), icon: '⬡' }
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-3">{t.export.title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {exportFormats.map((format) => (
          <button
            key={format.label}
            onClick={format.handler}
            disabled={disabled || colors.length === 0}
            className={`
              px-4 py-3 text-sm font-medium rounded-lg border transition-all
              ${
                disabled || colors.length === 0
                  ? 'bg-accent dark:bg-accent text-muted dark:text-muted border-border dark:border-border cursor-not-allowed'
                  : 'bg-white dark:bg-background text-foreground dark:text-foreground border-border dark:border-border hover:border-black dark:hover:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
              }
            `}
          >
            <span className="block text-xs opacity-60 mb-1">{format.icon}</span>
            {format.label}
          </button>
        ))}
      </div>
    </div>
  );
}
