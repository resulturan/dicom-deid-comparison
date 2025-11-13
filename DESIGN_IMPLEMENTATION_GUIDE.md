# DICOM Deidentification Comparison Viewer
## Design and Implementation Guide

---

## 1. Project Overview

### 1.1 Purpose
A web-based application that allows users to upload DICOM medical images and view them side-by-side in two synchronized viewers:
- **Left Viewer**: Original DICOM images with all metadata intact
- **Right Viewer**: Deidentified version with PHI (Protected Health Information) removed

### 1.2 Key Features
- Dual synchronized DICOM viewers
- DICOM file/folder upload functionality
- Automatic deidentification of DICOM metadata
- Synchronized scrolling and navigation between viewers
- Metadata comparison view
- Export deidentified DICOM files
- Responsive design for various screen sizes

### 1.3 Target Users
- Healthcare professionals
- Medical researchers
- DICOM administrators
- Privacy compliance officers

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Ant Design** | UI Components | 5.x |
| **Redux Toolkit** | State Management | 2.x |
| **RTK Query** | Data Fetching | Included in RTK |
| **SASS** | Styling | Latest |
| **OHIF Viewer** | DICOM Rendering | 3.x |

### 2.2 Additional Libraries

```json
{
  "dependencies": {
    "@ohif/viewer": "^3.7.0",
    "@cornerstonejs/core": "^1.x",
    "@cornerstonejs/tools": "^1.x",
    "dicom-parser": "^1.8.x",
    "dcmjs": "^0.29.x",
    "antd": "^5.x",
    "@reduxjs/toolkit": "^2.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x"
  }
}
```

### 2.3 Why These Technologies?

- **OHIF Viewer**: Industry-standard, open-source DICOM viewer with extensive features
- **Redux Toolkit + RTK Query**: Simplified state management with built-in API caching
- **Ant Design**: Enterprise-grade UI components with excellent TypeScript support
- **dcmjs**: Robust DICOM parsing and manipulation library
- **TypeScript**: Type safety for medical imaging applications is critical

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐                    ┌──────────────┐  │
│  │   Original   │   Synchronized     │ Deidentified │  │
│  │    Viewer    │ ◄────────────────► │    Viewer    │  │
│  │   (OHIF)     │   Scroll/Pan/Zoom  │    (OHIF)    │  │
│  └──────────────┘                    └──────────────┘  │
│         │                                     │         │
│         └──────────────┬──────────────────────┘         │
│                        ▼                                │
│              ┌──────────────────┐                       │
│              │  Redux Store     │                       │
│              │  - DICOM Data    │                       │
│              │  - UI State      │                       │
│              │  - Viewer Sync   │                       │
│              └──────────────────┘                       │
│                        │                                │
│              ┌─────────▼─────────┐                      │
│              │  DICOM Service    │                      │
│              │  - Parse          │                      │
│              │  - Deidentify     │                      │
│              │  - Export         │                      │
│              └───────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

```
src/
├── App.tsx
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── Footer.tsx
│   ├── Upload/
│   │   ├── DicomUploader.tsx
│   │   ├── FileList.tsx
│   │   └── UploadProgress.tsx
│   ├── Viewers/
│   │   ├── DualViewerContainer.tsx
│   │   ├── OriginalViewer.tsx
│   │   ├── DeidentifiedViewer.tsx
│   │   └── ViewerSync.tsx
│   ├── Metadata/
│   │   ├── MetadataPanel.tsx
│   │   ├── MetadataComparison.tsx
│   │   └── TagList.tsx
│   └── Controls/
│       ├── ViewerControls.tsx
│       ├── DeidentificationOptions.tsx
│       └── ExportControls.tsx
├── services/
│   ├── dicom/
│   │   ├── parser.ts
│   │   ├── deidentifier.ts
│   │   ├── exporter.ts
│   │   └── validator.ts
│   └── api/
│       └── dicomApi.ts (RTK Query)
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── dicomSlice.ts
│   │   ├── viewerSlice.ts
│   │   └── uiSlice.ts
│   └── types.ts
├── hooks/
│   ├── useDicomViewer.ts
│   ├── useViewerSync.ts
│   └── useDeidentification.ts
├── utils/
│   ├── dicomTags.ts
│   ├── deidentificationRules.ts
│   └── constants.ts
└── styles/
    ├── main.scss
    ├── variables.scss
    └── components/
```

