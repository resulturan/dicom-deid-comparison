/**
 * Metadata Drawer Component
 * Displays metadata comparison in a drawer
 */

import { Drawer, Tabs, Empty, Typography } from 'antd';
import { FileTextOutlined, SwapOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@store';
import { closeMetadataDrawer } from '@store/slices/uiSlice';
import MetadataComparison from './MetadataComparison';

const { Text } = Typography;
const { TabPane } = Tabs;

const MetadataDrawer = () => {
  const dispatch = useAppDispatch();
  const { metadataDrawerOpen } = useAppSelector((state) => state.ui);
  const { originalFiles, deidentifiedFiles, currentFileIndex } = useAppSelector((state) => state.dicom);

  const currentOriginalFile = originalFiles[currentFileIndex];
  const currentDeidentifiedFile = deidentifiedFiles[currentFileIndex];

  const hasOriginalMetadata = currentOriginalFile?.metadata;
  const hasDeidentifiedMetadata = currentDeidentifiedFile?.metadata;
  const hasComparison = hasOriginalMetadata && hasDeidentifiedMetadata;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined />
          <span>DICOM Metadata</span>
        </div>
      }
      placement="right"
      width={900}
      onClose={() => dispatch(closeMetadataDrawer())}
      open={metadataDrawerOpen}
    >
      {!hasOriginalMetadata ? (
        <Empty
          description={
            <Text style={{ color: '#888' }}>
              No metadata available. Upload and process DICOM files first.
            </Text>
          }
        />
      ) : (
        <Tabs defaultActiveKey="comparison" style={{ height: '100%' }}>
          {/* Comparison View */}
          <TabPane
            tab={
              <span>
                <SwapOutlined />
                Comparison
              </span>
            }
            key="comparison"
          >
            {hasComparison ? (
              <MetadataComparison
                originalMetadata={currentOriginalFile.metadata!}
                deidentifiedMetadata={currentDeidentifiedFile.metadata!}
              />
            ) : (
              <Empty
                description={
                  <Text style={{ color: '#888' }}>
                    No deidentified metadata available. Click "Deidentify" to create deidentified versions.
                  </Text>
                }
              />
            )}
          </TabPane>

          {/* Original Metadata View */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Original
              </span>
            }
            key="original"
          >
            <div style={{ padding: '16px 0' }}>
              <pre style={{ color: '#ccc', fontSize: 12, background: '#1a1a1a', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(currentOriginalFile.metadata, null, 2)}
              </pre>
            </div>
          </TabPane>

          {/* Deidentified Metadata View */}
          {hasDeidentifiedMetadata && (
            <TabPane
              tab={
                <span>
                  <FileTextOutlined />
                  Deidentified
                </span>
              }
              key="deidentified"
            >
              <div style={{ padding: '16px 0' }}>
                <pre style={{ color: '#ccc', fontSize: 12, background: '#1a1a1a', padding: 16, borderRadius: 4 }}>
                  {JSON.stringify(currentDeidentifiedFile.metadata, null, 2)}
                </pre>
              </div>
            </TabPane>
          )}
        </Tabs>
      )}
    </Drawer>
  );
};

export default MetadataDrawer;
