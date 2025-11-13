import MainLayout from '@components/Layout/MainLayout';
import DualViewerContainer from '@components/Viewers/DualViewerContainer';
import DicomUploader from '@components/Upload/DicomUploader';
import NotificationHandler from '@components/Layout/NotificationHandler';
import LoadingOverlay from '@components/Layout/LoadingOverlay';
import DeidentificationSettings from '@components/Controls/DeidentificationSettings';

function App() {
  return (
    <MainLayout>
      <DualViewerContainer />
      <DicomUploader />
      <DeidentificationSettings />
      <NotificationHandler />
      <LoadingOverlay />
    </MainLayout>
  );
}

export default App;
