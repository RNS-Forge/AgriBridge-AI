import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, ErrorBanner, Toast } from '../../components/ui/index.js';
import { MailIcon, LockIcon, UserIcon } from '../../components/ui/index.js';

export default function Register() {
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('AgriBridgeAI@2026');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState('FARMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct sign-up is disabled; instead, it submits an Account Request for Admin Approval
      const res = await fetch('http://localhost:8000/api/v1/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          requestedRole,
          notes: `Organization / Farm: ${tenantName || 'Individual'}`,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Request submission failed');
      }

      setSubmittedRequest(data.data);
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Custom CSS for hiding scrollbar */}
      <style>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>

      <div className="h-screen relative flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        {/* Toast */}
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

        {/* ───── Static Background Image ───── */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/logo/bg-login.png')" }}
          />
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-white/85 via-white/40 to-transparent pointer-events-none" />

        {/* ───── White Glassmorphic Card ───── */}
        <div className="relative z-20 w-full max-w-[460px] ml-auto h-screen flex items-center px-4 py-6">
          <div className="w-full bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-7 my-auto space-y-4 max-h-[calc(100vh-32px)] overflow-y-auto scrollbar-hide">
            
            {/* Platform Name */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                AgriBridge<span className="text-emerald-600">AI</span>
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Approval Queue
              </span>
            </div>

            {submittedRequest ? (
              /* Success confirmation state */
              <div className="space-y-4 py-4 text-center">
                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Account Request Submitted!</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Per platform security policy, open self-signup is disabled. Your account request for <strong className="text-emerald-700">{submittedRequest.email}</strong> as <strong className="text-emerald-700">{submittedRequest.requestedRole}</strong> has been routed to the <strong>Admin Approval Queue</strong>.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Request ID:</span>
                    <span className="font-mono font-medium text-slate-700">{submittedRequest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      PENDING_APPROVAL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Default Password:</span>
                    <span className="font-mono text-emerald-700 font-semibold">AgriBridgeAI@2026</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Tip: For instant testing, you can sign in right now with the pre-seeded credentials for any role from the login page!
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Button onClick={() => navigate('/login')} fullWidth>
                    Return to Role Login
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSubmittedRequest(null)}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    Request workspace access
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Submit request for Admin review and activation.
                  </p>
                </div>

                {/* Error */}
                {error && <ErrorBanner message={error} />}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-3.5">
                  {/* Section: Personal */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Personal Details
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="firstName"
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Rajesh"
                        required
                        icon={<UserIcon />}
                      />
                      <Input
                        id="lastName"
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Sharma"
                        required
                        icon={<UserIcon />}
                      />
                    </div>
                  </div>

                  {/* Section: Organization & Role */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Role & Organization
                    </label>
                    <div>
                      <label htmlFor="roleSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Desired Role
                      </label>
                      <select
                        id="roleSelect"
                        value={requestedRole}
                        onChange={(e) => setRequestedRole(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white/90 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="FARMER">Farmer (Cultivation, Cost Basis & Sell)</option>
                        <option value="FARM_MANAGER">Farm Manager (Operations & Inventory)</option>
                        <option value="WORKER">Worker (Tasks & Field Execution)</option>
                        <option value="BUYER">Buyer (Marketplace Procurement)</option>
                        <option value="MANDI_AGENT">Mandi Agent (APMC Arrival & Auctions)</option>
                      </select>
                    </div>

                    <Input
                      id="tenantName"
                      label="Farm / Organization Name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Surya Green Valley Farms"
                      icon={<UserIcon />}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@agribridge.com"
                        required
                        icon={<MailIcon />}
                      />
                      <Input
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        icon={<UserIcon />}
                      />
                    </div>
                  </div>

                  {/* Section: Security */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <Input
                      id="password"
                      label="Desired Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Default: AgriBridgeAI@2026"
                      icon={<LockIcon />}
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 pt-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      defaultChecked
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-400 bg-white text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <span className="text-emerald-600 font-medium">Terms of Service</span> and{' '}
                      <span className="text-emerald-600 font-medium">Privacy Policy</span>
                    </label>
                  </div>

                  {/* Submit */}
                  <Button type="submit" loading={loading} fullWidth className="mt-1">
                    {loading ? 'Submitting Request...' : 'Submit Request for Approval'}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                    Quick Access
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 pt-0.5">
                  Already have access or test role?{' '}
                  <Link
                    to="/login"
                    className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                  >
                    Sign in with Demo Roles
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}