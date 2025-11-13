import MainLayout from '@components/Layout/MainLayout';
import DualViewerContainer from '@components/Viewers/DualViewerContainer';
import DicomUploader from '@components/Upload/DicomUploader';
import NotificationHandler from '@components/Layout/NotificationHandler';
import LoadingOverlay from '@components/Layout/LoadingOverlay';

function App() {
  return (
    <MainLayout>
      <DualViewerContainer />
      <DicomUploader />
      <NotificationHandler />
      <LoadingOverlay />
    </MainLayout>
  );
}

export default App;
