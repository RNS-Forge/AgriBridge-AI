import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, ErrorBanner, Toast, MailIcon } from '../../components/ui/index.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess(true);
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
                Forgot password?
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {success 
                  ? 'Check your email for the OTP code'
                  : 'Enter your email to receive a password reset code'
                }
              </p>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {/* Success message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">OTP sent successfully</p>
                  <p className="text-xs text-emerald-600/80 mt-0.5">Check your email for the 6-digit code</p>
                </div>
              </div>
            )}

            {/* Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" loading={loading} fullWidth className="mt-1">
                  {loading ? 'Sending OTP...' : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                onClick={() => navigate('/reset-password', { state: { email } })}
                fullWidth
              >
                Proceed to Reset Password
              </Button>
            )}

            {/* Back link */}
            <p className="text-center text-sm text-slate-600 pt-1">
              Remember your password?{' '}
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
