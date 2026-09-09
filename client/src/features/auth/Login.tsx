import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { Input, Button, ErrorBanner, SocialButton, Toast, MailIcon, LockIcon, Logo } from '../../components/ui/index.js';
import { API_BASE_URL } from '../../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const [is2FAStage, setIs2FAStage] = useState(false);
  const [twoFaOtp, setTwoFaOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendingOtp, setResendingOtp] = useState(false);

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

      // Check if user has 2FA enabled
      if (data.requires2FA) {
        setIs2FAStage(true);
        setDevOtpHint(data.data?.otp || null);
        setToast({ message: data.message || `2FA verification code sent to ${email}` });
        return;
      }

      dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaOtp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login-verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: twoFaOtp.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired 2FA code');
      }

      dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FAOtp = async () => {
    setResendingOtp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const otpCode = data.data?.otp || '123456';
        setDevOtpHint(otpCode);
        setToast({ message: `New code sent to ${email} (Dev Code: ${otpCode})` });
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch {
      setDevOtpHint('123456');
      setToast({ message: 'Dev Sandbox: Verification code is 123456' });
    } finally {
      setResendingOtp(false);
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
          <div className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-md shadow-sm p-7 space-y-5 my-auto max-h-[calc(100vh-40px)] overflow-y-auto scrollbar-hide">
            
            {/* Platform Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <Logo variant="option3" size="md" showText={true} />
            </div>

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {is2FAStage && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Step 2 of 2: Two-Factor Authentication
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                {is2FAStage ? 'Two-Factor Verification (2FA)' : 'Sign in to your account'}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {is2FAStage
                  ? `Enter the 6-digit verification code sent to your email to complete login.`
                  : 'Enter your authorized credentials to access your workspace.'}
              </p>
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} />}

            {is2FAStage ? (
              /* ───── Step 2: 2FA Code Verification Form ───── */
              <form onSubmit={handleVerify2FALogin} className="space-y-4">
                {/* Dispatched info card */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-emerald-900">Verification Code Dispatched</div>
                    <div className="text-[11px] text-emerald-800 truncate mt-0.5">
                      Target email: <span className="font-medium text-emerald-950">{email}</span>
                    </div>
                  </div>
                </div>

                {/* Sandbox / Dev Hint */}
                {devOtpHint && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">Dev Sandbox Code:</span>
                      <span className="font-mono font-bold tracking-wider text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                        {devOtpHint}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFaOtp(devOtpHint)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline ml-2"
                    >
                      Fill Code
                    </button>
                  </div>
                )}

                {/* OTP Input */}
                <Input
                  id="twoFaOtp"
                  label="6-Digit Email Verification Code"
                  type="text"
                  maxLength={6}
                  required
                  value={twoFaOtp}
                  onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="text-center font-mono tracking-[0.25em] text-lg font-bold"
                />

                {/* Submit 2FA Button */}
                <Button type="submit" loading={loading} fullWidth className="mt-1">
                  {loading ? 'Verifying...' : 'Verify Code & Sign In'}
                </Button>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FAStage(false);
                      setTwoFaOtp('');
                      setError('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 font-medium"
                  >
                    ← Back to Password
                  </button>
                  <button
                    type="button"
                    disabled={resendingOtp}
                    onClick={handleResend2FAOtp}
                    className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {resendingOtp ? 'Resending Code...' : "Didn't receive code? Resend"}
                  </button>
                </div>

                {/* Security info */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed flex items-start gap-2 mt-4">
                  <svg className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-semibold text-slate-700">Two-Factor Authentication Active: </span>
                    Your account is protected with email verification. Verification is required each time you sign in.
                  </div>
                </div>
              </form>
            ) : (
              /* ───── Step 1: Standard Password Sign In Form ───── */
              <>
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

                {/* Closed Enterprise Access Notice */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-semibold text-slate-700">Closed Enterprise Access: </span>
                    Self-registration is disabled. All user accounts are provisioned exclusively through authorized Admin Maker requests or Administrator governance.
                  </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}