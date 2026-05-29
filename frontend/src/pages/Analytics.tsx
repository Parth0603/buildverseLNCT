import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import RiskScore from '../components/RiskScore';

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-slate-500">Compiling database indexes...</span>
      </div>
    );
  }

  // Fallback high fidelity telemetry if backend is unconfigured or offline
  const activeStats = stats || {
    stats_cards: [],
    category_distribution: [
      { name: "Phishing", value: 45 },
      { name: "OTP Scam", value: 25 },
      { name: "Bank Impersonation", value: 15 },
      { name: "Crypto Scam", value: 10 },
      { name: "Job Scam", value: 5 }
    ],
    daily_scans: [
      { date: "Mon", scans: 12 },
      { date: "Tue", scans: 19 },
      { date: "Wed", scans: 15 },
      { date: "Thu", scans: 22 },
      { date: "Fri", scans: 30 },
      { date: "Sat", scans: 25 },
      { date: "Sun", scans: 18 }
    ],
    weekly_reports: [
      { week: "Wk 1", reports: 5 },
      { week: "Wk 2", reports: 8 },
      { week: "Wk 3", reports: 12 },
      { week: "Wk 4", reports: 19 }
    ],
    recent_reports: [
      { id: "1", scam_type: "url", target_value: "secure-login-chase-update.info", scam_category: "Phishing", risk_score: 99, date: "May 29" },
      { id: "2", scam_type: "phone", target_value: "+18005550199", scam_category: "Bank Impersonation", risk_score: 95, date: "May 29" },
      { id: "3", scam_type: "wallet", target_value: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B", scam_category: "Crypto Scam", risk_score: 98, date: "May 29" }
    ],
    top_domains: [
      { rank: 1, value: "secure-login-chase-update.info", reports: 42, risk_score: 99 },
      { rank: 2, value: "metamask-wallet-support.cn", reports: 31, risk_score: 98 },
      { rank: 3, value: "netflix-payment-renew.xyz", reports: 19, risk_score: 92 }
    ],
    top_wallets: [
      { rank: 1, value: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B", reports: 14, risk_score: 98 },
      { rank: 2, value: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfJH50s67", reports: 23, risk_score: 95 }
    ]
  };

  // Recharts color list for Category Distribution Pie Chart
  const PIE_COLORS = ['#5B3DF5', '#16A34A', '#F59E0B', '#DC2626', '#64748B'];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Threat Intelligence Analytics</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Aggregated indices and category distributions mapped from incoming threat signals.</p>
        </div>
      </div>

      {error && (
        <div className="bg-warning-light border border-warning/20 text-warning p-4 rounded-xl text-xs font-bold">
          ⚠️ Note: Backend communications warning: `{error}`. Showing compiled sandbox telemetry charts.
        </div>
      )}

      {/* Chart Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pie: Scam Categories */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 tracking-tight">Scam Category Split</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Classification Distribution</span>
          </div>
          <div className="flex-1 flex justify-center items-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activeStats.category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activeStats.category_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {activeStats.category_distribution.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span className="font-bold text-slate-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar: Daily Scans */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 tracking-tight">Daily Scans Telemetry</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Weekly Load Metrics</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activeStats.daily_scans} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
                  cursor={{ fill: 'rgba(91, 61, 245, 0.05)' }}
                />
                <Bar dataKey="scans" fill="#5B3DF5" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area: Weekly Incidents */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 tracking-tight">Weekly Complaints Trend</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Active Campaigns Growth</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activeStats.weekly_reports} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B3DF5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5B3DF5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
                />
                <Area type="monotone" dataKey="reports" stroke="#5B3DF5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ranks listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Malicious Domains Ranking */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 tracking-tight">Ranked Threat Domains</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Primary Domain Blacklist</p>
          </div>
          
          <div className="space-y-3">
            {activeStats.top_domains.map((dom, index) => (
              <div key={index} className="flex justify-between items-center p-3.5 bg-slate-50/60 border border-slate-50 rounded-xl hover:bg-slate-50 transition-all duration-150">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-xs font-bold text-slate-400">#{dom.rank}</span>
                  <span className="text-xs font-bold text-slate-700 truncate" title={dom.value}>{dom.value}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400">{dom.reports} flags</span>
                  <RiskScore score={dom.risk_score} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Malicious Crypto Wallets Ranking */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 tracking-tight">Ranked Threat Wallets</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Crypto Giveaway Targets</p>
          </div>
          
          <div className="space-y-3">
            {activeStats.top_wallets.map((wallet, index) => (
              <div key={index} className="flex justify-between items-center p-3.5 bg-slate-50/60 border border-slate-50 rounded-xl hover:bg-slate-50 transition-all duration-150">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-xs font-bold text-slate-400">#{wallet.rank}</span>
                  <span className="text-xs font-bold text-slate-700 font-mono truncate" title={wallet.value}>{wallet.value}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400">{wallet.reports} flags</span>
                  <RiskScore score={wallet.risk_score} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
