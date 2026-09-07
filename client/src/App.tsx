import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, RootState } from './store/index.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';

// Auth feature pages
import Login from './features/auth/Login.js';
import DemoLogin from './features/auth/DemoLogin.js';
import VerifyOtp from './features/auth/VerifyOtp.js';
import ForgotPassword from './features/auth/ForgotPassword.js';
import ResetPassword from './features/auth/ResetPassword.js';

// Core platform feature pages
import Dashboard from './features/dashboard/Dashboard.js';
import FarmsPlots from './features/farmer/FarmsPlots.js';
import CropCycles from './features/crops/CropCycles.js';
import TasksView from './features/tasks/TasksView.js';
import ExpensesView from './features/expenses/ExpensesView.js';
import InventoryView from './features/inventory/InventoryView.js';
import MarketplaceView from './features/marketplace/MarketplaceView.js';
import MandiView from './features/mandi/MandiView.js';
import OrdersView from './features/orders/OrdersView.js';
import ProfitReportsView from './features/profit/ProfitReportsView.js';

// Admin & Admin Maker feature pages
import AdminUsersView from './features/admin/AdminUsersView.js';
import AdminModerationView from './features/admin/AdminModerationView.js';
import AdminDisputesView from './features/admin/AdminDisputesView.js';
import AdminAuditLogsView from './features/admin/AdminAuditLogsView.js';
import AdminMakerView from './features/adminmaker/AdminMakerView.js';

const queryClient = new QueryClient();

// Protected Route wrapper checking authentication & RBAC
interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedProps) {
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some((r) => user.roles?.includes(r))) {
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
            <Route path="/demo/login" element={<DemoLogin />} />
            <Route path="/demo" element={<Navigate to="/demo/login" replace />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Platform Hub */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Farm & Plot Management (Prompt 3) */}
            <Route
              path="/farms"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'FARM_MANAGER', 'ADMIN', 'SuperAdmin']}>
                  <FarmsPlots />
                </ProtectedRoute>
              }
            />

            {/* Crop Lifecycle & Harvest (Prompt 4) */}
            <Route
              path="/crops"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'FARM_MANAGER', 'ADMIN', 'SuperAdmin']}>
                  <CropCycles />
                </ProtectedRoute>
              }
            />

            {/* Field Tasks & Operations (Prompt 5) */}
            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'FARM_MANAGER', 'WORKER', 'ADMIN', 'SuperAdmin']}>
                  <TasksView />
                </ProtectedRoute>
              }
            />

            {/* Cost Basis & Cultivation Expenses (Prompt 7) */}
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'FARM_MANAGER', 'ADMIN', 'SuperAdmin']}>
                  <ExpensesView />
                </ProtectedRoute>
              }
            />

            {/* Consumables Inventory (Prompt 6) */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['FARM_MANAGER', 'FARMER', 'ADMIN', 'SuperAdmin']}>
                  <InventoryView />
                </ProtectedRoute>
              }
            />

            {/* Direct Produce Marketplace (Prompt 10) */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN', 'SuperAdmin']}>
                  <MarketplaceView />
                </ProtectedRoute>
              }
            />

            {/* Mandi Slot Booking & Auctions (Prompt 11) */}
            <Route
              path="/mandi"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'MANDI_AGENT', 'ADMIN', 'SuperAdmin']}>
                  <MandiView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandi/bookings"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'MANDI_AGENT', 'ADMIN', 'SuperAdmin']}>
                  <MandiView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandi/sales"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'MANDI_AGENT', 'ADMIN', 'SuperAdmin']}>
                  <MandiView />
                </ProtectedRoute>
              }
            />

            {/* Orders & Minimal Logistics (Prompts 10 & 12) */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'ADMIN', 'SuperAdmin']}>
                  <OrdersView />
                </ProtectedRoute>
              }
            />

            {/* Profit Report Engine (Prompt 13) */}
            <Route
              path="/profit-reports"
              element={
                <ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'SuperAdmin']}>
                  <ProfitReportsView />
                </ProtectedRoute>
              }
            />

            {/* Admin Maker Console (User Request & Prompt 14) */}
            <Route
              path="/admin-maker/create-request"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_MAKER', 'ADMIN', 'SuperAdmin']}>
                  <AdminMakerView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-maker/requests"
              element={
                <ProtectedRoute allowedRoles={['ADMIN_MAKER', 'ADMIN', 'SuperAdmin']}>
                  <AdminMakerView />
                </ProtectedRoute>
              }
            />

            {/* Admin Governance & Moderation (Prompt 14) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SuperAdmin']}>
                  <AdminUsersView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SuperAdmin']}>
                  <AdminModerationView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disputes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SuperAdmin']}>
                  <AdminDisputesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SuperAdmin']}>
                  <AdminAuditLogsView />
                </ProtectedRoute>
              }
            />

            {/* Legacy URL redirects */}
            <Route path="/farmers" element={<Navigate to="/farms" replace />} />
            <Route path="/exports" element={<Navigate to="/orders" replace />} />
            <Route path="/superadmin" element={<Navigate to="/admin/users" replace />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
