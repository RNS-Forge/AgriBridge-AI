import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  const quickActions = [
    {
      title: 'Onboard Members',
      description: 'Register FPO member farmers, record geographical farm coordinates, and verify KYC statuses.',
      link: '/farmers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      ),
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Global Trade Catalog',
      description: 'List pooled crop yields in the marketplace, review buyer bids, and run price negotiations.',
      link: '/marketplace',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 6m8.5-1.5v-1.5m0 0h-1.5m0 0l1-6m-7.5 0l1 6m0 0v1.5m0 0h-1.5" />
        </svg>
      ),
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'AI Agricultural Coaching',
      description: 'Consult the AI Export Coach, configure pricing recommendations, or diagnose crop diseases.',
      link: '/ai',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 9.75z" />
        </svg>
      ),
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FPO Workspace Active
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{user?.firstName || 'User'}</span>!
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              You are logged into AgriBridge-AI as an FPO administrator. Manage your agricultural operations,
              track supply chains, and leverage AI-powered insights.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs bg-slate-800/80 text-emerald-400 font-mono px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
              Tenant: {user?.tenantId?.slice(0, 8) || 'Global Space'}
            </span>
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/20"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} ${action.borderColor} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-emerald-400">{action.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-emerald-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {action.description}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform duration-300">
                  <span>Get started</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Farmers', value: '1,247', change: '+12%', icon: '👨‍🌾' },
          { label: 'Active Farms', value: '856', change: '+8%', icon: '🌾' },
          { label: 'Market Listings', value: '234', change: '+23%', icon: '📊' },
          { label: 'Export Orders', value: '45', change: '+15%', icon: '🚢' },
        ].map((stat, index) => (
          <div key={index} className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
