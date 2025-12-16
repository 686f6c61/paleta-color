/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Export Utilities Library
 * December 2025
 *
 * Handles exporting color palettes in multiple formats:
 * - JSON: Structured data with HEX, RGB, and HSL values
 * - CSS: CSS custom properties (variables) for web projects
 * - SVG: Scalable vector graphic showing color swatches
 * - PNG: Raster image of the color palette
 *
 * All export functions trigger automatic downloads in the browser.
 */

import { Color } from '@/types/color.types';

/**
 * Exports the color palette as a JSON file.
 *
 * Creates a JSON array with each color's HEX, RGB, and HSL values.
 * Useful for importing palettes into other tools or applications.
 *
 * @param {Color[]} colors - Array of colors to export
 */
export function exportAsJSON(colors: Color[]): void {
  const paletteData = colors.map(color => ({
    hex: color.hex,
    rgb: { r: color.r, g: color.g, b: color.b },
    hsl: { h: color.h, s: color.s, l: color.l }
  }));

  const jsonString = JSON.stringify(paletteData, null, 2);
  downloadFile(jsonString, 'palette.json', 'application/json');
}

// Export palette as CSS
export function exportAsCSS(colors: Color[]): void {
  let cssString = ':root {\n';

  colors.forEach((color, index) => {
    cssString += `  --color-${index + 1}: ${color.hex};\n`;
    cssString += `  --color-${index + 1}-rgb: ${color.r}, ${color.g}, ${color.b};\n`;
    cssString += `  --color-${index + 1}-hsl: ${color.h}, ${color.s}%, ${color.l}%;\n`;
  });

  cssString += '}\n';

  downloadFile(cssString, 'palette.css', 'text/css');
}

// Export palette as SVG
export function exportAsSVG(colors: Color[]): void {
  const swatchSize = 100;
  const columns = 5;
  const rows = Math.ceil(colors.length / columns);
  const width = columns * swatchSize;
  const height = rows * swatchSize;

  let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;

  colors.forEach((color, index) => {
    const x = (index % columns) * swatchSize;
    const y = Math.floor(index / columns) * swatchSize;

    svgString += `  <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color.hex}"/>\n`;
    svgString += `  <text x="${x + swatchSize / 2}" y="${y + swatchSize / 2}" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="12" fill="${color.l > 50 ? '#000000' : '#FFFFFF'}">${color.hex}</text>\n`;
  });

  svgString += '</svg>';

  downloadFile(svgString, 'palette.svg', 'image/svg+xml');
}

// Export palette as PNG
export function exportAsPNG(colors: Color[]): void {
  const swatchSize = 150;
  const columns = 5;
  const rows = Math.ceil(colors.length / columns);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  canvas.width = columns * swatchSize;
  canvas.height = rows * swatchSize;

  colors.forEach((color, index) => {
    const x = (index % columns) * swatchSize;
    const y = Math.floor(index / columns) * swatchSize;

    // Draw color swatch
    ctx.fillStyle = color.hex;
    ctx.fillRect(x, y, swatchSize, swatchSize);

    // Draw text
    ctx.fillStyle = color.l > 50 ? '#000000' : '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(color.hex, x + swatchSize / 2, y + swatchSize / 2);
  });

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'palette.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}

// Helper function to download text files
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
