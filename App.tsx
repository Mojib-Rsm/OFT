
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import HistoryPage from './components/HistoryPage';
import ToolGrid from './components/ToolGrid';
import Toast from './components/Toast';
import { ContentType, HistoryItem } from './types';
import { generateBanglaContent, generateImage } from './services/geminiService';
import { Sparkles, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'history'>('home');
  const [selectedTool, setSelectedTool] = useState<ContentType | null>(null);
  
  const [results, setResults] = useState<string[]>([]);
  const [overlayText, setOverlayText] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('banglaSocialHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('banglaSocialHistory', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (
    type: ContentType, 
    category: string, 
    context: string, 
    tone?: string, 
    length?: string, 
    party?: string, 
    aspectRatio?: string,
    inputImages?: string[], // Changed to array
    passportConfig?: any,
    overlayText?: string,
    userInstruction?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setOverlayText(overlayText);
    
    try {
      let generatedOptions: string[] = [];

      // Check if it's an image tool
      if ([ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.LOGO, ContentType.PASSPORT, ContentType.BG_REMOVE].includes(type)) {
        generatedOptions = await generateImage(category, context, aspectRatio, inputImages, passportConfig, overlayText);
      } else {
        // Pass inputImages for multimodal text generation (e.g. Screenshot Comments)
        generatedOptions = await generateBanglaContent(type, category, context, tone, length, party, userInstruction, inputImages);
      }
      
      setResults(generatedOptions);

      // Prepare data for history
      const historyResults = [ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.LOGO, ContentType.PASSPORT, ContentType.BG_REMOVE].includes(type)
        ? ['[Image Generated] - (ইমেজ সেভ করা হয়নি, স্টোরেজ বাঁচানোর জন্য)'] 
        : generatedOptions;

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type,
        category,
        context: [ContentType.IMAGE, ContentType.THUMBNAIL, ContentType.LOGO, ContentType.PASSPORT, ContentType.BG_REMOVE].includes(type) ? `${context} (${aspectRatio || 'auto'})` : context,
        tone,
        length,
        party,
        aspectRatio,
        results: historyResults,
        inputImages: inputImages && inputImages.length > 0 ? inputImages : undefined, // Save raw images? Be careful with storage limits
        passportConfig,
        overlayText,
        userInstruction
      };
      
      // Note: We are saving base64 images to history. This might exceed LocalStorage limits quickly. 
      // Ideally, in a real app, upload these to a server and store URLs.
      // For this demo, we might want to strip images from history if they are too large, or just keep them.
      
      setHistory(prev => [newItem, ...prev]);

    } catch (err: any) {
      console.error(err);
      // Detailed error message extraction
      let errorMessage = "দুঃখিত, কন্টেন্ট তৈরি করা যায়নি। দয়া করে আবার চেষ্টা করুন।";
      if (err.message) {
         if (err.message.includes('429')) errorMessage = "সার্ভার ব্যস্ত আছে বা লিমিট শেষ হয়ে গেছে। একটু পরে আবার চেষ্টা করুন।";
         else if (err.message.includes('SAFETY')) errorMessage = "আপনার রিকোয়েস্টটি এআই পলিসির কারণে ব্লক করা হয়েছে। দয়া করে অন্যভাবে চেষ্টা করুন।";
         else errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('banglaSocialHistory');
  };

  const handleViewChange = (newView: 'home' | 'history') => {
    setView(newView);
    if (newView === 'home') {
      setSelectedTool(null); // Reset tool selection when going home
      setResults([]);
    }
  };

  const handleToolSelect = (type: ContentType) => {
    setSelectedTool(type);
    setResults([]); // Clear previous results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setSelectedTool(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-bangla selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10 pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10 animate-pulse delay-700 pointer-events-none"></div>

      {/* Toast Notification for Errors */}
      {error && (
        <Toast message={error} onClose={() => setError(null)} />
      )}

      <Header currentView={view} onViewChange={handleViewChange} />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-24 space-y-8 relative z-0">
        
        {view === 'history' ? (
          <HistoryPage history={history} onClearHistory={clearHistory} />
        ) : (
          <>
            {/* Show Hero only when no tool selected or when on landing */}
            {!selectedTool && (
              <div className="text-center py-6 sm:py-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
                <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-6 ring-1 ring-indigo-100 shadow-sm">
                   <span className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-indigo-600 shadow-sm">NEW</span>
                   <span className="px-3 text-xs font-medium text-slate-600">এআই গ্রাফিক্স স্টুডিও এখন লাইভ</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-5 tracking-tight leading-tight">
                  সোশ্যাল মিডিয়া কন্টেন্ট <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">এখন আরও সহজে</span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  আপনার চিন্তা, আমাদের শব্দ। OFT AI এর সাহায্যে নিমিষেই তৈরি করুন সৃজনশীল পোস্ট, ক্যাপশন এবং কমেন্ট সহ অন্যান্য !
                </p>
              </div>
            )}

            {/* Main Content Area */}
            {selectedTool ? (
              <div className="max-w-4xl mx-auto space-y-8">
                 <InputSection 
                   initialTab={selectedTool} 
                   onGenerate={handleGenerate} 
                   isLoading={isLoading} 
                   onBack={handleBackToGrid}
                   key={selectedTool} // Force re-mount when tool changes
                 />

                  {/* Results Section */}
                  {results.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between text-slate-800 border-b border-slate-200 pb-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                            <Sparkles size={20} fill="currentColor" />
                          </div>
                          <h3 className="text-xl font-bold">জেনারেট করা ফলাফল</h3>
                        </div>
                        <button 
                          onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <RefreshCcw size={14} />
                          <span>আবার করুন</span>
                        </button>
                      </div>
                      
                      <div className="grid gap-5">
                        {results.map((content, index) => (
                          <ResultCard key={index} content={content} index={index} overlayText={overlayText} />
                        ))}
                      </div>
                      
                      <div className="bg-indigo-50/50 rounded-xl p-4 text-center border border-indigo-100/50">
                        <p className="text-slate-500 text-sm font-medium">
                          ফলাফল পছন্দ হয়নি? উপরের অপশনগুলো পরিবর্তন করে আবার চেষ্টা করুন!
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <ToolGrid onSelectTool={handleToolSelect} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2 font-bangla font-semibold">
             মুজিব আরএসএম কর্তৃক চালিত ও তৈরিকৃত!
          </p>
          <p className="text-slate-400 text-xs mt-2">
            © {new Date().getFullYear()} OFT AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
