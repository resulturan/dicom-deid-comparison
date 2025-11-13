import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification } from '../types';

const initialState: UIState = {
  uploadDrawerOpen: false,
  metadataDrawerOpen: false,
  settingsDrawerOpen: false,
  loading: false,
  loadingMessage: '',
  errors: [],
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Drawer Controls
    openUploadDrawer: (state) => {
      state.uploadDrawerOpen = true;
    },
    closeUploadDrawer: (state) => {
      state.uploadDrawerOpen = false;
    },
    toggleUploadDrawer: (state) => {
      state.uploadDrawerOpen = !state.uploadDrawerOpen;
    },

    openMetadataDrawer: (state) => {
      state.metadataDrawerOpen = true;
    },
    closeMetadataDrawer: (state) => {
      state.metadataDrawerOpen = false;
    },
    toggleMetadataDrawer: (state) => {
      state.metadataDrawerOpen = !state.metadataDrawerOpen;
    },

    openSettingsDrawer: (state) => {
      state.settingsDrawerOpen = true;
    },
    closeSettingsDrawer: (state) => {
      state.settingsDrawerOpen = false;
    },
    toggleSettingsDrawer: (state) => {
      state.settingsDrawerOpen = !state.settingsDrawerOpen;
    },

    // Loading State
    setLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.loading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },

    // Error Management
    addError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload);
    },
    removeError: (state, action: PayloadAction<number>) => {
      state.errors.splice(action.payload, 1);
    },
    clearErrors: (state) => {
      state.errors = [];
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  openUploadDrawer,
  closeUploadDrawer,
  toggleUploadDrawer,
  openMetadataDrawer,
  closeMetadataDrawer,
  toggleMetadataDrawer,
  openSettingsDrawer,
  closeSettingsDrawer,
  toggleSettingsDrawer,
  setLoading,
  addError,
  removeError,
  clearErrors,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
