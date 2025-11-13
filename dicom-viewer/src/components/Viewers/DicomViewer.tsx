/**
 * DICOM Viewer Component
 * Displays DICOM images with viewport synchronization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Spin, Alert } from 'antd';
import type { DicomFile } from '@store/types';
import { useAppDispatch, useAppSelector } from '@store';
import { updateLeftViewport, updateRightViewport, setLeftActiveTool, setRightActiveTool } from '@store/slices/viewerSlice';
import ViewerControls from '@components/Controls/ViewerControls';

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

  useEffect(() => {
    if (!file || !viewerRef.current) {
      return;
    }

    // Show loading if file is being processed
    if (file.status === 'processing' || file.status === 'uploading') {
      setLoading(true);
    } else {
      setLoading(false);
    }

    // For Phase 5, we'll display a placeholder with viewport transformations
    // Full Cornerstone integration will be implemented in later phase
  }, [file]);

  // Mouse wheel for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.1, Math.min(10, viewport.scale + delta));
      updateViewport({ scale: newScale });
    },
    [viewport.scale, updateViewport]
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

  // Attach wheel listener
  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

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

  if (!file) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
        }}
      >
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
          <div>No file selected</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading DICOM"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#000',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <Spin size="large" tip="Loading DICOM image..." />
        </div>
      )}

      {/* Viewer Canvas */}
      <div
        ref={viewerRef}
        className="viewer-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: activeTool === 'Pan' ? 'move' : activeTool === 'Zoom' ? 'zoom-in' : 'crosshair',
          overflow: 'hidden',
        }}
      >
        {file.status === 'complete' && file.imageData ? (
          /* Placeholder with viewport transformations */
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              transform: `translate(${viewport.translation.x}px, ${viewport.translation.y}px) scale(${viewport.scale}) rotate(${viewport.rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>DICOM Viewer Canvas</div>
            <div style={{ fontSize: 14, color: '#666' }}>
              {file.fileName}
            </div>
            {file.metadata && (
              <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                {file.metadata.columns} × {file.metadata.rows} pixels
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        ) : file.status === 'error' ? (
          <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 16 }}>Error loading DICOM file</div>
            {file.error && (
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                {file.error}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <Spin size="large" />
            <div style={{ fontSize: 14, marginTop: 16 }}>Processing {file.fileName}...</div>
          </div>
        )}
      </div>

      {/* Viewer Overlay - contains tools and info */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Top-left info overlay */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 12px',
            borderRadius: 4,
            fontSize: 11,
            color: '#ccc',
          }}
        >
          {file.metadata && (
            <div>
              <div>{file.metadata.patientName || 'Unknown Patient'}</div>
              <div>{file.metadata.modality || 'Unknown Modality'}</div>
            </div>
          )}
        </div>

        {/* Bottom-left viewport info */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 10px',
            borderRadius: 4,
            fontSize: 10,
            color: '#999',
          }}
        >
          <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
          {viewport.windowWidth && viewport.windowCenter && (
            <div>
              W/L: {viewport.windowWidth.toFixed(0)} / {viewport.windowCenter.toFixed(0)}
            </div>
          )}
        </div>

        {/* Viewer Controls */}
        <div style={{ pointerEvents: 'auto' }}>
          <ViewerControls
            activeTool={activeTool || 'WindowLevel'}
            onToolChange={handleToolChange}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