---

## 4. Core Features Implementation

### 4.1 DICOM Upload System

#### Features:
- Drag-and-drop file upload
- Directory/folder upload support
- Multiple file selection
- Upload progress tracking
- File validation

#### Implementation:
```typescript
// DicomUploader.tsx
interface DicomFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  metadata?: DicomMetadata;
}

// Key functionality:
- Accept .dcm, .dicom files
- Parse DICOM metadata on client-side
- Store parsed data in Redux
- Validate DICOM structure
```

### 4.2 DICOM Parsing & Deidentification

#### Deidentification Strategy:

**DICOM Tags to Remove/Modify:**
- Patient Name (0010,0010)
- Patient ID (0010,0020)
- Patient Birth Date (0010,0030)
- Patient Address (0010,1040)
- Institution Name (0008,0080)
- Physician Names (0008,0090)
- Study Date/Time (0008,0020, 0008,0030)
- And ~100 other PHI-related tags per DICOM PS3.15

#### Implementation Approach:
```typescript
// deidentifier.ts
export class DicomDeidentifier {
  // Basic deidentification (remove tags)
  basicDeidentify(dataset: DicomDataset): DicomDataset;

  // Advanced deidentification (anonymization)
  advancedDeidentify(dataset: DicomDataset, options: DeidentifyOptions): DicomDataset;

  // Date shifting (maintain relative dates)
  shiftDates(dataset: DicomDataset, offset: number): DicomDataset;

  // Burn-in pixel data deidentification
  removePixelText(imageData: ArrayBuffer): ArrayBuffer;
}
```

### 4.3 Dual Viewer System

#### Synchronization Features:
- **Scroll Sync**: Both viewers scroll to same slice index
- **Pan Sync**: Pan movements mirrored
- **Zoom Sync**: Zoom level synchronized
- **Window/Level Sync**: Brightness/contrast matched
- **Tool Sync**: Measurements and annotations

#### Implementation:
```typescript
// ViewerSync.tsx
interface ViewerSyncState {
  isEnabled: boolean;
  syncScroll: boolean;
  syncPan: boolean;
  syncZoom: boolean;
  syncWindowLevel: boolean;
}

// Event listeners on both OHIF viewers
- Listen for viewport changes
- Dispatch actions to Redux
- Update counterpart viewer
```

### 4.4 Metadata Comparison View

#### Features:
- Side-by-side tag comparison
- Highlight removed tags
- Highlight modified tags
- Search/filter tags
- Export comparison report

#### Layout:
```
┌────────────────────────────────────────┐
│  Metadata Comparison                   │
├────────────┬─────────────┬─────────────┤
│ Tag        │ Original    │ Deidentified│
├────────────┼─────────────┼─────────────┤
│ Patient    │ John Doe    │ [REMOVED]   │
│ Patient ID │ 12345       │ ANON-001    │
│ Study Date │ 2024-01-15  │ [SHIFTED]   │
└────────────┴─────────────┴─────────────┘
```

---

## 5. State Management Design

### 5.1 Redux Store Structure

```typescript
interface RootState {
  dicom: DicomState;
  viewer: ViewerState;
  ui: UIState;
}

interface DicomState {
  originalFiles: DicomFile[];
  deidentifiedFiles: DicomFile[];
  currentFileIndex: number;
  metadata: {
    original: DicomMetadata;
    deidentified: DicomMetadata;
  };
  deidentificationOptions: DeidentifyOptions;
}

interface ViewerState {
  leftViewer: {
    currentSlice: number;
    viewport: Viewport;
    tools: ToolState;
  };
  rightViewer: {
    currentSlice: number;
    viewport: Viewport;
    tools: ToolState;
  };
  sync: ViewerSyncState;
}

interface UIState {
  uploadDrawerOpen: boolean;
  metadataDrawerOpen: boolean;
  loading: boolean;
  errors: string[];
}
```

