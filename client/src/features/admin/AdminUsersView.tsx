import React, { useState, useEffect, useMemo } from 'react';
import {
  EnterpriseDataTable,
  EnterpriseCheckbox,
  DataTableColumn,
  DataTableTab,
  BulkAction,
  BulkUploadModal,
  ColumnDefinition,
  Button,
  Input,
  Switch,
} from '../../components/ui/index.js';
import { CheckCircleIcon, CloseIcon, ShieldIcon, UserIcon, MailIcon } from '../../components/ui/icons/index.js';
import { getInitials } from '../../utils/index.js';

// Phone SVG Icon
const PhoneIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

// Edit Pencil SVG Icon
const EditPencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

// Eye SVG Icon (Credentials)
const CredentialsEyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Permissions ID Card SVG Icon
const PermissionsIdIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

// Internal Users Team SVG Icon
const InternalUsersTeamIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

export interface PresetAvatarItem {
  id: string;
  role: string;
  label: string;
  badge: string;
  url: string;
}

const PRESET_AVATARS: PresetAvatarItem[] = [
  { id: 'avatar_admin', role: 'ADMIN', label: 'Platform Admin', badge: 'Admin', url: '/avatars/avatar_admin.jpg' },
  { id: 'avatar_admin_maker', role: 'ADMIN_MAKER', label: 'Admin Maker', badge: 'Operations', url: '/avatars/avatar_admin_maker.svg' },
  { id: 'avatar_farmer', role: 'FARMER', label: 'Farm Producer', badge: 'Farmer', url: '/avatars/avatar_farmer.jpg' },
  { id: 'avatar_farm_manager', role: 'FARM_MANAGER', label: 'Farm Manager', badge: 'Manager', url: '/avatars/avatar_farm_manager.jpg' },
  { id: 'avatar_buyer', role: 'BUYER', label: 'Agro Buyer', badge: 'Buyer', url: '/avatars/avatar_buyer.svg' },
  { id: 'avatar_mandi_agent', role: 'MANDI_AGENT', label: 'Mandi Agent', badge: 'APMC', url: '/avatars/avatar_mandi_agent.svg' },
  { id: 'avatar_worker', role: 'WORKER', label: 'Field Specialist', badge: 'Worker', url: '/avatars/avatar_worker.svg' },
];

// ── Permission Modules & Features Catalog (Matching Image 2 Reference) ──
interface PermissionModule {
  id: string;
  name: string;
  features: { id: string; name: string }[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'module_profile',
    name: 'Profile & Masters',
    features: [
      { id: 'profile_view', name: 'Profile Overview' },
      { id: 'profile_edit', name: 'Profile Editing & KYC' },
      { id: 'bank_details', name: 'Bank Accounts & Settlement' },
      { id: 'doc_vault', name: 'Document Vault & Licenses' },
      { id: 'entity_masters', name: 'Entity & Farm Masters' },
      { id: 'notification_prefs', name: 'Notification Preferences' },
      { id: 'mis_reports', name: 'MIS & Activity Reports' },
      { id: 'audit_compliance', name: 'Audit & Access Controls' },
    ],
  },
  {
    id: 'module_farm',
    name: 'Farm & Agronomy Core',
    features: [
      { id: 'farm_overview', name: 'Farm Overview & Geo-mapping' },
      { id: 'plots_manage', name: 'Plots & Soil Allocation' },
      { id: 'crop_cycles', name: 'Crop Lifecycle & Sowing' },
      { id: 'growth_stages', name: 'Growth Stage Monitoring' },
      { id: 'harvest_log', name: 'Yield & Harvest Log' },
      { id: 'weather_radar', name: 'Weather Radar & Advisory' },
      { id: 'soil_tests', name: 'Soil Test & Nutrient Reports' },
      { id: 'irrigation_water', name: 'Irrigation & Water Schedule' },
    ],
  },
  {
    id: 'module_ops',
    name: 'Field Tasks & Labor',
    features: [
      { id: 'task_schedule', name: 'Field Task Scheduling' },
      { id: 'labor_assign', name: 'Worker & Labor Assignment' },
      { id: 'proof_photos', name: 'Photographic Proof of Work' },
      { id: 'wage_attendance', name: 'Wage Calculation & Attendance' },
      { id: 'equipment_hire', name: 'Tractor & Machinery Hire' },
      { id: 'task_approval', name: 'Manager Task Sign-off' },
      { id: 'daily_logs', name: 'Field Supervisor Daily Logs' },
      { id: 'incident_reports', name: 'Safety & Incident Logs' },
    ],
  },
  {
    id: 'module_finance',
    name: 'Financials & Cost Basis',
    features: [
      { id: 'expense_entry', name: 'Expense & Cultivation Entry' },
      { id: 'cost_basis_engine', name: 'Cost-per-Kg Breakeven Engine' },
      { id: 'fertilizer_cost', name: 'Nutrient & Input Allocation' },
      { id: 'profit_loss_reports', name: 'Profit & Loss Margin Reports' },
      { id: 'invoice_gen', name: 'Direct Farmgate Invoices' },
      { id: 'payment_tracker', name: 'APMC Payout Reconciliation' },
      { id: 'tax_gst_ledger', name: 'Agri Cess & GST Ledger' },
      { id: 'payout_settlement', name: 'Trader Commission Settlement' },
    ],
  },
  {
    id: 'module_inventory',
    name: 'Consumables & Inventory',
    features: [
      { id: 'inventory_ledger', name: 'Seed & Chemical Ledger' },
      { id: 'reorder_alerts', name: 'Low Stock Reorder Triggers' },
      { id: 'stock_adjust', name: 'Warehouse Transfers & Logs' },
      { id: 'vendor_depot', name: 'Authorized Fertilizer Depots' },
      { id: 'batch_expiry', name: 'Batch Numbers & Expiry Tracking' },
      { id: 'audit_stock', name: 'Physical Stock Audit Verification' },
      { id: 'barcode_scan', name: 'Bin & Barcode Tracking' },
      { id: 'supplier_returns', name: 'Damaged Stock Returns' },
    ],
  },
  {
    id: 'module_market',
    name: 'Marketplace & Commerce',
    features: [
      { id: 'produce_listings', name: 'Produce Lots & Listings' },
      { id: 'buyer_bids', name: 'Buyer Bids & Negotiation' },
      { id: 'sales_orders', name: 'Purchase Orders & Contracts' },
      { id: 'logistics_dispatch', name: 'Cold-Chain Dispatch & GPS' },
      { id: 'pod_sign', name: 'Proof of Delivery (POD) Signoff' },
      { id: 'escrow_hold', name: 'Marketplace Escrow Protection' },
      { id: 'quality_grading', name: 'Produce Quality Inspection' },
      { id: 'commission_rules', name: 'Platform Trade Fee Calculator' },
    ],
  },
  {
    id: 'module_mandi',
    name: 'Mandi APMC Network',
    features: [
      { id: 'mandi_ticker', name: 'Live APMC Arrival Prices' },
      { id: 'slot_booking', name: 'APMC Yard Slot Booking' },
      { id: 'auction_verify', name: 'Auction Slips & Weighment' },
      { id: 'payout_settlement_mandi', name: 'Trader Commission Payout' },
      { id: 'gate_pass', name: 'Digital Mandi Gate Pass' },
      { id: 'trader_license', name: 'Licensed Commission Agents' },
      { id: 'cess_challan', name: 'APMC Market Fee Challans' },
      { id: 'dispute_arbitration', name: 'Yard Weighment Disputes' },
    ],
  },
  {
    id: 'module_governance',
    name: 'Governance & Security',
    features: [
      { id: 'user_management', name: 'User Management & Approvals' },
      { id: 'role_requests', name: 'Role Requests & Maker-Checker' },
      { id: 'moderation', name: 'Produce Safety & Moderation' },
      { id: 'disputes_desk', name: 'Disputes & Claims Mediation' },
      { id: 'audit_logs', name: 'Immutable Compliance Audit Logs' },
      { id: 'system_backup', name: 'Automated State Snapshots' },
      { id: 'ip_whitelist', name: 'Office IP & Geo-fencing' },
      { id: 'security_policies', name: 'Password & Session Policies' },
    ],
  },
];

