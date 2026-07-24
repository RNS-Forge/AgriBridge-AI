// ---------------------------------------------------------------------------
// Typed Redux hooks.
//
// WHY: Using the raw useSelector / useDispatch from react-redux requires every
// call site to import RootState and AppDispatch manually. These pre-typed
// wrappers remove that boilerplate and are the single recommended hook pair
// for the entire app.
//
// Usage:
//   import { useAppSelector, useAppDispatch } from '@/hooks';
//   const token = useAppSelector(s => s.auth.token);
// ---------------------------------------------------------------------------

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/** Pre-typed dispatch — knows about all async thunks and action creators. */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Pre-typed selector — receives a fully-typed RootState. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
