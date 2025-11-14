/**
 * DICOM Viewer Component
 * Displays DICOM images with viewport synchronization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Spin, Alert } from 'antd';
import * as dicomParser from 'dicom-parser';
import type { DicomFile } from '@store/types';
import { useAppDispatch, useAppSelector } from '@store';
import { updateLeftViewport, updateRightViewport, setLeftActiveTool, setRightActiveTool } from '@store/slices/viewerSlice';
import ViewerControls from '@components/Controls/ViewerControls';
import styles from './DicomViewer.module.scss';

interface DicomViewerProps {
  file: DicomFile | null;
  viewerId: 'left' | 'right';
  onError?: (error: Error) => void;
}

const DicomViewer = ({ file, viewerId, onError: _onError }: DicomViewerProps) => {
  const dispatch = useAppDispatch();
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get viewport state from Redux
  const viewport = useAppSelector((state) =>
    viewerId === 'left' ? state.viewer.leftViewer.viewport : state.viewer.rightViewer.viewport
  );
  const activeTool = useAppSelector((state) =>
    viewerId === 'left' ? state.viewer.leftViewer.tools.activeTool : state.viewer.rightViewer.tools.activeTool
  );

  // Update viewport in Redux
  const updateViewport = useCallback(
    (updates: any) => {
      if (viewerId === 'left') {
        dispatch(updateLeftViewport(updates));
      } else {
        dispatch(updateRightViewport(updates));
      }
    },
    [dispatch, viewerId]
  );

  // Render DICOM image to canvas
  const renderDicomImage = useCallback(async () => {
    if (!file || !file.imageData || !file.metadata || !canvasRef.current || file.status !== 'complete') {
      return;
    }

    try {
      setLoading(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Parse DICOM data
      const byteArray = new Uint8Array(file.imageData);
      const dataSet = dicomParser.parseDicom(byteArray);

      // Get image dimensions
      const rows = file.metadata.rows || dataSet.uint16('x00280010') || 512;
      const columns = file.metadata.columns || dataSet.uint16('x00280011') || 512;
      const bitsAllocated = dataSet.uint16('x00280100') || 16;
      // const bitsStored = dataSet.uint16('x00280101') || bitsAllocated;
      // const highBit = dataSet.uint16('x00280102') || bitsStored - 1;
      const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed
      const samplesPerPixel = dataSet.uint16('x00280002') || 1;
      const photometricInterpretation = dataSet.string('x00280004') || 'MONOCHROME2';
      const rescaleIntercept = dataSet.floatString('x00281052') || 0;
      const rescaleSlope = dataSet.floatString('x00281053') || 1;

      // Get window/level from viewport or DICOM tags
      const windowCenter = viewport.windowCenter ?? dataSet.floatString('x00281050') ?? 0;
      const windowWidth = viewport.windowWidth ?? dataSet.floatString('x00281051') ?? 0;

      // Get pixel data
      const pixelDataElement = dataSet.elements['x7fe00010'];
      if (!pixelDataElement) {
        console.warn('No pixel data found in DICOM file');
        return;
      }

      // Extract pixel data - use dicom-parser's built-in method
      // Note: pixelDataElement.length might be undefined for encapsulated data
      const expectedLength = rows * columns * samplesPerPixel * (bitsAllocated / 8);
      const actualLength = pixelDataElement.length || expectedLength;
      
      const pixelData = dataSet.byteArray.subarray(
        pixelDataElement.dataOffset,
        pixelDataElement.dataOffset + Math.min(actualLength, dataSet.byteArray.length - pixelDataElement.dataOffset)
      );
      
      console.log('DICOM rendering info:', {
        rows,
        columns,
        bitsAllocated,
        samplesPerPixel,
        pixelDataLength: pixelData.length,
        expectedLength,
        actualLength: pixelDataElement.length,
      });

      // Set canvas size
      canvas.width = columns;
      canvas.height = rows;

      // Create ImageData
      const imageData = ctx.createImageData(columns, rows);
      const data = imageData.data;
      const totalPixels = rows * columns;

      // Convert pixel data based on bits allocated
      if (bitsAllocated === 8) {
        // 8-bit grayscale
        for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
          const byteIndex = pixelIndex * samplesPerPixel;
          if (byteIndex >= pixelData.length) break;
          
          let pixelValue = pixelData[byteIndex];
          
          // Apply rescale slope/intercept
          pixelValue = pixelValue * rescaleSlope + rescaleIntercept;
          
          // Apply window/level if available
          if (windowWidth > 0) {
            const min = windowCenter - windowWidth / 2;
            const max = windowCenter + windowWidth / 2;
            pixelValue = Math.max(min, Math.min(max, pixelValue));
            pixelValue = ((pixelValue - min) / (max - min)) * 255;
          } else {
            // Clamp to 0-255
            pixelValue = Math.max(0, Math.min(255, pixelValue));
          }
          
          const gray = Math.round(pixelValue);
          const idx = pixelIndex * 4;
          data[idx] = gray;     // R
          data[idx + 1] = gray; // G
          data[idx + 2] = gray; // B
          data[idx + 3] = 255;  // A
        }
      } else if (bitsAllocated === 16) {
        // 16-bit grayscale - need to handle byte order
        // Note: dicom-parser doesn't expose littleEndian directly, assume little-endian for DICOM
        const isLittleEndian = true; // DICOM default is little-endian
        const bytesPerPixel = 2;
        
        // Calculate min/max for normalization if no window/level
        let minValue = Infinity;
        let maxValue = -Infinity;
        if (windowWidth <= 0) {
          // First pass: find min/max
          for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
            const byteIndex = pixelIndex * samplesPerPixel * bytesPerPixel;
            if (byteIndex + 1 >= pixelData.length) break;
            
            let pixelValue;
            if (isLittleEndian) {
              pixelValue = pixelData[byteIndex] | (pixelData[byteIndex + 1] << 8);
            } else {
              pixelValue = (pixelData[byteIndex] << 8) | pixelData[byteIndex + 1];
            }
            
            // Handle signed/unsigned
            if (pixelRepresentation === 1 && pixelValue > 32767) {
              pixelValue = pixelValue - 65536;
            }
            
            pixelValue = pixelValue * rescaleSlope + rescaleIntercept;
            minValue = Math.min(minValue, pixelValue);
            maxValue = Math.max(maxValue, pixelValue);
          }
        }
        
        // Second pass: render pixels
        for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
          const byteIndex = pixelIndex * samplesPerPixel * bytesPerPixel;
          if (byteIndex + 1 >= pixelData.length) break;
          
          let pixelValue;
          if (isLittleEndian) {
            pixelValue = pixelData[byteIndex] | (pixelData[byteIndex + 1] << 8);
          } else {
            pixelValue = (pixelData[byteIndex] << 8) | pixelData[byteIndex + 1];
          }
          
          // Handle signed/unsigned
          if (pixelRepresentation === 1 && pixelValue > 32767) {
            pixelValue = pixelValue - 65536;
          }
          
          // Apply rescale slope/intercept
          pixelValue = pixelValue * rescaleSlope + rescaleIntercept;
          
          // Apply window/level if available
          if (windowWidth > 0) {
            const min = windowCenter - windowWidth / 2;
            const max = windowCenter + windowWidth / 2;
            pixelValue = Math.max(min, Math.min(max, pixelValue));
            pixelValue = ((pixelValue - min) / (max - min)) * 255;
          } else {
            // Normalize using calculated min/max
            if (maxValue > minValue) {
              pixelValue = ((pixelValue - minValue) / (maxValue - minValue)) * 255;
            } else {
              pixelValue = 128; // Default gray if no range
            }
          }
          
          const gray = Math.max(0, Math.min(255, Math.round(pixelValue)));
          const idx = pixelIndex * 4;
          data[idx] = gray;     // R
          data[idx + 1] = gray; // G
          data[idx + 2] = gray; // B
          data[idx + 3] = 255;  // A
        }
      }

      // Handle photometric interpretation
      if (photometricInterpretation === 'MONOCHROME1') {
        // Invert grayscale
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
      }

      // Draw to canvas
      ctx.putImageData(imageData, 0, 0);
      setLoading(false);
    } catch (error) {
      console.error('Error rendering DICOM image:', error);
      setLoading(false);
      _setError(error instanceof Error ? error.message : 'Failed to render image');
    }
  }, [file, viewport.windowCenter, viewport.windowWidth]);

  useEffect(() => {
    if (!file || !viewerRef.current) {
      return;
    }

    // Show loading if file is being processed
    if (file.status === 'processing' || file.status === 'uploading') {
      setLoading(true);
    } else if (file.status === 'complete' && file.imageData) {
      // Render the image when file is complete or window/level changes
      renderDicomImage();
    } else {
      setLoading(false);
    }
  }, [file, renderDicomImage, viewport.windowCenter, viewport.windowWidth]);

  // Mouse wheel for zoom - only when a tool is active
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // If no tool is active, don't handle wheel here (let parent handle file navigation)
      if (!activeTool) {
        return;
      }

      // If Ctrl or Shift is held, let parent handle file navigation
      if (e.ctrlKey || e.shiftKey) {
        return;
      }

      // Only handle zoom when a tool is active
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(10, viewport.scale + delta));
      updateViewport({ scale: newScale });
    },
    [viewport.scale, updateViewport, activeTool]
  );

  // Mouse events for pan and window/level
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (activeTool === 'Pan') {
        // Pan mode
        updateViewport({
          translation: {
            x: viewport.translation.x + deltaX,
            y: viewport.translation.y + deltaY,
          },
        });
      } else if (activeTool === 'WindowLevel') {
        // Window/Level adjustment
        const windowWidth = (viewport.windowWidth || 400) + deltaX;
        const windowCenter = (viewport.windowCenter || 40) + deltaY;
        updateViewport({
          windowWidth: Math.max(1, windowWidth),
          windowCenter,
        });
      } else if (activeTool === 'Zoom') {
        // Zoom with mouse drag
        const zoomDelta = deltaY * 0.01;
        const newScale = Math.max(0.1, Math.min(10, viewport.scale - zoomDelta));
        updateViewport({ scale: newScale });
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, activeTool, viewport, updateViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach wheel listener - only when a tool is active
  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;

    // Only attach listener if a tool is active
    if (activeTool) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        element.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel, activeTool]);

  const handleToolChange = (tool: string) => {
    if (viewerId === 'left') {
      dispatch(setLeftActiveTool(tool));
    } else {
      dispatch(setRightActiveTool(tool));
    }
  };

  const handleReset = () => {
    updateViewport({
      scale: 1.0,
      translation: { x: 0, y: 0 },
      rotation: 0,
      windowWidth: undefined,
      windowCenter: undefined,
    });
  };

  const handleZoomChange = (scale: number) => {
    updateViewport({ scale });
  };

  if (!file) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <div className={styles.emptyStateIcon}>📁</div>
          <div>No file selected</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message="Error Loading DICOM"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const cursorClass = activeTool === 'Pan' ? styles.panMode : activeTool === 'Zoom' ? styles.zoomMode : '';

  return (
    <div className={styles.viewer}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <Spin size="large" tip="Loading DICOM image..." />
        </div>
      )}

      {/* Viewer Canvas */}
      <div
        ref={viewerRef}
        className={`viewer-container ${styles.viewerContainer} ${cursorClass}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {file.status === 'complete' && file.imageData ? (
          /* DICOM Image Canvas */
          <div
            className={`${styles.canvasWrapper} ${isDragging ? styles.dragging : ''}`}
            style={{
              '--translate-x': `${viewport.translation.x}px`,
              '--translate-y': `${viewport.translation.y}px`,
              '--scale': viewport.scale,
              '--rotation': `${viewport.rotation}deg`,
            } as React.CSSProperties}
          >
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>
        ) : file.status === 'error' ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorMessage}>Error loading DICOM file</div>
            {file.error && (
              <div className={styles.errorText}>
                {file.error}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.processingState}>
            <Spin size="large" />
            <div className={styles.processingMessage}>Processing {file.fileName}...</div>
          </div>
        )}
      </div>

      {/* Viewer Overlay - contains tools and info */}
      <div className={styles.overlay}>
        {/* Top-left info overlay */}
        <div className={styles.infoOverlay}>
          {file.metadata && (
            <div>
              <div>{file.metadata.patientName || 'Unknown Patient'}</div>
              <div>{file.metadata.modality || 'Unknown Modality'}</div>
            </div>
          )}
        </div>

        {/* Bottom-left viewport info */}
        <div className={styles.viewportInfo}>
          <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
          {viewport.windowWidth && viewport.windowCenter && (
            <div>
              W/L: {viewport.windowWidth.toFixed(0)} / {viewport.windowCenter.toFixed(0)}
            </div>
          )}
        </div>

        {/* Viewer Controls */}
        <div className={styles.controlsWrapper}>
          <ViewerControls
            activeTool={activeTool || 'WindowLevel'}
            onToolChange={handleToolChange}
            onReset={handleReset}
            onZoomChange={handleZoomChange}
            currentZoom={viewport.scale}
          />
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
