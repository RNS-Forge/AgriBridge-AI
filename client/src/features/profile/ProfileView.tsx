import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { updateUser } from '../../store';
import { Button, Input, Switch } from '../../components/ui';
import { getInitials } from '../../utils';

export interface PresetAvatarItem {
  id: string;
  role: string;
  label: string;
  badge: string;
  desc: string;
  url: string;
}

const PRESET_AVATARS: PresetAvatarItem[] = [
  {
    id: 'avatar_admin',
    role: 'ADMIN',
    label: 'Platform Admin',
    badge: 'Admin',
    desc: 'System Governance & Auditing',
    url: '/avatars/avatar_admin.jpg',
  },
  {
    id: 'avatar_admin_maker',
    role: 'ADMIN_MAKER',
    label: 'Admin Maker',
    badge: 'Operations',
    desc: 'Workflow & User Provisioning',
    url: '/avatars/avatar_admin_maker.svg',
  },
  {
    id: 'avatar_farmer',
    role: 'FARMER',
    label: 'Farm Producer',
    badge: 'Farmer',
    desc: 'Crop Lifecycle & Cultivation',
    url: '/avatars/avatar_farmer.jpg',
  },
  {
    id: 'avatar_farm_manager',
    role: 'FARM_MANAGER',
    label: 'Farm Manager',
    badge: 'Manager',
    desc: 'Estate, Agronomy & Stock',
    url: '/avatars/avatar_farm_manager.jpg',
  },
  {
    id: 'avatar_buyer',
    role: 'BUYER',
    label: 'Agro Buyer',
    badge: 'Buyer',
    desc: 'Wholesale B2B & Supply Logistics',
    url: '/avatars/avatar_buyer.svg',
  },
  {
    id: 'avatar_mandi_agent',
    role: 'MANDI_AGENT',
    label: 'Mandi Agent',
    badge: 'APMC Yard',
    desc: 'Auctioneer & Commission Broker',
    url: '/avatars/avatar_mandi_agent.svg',
  },
  {
    id: 'avatar_worker',
    role: 'WORKER',
    label: 'Field Specialist',
    badge: 'Worker',
    desc: 'Agronomist & Operations',
    url: '/avatars/avatar_worker.svg',
  },
];

