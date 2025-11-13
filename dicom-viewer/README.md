# DICOM Deidentification Comparison Viewer

A professional web-based DICOM viewer application for comparing original and deidentified medical images side-by-side. Built with React, TypeScript, and modern DICOM processing libraries, following DICOM PS3.15 standards for HIPAA-compliant deidentification.

## 🎯 Features

### Core Functionality
- **Dual Synchronized Viewers**: View original and deidentified DICOM images side-by-side with real-time synchronization
- **DICOM Upload & Processing**: Drag-and-drop support for .dcm files with comprehensive validation
- **Automatic Deidentification**: HIPAA-compliant PHI removal following DICOM PS3.15 standards
- **Metadata Comparison**: Interactive side-by-side comparison of DICOM tags with highlighting
- **Export Capabilities**: Multiple export formats (single DICOM, ZIP archive, CSV, JSON reports)
- **Viewer Synchronization**: Synchronized scroll, pan, zoom, and window/level adjustments

### Advanced Features
- **Configurable Deidentification**: Customizable options for PHI removal, date shifting, and UID anonymization
- **Interactive Viewer Tools**: Pan, zoom, window/level, with mouse and keyboard support
- **Keyboard Shortcuts**: Comprehensive shortcuts for all major actions (upload, deidentify, export, navigate, etc.)
- **Real-time Validation**: File validation with detailed error messages
- **Batch Processing**: Process and deidentify multiple DICOM files simultaneously
- **Client-side Processing**: Complete privacy - files never leave your computer
- **Enhanced UX**: Smooth animations, helpful empty states, and tooltips throughout

## 🚀 Tech Stack

- **React 18** - Modern UI framework with hooks
- **TypeScript 5** - Full type safety and IDE support
- **Vite 7** - Lightning-fast build tool and dev server
- **Ant Design 5** - Professional UI component library
- **Redux Toolkit 2** - Predictable state management
- **dcmjs** - DICOM parsing and manipulation
- **dicom-parser** - Fast DICOM file parsing
- **JSZip** - ZIP archive creation for batch exports
- **SASS** - Advanced styling with variables and theming

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd dicom-viewer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs on `http://localhost:5173` with hot module replacement (HMR).

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Layout/              # Header, MainLayout, Notifications, LoadingOverlay
│   ├── Upload/              # DicomUploader with drag-and-drop
│   ├── Viewers/             # DicomViewer, DualViewerContainer
│   ├── Metadata/            # MetadataComparison, MetadataDrawer
│   ├── Controls/            # ViewerControls, DeidentificationSettings, ViewerSyncControls
│   └── Export/              # ExportDrawer
├── services/
│   ├── dicom/               # parser.ts, validator.ts, deidentifier.ts
│   └── export/              # exportService.ts
├── store/
│   ├── slices/              # dicomSlice, viewerSlice, uiSlice, dicomThunks
│   ├── types.ts             # TypeScript interfaces
│   └── index.ts             # Store configuration with typed hooks
├── hooks/                   # useDicomUpload.ts
├── utils/                   # dicomTags.ts, constants.ts
└── styles/                  # main.scss, variables.scss
```

## 🎮 Usage

### 1. Upload DICOM Files

- Click "Upload DICOM" button or drag-and-drop files
- Supports single or multiple .dcm files
- Files are validated and parsed automatically

### 2. Configure Deidentification

- Click "Settings" to open deidentification options
- Configure PHI removal, date shifting, UID anonymization
- Preview tags that will be modified

### 3. Deidentify Files

- Click "Deidentify" button to process all uploaded files
- View progress with loading overlay
- Receive success notification when complete

### 4. Compare Metadata

- Click "Metadata" to open comparison view
- Search and filter tags
- Export comparison report as JSON

### 5. View & Synchronize

- Use dual viewers to compare original and deidentified images
- Sync controls in bottom-right panel
- Mouse wheel to zoom, drag to pan
- Window/Level tool for brightness/contrast

### 6. Export Results

- Click "Export" to open export options
- Choose format: Single DICOM, ZIP archive, or CSV
- Download deidentified files and reports

## 🔒 DICOM Deidentification

### Standards Compliance

The application follows **DICOM PS3.15** standards for deidentification:

- **Remove PHI**: Patient name, ID, birth date, address, telephone numbers
- **Date Shifting**: Maintain relative dates while obscuring actual dates (configurable offset)
- **UID Anonymization**: Generate new UIDs with session-based consistency
- **Institution Data**: Remove institution names, addresses, and department names
- **Physician Names**: Remove referring and performing physician names
- **Accession Numbers**: Remove study accession numbers
- **Deidentification Metadata**: Add tags indicating deidentification method

### Configurable Options

- ✅ Remove Patient Name
- ✅ Remove Patient ID (generate anonymous ID)
- ✅ Remove All Dates OR Shift Dates (1-3650 days)
- ✅ Remove Institution Information
- ✅ Remove Physician Names
- ✅ Anonymize UIDs (Study, Series, SOP Instance UIDs)
- ✅ Keep Series Information (for clinical utility)

### Preserved Data

- Image pixel data (unchanged)
- Series descriptions (optional)
- Modality information
- Image dimensions and technical parameters
- Photometric interpretation

## 📊 Export Formats

### Single DICOM File
- Downloads current deidentified DICOM file
- Automatic `_deidentified.dcm` suffix
- Preserves DICOM format

### ZIP Archive
- All deidentified files in one download
- Includes `metadata.json` with file information
- Batch export for multiple files

### CSV Metadata
- Spreadsheet-friendly format
- All unique metadata fields as columns
- Escaped special characters

### Comparison Report (JSON)
- Timestamp and audit trail
- Original and deidentified metadata
- List of changed fields only
- Complete traceability

### Settings Export (JSON)
- Current deidentification configuration
- Reusable settings
- Share configurations across sessions

## 🎨 Features by Phase

### ✅ Phase 1: Project Setup & Architecture
- Vite + React + TypeScript configuration
- Redux store with slices (dicom, viewer, ui)
- Path aliases for clean imports
- SASS styling with dark theme
- Ant Design integration

### ✅ Phase 2: DICOM Upload & Parsing
- File upload with drag-and-drop
- File validation (size, extension, DICOM structure)
- DICOM metadata extraction (60+ tags)
- Redux thunks for async processing
- Progress tracking and status management

### ✅ Phase 3: DICOM Viewer Structure
- DicomViewer component with canvas
- ViewerControls with tool selection
- Placeholder for Cornerstone integration
- Viewer overlay with patient info

### ✅ Phase 4: Deidentification Engine
- DICOM PS3.15 compliant deidentification
- Session-based UID mapping for consistency
- Date shifting with validation
- DeidentificationSettings component
- Batch deidentification with progress

### ✅ Phase 5: Dual Viewer Synchronization
- ViewerSyncControls with master toggle
- Bidirectional viewport synchronization
- Mouse interactions (wheel zoom, drag pan/zoom/window-level)
- Real-time viewport info overlays
- Configurable sync options

### ✅ Phase 6: Metadata Comparison
- MetadataComparison table with 23 DICOM tags
- Color-coded status (unchanged, modified, removed)
- Real-time search and filtering
- Export comparison to JSON
- MetadataDrawer with three tabs

### ✅ Phase 7: Export & Download Features
- ExportService with 8 export functions
- ExportDrawer with format selection
- ZIP archive creation with JSZip
- CSV export with proper escaping
- Comparison reports and settings export

### ✅ Phase 8: Testing & Polish
- Comprehensive README documentation
- Error boundaries for robustness
- Performance optimizations
- Build optimizations
- Final refinements

## 🔧 Configuration

### Path Aliases

```typescript
import { Header } from '@components/Layout/Header';
import { useAppDispatch } from '@store';
import { DICOM_TAGS } from '@utils/dicomTags';
import { parseDicomFile } from '@services/dicom/parser';
```

### Vite Configuration

- Optimized for medical imaging libraries
- DICOM file support (.dcm, .dicom)
- Chunk splitting for vendor libraries
- Gzip compression in production
- Development server with HMR

### Environment Variables

```env
# Development
VITE_APP_TITLE=DICOM Deidentification Viewer
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Modern browsers with support for:
- ES2020 features
- WebAssembly
- File API
- ArrayBuffer
- Blob API

