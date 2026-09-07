import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { Input, Button, ErrorBanner, Toast, MailIcon, LockIcon } from '../../components/ui/index.js';
import { API_BASE_URL } from '../../services/api.js';

interface RoleDemoOption {
  role: string;
  name: string;
  email: string;
  badgeColor: string;
  desc: string;
  icon: string;
}

const DEMO_ROLES: RoleDemoOption[] = [
  {
    role: 'ADMIN',
    name: 'Admin',
    email: 'admin@agribridge.com',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Full platform authority, user request approvals & governance',
    icon: '🛡️',
  },
  {
    role: 'ADMIN_MAKER',
    name: 'Admin Maker',
    email: 'adminmaker@agribridge.com',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    desc: 'Proposes user creation requests under Admin maker-checker queue',
    icon: '📝',
  },
  {
    role: 'FARMER',
    name: 'Farmer',
    email: 'farmer@agribridge.com',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Farm plots, crop lifecycle, cost-basis calculations & produce sales',
    icon: '🌾',
  },
  {
    role: 'FARM_MANAGER',
    name: 'Farm Manager',
    email: 'manager@agribridge.com',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    desc: 'Field task management, stages & consumable inventory logging',
    icon: '🚜',
  },
  {
    role: 'WORKER',
    name: 'Worker',
    email: 'worker@agribridge.com',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Assigned field tasks, progress updates & completion tracking',
    icon: '🧑‍🌾',
  },
  {
    role: 'BUYER',
    name: 'Buyer',
    email: 'buyer@agribridge.com',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Browse produce marketplace, submit offers & track logistics',
    icon: '🛒',
  },
  {
    role: 'MANDI_AGENT',
    name: 'Mandi Agent',
    email: 'mandi@agribridge.com',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    desc: 'Mandi yard arrivals, slot management & auction sales recording',
    icon: '⚖️',
  },
];

export default function DemoLogin() {
  const [email, setEmail] = useState('admin@agribridge.com');
  const [password, setPassword] = useState('AgriBridgeAI@2026');
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Check demo mode setting from environment and server
  const envDemoEnabled = import.meta.env.VITE_DEMO !== 'false';
  const [demoAllowed, setDemoAllowed] = useState<boolean>(envDemoEnabled);
  const [checkingConfig, setCheckingConfig] = useState<boolean>(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function checkServerDemoConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/config`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.data?.demoEnabled !== undefined) {
            setDemoAllowed(Boolean(data.data.demoEnabled) && envDemoEnabled);
          }
        }
      } catch {
        // fallback to env value
      } finally {
        if (isMounted) setCheckingConfig(false);
      }
    }
    checkServerDemoConfig();
    return () => {
      isMounted = false;
    };
  }, [envDemoEnabled]);

  const handleSelectRole = (r: RoleDemoOption) => {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword('AgriBridgeAI@2026');
    setError('');
  };

  const handleExecuteLogin = async (targetEmail: string, targetPass: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password: targetPass,
          isDemo: true,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteLogin(email, password);
  };

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen relative flex overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-slate-100">
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

        {/* Ambient background decoration */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/logo/bg-login.png')" }}
          />
        </div>

        <div className="relative z-20 w-full max-w-5xl mx-auto min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full bg-white/95 text-slate-900 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-10 my-auto max-h-[95vh] overflow-y-auto scrollbar-hide">
            
            {/* Top Brand & Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    AgriBridge<span className="text-emerald-600">AI</span>
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Demo Sandbox
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  1-Click Role-Based Authentication & Workflows Sandbox
                </p>
              </div>

              <Link
                to="/login"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
              >
                <span>Original Login →</span>
              </Link>
            </div>

            {/* If Demo is Disabled */}
            {!checkingConfig && !demoAllowed ? (
              <div className="my-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-4">
                <div className="text-4xl">🔒</div>
                <h3 className="text-lg font-bold text-amber-900">Demo Login is Disabled</h3>
                <p className="text-sm text-amber-800 max-w-md mx-auto">
                  The system administrator has turned off demo accounts in this environment (<code>DEMO=false</code>).
                  Demo role switching and seed accounts are currently inaccessible.
                </p>
                <div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="!bg-emerald-700 hover:!bg-emerald-800 !text-white px-6 py-2.5 font-semibold text-sm rounded-xl"
                  >
                    Go to Original Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Notice Banner */}
                <div className="my-5 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      Select any role below to test their complete permissions, workflows, and UI views.
                      Standard password is pre-filled as <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">AgriBridgeAI@2026</strong>.
                    </span>
                  </div>
                </div>

                {error && <ErrorBanner message={error} />}

                {/* 7 Roles Grid */}
                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Select a Role for Instant 1-Click Access:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {DEMO_ROLES.map((r) => {
                      const isSelected = selectedRole === r.role;
                      return (
                        <div
                          key={r.role}
                          onClick={() => handleSelectRole(r)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/40'
                              : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-lg">{r.icon}</span>
                              <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-md border ${r.badgeColor}`}>
                                {r.name}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-600 truncate">{r.email}</div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">{r.desc}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium">Click to select</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRole(r);
                                handleExecuteLogin(r.email, 'AgriBridgeAI@2026');
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-300 hover:bg-emerald-50 transition-colors"
                            >
                              Instant Sign In →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Inputs for Current Selected Role */}
                <form onSubmit={handleSubmit} className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Selected Account Credentials:
                    </span>
                    <span className="text-xs text-slate-500">
                      Role: <strong className="text-emerald-700">{selectedRole}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="demo-email"
                      label="Demo Account Email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<MailIcon />}
                    />
                    <Input
                      id="demo-password"
                      label="Demo Password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<LockIcon />}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <Link
                      to="/login"
                      className="text-xs text-slate-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      ← Back to standard user login
                    </Link>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="w-full sm:w-auto !bg-emerald-700 hover:!bg-emerald-800 !text-white px-8 py-2.5 font-bold text-sm rounded-xl shadow-md transition-transform active:scale-98"
                    >
                      {loading ? 'Authenticating Demo...' : `Sign in as ${selectedRole}`}
                    </Button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
