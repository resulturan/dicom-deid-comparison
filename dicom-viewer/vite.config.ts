import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// For GitHub Pages: base should be '/repository-name/' (with trailing slash)
// Set VITE_BASE_PATH env variable or it defaults to '/dicom-deid-comparison/'
const basePath = process.env.VITE_BASE_PATH || '/dicom-deid-comparisonv2/';
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? basePath : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Increase chunk size warning limit for medical imaging libraries
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-antd': ['antd'],
          'vendor-dicom': ['@cornerstonejs/core', '@cornerstonejs/tools', 'dcmjs', 'dicom-parser'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@cornerstonejs/core',
      '@cornerstonejs/tools',
      'dcmjs',
      'dicom-parser',
    ],
  },
  // Handle DICOM file imports
  assetsInclude: ['**/*.dcm', '**/*.dicom'],
})
