import { useState, useEffect } from 'react';
import MainLayout from '@components/Layout/MainLayout';
import DualViewerContainer from '@components/Viewers/DualViewerContainer';
import DicomUploader from '@components/Upload/DicomUploader';
import NotificationHandler from '@components/Layout/NotificationHandler';
import LoadingOverlay from '@components/Layout/LoadingOverlay';
import DeidentificationSettings from '@components/Controls/DeidentificationSettings';
import MetadataDrawer from '@components/Metadata/MetadataDrawer';
import ExportDrawer from '@components/Export/ExportDrawer';
import ShortcutsModal from '@components/Help/ShortcutsModal';
import ErrorBoundary from '@components/ErrorBoundary/ErrorBoundary';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';

function App() {
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Listen for shortcuts modal open event
  useEffect(() => {
    const handleOpenShortcutsModal = () => {
      setShortcutsModalOpen(true);
    };

    window.addEventListener('shortcuts-modal-requested', handleOpenShortcutsModal);
    return () => window.removeEventListener('shortcuts-modal-requested', handleOpenShortcutsModal);
  }, []);

  return (
    <ErrorBoundary>
      <MainLayout>
        <DualViewerContainer />
        <DicomUploader />
        <DeidentificationSettings />
        <MetadataDrawer />
        <ExportDrawer />
        <ShortcutsModal open={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
        <NotificationHandler />
        <LoadingOverlay />
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
