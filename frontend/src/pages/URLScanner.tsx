import { useState } from 'react';
import { analyzeUrl, API_BASE_URL } from '../api';
import type { URLScanResponse } from '../types';
import { Globe, ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function URLScanner() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLScanResponse | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeUrl(urlInput);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to scan URL. Confirm backend is operational.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setUrlInput(sample);
  };

  const sampleUrls = [
    'secure-login-chase-update.info',
    'metamask-wallet-support.cn',
    'netflix-payment-renew.xyz',
    'google.com'
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Domain & URL Scanner</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Verify domain registration ages, active SSL certificate keys, brand typosquatting anomalies, and global phishing lists.</p>
      </div>

      {/* Input Module */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-extrabold text-slate-800 tracking-tight">Enter Suspicious URL / Link</h2>
        
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe size={16} />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. login-secure-bank.xyz, metamask-support.cn, netflix.com..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-md shadow-primary/10 shrink-0 hover:translate-y-[-1px]"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Assessing Link...
              </>
            ) : (
              'Scan URL Registry'
            )}
          </button>
        </form>

        {/* Suggestion list */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-400 mr-1 uppercase tracking-widest">Test Samples:</span>
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(sample)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all duration-200"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <div>
            <span className="text-sm font-bold text-slate-800 block">Assessing Web Credentials</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mt-1">Inspecting TLD structures, WHOIS age caches, SSL hashes and Brand mimicking indexes</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-danger-light border border-danger/20 rounded-2xl p-6 shadow-sm flex gap-3 text-slate-700">
          <AlertCircle size={20} className="text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-sm font-extrabold text-slate-800 block">Scanner Offline Warning</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We could not dispatch threat assessment metrics. Detail: `{error}`. Verify the server at `{API_BASE_URL}` is online.
            </p>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-scale-in">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-start gap-4">
                <div className="truncate">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Inspected Target:</span>
                  <h2 className="text-lg font-extrabold text-slate-800 mt-1 truncate flex items-center gap-1.5" title={result.url}>
                    {result.url} <ExternalLink size={14} className="text-slate-400" />
                  </h2>
                </div>
                <RiskScore score={result.risk_score} variant="badge" />
              </div>

              {/* Progress gauge */}
              <div className="border-t border-slate-50 pt-5">
                <RiskScore score={result.risk_score} variant="bar" />
              </div>

              {/* Grid indices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-5">
                
                <div className="p-4 bg-slate-50/60 border border-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Connection SSL</span>
                  <span className={`text-xs font-bold ${result.ssl_active ? 'text-success' : 'text-danger'}`}>
                    {result.ssl_active ? '✓ HTTPS Active' : '✗ HTTP Insecure'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50/60 border border-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Est. Registry Age</span>
                  <span className="text-xs font-bold text-slate-700">
                    {result.domain_age_days ? `${result.domain_age_days} Days` : 'Unknown / Fresh'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50/60 border border-slate-50 rounded-xl space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Blacklist Verdict</span>
                  <span className={`text-xs font-bold ${result.phish_detected ? 'text-danger' : 'text-success'}`}>
                    {result.phish_detected ? '✗ Malicious Match' : '✓ Clean Archive'}
                  </span>
                </div>

              </div>
            </div>

            {/* Findings Lists */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-800 tracking-tight">Security Flags Map</h3>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">ScamRadar Scanner Detections</span>
              </div>
              
              <div className="space-y-3">
                {result.findings.map((find, idx) => (
                  <div key={idx} className="flex gap-3 p-3.5 bg-slate-50/40 border border-slate-50 rounded-xl text-xs text-slate-600 font-semibold leading-relaxed">
                    {result.risk_score > 70 ? (
                      <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle size={14} className="text-success shrink-0 mt-0.5" />
                    )}
                    <span>{find}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recommendations Right Sidebar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 h-fit">
            <div>
              <h3 className="font-extrabold text-slate-800 tracking-tight">Action Guide</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Domain Threat Protections</p>
            </div>
            
            <div className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-bold leading-relaxed">
                  <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Idle scanner notification when empty */}
      {!result && !loading && !error && (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="bg-slate-100 text-slate-400 p-4 rounded-full">
            <ShieldCheck size={36} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-600 block">Idle URL Scanner</span>
            <span className="text-xs text-slate-400 max-w-[240px] block mt-1 mx-auto leading-relaxed">Paste suspicious URLs or domains above to perform structural whitelist/blacklist inspections.</span>
          </div>
        </div>
      )}

    </div>
  );
}
