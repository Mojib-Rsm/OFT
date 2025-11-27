
import React from 'react';
import { HistoryItem } from '../types';
import ResultCard from './ResultCard';
import { Trash2, Clock, Calendar, Flag, ChevronRight, PenLine, Image as ImageIcon } from 'lucide-react';

interface HistoryPageProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
           <Clock size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold font-bangla text-slate-700">কোনো হিস্টোরি পাওয়া যায়নি</h3>
        <p className="font-bangla mt-2 text-slate-500">আপনার তৈরি করা কন্টেন্ট এখানে জমা থাকবে।</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('bn-BD', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between sticky top-[72px] bg-slate-50/90 backdrop-blur-sm py-4 z-10 border-b border-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-800 font-bangla flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Clock size={20} />
          </div>
          পূর্বের কন্টেন্ট
        </h2>
        <button
          onClick={() => {
            if (window.confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত হিস্টোরি মুছে ফেলতে চান?')) {
              onClearHistory();
            }
          }}
          className="group flex items-center space-x-1.5 px-4 py-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-semibold transition-all shadow-sm font-bangla"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform"/>
          <span>সব মুছুন</span>
        </button>
      </div>

      <div className="space-y-10">
        {history.map((item) => (
          <div key={item.id} className="relative pl-0 md:pl-8 group">
            {/* Timeline connectors for desktop */}
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-slate-200 group-last:bottom-auto group-last:h-8"></div>
            <div className="hidden md:flex absolute left-[-5px] top-6 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400 z-10"></div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold font-bangla shadow-sm shadow-indigo-200">
                    {item.type}
                  </span>
                  <ChevronRight size={14} className="text-slate-300"/>
                  <span className="text-slate-700 text-sm font-bold font-bangla">{item.category}</span>
                  {item.party && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-semibold font-bangla">
                      <Flag size={10} fill="currentColor" />
                      {item.party}
                    </span>
                  )}
                  {item.inputImages && item.inputImages.length > 0 && (
                     <span className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-500 text-xs font-semibold font-bangla">
                      <ImageIcon size={10} />
                      {item.inputImages.length} ছবি
                    </span>
                  )}
                </div>
                <div className="flex items-center text-slate-400 text-xs font-bangla gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100">
                  <Calendar size={12} />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
              </div>
              
              <div className="px-6 pt-5 pb-1 space-y-3">
                {item.context && (
                  <div className="flex gap-2 text-sm text-slate-600 font-bangla bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="font-bold text-slate-800 whitespace-nowrap">প্রসঙ্গ:</span> 
                    <p className="line-clamp-2">{item.context}</p>
                  </div>
                )}
                
                {item.userInstruction && (
                   <div className="flex gap-2 text-sm text-indigo-700 font-bangla bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                    <span className="font-bold whitespace-nowrap flex items-center gap-1">
                      <PenLine size={12}/>
                      আপনার নোট:
                    </span> 
                    <p className="line-clamp-2">{item.userInstruction}</p>
                  </div>
                )}
              </div>

              <div className="p-6 grid gap-5">
                {item.results.map((content, idx) => (
                  <ResultCard key={`${item.id}-${idx}`} content={content} index={idx} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