export default function AdminUsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<'PENDING' | 'ACTIVE' | 'ALL' | 'SUSPENDED'>('ACTIVE');
  const [loading, setLoading] = useState(true);

  // ── Multi-View Modes (Matching Reference Images 1, 2, 3) ──
  const [viewMode, setViewMode] = useState<'DIRECTORY' | 'PERMISSIONS' | 'INTERNAL_USERS'>('DIRECTORY');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // User Permissions Form State (Image 2)
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [permFirstName, setPermFirstName] = useState('');
  const [permLastName, setPermLastName] = useState('');
  const [permCompanyName, setPermCompanyName] = useState('');
  const [permPhone, setPermPhone] = useState('');
  const [permEmail, setPermEmail] = useState('');
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [permissionSetTab, setPermissionSetTab] = useState<'CORE' | 'COMMERCE'>('CORE');

  const displayedModules = useMemo(() => {
    return permissionSetTab === 'CORE'
      ? PERMISSION_MODULES.slice(0, 4)
      : PERMISSION_MODULES.slice(4, 8);
  }, [permissionSetTab]);

  // Internal Users Form State (Image 3)
  const [showAddInternalUserModal, setShowAddInternalUserModal] = useState(false);
  const [internalUserSearch, setInternalUserSearch] = useState('');
  const [internalUserColumnSearch, setInternalUserColumnSearch] = useState(false);
  const [newSubFirstName, setNewSubFirstName] = useState('');
  const [newSubLastName, setNewSubLastName] = useState('');
  const [newSubDesignation, setNewSubDesignation] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');

  // Modals state
  const [showDirectCreateModal, setShowDirectCreateModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [bulkRejectIds, setBulkRejectIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Credentials Modal State
  const [credentialsUser, setCredentialsUser] = useState<any | null>(null);
  const [generatedTempPass, setGeneratedTempPass] = useState<string | null>(null);

  // Edit Profile Modal State
  const [editProfileUser, setEditProfileUser] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfilePicture, setEditProfilePicture] = useState<string | null>(null);
  const [showEditPresets, setShowEditPresets] = useState(false);
  const editFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Direct create user form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ADMIN_MAKER');
  const [createCompanyName, setCreateCompanyName] = useState('');
  const [createProfilePicture, setCreateProfilePicture] = useState<string | null>(null);
  const [showCreatePresets, setShowCreatePresets] = useState(false);
  const createFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Convert uploaded image to Base64 data URL for Create User
  const handleCreatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCreateProfilePicture(result);
      showToast('success', 'Profile photo loaded as Base64.');
    };
    reader.onerror = () => {
      showToast('error', 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded image to Base64 data URL for Edit Profile
  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setEditProfilePicture(result);
      showToast('success', 'Profile photo updated as Base64.');
    };
    reader.onerror = () => {
      showToast('error', 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/auth/users'),
        fetch('http://localhost:8000/api/v1/auth/user-requests'),
      ]);
      const [uData, rData] = await Promise.all([uRes.json(), rRes.json()]);
      if (uData.success) {
        setUsers(uData.data || []);
        // Refresh selected user reference if active
        if (selectedUser) {
          const fresh = (uData.data || []).find((u: any) => u.id === selectedUser.id);
          if (fresh) setSelectedUser(fresh);
        }
      }
      if (rData.success) setRequests(rData.data || []);
    } catch {
      showToast('error', 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Open User Permissions (Image 2) ──
  const handleOpenPermissions = (u: any) => {
    setSelectedUser(u);
    setPermFirstName(u.firstName || '');
    setPermLastName(u.lastName || '');
    setPermCompanyName(u.companyName || `${u.firstName}'s Enterprise`);
    setPermPhone(u.phone || '');
    setPermEmail(u.email || '');

    // Default or existing permissions
    const existing = new Set<string>(u.permissions || []);
    if (existing.size === 0) {
      // Default to standard features
      PERMISSION_MODULES.forEach((m) => m.features.forEach((f) => existing.add(f.id)));
    }
    setUserPermissions(existing);
    setViewMode('PERMISSIONS');
  };

  // ── Open Internal Users (Image 3) ──
  const handleOpenInternalUsers = (u: any) => {
    setSelectedUser(u);
    setViewMode('INTERNAL_USERS');
  };

  // ── Open Credentials Modal ──
  const handleOpenCredentials = (u: any) => {
    setCredentialsUser(u);
    setGeneratedTempPass(null);
  };

  // ── Open Edit Profile Modal ──
  const handleOpenEditProfile = (u: any) => {
    setEditProfileUser(u);
    setEditFirstName(u.firstName || '');
    setEditLastName(u.lastName || '');
    setEditCompanyName(u.companyName || '');
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditProfilePicture(u.profilePicture || null);
    setShowEditPresets(false);
  };

  // ── Toggle Individual Feature Permission ──
  const handleToggleFeature = (featureId: string) => {
    setUserPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  // ── Toggle Entire Module Category ──
  const handleToggleModule = (moduleObj: PermissionModule) => {
    const allChecked = moduleObj.features.every((f) => userPermissions.has(f.id));
    setUserPermissions((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        moduleObj.features.forEach((f) => next.delete(f.id));
      } else {
        moduleObj.features.forEach((f) => next.add(f.id));
      }
      return next;
    });
  };

  // ── Toggle Default / All Modules ──
  const allPlatformFeatures = useMemo(() => {
    const all: string[] = [];
    PERMISSION_MODULES.forEach((m) => m.features.forEach((f) => all.push(f.id)));
    return all;
  }, []);

  const isAllDefaultChecked = allPlatformFeatures.every((f) => userPermissions.has(f));

  const handleToggleDefaultModule = () => {
    if (isAllDefaultChecked) {
      setUserPermissions(new Set());
    } else {
      setUserPermissions(new Set(allPlatformFeatures));
    }
  };

  // ── Save Permissions Matrix to Backend ──
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setIsSavingPermissions(true);
    try {
      const permsArray = Array.from(userPermissions);
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ permissions: permsArray }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Permissions updated successfully for ${selectedUser.firstName} (${permsArray.length} features enabled).`);
        await loadData();
        setViewMode('DIRECTORY');
      } else {
        showToast('error', data.message || 'Failed to update permissions.');
      }
    } catch {
      showToast('error', 'Network error while saving permissions.');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // ── Save Profile Edit ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileUser) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${editProfileUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          companyName: editCompanyName,
          phone: editPhone,
          email: editEmail,
          profilePicture: editProfilePicture || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'User profile details and avatar updated in database.');
        setEditProfileUser(null);
        loadData();
      } else {
        showToast('error', data.message || 'Profile update failed.');
      }
    } catch {
      showToast('error', 'Network error while updating user profile.');
    }
  };

  // ── Add Internal Sub-User (Image 3) ──
  const handleAddInternalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${selectedUser.id}/internal-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          firstName: newSubFirstName,
          lastName: newSubLastName,
          designation: newSubDesignation,
          email: newSubEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Added team member ${newSubFirstName} ${newSubLastName}.`);
        setShowAddInternalUserModal(false);
        setNewSubFirstName('');
        setNewSubLastName('');
        setNewSubDesignation('');
        setNewSubEmail('');
        loadData();
      } else {
        showToast('error', data.message || 'Failed to add internal user.');
      }
    } catch {
      showToast('error', 'Network error while adding internal user.');
    }
  };

  // ── Toggle Internal User Active Switch (Image 3) ──
  const handleToggleInternalUserStatus = async (subUserId: string) => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${selectedUser.id}/internal-users/${subUserId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        loadData();
      }
    } catch {
      showToast('error', 'Failed to toggle internal user status.');
    }
  };

  // ── Single Approve ──
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/user-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'User request approved and active account provisioned.');
        loadData();
      } else {
        showToast('error', data.message || 'Approval failed.');
      }
    } catch {
      showToast('error', 'Network error while approving user request.');
    }
  };

  // ── Bulk Approve ──
  const handleBulkApprove = async (selectedItems: any[]) => {
    const ids = selectedItems.map((item) => item.id);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/user-requests/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || `Approved ${data.approvedCount} requests.`);
        loadData();
      } else {
        showToast('error', data.message || 'Bulk approval failed.');
      }
    } catch {
      showToast('error', 'Network error during bulk approval.');
    }
  };

  // ── Single or Bulk Reject Submit ──
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = bulkRejectIds.length > 0 ? bulkRejectIds : rejectModalId ? [rejectModalId] : [];
    if (ids.length === 0) return;

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/user-requests/bulk-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ids, reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Rejected ${data.rejectedCount} request(s).`);
        setRejectModalId(null);
        setBulkRejectIds([]);
        setRejectReason('');
        loadData();
      } else {
        showToast('error', data.message || 'Rejection failed.');
      }
    } catch {
      showToast('error', 'Network error while rejecting.');
    }
  };

  // ── Toggle User Status (Suspend / Reinstate) ──
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `User status updated to ${newStatus}.`);
        loadData();
      }
    } catch {
      showToast('error', 'Network error while toggling status.');
    }
  };

  // ── Direct Create Active User Submit ──
  const handleDirectCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/admin-create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          role,
          companyName: createCompanyName.trim() || undefined,
          profilePicture: createProfilePicture || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Active user ${firstName} ${lastName} (${role}) provisioned and stored in database.`);
        setShowDirectCreateModal(false);
        setEmail('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setCreateCompanyName('');
        setCreateProfilePicture(null);
        setRole('ADMIN_MAKER');
        loadData();
      } else {
        showToast('error', data.message || 'Failed to create user account.');
      }
    } catch {
      showToast('error', 'Network error during direct account creation.');
    }
  };

  // ── Bulk Upload Handler ──
  const handleBulkUploadSubmit = async (rows: Record<string, string>[]): Promise<{ success: boolean; message?: string }> => {
    const createdUsers: any[] = [];
    for (const r of rows) {
      try {
        const res = await fetch('http://localhost:8000/api/v1/auth/admin-create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            phone: r.phone || '',
            role: r.role ? r.role.toUpperCase() : 'FARMER',
          }),
        });
        const d = await res.json();
        if (d.success) createdUsers.push(d.data);
      } catch {}
    }
    showToast('success', `Bulk upload completed: ${createdUsers.length} accounts provisioned.`);
    setShowBulkUploadModal(false);
    loadData();
    return { success: true, message: `Provisioned ${createdUsers.length} accounts.` };
  };

  // Tab counts
  const pendingCount = requests.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const allCount = users.length + requests.length;

  const tabs: DataTableTab[] = [
    {
      id: 'ACTIVE',
      label: 'Active User Directory',
      count: activeCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300/80',
    },
    {
      id: 'PENDING',
      label: 'Pending Approvals Queue',
      count: pendingCount,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300/80',
    },
    {
      id: 'ALL',
      label: 'All Accounts & Requests',
      count: allCount,
      badgeColor: 'bg-slate-100 text-slate-800 border border-slate-300',
    },
    {
      id: 'SUSPENDED',
      label: 'Suspended / Inactive',
      count: suspendedCount,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
    },
  ];

  // Active dataset based on selected tab
  const tableData = useMemo(() => {
    if (activeTabId === 'PENDING') {
      return requests.filter((r) => r.status === 'PENDING_APPROVAL');
    }
    if (activeTabId === 'ACTIVE') {
      return users.filter((u) => u.status === 'active');
    }
    if (activeTabId === 'SUSPENDED') {
      return users.filter((u) => u.status === 'suspended');
    }
    return [...users, ...requests];
  }, [activeTabId, users, requests]);

  // Role badge renderer
  const renderRoleBadge = (roleName?: string) => {
    const r = roleName || 'USER';
    const colorMap: Record<string, string> = {
      ADMIN: 'bg-rose-50 text-rose-800 border-rose-200',
      SuperAdmin: 'bg-purple-50 text-purple-800 border-purple-200',
      ADMIN_MAKER: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      FARMER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      FARM_MANAGER: 'bg-blue-50 text-blue-800 border-blue-200',
      BUYER: 'bg-amber-50 text-amber-900 border-amber-200',
      MANDI_AGENT: 'bg-orange-50 text-orange-900 border-orange-200',
      WORKER: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight border uppercase whitespace-nowrap ${colorMap[r] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
        {r.replace('_', ' ')}
      </span>
    );
  };

  // ── Columns for Active Users Directory (Matching Reference Image 1) ──
  const activeUserColumns: DataTableColumn[] = [
    {
      key: 'companyName',
      header: 'Company / Stakeholder Name',
      width: '240px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Search name or company...',
      render: (u) => (
        <div className="flex items-center gap-2 py-0.5 select-none">
          {/* Expand Arrow matching Reference Image 1 */}
          <span className="text-[10px] text-slate-400">
            ▶
          </span>
          {u.profilePicture ? (
            <img
              src={u.profilePicture}
              alt={u.firstName || 'User'}
              className="w-6 h-6 rounded-md object-cover flex-shrink-0 shadow-2xs border border-slate-200"
              onError={(e) => {
                // Graceful fallback if image file fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-[#4a2e80] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-2xs">
              {getInitials(u.firstName, u.lastName)}
            </div>
          )}
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-[12px] block leading-tight truncate">
              {u.companyName || `${u.firstName} ${u.lastName}`}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {u.firstName} {u.lastName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'companyType',
      header: 'Company Type',
      width: '130px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Type / role...',
      accessor: (u) => u.roles?.[0] || 'User',
      render: (u) => renderRoleBadge(u.roles?.[0]),
    },
    {
      key: 'recentActivityAt',
      header: 'Recent Activity At',
      width: '160px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Activity date...',
      render: (u) => (
        <span className="text-slate-600 font-mono text-[11px] whitespace-nowrap">
          {u.recentActivityAt || 'Sep 8, 2026 3:10 PM'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      width: '210px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Search email...',
      render: (u) => (
        <span className="font-mono text-slate-700 text-[11px] font-medium select-all truncate block max-w-[200px]">
          {u.email}
        </span>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      width: '100px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Country...',
      render: (u) => (
        <span className="font-bold text-slate-700 text-[11px] tracking-wide uppercase">
          {u.country || 'INDIA'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '150px',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Date...',
      render: (u) => (
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
          {u.createdAt ? (u.createdAt.includes('T') ? u.createdAt.replace('T', ' ').slice(0, 16) : u.createdAt) : '—'}
        </span>
      ),
    },
    // ── 4 Dedicated Action Columns Matching Reference Image 1 ──
    {
      key: 'action_edit',
      header: 'Edit',
      width: '55px',
      align: 'center',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditProfile(u);
          }}
          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title={`Edit Profile (${u.firstName} ${u.lastName})`}
        >
          <EditPencilIcon />
        </button>
      ),
    },
    {
      key: 'action_credentials',
      header: 'Credentials',
      width: '85px',
      align: 'center',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenCredentials(u);
          }}
          className="p-1 text-[#4a2e80] hover:text-[#321c5c] hover:bg-purple-50 rounded transition-colors cursor-pointer"
          title={`Inspect Login Credentials (${u.email})`}
        >
          <CredentialsEyeIcon />
        </button>
      ),
    },
    {
      key: 'action_permissions',
      header: 'Permissions',
      width: '85px',
      align: 'center',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenPermissions(u);
          }}
          className="p-1 text-[#4a2e80] hover:text-[#321c5c] hover:bg-purple-50 rounded transition-colors cursor-pointer"
          title={`Manage Permissions & Modules (${u.firstName})`}
        >
          <PermissionsIdIcon />
        </button>
      ),
    },
    {
      key: 'action_internal_users',
      header: 'Internal Users',
      width: '95px',
      align: 'center',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenInternalUsers(u);
          }}
          className="p-1 text-[#4a2e80] hover:text-[#321c5c] hover:bg-purple-50 rounded transition-colors cursor-pointer"
          title={`View Team & Internal Users (${u.internalUsers?.length || 0} members)`}
        >
          <div className="inline-flex items-center gap-1">
            <InternalUsersTeamIcon />
            {u.internalUsers && u.internalUsers.length > 0 && (
              <span className="text-[9.5px] font-bold text-[#4a2e80]">
                {u.internalUsers.length}
              </span>
            )}
          </div>
        </button>
      ),
    },
  ];

  // ── Columns for Pending Approval Requests ──
  const pendingColumns: DataTableColumn[] = [
    {
      key: 'name',
      header: 'Applicant Name',
      width: '180px',
      sortable: true,
      searchable: true,
      render: (req) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {req.profilePicture ? (
            <img
              src={req.profilePicture}
              alt={req.firstName || 'Applicant'}
              className="w-5 h-5 rounded-[3px] object-cover flex-shrink-0 shadow-2xs border border-slate-200"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="w-5 h-5 rounded-[3px] bg-amber-700 text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
              {getInitials(req.firstName, req.lastName)}
            </span>
          )}
          <span className="font-bold text-slate-900 text-[11.5px]">
            {req.firstName} {req.lastName}
          </span>
        </div>
      ),
    },
    {
      key: 'requestedRole',
      header: 'Requested Role',
      width: '140px',
      sortable: true,
      searchable: true,
      render: (req) => renderRoleBadge(req.requestedRole),
    },
    {
      key: 'email',
      header: 'Email Address',
      width: '190px',
      sortable: true,
      searchable: true,
      render: (req) => (
        <span className="font-mono text-slate-700 text-[11px] font-medium truncate block max-w-[180px]">
          {req.email}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      width: '130px',
      sortable: true,
      render: (req) => (
        <span className="font-mono text-slate-600 text-[11px]">
          {req.phone || '—'}
        </span>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Submitted By',
      width: '150px',
      sortable: true,
      render: (req) => (
        <span className="text-slate-600 text-[11px] font-mono">
          {req.requestedBy || 'ADMIN_MAKER'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Review Actions',
      width: '160px',
      align: 'center',
      render: (req) => (
        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => handleApprove(req.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 h-6.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Approve & Provision Active Account"
          >
            <CheckCircleIcon className="w-3 h-3 shrink-0" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => setRejectModalId(req.id)}
            className="inline-flex items-center gap-1 px-2 py-1 h-6.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
            title="Reject Request"
          >
            <CloseIcon className="w-3 h-3 shrink-0" />
            <span>Reject</span>
          </button>
        </div>
      ),
    },
  ];

  // Bulk actions configuration (Table up right when rows are selected)
  const bulkActions: BulkAction[] =
    activeTabId === 'PENDING'
      ? [
          {
            label: 'Approve',
            className: 'bg-[#4a2e80] hover:bg-[#3a2268] text-white px-4 py-1 h-7.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0',
            onClick: handleBulkApprove,
          },
          {
            label: 'Reject',
            className: 'bg-white hover:bg-rose-50 text-[#e53e3e] border border-[#e53e3e] px-4 py-1 h-7.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0',
            onClick: (items) => {
              setBulkRejectIds(items.map((i) => i.id));
            },
          },
        ]
      : [
          {
            label: 'Deactivate',
            className: 'bg-white hover:bg-rose-50 text-[#e53e3e] border border-[#e53e3e] px-4 py-1 h-7.5 rounded-full text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0',
            onClick: async (items) => {
              for (const u of items) {
                await handleToggleStatus(u.id, 'active');
              }
            },
          },
        ];

  // Bulk Upload Columns Definition
  const bulkUploadColumns: ColumnDefinition[] = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phone', label: 'Phone Number' },
    { key: 'role', label: 'Role', required: true },
    { key: 'companyName', label: 'Company / Farm Name' },
  ];

  // Filtered internal users (Image 3)
  const internalUsersList = useMemo(() => {
    if (!selectedUser || !selectedUser.internalUsers) return [];
    if (!internalUserSearch.trim()) return selectedUser.internalUsers;
    const q = internalUserSearch.toLowerCase().trim();
    return selectedUser.internalUsers.filter((sub: any) =>
      sub.firstName?.toLowerCase().includes(q) ||
      sub.lastName?.toLowerCase().includes(q) ||
      sub.designation?.toLowerCase().includes(q) ||
      sub.email?.toLowerCase().includes(q)
    );
  }, [selectedUser, internalUserSearch]);

  return (
    <div className="space-y-3.5 w-full max-w-full min-w-0 font-sans">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-md text-xs font-bold border shadow-lg animate-in slide-in-from-top-3 duration-200 flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-600'
              : 'bg-rose-800 text-white border-rose-600'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 1: DIRECTORY MASTER TABLE (Matching Reference Image 1)
         ══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'DIRECTORY' && (
        <>
          <EnterpriseDataTable
            title="Platform Users & Stakeholder Directory"
            subtitle="Admin governance console: inspect stakeholders, manage individual module permissions, provision team members, and oversee verification."
            data={tableData}
            columns={activeTabId === 'PENDING' ? pendingColumns : activeUserColumns}
            keyExtractor={(item) => item.id}
            tabs={tabs}
            activeTab={activeTabId}
            onTabChange={(id) => setActiveTabId(id as any)}
            onRefresh={loadData}
            exportFilename="AgriBridge_Platform_Users"
            bulkUploadLabel="Bulk Upload"
            onOpenBulkUpload={() => setShowBulkUploadModal(true)}
            bulkActions={bulkActions}
            loading={loading}
            extraActions={
              <Button
                onClick={() => setShowDirectCreateModal(true)}
                className="text-xs !py-1 !px-3.5 !h-8 !bg-[#4a2e80] hover:!bg-[#361e60] text-white font-semibold rounded-full shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Add User</span>
              </Button>
            }
          />
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 2: USER PERMISSIONS WORKSPACE (Matching Reference Image 2)
         ══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'PERMISSIONS' && selectedUser && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:p-6 space-y-5 animate-in fade-in duration-200">
          {/* Header with Back Arrow */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('DIRECTORY')}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#4a2e80] transition-colors cursor-pointer flex items-center justify-center"
                title="Back to User Directory"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>User Permissions</span>
                  <span className="text-xs text-slate-400 font-normal">/</span>
                  <span className="text-xs font-semibold text-[#4a2e80] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Granular RBAC access control: check or uncheck individual modules and page features for this stakeholder.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {renderRoleBadge(selectedUser.roles?.[0])}
            </div>
          </div>

          {/* User Profile Information Inputs Strip (Matching Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200/90 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                First Name*
              </label>
              <input
                type="text"
                value={permFirstName}
                onChange={(e) => setPermFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                value={permLastName}
                onChange={(e) => setPermLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Company Name*
              </label>
              <input
                type="text"
                value={permCompanyName}
                onChange={(e) => setPermCompanyName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mobile Number*
              </label>
              <input
                type="text"
                value={permPhone}
                onChange={(e) => setPermPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 h-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                E-mail*
              </label>
              <input
                type="email"
                value={permEmail}
                onChange={(e) => setPermEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 h-8 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
          </div>

          {/* Module Category Switch & Master Default Module Toggle */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPermissionSetTab('CORE')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  permissionSetTab === 'CORE'
                    ? 'bg-white text-[#4a2e80] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Core Farm & Operations (4 Modules)
              </button>
              <button
                type="button"
                onClick={() => setPermissionSetTab('COMMERCE')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  permissionSetTab === 'COMMERCE'
                    ? 'bg-white text-[#4a2e80] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Commerce & Governance (4 Modules)
              </button>
            </div>

            {/* Master Default Module Toggle (Matching Reference Image 2 Top Right) */}
            <div
              onClick={handleToggleDefaultModule}
              className="inline-flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <EnterpriseCheckbox
                checked={isAllDefaultChecked}
                onChange={handleToggleDefaultModule}
                title="Toggle Default Module"
              />
              <span className="text-xs font-bold text-slate-800">Default Module</span>
            </div>
          </div>

          {/* ── Unified 4-Column Module & Features Permission Table (Matching Reference Image 2) ── */}
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs max-h-[calc(100vh-340px)] overflow-y-auto table-scroll">
            <table className="w-full text-left border-collapse table-fixed">
              {/* Category Header Row (Continuous Lavender Bar matching reference image) */}
              <thead>
                <tr className="bg-[#f4effc] border-b border-[#e5daf5]">
                  {displayedModules.map((mod) => {
                    const allModChecked = mod.features.every((f) => userPermissions.has(f.id));
                    const someModChecked = mod.features.some((f) => userPermissions.has(f.id)) && !allModChecked;

                    return (
                      <th
                        key={mod.id}
                        className="w-1/4 px-4 py-2.5 font-bold text-xs text-[#4a2e80] tracking-tight border-r border-[#e5daf5] last:border-r-0 select-none"
                      >
                        <div
                          onClick={() => handleToggleModule(mod)}
                          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <EnterpriseCheckbox
                            checked={allModChecked}
                            indeterminate={someModChecked}
                            onChange={() => handleToggleModule(mod)}
                            title={`Select/Deselect all ${mod.name} features`}
                          />
                          <span className="truncate">{mod.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Rows: 8 perfectly aligned rows */}
              <tbody className="divide-y divide-slate-100 text-xs">
                {Array.from({ length: 8 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/70 transition-colors h-9">
                    {displayedModules.map((mod) => {
                      const feat = mod.features[rowIdx];
                      if (!feat) {
                        return <td key={mod.id} className="w-1/4 px-4 py-2 border-r border-slate-100 last:border-r-0" />;
                      }

                      const isChecked = userPermissions.has(feat.id);
                      return (
                        <td
                          key={feat.id}
                          onClick={() => handleToggleFeature(feat.id)}
                          className={`w-1/4 px-4 py-2 border-r border-slate-100 last:border-r-0 cursor-pointer select-none transition-colors ${
                            isChecked ? 'bg-purple-50/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <EnterpriseCheckbox
                              checked={isChecked}
                              onChange={() => handleToggleFeature(feat.id)}
                              title={feat.name}
                            />
                            <span
                              className={`text-[11.5px] leading-tight select-none truncate ${
                                isChecked ? 'font-semibold text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              {feat.name}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Buttons (Matching Reference Image 2: Cancel & Save) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('DIRECTORY')}
              className="px-6 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingPermissions}
              onClick={handleSavePermissions}
              className="px-8 py-2 rounded-full bg-[#4a2e80] hover:bg-[#382064] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingPermissions ? (
                <span>Saving...</span>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 3: ALL INTERNAL USERS SUB-TABLE (Matching Reference Image 3)
         ══════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'INTERNAL_USERS' && selectedUser && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:p-6 space-y-4 animate-in fade-in duration-200">
          {/* Top Header with Back Arrow, Actions, Column Search (Matching Image 3) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('DIRECTORY')}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#4a2e80] transition-colors cursor-pointer flex items-center justify-center"
                title="Back to User Directory"
              >
                <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>All Internal Users For</span>
                  <span className="text-emerald-800 font-bold">
                    {selectedUser.companyName || `${selectedUser.firstName} ${selectedUser.lastName}`}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Provisioned team members and sub-accounts under this organization.
                </p>
              </div>
            </div>

            {/* Right Action Buttons (Matching Image 3: Refresh, Create User, Column Search) */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={loadData}
                className="p-1.5 h-8 w-8 text-slate-600 hover:text-purple-800 hover:bg-purple-50 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
                title="Refresh Records"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>

              <button
                onClick={() => setShowAddInternalUserModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 h-8 text-xs font-semibold bg-[#4a2e80] hover:bg-[#3a2268] text-white rounded-full shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <span>+ Create User</span>
              </button>

              <div
                onClick={() => setInternalUserColumnSearch(!internalUserColumnSearch)}
                className={`inline-flex items-center gap-2 px-3 py-1 h-8 text-xs font-semibold rounded-md border transition-all duration-150 cursor-pointer select-none shrink-0 ${
                  internalUserColumnSearch
                    ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <span className="whitespace-nowrap">Column Search</span>
                <Switch
                  size="sm"
                  checked={internalUserColumnSearch}
                  onChange={setInternalUserColumnSearch}
                  ariaLabel="Toggle column search"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Search Bar */}
          {internalUserColumnSearch && (
            <div className="max-w-xs">
              <input
                type="text"
                value={internalUserSearch}
                onChange={(e) => setInternalUserSearch(e.target.value)}
                placeholder="Filter by name, designation, email..."
                className="w-full px-3 py-1.5 h-7.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4a2e80]"
              />
            </div>
          )}

          {/* Internal Users Table Container (Matching Image 3) */}
          <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden w-full">
            <div className="overflow-x-auto overflow-y-hidden w-full table-scroll">
              <table className="w-full text-left text-[11.5px] border-collapse min-w-[760px]">
                <thead className="sticky top-0 z-10 bg-[#f6f2fd] border-b border-[#e9dff7] text-slate-700 text-xs font-bold shadow-[0_1px_0_0_#e2e8f0]">
                  <tr className="h-9">
                    <th className="px-4 py-2 border-r border-purple-100">First Name</th>
                    <th className="px-4 py-2 border-r border-purple-100">Last Name</th>
                    <th className="px-4 py-2 border-r border-purple-100">Designation</th>
                    <th className="px-4 py-2 border-r border-purple-100">E-mail</th>
                    <th className="px-4 py-2 border-r border-purple-100 text-center">Is Active</th>
                    <th className="px-4 py-2 border-r border-purple-100">Created Date</th>
                    <th className="px-4 py-2 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11.5px]">
                  {internalUsersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <InternalUsersTeamIcon />
                          <p className="font-semibold text-slate-700">No internal users found</p>
                          <p className="text-[11px] text-slate-400">
                            Click "+ Create User" to add team members or sub-accounts for this entity.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    internalUsersList.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors h-9">
                        <td className="px-4 py-2 font-semibold text-slate-900 border-r border-slate-100">
                          {sub.firstName}
                        </td>
                        <td className="px-4 py-2 text-slate-800 border-r border-slate-100">
                          {sub.lastName}
                        </td>
                        <td className="px-4 py-2 border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700">
                            {sub.designation || 'Staff'}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-700 border-r border-slate-100">
                          {sub.email}
                        </td>
                        {/* Interactive Toggle Switch matching Reference Image 3 */}
                        <td className="px-4 py-2 text-center border-r border-slate-100">
                          <div className="flex justify-center">
                            <Switch
                              size="sm"
                              checked={sub.isActive}
                              onChange={() => handleToggleInternalUserStatus(sub.id)}
                              ariaLabel={`Toggle status for ${sub.firstName}`}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-500 border-r border-slate-100">
                          {sub.createdAt || 'Sep 3, 2026 5:37 PM'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              showToast('success', `Internal user ${sub.firstName} profile ready for update.`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                            title="Edit Internal User"
                          >
                            <EditPencilIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-600">
              <span className="text-slate-500">
                Total Internal Users: <strong>{internalUsersList.length}</strong>
              </span>
              <button
                onClick={() => setViewMode('DIRECTORY')}
                className="text-xs font-semibold text-[#4a2e80] hover:underline cursor-pointer"
              >
                ← Back to Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Internal User (Image 3) ── */}
      {showAddInternalUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <InternalUsersTeamIcon />
                <span>Add Internal User to {selectedUser?.companyName || selectedUser?.firstName}</span>
              </h3>
              <button
                onClick={() => setShowAddInternalUserModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInternalUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="subFirstName"
                  label="First Name"
                  value={newSubFirstName}
                  onChange={(e) => setNewSubFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  required
                />
                <Input
                  id="subLastName"
                  label="Last Name"
                  value={newSubLastName}
                  onChange={(e) => setNewSubLastName(e.target.value)}
                  placeholder="e.g. Deshmukh"
                  required
                />
              </div>

              <Input
                id="subDesignation"
                label="Designation / Role"
                value={newSubDesignation}
                onChange={(e) => setNewSubDesignation(e.target.value)}
                placeholder="e.g. Farm Supervisor / Agronomist / Accountant"
                required
              />

              <Input
                id="subEmail"
                label="Email Address"
                type="email"
                value={newSubEmail}
                onChange={(e) => setNewSubEmail(e.target.value)}
                placeholder="rahul@company.com"
                required
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddInternalUserModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs !bg-[#4a2e80] hover:!bg-[#3a2268] text-white font-semibold rounded-full"
                >
                  Add Team Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Credentials Inspection (Image 1 "Credentials" Eye Icon) ── */}
      {credentialsUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CredentialsEyeIcon />
                <span>Stakeholder Login Credentials</span>
              </h3>
              <button
                onClick={() => {
                  setCredentialsUser(null);
                  setGeneratedTempPass(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">User:</span>
                  <span className="font-bold text-slate-900">{credentialsUser.firstName} {credentialsUser.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Login Email:</span>
                  <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{credentialsUser.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Account Status:</span>
                  <span className="font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{credentialsUser.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Recent Activity:</span>
                  <span className="font-mono text-slate-700">{credentialsUser.recentActivityAt || 'Sep 8, 2026 3:10 PM'}</span>
                </div>
              </div>

              {generatedTempPass ? (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1">
                  <span className="text-amber-800 font-bold block">Generated Temporary Password:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-slate-900 select-all">{generatedTempPass}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedTempPass);
                        showToast('success', 'Temporary password copied to clipboard.');
                      }}
                      className="text-[11px] font-bold text-[#4a2e80] hover:underline cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-700">Provide this temporary code to the user. They will be prompted to set a permanent password.</p>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      const temp = `Agri#${Math.floor(100000 + Math.random() * 900000)}`;
                      setGeneratedTempPass(temp);
                      showToast('success', 'Temporary credentials generated.');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-purple-50 text-[#4a2e80] border border-purple-200 hover:bg-purple-100 rounded-full transition-colors cursor-pointer"
                  >
                    Reset & Issue Temporary Password
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCredentialsUser(null);
                    setGeneratedTempPass(null);
                  }}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Profile (Image 1 Pencil Icon) ── */}
      {editProfileUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <EditPencilIcon />
                <span>Edit User Profile & Photo: {editProfileUser.firstName} {editProfileUser.lastName}</span>
              </h3>
              <button
                onClick={() => setEditProfileUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar Upload & Selection Section */}
            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100/80 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  {editProfilePicture ? (
                    <img
                      src={editProfilePicture}
                      alt="User Avatar"
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#4a2e80] shadow-2xs bg-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-[#4a2e80] text-white font-bold text-sm flex items-center justify-center shadow-2xs">
                      {getInitials(editFirstName || editProfileUser.firstName, editLastName || editProfileUser.lastName)}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-slate-900">Profile Picture (Base64 / Stored in DB)</p>
                  <p className="text-[10.5px] text-slate-500">Upload a custom image (JPG/PNG) or pick an enterprise role preset.</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#4a2e80] hover:bg-[#382064] text-white rounded-full transition-colors cursor-pointer"
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditPresets(!showEditPresets)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-purple-50 text-[#4a2e80] border border-purple-200 rounded-full transition-colors cursor-pointer"
                    >
                      {showEditPresets ? 'Hide Presets' : 'Choose Preset'}
                    </button>
                    {editProfilePicture && (
                      <button
                        type="button"
                        onClick={() => setEditProfilePicture(null)}
                        className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Selector Tray */}
              {showEditPresets && (
                <div className="pt-2 border-t border-purple-100 grid grid-cols-4 sm:grid-cols-7 gap-1.5 animate-in fade-in duration-150">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setEditProfilePicture(preset.url);
                        setShowEditPresets(false);
                      }}
                      className={`flex flex-col items-center p-1 rounded-md border text-center transition-all cursor-pointer ${
                        editProfilePicture === preset.url
                          ? 'border-[#4a2e80] bg-white ring-1 ring-[#4a2e80]'
                          : 'border-purple-100 hover:border-purple-300 bg-white/80'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-[9px] font-bold text-slate-700 mt-0.5 truncate w-full">{preset.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="editFirstName"
                  label="First Name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                />
                <Input
                  id="editLastName"
                  label="Last Name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  required
                />
              </div>

              <Input
                id="editCompanyName"
                label="Company / Farm Enterprise Name"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                required
              />

              <Input
                id="editPhone"
                label="Phone Number"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />

              <Input
                id="editEmail"
                label="Email Address"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProfileUser(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs !bg-[#4a2e80] hover:!bg-[#3a2268] text-white font-semibold rounded-full"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Direct Create User (Instant Provisioning) ── */}
      {showDirectCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldIcon className="w-4 h-4 text-purple-700" />
                <span>Add Platform User (Instant Provisioning)</span>
              </h3>
              <button
                onClick={() => setShowDirectCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar Upload & Preview */}
            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100/80 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  {createProfilePicture ? (
                    <img
                      src={createProfilePicture}
                      alt="Uploaded Photo"
                      className="w-13 h-13 rounded-full object-cover border-2 border-[#4a2e80] shadow-2xs bg-white"
                    />
                  ) : (
                    <img
                      src={PRESET_AVATARS.find((p) => p.role === role)?.url || '/avatars/avatar_admin_maker.svg'}
                      alt="Role Default"
                      className="w-13 h-13 rounded-full object-cover border-2 border-slate-300 shadow-2xs bg-white"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs font-bold text-slate-900">User Profile Photo (Base64 Stored to DB)</p>
                  <p className="text-[10.5px] text-slate-500">Upload a custom user portrait or leave to default role avatar.</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#4a2e80] hover:bg-[#382064] text-white rounded-full transition-colors cursor-pointer"
                    >
                      Upload Custom Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreatePresets(!showCreatePresets)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-purple-50 text-[#4a2e80] border border-purple-200 rounded-full transition-colors cursor-pointer"
                    >
                      {showCreatePresets ? 'Hide Presets' : 'Choose Preset'}
                    </button>
                    {createProfilePicture && (
                      <button
                        type="button"
                        onClick={() => setCreateProfilePicture(null)}
                        className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCreatePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Selector Tray */}
              {showCreatePresets && (
                <div className="pt-2 border-t border-purple-100 grid grid-cols-4 sm:grid-cols-7 gap-1.5 animate-in fade-in duration-150">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setCreateProfilePicture(preset.url);
                        setShowCreatePresets(false);
                      }}
                      className={`flex flex-col items-center p-1 rounded-md border text-center transition-all cursor-pointer ${
                        createProfilePicture === preset.url
                          ? 'border-[#4a2e80] bg-white ring-1 ring-[#4a2e80]'
                          : 'border-purple-100 hover:border-purple-300 bg-white/80'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-[9px] font-bold text-slate-700 mt-0.5 truncate w-full">{preset.badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleDirectCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Platform Role
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (!createProfilePicture) {
                      // Automatically show role avatar
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                >
                  <option value="FARMER">FARMER (Cultivation & Produce Seller)</option>
                  <option value="BUYER">BUYER (Wholesale & Retail Procurement)</option>
                  <option value="FARM_MANAGER">FARM_MANAGER (Agronomy & Inventory Lead)</option>
                  <option value="WORKER">WORKER (Field Operations & Labor)</option>
                  <option value="ADMIN_MAKER">ADMIN_MAKER (Entity Request Creator)</option>
                  <option value="ADMIN">ADMIN (Full Platform Governance)</option>
                  <option value="MANDI_AGENT">MANDI_AGENT (APMC yard auctions & arrivals)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  id="firstName"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ramesh"
                  required
                  icon={<UserIcon />}
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Patil"
                  required
                  icon={<UserIcon />}
                />
              </div>

              <Input
                id="createCompanyName"
                label="Company / Farm Enterprise Name"
                value={createCompanyName}
                onChange={(e) => setCreateCompanyName(e.target.value)}
                placeholder="e.g. Patil Organic Farms"
              />

              <Input
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                icon={<MailIcon />}
              />

              <Input
                id="phone"
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                icon={<PhoneIcon />}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setShowDirectCreateModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="text-xs !bg-[#4a2e80] hover:!bg-[#3a2268] text-white font-semibold rounded-full shadow-xs">
                  Create Active Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bulk Upload Modal ── */}
      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        title="Bulk Upload Users to Platform"
        description="Upload a CSV spreadsheet to batch-provision multiple user accounts across any authorized role."
        templateFilename="users_upload_template.csv"
        columns={bulkUploadColumns}
        sampleRows={[
          ['Rajesh', 'Patil', 'rajesh.patil@agribridge.com', '+91 98220 11111', 'FARMER', 'Patil Organic Farms'],
          ['Anita', 'Deshmukh', 'anita.buyer@bigbasket.in', '+91 98220 22222', 'BUYER', 'BigBasket Wholesale Hub'],
          ['Vikram', 'Shinde', 'vikram.mgr@agribridge.com', '+91 98220 33333', 'FARM_MANAGER', 'Shinde Agro Estates'],
        ]}
        onImport={handleBulkUploadSubmit}
      />

      {/* ── Reject Reason Modal (Single or Bulk) ── */}
      {(rejectModalId || bulkRejectIds.length > 0) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                <CloseIcon className="w-4 h-4 text-rose-600" />
                <span>
                  Reject {bulkRejectIds.length > 0 ? `${bulkRejectIds.length} User Request(s)` : 'User Request'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setRejectModalId(null);
                  setBulkRejectIds([]);
                  setRejectReason('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide feedback or justification for rejecting this application..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejectModalId(null);
                    setBulkRejectIds([]);
                    setRejectReason('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-xs !bg-rose-700 hover:!bg-rose-800 text-white font-bold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
