import { useState } from 'react';
import { Wallet, LogOut, BellDot } from 'lucide-react';

export default function Header() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true); // Supabase Auth mock state

  const handleConnectWallet = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d1476B'); // Mock Polygon address
    } else {
      setWalletConnected(false);
      setWalletAddress('');
    }
  };

  const handleLogout = () => {
    setIsUserLoggedIn(false);
  };

  const handleLogin = () => {
    setIsUserLoggedIn(true);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
      {/* Search Header Space */}
      <div className="flex items-center gap-2.5">
        <span className="bg-primary-light text-primary font-bold text-xs uppercase tracking-widest px-2.5 py-1 rounded">
          Hackathon Dev Core
        </span>
        <span className="text-slate-400 text-xs hidden md:inline">|</span>
        <span className="text-slate-400 text-xs hidden md:inline">Polygon Amoy Sandbox Ready</span>
      </div>

      {/* Control Widgets */}
      <div className="flex items-center gap-5">
        {/* Polygon Amoy Web3 wallet button */}
        <button
          onClick={handleConnectWallet}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all duration-200 ${
            walletConnected
              ? 'bg-slate-900 border-slate-900 text-white font-mono'
              : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Wallet size={14} className={walletConnected ? 'text-primary' : 'text-slate-500'} />
          {walletConnected 
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
            : 'Connect Amoy Wallet'
          }
        </button>

        {/* System Threat Bell */}
        <div className="relative p-2 hover:bg-slate-50 rounded-full cursor-pointer text-slate-600">
          <BellDot size={18} className="text-slate-600 hover:text-primary" />
          <span className="absolute top-1.5 right-1.5 bg-danger w-2 h-2 rounded-full ring-2 ring-white"></span>
        </div>

        {/* User Account / Supabase Auth profile placeholder */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-5">
          {isUserLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                JD
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800">Jane Doe</span>
                <span className="text-[10px] text-slate-400">Contributor</span>
              </div>
              <button 
                onClick={handleLogout}
                title="Log Out of Supabase"
                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-danger"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-hover shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
