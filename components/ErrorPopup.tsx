import React, { useEffect } from 'react';
import { X, AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  // Prevent scrolling when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-0 overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
        
        {/* Header */}
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center border-b border-red-100">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 animate-bounce">
              <AlertTriangle size={32} className="text-red-600" />
           </div>
           <h3 className="text-xl font-bold text-red-600 font-bangla">ওহ! সমস্যা হয়েছে</h3>
        </div>

        {/* Close Button Top Right */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-slate-600 text-sm font-bangla leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex flex-col gap-3">
             <button
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 font-bangla active:scale-95"
            >
              <RefreshCcw size={16} />
              আবার চেষ্টা করুন
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors font-bangla"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;