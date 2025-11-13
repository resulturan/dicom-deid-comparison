import MainLayout from '@components/Layout/MainLayout';
import DualViewerContainer from '@components/Viewers/DualViewerContainer';
import DicomUploader from '@components/Upload/DicomUploader';

function App() {
  return (
    <MainLayout>
      <DualViewerContainer />
      <DicomUploader />
    </MainLayout>
  );
}

export default App;
