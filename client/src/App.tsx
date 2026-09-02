import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, RootState } from './store/index.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Auth feature pages
import Login from './features/auth/Login.js';
import Register from './features/auth/Register.js';
import VerifyOtp from './features/auth/VerifyOtp.js';
import ForgotPassword from './features/auth/ForgotPassword.js';
import ResetPassword from './features/auth/ResetPassword.js';

// Main pages
import Dashboard from './features/dashboard/Dashboard.js';
import Farmers from './features/farmer/Farmers.js';
import Mandi from './features/mandi/Mandi.js';
import Marketplace from './features/marketplace/Marketplace.js';
import Exports from './features/export/Exports.js';
import AiAssistant from './features/ai/AiAssistant.js';
import SuperAdmin from './features/superadmin/SuperAdmin.js';

const queryClient = new QueryClient();

// Protected Route wrapper checking authentication
interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedProps) {
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmers"
              element={
                <ProtectedRoute allowedRoles={['FPO_ADMIN', 'SuperAdmin']}>
                  <Farmers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandi"
              element={
                <ProtectedRoute allowedRoles={['FPO_ADMIN', 'SuperAdmin', 'Farmer']}>
                  <Mandi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute allowedRoles={['FPO_ADMIN', 'SuperAdmin', 'Buyer']}>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exports"
              element={
                <ProtectedRoute allowedRoles={['FPO_ADMIN', 'SuperAdmin']}>
                  <Exports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <AiAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={['SuperAdmin']}>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
