import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Logo } from '../../components/ui/index.js';
import {
  ShieldIcon,
  CheckCircleIcon,
  CheckIcon,
  UsersIcon,
  UserIcon,
  MailIcon,
  BuildingIcon,
  AlertTriangleIcon,
} from '../../components/ui/icons/index.js';

interface RoleOption {
  id: string;
  name: string;
  category: 'CORE' | 'OPERATIONS' | 'COMMERCE' | 'GOVERNANCE';
  description: string;
  permissions: string[];
  badgeColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'FARMER',
    name: 'Farmer (Producer)',
    category: 'CORE',
    description: 'Cultivates crops, records real field expenses, monitors real cost-basis, and lists produce for sale.',
    permissions: ['Farms & Plots', 'Crop Lifecycle', 'Expenses & Cost Basis', 'Marketplace & Mandi', 'Profit Reports'],
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    id: 'FARM_MANAGER',
    name: 'Farm Manager',
    category: 'OPERATIONS',
    description: 'Supervises daily field operations, updates crop stages, assigns worker tasks, and tracks consumable inventory.',
    permissions: ['Farms & Plots', 'Crop Cycles', 'Field Task Allocation', 'Consumables & Stock', 'Expenses'],
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-300',
  },
  {
    id: 'WORKER',
    name: 'Field Worker',
    category: 'OPERATIONS',
    description: 'Executes field work, marks task completion, uploads GPS photo proof, and tracks daily labor wages.',
    permissions: ['My Assigned Tasks', 'Photo Proof Upload', 'Wage Log'],
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    id: 'BUYER',
    name: 'Commercial Buyer',
    category: 'COMMERCE',
    description: 'Discovers verified harvests, negotiates price directly with farmers, submits offers, and tracks logistics.',
    permissions: ['Produce Marketplace', 'Direct Offers', 'Order Tracking & Proof'],
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  {
    id: 'MANDI_AGENT',
    name: 'Mandi Commission Agent',
    category: 'COMMERCE',
    description: 'Manages APMC yard arrival slots, records farmer gate passes, logs auction prices, and facilitates payments.',
    permissions: ['Mandi Slot Booking', 'Arrival Approvals', 'Auction Price Recording'],
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  },
  {
    id: 'ADMIN_MAKER',
    name: 'Admin Maker',
    category: 'GOVERNANCE',
    description: 'Operational maker under four-eye principle. Can draft and request user accounts awaiting Admin approval.',
    permissions: ['Draft Role Requests', 'My Request Tracker'],
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
  },
  {
    id: 'ADMIN',
    name: 'Platform Administrator',
    category: 'GOVERNANCE',
    description: 'Full administrative authority. Manages user directory, creates any role directly, moderates listings, and resolves disputes.',
    permissions: ['User Management', 'Instant User Creation', 'Produce Moderation', 'Disputes Center', 'Audit Logs'],
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
  },
];

const PhoneIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export default function AdminCreateUserView() {
  const navigate = useNavigate();

  const [role, setRole] = useState('FARMER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedRoleMeta = ROLE_OPTIONS.find((r) => r.id === role) || ROLE_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          role,
          department: department.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create user account');
      }

      setCreatedUser(data.data);
      // Reset input fields
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setDepartment('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdUser) return;
    const text = `Email: ${createdUser.email}\nPassword: AgriBridgeAI@2026\nRole: ${createdUser.roles?.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-full pb-8">
      {/* ───── Top Navigation Breadcrumb / Actions Bar ───── */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>User Management</span>
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-xs font-bold text-emerald-800">Create Platform User</span>
        </div>
        <Link
          to="/admin/users"
          className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
        >
          <UsersIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Manage All Users</span>
        </Link>
      </div>

      {/* ───── Immersive Workspace Hero Card (Matching Sign-in Page Style & Background) ───── */}
      <div className="relative min-h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 flex flex-col lg:flex-row">
        
        {/* ───── Static Background Artwork (Identical to Sign-In Page) ───── */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/logo/bg-login.png')" }}
          />
        </div>

        {/* ───── Smooth Gradient Overlays for Readability ───── */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-white/95 pointer-events-none hidden lg:block" />
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm pointer-events-none lg:hidden" />

        {/* ───── Left Column: Hero Context, Brand & Selected Role Dossier ───── */}
        <div className="relative z-20 w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-between text-white space-y-6">
          
          {/* Top Brand Tag */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 mb-4">
              <ShieldIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                Administrator Privileged Provisioning
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Provision Platform Stakeholders
            </h1>
            <p className="text-xs lg:text-sm text-slate-200 mt-2 max-w-md leading-relaxed">
              Direct administrator onboarding under enterprise governance. Provision verified identities across all 7 platform roles with instant login credentials and zero maker-checker queue delay.
            </p>
          </div>

          {/* Three Key Platform Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Instant Activation
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Bypasses queue; creates active user immediately.
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Standard Auth
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Pre-configured initial password with prompt to rotate.
              </p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Audit Trail
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">
                Event logged to tamper-evident compliance ledger.
              </p>
            </div>
          </div>

          {/* Live Selected Role Dossier Card */}
          <div className="bg-slate-900/75 backdrop-blur-xl rounded-xl border border-white/15 p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Role Profile
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                {selectedRoleMeta.category}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{selectedRoleMeta.name}</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {selectedRoleMeta.description}
              </p>
            </div>

            <div className="pt-1.5 border-t border-white/10">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Authorized Permissions & Access Modules
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoleMeta.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-white/10 text-emerald-200 border border-white/10 font-medium"
                  >
                    <CheckIcon className="w-3 h-3 text-emerald-400" />
                    <span>{perm}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="text-[11px] text-slate-300 flex items-center gap-2">
            <ShieldIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Four-eye security principles enforced across all administrative actions.</span>
          </div>
        </div>

        {/* ───── Right Column: Floating Form Card (Mirroring Sign-In Page Design) ───── */}
        <div className="relative z-20 w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-[500px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-xl p-6 lg:p-7 space-y-4 my-auto max-h-[calc(100vh-160px)] overflow-y-auto table-scroll">
            
            {/* Platform Brand Header (Option 3 Brand, matching Sign-in Page) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <Logo variant="option3" size="md" showText={true} />
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                <ShieldIcon className="w-3 h-3 text-purple-700" />
                Admin
              </span>
            </div>

            {/* Header Text */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Create User Account
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Fill in the details below to provision a verified enterprise identity.
              </p>
            </div>

            {/* Success State Callout */}
            {createdUser && (
              <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-300 text-xs text-emerald-950 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <strong className="font-bold text-emerald-900">User Account Provisioned!</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatedUser(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="bg-white p-2.5 rounded-md border border-emerald-200 space-y-1 font-mono text-[11px]">
                  <div>Name: <strong className="text-slate-800">{createdUser.firstName} {createdUser.lastName}</strong></div>
                  <div>Email: <strong className="text-slate-800">{createdUser.email}</strong></div>
                  <div>Role: <strong className="text-emerald-700 uppercase">{createdUser.roles?.[0]}</strong></div>
                  <div>Password: <strong className="text-emerald-800">AgriBridgeAI@2026</strong></div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={handleCopyCredentials}
                    className="text-xs !bg-emerald-700 hover:!bg-emerald-800 text-white font-bold flex-1"
                  >
                    {copied ? '✓ Copied!' : 'Copy Credentials'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/users')}
                    className="text-xs flex-1"
                  >
                    View Directory →
                  </Button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900 flex items-start gap-2 shadow-2xs">
                <AlertTriangleIcon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            {/* Creation Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Role Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Platform Role <span className="text-rose-600">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — [{r.category}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rajesh"
                  required
                  icon={<UserIcon />}
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Shinde"
                  required
                  icon={<UserIcon />}
                />
              </div>

              {/* Email Address */}
              <Input
                id="email"
                label="Official Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                icon={<MailIcon />}
              />

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  icon={<PhoneIcon />}
                />
                <Input
                  id="department"
                  label="Department / FPO"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Nashik Cluster"
                  icon={<BuildingIcon className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Pre-configured Password Info (Matching Sign-in style notice box) */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed flex items-start gap-2">
                <ShieldIcon className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-slate-700">Pre-configured Password: </span>
                  Initial password will be set to <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold text-emerald-800">AgriBridgeAI@2026</code>. The user can log in immediately and rotate credentials anytime.
                </div>
              </div>

              {/* Submit Button (Matching Sign-in button) */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                className="!bg-emerald-700 hover:!bg-emerald-800 text-white font-bold py-2.5 shadow-xs"
              >
                {loading ? 'Provisioning Account...' : `Provision Active ${selectedRoleMeta.name}`}
              </Button>

              {/* Clear Form / Cancel Links */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setFirstName('');
                    setLastName('');
                    setPhone('');
                    setDepartment('');
                  }}
                  className="text-slate-500 hover:text-slate-700 transition-colors font-medium"
                >
                  Clear Fields
                </button>
                <Link
                  to="/admin/users"
                  className="text-emerald-700 hover:text-emerald-800 transition-colors font-semibold"
                >
                  Return to User Directory →
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
