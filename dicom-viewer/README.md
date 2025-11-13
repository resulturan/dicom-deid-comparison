# DICOM Deidentification Comparison Viewer

A web-based DICOM viewer application that displays medical images side-by-side, comparing original DICOM files with their deidentified versions. Built with React, TypeScript, and Cornerstone.js.

## Features

- **Dual Synchronized Viewers**: View original and deidentified DICOM images side-by-side
- **DICOM Upload**: Drag-and-drop support for .dcm and .dicom files
- **Automatic Deidentification**: Remove PHI (Protected Health Information) from DICOM metadata
- **Metadata Comparison**: View and compare original vs deidentified DICOM tags
- **Synchronized Navigation**: Scroll, pan, and zoom both viewers in sync
- **Export Functionality**: Export deidentified DICOM files
- **HIPAA Compliant**: Client-side processing, no server uploads

## Tech Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 7** - Build tool and dev server
- **Ant Design 5** - UI component library
- **Redux Toolkit 2** - State management
- **Cornerstone.js** - DICOM rendering engine
- **dcmjs** - DICOM parsing and manipulation
- **SASS** - Styling

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server runs on `http://localhost:3000` with hot module replacement (HMR).

## Project Structure

```
src/
├── components/
│   ├── Layout/          # Header, MainLayout
│   ├── Upload/          # DICOM file upload components
│   ├── Viewers/         # DICOM viewer components
│   ├── Metadata/        # Metadata comparison components
│   └── Controls/        # Viewer controls
├── services/
│   ├── dicom/          # DICOM parsing, deidentification
│   └── api/            # API services (RTK Query)
├── store/
│   ├── slices/         # Redux slices
│   │   ├── dicomSlice.ts
│   │   ├── viewerSlice.ts
│   │   └── uiSlice.ts
│   ├── types.ts        # TypeScript type definitions
│   └── index.ts        # Store configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and constants
└── styles/             # SASS styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Phase

### ✅ Phase 1: Project Setup (Completed)
- Vite + React + TypeScript configuration
- Redux store with slices
- Basic UI layout
- SASS styling setup

### 🚧 Phase 2: DICOM Upload & Parsing (In Progress)
- File upload with validation
- DICOM metadata extraction
- File list management

### 📋 Upcoming Phases
- Phase 3: Single OHIF Viewer Integration
- Phase 4: Deidentification Engine
- Phase 5: Dual Viewer Implementation
- Phase 6: Metadata Comparison
- Phase 7: Export & Advanced Features
- Phase 8: Testing & Polish

## Configuration

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { Header } from '@components/Layout/Header';
import { store } from '@store';
import { DICOM_TAGS } from '@utils/dicomTags';
```

### Vite Configuration

- Optimized for medical imaging libraries
- DICOM file support (.dcm, .dicom)
- Chunk splitting for better caching
- Development server on port 3000

## DICOM Deidentification

The application follows DICOM PS3.15 standards for deidentification:

- **Remove PHI**: Patient name, ID, birth date, address, etc.
- **Date Shifting**: Maintain relative dates while removing actual dates
- **UID Anonymization**: Generate new UIDs while maintaining relationships
- **Institution Data**: Remove institution names and addresses
- **Physician Names**: Remove referring and performing physician names

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security & Privacy

- **Client-side processing**: All DICOM processing happens in the browser
- **No server uploads**: Files never leave your computer
- **Local storage only**: Data stored only in browser memory
- **Clear on exit**: Automatically clear data when closing

## License

MIT

## Contributing

This project is part of a DICOM deidentification research initiative. For questions or contributions, please refer to the main project documentation.

## Acknowledgments

- [OHIF Viewer](https://ohif.org/) - Medical imaging platform
- [Cornerstone.js](https://www.cornerstonejs.org/) - DICOM rendering
- [dcmjs](https://github.com/dcmjs-org/dcmjs) - DICOM manipulation
- [Ant Design](https://ant.design/) - UI components

## Resources

- [DICOM Standard](https://www.dicomstandard.org/)
- [DICOM PS3.15 Security Profiles](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/PS3.15.html)
- [Project Design Guide](../DESIGN_IMPLEMENTATION_GUIDE.md)
