
import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'success';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'error' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow animation to finish before unmounting
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-l-4 border-red-500 shadow-2xl rounded-r-lg rounded-l-none p-4 flex items-start gap-3 ring-1 ring-black/5">
        <div className="shrink-0 mt-0.5">
          <AlertCircle className="text-red-500" size={20} />
        </div>
        
        <div className="flex-1 mr-2">
          <h4 className="text-sm font-bold text-slate-800 font-bangla mb-1">
            সমস্যা হয়েছে
          </h4>
          <p className="text-sm text-slate-600 font-bangla leading-relaxed">
            {message}
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
