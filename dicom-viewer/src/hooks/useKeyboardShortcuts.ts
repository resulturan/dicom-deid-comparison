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
} from '@store/slices/viewerSlice';

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
  const { originalFiles, deidentifiedFiles, isProcessing } = useAppSelector((state) => state.dicom);
  const { sync } = useAppSelector((state) => state.viewer);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFiles, hasDeidentified, isProcessing, sync.isEnabled]);

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