### 5.2 Key Redux Slices

**dicomSlice.ts:**
- Actions: uploadFiles, processFiles, deidentify, exportFiles
- Thunks: parseAndDeidentify, batchProcess

**viewerSlice.ts:**
- Actions: updateViewport, syncViewers, toggleSync, setCurrentSlice
- Middleware: viewerSyncMiddleware

**uiSlice.ts:**
- Actions: showDrawer, hideDrawer, setLoading, addError

---

## 6. Implementation Phases

### Phase 1: Project Setup & Basic Structure (Week 1)
**Tasks:**
- [ ] Initialize React + TypeScript project
- [ ] Install dependencies (Ant Design, Redux, SASS)
- [ ] Setup project structure
- [ ] Configure Redux store
- [ ] Create basic layout components
- [ ] Setup routing

**Deliverables:**
- Working dev environment
- Basic UI layout with Ant Design
- Redux store configured

---

### Phase 2: DICOM Upload & Parsing (Week 2)
**Tasks:**
- [ ] Implement file upload component
- [ ] Integrate dicom-parser library
- [ ] Create DICOM parsing service
- [ ] Store parsed data in Redux
- [ ] Display file list
- [ ] Add upload validation

**Deliverables:**
- Working file upload
- DICOM metadata extraction
- File list display

---

### Phase 3: Single OHIF Viewer Integration (Week 3)
**Tasks:**
- [ ] Integrate OHIF Viewer
- [ ] Configure Cornerstone for DICOM rendering
- [ ] Display uploaded DICOM in viewer
- [ ] Implement basic viewer controls
- [ ] Add series/slice navigation

**Deliverables:**
- Single working DICOM viewer
- Basic image manipulation tools

---

### Phase 4: Deidentification Engine (Week 4)
**Tasks:**
- [ ] Implement deidentification rules
- [ ] Create tag removal logic
- [ ] Implement date shifting
- [ ] Add anonymization options
- [ ] Test with various DICOM types

**Deliverables:**
- Working deidentification engine
- Configurable deidentification rules
- Unit tests for deidentification

---

### Phase 5: Dual Viewer Implementation (Week 5)
**Tasks:**
- [ ] Create dual viewer layout
- [ ] Clone viewer for deidentified display
- [ ] Implement viewer synchronization
- [ ] Add sync controls
- [ ] Test synchronization edge cases

**Deliverables:**
- Side-by-side viewers
- Working synchronization
- Sync toggle controls

---

### Phase 6: Metadata Comparison (Week 6)
**Tasks:**
- [ ] Create metadata panel component
- [ ] Implement tag comparison logic
- [ ] Add highlighting for changes
- [ ] Create search/filter functionality
- [ ] Add export comparison feature

**Deliverables:**
- Metadata comparison view
- Tag diff visualization
- Export functionality

---

### Phase 7: Export & Advanced Features (Week 7)
**Tasks:**
- [ ] Implement DICOM export (dcmjs)
- [ ] Add batch export
- [ ] Create export configuration
- [ ] Add preset deidentification profiles
- [ ] Implement user preferences

**Deliverables:**
- DICOM export functionality
- Batch processing
- User configuration

---

### Phase 8: Testing & Polish (Week 8)
**Tasks:**
- [ ] Unit tests for core services
- [ ] Integration tests for viewers
- [ ] E2E tests for workflows
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Documentation

**Deliverables:**
- Test coverage >80%
- Optimized performance
- User documentation

---

## 7. Technical Considerations

### 7.1 DICOM Format Handling

**Supported Transfer Syntaxes:**
- Implicit VR Little Endian
- Explicit VR Little Endian
- JPEG Baseline (compressed)
- JPEG 2000 (compressed)
- RLE Lossless

**File Size Considerations:**
- Client-side processing for files <100MB
- Consider web workers for large files
- Implement chunked processing for series

### 7.2 Browser Compatibility

