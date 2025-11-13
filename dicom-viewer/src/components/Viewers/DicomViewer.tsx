/**
 * DICOM Viewer Component
 * Displays DICOM images using Cornerstone.js
 */

import { useEffect, useRef, useState } from 'react';
import { Spin, Alert } from 'antd';
import type { DicomFile } from '@store/types';
import ViewerControls from '@components/Controls/ViewerControls';

interface DicomViewerProps {
  file: DicomFile | null;
  onError?: (error: Error) => void;
}

const DicomViewer = ({ file, onError: _onError }: DicomViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState('WindowLevel');

  useEffect(() => {
    if (!file || !file.imageData || !viewerRef.current) {
      return;
    }

    // For Phase 3, we'll display a placeholder with image info
    // Full Cornerstone integration will be implemented
    setLoading(false);
  }, [file]);

  const handleToolChange = (tool: string) => {
    setActiveTool(tool);
    // In full implementation, this will activate the Cornerstone tool
    console.log('Tool changed to:', tool);
  };

  const handleReset = () => {
    // In full implementation, this will reset the viewport
    console.log('Viewport reset');
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
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Placeholder for Phase 3 */}
        <div style={{ textAlign: 'center', color: '#999' }}>
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
        </div>
      </div>

      {/* Viewer Overlay - will contain tools and info */}
      <div className="viewer-overlay">
        <div className="viewer-info">
          {file.metadata && (
            <div style={{ fontSize: 12 }}>
              <div>{file.metadata.patientName || 'Unknown Patient'}</div>
              <div>{file.metadata.modality || 'Unknown Modality'}</div>
            </div>
          )}
        </div>

        {/* Viewer Controls */}
        <ViewerControls
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default DicomViewer;