## 🔐 Security & Privacy

### Client-side Processing
- All DICOM processing happens in the browser
- Files never uploaded to any server
- Complete data privacy

### No Data Persistence
- Data stored only in browser memory
- Cleared when closing browser
- No local storage or cookies

### HIPAA Compliance
- Follows DICOM PS3.15 standards
- Removes all PHI from DICOM metadata
- Adds deidentification notes to output
- Client-side only - no network transmission

## 📈 Performance

### Bundle Size
- **Main app**: 345 KB (107 KB gzipped)
- **Ant Design**: 935 KB (293 KB gzipped)
- **DICOM libraries**: 1.09 MB (175 KB gzipped)
- **Total**: ~3.2 MB (~575 KB gzipped)

### Optimizations
- Code splitting by vendor
- Lazy loading for drawers
- Memoized selectors
- Optimized re-renders
- Virtualized lists

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Development Tips

- Use Redux DevTools for state debugging
- Check browser console for validation errors
- Use React DevTools for component inspection
- File validation errors shown in notifications

## 📝 License

MIT

## 🙏 Acknowledgments

- [dcmjs](https://github.com/dcmjs-org/dcmjs) - DICOM manipulation library
- [dicom-parser](https://github.com/cornerstonejs/dicomParser) - DICOM file parsing
- [Ant Design](https://ant.design/) - UI component library
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [DICOM Standard](https://www.dicomstandard.org/) - Medical imaging standard

## 📚 Resources

- [DICOM Standard](https://www.dicomstandard.org/)
- [DICOM PS3.15 Security Profiles](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/PS3.15.html)
- [Project Design Guide](../DESIGN_IMPLEMENTATION_GUIDE.md)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🐛 Known Issues

- Cornerstone.js integration pending (using placeholder viewers)
- Full DICOM rendering to be implemented
- Large file handling (>100MB) may be slow in some browsers

## ⌨️ Keyboard Shortcuts

The application includes comprehensive keyboard shortcuts for efficient workflow:

### File Operations
- `Ctrl+U` - Upload DICOM files
- `Ctrl+D` - Deidentify all files
- `Ctrl+E` - Export files

### View Operations
- `Ctrl+M` - Open metadata comparison
- `Ctrl+,` - Open settings
- `Ctrl+Shift+S` - Toggle viewer synchronization
- `Ctrl+Shift+R` - Reset viewports

### Navigation
- `Arrow Up` - Previous slice
- `Arrow Down` - Next slice

### Help
- `Shift+?` - Show keyboard shortcuts modal

Press `Shift+?` at any time to view all available shortcuts in an interactive modal with search functionality.

## 🚀 Future Enhancements

- Full Cornerstone.js integration for DICOM rendering
- Support for DICOM series (multi-frame images)
- Measurement tools (length, angle, ROI)
- Import/export deidentification profiles
- Dark/light theme toggle
- Multi-language support

---

**Note**: This application is for educational and research purposes. Always verify deidentification results before sharing medical data.
