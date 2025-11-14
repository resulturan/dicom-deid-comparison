/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for common actions
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@store';
import {
  toggleUploadDrawer,
  toggleMetadataDrawer,
  toggleSettingsDrawer,
  toggleExportDrawer,
} from '@store/slices/uiSlice';
import { deidentifyAllFiles } from '@store/slices/dicomThunks';
import {
  toggleSync,
  resetViewports,
  nextSlice,
  previousSlice,
  updateLeftViewport,
  updateRightViewport,
} from '@store/slices/viewerSlice';
import { setCurrentFileIndex } from '@store/slices/dicomSlice';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: 'file' | 'view' | 'navigation' | 'help';
}

export const useKeyboardShortcuts = () => {
  const dispatch = useAppDispatch();
  const { originalFiles, deidentifiedFiles, isProcessing, currentFileIndex } = useAppSelector((state) => state.dicom);
  const { sync, leftViewer } = useAppSelector((state) => state.viewer);

  const hasFiles = originalFiles.length > 0;
  const hasDeidentified = deidentifiedFiles.length > 0;

  const shortcuts: ShortcutConfig[] = [
    // File Operations
    {
      key: 'u',
      ctrl: true,
      action: () => dispatch(toggleUploadDrawer()),
      description: 'Upload DICOM files',
      category: 'file',
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {
        if (hasFiles && !isProcessing) {
          dispatch(deidentifyAllFiles());
        }
      },
      description: 'Deidentify files',
      category: 'file',
    },
    {
      key: 'e',
      ctrl: true,
      action: () => {
        if (hasDeidentified) {
          dispatch(toggleExportDrawer());
        }
      },
      description: 'Export files',
      category: 'file',
    },

    // View Operations
    {
      key: 'm',
      ctrl: true,
      action: () => dispatch(toggleMetadataDrawer()),
      description: 'Open metadata comparison',
      category: 'view',
    },
    {
      key: ',',
      ctrl: true,
      action: () => dispatch(toggleSettingsDrawer()),
      description: 'Open settings',
      category: 'view',
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      action: () => dispatch(toggleSync()),
      description: 'Toggle viewer synchronization',
      category: 'view',
    },
    {
      key: 'r',
      ctrl: true,
      shift: true,
      action: () => dispatch(resetViewports()),
      description: 'Reset viewports',
      category: 'view',
    },

    // Navigation
    {
      key: 'ArrowUp',
      action: () => {
        if (hasFiles) {
          dispatch(previousSlice());
        }
      },
      description: 'Previous slice',
      category: 'navigation',
    },
    {
      key: 'ArrowDown',
      action: () => {
        if (hasFiles) {
          dispatch(nextSlice());
        }
      },
      description: 'Next slice',
      category: 'navigation',
    },
    {
      key: 'ArrowLeft',
      action: () => {
        if (hasFiles && originalFiles.length > 1) {
          const prevIndex = currentFileIndex > 0 ? currentFileIndex - 1 : originalFiles.length - 1;
          dispatch(setCurrentFileIndex(prevIndex));
        }
      },
      description: 'Previous file',
      category: 'navigation',
    },
    {
      key: 'ArrowRight',
      action: () => {
        if (hasFiles && originalFiles.length > 1) {
          const nextIndex = currentFileIndex < originalFiles.length - 1 ? currentFileIndex + 1 : 0;
          dispatch(setCurrentFileIndex(nextIndex));
        }
      },
      description: 'Next file',
      category: 'navigation',
    },

    // Help
    {
      key: '?',
      shift: true,
      action: () => {
        // This will be handled by the shortcuts modal component
        window.dispatchEvent(new CustomEvent('open-shortcuts-modal'));
      },
      description: 'Show keyboard shortcuts',
      category: 'help',
    },

    // Zoom Controls
    {
      key: '=',
      action: () => {
        if (hasFiles) {
          const newScale = Math.min(10, leftViewer.viewport.scale + 0.25);
          dispatch(updateLeftViewport({ scale: newScale }));
          if (sync.isEnabled && sync.syncZoom) {
            dispatch(updateRightViewport({ scale: newScale }));
          }
        }
      },
      description: 'Zoom in',
      category: 'view',
    },
    {
      key: '-',
      action: () => {
        if (hasFiles) {
          const newScale = Math.max(0.1, leftViewer.viewport.scale - 0.25);
          dispatch(updateLeftViewport({ scale: newScale }));
          if (sync.isEnabled && sync.syncZoom) {
            dispatch(updateRightViewport({ scale: newScale }));
          }
        }
      },
      description: 'Zoom out',
      category: 'view',
    },
    {
      key: '0',
      action: () => {
        if (hasFiles) {
          dispatch(updateLeftViewport({ scale: 1.0 }));
          if (sync.isEnabled && sync.syncZoom) {
            dispatch(updateRightViewport({ scale: 1.0 }));
          }
        }
      },
      description: 'Reset zoom to 100%',
      category: 'view',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle arrow keys for file navigation directly
      if (event.key === 'ArrowLeft' && hasFiles && originalFiles.length > 1) {
        event.preventDefault();
        const prevIndex = currentFileIndex > 0 ? currentFileIndex - 1 : originalFiles.length - 1;
        dispatch(setCurrentFileIndex(prevIndex));
        return;
      }

      if (event.key === 'ArrowRight' && hasFiles && originalFiles.length > 1) {
        event.preventDefault();
        const nextIndex = currentFileIndex < originalFiles.length - 1 ? currentFileIndex + 1 : 0;
        dispatch(setCurrentFileIndex(nextIndex));
        return;
      }

      // Handle other shortcuts
      for (const shortcut of shortcuts) {
        const keyMatch = event.key === shortcut.key;
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, hasFiles, hasDeidentified, isProcessing, sync.isEnabled, sync.syncZoom, originalFiles.length, currentFileIndex, originalFiles, leftViewer.viewport.scale, shortcuts]);

  return shortcuts;
};

export const getShortcutDisplay = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');

  const keyDisplay = shortcut.key === 'ArrowUp' ? '↑'
    : shortcut.key === 'ArrowDown' ? '↓'
    : shortcut.key === 'ArrowLeft' ? '←'
    : shortcut.key === 'ArrowRight' ? '→'
    : shortcut.key.toUpperCase();

  parts.push(keyDisplay);

  return parts.join(' + ');
};
