import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { Input, Button, ErrorBanner, Toast, MailIcon, LockIcon, Logo } from '../../components/ui/index.js';
import {
  ShieldIcon,
  ClipboardIcon,
  PlantIcon,
  TractorIcon,
  UsersIcon,
  CartIcon,
  ScaleIcon,
} from '../../components/ui/icons/index.js';
import { API_BASE_URL } from '../../services/api.js';

interface DemoRoleConfig {
  role: string;
  name: string;
  email: string;
  badgeColor: string;
  desc: string;
  icon: React.ReactNode;
}

const DEMO_ROLES: DemoRoleConfig[] = [
  {
    role: 'ADMIN',
    name: 'Admin',
    email: 'admin@agribridge.com',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    desc: 'Full platform authority, user request approvals & governance',
    icon: <ShieldIcon className="w-4 h-4 text-purple-700" />,
  },
  {
    role: 'ADMIN_MAKER',
    name: 'Admin Maker',
    email: 'adminmaker@agribridge.com',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    desc: 'Proposes user creation requests under Admin maker-checker queue',
    icon: <ClipboardIcon className="w-4 h-4 text-indigo-700" />,
  },
  {
    role: 'FARMER',
    name: 'Farmer',
    email: 'farmer@agribridge.com',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    desc: 'Farm plots, crop lifecycle, cost-basis calculations & produce sales',
    icon: <PlantIcon className="w-4 h-4 text-emerald-700" />,
  },
  {
    role: 'FARM_MANAGER',
    name: 'Farm Manager',
    email: 'farmmanager@agribridge.com',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    desc: 'Field task management, stages & consumable inventory logging',
    icon: <TractorIcon className="w-4 h-4 text-teal-700" />,
  },
  {
    role: 'WORKER',
    name: 'Worker',
    email: 'worker@agribridge.com',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    desc: 'Assigned field tasks, progress updates & completion tracking',
    icon: <UsersIcon className="w-4 h-4 text-blue-700" />,
  },
  {
    role: 'BUYER',
    name: 'Buyer',
    email: 'buyer@agribridge.com',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    desc: 'Browse produce marketplace, submit offers & track logistics',
    icon: <CartIcon className="w-4 h-4 text-amber-700" />,
  },
  {
    role: 'MANDI_AGENT',
    name: 'Mandi Agent',
    email: 'mandiagent@agribridge.com',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    desc: 'Mandi yard arrivals, slot management & auction sales recording',
    icon: <ScaleIcon className="w-4 h-4 text-orange-700" />,
  },
];

export default function DemoLogin() {
  const [email, setEmail] = useState('admin@agribridge.com');
  const [password, setPassword] = useState('AgriBridgeAI@2026');
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Status of DEMO mode setting from server
  const [demoAllowed, setDemoAllowed] = useState(true);
  const [checkingConfig, setCheckingConfig] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/config/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDemoAllowed(data.data.demoAllowed !== false);
        }
      })
      .catch(() => {
        setDemoAllowed(true);
      })
      .finally(() => {
        setCheckingConfig(false);
      });
  }, []);

  const handleSelectRole = (config: DemoRoleConfig) => {
    setSelectedRole(config.role);
    setEmail(config.email);
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
          email: targetEmail.trim(),
          password: targetPass,
          isDemo: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Demo authentication failed');
      }

      dispatch(setCredentials({ token: data.data.accessToken, user: data.data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
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

      <div className="min-h-screen relative flex overflow-hidden bg-slate-900 text-slate-100">
        {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

        {/* Ambient background decoration */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/logo/bg-login.png')" }}
          />
        </div>

        <div className="relative z-20 w-full max-w-5xl mx-auto min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full bg-white text-slate-900 border border-slate-200 rounded-md shadow-lg p-6 sm:p-8 my-auto max-h-[95vh] overflow-y-auto scrollbar-hide">
            
            {/* Top Brand & Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <Logo variant="option3" size="md" showText={true} />
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Demo Sandbox
                </span>
              </div>

              <Link
                to="/login"
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
              >
                <span>Original Login →</span>
              </Link>
            </div>

            {/* If Demo is Disabled */}
            {!checkingConfig && !demoAllowed ? (
              <div className="my-8 p-6 bg-amber-50 border border-amber-200 rounded-md text-center space-y-4">
                <div className="w-10 h-10 mx-auto rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <LockIcon />
                </div>
                <h3 className="text-base font-bold text-amber-900">Demo Login is Disabled</h3>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  The system administrator has turned off demo accounts in this environment (<code>DEMO=false</code>).
                  Demo role switching and seed accounts are currently inaccessible.
                </p>
                <div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="!bg-emerald-700 hover:!bg-emerald-800 !text-white px-6 py-2 font-semibold text-xs rounded-md"
                  >
                    Go to Original Login
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Notice Banner */}
                <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Select any role below to test their complete permissions, workflows, and UI views.
                      Standard password is pre-filled as <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">AgriBridgeAI@2026</strong>.
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
                          className={`p-3.5 rounded-md border transition-colors cursor-pointer flex flex-col justify-between text-left ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-600 shadow-xs ring-1 ring-emerald-500/30'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                                {r.icon}
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded border ${r.badgeColor}`}>
                                {r.name}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-slate-600 truncate">{r.email}</div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">{r.desc}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
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
                <form onSubmit={handleSubmit} className="mt-5 pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Selected Account Credentials:
                    </span>
                    <span className="text-xs text-slate-500">
                      Role: <strong className="text-emerald-700">{selectedRole}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
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
                      className="w-full sm:w-auto !bg-emerald-700 hover:!bg-emerald-800 !text-white px-6 py-2 font-bold text-xs rounded-md shadow-xs"
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
