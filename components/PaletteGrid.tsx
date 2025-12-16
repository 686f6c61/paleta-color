/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * PaletteGrid Component
 * December 2025
 *
 * Displays the complete generated color palette as a grid of color swatches.
 * Shows all colors including base colors and generated complementary colors.
 *
 * Features:
 * - 5-column grid layout for compact viewing
 * - Click any swatch to copy HEX code to clipboard
 * - Hover overlay showing HEX code
 * - Visual feedback when copied (checkmark)
 * - Scale animation on hover
 * - Empty state message when no colors available
 *
 * @component PaletteGrid
 * @param {Color[]} colors - Array of all colors in the palette (base + generated)
 */

'use client';

import { Color } from '@/types/color.types';
import { useState } from 'react';

interface PaletteGridProps {
  colors: Color[];
}

export default function PaletteGrid({ colors }: PaletteGridProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (colors.length === 0) {
    return (
      <div className="text-center p-10 text-muted dark:text-muted">
        <p>Generate a palette to see colors here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {colors.map((color, index) => (
        <div
          key={index}
          className="group relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:scale-105 transition-transform"
          style={{ backgroundColor: color.hex }}
          onClick={() => copyToClipboard(color.hex, index)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium text-center p-2">
              {copiedIndex === index ? (
                <span>✓ Copied</span>
              ) : (
                <span className="font-mono">{color.hex}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
