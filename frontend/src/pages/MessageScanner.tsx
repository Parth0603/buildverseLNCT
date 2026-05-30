import { useState } from 'react';
import { analyzeMessage, API_BASE_URL } from '../api';
import type { MessageScanResponse } from '../types';
import { ShieldCheck, Cpu, AlertTriangle, AlertCircle, RefreshCw, Send, CheckCircle } from 'lucide-react';
import RiskScore from '../components/RiskScore';

export default function MessageScanner() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MessageScanResponse | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeMessage(content);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to scan message. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPaste = (text: string) => {
    setContent(text);
  };

  const sampleScams = [
    {
      label: 'OTP Phishing',
      text: 'CHASE ALERT: We detected a suspicious login attempt on your account from IP 192.168.1.5. If this was not you, please verify your identity immediately by reply with the 6-digit OTP code sent to your mobile. Do not share this code.'
    },
    {
      label: 'Crypto Giveaway',
      text: 'Congratulations! You have been selected in our Ethereum smart contract giveaway. Double your money instantly. Send between 0.1 ETH to 2 ETH to our secure verified wallet: 0x71C7656EC7ab88b098defB751B7401B5f6d1476B and get 2x back instantly. Guaranteed yield.'
    },
    {
      label: 'Job Task Scam',
      text: 'Dear candidate, we have a flexible remote task-consultant opening where you can make $300-$900 daily. Just 10 minutes a day clicking review buttons. No previous work history required. Contact supervisor immediate on WhatsApp to onboard!'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Message Threat Analyzer</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Isolate phishing attempts, credential harvest traps, and OTP capture loops in SMS, Emails, and WhatsApp messages.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Paste Field */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-800 tracking-tight">Suspicious Content Input</h2>
            
            <form onSubmit={handleScan} className="space-y-4">
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the suspicious email, SMS, or chat transcript text here (minimum 5 characters)..."
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 resize-none font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Fallback indicator */}
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <Cpu size={12} className="text-primary animate-pulse" /> Dual Engine: Gemini Flash + Regex
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white text-sm font-bold px-6 py-3 rounded-lg transition-all duration-200 shadow-md shadow-primary/10 ${
                    loading ? 'cursor-not-allowed' : 'hover:translate-y-[-1px]'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Analyzing Content...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Run Threat Scan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Paste Templates */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-700 text-sm tracking-tight">Or Quick Paste Sample Phishing Templates:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sampleScams.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPaste(sample.text)}
                  className="text-left p-3 rounded-xl border border-slate-100 hover:border-primary/25 hover:bg-primary-light/10 text-xs font-semibold text-slate-600 hover:text-primary transition-all duration-200"
                >
                  <span className="font-extrabold block text-slate-800 mb-1">{sample.label}</span>
                  <span className="line-clamp-2 text-slate-400 font-normal leading-relaxed">{sample.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Scan Diagnostic Panel */}
        <div className="space-y-6">
          {loading && (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">Threat Matrix Active</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block mt-1">Gemini 2.5 Flash Parsing Urgency Hooks</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger-light border border-danger/20 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-danger font-extrabold text-sm">
                <AlertCircle size={18} /> API Request Blocked
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                An error occurred during threat transmission: `{error}`. Confirm backend connection is live (`{API_BASE_URL}`).
              </p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
              <div className="bg-slate-100 text-slate-400 p-4 rounded-full">
                <ShieldCheck size={36} />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-600 block">Idle Scanner</span>
                <span className="text-xs text-slate-400 max-w-[200px] block mt-1 mx-auto leading-relaxed">Paste messages into the left console block and trigger threat diagnostics.</span>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 animate-scale-in">
              
              {/* Score Circular gauge */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 tracking-tight">Scan Report</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-0.5">Threat Intel Core</span>
                </div>
                <RiskScore score={result.risk_score} size="md" />
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Category</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block truncate" title={result.scam_category}>
                    {result.scam_category}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">AI Confidence</span>
                  <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                    {result.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Red Flags list */}
              <div className="space-y-2.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Pointers / Red Flags:</span>
                <div className="space-y-1.5">
                  {result.red_flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-semibold leading-relaxed">
                      <AlertTriangle size={12} className="text-danger shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation report */}
              <div className="space-y-2 border-t border-slate-50 pt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Explanation Summary:</span>
                <div className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50/60 border border-slate-50 p-3.5 rounded-xl max-h-48 overflow-y-auto whitespace-pre-line">
                  {result.explanation}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2.5 border-t border-slate-50 pt-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Action Recommendations:</span>
                <div className="space-y-2">
                  {result.recommended_actions.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-bold leading-relaxed">
                      <CheckCircle size={12} className="text-success shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
