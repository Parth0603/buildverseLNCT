import { useState } from 'react';
import { reportScam } from '../api';
import type { ReportCreate } from '../types';
import { 
  FileWarning, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  MessageSquare,
  Globe,
  Phone,
  Wallet,
  Link,
  ChevronRight,
  ChevronLeft,
  Eye
} from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function ReportScam() {
  const [step, setStep] = useState(1);
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
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Report Logged Successfully!</h2>
            <p className="text-xs text-slate-400 max-w-[280px] block mt-1 mx-auto leading-relaxed">
              Your reported scam intel is now live in the global ScamRadar X cache, modifying reputation intelligence search indices instantly.
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all duration-200"
          >
            Submit Another Entry
          </button>
        </div>
      ) : (
        <div className="max-w-2xl bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <FileWarning size={20} className="text-primary" /> Incident Logging Wizard
          </h2>

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-xl p-4 flex gap-3 text-slate-700">
              <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                We could not post threat report: `{error}`. Verify the local server is online.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Step {step} of 3</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-bold text-slate-800">
                {step === 1 ? "Select Scam Vector" : step === 2 ? "Payload & Category" : "Risk Score & Review"}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-6 bg-primary' : 'w-2 bg-slate-100'
                  }`} 
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Vector Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Where did the scam occur?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'message', name: 'SMS / Chat Message', desc: 'Fraudulent texts, WhatsApp, or Discord DMs', icon: MessageSquare },
                    { id: 'url', name: 'Website URL Link', desc: 'Phishing websites, clones, or drop sites', icon: Globe },
                    { id: 'phone', name: 'Phone Line / Caller ID', desc: 'Voice bait, burner lines, or robocallers', icon: Phone },
                    { id: 'wallet', name: 'Crypto Wallet Address', desc: 'Scam smart contracts or seed-phrase thieves', icon: Wallet },
                    { id: 'domain', name: 'Domain Name', desc: 'Malicious apex domain registrations', icon: Link }
                  ].map((vector) => {
                    const Icon = vector.icon;
                    return (
                      <button
                        key={vector.id}
                        type="button"
                        onClick={() => {
                          setScamType(vector.id as any);
                          setStep(2);
                        }}
                        className={`p-4 text-left border rounded-2xl hover:border-primary/40 hover:bg-slate-50/50 transition-all duration-200 flex flex-col items-start ${
                          scamType === vector.id 
                            ? 'border-primary bg-primary-light/10 shadow-sm ring-1 ring-primary' 
                            : 'border-slate-100 bg-white'
                        }`}
                      >
                        <div className={`p-2 rounded-xl w-fit ${
                          scamType === vector.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 mt-3">{vector.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{vector.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Payload & Category */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Threat Vector Type</label>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 capitalize">
                    {scamType === 'message' ? 'SMS / Chat Message' : scamType === 'url' ? 'Website URL Link' : scamType === 'phone' ? 'Phone Line / Caller ID' : scamType === 'wallet' ? 'Crypto Wallet Address' : 'Domain Name'}
                  </div>
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
                  {!targetValue.trim() && (
                    <span className="text-[10px] text-danger font-semibold block mt-1">Please enter scam details before continuing.</span>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!targetValue.trim()}
                    onClick={() => setStep(3)}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    Next Step <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Slider & Review */}
            {step === 3 && (
              <div className="space-y-6">
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

                {/* Review Panel */}
                <div className="border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 border-b border-slate-100 pb-2">
                    <Eye size={14} className="text-primary" /> Review Submission Details
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Vector</span>
                      <span className="font-bold text-slate-700 capitalize">{scamType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Classification</span>
                      <span className="font-bold text-slate-700">{scamCategory}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Threat Payload</span>
                      <span className="font-mono font-bold text-slate-800 break-all">{targetValue}</span>
                    </div>
                    {description.trim() && (
                      <div className="col-span-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Context</span>
                        <span className="font-semibold text-slate-600 block line-clamp-2">{description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-lg transition-all duration-150 flex justify-center items-center gap-2 shadow-md shadow-primary/10 hover:translate-y-[-1px]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Logging Threat...
                      </>
                    ) : (
                      'Confirm & Submit Report'
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      )}

    </div>
  );
}
