
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultCard from './components/ResultCard';
import HistoryPage from './components/HistoryPage';
import ToolGrid from './components/ToolGrid';
import DownloaderPage from './components/DownloaderPage';
import Toast from './components/Toast';
import { ContentType, HistoryItem, OcrMethod, AiProvider } from './types';
import { generateBanglaContent, generateImage } from './services/geminiService';
import { generateOpenAIContent, generateOpenAIImage } from './services/openaiService';
import { generateOcrLocal } from './services/ocrService';
import { Sparkles, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'history' | 'downloader'>('home');
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
    inputImages?: string[],
    passportConfig?: any,
    overlayText?: string,
    userInstruction?: string,
    language?: string,
    ocrMethod?: OcrMethod,
    provider: AiProvider = AiProvider.GEMINI
  ) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setOverlayText(overlayText);
    
    try {
      let generatedOptions: string[] = [];

      const imageTools = [
        ContentType.IMAGE, 
        ContentType.THUMBNAIL, 
        ContentType.LOGO, 
        ContentType.PASSPORT, 
        ContentType.BG_REMOVE, 
        ContentType.DOC_ENHANCER,     
        ContentType.VISITING_CARD,    
        ContentType.BANNER,           
        ContentType.INVITATION,
        ContentType.PHOTO_ENHANCER
      ];

      if (imageTools.includes(type)) {
        if (provider === AiProvider.CHATGPT) {
          // OpenAI Image Gen (DALL-E) - Note: editing features are limited compared to Gemini Image
          // We route simple image requests to DALL-E, complex ones like Passport remain Gemini for now
          // as DALL-E is better at generation than specific editing/retouching
          if (type === ContentType.IMAGE || type === ContentType.LOGO || type === ContentType.THUMBNAIL) {
             generatedOptions = await generateOpenAIImage(context, aspectRatio);
          } else {
             // Fallback to Gemini for complex editing tools even if ChatGPT is selected
             generatedOptions = await generateImage(type, category, context, aspectRatio, inputImages, passportConfig, overlayText);
          }
        } else {
          generatedOptions = await generateImage(type, category, context, aspectRatio, inputImages, passportConfig, overlayText);
        }
      } else if (type === ContentType.IMG_TO_TEXT && ocrMethod === OcrMethod.PACKAGE) {
        if (!inputImages || inputImages.length === 0) throw new Error("ছবি আপলোড করুন");
        generatedOptions = await generateOcrLocal(inputImages);
      } else {
        // Text Generation
        if (provider === AiProvider.CHATGPT) {
          generatedOptions = await generateOpenAIContent(type, category, context, tone, length, party, userInstruction, language);
        } else {
          generatedOptions = await generateBanglaContent(type, category, context, tone, length, party, userInstruction, inputImages, language);
        }
      }
      
      setResults(generatedOptions);

      const isImageResult = imageTools.includes(type) || (provider === AiProvider.CHATGPT && (type === ContentType.IMAGE || type === ContentType.LOGO || type === ContentType.THUMBNAIL));
      
      let historyResults = generatedOptions;
      if (isImageResult && !generatedOptions[0].startsWith('http')) {
          historyResults = ['[Image Generated] - (ইমেজ সেভ করা হয়নি, স্টোরেজ বাঁচানোর জন্য)'];
      }

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type,
        category,
        context: isImageResult ? `${context} (${aspectRatio || 'auto'})` : context,
        tone,
        length,
        party,
        aspectRatio,
        results: historyResults,
        inputImages: inputImages && inputImages.length > 0 ? inputImages : undefined, 
        passportConfig,
        overlayText,
        userInstruction,
        language,
        ocrMethod,
        provider
      };
      
      setHistory(prev => [newItem, ...prev]);

    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "Something went wrong.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('banglaSocialHistory');
  };

  const handleViewChange = (newView: 'home' | 'history' | 'downloader') => {
    setView(newView);
    if (newView === 'home') {
      setSelectedTool(null); 
      setResults([]);
    }
  };

  const handleToolSelect = (type: ContentType) => {
    if (type === ContentType.FB_DOWNLOADER) {
      setView('downloader');
      return;
    }
    
    setSelectedTool(type);
    setResults([]); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setSelectedTool(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-bangla selection:bg-indigo-500/20 selection:text-indigo-900">
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10 pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10 animate-pulse delay-700 pointer-events-none"></div>

      {error && (
        <Toast message={error} onClose={() => setError(null)} />
      )}

      <Header currentView={view} onViewChange={handleViewChange} />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-24 space-y-8 relative z-0">
        
        {view === 'downloader' ? (
           <DownloaderPage onBack={() => setView('home')} />
        ) : view === 'history' ? (
          <HistoryPage history={history} onClearHistory={clearHistory} />
        ) : (
          <>
            {!selectedTool && (
              <div className="text-center py-6 sm:py-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
                <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-2xl mb-6 ring-1 ring-indigo-100 shadow-sm">
                   <span className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-indigo-600 shadow-sm">NEW</span>
                   <span className="px-3 text-xs font-medium text-slate-600">ChatGPT ও Gemini অপশন যোগ করা হয়েছে</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-5 tracking-tight leading-tight">
                  সব কাজ হোক <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">এআই এর ছোঁয়ায়</span>
                </h2>
                <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  অফিশিয়াল আবেদন থেকে শুরু করে পাসপোর্ট ফটো, লোগো ডিজাইন এবং ওআরসি - সবকিছু এখন এক প্ল্যাটফর্মে !
                </p>
              </div>
            )}

            {selectedTool ? (
              <div className="max-w-4xl mx-auto space-y-8">
                 <InputSection 
                   initialTab={selectedTool} 
                   onGenerate={handleGenerate} 
                   isLoading={isLoading} 
                   onBack={handleBackToGrid}
                   key={selectedTool} 
                 />

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
                    </div>
                  )}
              </div>
            ) : (
              <ToolGrid onSelectTool={handleToolSelect} />
            )}
          </>
        )}
      </main>

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
