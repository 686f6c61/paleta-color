/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * RingSelector Component
 * December 2025
 *
 * Control panel for configuring color palette generation parameters.
 * Allows users to:
 * - Adjust the number of color rings (3-12)
 * - Select color harmony mode
 *
 * Color rings: Each base color generates N complementary colors
 * Harmony modes: Different color theory rules for generating palettes
 * - Complementary: Opposite on color wheel
 * - Analogous: Adjacent colors on color wheel
 * - Triadic: Three evenly spaced colors
 * - Tetradic: Four colors forming a rectangle
 * - Split-complementary: Base + two adjacent to complement
 *
 * @component RingSelector
 * @param {number} rings - Current number of color rings (3-12)
 * @param {Function} onRingsChange - Callback when rings value changes
 * @param {HarmonyMode} harmonyMode - Current harmony mode
 * @param {Function} onHarmonyModeChange - Callback when harmony mode changes
 */

'use client';

import { HarmonyMode } from '@/types/color.types';
import { useLanguage } from '@/contexts/LanguageContext';

interface RingSelectorProps {
  rings: number;
  onRingsChange: (rings: number) => void;
  harmonyMode: HarmonyMode;
  onHarmonyModeChange: (mode: HarmonyMode) => void;
}

export default function RingSelector({
  rings,
  onRingsChange,
  harmonyMode,
  onHarmonyModeChange
}: RingSelectorProps) {
  const { t } = useLanguage();

  const harmonyModes: { value: HarmonyMode; label: string }[] = [
    { value: 'complementary', label: t.harmony.complementary },
    { value: 'analogous', label: t.harmony.analogous },
    { value: 'triadic', label: t.harmony.triadic },
    { value: 'tetradic', label: t.harmony.tetradic },
    { value: 'split-complementary', label: t.harmony.splitComplementary }
  ];

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-background border border-border dark:border-border rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t.rings.label}: {rings}
        </label>
        <input
          type="range"
          min="3"
          max="12"
          value={rings}
          onChange={(e) => onRingsChange(parseInt(e.target.value))}
          className="w-full h-2 bg-accent dark:bg-accent rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
        />
        <div className="flex justify-between text-xs text-muted dark:text-muted mt-1">
          <span>3</span>
          <span>12</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t.rings.harmony}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {harmonyModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onHarmonyModeChange(mode.value)}
              className={`
                px-3 py-2 text-sm rounded border transition-all text-left
                ${
                  harmonyMode === mode.value
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-background text-foreground dark:text-foreground border-border dark:border-border hover:border-black dark:hover:border-white'
                }
              `}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
