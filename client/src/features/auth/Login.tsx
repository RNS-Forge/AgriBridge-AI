import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { Input, Button, ErrorBanner, SocialButton, Toast, MailIcon, LockIcon } from '../../components/ui/index.js';

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
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
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

  // Note: Using direct Unsplash URLs matching your exact search queries because 
  // Getty/iStock block direct hotlinking (returns 403 Forbidden in browsers).
  const bgImages = [
    'https://imgs.search.brave.com/vDEVJyM_z-BG4DQo6Dhp3LhTHRsdrGyqLdA-kfHjfpg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI0/Njc3Nzg0L3Bob3Rv/L3RyYWN0b3Itc2ls/aG91ZXR0ZS5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9RGhH/alFLQk1JR0J2OFpY/NDhCa1VhZDJIVzhL/OENCTEhOaFlrNWZZ/T1ljbz0', // Tamil Nadu Paddy
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop', // Indian Farmer
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop', // Agriculture farming
  ];

  return (
    <>
      {/* Custom CSS for Cinematic Crossfade + Ken Burns Loop */}
      <style>{`
  @keyframes cinematicCrossfade {
    0% { opacity: 0; transform: scale(1.0) translate(0%, 0%); }
    5% { opacity: 1; }
    25% { opacity: 1; transform: scale(1.15) translate(-2%, -1%); }
    30% { opacity: 0; transform: scale(1.15) translate(-2%, -1%); }
    100% { opacity: 0; transform: scale(1.0) translate(0%, 0%); }
  }
  .bg-image-slide {
    position: absolute;
    inset: -20px;
    background-size: cover;
    background-position: center;
    opacity: 0;
    animation: cinematicCrossfade 24s infinite;
  }
  .bg-image-slide:nth-child(1) { animation-delay: 0s; }
  .bg-image-slide:nth-child(2) { animation-delay: 6s; }
  .bg-image-slide:nth-child(3) { animation-delay: 12s; }
  .bg-image-slide:nth-child(4) { animation-delay: 18s; }

  /* Hide scrollbar */
  .scrollbar-transparent::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-transparent {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>

      <div className="h-screen relative flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        {/* Toast */}
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

        {/* ───── 90% Transparent Background Image Loop ───── */}
        <div className="absolute inset-0 z-0">
          {bgImages.map((img, index) => (
            <div 
              key={index}
              className="bg-image-slide"
              style={{ backgroundImage: `url('${img}')` }}
            />
          ))}
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-white/80 via-transparent to-transparent pointer-events-none" />

        {/* ───── Floating Form Card ───── */}
        <div className="relative z-20 w-full max-w-[440px] ml-auto h-screen flex items-center px-4 py-10">
          <div className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-8 space-y-6 my-auto max-h-[calc(100vh-80px)] overflow-y-auto 0 scrollbar-transparent ">
            
            {/* Platform Name (No Logo) */}
            <div className="pb-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                AgriBridge<span className="text-emerald-600">AI</span>
              </h2>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Sign in to your workspace.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                icon={<MailIcon />}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                icon={<LockIcon />}
              />

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="h-3.5 w-3.5 rounded border-slate-400 bg-white/60 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer" 
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button type="submit" loading={loading} fullWidth className="mt-1">
                {loading ? 'Signing in...' : 'Login'}
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

            {/* Social buttons (Google & Microsoft Only) */}
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
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}