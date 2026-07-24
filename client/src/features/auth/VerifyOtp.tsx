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
    <div className="min-h-screen flex">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] right-[-60px] w-80 h-80 bg-teal-500/8 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/[0.03] rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-100 tracking-tight">AgriBridge<span className="text-emerald-400">AI</span></span>
          </div>

          {/* Center messaging */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Email Verification
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-50 leading-tight">
              Verify your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                email address
              </span>
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              We've sent a 6-digit verification code to your email. Enter it below to
              activate your workspace and start managing your FPO operations.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Secure Verification', 'Instant Access', 'Email Security', 'Quick Setup'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom info */}
          <div className="rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/60 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023 3.488a2.25 2.25 0 01-2.183 1.981L2.25 9v.906m0 0l6.478 3.488M2.25 9l6.478-3.488m0 0l1.023-3.488a2.25 2.25 0 012.183-1.981l6.478 3.488" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Code expires in 10 minutes</p>
                <p className="text-xs text-slate-500">Check your spam folder if not received</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 px-6 py-10 relative">
        {/* Subtle bg gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-emerald-950/10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 007.92 12.446A9 9 0 1112 2.992z" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-100">AgriBridge<span className="text-emerald-400">AI</span></span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter the 6-digit code sent to <span className="text-emerald-400 font-medium">{email}</span>
            </p>
          </div>

          {/* Error banner */}
          {error && <ErrorBanner message={error} />}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide mb-1.5 text-slate-400">
                6-Digit OTP Code
              </label>
              <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950/40 transition-all duration-300 focus-within:border-emerald-500/60 focus-within:bg-slate-950/90 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]">
                <span className="pl-3.5 text-slate-600">
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
                  className="w-full bg-transparent px-3 py-3 text-center text-xl font-bold tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none"
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
            <button type="button" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-200">
              Resend OTP
            </button>
          </p>

          {/* Back link */}
          <p className="mt-4 text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
            >
              ← Back to registration
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
