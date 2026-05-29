import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../types';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Globe, 
  PlusCircle, 
  Search,
  ChevronRight
} from 'lucide-react';
import RiskScore from '../components/RiskScore';

interface OverviewProps {
  setPage: (page: string) => void;
}

export default function Overview({ setPage }: OverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch telemetry metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-slate-500">Loading threat telemetry...</span>
      </div>
    );
  }

  // Provide high fidelity static defaults if backend offline/local database empty
  const activeStats = stats || {
    stats_cards: [
      { title: "Total Scans Completed", value: "128", change: "+24% this week", type: "positive" },
      { title: "High Risk Threats Flagged", value: "32", change: "+8% from yesterday", type: "negative" },
      { title: "Verified Community Reports", value: "19", change: "+15% this week", type: "positive" },
      { title: "Blocked Malicious Domains", value: "14", change: "+3 new today", type: "negative" }
    ],
    recent_reports: [
      { id: "1", scam_type: "url", target_value: "secure-login-chase-update.info", scam_category: "Phishing", risk_score: 99, date: "May 29, 21:00" },
      { id: "2", scam_type: "phone", target_value: "+18005550199", scam_category: "Bank Impersonation", risk_score: 95, date: "May 29, 20:30" },
      { id: "3", scam_type: "wallet", target_value: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B", scam_category: "Crypto Scam", risk_score: 98, date: "May 29, 19:15" },
      { id: "4", scam_type: "message", target_value: "Netflix account suspend click netflix-renew.xyz", scam_category: "Phishing", risk_score: 92, date: "May 29, 18:00" }
    ],
    top_domains: [
      { rank: 1, value: "secure-login-chase-update.info", reports: 42, risk_score: 99 },
      { rank: 2, value: "metamask-wallet-support.cn", reports: 31, risk_score: 98 },
      { rank: 3, value: "netflix-payment-renew.xyz", reports: 19, risk_score: 92 }
    ],
    top_wallets: [
      { rank: 1, value: "0x71C7...476B", reports: 14, risk_score: 98 },
      { rank: 2, value: "bc1qx...JH50", reports: 23, risk_score: 95 }
    ]
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Threat Telemetry Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time scam diagnostics and community blocklists status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage('report')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md shadow-primary/20 transition-all duration-200"
          >
            <PlusCircle size={14} /> Report New Scam
          </button>
          <button
            onClick={() => setPage('reputation')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-200"
          >
            <Search size={14} /> Search Reputation
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-warning-light border border-warning text-warning p-4 rounded-xl text-xs font-bold">
          ⚠️ Note: Backend communications warning: `{error}`. Showing sandbox database mockup telemetry.
        </div>
      )}

      {/* Stats Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeStats.stats_cards.map((card, index) => {
          let iconColor = 'text-primary bg-primary-light';
          let icon = Activity;

          if (index === 1) {
            iconColor = 'text-danger bg-danger-light';
            icon = ShieldAlert;
          } else if (index === 2) {
            iconColor = 'text-success bg-success-light';
            icon = AlertTriangle;
          } else if (index === 3) {
            iconColor = 'text-warning bg-warning-light';
            icon = Globe;
          }
          const Icon = icon;

          return (
            <div key={index} className="bg-white border border-slate-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold ${card.type === 'positive' || card.type === 'neutral' ? 'text-success' : 'text-danger'}`}>
                    {card.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column - Recent Reports */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg tracking-tight">Recent Threat Feed</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Community Blacklist Updates</p>
            </div>
            <button 
              onClick={() => setPage('analytics')}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              View Analytics <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Target</th>
                  <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeStats.recent_reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-all duration-150">
                    <td className="py-3.5 font-semibold text-slate-700 max-w-[200px] truncate">{report.target_value}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {report.scam_type}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-500 text-xs">{report.scam_category}</td>
                    <td className="py-3.5 text-right">
                      <RiskScore score={report.risk_score} variant="badge" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar - Top Malicious Targets */}
        <div className="space-y-8">
          
          {/* Top reported domains */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-800 tracking-tight">Most Flagged Domains</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top Domain Blacklist</p>
            </div>
            <div className="space-y-3">
              {activeStats.top_domains.map((dom, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/60 border border-slate-50">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xs font-bold text-slate-400">#{dom.rank}</span>
                    <span className="text-xs font-bold text-slate-700 truncate" title={dom.value}>{dom.value}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400">{dom.reports} flags</span>
                    <RiskScore score={dom.risk_score} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top reported wallets */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-800 tracking-tight">Most Flagged Wallets</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Crypto Scams Hotspots</p>
            </div>
            <div className="space-y-3">
              {activeStats.top_wallets.map((wallet, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/60 border border-slate-50">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xs font-bold text-slate-400">#{wallet.rank}</span>
                    <span className="text-xs font-bold text-slate-700 font-mono" title={wallet.value}>{wallet.value}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400">{wallet.reports} flags</span>
                    <RiskScore score={wallet.risk_score} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
