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
    <aside className="w-64 bg-white text-slate-800 min-h-screen flex flex-col border-r border-slate-200 shadow-sm z-50">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="bg-primary p-2.5 rounded-xl text-white shadow-md shadow-primary/20">
          <ShieldAlert size={18} className="animate-pulse" />
        </div>
        <span className="font-extrabold font-sans text-lg tracking-tight text-slate-800">
          ScamRadar <span className="text-primary">X</span>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-light text-primary active-nav-glow' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
          Enterprise Security
        </span>
        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
          v1.0.0 (FastAPI + React)
        </span>
      </div>
    </aside>
  );
}