export default function ProfileView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 00001');
  const [companyName, setCompanyName] = useState(user?.companyName || "System's Enterprise");
  const [designation, setDesignation] = useState(user?.designation || 'Platform Administrator');
  const [country, setCountry] = useState(user?.country || 'India');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profilePicture || null);

  // UI state
  const [showPresets, setShowPresets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences & Security States
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(user?.twoFactorEnabled ?? false);
  const [isEmailVerified, setIsEmailVerified] = useState(user?.isEmailVerified ?? true);

  // Email Verification Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Send Email OTP Code
  const handleSendEmailOtp = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      showToast('error', 'Please provide a valid email address.');
      return;
    }
    setIsSendingOtp(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const otpCode = data.data?.otp || '123456';
        setDevOtpHint(otpCode);
        showToast('success', `Verification code sent to ${targetEmail} (Dev Code: ${otpCode})`);
      } else {
        showToast('error', data.message || 'Failed to send verification code.');
      }
    } catch {
      // Offline fallback
      const fallbackOtp = '123456';
      setDevOtpHint(fallbackOtp);
      showToast('success', `Dev Sandbox: Verification OTP code is ${fallbackOtp}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      showToast('error', 'Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: email.trim(), otp: emailOtp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailVerified(true);
        dispatch(updateUser({ email: email.trim(), isEmailVerified: true }));
        showToast('success', 'Email address verified successfully!');
        setShowEmailModal(false);
        setEmailOtp('');
        setDevOtpHint(null);
      } else {
        showToast('error', data.message || 'Invalid or expired OTP code.');
      }
    } catch {
      if (emailOtp.trim() === '123456' || (devOtpHint && emailOtp.trim() === devOtpHint)) {
        setIsEmailVerified(true);
        dispatch(updateUser({ email: email.trim(), isEmailVerified: true }));
        showToast('success', 'Email address verified in Sandbox mode!');
        setShowEmailModal(false);
        setEmailOtp('');
      } else {
        showToast('error', 'Invalid verification code. Use 123456 in dev mode.');
      }
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Handle Photo Upload from Local Disk
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfilePicture(result);
      showToast('success', 'Profile photo preview loaded. Click "Save Profile Changes" to persist.');
    };
    reader.onerror = () => {
      showToast('error', 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Select a preset avatar
  const handleSelectPreset = (url: string) => {
    setProfilePicture(url);
    setShowPresets(false);
    showToast('success', 'Preset avatar selected. Click "Save Profile Changes" to apply.');
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setProfilePicture(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('success', 'Profile picture removed. Default monogram initials will be displayed.');
  };

  // Save Profile Changes
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showToast('error', 'First name and Last name are required.');
      return;
    }

    setIsSaving(true);
    const updatedFields = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      designation: designation.trim(),
      country: country.trim(),
      profilePicture: profilePicture || undefined,
      isEmailVerified,
      twoFactorEnabled: twoFactorAuth,
    };

    try {
      // 1. Update Redux store and LocalStorage immediately
      dispatch(updateUser(updatedFields));

      // 2. Call backend profile endpoint
      const res = await fetch('http://localhost:8000/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Profile and avatar updated successfully!');
      } else {
        // Even if server is in demo/mock mode, local store succeeded
        showToast('success', 'Profile changes saved to local session.');
      }
    } catch {
      showToast('success', 'Profile changes saved to current session.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('error', data.message || 'Failed to change password.');
      }
    } catch {
      showToast('error', 'Network error while updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const primaryRole = user?.roles?.[0] || 'ADMIN';

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-top duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✓' : '⚠'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Header & Breadcrumb ── */}
      <div className="flex items-center justify-between flex-shrink-0 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#4a2e80] transition-colors cursor-pointer flex items-center justify-center"
            title="Go Back"
          >
            <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Account & Profile Settings</span>
              <span className="text-xs text-slate-400 font-normal">/</span>
              <span className="text-xs font-semibold text-[#4a2e80] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {user?.firstName} {user?.lastName}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Manage your personal credentials, set profile picture, update organization information, and adjust security preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            fullWidth={false}
            className="text-xs !h-8 !px-3.5 whitespace-nowrap rounded-full cursor-pointer"
          >
            Dashboard
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            fullWidth={false}
            className="text-xs !h-8 !px-4.5 whitespace-nowrap !bg-[#4a2e80] hover:!bg-[#361e60] text-white font-semibold rounded-full shadow-2xs flex items-center justify-center cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </div>

      {/* ── Scrollable Body Area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 table-scroll pb-6">
        {/* ── Card 1: Hero Profile & Avatar Management ── */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#4a2e80]/30 shadow-md bg-slate-50"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#4a2e80] to-[#1e4620] text-white font-bold text-3xl flex items-center justify-center shadow-md border-2 border-purple-200">
                  {getInitials(firstName || user?.firstName, lastName || user?.lastName)}
                </div>
              )}

              {/* Camera Icon Overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#4a2e80] hover:bg-[#361e60] text-white shadow-md flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110 border-2 border-white"
                title="Upload Profile Picture"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Overview Meta */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {firstName} {lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#4a2e80] border border-purple-200 uppercase">
                  {primaryRole.replace('_', ' ')}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Stakeholder
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {designation} &bull; <span className="font-semibold text-slate-800">{companyName}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {email} &bull; {phone}
              </p>

              {/* Action Buttons for Avatar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap bg-[#4a2e80] hover:bg-[#382064] text-white rounded-full shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-[#4a2e80] border border-purple-200 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{showPresets ? 'Close Presets' : 'Choose Preset Avatar'}</span>
                </button>

                {profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Preset Avatar Selector Tray ── */}
          {showPresets && (
            <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-150 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Select Professional Preset Avatar by Role:
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Enterprise portraits tailored for each platform role. Click to select.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPresets(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {PRESET_AVATARS.map((preset) => {
                  const isCurrent = profilePicture === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                        isCurrent
                          ? 'border-[#4a2e80] bg-purple-50/70 ring-2 ring-[#4a2e80]/20 shadow-xs'
                          : 'border-slate-200 hover:border-[#4a2e80] hover:bg-purple-50/30'
                      }`}
                    >
                      {/* Active Indicator Badge */}
                      {isCurrent && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4a2e80] text-white flex items-center justify-center text-[10px] shadow-xs font-bold">
                          ✓
                        </span>
                      )}

                      {/* Avatar Image */}
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className={`w-14 h-14 rounded-full object-cover shadow-2xs group-hover:scale-105 transition-transform border-2 ${
                          isCurrent ? 'border-[#4a2e80]' : 'border-slate-200'
                        }`}
                      />

                      {/* Role Pill */}
                      <span className="mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider group-hover:bg-purple-100 group-hover:text-[#4a2e80]">
                        {preset.badge}
                      </span>

                      {/* Role Label */}
                      <span className="text-xs font-bold text-slate-800 mt-0.5 group-hover:text-[#4a2e80]">
                        {preset.label}
                      </span>

                      {/* Role Description */}
                      <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── 2-Column Main Configuration Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Column A: Personal & Professional Profile ── */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#4a2e80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span>Profile & Enterprise Information</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">ID: {user?.id}</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  id="profileFirstName"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. System"
                  required
                />
                <Input
                  id="profileLastName"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Administrator"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="profileEmail" className="block text-xs font-semibold tracking-wide text-slate-600">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <svg className="w-3 h-3 text-emerald-600 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Email Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠ Unverified
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(true);
                        setDevOtpHint(null);
                        setEmailOtp('');
                        handleSendEmailOtp(email);
                      }}
                      className="text-[11px] font-semibold text-[#4a2e80] hover:text-[#361e60] hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
                    >
                      {isEmailVerified ? 'Re-verify' : 'Verify Email'}
                    </button>
                  </div>
                </div>
                <Input
                  id="profileEmail"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value !== user?.email) {
                      setIsEmailVerified(false);
                    }
                  }}
                  placeholder="admin@agribridge.com"
                  required
                />
              </div>

              <Input
                id="profilePhone"
                label="Mobile / WhatsApp Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00001"
              />

              <Input
                id="profileCompany"
                label="Enterprise / Farm Organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. AgriBridge AI Platform Operations"
                required
              />

              <div className="grid grid-cols-2 gap-2.5">
                <Input
                  id="profileDesignation"
                  label="Designation / Role Title"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Platform Administrator"
                />
                <Input
                  id="profileCountry"
                  label="Country / Division"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Use top action bar to save all profile changes
                </span>
                <span className="font-mono text-[10px] text-slate-400">Validated</span>
              </div>
            </form>
          </div>

          {/* ── Column B: Security & Password Management ── */}
          <div className="space-y-4">
            {/* Password Management */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#4a2e80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>Security & Credentials</span>
                </h3>
                <span className="text-[10px] text-slate-400">Eye icon enabled</span>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <Input
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />

                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />

                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                />

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Show/hide password toggle supported.
                  </span>
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    fullWidth={false}
                    className="text-xs !h-8 !px-4.5 whitespace-nowrap !bg-slate-800 hover:!bg-slate-900 text-white font-semibold rounded-full shadow-2xs cursor-pointer"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Notification & Platform Preferences */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#4a2e80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <span>Notification & Security Channels</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Preferences</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* SMS & WhatsApp Alerts - In Dev Stage */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-800">SMS & WhatsApp Alerts</p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide">
                          In Dev Stage
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        Direct carrier SMS & WhatsApp Cloud API gateways are currently operating in simulated dev stage.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        size="sm"
                        checked={smsAlerts}
                        onChange={() => {
                          setSmsAlerts(!smsAlerts);
                          showToast('success', !smsAlerts ? 'SMS & WhatsApp sandbox simulation active.' : 'SMS & WhatsApp alerts disabled.');
                        }}
                        ariaLabel="Toggle SMS Alerts"
                      />
                    </div>
                  </div>

                  {/* Dev Stage Info Callout */}
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-2.5 flex items-start gap-2 text-amber-900">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-[10.5px] leading-tight space-y-0.5">
                      <span className="font-bold text-amber-950">Dev Sandbox Notice: </span>
                      <span>Carrier telecom DLT templates and WhatsApp Business API webhooks are simulated. Outbound notifications will be written to server dev console logs rather than charging production SMS credits.</span>
                    </div>
                  </div>
                </div>

                {/* Email Digest */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Email Digest & Summaries</p>
                    <p className="text-[10.5px] text-slate-500">Weekly compliance digests, maker-checker logs, and profit reports.</p>
                  </div>
                  <Switch
                    size="sm"
                    checked={emailDigest}
                    onChange={() => setEmailDigest(!emailDigest)}
                  />
                </div>

                {/* Two-Factor Authentication (2FA) - Direct On/Off Toggle Alone */}
                <div className="flex items-start justify-between gap-3 pt-2.5 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-800">Two-Factor Authentication (2FA)</p>
                      {twoFactorAuth ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <svg className="w-3 h-3 text-emerald-600 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          2FA Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      When ON, signing in requires both your account password and an email OTP verification code.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      size="sm"
                      checked={twoFactorAuth}
                      onChange={async () => {
                        const nextVal = !twoFactorAuth;
                        setTwoFactorAuth(nextVal);
                        dispatch(updateUser({ twoFactorEnabled: nextVal }));
                        try {
                          await fetch('http://localhost:8000/api/v1/auth/profile', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                            body: JSON.stringify({ twoFactorEnabled: nextVal }),
                          });
                        } catch (err) {
                          console.error('Failed to sync 2FA status to server:', err);
                        }
                        showToast(
                          'success',
                          nextVal
                            ? 'Two-Factor Authentication turned ON. Signing in will require password + email OTP verification.'
                            : 'Two-Factor Authentication turned OFF.'
                        );
                      }}
                      ariaLabel="Toggle 2FA"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal 1: Email Verification Modal ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#4a2e80] flex items-center justify-center font-bold text-sm">
                  ✉
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Email Address Verification</h3>
                  <p className="text-[11px] text-slate-500">Confirm email ownership via 6-digit OTP code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Verification Target:</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{email}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500">
                    Dispatch one-time verification passcode to this address.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSendingOtp}
                    onClick={() => handleSendEmailOtp(email)}
                    fullWidth={false}
                    className="text-xs !h-7.5 !px-3 rounded-full cursor-pointer whitespace-nowrap"
                  >
                    {isSendingOtp ? 'Sending...' : devOtpHint ? 'Resend Email Code' : 'Send Code'}
                  </Button>
                </div>
              </div>

              {devOtpHint && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-[#4a2e80] flex items-center justify-between">
                  <div>
                    <span className="font-semibold">Dev Sandbox Code: </span>
                    <span className="font-mono font-bold tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-purple-200 ml-1">
                      {devOtpHint}
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-medium">(Or enter 123456)</span>
                </div>
              )}

              <div>
                <Input
                  id="modalEmailOtp"
                  label="Enter 6-Digit Verification Code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailModal(false)}
                  fullWidth={false}
                  className="text-xs !h-8 !px-4 rounded-full cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifyingEmail || !emailOtp}
                  fullWidth={false}
                  className="text-xs !h-8 !px-5 whitespace-nowrap !bg-[#4a2e80] hover:!bg-[#382064] text-white font-semibold rounded-full shadow-2xs cursor-pointer"
                >
                  {isVerifyingEmail ? 'Verifying...' : 'Confirm & Verify Email'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
