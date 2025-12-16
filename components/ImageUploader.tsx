/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * ImageUploader Component
 * December 2025
 *
 * Image upload component with drag-and-drop support. Serves as the container
 * for the uploaded image and the ColorIndicators overlay.
 *
 * Features:
 * - Drag and drop image upload
 * - Click to browse file system
 * - Visual feedback during drag operations
 * - Displays uploaded image with proper containment
 * - Forwards ref to parent for positioning calculations
 * - Accepts children (used for ColorIndicators overlay)
 *
 * Technical details:
 * - Uses forwardRef to expose container div to parent
 * - Validates that dropped files are images
 * - Prevents file input trigger when clicking on children (indicators)
 * - Responsive layout with min-height constraint
 *
 * @component ImageUploader
 * @param {Function} onImageLoad - Callback when image is loaded
 * @param {string} currentImage - URL of the currently loaded image
 * @param {ReactNode} children - Child components to overlay on the image
 * @param {RefObject} imageRef - Reference to the image element
 */

'use client';

import { useState, useRef, DragEvent, forwardRef } from 'react';

interface ImageUploaderProps {
  onImageLoad: (file: File) => void;
  currentImage?: string;
  children?: React.ReactNode;
  imageRef?: React.RefObject<HTMLImageElement | null>;
}

const ImageUploader = forwardRef<HTMLDivElement, ImageUploaderProps>(
  ({ onImageLoad, currentImage, children, imageRef }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageLoad(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageLoad(file);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger file input if clicking on container, not on children (indicators)
    if (!currentImage && e.target === e.currentTarget) {
      fileInputRef.current?.click();
    }
  };

    return (
      <div
        ref={ref}
        className={`
          relative flex items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg transition-all
          ${isDragging ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-border dark:border-border'}
          ${currentImage ? 'border-none bg-white dark:bg-background' : 'bg-accent dark:bg-accent cursor-pointer hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!currentImage ? (
          <div className="text-center p-10">
            <div className="text-6xl mb-4 opacity-30 dark:opacity-20">□</div>
            <p className="text-lg font-medium text-muted dark:text-muted mb-2">Upload an image to get started</p>
            <p className="text-sm text-muted dark:text-muted">Drag and drop or click to choose</p>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={currentImage}
            alt="Uploaded image"
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
          />
        )}

        {children}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }
);

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
