import React from 'react';
import { PenTool, History, Home } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'history';
  onViewChange: (view: 'home' | 'history') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => onViewChange('home')}
          >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-300">
              <PenTool size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 font-bangla group-hover:text-indigo-600 transition-colors">
                OFT <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span>
              </h1>
              <p className="text-slate-500 text-[10px] md:text-xs font-medium font-bangla hidden sm:block tracking-wide">
                স্মার্ট কন্টেন্ট জেনারেটর
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => onViewChange('home')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 font-bangla ${
                currentView === 'home'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <Home size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">হোম</span>
            </button>
            <button
              onClick={() => onViewChange('history')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 font-bangla ${
                currentView === 'history'
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <History size={16} strokeWidth={2.5} />
              <span>হিস্টোরি</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;