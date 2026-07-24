// ---------------------------------------------------------------------------
// Auth slice.
// Persists token + user to localStorage so a page refresh keeps the session.
// ---------------------------------------------------------------------------

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types';
import { parseLocalStorageJson } from '../utils';

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: parseLocalStorageJson<User>('user'),
  tenantId: localStorage.getItem('tenantId'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.tenantId = action.payload.user.tenantId ?? null;

      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.user.tenantId) {
        localStorage.setItem('tenantId', action.payload.user.tenantId);
      }
    },

    logout(state) {
      state.token = null;
      state.user = null;
      state.tenantId = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
