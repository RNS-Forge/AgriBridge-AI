import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button/index.js';
import { ErrorBanner } from '../../components/ui/ErrorBanner/index.js';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
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

    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* ───── Static Background Image ───── */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/logo/bg-login.png')" }}
        />
      </div>

      {/* Left Panel: Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] right-[-60px] w-80 h-80 bg-white/15 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AgriBridge<span className="text-emerald-200">AI</span></span>
          </div>

          {/* Center messaging */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Email Verification
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Verify your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-100">
                email address
              </span>
            </h2>

            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              We've sent a 6-digit verification code to your email. Enter it below to
              activate your workspace and start managing your FPO operations.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Secure Verification', 'Instant Access', 'Email Security', 'Quick Setup'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-white/15 border border-white/25 text-xs text-white font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom info */}
          <div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023 3.488a2.25 2.25 0 01-2.183 1.981L2.25 9v.906m0 0l6.478 3.488M2.25 9l6.478-3.488m0 0l1.023-3.488a2.25 2.25 0 012.183-1.981l6.478 3.488" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Code expires in 10 minutes</p>
                <p className="text-xs text-white/70">Check your spam folder if not received</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex items-center justify-center bg-white/60 backdrop-blur-xl px-6 py-10 relative">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-emerald-50/50 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md my-auto max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-800">AgriBridge<span className="text-emerald-600">AI</span></span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-slate-600 mt-1.5">
              Enter the 6-digit code sent to <span className="text-emerald-600 font-medium">{email}</span>
            </p>
          </div>

          {/* Error banner */}
          {error && <ErrorBanner message={error} />}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide mb-1.5 text-slate-600">
                6-Digit OTP Code
              </label>
              <div className="relative flex items-center rounded-xl border border-slate-300 bg-white transition-all duration-300 focus-within:border-emerald-500/60 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]">
                <span className="pl-3.5 text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-center text-xl font-bold tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none"
                  placeholder="000000"
                />
              </div>
            </div>

            <Button type="submit" loading={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </form>

          {/* Resend link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button type="button" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200">
              Resend OTP
            </button>
          </p>

          {/* Back link */}
          <p className="mt-4 text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
            >
              ← Back to registration
            </button>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
