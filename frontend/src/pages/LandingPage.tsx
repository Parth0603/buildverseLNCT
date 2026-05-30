import { 
  ShieldAlert, 
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (page?: string) => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-4.5 px-6 md:px-12 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white shadow-md shadow-primary/25">
            <ShieldAlert size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            ScamRadar <span className="text-primary font-extrabold">X</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onEnterApp('overview')}
            className="text-sm font-semibold text-slate-600 hover:text-primary transition-all duration-200 hover:scale-[1.01]"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onEnterApp('message')}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Scanning
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-none tracking-tight">
            ScamRadar <span className="text-primary">X</span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Detect phishing and audio scams before they cost you money, data, or trust. Scans suspicious URLs, voice notes, and messages instantly using dynamic heuristics and advanced AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button 
              onClick={() => onEnterApp('message')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-base font-bold px-8 py-4.5 rounded-2xl transition-all duration-200 shadow-2xl shadow-primary/30 hover:translate-y-[-2px] hover:shadow-primary/40 active:translate-y-[0px]"
            >
              Start Scanning <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onEnterApp('overview')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white text-base font-bold px-8 py-4.5 rounded-2xl transition-all duration-200 hover:translate-y-[-2px] active:translate-y-[0px] shadow-lg shadow-slate-950/20"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
