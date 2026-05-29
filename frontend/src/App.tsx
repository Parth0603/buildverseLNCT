import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Overview from './pages/Overview';
import MessageScanner from './pages/MessageScanner';
import URLScanner from './pages/URLScanner';
import AudioScanner from './pages/AudioScanner';
import ReputationSearch from './pages/ReputationSearch';
import ReportScam from './pages/ReportScam';
import Analytics from './pages/Analytics';

export default function App() {
  // Navigation states: 'landing' or dashboard subpages
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const handleEnterApp = (pageId?: string) => {
    setCurrentPage(pageId || 'overview');
  };

  // Render content based on current page selections
  const renderPageContent = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview setPage={setCurrentPage} />;
      case 'message':
        return <MessageScanner />;
      case 'url':
        return <URLScanner />;
      case 'audio':
        return <AudioScanner />;
      case 'reputation':
        return <ReputationSearch />;
      case 'report':
        return <ReportScam />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Overview setPage={setCurrentPage} />;
    }
  };

  // 1. Landing Page state
  if (currentPage === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // 2. Main Dashboard Layout state
  return (
    <div className="flex bg-slate-50 min-h-screen">
      
      {/* Reusable Sidebar navigation */}
      <Sidebar currentPage={currentPage} setPage={setCurrentPage} />
      
      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic header panel */}
        <Header />
        
        {/* Core page wrappers */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderPageContent()}
        </main>
      </div>

    </div>
  );
}
