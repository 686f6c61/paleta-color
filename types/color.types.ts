/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Color Type Definitions
 * December 2025
 *
 * TypeScript type definitions for color-related data structures.
 * Defines the shape of color objects, palettes, and configuration options.
 */

/**
 * Color interface representing a color in multiple color spaces.
 *
 * @interface Color
 * @property {number} r - Red component (0-255)
 * @property {number} g - Green component (0-255)
 * @property {number} b - Blue component (0-255)
 * @property {number} h - Hue (0-1)
 * @property {number} s - Saturation (0-1)
 * @property {number} l - Lightness (0-1)
 * @property {string} hex - HEX color code (e.g., "#FF5733")
 * @property {{x: number, y: number}} position - Optional pixel position in source image
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  hex: string;
  position?: { x: number; y: number };
}

/**
 * Color harmony modes based on color theory.
 * Determines how complementary colors are generated.
 */
export type HarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary';
