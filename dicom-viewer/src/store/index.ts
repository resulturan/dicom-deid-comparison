import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import dicomReducer from './slices/dicomSlice';
import viewerReducer from './slices/viewerSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    dicom: dicomReducer,
    viewer: viewerReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serializability checks
        // (File and ArrayBuffer objects are not serializable)
        ignoredActions: ['dicom/addFiles', 'dicom/updateFileMetadata'],
        ignoredPaths: ['dicom.originalFiles', 'dicom.deidentifiedFiles'],
      },
    }),
});

// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks for usage in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