**Target Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Key APIs Required:**
- File API
- ArrayBuffer
- Web Workers (optional)
- WebGL (for rendering)

### 7.3 Performance Optimization

**Strategies:**
- Lazy load DICOM files
- Use Web Workers for parsing
- Implement virtual scrolling for file lists
- Cache parsed metadata
- Optimize Redux updates
- Use React.memo for viewer components

### 7.4 Security & Privacy

**Considerations:**
- All processing happens client-side (no server uploads)
- Clear browser storage on exit
- No telemetry or analytics on PHI
- Secure export options
- Warning messages for sensitive operations

### 7.5 HIPAA Compliance Notes

**Important:**
- This is a client-side tool (no server storage)
- Users responsible for secure handling
- Deidentification follows DICOM PS3.15 guidelines
- No guarantee of 100% deidentification
- Recommend additional review for research use

---

## 8. User Interface Design

### 8.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Upload Button | Export | Settings       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │                     │  │                     │      │
│  │   Original Viewer   │  │ Deidentified Viewer │      │
│  │                     │  │                     │      │
│  │   (DICOM Display)   │  │   (DICOM Display)   │      │
│  │                     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
│  [◄] Slice 45/120 [►]     🔗 Sync ON  ⚙️ Options       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Metadata Panel (Collapsible)                           │
│  [Original] [Deidentified] [Comparison]                 │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Color Scheme

```scss
// variables.scss
$primary-color: #1890ff;      // Ant Design blue
$success-color: #52c41a;      // Green for deidentified
$warning-color: #faad14;      // Orange for modified
$error-color: #f5222d;        // Red for removed
$background: #f0f2f5;         // Light gray background
$viewer-bg: #000000;          // Black for DICOM viewers
```

### 8.3 Responsive Design

- Desktop (>1200px): Side-by-side viewers
- Tablet (768-1200px): Stacked viewers with tabs
- Mobile (<768px): Single viewer with toggle

---

## 9. Testing Strategy

### 9.1 Unit Tests
- DICOM parsing functions
- Deidentification logic
- Tag comparison utilities
- Redux reducers and actions

### 9.2 Integration Tests
- File upload flow
- Viewer synchronization
- Metadata extraction pipeline
- Export functionality

### 9.3 E2E Tests
- Complete deidentification workflow
- Multi-file processing
- Export and re-import validation

### 9.4 Test DICOM Datasets
- Use publicly available test datasets
- Include various modalities (CT, MRI, X-Ray)
- Test edge cases (missing tags, corrupted files)

---

## 10. Deployment

