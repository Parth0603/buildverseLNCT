import { 
  LayoutDashboard, 
  MessageSquareWarning, 
  Globe, 
  VolumeX, 
  SearchCode, 
  FileWarning, 
  LineChart, 
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export default function Sidebar({ currentPage, setPage }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'message', name: 'Message Scanner', icon: MessageSquareWarning },
    { id: 'url', name: 'URL Scanner', icon: Globe },
    { id: 'audio', name: 'Audio Scanner', icon: VolumeX },
    { id: 'reputation', name: 'Reputation Search', icon: SearchCode },
    { id: 'report', name: 'Report Scam', icon: FileWarning },
    { id: 'analytics', name: 'Threat Analytics', icon: LineChart },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          <ShieldAlert size={20} className="animate-pulse" />
        </div>
        <span className="font-bold font-sans text-xl tracking-tight text-white">
          ScamRadar <span className="text-primary font-extrabold">X</span>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
          Hackathon Free MVP
        </span>
        <span className="text-[9px] text-slate-600 block mt-1">
          v1.0.0 (FastAPI + React)
        </span>
      </div>
    </aside>
  );
}
