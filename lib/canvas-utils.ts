/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Canvas Utilities Library
 * December 2025
 *
 * Helper functions for working with HTML Canvas API and image processing.
 * These utilities handle:
 * - Loading images from File objects
 * - Extracting ImageData from images for pixel-level access
 * - Reading individual pixel colors from ImageData
 *
 * Used by the color extraction algorithms to analyze uploaded images.
 */

/**
 * Loads an image file and converts it to an HTMLImageElement.
 *
 * Uses FileReader to read the file as a data URL, then creates
 * an Image element and waits for it to load.
 *
 * @param {File} file - The image file to load
 * @returns {Promise<HTMLImageElement>} Promise that resolves with the loaded image
 * @throws {Error} If file reading or image loading fails
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extracts ImageData from an HTMLImageElement for pixel-level access.
 *
 * Creates an off-screen canvas, draws the image to it, and retrieves
 * the raw pixel data. Fills with white background first to handle
 * transparent PNGs properly.
 *
 * @param {HTMLImageElement} img - The image to extract data from
 * @returns {ImageData} Raw pixel data of the image
 * @throws {Error} If canvas context cannot be obtained
 */
export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = img.width;
  canvas.height = img.height;

  // Fill with white background for transparent PNGs
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Retrieves the RGB color of a specific pixel in ImageData.
 *
 * @param {ImageData} imageData - The image data to read from
 * @param {number} x - X coordinate of the pixel
 * @param {number} y - Y coordinate of the pixel
 * @returns {{r: number, g: number, b: number}} RGB color values (0-255)
 */
export function getPixelColor(
  imageData: ImageData,
  x: number,
  y: number
): { r: number; g: number; b: number } {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2]
  };
}
