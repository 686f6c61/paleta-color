/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * ColorList Component
 * December 2025
 *
 * Displays a list of extracted colors from the uploaded image.
 * Each color item shows:
 * - Color swatch preview
 * - HEX code
 * - RGB values
 * - Copy to clipboard functionality (click to copy)
 * - Visual feedback when selected (synchronized with ColorIndicators)
 *
 * Features:
 * - Click on any color to copy its HEX code to clipboard
 * - Shows checkmark icon when copied (1.5 second timeout)
 * - Highlights selected color with inverted background
 * - Skeleton loading state when no colors are available
 * - Responsive hover effects
 *
 * @component ColorList
 * @param {Color[]} colors - Array of colors to display
 * @param {string} title - Title for the color list section
 * @param {number|null} selectedIndex - Index of currently selected color (optional)
 * @param {Function} onSelectColor - Callback when a color is clicked (optional)
 */

'use client';

import { Color } from '@/types/color.types';
import { useState } from 'react';

interface ColorListProps {
  colors: Color[];
  title: string;
  selectedIndex?: number | null;
  onSelectColor?: (index: number) => void;
}

export default function ColorList({ colors, title, selectedIndex, onSelectColor }: ColorListProps) {
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
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-white dark:bg-background border border-border dark:border-border rounded-lg"
            >
              <div className="w-10 h-10 rounded bg-accent dark:bg-accent border border-border dark:border-border" />
              <div className="flex-1">
                <div className="text-sm font-medium text-muted dark:text-muted">#------</div>
                <div className="text-xs text-muted dark:text-muted">RGB(---, ---, ---)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 border rounded-lg transition-all cursor-pointer group relative ${
              selectedIndex === index
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white scale-[1.02] shadow-md'
                : 'bg-white dark:bg-background border-border dark:border-border hover:bg-accent dark:hover:bg-accent'
            }`}
            onClick={() => {
              onSelectColor?.(index);
              copyToClipboard(color.hex, index);
            }}
          >
            <div
              className="w-10 h-10 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${selectedIndex === index ? 'text-white dark:text-black' : ''}`}>
                {color.hex}
              </div>
              <div className={`text-xs ${selectedIndex === index ? 'text-gray-300 dark:text-gray-700' : 'text-muted dark:text-muted'}`}>
                RGB({color.r}, {color.g}, {color.b})
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copiedIndex === index ? (
                <svg
                  className={`w-4 h-4 ${selectedIndex === index ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20,6 9,17 4,12" strokeWidth="2" />
                </svg>
              ) : (
                <svg
                  className={`w-4 h-4 ${selectedIndex === index ? 'text-gray-300 dark:text-gray-700' : 'text-muted dark:text-muted'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
