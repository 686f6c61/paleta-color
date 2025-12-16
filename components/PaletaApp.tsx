/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * PaletaApp - Main Application Component
 * December 2025
 *
 * This is the main application component that orchestrates the entire color palette
 * extraction and generation workflow. It manages:
 *
 * Features:
 * - Image upload and processing
 * - K-means color extraction (5 dominant colors)
 * - Complementary color generation with configurable rings (3-12)
 * - Multiple harmony modes (complementary, analogous, triadic, tetradic, split-complementary)
 * - Real-time color updates via draggable indicators
 * - Palette export in multiple formats (PNG, JSON, CSS, SVG)
 * - Dark mode support
 * - Internationalization (Spanish/English)
 *
 * State management:
 * - Image data and metadata
 * - Base colors extracted from image
 * - Generated palette with all color variations
 * - UI state (selected color, processing status)
 *
 * @component PaletaApp
 * @returns {JSX.Element} Main application layout with all features
 */

'use client';

import { useState, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ColorList from '@/components/ColorList';
import RingSelector from '@/components/RingSelector';
import PaletteGrid from '@/components/PaletteGrid';
import ExportMenu from '@/components/ExportMenu';
import ColorIndicators from '@/components/ColorIndicators';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import Footer from '@/components/Footer';
import { Color, HarmonyMode } from '@/types/color.types';
import { loadImageFromFile, getImageData } from '@/lib/canvas-utils';
import { extractColorsKMeans, generateComplementaryColors } from '@/lib/color-algorithms';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaletaApp() {
  const { t } = useLanguage();
  const [currentImageUrl, setCurrentImageUrl] = useState<string>();
  const [baseColors, setBaseColors] = useState<Color[]>([]);
  const [rings, setRings] = useState(5);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('complementary');
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = async (file: File) => {
    setIsProcessing(true);

    try {
      const url = URL.createObjectURL(file);
      setCurrentImageUrl(url);

      const img = await loadImageFromFile(file);
      const imageData = getImageData(img);
      const extractedColors = extractColorsKMeans(imageData, 5);

      setCurrentImage(img);
      setCurrentImageData(imageData);
      setBaseColors(extractedColors);
      generatePalette(extractedColors, rings, harmonyMode);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorUpdate = (index: number, newColor: Color) => {
    const updatedColors = [...baseColors];
    updatedColors[index] = newColor;
    setBaseColors(updatedColors);
    generatePalette(updatedColors, rings, harmonyMode);
  };

  const generatePalette = (colors: Color[], numRings: number, mode: HarmonyMode) => {
    const palette: Color[] = [...colors];

    colors.forEach((baseColor) => {
      const complementary = generateComplementaryColors(baseColor, numRings, mode);
      palette.push(...complementary);
    });

    setAllColors(palette);
  };

  const handleRingsChange = (newRings: number) => {
    setRings(newRings);
    if (baseColors.length > 0) {
      generatePalette(baseColors, newRings, harmonyMode);
    }
  };

  const handleHarmonyModeChange = (newMode: HarmonyMode) => {
    setHarmonyMode(newMode);
    if (baseColors.length > 0) {
      generatePalette(baseColors, rings, newMode);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.header.title}</h1>
            <p className="text-muted dark:text-muted">{t.header.description}</p>
          </div>
          <div className="flex gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <button
                onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                {t.upload.button}
              </button>
            </div>

            <ColorList
              colors={baseColors}
              title={t.colors.extracted}
              selectedIndex={selectedColorIndex}
              onSelectColor={setSelectedColorIndex}
            />

            {baseColors.length > 0 && (
              <>
                <RingSelector
                  rings={rings}
                  onRingsChange={handleRingsChange}
                  harmonyMode={harmonyMode}
                  onHarmonyModeChange={handleHarmonyModeChange}
                />

                <ExportMenu colors={allColors} disabled={isProcessing} />
              </>
            )}
          </div>

          <div className="lg:col-span-6 space-y-6">
            <ImageUploader
              ref={containerRef}
              imageRef={imageRef}
              onImageLoad={handleImageLoad}
              currentImage={currentImageUrl}
            >
              <ColorIndicators
                colors={baseColors}
                imageElement={imageRef.current}
                imageData={currentImageData}
                onColorUpdate={handleColorUpdate}
                onSelectColor={setSelectedColorIndex}
                selectedColorIndex={selectedColorIndex}
                containerRef={containerRef}
              />
            </ImageUploader>

            {isProcessing && (
              <div className="text-center p-6">
                <div className="inline-block w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-muted dark:text-muted">{t.upload.processing}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold mb-4">{t.colors.generated}</h2>
              <PaletteGrid colors={allColors} />

              {allColors.length > 0 && (
                <div className="mt-4 p-4 bg-accent dark:bg-accent rounded-lg text-sm text-muted dark:text-muted">
                  <p className="font-medium text-foreground dark:text-foreground mb-1">
                    {t.colors.total}: {allColors.length}
                  </p>
                  <p>
                    {baseColors.length} {t.colors.base} + {allColors.length - baseColors.length} {t.colors.generatedCount}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
