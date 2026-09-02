import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, ErrorBanner, SocialButton, Toast } from '../../components/ui/index.js';
import { MailIcon, LockIcon, UserIcon } from '../../components/ui/index.js';

export default function Register() {
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = [
    'bg-slate-700',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-emerald-500',
    'bg-emerald-400',
  ][passwordStrength];

  const handleSocialClick = useCallback((provider: string) => {
    setToast({ message: `Sign in with ${provider} will be available soon.` });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/register/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, email, password, firstName, lastName }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Tenant registration failed');
      }

      navigate('/verify-otp', { state: { email } });
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
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-white/80 via-transparent to-transparent pointer-events-none" />

        {/* ───── White Glassmorphic Card ───── */}
        <div className="relative z-20 w-full max-w-[440px] ml-auto h-screen flex items-center px-4 py-8">
          <div className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-7 my-auto space-y-5 max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
            
            {/* Platform Name */}
            <div className="pb-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                AgriBridge<span className="text-emerald-600">AI</span>
              </h2>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Create workspace
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Register your FPO organization.
              </p>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Section: Personal */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Personal
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <Input
                    id="firstName"
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Rajesh"
                    icon={<UserIcon />}
                  />
                  <Input
                    id="lastName"
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    icon={<UserIcon />}
                  />
                </div>
              </div>

              {/* Section: Organization */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Organization
                </label>
                <Input
                  id="tenantName"
                  label="FPO Name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="e.g. Nashik Grape Farmers FPO"
                  icon={<UserIcon />}
                />
                <Input
                  id="email"
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  icon={<MailIcon />}
                />
              </div>

              {/* Section: Security */}
              <div className="space-y-2.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Security
                </label>
                <div>
                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    icon={<LockIcon />}
                  />
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                              level <= passwordStrength ? strengthColor : 'bg-slate-700/60'
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-[11px] font-medium transition-colors duration-300 ${
                          passwordStrength <= 1
                            ? 'text-red-400'
                            : passwordStrength <= 2
                            ? 'text-orange-400'
                            : passwordStrength <= 3
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-400 bg-white/60 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit */}
              <Button type="submit" loading={loading} fullWidth className="mt-1">
                {loading ? 'Creating workspace...' : 'Create Workspace'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Or continue with
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <SocialButton
                label="Google"
                onClick={() => handleSocialClick('Google')}
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                }
              />
              <SocialButton
                label="Microsoft"
                onClick={() => handleSocialClick('Microsoft')}
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                    <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                  </svg>
                }
              />
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-slate-600 pt-1">
              Already registered?{' '}
              <Link
                to="/login"
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}