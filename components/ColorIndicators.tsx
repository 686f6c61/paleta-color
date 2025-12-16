/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * ColorIndicators Component
 * December 2025
 *
 * Manages draggable color picker indicators overlaid on the uploaded image.
 * This component allows users to select colors from specific points on the image
 * by dragging circular indicators. Features include:
 * - Smooth drag and drop with requestAnimationFrame throttling
 * - Real-time color sampling from ImageData
 * - Tooltip showing HEX and RGB values while dragging
 * - Proper constraint to image boundaries
 * - Synchronized highlighting with the extracted colors list
 *
 * Technical implementation:
 * - Uses custom useDragState hook for robust event listener management
 * - Implements offset-based dragging to prevent visual jumps
 * - Converts between image coordinates and container coordinates
 * - Prevents re-renders during drag with isDraggingRef flag
 *
 * @component ColorIndicators
 * @param {Color[]} colors - Array of extracted colors to display
 * @param {HTMLImageElement | null} imageElement - Reference to the uploaded image
 * @param {ImageData | null} imageData - Raw pixel data from the image
 * @param {Function} onColorUpdate - Callback when a color is updated by dragging
 * @param {Function} onSelectColor - Callback when a color indicator is selected
 * @param {number | null} selectedColorIndex - Index of currently selected color
 * @param {RefObject} containerRef - Reference to the container div
 */

'use client';

import { Color } from '@/types/color.types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { rgbToHex, rgbToHsl } from '@/lib/color-algorithms';

// ============================================================================
// CUSTOM HOOK: useDragState
// ============================================================================
/**
 * Custom hook to manage drag and drop state and event listeners.
 *
 * This hook encapsulates all the complexity of managing mouse event listeners
 * for drag operations, including:
 * - Adding/removing listeners with stable references
 * - Throttling updates with requestAnimationFrame
 * - Cleanup on unmount or drag end
 *
 * Key features:
 * - Prevents event listener accumulation (closure trap)
 * - Automatic cleanup of RAF requests
 * - Proper removal of document-level listeners
 *
 * @returns {Object} Drag state refs and control functions
 * @returns {RefObject<number|null>} draggingIndexRef - Index of item being dragged
 * @returns {RefObject<{x,y}>} dragOffsetRef - Offset between cursor and item center
 * @returns {RefObject<boolean>} isDraggingRef - Flag indicating active drag
 * @returns {Function} startDrag - Initiates a drag operation
 */
const useDragState = () => {
  const draggingIndexRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  /**
   * Initiates a drag operation with throttled mouse tracking.
   *
   * @param {number} index - Index of the color indicator being dragged
   * @param {{x: number, y: number}} offset - Initial offset between cursor and indicator
   * @param {Function} onMove - Callback executed on each mouse move (throttled to 60fps)
   * @param {Function} onUp - Callback executed when mouse button is released
   */
  const startDrag = useCallback((
    index: number,
    offset: { x: number; y: number },
    onMove: (e: MouseEvent) => void,
    onUp: () => void
  ) => {
    draggingIndexRef.current = index;
    dragOffsetRef.current = offset;
    isDraggingRef.current = true;

    const moveHandler = (e: MouseEvent) => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        onMove(e);
        rafIdRef.current = null;
      });
    };

    const upHandler = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      draggingIndexRef.current = null;
      isDraggingRef.current = false;
      dragOffsetRef.current = { x: 0, y: 0 };

      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);

      mouseMoveHandlerRef.current = null;
      mouseUpHandlerRef.current = null;

      onUp();
    };

    mouseMoveHandlerRef.current = moveHandler;
    mouseUpHandlerRef.current = upHandler;

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener('mousemove', mouseMoveHandlerRef.current);
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener('mouseup', mouseUpHandlerRef.current);
      }
      document.body.style.cursor = '';
    };
  }, []);

  return { draggingIndexRef, dragOffsetRef, isDraggingRef, startDrag };
};

