// ---------------------------------------------------------------------------
// Redux store + barrel export.
//
// All store consumers import from '@/store':
//   import { store, type RootState, type AppDispatch } from '@/store';
//   import { setCredentials, logout } from '@/store';
// ---------------------------------------------------------------------------

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export slice actions so callers never need to reach into the slice file.
export { setCredentials, logout } from './authSlice';
