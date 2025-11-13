import { Row, Col, Card, Typography, Empty } from 'antd';
import { EyeOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAppSelector } from '@store';

const { Title, Text } = Typography;

const DualViewerContainer = () => {
  const { originalFiles } = useAppSelector((state) => state.dicom);
  const hasFiles = originalFiles.length > 0;

  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '16px', background: '#000' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* Original Viewer */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', background: '#1a1a1a' }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOutlined />
                <span>Original DICOM</span>
              </div>
            }
          >
            {!hasFiles ? (
              <Empty
                description={
                  <Text style={{ color: '#888' }}>
                    Upload DICOM files to start viewing
                  </Text>
                }
              />
            ) : (
              <div style={{ color: '#fff', textAlign: 'center' }}>
                <Title level={4} style={{ color: '#888' }}>
                  Viewer will be implemented in Phase 3
                </Title>
                <Text style={{ color: '#666' }}>
                  {originalFiles.length} file(s) uploaded
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Deidentified Viewer */}
        <Col span={12} style={{ height: '100%' }}>
          <Card
            style={{ height: '100%', background: '#1a1a1a' }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyOutlined />
                <span>Deidentified DICOM</span>
              </div>
            }
          >
            {!hasFiles ? (
              <Empty
                description={
                  <Text style={{ color: '#888' }}>
                    Upload DICOM files to start viewing
                  </Text>
                }
              />
            ) : (
              <div style={{ color: '#fff', textAlign: 'center' }}>
                <Title level={4} style={{ color: '#888' }}>
                  Deidentified viewer will be implemented in Phase 5
                </Title>
                <Text style={{ color: '#666' }}>
                  Synchronized with original viewer
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DualViewerContainer;
