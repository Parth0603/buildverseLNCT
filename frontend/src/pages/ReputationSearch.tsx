import { useState } from 'react';
import { searchReputation } from '../api';
import type { ReputationSearchResponse } from '../types';
import { Search, ShieldAlert, ShieldCheck, AlertCircle, RefreshCw, FileText, Calendar } from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function ReputationSearch() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'phone' | 'domain' | 'wallet'>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReputationSearchResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await searchReputation(query, activeTab === 'all' ? undefined : activeTab);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to complete search query.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLookup = (sample: string) => {
    setQuery(sample);
  };

  const sampleQueries = [
    { label: 'Scam Chase Link', value: 'secure-login-chase-update.info' },
    { label: 'Scam Phone Line', value: '+18005550199' },
    { label: 'Scam Crypto Wallet', value: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B' },
    { label: 'Safe Domain Link', value: 'google.com' }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reputation Intelligence Search</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Audit Web3 wallet coordinates, telecomm phone lines, and websites against community-driven database reports.</p>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Active tab selectors for filtering */}
        <div className="flex border-b border-slate-100 pb-1 gap-2">
          {['all', 'phone', 'domain', 'wallet'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab as any);
                setResult(null);
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'all' ? 'All Logs' : tab === 'phone' ? 'Phone Line' : tab === 'domain' ? 'Domain Link' : 'Web3 Wallet'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste a phone number (+1...), domain (netflixx.xyz), or Ethereum/Bitcoin wallet address (0x...)"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-md shadow-primary/10 shrink-0 hover:translate-y-[-1px]"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Fetching Archives...
              </>
            ) : (
              'Query Reputation'
            )}
          </button>
        </form>

        {/* Preset list */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-widest">Diagnostic Presets:</span>
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickLookup(item.value)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <div>
            <span className="text-sm font-bold text-slate-800 block">Querying Threat Blacklists</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mt-1">Searching metadata logs, community logs, and reported flag frequencies</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-danger-light border border-danger/20 rounded-2xl p-6 shadow-sm flex gap-3 text-slate-700">
          <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-sm font-extrabold text-slate-800 block">Telemetry Blocked</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We could not dispatch request data: `{error}`. Verify the local server at `localhost:8000` is active.
            </p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 animate-scale-in">
          
          <div className="flex justify-between items-start gap-4">
            <div className="truncate">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Searched Parameter</span>
              <h2 className="text-lg font-extrabold text-slate-800 mt-1 truncate font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 max-w-full">
                {result.query}
              </h2>
            </div>
            <RiskScore score={result.risk_score} variant="badge" />
          </div>

          {result.insights && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 block mb-1">Database Insights</span>
              {result.insights}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-50 pt-5">
            
            <div className="bg-slate-50/60 border border-slate-50 p-4 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Resolved Type</span>
              <span className="text-xs font-extrabold text-slate-700 capitalize flex items-center gap-1.5">
                <FileText size={12} className="text-slate-400" /> {result.type}
              </span>
            </div>

            <div className="bg-slate-50/60 border border-slate-50 p-4 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Complaints Flags</span>
              <span className={`text-xs font-extrabold ${result.report_count > 0 ? 'text-danger' : 'text-success'}`}>
                {result.report_count} Verified Report{result.report_count !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="bg-slate-50/60 border border-slate-50 p-4 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Core Risk Score</span>
              <div className="flex items-center gap-2 mt-1">
                <RiskScore score={result.risk_score} size="sm" />
                <span className="text-xs font-extrabold text-slate-700">({result.risk_score}/100)</span>
              </div>
            </div>

            <div className="bg-slate-50/60 border border-slate-50 p-4 rounded-xl space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Last Activity Log</span>
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400" />
                {result.last_reported_at ? new Date(result.last_reported_at).toLocaleDateString() : 'No Incidents logged'}
              </span>
            </div>

          </div>

          <div className="border-t border-slate-50 pt-5 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Security Diagnostic Verdict:</h3>
            
            {result.risk_score > 70 ? (
              <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/10 rounded-xl text-xs text-danger font-bold leading-relaxed">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span>DO NOT ENGAGE. This target is flagged as malicious by community moderators due to verified fraud attempts.</span>
                  <span className="block mt-1 font-semibold text-slate-500">Ensure to immediately block communications with this entity.</span>
                </div>
              </div>
            ) : result.risk_score > 30 ? (
              <div className="flex items-start gap-3 p-4 bg-warning-light border border-warning/10 rounded-xl text-xs text-warning font-bold leading-relaxed">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span>Caution advised. Some suspicious reports have been filed against this entity. Proceed with double-verification procedures.</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-success-light border border-success/10 rounded-xl text-xs text-success font-bold leading-relaxed">
                <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span>Target currently clean. No matching malicious records exist in the reputation blocklist database archives.</span>
                </div>
              </div>
            )}
          </div>

          {/* Chronological Stepper Timeline */}
          {result.timeline && result.timeline.length > 0 && (
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Threat Incidents Timeline</h3>
              </div>
              
              <div className="relative pl-5 border-l border-slate-200 ml-2 space-y-4">
                {result.timeline.map((item, index) => (
                  <div key={index} className="relative">
                    {/* Stepper Dot */}
                    <span className={`absolute -left-[25.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                      item.risk_score > 70 ? 'border-danger' : item.risk_score > 30 ? 'border-warning' : 'border-success'
                    }`} />
                    
                    <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-50 hover:border-slate-100 p-3 rounded-xl transition-all duration-150">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">{item.date}</span>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5">{item.scam_category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Risk Index:</span>
                          <span className={`text-xs font-extrabold ${
                            item.risk_score > 70 ? 'text-danger' : item.risk_score > 30 ? 'text-warning' : 'text-success'
                          }`}>{item.risk_score}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Idle scanner notification when empty */}
      {!result && !loading && !error && (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="bg-slate-100 text-slate-400 p-4 rounded-full">
            <ShieldCheck size={36} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-600 block">Idle Reputation Console</span>
            <span className="text-xs text-slate-400 max-w-[240px] block mt-1 mx-auto leading-relaxed">Pasted threat values (addresses/numbers/links) are queried against reported lists instantly.</span>
          </div>
        </div>
      )}

    </div>
  );
}
