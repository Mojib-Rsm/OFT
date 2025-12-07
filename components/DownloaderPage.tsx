
import React, { useState } from 'react';
import { Download, Link, Loader2, Video, Clipboard, ArrowLeft, AlertCircle } from 'lucide-react';
import { getFacebookVideo, FbVideoResponse } from '../services/fbDownloader';

interface DownloaderPageProps {
  onBack: () => void;
}

const DownloaderPage: React.FC<DownloaderPageProps> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<FbVideoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const data = await getFacebookVideo(url);
      if (data.error) {
        setError(data.error);
      } else {
        setVideoData(data);
      }
    } catch (err) {
      setError('একটি অজানা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-bangla">ফেসবুক ভিডিও ডাউনলোডার</h2>
          <p className="text-slate-500 font-bangla text-sm">ফেসবুক রিলস বা ভিডিও লিংক থেকে সহজেই ডাউনলোড করুন</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/10 border border-slate-200 overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleDownload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-bangla ml-1 flex items-center gap-1">
               <Link size={12}/> ভিডিও লিংক (URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
               <div className="relative flex-grow">
                 <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.facebook.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 shadow-sm transition-all font-sans"
                 />
               </div>
               <button 
                 type="button" 
                 onClick={handlePaste}
                 className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 sm:py-0 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 font-bangla font-semibold whitespace-nowrap"
               >
                  <Clipboard size={18} /> Paste
               </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url}
            className={`w-full py-4 rounded-xl text-white font-bold font-bangla shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 ${
              isLoading || !url
                ? 'bg-slate-400 cursor-not-allowed shadow-none translate-y-0'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>ডাউনলোড লিংক তৈরি করুন</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-red-700 font-bangla">ডাউনলোড ব্যর্থ হয়েছে</h4>
            <p className="text-sm text-red-600 font-bangla mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {videoData && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-slate-100 flex items-center gap-2">
              <Video className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-700 font-bangla">ডাউনলোড অপশন</h3>
           </div>
           
           <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                 {/* Placeholder for thumbnail if we had one, currently using icon */}
                 <div className="w-full sm:w-1/3 aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                    <Video size={48} className="text-slate-300" />
                 </div>
                 
                 <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">Facebook Video</h4>
                      <p className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">MP4 Format</p>
                    </div>

                    <div className="space-y-3">
                      {videoData.hd ? (
                        <a 
                          href={videoData.hd} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-md shadow-blue-200"
                        >
                           <Download size={18} /> HD কোয়ালিটি ডাউনলোড
                        </a>
                      ) : (
                        <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                           HD পাওয়া যায়নি
                        </button>
                      )}

                      {videoData.sd ? (
                        <a 
                          href={videoData.sd} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-semibold"
                        >
                           <Download size={18} /> SD কোয়ালিটি ডাউনলোড
                        </a>
                      ) : (
                        <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                           SD পাওয়া যায়নি
                        </button>
                      )}
                    </div>
                 </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 font-bangla text-center">
                 নোট: ডাউনলোডে ক্লিক করার পর ভিডিও প্লে হলে, ভিডিওর উপর রাইট ক্লিক করে "Save Video As" সিলেক্ট করুন।
              </div>
           </div>
        </div>
      )}

      {/* Instructions */}
      <div className="grid md:grid-cols-3 gap-4 text-center mt-12">
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
            <h4 className="font-bold text-slate-700 font-bangla">লিংক কপি করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">ফেসবুক অ্যাপ বা ব্রাউজার থেকে ভিডিওর লিংক কপি করুন</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
            <h4 className="font-bold text-slate-700 font-bangla">পেস্ট করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">উপরের বক্সে লিংকটি পেস্ট করে ডাউনলোড বাটনে ক্লিক করুন</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
            <h4 className="font-bold text-slate-700 font-bangla">সেভ করুন</h4>
            <p className="text-xs text-slate-500 mt-1 font-bangla">HD বা SD কোয়ালিটি সিলেক্ট করে ভিডিও সেভ করে নিন</p>
         </div>
      </div>
    </div>
  );
};

export default DownloaderPage;