### 10.1 Build Configuration

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  }
}
```

### 10.2 Deployment Options

**Option 1: Static Hosting**
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

**Option 2: Docker Container**
- Nginx serving static files
- No backend required

### 10.3 Environment Variables

```env
VITE_APP_NAME=DICOM Deidentification Viewer
VITE_MAX_FILE_SIZE=104857600  # 100MB
VITE_ENABLE_ANALYTICS=false
```

---

## 11. Future Enhancements

### 11.1 Potential Features
- [ ] Burn-in pixel data deidentification (OCR + inpainting)
- [ ] Custom deidentification profiles
- [ ] Batch folder processing
- [ ] DICOM-to-PNG export
- [ ] 3D volume rendering
- [ ] Annotation tools
- [ ] Integration with PACS systems
- [ ] AI-powered PHI detection

### 11.2 Advanced Capabilities
- [ ] Server-side processing option
- [ ] User authentication & saved profiles
- [ ] Collaboration features
- [ ] Audit trail for compliance
- [ ] API for programmatic access

---

## 12. Development Resources

### 12.1 DICOM Standards
- [DICOM Standard Browser](https://dicom.nema.org/medical/dicom/current/output/chtml/part01/PS3.1.html)
- [DICOM PS3.15 (Security and Privacy)](https://dicom.nema.org/medical/dicom/current/output/chtml/part15/PS3.15.html)

### 12.2 OHIF Documentation
- [OHIF Viewer Docs](https://docs.ohif.org/)
- [Cornerstone.js Docs](https://www.cornerstonejs.org/)

### 12.3 Libraries Documentation
- [dcmjs GitHub](https://github.com/dcmjs-org/dcmjs)
- [dicom-parser](https://github.com/cornerstonejs/dicomParser)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

## 13. Risk Assessment

### 13.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large file handling | High | Web Workers, chunking |
| Browser compatibility | Medium | Polyfills, feature detection |
| OHIF integration complexity | High | Follow official guides, community support |
| Deidentification accuracy | Critical | Extensive testing, peer review |

### 13.2 Project Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Medium | Strict phase adherence |
| Learning curve (OHIF) | Medium | Dedicated learning time |
| Performance issues | High | Early testing, optimization |

---

## 14. Success Metrics

### 14.1 Technical Metrics
- Load time <3 seconds for typical DICOM files
- Parse & deidentify <1 second per file
- Smooth scrolling (60fps)
- Memory usage <500MB for 100 files

### 14.2 User Experience Metrics
- Upload to view <5 seconds
- Sync latency <50ms
- Export time <2 seconds per file

---

## 15. Getting Started Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Basic understanding of DICOM format
- [ ] Familiarity with React & TypeScript
- [ ] Git configured

### Initial Setup
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Review DICOM standards
- [ ] Setup development environment
- [ ] Run initial tests

---

## 16. Estimated Timeline & Effort

**Total Duration:** 8 weeks
**Team Size:** 1-2 developers
**Effort:** ~320-400 hours

**Breakdown:**
- Frontend Development: 40%
- DICOM Integration: 25%
- Deidentification Logic: 15%
- Testing: 15%
- Documentation: 5%

---

## 17. Budget Considerations

### Development Costs
- Developer time (8 weeks)
- No server costs (client-side only)
- Domain + hosting: ~$50-100/year

### Third-party Services
- All libraries are open-source (free)
- Optional: Error tracking (Sentry)
- Optional: Analytics (privacy-compliant)

---

## Conclusion

This DICOM Deidentification Comparison Viewer is a feasible project with modern web technologies. The key challenges are:

1. **OHIF Integration**: Most complex part, but well-documented
2. **DICOM Deidentification**: Critical for accuracy and compliance
3. **Performance**: Large files require optimization
4. **Synchronization**: Requires careful state management

**Recommendation:** Proceed with phased approach, starting with Phase 1-3 to validate core functionality before investing in advanced features.

**Next Steps:**
1. Review and approve this design
2. Set up development environment
3. Create detailed task breakdown for Phase 1
4. Begin implementation

---

## Appendix A: Sample Code Snippets

### A.1 DICOM Parsing Example

```typescript
import dcmjs from 'dcmjs';
import { DicomMetadata } from '../types';

export async function parseDicomFile(file: File): Promise<DicomMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
  const dataset = dcmjs.data.DicomMetaData.naturalizeDataset(dicomData.dict);

  return {
    patientName: dataset.PatientName,
    patientID: dataset.PatientID,
    studyDate: dataset.StudyDate,
    modality: dataset.Modality,
    // ... more tags
  };
}
```

### A.2 Deidentification Example

```typescript
export function deidentifyDataset(dataset: any): any {
  const deidentified = { ...dataset };

  // Remove patient identifiers
  delete deidentified.PatientName;
  delete deidentified.PatientID;
  delete deidentified.PatientBirthDate;

  // Replace with anonymized values
  deidentified.PatientName = 'ANONYMOUS';
  deidentified.PatientID = generateAnonymousID();

  // Shift dates
  if (deidentified.StudyDate) {
    deidentified.StudyDate = shiftDate(deidentified.StudyDate, -365);
  }

  return deidentified;
}
```

### A.3 Viewer Sync Example

```typescript
// In viewerSyncMiddleware.ts
export const viewerSyncMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'viewer/updateLeftViewport') {
    const state = store.getState();
    if (state.viewer.sync.isEnabled) {
      // Mirror to right viewer
      store.dispatch(updateRightViewport(action.payload));
    }
  }
  return next(action);
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Author:** DICOM Viewer Development Team
