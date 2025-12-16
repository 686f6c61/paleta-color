/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Color Algorithms Library
 * December 2025
 *
 * Core color processing algorithms for the palette generator. This module contains:
 *
 * Color Space Conversions:
 * - RGB ↔ HSL conversions for color manipulation
 * - RGB to HEX for display and export
 *
 * Color Extraction:
 * - K-means clustering algorithm for extracting dominant colors from images
 * - Optimized for speed and accuracy with ImageData
 *
 * Color Generation:
 * - Complementary color generation based on color theory
 * - Multiple harmony modes (complementary, analogous, triadic, tetradic, split-complementary)
 * - Configurable number of color rings (3-12)
 * - Tint and shade generation for color variations
 *
 * All functions are pure and side-effect free for predictable behavior.
 */

import { Color, HarmonyMode } from '@/types/color.types';

/**
 * Converts RGB color values to HSL (Hue, Saturation, Lightness).
 *
 * HSL is more intuitive for color manipulation as it separates
 * hue (color) from saturation and lightness, making it easier
 * to generate color variations.
 *
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {{h: number, s: number, l: number}} HSL values where h is 0-1, s is 0-1, l is 0-1
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Color distance calculation
function colorDistance(color1: number[], color2: number[]): number {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
}

// Initialize distinct centroids for k-means
function initializeDistinctCentroids(pixels: number[][], k: number): number[][] {
  const centroids: number[][] = [];

  // First centroid is random
  centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);

  // Subsequent centroids should be far from existing ones
  while (centroids.length < k) {
    let bestCandidate: number[] | null = null;
    let maxMinDistance = 0;

    // Try several random candidates
    for (let tries = 0; tries < 50; tries++) {
      const candidate = pixels[Math.floor(Math.random() * pixels.length)];

      // Find minimum distance to existing centroids
      let minDistToExisting = Infinity;
      centroids.forEach(centroid => {
        const dist = colorDistance(candidate, centroid);
        minDistToExisting = Math.min(minDistToExisting, dist);
      });

      // Keep the candidate with the largest minimum distance
      if (minDistToExisting > maxMinDistance) {
        maxMinDistance = minDistToExisting;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      centroids.push([...bestCandidate]);
    } else {
      centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
    }
  }

  return centroids;
}

// Ensure colors are distinct
function ensureDistinctColors(centroids: number[][], pixels: number[][], minDistance: number): number[][] {
  const distinctColors: number[][] = [];

  centroids.forEach(centroid => {
    let isDistinct = true;

    distinctColors.forEach(existing => {
      if (colorDistance(centroid, existing) < minDistance) {
        isDistinct = false;
      }
    });

    if (isDistinct) {
      distinctColors.push(centroid);
    } else {
      // Find a replacement color that's distinct
      let replacement = findDistinctReplacement(centroid, distinctColors, pixels, minDistance);
      if (replacement) {
        distinctColors.push(replacement);
      } else {
        const adjusted = [
          Math.min(255, centroid[0] + 30),
          Math.min(255, centroid[1] + 30),
          Math.min(255, centroid[2] + 30)
        ];
        distinctColors.push(adjusted);
      }
    }
  });

  return distinctColors;
}

// Find distinct replacement color
function findDistinctReplacement(
  originalColor: number[],
  existingColors: number[][],
  pixels: number[][],
  minDistance: number
): number[] | null {
  const colorCounts = new Map<string, number>();

  for (let i = 0; i < Math.min(pixels.length, 1000); i += 10) {
    const pixel = pixels[i];
    const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);

  for (const [colorKey] of sortedColors) {
    const [r, g, b] = colorKey.split(',').map(Number);
    const candidate = [r, g, b];

    let isDistinct = true;
    existingColors.forEach(existing => {
      if (colorDistance(candidate, existing) < minDistance) {
        isDistinct = false;
      }
    });

    if (isDistinct) {
      return candidate;
    }
  }

  return null;
}

// K-means color extraction
export function extractColorsKMeans(imageData: ImageData, k: number = 5): Color[] {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Sample pixels with their positions
  const pixels: number[][] = [];
  const pixelPositions: { x: number; y: number; index: number }[] = [];

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const i = (y * width + x) * 4;
      if (i < data.length) {
        pixels.push([data[i], data[i + 1], data[i + 2]]);
        pixelPositions.push({ x, y, index: pixels.length - 1 });
      }
    }
  }

  if (pixels.length === 0) {
    return Array(k).fill(null).map(() => ({
      r: 128, g: 128, b: 128, h: 0, s: 0, l: 50,
      hex: '#808080',
      position: { x: width / 2, y: height / 2 }
    }));
  }

  let centroids = initializeDistinctCentroids(pixels, k);
  let assignments = new Array(pixels.length);

  // K-means iterations
  for (let iter = 0; iter < 15; iter++) {
    const clusters = Array(k).fill(null).map(() => [] as number[][]);

    // Assign pixels to clusters
    pixels.forEach((pixel, pixelIdx) => {
      let minDist = Infinity;
      let closestCentroid = 0;

      centroids.forEach((centroid, idx) => {
        const dist = colorDistance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = idx;
        }
      });

      clusters[closestCentroid].push(pixel);
      assignments[pixelIdx] = closestCentroid;
    });

    // Update centroids
    centroids = clusters.map((cluster, idx) => {
      if (cluster.length === 0) {
        const randomIndex = Math.floor(Math.random() * pixels.length);
        return [...pixels[randomIndex]];
      }

      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0]);

      return [
        Math.round(sum[0] / cluster.length),
        Math.round(sum[1] / cluster.length),
        Math.round(sum[2] / cluster.length)
      ];
    });
  }

  centroids = ensureDistinctColors(centroids, pixels, 60);

  // Find representative positions
  const colorPositions = centroids.map((centroid, clusterIdx) => {
    const clusterPositions = pixelPositions.filter(pos => assignments[pos.index] === clusterIdx);

    if (clusterPositions.length === 0) {
      const x = (width / (k + 1)) * (clusterIdx + 1);
      const y = height / 2;
      return { x: Math.round(x), y: Math.round(y) };
    }

    let bestPosition = clusterPositions[0];
    let minDistance = Infinity;

    clusterPositions.forEach(pos => {
      const pixel = pixels[pos.index];
      const dist = colorDistance(pixel, centroid);
      if (dist < minDistance) {
        minDistance = dist;
        bestPosition = pos;
      }
    });

    return { x: bestPosition.x, y: bestPosition.y };
  });

  const result = centroids.slice(0, k).map((rgb, idx) => {
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
      position: colorPositions[idx] || { x: width / 2, y: height / 2 }
    };
  });

  while (result.length < k) {
    result.push({
      r: 128, g: 128, b: 128, h: 0, s: 0, l: 50,
      hex: '#808080',
      position: { x: width / 2, y: height / 2 }
    });
  }

  return result;
}

// Generate complementary colors
export function generateComplementaryColors(baseColor: Color, rings: number, mode: HarmonyMode = 'complementary'): Color[] {
  const colors: Color[] = [];

  switch (mode) {
    case 'complementary':
      // Generate colors at opposite hue
      for (let i = 0; i < rings; i++) {
        const lightnessVariation = (i - rings / 2) * (60 / rings);
        const newL = Math.max(10, Math.min(90, baseColor.l + lightnessVariation));
        const newH = (baseColor.h + 180) % 360;

        const rgb = hslToRgb(newH, baseColor.s, newL);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colors.push({
          ...rgb,
          ...hsl,
          hex: rgbToHex(rgb.r, rgb.g, rgb.b)
        });
      }
      break;

    case 'analogous':
      // Generate colors at similar hues
      for (let i = 0; i < rings; i++) {
        const hueOffset = ((i - rings / 2) * 60) / rings;
        const newH = (baseColor.h + hueOffset + 360) % 360;
        const lightnessVariation = (i % 2 === 0 ? 10 : -10);
        const newL = Math.max(10, Math.min(90, baseColor.l + lightnessVariation));

        const rgb = hslToRgb(newH, baseColor.s, newL);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colors.push({
          ...rgb,
          ...hsl,
          hex: rgbToHex(rgb.r, rgb.g, rgb.b)
        });
      }
      break;

    case 'triadic':
      // Generate colors at 120° intervals
      const triadicHues = [0, 120, 240];
      for (let i = 0; i < rings; i++) {
        const hueIndex = i % 3;
        const newH = (baseColor.h + triadicHues[hueIndex]) % 360;
        const lightnessVariation = Math.floor(i / 3) * (40 / Math.ceil(rings / 3));
        const newL = Math.max(10, Math.min(90, baseColor.l + lightnessVariation - 20));

        const rgb = hslToRgb(newH, baseColor.s, newL);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colors.push({
          ...rgb,
          ...hsl,
          hex: rgbToHex(rgb.r, rgb.g, rgb.b)
        });
      }
      break;

    case 'tetradic':
      // Generate colors at 90° intervals
      const tetradicHues = [0, 90, 180, 270];
      for (let i = 0; i < rings; i++) {
        const hueIndex = i % 4;
        const newH = (baseColor.h + tetradicHues[hueIndex]) % 360;
        const lightnessVariation = Math.floor(i / 4) * (40 / Math.ceil(rings / 4));
        const newL = Math.max(10, Math.min(90, baseColor.l + lightnessVariation - 20));

        const rgb = hslToRgb(newH, baseColor.s, newL);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colors.push({
          ...rgb,
          ...hsl,
          hex: rgbToHex(rgb.r, rgb.g, rgb.b)
        });
      }
      break;

    case 'split-complementary':
      // Generate colors at ±150° from base
      const splitHues = [0, 150, 210];
      for (let i = 0; i < rings; i++) {
        const hueIndex = i % 3;
        const newH = (baseColor.h + splitHues[hueIndex]) % 360;
        const lightnessVariation = Math.floor(i / 3) * (40 / Math.ceil(rings / 3));
        const newL = Math.max(10, Math.min(90, baseColor.l + lightnessVariation - 20));

        const rgb = hslToRgb(newH, baseColor.s, newL);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        colors.push({
          ...rgb,
          ...hsl,
          hex: rgbToHex(rgb.r, rgb.g, rgb.b)
        });
      }
      break;
  }

  return colors.slice(0, rings);
}

// Generate tints, shades, and tones
export function generateColorVariations(baseColor: Color, count: number = 5): Color[] {
  const variations: Color[] = [];

  // Generate lighter tints
  for (let i = 1; i <= Math.floor(count / 2); i++) {
    const newL = Math.min(95, baseColor.l + (i * 15));
    const rgb = hslToRgb(baseColor.h, baseColor.s, newL);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    variations.push({
      ...rgb,
      ...hsl,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b)
    });
  }

  // Add base color
  variations.push(baseColor);

  // Generate darker shades
  for (let i = 1; i <= Math.floor(count / 2); i++) {
    const newL = Math.max(5, baseColor.l - (i * 15));
    const rgb = hslToRgb(baseColor.h, baseColor.s, newL);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    variations.push({
      ...rgb,
      ...hsl,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b)
    });
  }

  return variations;
}
