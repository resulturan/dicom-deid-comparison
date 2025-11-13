import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ViewerState, Viewport, ViewerSyncState } from '../types';

const initialViewport: Viewport = {
  scale: 1.0,
  translation: { x: 0, y: 0 },
  rotation: 0,
  hflip: false,
  vflip: false,
  windowWidth: undefined,
  windowCenter: undefined,
  sliceIndex: 0,
};

const initialState: ViewerState = {
  leftViewer: {
    viewport: { ...initialViewport },
    tools: {
      activeTool: null,
      measurements: [],
      annotations: [],
    },
  },
  rightViewer: {
    viewport: { ...initialViewport },
    tools: {
      activeTool: null,
      measurements: [],
      annotations: [],
    },
  },
  sync: {
    isEnabled: true,
    syncScroll: true,
    syncPan: true,
    syncZoom: true,
    syncWindowLevel: true,
    syncRotation: true,
  },
};

const viewerSlice = createSlice({
  name: 'viewer',
  initialState,
  reducers: {
    // Left Viewer
    updateLeftViewport: (state, action: PayloadAction<Partial<Viewport>>) => {
      state.leftViewer.viewport = {
        ...state.leftViewer.viewport,
        ...action.payload,
      };

      // Sync to right viewer if enabled
      if (state.sync.isEnabled) {
        const updates: Partial<Viewport> = {};

        if (state.sync.syncZoom && action.payload.scale !== undefined) {
          updates.scale = action.payload.scale;
        }
        if (state.sync.syncPan && action.payload.translation !== undefined) {
          updates.translation = action.payload.translation;
        }
        if (state.sync.syncRotation && action.payload.rotation !== undefined) {
          updates.rotation = action.payload.rotation;
        }
        if (
          state.sync.syncWindowLevel &&
          (action.payload.windowWidth !== undefined || action.payload.windowCenter !== undefined)
        ) {
          if (action.payload.windowWidth !== undefined) updates.windowWidth = action.payload.windowWidth;
          if (action.payload.windowCenter !== undefined) updates.windowCenter = action.payload.windowCenter;
        }
        if (state.sync.syncScroll && action.payload.sliceIndex !== undefined) {
          updates.sliceIndex = action.payload.sliceIndex;
        }

        state.rightViewer.viewport = {
          ...state.rightViewer.viewport,
          ...updates,
        };
      }
    },

    // Right Viewer
    updateRightViewport: (state, action: PayloadAction<Partial<Viewport>>) => {
      state.rightViewer.viewport = {
        ...state.rightViewer.viewport,
        ...action.payload,
      };

      // Sync to left viewer if enabled
      if (state.sync.isEnabled) {
        const updates: Partial<Viewport> = {};

        if (state.sync.syncZoom && action.payload.scale !== undefined) {
          updates.scale = action.payload.scale;
        }
        if (state.sync.syncPan && action.payload.translation !== undefined) {
          updates.translation = action.payload.translation;
        }
        if (state.sync.syncRotation && action.payload.rotation !== undefined) {
          updates.rotation = action.payload.rotation;
        }
        if (
          state.sync.syncWindowLevel &&
          (action.payload.windowWidth !== undefined || action.payload.windowCenter !== undefined)
        ) {
          if (action.payload.windowWidth !== undefined) updates.windowWidth = action.payload.windowWidth;
          if (action.payload.windowCenter !== undefined) updates.windowCenter = action.payload.windowCenter;
        }
        if (state.sync.syncScroll && action.payload.sliceIndex !== undefined) {
          updates.sliceIndex = action.payload.sliceIndex;
        }

        state.leftViewer.viewport = {
          ...state.leftViewer.viewport,
          ...updates,
        };
      }
    },

    // Sync Controls
    toggleSync: (state) => {
      state.sync.isEnabled = !state.sync.isEnabled;
    },

    updateSyncSettings: (state, action: PayloadAction<Partial<ViewerSyncState>>) => {
      state.sync = {
        ...state.sync,
        ...action.payload,
      };
    },

    // Reset Viewports
    resetViewports: (state) => {
      state.leftViewer.viewport = { ...initialViewport };
      state.rightViewer.viewport = { ...initialViewport };
    },

    // Tool Management
    setLeftActiveTool: (state, action: PayloadAction<string | null>) => {
      state.leftViewer.tools.activeTool = action.payload;
    },

    setRightActiveTool: (state, action: PayloadAction<string | null>) => {
      state.rightViewer.tools.activeTool = action.payload;
    },

    // Slice Navigation
    nextSlice: (state) => {
      state.leftViewer.viewport.sliceIndex += 1;
      if (state.sync.isEnabled && state.sync.syncScroll) {
        state.rightViewer.viewport.sliceIndex += 1;
      }
    },

    previousSlice: (state) => {
      if (state.leftViewer.viewport.sliceIndex > 0) {
        state.leftViewer.viewport.sliceIndex -= 1;
        if (state.sync.isEnabled && state.sync.syncScroll) {
          state.rightViewer.viewport.sliceIndex -= 1;
        }
      }
    },

    setSliceIndex: (state, action: PayloadAction<number>) => {
      state.leftViewer.viewport.sliceIndex = action.payload;
      if (state.sync.isEnabled && state.sync.syncScroll) {
        state.rightViewer.viewport.sliceIndex = action.payload;
      }
    },
  },
});

export const {
  updateLeftViewport,
  updateRightViewport,
  toggleSync,
  updateSyncSettings,
  resetViewports,
  setLeftActiveTool,
  setRightActiveTool,
  nextSlice,
  previousSlice,
  setSliceIndex,
} = viewerSlice.actions;

export default viewerSlice.reducer;
