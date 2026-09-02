import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input, Button, ErrorBanner, LockIcon } from '../../components/ui/index.js';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: '000000', newPasswordPlain: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      navigate('/login');
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
        {/* ───── Static Background Image ───── */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/logo/bg-login.png')" }}
          />
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-white/80 via-transparent to-transparent pointer-events-none" />

        {/* ───── Floating Form Card ───── */}
        <div className="relative z-20 w-full max-w-[440px] ml-auto h-screen flex items-center px-4 py-10">
          <div className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-8 space-y-6 my-auto max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
            
            {/* Platform Name */}
            <div className="pb-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                AgriBridge<span className="text-emerald-600">AI</span>
              </h2>
            </div>

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Reset your password
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Create a new password for <span className="text-emerald-600 font-medium">{email}</span>
              </p>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="password"
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                icon={<LockIcon />}
              />

              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                icon={<LockIcon />}
              />

              <Button type="submit" loading={loading} fullWidth className="mt-1">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            {/* Back link */}
            <p className="text-center text-sm text-slate-600 pt-1">
              <Link
                to="/login"
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
