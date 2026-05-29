import { useState } from 'react';
import { reportScam } from '../api';
import type { ReportCreate } from '../types';
import { FileWarning, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function ReportScam() {
  const [scamType, setScamType] = useState<'message' | 'url' | 'audio' | 'phone' | 'wallet' | 'domain'>('message');
  const [targetValue, setTargetValue] = useState('');
  const [scamCategory, setScamCategory] = useState('Phishing');
  const [description, setDescription] = useState('');
  const [riskScore, setRiskScore] = useState(75);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue.trim()) return;

    setLoading(true);
    setError('');

    const payload: ReportCreate = {
      scam_type: scamType,
      target_value: targetValue.trim(),
      scam_category: scamCategory,
      description: description.trim() || undefined,
      risk_score: riskScore
    };

    try {
      await reportScam(payload);
      setSubmitted(true);
      // Reset form fields
      setTargetValue('');
      setDescription('');
      setRiskScore(75);
    } catch (err: any) {
      setError(err.message || 'Failed to submit scam threat report.');
    } finally {
      setLoading(false);
    }
  };

  const scamCategories = [
    'Phishing',
    'OTP Scam',
    'Bank Impersonation',
    'Crypto Scam',
    'Job Scam',
    'Social Engineering'
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community Scam Reporting</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Submit fraudulent SMS/emails, malicious domains, clone phone lines, or crypto scammers to global threat archives.</p>
      </div>

      {submitted ? (
        <div className="max-w-xl bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center flex flex-col items-center justify-center space-y-5 animate-scale-in">
          <div className="bg-success-light text-success p-4 rounded-full">
            <CheckCircle size={36} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Threat Report Submitted!</h2>
            <p className="text-xs text-slate-400 max-w-[280px] block mt-1 mx-auto leading-relaxed">
              Your feedback is verified and active inside the threat database caches, modifying reputation search responses instantly.
            </p>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all duration-200"
          >
            Submit Another Entry
          </button>
        </div>
      ) : (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileWarning size={20} className="text-primary" /> Incident Logging Form
          </h2>

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-xl p-4 flex gap-3 text-slate-700">
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                We could not post threat report: `{error}`. Verify the local server is online.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Threat Category</label>
                <select
                  value={scamType}
                  onChange={(e: any) => setScamType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="message">SMS / Chat Message</option>
                  <option value="url">Website URL Link</option>
                  <option value="phone">Phone Line / Caller ID</option>
                  <option value="wallet">Crypto Wallet Address</option>
                  <option value="domain">Domain Name</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Threat Classification</label>
                <select
                  value={scamCategory}
                  onChange={(e) => setScamCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {scamCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Target Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Threat Payload Details</label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={
                  scamType === 'phone' ? 'e.g. +18005550199' :
                  scamType === 'wallet' ? 'e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d1476B' :
                  scamType === 'url' ? 'e.g. chase-verify-secure.xyz' :
                  'Paste SMS text, suspicious link, or scammer identifiers...'
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Incident Context (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the tactics used by the scammer e.g. 'Robocall claiming bank locks, demanded OTP code'..."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Severity Risk Slider */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Severity Risk Score Indicator</label>
                <div className="flex items-center gap-1.5">
                  <RiskScore score={riskScore} size="sm" />
                  <span className="text-xs font-extrabold text-slate-700">({riskScore}/100)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={riskScore}
                onChange={(e) => setRiskScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Safe (0-30)</span>
                <span>Medium (31-70)</span>
                <span>High Danger (71-100)</span>
              </div>
            </div>

            {/* Action */}
            <button
              type="submit"
              disabled={loading || !targetValue.trim()}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-sm py-3 rounded-lg transition-all duration-200 flex justify-center items-center gap-2 shadow-md shadow-primary/10 hover:translate-y-[-1px]"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Logging Threat...
                </>
              ) : (
                'Submit Verified Threat Report'
              )}
            </button>

          </form>
        </div>
      )}

    </div>
  );
}
