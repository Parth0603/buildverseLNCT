import { 
  ShieldAlert, 
  Search, 
  Fingerprint, 
  MessageSquareOff, 
  Radio, 
  Activity, 
  Users, 
  ArrowRight,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (page?: string) => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const features = [
    {
      title: 'AI Message Scanner',
      desc: 'Paste emails, WhatsApp logs, or SMS text to instantly isolate credentials-harvesting and urgent phishing hooks.',
      icon: MessageSquareOff
    },
    {
      title: 'Real-Time URL Scanner',
      desc: 'Verify TLD threat scores, SSL certification presence, brand typosquatting anomalies, and known safe browsing blacklists.',
      icon: Search
    },
    {
      title: 'AssemblyAI Audio Transcriber',
      desc: 'Upload M4A/MP3/WAV voice notes. Transcribe spoken scams through cloud pipeline, and inspect them using Gemini Flash.',
      icon: Radio
    },
    {
      title: 'Reputation Intel Search',
      desc: 'Instantly query domains, phone numbers, or Web3 wallet addresses across reported complaints in our threat archives.',
      icon: Fingerprint
    },
    {
      title: 'Community Reporting Hub',
      desc: 'Contribute malicious phone lines, scam wallets, or fake sites to protect users against future campaign surges.',
      icon: Users
    },
    {
      title: 'Threat Intelligence Dashboard',
      desc: 'Explore real-time telemetry, charts, and detailed lists covering the latest scams reported by the community.',
      icon: Activity
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white">
            <ShieldAlert size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            ScamRadar <span className="text-primary font-extrabold">X</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onEnterApp('overview')}
            className="text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-200"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onEnterApp('message')}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4.5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20 hover:scale-[1.02]"
          >
            Start Scanning
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 bg-gradient-to-b from-primary/5 via-white to-white relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-6">
            <Cpu size={12} className="animate-spin" /> Powered by Gemini 2.5 Flash
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            ScamRadar <span className="text-primary">X</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            Detect scams before they cost you money, data, or trust. Pasted message text, suspicious URLs, and uploaded voice notes are scanned instantly using heuristic fallbacks and advanced cloud AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => onEnterApp('message')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-base font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-primary/25 hover:translate-y-[-2px]"
            >
              Start Scanning <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onEnterApp('overview')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:translate-y-[-2px]"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section (Counters) */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-primary block">99.8%</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">AI Precision</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 block">5k+</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">Threats Blocked</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-primary block">Instant</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">Analysis Speed</span>
          </div>
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 block">0$</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">100% Free Core</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Complete Defensive Suite</h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Equipped with rule-based fallback heuristics and deep language parsers to insulate users against all threat vectors.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index}
                className="border border-slate-100 hover:border-primary/20 p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300 bg-white"
              >
                <div className="bg-primary-light text-primary w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900 text-white px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest block mb-3">Workflow Pipelines</span>
            <h2 className="text-3xl font-extrabold text-white">How ScamRadar Protects You</h2>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6 text-center relative">
            
            {/* Step 1 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/40">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Input Raw Source</h3>
              <p className="text-xs text-slate-400">Paste text transcripts, URLs, phone numbers, or upload audio dialogue files.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/40">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Transcribe Speech</h3>
              <p className="text-xs text-slate-400">AssemblyAI handles transcription cleanly before forwarding text core.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/40">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Dual Heuristics Engine</h3>
              <p className="text-xs text-slate-400">Runs concurrent analysis through regex libraries and Gemini 2.5 Flash.</p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/40">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-sm mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">Risk Scoring</h3>
              <p className="text-xs text-slate-400">Generates precise 0-100 indices, flagging urgency, categories, and red flags.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/40">
              <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center font-bold text-sm mx-auto mb-4">✓</div>
              <h3 className="font-bold mb-2 text-success">Ultimate Shield</h3>
              <p className="text-xs text-slate-400">Presents complete analysis reports and saves targets to community blacklist.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 md:px-12 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded text-white">
              <ShieldAlert size={14} />
            </div>
            <span className="font-bold text-base text-slate-900">ScamRadar X</span>
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">
            © 2026 ScamRadar X Inc. Built with FastAPI + React + Gemini Flash for Hackathon MVP review. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => onEnterApp('overview')}
              className="text-xs font-bold text-slate-500 hover:text-primary"
            >
              Telemetry Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
