import type { ReactNode } from 'react';
import { Layout } from 'antd';
import Header from './Header';
import '@styles/main.scss';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content
        style={{
          padding: 0,
          background: '#000',
          overflow: 'hidden',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
