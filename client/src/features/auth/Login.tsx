import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { Input, Button, ErrorBanner, SocialButton, Toast, MailIcon, LockIcon } from '../../components/ui/index.js';
import { API_BASE_URL } from '../../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSocialClick = (provider: string) => {
    setToast({ message: `Sign in with ${provider} will be available soon.` });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

        {/* ───── Floating Form Card ───── */}
        <div className="relative z-20 w-full max-w-[480px] ml-auto h-screen flex items-center px-4 py-8">
          <div className="w-full bg-white/75 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-7 space-y-5 my-auto max-h-[calc(100vh-40px)] overflow-y-auto scrollbar-hide">
            
            {/* Platform Brand */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  AgriBridge<span className="text-emerald-600">AI</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Cultivate → Sell Enterprise Platform</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Secure Portal
              </span>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Enter your authorized credentials to access your workspace.
              </p>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                id="email"
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                autoComplete="email"
                icon={<MailIcon />}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                icon={<LockIcon />}
              />

              {/* Options Row */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="h-3.5 w-3.5 rounded border-slate-400 bg-white text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer" 
                  />
                  <span className="text-xs text-slate-600">Remember credentials</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" loading={loading} fullWidth className="mt-1">
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* Link to Demo Login Sandbox if enabled in environment */}
            {import.meta.env.VITE_DEMO !== 'false' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <p className="text-[11px] text-slate-500 font-medium">Looking for testing accounts?</p>
                <Link
                  to="/demo/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>🎮 Try Demo / Sandbox Login →</span>
                </Link>
              </div>
            )}

            {/* Platform Role Workflow Info Notice */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              <span className="font-semibold text-slate-700">Access Governance: </span>
              Closed enterprise registration. New accounts require Admin authorization or an Admin Maker invitation.
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                Enterprise SSO
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-2.5">
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
            <p className="text-center text-xs text-slate-600 pt-0.5">
              Need access?{' '}
              <Link
                to="/register"
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Request Workspace Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}