// ============================================================================
// INTERFACES
// ============================================================================
interface ColorIndicatorsProps {
  colors: Color[];
  imageElement: HTMLImageElement | null;
  imageData: ImageData | null;
  onColorUpdate: (index: number, newColor: Color) => void;
  onSelectColor: (index: number | null) => void;
  selectedColorIndex: number | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ColorIndicators({
  colors,
  imageElement,
  imageData,
  onColorUpdate,
  onSelectColor,
  selectedColorIndex,
  containerRef
}: ColorIndicatorsProps) {

  // ------------------------------------------------------------
  // HOOKS
  // ------------------------------------------------------------
  const {
    draggingIndexRef,
    dragOffsetRef,
    isDraggingRef,
    startDrag
  } = useDragState();

  const [positions, setPositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  const [currentColor, setCurrentColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // ------------------------------------------------------------
  // FUNCIONES AUXILIARES: CONVERSIÓN DE COORDENADAS
  // ------------------------------------------------------------

  /**
   * Convierte coordenadas de imagen (naturalWidth/Height) a coordenadas de container
   */
  const imageToContainerCoords = useCallback((
    imageX: number,
    imageY: number
  ): { x: number; y: number } => {
    if (!imageElement || !containerRef.current) return { x: 0, y: 0 };

    const imgRect = imageElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const scaleX = imgRect.width / imageElement.naturalWidth;
    const scaleY = imgRect.height / imageElement.naturalHeight;

    const x = (imgRect.left - containerRect.left) + (imageX * scaleX) - 16;
    const y = (imgRect.top - containerRect.top) + (imageY * scaleY) - 16;

    return { x, y };
  }, [imageElement, containerRef]);

  /**
   * Convierte coordenadas de container a coordenadas de imagen (naturalWidth/Height)
   */
  const containerToImageCoords = useCallback((
    containerX: number,
    containerY: number
  ): { x: number; y: number } => {
    if (!imageElement || !containerRef.current) return { x: 0, y: 0 };

    const imgRect = imageElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const scaleX = imgRect.width / imageElement.naturalWidth;
    const scaleY = imgRect.height / imageElement.naturalHeight;

    const imgX = (containerX + 16 - (imgRect.left - containerRect.left)) / scaleX;
    const imgY = (containerY + 16 - (imgRect.top - containerRect.top)) / scaleY;

    return {
      x: Math.floor(Math.max(0, Math.min(imageElement.naturalWidth - 1, imgX))),
      y: Math.floor(Math.max(0, Math.min(imageElement.naturalHeight - 1, imgY)))
    };
  }, [imageElement, containerRef]);

  /**
   * Restringe coordenadas de container a los límites de la imagen
   */
  const constrainToImageBounds = useCallback((
    x: number,
    y: number
  ): { x: number; y: number } => {
    if (!imageElement || !containerRef.current) return { x, y };

    const imgRect = imageElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const minX = imgRect.left - containerRect.left;
    const maxX = imgRect.right - containerRect.left - 32;
    const minY = imgRect.top - containerRect.top;
    const maxY = imgRect.bottom - containerRect.top - 32;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }, [imageElement, containerRef]);

  /**
   * Extrae color de ImageData en las coordenadas dadas
   */
  const sampleColorAtPosition = useCallback((
    imageCoords: { x: number; y: number }
  ): Color | null => {
    if (!imageData) return null;

    const pixelIndex = (imageCoords.y * imageData.width + imageCoords.x) * 4;

    const r = imageData.data[pixelIndex];
    const g = imageData.data[pixelIndex + 1];
    const b = imageData.data[pixelIndex + 2];

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    return {
      r, g, b,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      hex,
      position: imageCoords
    };
  }, [imageData]);

  // ------------------------------------------------------------
  // INICIALIZAR POSICIONES
  // ------------------------------------------------------------
  useEffect(() => {
    // CRÍTICO: No recalcular durante drag
    if (isDraggingRef.current) return;

    if (!imageElement || !containerRef.current) return;

    const newPositions: { [key: number]: { x: number; y: number } } = {};

    colors.forEach((color, index) => {
      if (!color.position) return;

      // Usar función unificada
      const pos = imageToContainerCoords(color.position.x, color.position.y);
      newPositions[index] = pos;
    });

    setPositions(newPositions);
  }, [colors, imageElement, containerRef, imageToContainerCoords]);

  // ------------------------------------------------------------
  // DRAG HANDLERS
  // ------------------------------------------------------------
  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const currentPos = positions[index];
    if (!currentPos) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - containerRect.left;
    const cursorY = e.clientY - containerRect.top;

    // Calcular offset (cursor - centro del indicador)
    const offset = {
      x: cursorX - (currentPos.x + 16),
      y: cursorY - (currentPos.y + 16)
    };

    onSelectColor(index);
    document.body.style.cursor = 'grabbing';

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - containerRect.left;
      const cursorY = e.clientY - containerRect.top;

      // Aplicar offset para movimiento suave
      const x = cursorX - dragOffsetRef.current.x - 16;
      const y = cursorY - dragOffsetRef.current.y - 16;

      const constrained = constrainToImageBounds(x, y);

      setPositions(prev => ({
        ...prev,
        [draggingIndexRef.current!]: constrained
      }));

      const imageCoords = containerToImageCoords(constrained.x, constrained.y);
      const newColor = sampleColorAtPosition(imageCoords);

      if (newColor) {
        setCurrentColor({
          hex: newColor.hex,
          rgb: `RGB(${newColor.r}, ${newColor.g}, ${newColor.b})`
        });
        setTooltipPos({ x: e.clientX, y: e.clientY });
        onColorUpdate(draggingIndexRef.current!, newColor);
      }
    };

    const onUp = () => {
      setCurrentColor(null);
      setTooltipPos(null);
      document.body.style.cursor = '';
    };

    startDrag(index, offset, onMove, onUp);
  }, [
    positions,
    onSelectColor,
    startDrag,
    containerRef,
    dragOffsetRef,
    draggingIndexRef,
    constrainToImageBounds,
    containerToImageCoords,
    sampleColorAtPosition,
    onColorUpdate
  ]);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (!imageElement || colors.length === 0) return null;

  return (
    <>
      {/* Indicators */}
      {colors.map((color, index) => {
        const pos = positions[index];
        if (!pos) return null;

        return (
          <div
            key={index}
            data-indicator-index={index}
            className={`absolute w-8 h-8 rounded-full cursor-grab active:cursor-grabbing transition-all select-none ${
              selectedColorIndex === index
                ? 'ring-4 ring-black dark:ring-white scale-110 shadow-lg'
                : 'ring-2 ring-white shadow-md hover:scale-105'
            }`}
            style={{
              backgroundColor: color.hex,
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: selectedColorIndex === index ? 50 : 40,
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectColor(index);
            }}
          />
        );
      })}

      {/* Tooltip */}
      {currentColor && tooltipPos && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 40}px`,
            zIndex: 100,
          }}
        >
          <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg shadow-xl text-xs font-mono whitespace-nowrap">
            <div className="font-semibold">{currentColor.hex}</div>
            <div className="opacity-70">{currentColor.rgb}</div>
          </div>
        </div>
      )}
    </>
  );
}
